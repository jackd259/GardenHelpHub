import { db } from "./db";
import { users, posts, comments, likes } from "@shared/schema";
import { eq } from "drizzle-orm";

async function seedDatabase() {
  console.log("Seeding database...");

  try {
    // Clear existing data
    await db.delete(likes);
    await db.delete(comments);
    await db.delete(posts);
    await db.delete(users);

    // Create sample users
    const sampleUsers = [
      { username: "sarah_martinez", email: "sarah@example.com", password: "password", location: "Davis, CA", zone: "9b" },
      { username: "mike_chen", email: "mike@example.com", password: "password", location: "San Jose, CA", zone: "9b" },
      { username: "lisa_rodriguez", email: "lisa@example.com", password: "password", location: "Fresno, CA", zone: "9a" },
      { username: "david_thompson", email: "david@example.com", password: "password", location: "Fresno, CA", zone: "9a" },
      { username: "jennifer_adams", email: "jennifer@example.com", password: "password", location: "San Jose, CA", zone: "9b" },
      { username: "dr_maria_santos", email: "maria@example.com", password: "password", location: "UC Extension", zone: "Expert" },
    ];

    const insertedUsers = await db.insert(users).values(sampleUsers).returning();
    console.log(`Created ${insertedUsers.length} users`);

    // Create sample posts
    const samplePosts = [
      {
        userId: insertedUsers[0].id,
        content: "🚨 DROUGHT EMERGENCY: My tomatoes are wilting despite daily watering! The soil is bone dry 2 inches down. I'm in Davis, CA and we're hitting 105°F daily. Has anyone found effective deep watering techniques? I'm considering drip irrigation but need advice on setup for raised beds.",
        category: "drought",
        imageUrl: null,
      },
      {
        userId: insertedUsers[5].id,
        content: "💡 EXPERT TIP: For drought conditions, try the 'deep and infrequent' watering method. Water thoroughly 2-3 times per week rather than daily light watering. This encourages deep root growth. Also, add a 3-inch mulch layer to retain moisture. I've seen 40% water savings with this approach.",
        category: "plant-care",
        imageUrl: null,
      },
      {
        userId: insertedUsers[1].id,
        content: "SUCCESS STORY! 🎉 After 3 weeks of battling aphids on my roses, I finally won using ladybugs and neem oil spray. The key was persistence - spraying every 3 days and releasing beneficial insects. My roses are blooming beautifully again! Happy to share my exact treatment schedule.",
        category: "success",
        imageUrl: null,
      },
      {
        userId: insertedUsers[2].id,
        content: "HELP NEEDED: Strange white spots appearing on my pepper plant leaves. Started small but now covering 50% of the foliage. Plants are in full sun, zone 9a. Could this be powdery mildew? What's the best organic treatment? I've heard about baking soda solutions but want expert advice first.",
        category: "pests",
        imageUrl: null,
      },
      {
        userId: insertedUsers[3].id,
        content: "Water-wise gardening update from Fresno: Switched to drought-resistant natives and cut my water bill by 60%! California poppies, lavender, and rosemary are thriving. The initial setup cost was $200 but savings are already showing. Zone 9a gardeners - highly recommend this transition!",
        category: "success",
        imageUrl: null,
      },
      {
        userId: insertedUsers[4].id,
        content: "Spider mites are decimating my cucumber plants! 😱 I see tiny webs and leaves turning yellow/bronze. Traditional sprays aren't working. Has anyone tried predatory mites? I'm desperate - these plants were supposed to be my main summer crop. San Jose area, zone 9b.",
        category: "pests",
        imageUrl: null,
      },
      {
        userId: insertedUsers[0].id,
        content: "Follow-up on my drought situation: The drip irrigation system is AMAZING! 💧 Tomatoes recovered within days. Installation took 4 hours but so worth it. Water usage dropped 50% while plant health improved dramatically. Davis gardeners - I have extra supplies if anyone wants to try!",
        category: "success",
        imageUrl: null,
      },
      {
        userId: insertedUsers[1].id,
        content: "Question about companion planting: Does anyone have experience with basil and tomatoes together? I've read it helps with pest control, but my basil seems to be struggling in the tomato bed. Should I adjust spacing or watering schedule? Zone 9b, San Jose area.",
        category: "plant-care",
        imageUrl: null,
      },
    ];

    const insertedPosts = await db.insert(posts).values(samplePosts).returning();
    console.log(`Created ${insertedPosts.length} posts`);

    // Create sample comments
    const sampleComments = [
      { postId: insertedPosts[0].id, userId: insertedUsers[5].id, content: "I'd recommend deep watering twice weekly instead of daily. Also, check if your soil has proper drainage - sometimes plants can't access water even when it's there." },
      { postId: insertedPosts[0].id, userId: insertedUsers[1].id, content: "Same issue here! I installed a drip system last month and it's been a game-changer. Happy to share my setup details." },
      { postId: insertedPosts[1].id, userId: insertedUsers[2].id, content: "This is exactly what I needed! Going to try the mulch layer this weekend. Thank you for the specific measurements." },
      { postId: insertedPosts[2].id, userId: insertedUsers[3].id, content: "Congrats! I've been struggling with aphids too. Could you share your exact neem oil schedule?" },
      { postId: insertedPosts[3].id, userId: insertedUsers[5].id, content: "Looks like powdery mildew. Try a milk spray solution (1 part milk to 10 parts water) - it's organic and very effective." },
      { postId: insertedPosts[5].id, userId: insertedUsers[0].id, content: "Spider mites are tough! I've had success with predatory mites from nature's good guys. Takes about 2 weeks to see results." },
    ];

    const insertedComments = await db.insert(comments).values(sampleComments).returning();
    console.log(`Created ${insertedComments.length} comments`);

    // Update post comment counts
    for (const post of insertedPosts) {
      const commentCount = insertedComments.filter(c => c.postId === post.id).length;
      if (commentCount > 0) {
        await db.update(posts).set({ commentCount }).where(eq(posts.id, post.id));
      }
    }

    // Create sample likes
    const sampleLikes = [
      { postId: insertedPosts[0].id, userId: insertedUsers[1].id },
      { postId: insertedPosts[0].id, userId: insertedUsers[2].id },
      { postId: insertedPosts[0].id, userId: insertedUsers[3].id },
      { postId: insertedPosts[1].id, userId: insertedUsers[0].id },
      { postId: insertedPosts[1].id, userId: insertedUsers[2].id },
      { postId: insertedPosts[1].id, userId: insertedUsers[3].id },
      { postId: insertedPosts[1].id, userId: insertedUsers[4].id },
      { postId: insertedPosts[2].id, userId: insertedUsers[0].id },
      { postId: insertedPosts[2].id, userId: insertedUsers[5].id },
      { postId: insertedPosts[3].id, userId: insertedUsers[1].id },
      { postId: insertedPosts[3].id, userId: insertedUsers[4].id },
      { postId: insertedPosts[4].id, userId: insertedUsers[0].id },
      { postId: insertedPosts[4].id, userId: insertedUsers[1].id },
      { postId: insertedPosts[4].id, userId: insertedUsers[5].id },
      { postId: insertedPosts[5].id, userId: insertedUsers[2].id },
      { postId: insertedPosts[5].id, userId: insertedUsers[3].id },
      { postId: insertedPosts[6].id, userId: insertedUsers[1].id },
      { postId: insertedPosts[6].id, userId: insertedUsers[2].id },
      { postId: insertedPosts[6].id, userId: insertedUsers[5].id },
      { postId: insertedPosts[7].id, userId: insertedUsers[0].id },
      { postId: insertedPosts[7].id, userId: insertedUsers[3].id },
    ];

    const insertedLikes = await db.insert(likes).values(sampleLikes).returning();
    console.log(`Created ${insertedLikes.length} likes`);

    // Update post like counts
    for (const post of insertedPosts) {
      const likeCount = insertedLikes.filter(l => l.postId === post.id).length;
      if (likeCount > 0) {
        await db.update(posts).set({ likes: likeCount }).where(eq(posts.id, post.id));
      }
    }

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

// Run seeding if this file is executed directly
seedDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

export { seedDatabase };