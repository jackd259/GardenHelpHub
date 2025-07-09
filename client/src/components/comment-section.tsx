import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { CommentWithUser } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

interface CommentSectionProps {
  postId: number;
  isVisible: boolean;
}

export default function CommentSection({ postId, isVisible }: CommentSectionProps) {
  const [commentText, setCommentText] = useState("");

  const { data: comments } = useQuery<CommentWithUser[]>({
    queryKey: ["/api/posts", postId, "comments"],
    enabled: isVisible,
  });

  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", `/api/posts/${postId}/comments`, {
        userId: 1, // TODO: Get from auth context
        content,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts", postId, "comments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setCommentText("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      commentMutation.mutate(commentText.trim());
    }
  };

  if (!isVisible) return null;

  return (
    <div className="border-t border-gray-100 px-4 py-3">
      <div className="space-y-3">
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
      
      <form onSubmit={handleSubmit} className="flex items-center space-x-3 mt-4">
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
          disabled={commentMutation.isPending}
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
