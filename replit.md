# Akamai Arrival - Hawaii Agriculture Declaration

## Overview

This is a Progressive Web App (PWA) for completing mandatory Hawaii plant and animal declaration forms digitally. The application provides a mobile-first, multi-step form experience for travelers to Hawaii, allowing them to declare agricultural items they're bringing to the islands.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: Zustand with persistence for form data management
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom Hawaii-themed color palette
- **PWA Features**: Service worker for offline capabilities and app installation

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **API Design**: RESTful endpoints for declaration management
- **Development**: Hot module replacement with Vite integration
- **Storage**: Configurable storage interface with in-memory implementation for development

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Connection**: Neon Database serverless PostgreSQL
- **Migrations**: Drizzle Kit for schema management
- **Session Storage**: PostgreSQL-based session store using connect-pg-simple

## Key Components

### Form Management
- Multi-step form wizard with 6 steps total
- Form validation using Zod schemas for each step
- Persistent form state across browser sessions
- Real-time form validation and error handling
- Automatic draft saving for incomplete forms
- Draft management interface for continuing saved forms

### Progressive Web App Features
- Offline-first service worker implementation
- App installation prompts and PWA manifest
- Mobile-optimized UI with touch-friendly interactions
- Responsive design for various screen sizes

### User Interface
- Hawaii-themed design with custom color palette
- Mobile-first responsive layout
- Accessible components using Radix UI primitives
- Multi-language support infrastructure (English, Spanish, Tagalog, Japanese, Korean, Chinese)

### API Layer
- RESTful endpoints for declaration CRUD operations
- Form step validation endpoints
- Submission workflow management
- Error handling and validation middleware

## Data Flow

1. **Form Initialization**: User starts new declaration, form state initialized in Zustand store
2. **Step Navigation**: User progresses through 6-step form with validation at each step
3. **Data Persistence**: Form data automatically persisted to browser storage
4. **API Submission**: Completed forms submitted to backend via REST API
5. **Database Storage**: Declaration data stored in PostgreSQL with Drizzle ORM
6. **Confirmation**: User receives confirmation with submission details

## External Dependencies

### Core Dependencies
- **Database**: Neon Database (serverless PostgreSQL)
- **UI Components**: Radix UI primitives for accessibility
- **State Management**: Zustand for client-side state
- **Validation**: Zod for runtime type checking and validation
- **Date Handling**: date-fns for date manipulation
- **Form Handling**: React Hook Form with Hookform resolvers

### Development Dependencies
- **Build Tools**: Vite with React plugin
- **Database Tools**: Drizzle Kit for migrations
- **Development Server**: Express with Vite middleware
- **Error Handling**: Replit runtime error overlay

## Deployment Strategy

### Build Process
- Frontend built with Vite to optimized static assets
- Backend bundled with esbuild for Node.js deployment
- Static assets served from Express in production

### Environment Configuration
- Database connection via DATABASE_URL environment variable
- Development vs production mode detection
- Replit-specific development tools integration

### Production Deployment
- Express server serves both API and static frontend
- PostgreSQL database connection required
- Service worker enables offline functionality

## Changelog

```
Changelog:
- July 04, 2025. Updated airline dropdown to 7 options: Alaska Airlines, American Airlines, Delta Airlines, Hawaiian Airlines, Southwest Airlines, United Airlines, and Other Airline
- July 04, 2025. Updated duration requirement to be optional for "Returning Hawaii Resident" users while keeping it mandatory for visitors and people moving to Hawaii  
- July 04, 2025. Updated visit frequency requirement to be optional for "Returning Hawaii Resident" users while keeping it mandatory for visitors and people moving to Hawaii
- July 04, 2025. Reformatted PDF receipt into clean two-column layout without vertical separator for better readability and space utilization
- July 04, 2025. Implemented QR code functionality on confirmation page displaying declaration ID, submission timestamp, and items count
- July 04, 2025. Added Hawaii Address/Accommodation collection step after Contact Information with "Same As Home Address" checkbox option
- July 04, 2025. Implemented contact information collection screen before form submission with automatic user data storage and retrieval
- July 03, 2025. Implemented location-based greeting feature that changes based on user's local time with Hawaiian phrases
- July 03, 2025. Updated landing page banner with scenic Hawaiian beach image featuring palm trees and turquoise waters
- July 03, 2025. Updated Review & Submit and Confirmation pages to display "None Declared" when only "None of Above" is selected for Plant/Food or Animal items
- July 03, 2025. Implemented draft declarations feature with automatic saving, drafts management page, and ability to continue incomplete forms
- July 03, 2025. Fixed items declared count to exclude "None of Above" selections from the total
- July 03, 2025. Added user guidance notices in Plant & Food Items and Animal Declaration steps that appear when items are selected, directing users to the description field at bottom of screen
- July 02, 2025. Updated Hawaiian island images with authentic, representative landmarks for each island
- July 02, 2025. Fixed date validation error in backend API for form submissions
- July 02, 2025. Fixed TypeScript compilation errors and array type handling
- July 01, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```