import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, MapPin, User, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PostModal({ isOpen, onClose }: PostModalProps) {
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const { toast } = useToast();

  const postMutation = useMutation({
    mutationFn: async (postData: { content: string; category: string }) => {
      const response = await apiRequest("POST", "/api/posts", {
        userId: 1, // TODO: Get from auth context
        content: postData.content,
        category: postData.category,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setContent("");
      setCategory("");
      onClose();
      toast({
        title: "Post created",
        description: "Your post has been shared with the community.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim() && category) {
      postMutation.mutate({ content: content.trim(), category });
    }
  };

  const handleClose = () => {
    setContent("");
    setCategory("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Create Post</span>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-garden-green rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Your Name</p>
              <p className="text-sm text-gray-600">Sacramento, CA</p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              placeholder="What's happening in your garden?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-32 resize-none"
              maxLength={280}
            />
            
            <div className="flex items-center space-x-4">
              <Button
                type="button"
                variant="ghost"
                className="flex items-center space-x-2 text-garden-green hover:bg-garden-green hover:bg-opacity-10"
              >
                <Camera className="w-4 h-4" />
                <span className="text-sm font-medium">Add Photo</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="flex items-center space-x-2 text-garden-green hover:bg-garden-green hover:bg-opacity-10"
              >
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-medium">Location</span>
              </Button>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="drought">Drought Issues</SelectItem>
                  <SelectItem value="pests">Pest Control</SelectItem>
                  <SelectItem value="plant-care">Plant Care</SelectItem>
                  <SelectItem value="success">Success Story</SelectItem>
                  <SelectItem value="question">General Question</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {content.length}/280 characters
              </p>
              <Button
                type="submit"
                disabled={!content.trim() || !category || postMutation.isPending}
                className="bg-garden-green hover:bg-garden-dark text-white"
              >
                {postMutation.isPending ? "Posting..." : "Post"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
