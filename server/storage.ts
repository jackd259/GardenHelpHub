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

    // Create some sample posts
    const samplePosts = [
      {
        userId: 1,
        content: "🚨 DROUGHT EMERGENCY: My tomatoes are wilting despite daily watering! The soil is bone dry 2 inches down. I'm in Davis, CA and we're hitting 105°F daily. Has anyone found effective deep watering techniques? I'm considering drip irrigation but need advice on setup for raised beds.",
        category: "drought",
        imageUrl: null,
      },
      {
        userId: 6,
        content: "💡 EXPERT TIP: For drought conditions, try the 'deep and infrequent' watering method. Water thoroughly 2-3 times per week rather than daily light watering. This encourages deep root growth. Also, add a 3-inch mulch layer to retain moisture. I've seen 40% water savings with this approach.",
        category: "plant-care",
        imageUrl: null,
      },
      {
        userId: 2,
        content: "SUCCESS STORY! 🎉 After 3 weeks of battling aphids on my roses, I finally won using ladybugs and neem oil spray. The key was persistence - spraying every 3 days and releasing beneficial insects. My roses are blooming beautifully again! Happy to share my exact treatment schedule.",
        category: "success",
        imageUrl: null,
      },
      {
        userId: 3,
        content: "HELP NEEDED: Strange white spots appearing on my pepper plant leaves. Started small but now covering 50% of the foliage. Plants are in full sun, zone 9a. Could this be powdery mildew? What's the best organic treatment? I've heard about baking soda solutions but want expert advice first.",
        category: "pests",
        imageUrl: null,
      },
      {
        userId: 4,
        content: "Water-wise gardening update from Fresno: Switched to drought-resistant natives and cut my water bill by 60%! California poppies, lavender, and rosemary are thriving. The initial setup cost was $200 but savings are already showing. Zone 9a gardeners - highly recommend this transition!",
        category: "success",
        imageUrl: null,
      },
      {
        userId: 5,
        content: "Spider mites are decimating my cucumber plants! 😱 I see tiny webs and leaves turning yellow/bronze. Traditional sprays aren't working. Has anyone tried predatory mites? I'm desperate - these plants were supposed to be my main summer crop. San Jose area, zone 9b.",
        category: "pests",
        imageUrl: null,
      },
      {
        userId: 1,
        content: "Follow-up on my drought situation: The drip irrigation system is AMAZING! 💧 Tomatoes recovered within days. Installation took 4 hours but so worth it. Water usage dropped 50% while plant health improved dramatically. Davis gardeners - I have extra supplies if anyone wants to try!",
        category: "success",
        imageUrl: null,
      },
      {
        userId: 2,
        content: "Question about companion planting: Does anyone have experience with basil and tomatoes together? I've read it helps with pest control, but my basil seems to be struggling in the tomato bed. Should I adjust spacing or watering schedule? Zone 9b, San Jose area.",
        category: "plant-care",
        imageUrl: null,
      },
    ];

    samplePosts.forEach(postData => {
      const post: Post = {
        id: this.currentPostId++,
        ...postData,
        likes: Math.floor(Math.random() * 50) + 1,
        commentCount: Math.floor(Math.random() * 15) + 1,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random time within last week
      };
      this.posts.set(post.id, post);
    });

    // Create some sample comments
    const sampleComments = [
      { postId: 1, userId: 6, content: "I'd recommend deep watering twice weekly instead of daily. Also, check if your soil has proper drainage - sometimes plants can't access water even when it's there." },
      { postId: 1, userId: 2, content: "Same issue here! I installed a drip system last month and it's been a game-changer. Happy to share my setup details." },
      { postId: 2, userId: 3, content: "This is exactly what I needed! Going to try the mulch layer this weekend. Thank you for the specific measurements." },
      { postId: 3, userId: 4, content: "Congrats! I've been struggling with aphids too. Could you share your exact neem oil schedule?" },
      { postId: 4, userId: 6, content: "Looks like powdery mildew. Try a milk spray solution (1 part milk to 10 parts water) - it's organic and very effective." },
      { postId: 6, userId: 1, content: "Spider mites are tough! I've had success with predatory mites from nature's good guys. Takes about 2 weeks to see results." },
    ];

    sampleComments.forEach(commentData => {
      const comment: Comment = {
        id: this.currentCommentId++,
        ...commentData,
        createdAt: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000), // Random time within last 5 days
      };
      this.comments.set(comment.id, comment);
    });

    // Create some sample likes
    const sampleLikes = [
      { postId: 1, userId: 2 },
      { postId: 1, userId: 3 },
      { postId: 1, userId: 4 },
      { postId: 2, userId: 1 },
      { postId: 2, userId: 3 },
      { postId: 2, userId: 4 },
      { postId: 2, userId: 5 },
      { postId: 3, userId: 1 },
      { postId: 3, userId: 6 },
      { postId: 4, userId: 2 },
      { postId: 4, userId: 5 },
      { postId: 5, userId: 1 },
      { postId: 5, userId: 2 },
      { postId: 5, userId: 6 },
      { postId: 6, userId: 3 },
      { postId: 6, userId: 4 },
      { postId: 7, userId: 2 },
      { postId: 7, userId: 3 },
      { postId: 7, userId: 6 },
      { postId: 8, userId: 1 },
      { postId: 8, userId: 4 },
    ];

    sampleLikes.forEach(likeData => {
      const like: Like = {
        id: this.currentLikeId++,
        ...likeData,
        createdAt: new Date(Date.now() - Math.random() * 6 * 24 * 60 * 60 * 1000), // Random time within last 6 days
      };
      const key = `${likeData.postId}-${likeData.userId}`;
      this.likes.set(key, like);
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
