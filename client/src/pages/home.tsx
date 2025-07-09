import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PostWithUser } from "@shared/schema";
import Header from "@/components/header";
import LocationWidget from "@/components/location-widget";
import PostModal from "@/components/post-modal";
import PostCard from "@/components/post-card";
import BottomNav from "@/components/bottom-nav";
import { Button } from "@/components/ui/button";
import { Plus, Search, Camera, HelpCircle } from "lucide-react";

const categories = [
  { id: "all", label: "All Posts", value: "" },
  { id: "drought", label: "Drought Help", value: "drought" },
  { id: "pests", label: "Pest Control", value: "pests" },
  { id: "plant-care", label: "Plant Care", value: "plant-care" },
  { id: "local", label: "Local Help", value: "local" },
];

export default function Home() {
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");

  const { data: posts, isLoading } = useQuery<PostWithUser[]>({
    queryKey: ["/api/posts", selectedCategory],
    queryFn: async () => {
      const url = selectedCategory ? `/api/posts?category=${selectedCategory}` : "/api/posts";
      const response = await fetch(url);
      return response.json();
    },
  });

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  return (
    <div className="min-h-screen bg-garden-light">
      <Header />
      
      <main className="max-w-2xl mx-auto px-4 pb-20">
        <LocationWidget />
        
        {/* Quick Post Creation */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-garden-green rounded-full flex items-center justify-center">
              <div className="w-6 h-6 bg-white rounded-full"></div>
            </div>
            <div className="flex-1">
              <button
                onClick={() => setIsPostModalOpen(true)}
                className="w-full text-left px-4 py-3 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors"
              >
                What's happening in your garden?
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex space-x-4">
              <button className="flex items-center space-x-2 px-3 py-2 text-garden-green hover:bg-garden-green hover:bg-opacity-10 rounded-lg transition-colors">
                <Camera className="w-4 h-4" />
                <span className="text-sm font-medium">Photo</span>
              </button>
              <button className="flex items-center space-x-2 px-3 py-2 text-garden-green hover:bg-garden-green hover:bg-opacity-10 rounded-lg transition-colors">
                <HelpCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Ask</span>
              </button>
            </div>
            <div className="flex space-x-2">
              <span className="px-3 py-1 bg-garden-red bg-opacity-10 text-garden-red text-xs font-medium rounded-full">
                Drought
              </span>
              <span className="px-3 py-1 bg-garden-amber bg-opacity-10 text-garden-amber text-xs font-medium rounded-full">
                Pests
              </span>
            </div>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category.value
                  ? "bg-garden-green text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Post Feed */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm p-4">
                  <div className="animate-pulse">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : posts && posts.length > 0 ? (
            posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-2">No posts yet</div>
              <div className="text-gray-400 text-sm">
                Be the first to share your garden experiences!
              </div>
            </div>
          )}
        </div>

        {/* Load More Button */}
        {posts && posts.length > 0 && (
          <div className="text-center mt-8">
            <Button className="px-6 py-3 bg-garden-green text-white rounded-full font-medium hover:bg-garden-dark transition-colors">
              Load More Posts
            </Button>
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsPostModalOpen(true)}
        className="fixed bottom-20 right-4 w-14 h-14 bg-garden-green text-white rounded-full shadow-lg hover:bg-garden-dark transition-colors z-30"
      >
        <Plus className="w-6 h-6 mx-auto" />
      </button>

      <BottomNav />
      
      <PostModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
      />
    </div>
  );
}
