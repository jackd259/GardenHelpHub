import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { User as UserType, PostWithUser } from "@shared/schema";
import Header from "@/components/header";
import BottomNav from "@/components/bottom-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, MapPin, Users, Award, MessageCircle, ThumbsUp } from "lucide-react";

const categories = [
  { id: "all", label: "All Members", value: "" },
  { id: "experts", label: "Garden Experts", value: "experts" },
  { id: "local", label: "Local Gardeners", value: "local" },
  { id: "beginners", label: "New Gardeners", value: "beginners" },
];

export default function Community() {
  const [selectedCategory, setSelectedCategory] = useState("");

  const { data: users, isLoading } = useQuery<UserType[]>({
    queryKey: ["/api/users"],
    queryFn: async () => {
      // Mock user data since we don't have a full user list endpoint
      return [
        {
          id: 1,
          username: "sarah_martinez",
          email: "sarah@example.com",
          password: "password",
          location: "Davis, CA",
          zone: "9b",
          avatar: null,
          createdAt: new Date(),
        },
        {
          id: 2,
          username: "mike_chen",
          email: "mike@example.com",
          password: "password",
          location: "San Jose, CA",
          zone: "9b",
          avatar: null,
          createdAt: new Date(),
        },
        {
          id: 3,
          username: "lisa_rodriguez",
          email: "lisa@example.com",
          password: "password",
          location: "Fresno, CA",
          zone: "9a",
          avatar: null,
          createdAt: new Date(),
        },
        {
          id: 4,
          username: "david_thompson",
          email: "david@example.com",
          password: "password",
          location: "Fresno, CA",
          zone: "9a",
          avatar: null,
          createdAt: new Date(),
        },
        {
          id: 5,
          username: "jennifer_adams",
          email: "jennifer@example.com",
          password: "password",
          location: "San Jose, CA",
          zone: "9b",
          avatar: null,
          createdAt: new Date(),
        },
        {
          id: 6,
          username: "dr_maria_santos",
          email: "maria@example.com",
          password: "password",
          location: "UC Extension",
          zone: "Expert",
          avatar: null,
          createdAt: new Date(),
        },
      ];
    },
  });

  const { data: posts } = useQuery<PostWithUser[]>({
    queryKey: ["/api/posts"],
  });

  const getUserStats = (userId: number) => {
    const userPosts = posts?.filter(post => post.userId === userId) || [];
    const totalLikes = userPosts.reduce((sum, post) => sum + (post.likes || 0), 0);
    const totalComments = userPosts.reduce((sum, post) => sum + (post.commentCount || 0), 0);
    
    return {
      posts: userPosts.length,
      likes: totalLikes,
      comments: totalComments,
    };
  };

  const getExpertiseLevel = (stats: ReturnType<typeof getUserStats>) => {
    if (stats.posts >= 10 && stats.likes >= 50) return "Expert";
    if (stats.posts >= 5 && stats.likes >= 20) return "Active";
    if (stats.posts >= 2) return "Member";
    return "New";
  };

  const getExpertiseBadge = (level: string) => {
    switch (level) {
      case "Expert":
        return <Badge className="bg-garden-green text-white">Expert</Badge>;
      case "Active":
        return <Badge className="bg-garden-amber text-white">Active</Badge>;
      case "Member":
        return <Badge variant="secondary">Member</Badge>;
      default:
        return <Badge variant="outline">New</Badge>;
    }
  };

  const filteredUsers = users?.filter(user => {
    if (!selectedCategory) return true;
    
    const stats = getUserStats(user.id);
    const level = getExpertiseLevel(stats);
    
    switch (selectedCategory) {
      case "experts":
        return level === "Expert" || user.zone === "Expert";
      case "local":
        return user.location?.includes("CA");
      case "beginners":
        return level === "New";
      default:
        return true;
    }
  });

  return (
    <div className="min-h-screen bg-garden-light">
      <Header />
      
      <main className="max-w-2xl mx-auto px-4 pb-20">
        <div className="mt-6">
          {/* Community Header */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <Users className="text-garden-green w-6 h-6" />
              <h1 className="text-2xl font-bold text-gray-900">Garden Community</h1>
            </div>
            <p className="text-gray-600 mb-4">
              Connect with fellow gardeners in your area and beyond. Share knowledge, 
              get help with plant problems, and build friendships through gardening.
            </p>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{users?.length || 0} members</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>California Zone 9a-9b</span>
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

          {/* Community Members */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm p-4">
                    <div className="animate-pulse">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredUsers && filteredUsers.length > 0 ? (
              filteredUsers.map((user) => {
                const stats = getUserStats(user.id);
                const expertiseLevel = getExpertiseLevel(stats);
                
                return (
                  <Card key={user.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-garden-green rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{user.username}</h3>
                            {getExpertiseBadge(expertiseLevel)}
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                            <MapPin className="w-4 h-4" />
                            <span>{user.location}</span>
                            <span>•</span>
                            <span>Zone {user.zone}</span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <MessageCircle className="w-4 h-4" />
                              <span>{stats.posts} posts</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <ThumbsUp className="w-4 h-4" />
                              <span>{stats.likes} helpful</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2">
                          <Button size="sm" className="bg-garden-green hover:bg-garden-dark text-white">
                            Follow
                          </Button>
                          <Button size="sm" variant="outline">
                            Message
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg mb-2">No members found</div>
                <div className="text-gray-400 text-sm">
                  Try adjusting your filter or check back later
                </div>
              </div>
            )}
          </div>

          {/* Community Stats */}
          <div className="mt-8 grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Award className="w-6 h-6 text-garden-green mx-auto mb-2" />
                <div className="text-2xl font-bold text-garden-green">
                  {filteredUsers?.filter(u => getExpertiseLevel(getUserStats(u.id)) === "Expert").length || 0}
                </div>
                <div className="text-sm text-gray-600">Garden Experts</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="w-6 h-6 text-garden-green mx-auto mb-2" />
                <div className="text-2xl font-bold text-garden-green">
                  {filteredUsers?.filter(u => u.location?.includes("CA")).length || 0}
                </div>
                <div className="text-sm text-gray-600">Local Members</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}