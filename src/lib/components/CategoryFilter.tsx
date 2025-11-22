interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  const categories = [
    { id: "all", label: "All", icon: "📂" },
    { id: "gui", label: "GUI", icon: "🖥️" },
    { id: "exploit", label: "Exploit", icon: "⚡" },
    { id: "admin", label: "Admin", icon: "👑" },
    { id: "hub", label: "Hub", icon: "🌐" },
    { id: "utility", label: "Utility", icon: "🔧" },
    { id: "other", label: "Other", icon: "📦" },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedCategory === category.id
              ? "bg-blue-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          {category.icon} {category.label}
        </button>
      ))}
    </div>
  );
}
