# RNG Tournament PVP Application

## Overview

This is a full-stack tournament management application built with Express.js backend and React frontend. The application allows users to register for PVP tournaments across different skill divisions (Elite, Division 1, Division 2, and Recruits). It features a modern, gaming-themed UI with dark mode aesthetics and real-time participant management.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Development Runtime**: tsx for TypeScript execution
- **Database ORM**: Drizzle ORM configured for PostgreSQL
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Design**: RESTful API with JSON responses
- **Error Handling**: Centralized error middleware

### Monorepo Structure
The application follows a monorepo pattern with shared types and schemas:
- `client/` - React frontend application
- `server/` - Express.js backend application
- `shared/` - Shared TypeScript types and Zod schemas

## Key Components

### Database Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: Single `participants` table with fields for player information, division, experience, score, and status
- **Migrations**: Managed through Drizzle Kit with migrations stored in `/migrations`
- **Connection**: Neon Database serverless connection via `@neondatabase/serverless`

### API Layer
- **Participant Management**: CRUD operations for tournament participants
- **Division Filtering**: Endpoint to retrieve participants by division
- **Input Validation**: Zod schema validation for all API inputs
- **Error Handling**: Consistent error responses with appropriate HTTP status codes

### Frontend Components
- **Tournament Dashboard**: Main view displaying all divisions with participant counts
- **Division Cards**: Visual representation of each tournament division with themed colors
- **Participant Tables**: Sortable tables showing registered participants with rankings
- **Registration Modal**: Form for new participant registration with validation
- **Responsive Design**: Mobile-first approach with Tailwind CSS

### Storage Strategy
- **Development**: In-memory storage implementation (`MemStorage`) for rapid development
- **Production**: Database storage through Drizzle ORM (ready for PostgreSQL)
- **Interface**: `IStorage` interface allows easy switching between storage implementations

## Data Flow

1. **User Registration**: Form submission → Zod validation → API request → Database insertion → UI update via React Query
2. **Data Fetching**: Component mount → React Query → API request → Database query → Response caching
3. **Real-time Updates**: Form submissions trigger query invalidation for automatic UI refresh
4. **Error Handling**: Failed requests show toast notifications with user-friendly messages

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management and caching
- **react-hook-form**: Form state management and validation
- **zod**: Runtime type validation and schema definition

### UI Dependencies
- **@radix-ui/***: Primitive UI components for accessibility
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe variant styling
- **lucide-react**: Icon library

### Development Dependencies
- **tsx**: TypeScript execution for development
- **vite**: Build tool and development server
- **esbuild**: Production build bundling

## Deployment Strategy

### Build Process
1. **Frontend Build**: Vite builds React app to `dist/public`
2. **Backend Build**: esbuild bundles server code to `dist/index.js`
3. **Database Setup**: Drizzle Kit handles schema migrations

### Environment Configuration
- **Development**: Uses tsx for hot reloading and Vite dev server
- **Production**: Serves built static files and runs bundled Express server
- **Database**: Requires `DATABASE_URL` environment variable for PostgreSQL connection

### Hosting Requirements
- Node.js runtime environment
- PostgreSQL database (Neon Database recommended)
- Environment variable support for database connection

## Changelog
- July 07, 2025. Initial setup
- July 07, 2025. Tournament bracket system implemented:
  - Removed red/black side divisions for cleaner bracket visualization
  - Added automatic winner advancement to next round
  - Implemented real-time updates with 1-second polling
  - Enhanced admin panel with professional tournament management
  - Added visual status indicators for matches (completed, in progress, pending)
  - Professional tournament flow with automatic bracket progression
- July 07, 2025. Cross-division tournament system implemented:
  - When a division completes, the champion advances to inter-division matches
  - Special "Champions" division created for cross-division fights
  - Automatic detection of division champions and cross-tournament creation
  - Final tournament between all division winners to determine supreme champion
  - Champions bracket visible in both tournament page and bracket viewer

## User Preferences

Preferred communication style: Simple, everyday language.