# Firebase Authentication Setup

This application now uses Firebase Authentication instead of Replit Auth.

## Features Implemented

### Authentication Methods
- ✅ Email/Password authentication
- ✅ Google Sign-In
- ✅ Password reset functionality
- ✅ User profile management

### Backend (Node.js/Express)
- Firebase Admin SDK for token verification
- Secure middleware for protected routes
- User data stored in PostgreSQL
- Role-based access control (admin, shop_owner, customer)

### Frontend (React/TypeScript)
- Firebase Client SDK
- Auth context for global state management
- Beautiful Auth Modal with login/signup tabs
- Google Sign-In button
- Automatic token refresh
- Protected routes

## Setup Instructions

### 1. Firebase Console Setup

1. Go to https://console.firebase.google.com/
2. Select your project: **designspark-a0254**
3. Enable Authentication:
   - Go to **Authentication** → **Sign-in method**
   - Enable **Email/Password**
   - Enable **Google** (add your domain to authorized domains)

### 2. Get Service Account Credentials (Backend)

For the backend to verify tokens, you need a service account:

1. In Firebase Console, go to **Project Settings** → **Service Accounts**
2. Click **"Generate New Private Key"**
3. Download the JSON file
4. Copy the entire JSON content
5. Add it to `/app/.env` as `FIREBASE_SERVICE_ACCOUNT`:

```env
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"designspark-a0254",...}
```

**Note:** Paste it as a single line (no line breaks)

### 3. Environment Variables

Update `/app/.env`:

```env
DATABASE_URL=postgresql://emall_user:emall_password@localhost:5432/emall
PORT=5000
NODE_ENV=development

# Firebase Configuration
FIREBASE_PROJECT_ID=designspark-a0254
FIREBASE_SERVICE_ACCOUNT=<paste service account JSON here>
```

### 4. Frontend Configuration

The Firebase config is already set in `/app/client/src/lib/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "AIzaSyC03AdNuGES89P2hfOgYpzKC-m5ebs0HOI",
  authDomain: "designspark-a0254.firebaseapp.com",
  projectId: "designspark-a0254",
  // ... other config
};
```

## How It Works

### Authentication Flow

1. **User Signs Up/Logs In:**
   - User enters credentials or clicks "Sign in with Google"
   - Firebase authenticates and returns an ID token
   - Token is stored in memory by Firebase SDK

2. **Making API Requests:**
   - All API requests automatically include the Firebase ID token
   - Backend middleware verifies the token
   - User info is extracted and attached to the request

3. **Protected Routes:**
   - Backend: `isAuthenticated` middleware checks token validity
   - Frontend: Auth state is managed by `AuthContext`
   - Role-based access (admin, shop_owner, customer)

### Key Files

#### Backend
- `/app/server/firebase/config.ts` - Firebase Admin initialization
- `/app/server/firebase/middleware.ts` - Token verification
- `/app/server/firebase/routes.ts` - Auth endpoints
- `/app/server/routes.ts` - Updated to use Firebase auth

#### Frontend
- `/app/client/src/lib/firebase.ts` - Firebase client config
- `/app/client/src/contexts/AuthContext.tsx` - Auth state management
- `/app/client/src/components/AuthModal.tsx` - Login/Signup UI
- `/app/client/src/hooks/use-auth.ts` - Auth hook
- `/app/client/src/lib/queryClient.ts` - Auto token injection

## Testing the Setup

### 1. Start the Application

```bash
cd /app
yarn dev
```

### 2. Test Authentication

1. Open the app in your browser
2. Click **"Sign In"** button
3. Try creating an account with email/password
4. Try logging in with Google
5. Verify you can access protected routes

### 3. Test User Roles

Users are assigned the "customer" role by default. To test admin features:

```sql
-- Connect to PostgreSQL
psql postgresql://emall_user:emall_password@localhost:5432/emall

-- Update user role to admin
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

## API Endpoints

### Public Endpoints
- `GET /api/shops` - List shops
- `GET /api/shops/:id` - Get shop details
- `GET /api/tasks` - List tasks

### Protected Endpoints (Require Authentication)
- `GET /api/auth/user` - Get current user
- `POST /api/shops` - Create shop
- `POST /api/orders` - Create order
- `GET /api/orders/my` - Get user's orders

### Admin Endpoints (Require Admin Role)
- `GET /api/admin/stats` - Get admin statistics
- `GET /api/admin/users` - List all users
- `PATCH /api/admin/users/:id/role` - Update user role

## Security Notes

1. **Never commit service account JSON** to version control
2. Firebase automatically handles token refresh
3. Tokens expire after 1 hour (automatically refreshed)
4. All passwords are hashed by Firebase
5. CORS is handled by Express middleware

## Troubleshooting

### "Unauthorized" errors
- Check if Firebase token is being sent in Authorization header
- Verify service account JSON is correct in .env
- Ensure user is logged in (check browser console)

### Google Sign-In not working
- Add your domain to authorized domains in Firebase Console
- Check if Google provider is enabled in Firebase Auth

### Database errors
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env
- Run migrations if needed: `yarn db:push`

## Migration from Replit Auth

The old Replit Auth system has been completely replaced. Key changes:

1. ❌ Removed: Replit OIDC integration
2. ❌ Removed: Session-based authentication
3. ✅ Added: Firebase token-based authentication
4. ✅ Added: Email/Password and Google Sign-In
5. ✅ Kept: PostgreSQL user storage and roles

The `sessions` table is no longer used but kept for compatibility.

## Support

For issues or questions:
- Check Firebase Console for auth logs
- Check browser console for frontend errors
- Check server logs for backend errors
- Verify environment variables are set correctly
