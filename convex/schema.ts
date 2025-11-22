import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  scripts: defineTable({
    name: v.string(),
    gameName: v.string(),
    description: v.optional(v.string()),
    content: v.string(),
    authorId: v.id("users"),
    category: v.string(),
    tags: v.array(v.string()),
    downloads: v.number(),
    rating: v.number(),
    isVerified: v.boolean(),
    isPublic: v.boolean(),
  })
    .index("by_game", ["gameName"])
    .index("by_author", ["authorId"])
    .index("by_category", ["category"])
    .index("by_downloads", ["downloads"])
    .searchIndex("search_scripts", {
      searchField: "name",
      filterFields: ["gameName", "category", "isPublic"]
    }),

  ratings: defineTable({
    scriptId: v.id("scripts"),
    userId: v.id("users"),
    rating: v.number(),
  })
    .index("by_script", ["scriptId"])
    .index("by_user_script", ["userId", "scriptId"]),

  downloads: defineTable({
    scriptId: v.id("scripts"),
    userId: v.id("users"),
    downloadedAt: v.number(),
  })
    .index("by_script", ["scriptId"])
    .index("by_user", ["userId"]),

  favorites: defineTable({
    scriptId: v.id("scripts"),
    userId: v.id("users"),
  })
    .index("by_user", ["userId"])
    .index("by_script", ["scriptId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
