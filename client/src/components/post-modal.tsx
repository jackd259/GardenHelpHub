import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, MapPin, User, X, ImageIcon } from "lucide-react";
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
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const postMutation = useMutation({
    mutationFn: async (postData: { content: string; category: string; image?: File }) => {
      const formData = new FormData();
      formData.append('userId', '7'); // TODO: Get from auth context
      formData.append('content', postData.content);
      formData.append('category', postData.category);
      
      if (postData.image) {
        formData.append('image', postData.image);
      }
      
      const response = await fetch('/api/posts', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to create post');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setContent("");
      setCategory("");
      setSelectedImage(null);
      setImagePreview(null);
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
      postMutation.mutate({ 
        content: content.trim(), 
        category,
        image: selectedImage || undefined
      });
    }
  };

  const handleClose = () => {
    setContent("");
    setCategory("");
    setSelectedImage(null);
    setImagePreview(null);
    onClose();
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }

      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
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
            
            {/* Image preview */}
            {imagePreview && (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Selected image"
                  className="w-full h-48 object-cover rounded-lg border"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
            
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            
            <div className="flex items-center space-x-4">
              <Button
                type="button"
                variant="ghost"
                onClick={handlePhotoClick}
                className="flex items-center space-x-2 text-garden-green hover:bg-garden-green hover:bg-opacity-10"
              >
                <Camera className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {selectedImage ? "Change Photo" : "Add Photo"}
                </span>
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
