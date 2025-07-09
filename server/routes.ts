import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { insertUserSchema, insertPostSchema, insertCommentSchema, insertLikeSchema } from "@shared/schema";
import { z } from "zod";

// Configure multer for file uploads
const storage_config = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage_config,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded images
  app.use('/uploads', express.static('uploads'));
  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Post routes
  app.get("/api/posts", async (req, res) => {
    try {
      const category = req.query.category as string;
      const posts = category ? 
        await storage.getPostsByCategory(category) : 
        await storage.getPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/posts/:id", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const post = await storage.getPost(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/posts", upload.single('image'), async (req, res) => {
    try {
      const postData = insertPostSchema.parse({
        ...req.body,
        userId: parseInt(req.body.userId), // Convert string to number
        imageUrl: req.file ? `/uploads/${req.file.filename}` : null
      });
      const post = await storage.createPost(postData);
      res.json(post);
    } catch (error) {
      if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: "File too large (max 5MB)" });
        }
      }
      res.status(400).json({ message: "Invalid post data" });
    }
  });

  // Comment routes
  app.get("/api/posts/:id/comments", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const comments = await storage.getCommentsByPost(postId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/posts/:id/comments", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const commentData = insertCommentSchema.parse({
        ...req.body,
        postId,
        userId: parseInt(req.body.userId) // Convert string to number
      });
      
      const comment = await storage.createComment(commentData);
      
      // Update comment count
      const commentCount = await storage.getCommentsByPost(postId);
      await storage.updatePostCommentCount(postId, commentCount.length);
      
      res.json(comment);
    } catch (error) {
      console.error("Comment creation error:", error);
      res.status(400).json({ message: "Invalid comment data" });
    }
  });

  // Like routes
  app.post("/api/posts/:id/like", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const { userId } = req.body;
      
      const existingLike = await storage.getLike(postId, userId);
      if (existingLike) {
        await storage.deleteLike(postId, userId);
        const likeCount = await storage.getLikeCount(postId);
        res.json({ liked: false, likeCount });
      } else {
        await storage.createLike({ postId, userId });
        const likeCount = await storage.getLikeCount(postId);
        res.json({ liked: true, likeCount });
      }
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/posts/:id/like/:userId", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const userId = parseInt(req.params.userId);
      const like = await storage.getLike(postId, userId);
      res.json({ liked: !!like });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
