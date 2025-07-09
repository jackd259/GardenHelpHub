import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PostWithUser } from "@shared/schema";
import Header from "@/components/header";
import BottomNav from "@/components/bottom-nav";
import PostCard from "@/components/post-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bookmark, Archive, Clock, Heart } from "lucide-react";

const categories = [
  { id: "all", label: "All Saved", value: "" },
  { id: "posts", label: "Posts", value: "posts" },
  { id: "tips", label: "Tips", value: "tips" },
  { id: "solutions", label: "Solutions", value: "solutions" },
];

export default function Saved() {
  const [selectedCategory, setSelectedCategory] = useState("");

  const { data: posts, isLoading } = useQuery<PostWithUser[]>({
    queryKey: ["/api/posts"],
    queryFn: async () => {
      const response = await fetch("/api/posts");
      const allPosts = await response.json();
      
      // Mock saved posts - in reality, this would be filtered by user's saved items
      return allPosts.slice(0, 3); // Show first 3 posts as "saved"
    },
  });

  const filteredPosts = posts?.filter(post => {
    if (!selectedCategory) return true;
    
    switch (selectedCategory) {
      case "posts":
        return true; // All posts are posts
      case "tips":
        return post.category === "plant-care" || post.category === "success";
      case "solutions":
        return post.category === "drought" || post.category === "pests";
      default:
        return true;
    }
  });

  return (
    <div className="min-h-screen bg-garden-light">
      <Header />
      
      <main className="max-w-2xl mx-auto px-4 pb-20">
        <div className="mt-6">
          {/* Saved Header */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <Bookmark className="text-garden-green w-6 h-6" />
              <h1 className="text-2xl font-bold text-gray-900">Saved Posts</h1>
            </div>
            <p className="text-gray-600 mb-4">
              Keep track of helpful posts, solutions, and tips for your garden. 
              Access your saved content anytime for quick reference.
            </p>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Archive className="w-4 h-4" />
                <span>{posts?.length || 0} saved items</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>Last updated today</span>
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.value)}
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

          {/* Saved Posts */}
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
            ) : filteredPosts && filteredPosts.length > 0 ? (
              <>
                {filteredPosts.map((post) => (
                  <div key={post.id} className="relative">
                    <PostCard post={post} />
                    <div className="absolute top-4 right-4 bg-garden-green text-white p-2 rounded-full">
                      <Bookmark className="w-4 h-4" />
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="text-center py-12">
                <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <div className="text-gray-500 text-lg mb-2">No saved posts yet</div>
                <div className="text-gray-400 text-sm mb-4">
                  Save posts that you find helpful to access them later
                </div>
                <Button className="bg-garden-green hover:bg-garden-dark text-white">
                  Browse Posts
                </Button>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="mt-8 grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Heart className="w-6 h-6 text-garden-green mx-auto mb-2" />
                <div className="text-lg font-semibold text-gray-900">Favorites</div>
                <div className="text-sm text-gray-600">Most liked posts</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Archive className="w-6 h-6 text-garden-green mx-auto mb-2" />
                <div className="text-lg font-semibold text-gray-900">Collections</div>
                <div className="text-sm text-gray-600">Organize your saves</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}