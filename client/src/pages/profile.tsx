import Header from "@/components/header";
import BottomNav from "@/components/bottom-nav";
import { User, Settings, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Profile() {
  return (
    <div className="min-h-screen bg-garden-light">
      <Header />
      
      <main className="max-w-2xl mx-auto px-4 pb-20">
        <div className="mt-6">
          {/* Profile Header */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-garden-green rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900">Your Garden Profile</h2>
                  <p className="text-gray-600">Sacramento, CA • Zone 9b</p>
                </div>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-garden-green" />
                  <span className="text-gray-600">Sacramento, CA</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-garden-green" />
                  <span className="text-gray-600">Joined Jan 2024</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-garden-green">24</div>
                <div className="text-sm text-gray-600">Posts</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-garden-green">156</div>
                <div className="text-sm text-gray-600">Helpful</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-garden-green">89</div>
                <div className="text-sm text-gray-600">Following</div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="text-center py-8 text-gray-500">
                  <p>Your recent posts and activities will appear here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
