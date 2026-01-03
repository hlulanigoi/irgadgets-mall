import type { Request, Response, NextFunction } from 'express';
import { auth } from './config';
import { authStorage } from './storage';

export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    emailVerified: boolean;
    [key: string]: any;
  };
}

/**
 * Middleware to verify Firebase ID token and attach user to request
 */
export async function verifyFirebaseToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Unauthorized: No token provided' });
      return;
    }

    const idToken = authHeader.split('Bearer ')[1];

    // Verify the token
    const decodedToken = await auth().verifyIdToken(idToken);
    
    // Attach user info to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified || false,
      ...decodedToken,
    };

    // Ensure user exists in database
    await authStorage.upsertUser({
      id: decodedToken.uid,
      email: decodedToken.email,
      firstName: decodedToken.name?.split(' ')[0] || '',
      lastName: decodedToken.name?.split(' ').slice(1).join(' ') || '',
      profileImageUrl: decodedToken.picture,
    });

    next();
  } catch (error: any) {
    console.error('Token verification error:', error);
    res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
}

/**
 * Middleware to check if user is authenticated
 */
export const isAuthenticated = verifyFirebaseToken;
