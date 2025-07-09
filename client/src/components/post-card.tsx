import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { PostWithUser, CommentWithUser } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThumbsUp, MessageCircle, Share, Bookmark, MoreHorizontal, User, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";

interface PostCardProps {
  post: PostWithUser;
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case "drought":
      return "bg-garden-red bg-opacity-10 text-garden-red";
    case "pests":
      return "bg-garden-amber bg-opacity-10 text-garden-amber";
    case "success":
      return "bg-garden-green bg-opacity-10 text-garden-green";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

export default function PostCard({ post }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);

  const { data: comments } = useQuery<CommentWithUser[]>({
    queryKey: ["/api/posts", post.id, "comments"],
    enabled: showComments,
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/posts/${post.id}/like`, {
        userId: 1, // TODO: Get from auth context
      });
      return response.json();
    },
    onSuccess: (data) => {
      setIsLiked(data.liked);
      setLikeCount(data.likeCount);
    },
  });

  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", `/api/posts/${post.id}/comments`, {
        userId: 1, // TODO: Get from auth context
        content,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts", post.id, "comments"] });
      setCommentText("");
    },
  });

  const handleLike = () => {
    likeMutation.mutate();
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      commentMutation.mutate(commentText.trim());
    }
  };

  const timeAgo = formatDistanceToNow(new Date(post.createdAt!), { addSuffix: true });

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 bg-garden-green rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{post.user.username}</h3>
            <p className="text-sm text-gray-600">{post.user.location} • {timeAgo}</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(post.category)}`}>
              {post.category}
            </span>
            <Button variant="ghost" size="sm" className="p-1 hover:bg-gray-100 rounded-full">
              <MoreHorizontal className="w-4 h-4 text-gray-400" />
            </Button>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-gray-800 mb-3">{post.content}</p>
          
          {post.imageUrl && (
            <div className="rounded-lg overflow-hidden">
              <img 
                src={post.imageUrl} 
                alt="Post image" 
                className="w-full h-48 object-cover"
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 transition-colors ${
                isLiked ? "text-garden-green" : "hover:text-garden-green"
              }`}
            >
              <ThumbsUp className="w-4 h-4" />
              <span>{likeCount}</span>
            </button>
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2 hover:text-garden-green transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{post.commentCount}</span>
            </button>
            <button className="flex items-center space-x-2 hover:text-garden-green transition-colors">
              <Share className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>
          <button className="flex items-center space-x-2 hover:text-garden-green transition-colors">
            <Bookmark className="w-4 h-4" />
            <span>Save</span>
          </button>
        </div>

        {showComments && (
          <div className="border-t border-gray-100 pt-3">
            <div className="space-y-3 mb-4">
              {comments?.map((comment) => (
                <div key={comment.id} className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-garden-dark rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="font-semibold text-sm text-gray-900">{comment.user.username}</p>
                      <p className="text-sm text-gray-700">{comment.content}</p>
                    </div>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <button className="hover:text-garden-green">Like</button>
                      <button className="hover:text-garden-green">Reply</button>
                      <span>{formatDistanceToNow(new Date(comment.createdAt!), { addSuffix: true })}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <form onSubmit={handleComment} className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-garden-green rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="bg-gray-50 border-none rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-garden-green"
                />
              </div>
              <Button 
                type="submit" 
                size="sm" 
                className="text-garden-green hover:text-garden-dark p-2"
                variant="ghost"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
