import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { ScriptCard } from "./components/ScriptCard";
import { ScriptForm } from "./components/ScriptForm";
import { SearchBar } from "./components/SearchBar";
import { CategoryFilter } from "./components/CategoryFilter";

export default function App() {
  const user = useQuery(api.auth.loggedInUser);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState("browse");

  const scripts = useQuery(api.scripts.getScripts, {
    category: selectedCategory,
    search: searchQuery || undefined,
    limit: 20,
  });

  const userScripts = useQuery(api.scripts.getUserScripts);
  const favorites = useQuery(api.scripts.getFavorites);
  const topScripts = useQuery(api.scripts.getTopScripts, { limit: 10 });

  if (user === undefined) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (user === null) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">🎮 Roblox Scripts</h1>
            <p className="text-gray-400">Discover and share Roblox game scripts</p>
          </div>
          <SignInForm />
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "browse":
        return (
          <div>
            <div className="mb-6 space-y-4">
              <SearchBar onSearch={setSearchQuery} />
              <CategoryFilter
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {scripts?.map((script) => (
                <ScriptCard key={script._id} script={script} />
              ))}
            </div>
            {scripts?.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No scripts found</p>
              </div>
            )}
          </div>
        );

      case "top":
        return (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">🏆 Top Scripts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topScripts?.map((script, index) => (
                <ScriptCard 
                  key={script._id} 
                  script={script} 
                  rank={index + 1}
                />
              ))}
            </div>
          </div>
        );

      case "my-scripts":
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">📝 My Scripts</h2>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                + Create Script
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userScripts?.map((script) => (
                <ScriptCard 
                  key={script._id} 
                  script={{
                    ...script,
                    author: { name: user?.name, id: script.authorId }
                  }} 
                  isOwner 
                />
              ))}
            </div>
            {userScripts?.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">You haven't created any scripts yet</p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Create Your First Script
                </button>
              </div>
            )}
          </div>
        );

      case "favorites":
        return (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">❤️ Favorites</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites?.filter(script => script !== null).map((script) => (
                <ScriptCard key={script!._id} script={script!} />
              ))}
            </div>
            {favorites?.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No favorite scripts yet</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-white">🎮 Roblox Scripts</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">Welcome, {user.name}!</span>
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: "browse", label: "🔍 Browse", icon: "🔍" },
              { id: "top", label: "🏆 Top Scripts", icon: "🏆" },
              { id: "my-scripts", label: "📝 My Scripts", icon: "📝" },
              { id: "favorites", label: "❤️ Favorites", icon: "❤️" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-gray-400 hover:text-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>

      {/* Create Script Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <ScriptForm onClose={() => setShowCreateForm(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
