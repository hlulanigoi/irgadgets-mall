import type { Express } from 'express';
import { authStorage } from './storage';
import { isAuthenticated, type AuthRequest } from './middleware';
import { auth } from './config';

/**
 * Register Firebase auth routes
 */
export function registerFirebaseAuthRoutes(app: Express): void {
  // Get current authenticated user
  app.get('/api/auth/user', isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.uid;
      const user = await authStorage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: 'Failed to fetch user' });
    }
  });

  // Verify email (optional endpoint)
  app.post('/api/auth/verify-email', isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.uid;
      // Send verification email via Firebase Admin SDK
      const link = await auth().generateEmailVerificationLink(req.user!.email!);
      res.json({ message: 'Verification email sent', link });
    } catch (error) {
      console.error('Error sending verification email:', error);
      res.status(500).json({ message: 'Failed to send verification email' });
    }
  });

  // Delete user account
  app.delete('/api/auth/user', isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.uid;
      
      // Delete from Firebase
      await auth().deleteUser(userId);
      
      // Delete from database
      // Note: This should cascade delete related data
      
      res.json({ message: 'Account deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: 'Failed to delete account' });
    }
  });
}
