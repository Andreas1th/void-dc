import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

interface ScriptFormProps {
  onClose: () => void;
}

export function ScriptForm({ onClose }: ScriptFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    gameName: "",
    description: "",
    content: "",
    category: "gui",
    tags: "",
    isPublic: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createScript = useMutation(api.scripts.createScript);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.gameName || !formData.content) return;

    try {
      setIsSubmitting(true);
      await createScript({
        name: formData.name,
        gameName: formData.gameName,
        description: formData.description || undefined,
        content: formData.content,
        category: formData.category,
        tags: formData.tags.split(",").map(tag => tag.trim()).filter(Boolean),
        isPublic: formData.isPublic,
      });
      onClose();
    } catch (error) {
      console.error('Create script failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Create New Script</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white text-2xl"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Script Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            placeholder="Enter script name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Game Name *
          </label>
          <input
            type="text"
            value={formData.gameName}
            onChange={(e) => setFormData({ ...formData, gameName: e.target.value })}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            placeholder="Enter game name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            placeholder="Brief description of the script"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Category *
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            required
          >
            <option value="gui">GUI</option>
            <option value="exploit">Exploit</option>
            <option value="admin">Admin</option>
            <option value="hub">Hub</option>
            <option value="utility">Utility</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            placeholder="e.g., aimbot, esp, speed"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Script Content *
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-green-400 font-mono focus:outline-none focus:border-blue-500"
            placeholder="Paste your Lua script here..."
            rows={10}
            required
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isPublic"
            checked={formData.isPublic}
            onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
            className="mr-2"
          />
          <label htmlFor="isPublic" className="text-sm text-gray-300">
            Make this script public
          </label>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting || !formData.name || !formData.gameName || !formData.content}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
          >
            {isSubmitting ? "Creating..." : "Create Script"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
