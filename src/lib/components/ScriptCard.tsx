import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { ScriptModal } from "./ScriptModal";

interface Script {
  _id: Id<"scripts">;
  name: string;
  gameName: string;
  description?: string;
  content?: string;
  category: string;
  tags: string[];
  downloads: number;
  rating: number;
  isVerified: boolean;
  author: { name: string | undefined; id: Id<"users"> } | null;
}

interface ScriptCardProps {
  script: Script;
  isOwner?: boolean;
  rank?: number;
}

export function ScriptCard({ script, isOwner = false, rank }: ScriptCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const downloadScript = useMutation(api.scripts.downloadScript);
  const toggleFavorite = useMutation(api.scripts.toggleFavorite);
  
  // Fetch full script details when modal is opened
  const fullScript = useQuery(api.scripts.getScript, 
    showModal ? { id: script._id } : "skip"
  );

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const content = await downloadScript({ id: script._id });
      
      // Create and download file
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${script.name.replace(/[^a-z0-9]/gi, '_')}.lua`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleToggleFavorite = async () => {
    try {
      await toggleFavorite({ scriptId: script._id });
    } catch (error) {
      console.error('Toggle favorite failed:', error);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      gui: "bg-blue-600",
      exploit: "bg-red-600",
      admin: "bg-purple-600",
      hub: "bg-green-600",
      utility: "bg-yellow-600",
      other: "bg-gray-600",
    };
    return colors[category.toLowerCase()] || colors.other;
  };

  return (
    <>
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {rank && (
                <span className="text-2xl">
                  {rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`}
                </span>
              )}
              <h3 className="text-lg font-semibold text-white truncate">{script.name}</h3>
              {script.isVerified && <span className="text-blue-400">✓</span>}
            </div>
            <p className="text-sm text-gray-400 mb-2">🎮 {script.gameName}</p>
            {script.description && (
              <p className="text-sm text-gray-300 line-clamp-2">{script.description}</p>
            )}
          </div>
        </div>

        {/* Category and Tags */}
        <div className="mb-4">
          <span className={`inline-block px-2 py-1 rounded text-xs font-medium text-white ${getCategoryColor(script.category)}`}>
            {script.category.toUpperCase()}
          </span>
          {script.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {script.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                  {tag}
                </span>
              ))}
              {script.tags.length > 3 && (
                <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                  +{script.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between mb-4 text-sm text-gray-400">
          <div className="flex items-center gap-4">
            <span>📥 {script.downloads}</span>
            <span>⭐ {script.rating.toFixed(1)}</span>
          </div>
          {script.author && (
            <span>👤 {script.author.name || "Unknown"}</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowModal(true)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
          >
            👁️ View
          </button>
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-2 px-4 rounded transition-colors"
          >
            {isDownloading ? "⏳" : "📥"}
          </button>
          {!isOwner && (
            <button
              onClick={handleToggleFavorite}
              className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded transition-colors"
            >
              ❤️
            </button>
          )}
        </div>
      </div>

      {showModal && fullScript && (
        <ScriptModal
          script={fullScript}
          isOwner={isOwner}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
