import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface Script {
  _id: Id<"scripts">;
  name: string;
  gameName: string;
  description?: string;
  content: string;
  category: string;
  tags: string[];
  downloads: number;
  rating: number;
  isVerified: boolean;
  author: { name: string | undefined; id: Id<"users"> } | null;
}

interface ScriptModalProps {
  script: Script;
  isOwner?: boolean;
  onClose: () => void;
}

export function ScriptModal({ script, isOwner = false, onClose }: ScriptModalProps) {
  const [rating, setRating] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const downloadScript = useMutation(api.scripts.downloadScript);
  const rateScript = useMutation(api.scripts.rateScript);
  const deleteScript = useMutation(api.scripts.deleteScript);

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

  const handleRate = async () => {
    if (rating > 0) {
      try {
        await rateScript({ scriptId: script._id, rating });
        alert('Rating submitted!');
      } catch (error) {
        console.error('Rating failed:', error);
      }
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this script?')) {
      try {
        await deleteScript({ id: script._id });
        onClose();
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(script.content);
    alert('Script copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">{script.name}</h2>
              <p className="text-gray-400">🎮 {script.gameName}</p>
              {script.description && (
                <p className="text-gray-300 mt-2">{script.description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>

          {/* Stats and Info */}
          <div className="flex items-center gap-6 mt-4 text-sm text-gray-400">
            <span>📥 {script.downloads} downloads</span>
            <span>⭐ {script.rating.toFixed(1)} rating</span>
            {script.author && <span>👤 {script.author.name || "Unknown"}</span>}
            <span className="px-2 py-1 bg-blue-600 text-white rounded text-xs">
              {script.category.toUpperCase()}
            </span>
          </div>

          {/* Tags */}
          {script.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {script.tags.map((tag) => (
                <span key={tag} className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Script Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          <div className="bg-gray-900 rounded-lg p-4 relative">
            <button
              onClick={copyToClipboard}
              className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
            >
              📋 Copy
            </button>
            <pre className="text-green-400 text-sm overflow-x-auto whitespace-pre-wrap">
              <code>{script.content}</code>
            </pre>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-700">
          <div className="flex justify-between items-center">
            <div className="flex gap-3">
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-6 py-2 rounded transition-colors"
              >
                {isDownloading ? "⏳ Downloading..." : "📥 Download"}
              </button>
              
              {!isOwner && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Rate:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`text-xl ${rating >= star ? "text-yellow-400" : "text-gray-600"}`}
                    >
                      ⭐
                    </button>
                  ))}
                  <button
                    onClick={handleRate}
                    disabled={rating === 0}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-3 py-1 rounded text-sm ml-2"
                  >
                    Submit
                  </button>
                </div>
              )}
            </div>

            {isOwner && (
              <button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
              >
                🗑️ Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
