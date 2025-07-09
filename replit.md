# GardenConnect - Social Garden Network

## Overview

GardenConnect is a full-stack social networking application designed specifically for gardening enthusiasts. It enables users to share gardening experiences, seek help with plant care, and connect with local gardening communities. The platform features location-based services, categorized posts, and interactive social features like commenting and liking.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Styling**: Tailwind CSS with custom garden-themed color palette
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API Style**: RESTful API with JSON responses
- **Middleware**: Custom logging and error handling middleware
- **Development**: Hot reload with Vite integration in development mode

### Database & ORM
- **Database**: PostgreSQL (configured for production)
- **ORM**: Drizzle ORM with type-safe queries
- **Connection**: Neon Database serverless connection
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Validation**: Zod schemas for runtime type validation

## Key Components

### Database Schema
- **Users**: User profiles with location, zone, and avatar support
- **Posts**: Garden-related content with categories (drought, pests, plant-care, etc.)
- **Comments**: Threaded discussions on posts
- **Likes**: Social engagement tracking
- **Relationships**: Foreign key constraints maintaining data integrity

### API Endpoints
- **User Management**: Create users, fetch profiles, email uniqueness validation
- **Post Operations**: CRUD operations with category filtering
- **Social Features**: Comment system, like/unlike functionality
- **Search**: Content filtering by category and search terms

### Frontend Features
- **Responsive Design**: Mobile-first approach with bottom navigation
- **Location Services**: Integration with user location and garden zones
- **Real-time Updates**: Optimistic updates with TanStack Query
- **Social Interactions**: Post creation, commenting, and liking
- **Category System**: Organized content by gardening topics

## Data Flow

1. **User Authentication**: Currently uses hardcoded user ID (future enhancement needed)
2. **Post Creation**: Modal-based post creation with category selection
3. **Content Display**: Infinite scroll feed with category filtering
4. **Social Interactions**: Real-time like/comment updates with optimistic UI
5. **Search**: Client-side filtering with server-side category endpoints

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection for serverless environments
- **@tanstack/react-query**: Server state management and caching
- **drizzle-orm**: Type-safe database queries and migrations
- **@radix-ui/***: Accessible UI component primitives
- **wouter**: Lightweight routing library
- **date-fns**: Date formatting and manipulation

### Development Tools
- **Vite**: Fast build tool with HMR
- **esbuild**: Fast JavaScript bundler for production
- **tsx**: TypeScript execution for development
- **tailwindcss**: Utility-first CSS framework

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds React app to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Database**: Drizzle migrations stored in `migrations/` directory

### Environment Configuration
- **Development**: Uses tsx for TypeScript execution with hot reload
- **Production**: Node.js serves bundled JavaScript with static file serving
- **Database**: Requires `DATABASE_URL` environment variable for PostgreSQL connection

### File Structure
- **`client/`**: React frontend application
- **`server/`**: Express.js backend with routes and storage
- **`shared/`**: Common TypeScript types and schemas
- **`migrations/`**: Database migration files

The application follows a monorepo structure with clear separation between frontend, backend, and shared code, making it suitable for deployment on platforms like Replit, Vercel, or traditional hosting services.