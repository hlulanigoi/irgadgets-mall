# Digital Mall Platform (eMall.za)

## Overview

A South African digital marketplace platform that connects local businesses with customers. The platform enables shop owners to list their businesses (tailors, laundry, retail, services), sell products, and allows users to post and accept community tasks. Built with a warm, vibrant aesthetic inspired by Airbnb's marketplace trust and Etsy's community feel.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with custom South African-inspired color palette (earthy terracotta, ocean blue, warm sand)
- **UI Components**: shadcn/ui component library (New York style)
- **Animations**: Framer Motion for page transitions and interactions
- **Typography**: Outfit (display) + Plus Jakarta Sans (body)

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **API Design**: RESTful endpoints defined in `shared/routes.ts` with Zod validation
- **Build**: Vite for client, esbuild for server bundling

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts` with models for users, shops, products, and tasks
- **Session Storage**: PostgreSQL-backed sessions via connect-pg-simple

### Authentication
- **Provider**: Replit Auth (OpenID Connect)
- **Session**: Express-session with PostgreSQL store
- **User Storage**: Mandatory users and sessions tables for Replit Auth integration

### Core Data Models
- **Users**: Managed by Replit Auth with profile info
- **Shops**: Business listings with categories (tailor, laundry, retail, service)
- **Products**: Items sold by shops with pricing
- **Tasks**: Community tasks with status tracking (open, in_progress, completed)

### Project Structure
```
├── client/           # React frontend
│   ├── src/
│   │   ├── components/   # UI components including shadcn/ui
│   │   ├── hooks/        # React Query hooks for API
│   │   ├── pages/        # Route pages
│   │   └── lib/          # Utilities
├── server/           # Express backend
│   ├── routes.ts     # API route handlers
│   ├── storage.ts    # Database operations
│   └── replit_integrations/auth/  # Auth setup
├── shared/           # Shared types and schemas
│   ├── schema.ts     # Drizzle database schema
│   └── routes.ts     # API contract definitions
```

## External Dependencies

### Database
- PostgreSQL (provisioned via Replit)
- Drizzle ORM for type-safe queries
- Drizzle Kit for migrations (`npm run db:push`)

### Authentication
- Replit Auth (OpenID Connect provider)
- Passport.js with openid-client strategy
- Memoizee for OIDC config caching

### Frontend Libraries
- @tanstack/react-query for data fetching
- react-hook-form with @hookform/resolvers for forms
- Radix UI primitives (via shadcn/ui)
- date-fns for date formatting
- lucide-react for icons

### Build Tools
- Vite with React plugin
- esbuild for server bundling
- TypeScript with strict mode

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Express session secret
- `ISSUER_URL`: Replit OIDC issuer (defaults to https://replit.com/oidc)
- `REPL_ID`: Provided by Replit environment