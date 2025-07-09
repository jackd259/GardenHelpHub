import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PostWithUser } from "@shared/schema";
import Header from "@/components/header";
import BottomNav from "@/components/bottom-nav";
import PostCard from "@/components/post-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search as SearchIcon } from "lucide-react";

export default function Search() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: posts, isLoading } = useQuery<PostWithUser[]>({
    queryKey: ["/api/posts", searchQuery],
    queryFn: async () => {
      const response = await fetch("/api/posts");
      const allPosts = await response.json();
      
      if (!searchQuery) return allPosts;
      
      return allPosts.filter((post: PostWithUser) =>
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchTerm);
  };

  return (
    <div className="min-h-screen bg-garden-light">
      <Header />
      
      <main className="max-w-2xl mx-auto px-4 pb-20">
        <div className="mt-6">
          {/* Search Header */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <form onSubmit={handleSearch} className="flex space-x-2">
                <div className="flex-1 relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search posts, users, or topics..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button type="submit" className="bg-garden-green hover:bg-garden-dark">
                  Search
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Popular Topics */}
          {!searchQuery && (
            <Card className="mb-6">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Popular Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {["drought", "pests", "plant-care", "success"].map((topic) => (
                    <button
                      key={topic}
                      onClick={() => {
                        setSearchTerm(topic);
                        setSearchQuery(topic);
                      }}
                      className="px-3 py-1 bg-garden-green bg-opacity-10 text-garden-green text-sm rounded-full hover:bg-opacity-20 transition-colors"
                    >
                      #{topic}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Search Results */}
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
              <>
                {searchQuery && (
                  <div className="text-sm text-gray-600 mb-4">
                    Found {posts.length} result{posts.length !== 1 ? 's' : ''} for "{searchQuery}"
                  </div>
                )}
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </>
            ) : searchQuery ? (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg mb-2">No results found</div>
                <div className="text-gray-400 text-sm">
                  Try different keywords or browse popular topics
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg mb-2">Search the community</div>
                <div className="text-gray-400 text-sm">
                  Find posts, users, and topics that interest you
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
