import { users, posts, comments, likes, type User, type InsertUser, type Post, type InsertPost, type Comment, type InsertComment, type Like, type InsertLike, type PostWithUser, type CommentWithUser } from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Post operations
  getPosts(): Promise<PostWithUser[]>;
  getPostsByCategory(category: string): Promise<PostWithUser[]>;
  getPost(id: number): Promise<PostWithUser | undefined>;
  createPost(post: InsertPost): Promise<Post>;
  updatePostLikes(postId: number, likes: number): Promise<void>;
  updatePostCommentCount(postId: number, count: number): Promise<void>;
  
  // Comment operations
  getCommentsByPost(postId: number): Promise<CommentWithUser[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  
  // Like operations
  getLike(postId: number, userId: number): Promise<Like | undefined>;
  createLike(like: InsertLike): Promise<Like>;
  deleteLike(postId: number, userId: number): Promise<void>;
  getLikeCount(postId: number): Promise<number>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private posts: Map<number, Post>;
  private comments: Map<number, Comment>;
  private likes: Map<string, Like>;
  private currentUserId: number;
  private currentPostId: number;
  private currentCommentId: number;
  private currentLikeId: number;

  constructor() {
    this.users = new Map();
    this.posts = new Map();
    this.comments = new Map();
    this.likes = new Map();
    this.currentUserId = 1;
    this.currentPostId = 1;
    this.currentCommentId = 1;
    this.currentLikeId = 1;
    
    // Add some initial data
    this.seedData();
  }

  private seedData() {
    // Create some sample users
    const sampleUsers = [
      { username: "sarah_martinez", email: "sarah@example.com", password: "password", location: "Davis, CA", zone: "9b" },
      { username: "mike_chen", email: "mike@example.com", password: "password", location: "San Jose, CA", zone: "9b" },
      { username: "lisa_rodriguez", email: "lisa@example.com", password: "password", location: "Fresno, CA", zone: "9a" },
      { username: "david_thompson", email: "david@example.com", password: "password", location: "Fresno, CA", zone: "9a" },
      { username: "jennifer_adams", email: "jennifer@example.com", password: "password", location: "San Jose, CA", zone: "9b" },
      { username: "dr_maria_santos", email: "maria@example.com", password: "password", location: "UC Extension", zone: "Expert" },
    ];

    sampleUsers.forEach(user => {
      const newUser: User = {
        id: this.currentUserId++,
        ...user,
        avatar: null,
        createdAt: new Date(),
      };
      this.users.set(newUser.id, newUser);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: this.currentUserId++,
      ...insertUser,
      createdAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async getPosts(): Promise<PostWithUser[]> {
    const postsArray = Array.from(this.posts.values());
    const postsWithUsers = await Promise.all(
      postsArray.map(async (post) => {
        const user = await this.getUser(post.userId);
        return { ...post, user: user! };
      })
    );
    return postsWithUsers.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getPostsByCategory(category: string): Promise<PostWithUser[]> {
    const allPosts = await this.getPosts();
    return allPosts.filter(post => post.category === category);
  }

  async getPost(id: number): Promise<PostWithUser | undefined> {
    const post = this.posts.get(id);
    if (!post) return undefined;
    
    const user = await this.getUser(post.userId);
    return { ...post, user: user! };
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const post: Post = {
      id: this.currentPostId++,
      ...insertPost,
      likes: 0,
      commentCount: 0,
      createdAt: new Date(),
    };
    this.posts.set(post.id, post);
    return post;
  }

  async updatePostLikes(postId: number, likes: number): Promise<void> {
    const post = this.posts.get(postId);
    if (post) {
      post.likes = likes;
      this.posts.set(postId, post);
    }
  }

  async updatePostCommentCount(postId: number, count: number): Promise<void> {
    const post = this.posts.get(postId);
    if (post) {
      post.commentCount = count;
      this.posts.set(postId, post);
    }
  }

  async getCommentsByPost(postId: number): Promise<CommentWithUser[]> {
    const commentsArray = Array.from(this.comments.values()).filter(comment => comment.postId === postId);
    const commentsWithUsers = await Promise.all(
      commentsArray.map(async (comment) => {
        const user = await this.getUser(comment.userId);
        return { ...comment, user: user! };
      })
    );
    return commentsWithUsers.sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime());
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const comment: Comment = {
      id: this.currentCommentId++,
      ...insertComment,
      createdAt: new Date(),
    };
    this.comments.set(comment.id, comment);
    
    // Update post comment count
    const currentCount = Array.from(this.comments.values()).filter(c => c.postId === insertComment.postId).length;
    await this.updatePostCommentCount(insertComment.postId, currentCount);
    
    return comment;
  }

  async getLike(postId: number, userId: number): Promise<Like | undefined> {
    const key = `${postId}-${userId}`;
    return this.likes.get(key);
  }

  async createLike(insertLike: InsertLike): Promise<Like> {
    const like: Like = {
      id: this.currentLikeId++,
      ...insertLike,
      createdAt: new Date(),
    };
    const key = `${insertLike.postId}-${insertLike.userId}`;
    this.likes.set(key, like);
    
    // Update post like count
    const likeCount = await this.getLikeCount(insertLike.postId);
    await this.updatePostLikes(insertLike.postId, likeCount);
    
    return like;
  }

  async deleteLike(postId: number, userId: number): Promise<void> {
    const key = `${postId}-${userId}`;
    this.likes.delete(key);
    
    // Update post like count
    const likeCount = await this.getLikeCount(postId);
    await this.updatePostLikes(postId, likeCount);
  }

  async getLikeCount(postId: number): Promise<number> {
    return Array.from(this.likes.values()).filter(like => like.postId === postId).length;
  }
}

export const storage = new MemStorage();
