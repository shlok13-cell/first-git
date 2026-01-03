# Nivaran AI - Grievance Redressal System

## Overview

Nivaran AI is a citizen grievance submission and tracking platform. Users can submit complaints which are automatically classified by category, urgency, and assigned to appropriate departments. The system provides a dashboard to view and manage all submitted grievances with status tracking.

The application is a full-stack TypeScript project with a React frontend and Express backend, using in-memory storage by default with PostgreSQL schema definitions ready for database integration.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, built using Vite
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state and caching
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens (CSS variables for theming)
- **Animations**: Framer Motion for page transitions and micro-interactions
- **Forms**: React Hook Form with Zod validation via @hookform/resolvers

### Backend Architecture
- **Framework**: Express.js running on Node.js
- **API Design**: RESTful endpoints with typed route definitions in `shared/routes.ts`
- **Validation**: Zod schemas for request/response validation
- **Storage**: In-memory storage implementation (`MemStorage` class) with interface ready for database swap
- **Auto-Classification**: Keyword-based complaint classification logic in `server/routes.ts`

### Shared Code
- **Location**: `shared/` directory contains code used by both frontend and backend
- **Schema**: Drizzle ORM schema definitions in `shared/schema.ts` (PostgreSQL-ready)
- **Routes**: Typed API route definitions in `shared/routes.ts` for type-safe API calls
- **Path Aliases**: `@shared/*` resolves to shared directory from both client and server

### Data Model
The core entity is a **Complaint** with fields:
- User-provided: `name`, `location`, `complaintText`
- Auto-generated: `category`, `urgency` (1-5 scale), `department`, `status`
- Status values: "Filed", "Under Review", "In Progress", "Resolved"

### Build System
- **Development**: `tsx` for TypeScript execution, Vite dev server with HMR
- **Production**: Custom build script using esbuild for server bundling, Vite for client
- **Output**: Server bundled to `dist/index.cjs`, client assets to `dist/public`

## External Dependencies

### Database
- **ORM**: Drizzle ORM configured for PostgreSQL
- **Schema Push**: `npm run db:push` applies schema changes
- **Connection**: Expects `DATABASE_URL` environment variable when using database
- **Current State**: Uses in-memory storage; database integration is optional

### UI Framework Dependencies
- **Radix UI**: Complete primitive component library (dialogs, dropdowns, forms, etc.)
- **shadcn/ui**: Pre-configured component system with New York style variant
- **Lucide React**: Icon library

### Session Management (Available but not active)
- `connect-pg-simple`: PostgreSQL session store (configured in dependencies)
- `express-session`: Session middleware ready for auth implementation

### Fonts
- Google Fonts: Inter (body text), Outfit (display/headings)
- Loaded via CDN in `client/index.html`