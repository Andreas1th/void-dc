import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getScripts = query({
  args: {
    category: v.optional(v.string()),
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let scripts;

    if (args.search) {
      scripts = await ctx.db
        .query("scripts")
        .withSearchIndex("search_scripts", (q) =>
          q.search("name", args.search!).eq("isPublic", true)
        )
        .take(args.limit || 20);
    } else {
      let query = ctx.db.query("scripts").filter((q) => q.eq(q.field("isPublic"), true));
      
      if (args.category && args.category !== "all") {
        query = query.filter((q) => q.eq(q.field("category"), args.category));
      }

      scripts = await query
        .order("desc")
        .take(args.limit || 20);
    }

    // Get author info for each script
    const scriptsWithAuthors = await Promise.all(
      scripts.map(async (script) => {
        const author = await ctx.db.get(script.authorId);
        return {
          ...script,
          author: author ? { name: author.name, id: author._id } : null,
        };
      })
    );

    return scriptsWithAuthors;
  },
});

export const getTopScripts = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const scripts = await ctx.db
      .query("scripts")
      .filter((q) => q.eq(q.field("isPublic"), true))
      .order("desc")
      .take(args.limit || 10);

    const scriptsWithAuthors = await Promise.all(
      scripts.map(async (script) => {
        const author = await ctx.db.get(script.authorId);
        return {
          ...script,
          author: author ? { name: author.name, id: author._id } : null,
        };
      })
    );

    return scriptsWithAuthors.sort((a, b) => b.downloads - a.downloads);
  },
});

export const getScript = query({
  args: { id: v.id("scripts") },
  handler: async (ctx, args) => {
    const script = await ctx.db.get(args.id);
    if (!script || !script.isPublic) return null;

    const author = await ctx.db.get(script.authorId);
    return {
      ...script,
      author: author ? { name: author.name, id: author._id } : null,
    };
  },
});

export const getUserScripts = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const scripts = await ctx.db
      .query("scripts")
      .withIndex("by_author", (q) => q.eq("authorId", userId))
      .collect();

    return scripts;
  },
});

export const createScript = mutation({
  args: {
    name: v.string(),
    gameName: v.string(),
    description: v.optional(v.string()),
    content: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
    isPublic: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const scriptId = await ctx.db.insert("scripts", {
      name: args.name,
      gameName: args.gameName,
      description: args.description,
      content: args.content,
      authorId: userId,
      category: args.category,
      tags: args.tags,
      downloads: 0,
      rating: 0,
      isVerified: false,
      isPublic: args.isPublic,
    });

    return scriptId;
  },
});

export const updateScript = mutation({
  args: {
    id: v.id("scripts"),
    name: v.optional(v.string()),
    gameName: v.optional(v.string()),
    description: v.optional(v.string()),
    content: v.optional(v.string()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const script = await ctx.db.get(args.id);
    if (!script || script.authorId !== userId) {
      throw new Error("Script not found or not authorized");
    }

    const updates: any = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.gameName !== undefined) updates.gameName = args.gameName;
    if (args.description !== undefined) updates.description = args.description;
    if (args.content !== undefined) updates.content = args.content;
    if (args.category !== undefined) updates.category = args.category;
    if (args.tags !== undefined) updates.tags = args.tags;
    if (args.isPublic !== undefined) updates.isPublic = args.isPublic;

    await ctx.db.patch(args.id, updates);
  },
});

export const deleteScript = mutation({
  args: { id: v.id("scripts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const script = await ctx.db.get(args.id);
    if (!script || script.authorId !== userId) {
      throw new Error("Script not found or not authorized");
    }

    await ctx.db.delete(args.id);
  },
});

export const downloadScript = mutation({
  args: { id: v.id("scripts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const script = await ctx.db.get(args.id);
    if (!script || !script.isPublic) {
      throw new Error("Script not found");
    }

    // Record the download
    await ctx.db.insert("downloads", {
      scriptId: args.id,
      userId,
      downloadedAt: Date.now(),
    });

    // Increment download count
    await ctx.db.patch(args.id, {
      downloads: script.downloads + 1,
    });

    return script.content;
  },
});

export const rateScript = mutation({
  args: {
    scriptId: v.id("scripts"),
    rating: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    if (args.rating < 1 || args.rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }

    // Check if user already rated this script
    const existingRating = await ctx.db
      .query("ratings")
      .withIndex("by_user_script", (q) => q.eq("userId", userId).eq("scriptId", args.scriptId))
      .first();

    if (existingRating) {
      await ctx.db.patch(existingRating._id, { rating: args.rating });
    } else {
      await ctx.db.insert("ratings", {
        scriptId: args.scriptId,
        userId,
        rating: args.rating,
      });
    }

    // Update script's average rating
    const allRatings = await ctx.db
      .query("ratings")
      .withIndex("by_script", (q) => q.eq("scriptId", args.scriptId))
      .collect();

    const averageRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;

    await ctx.db.patch(args.scriptId, { rating: averageRating });
  },
});

export const toggleFavorite = mutation({
  args: { scriptId: v.id("scripts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existingFavorite = await ctx.db
      .query("favorites")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("scriptId"), args.scriptId))
      .first();

    if (existingFavorite) {
      await ctx.db.delete(existingFavorite._id);
      return false;
    } else {
      await ctx.db.insert("favorites", {
        scriptId: args.scriptId,
        userId,
      });
      return true;
    }
  },
});

export const getFavorites = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const favorites = await ctx.db
      .query("favorites")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const scripts = await Promise.all(
      favorites.map(async (fav) => {
        const script = await ctx.db.get(fav.scriptId);
        if (!script) return null;
        
        const author = await ctx.db.get(script.authorId);
        return {
          ...script,
          author: author ? { name: author.name, id: author._id } : null,
        };
      })
    );

    return scripts.filter(Boolean);
  },
});

export const createExampleData = mutation({
  args: {},
  handler: async (ctx) => {
    const existingScripts = await ctx.db.query("scripts").take(1);
    if (existingScripts.length > 0) return "Data exists";

    const demoUserId = await ctx.db.insert("users", {
      name: "Demo User", 
      email: "demo@example.com",
    });

    await ctx.db.insert("scripts", {
      name: "Universal ESP",
      gameName: "Universal", 
      description: "See players through walls",
      content: "-- ESP Script\nlocal Players = game:GetService('Players')\nprint('ESP loaded')",
      category: "exploit",
      tags: ["esp", "wallhack"],
      downloads: 1250,
      rating: 4.5,
      isVerified: true,
      isPublic: true,
      authorId: demoUserId,
    });

    return "Example data created!";
  },
});
        
