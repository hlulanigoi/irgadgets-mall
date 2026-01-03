export { initializeFirebaseAdmin, getFirebaseAdmin, auth } from './config';
export { isAuthenticated, verifyFirebaseToken, type AuthRequest } from './middleware';
export { authStorage, type IAuthStorage } from './storage';
export { registerFirebaseAuthRoutes } from './routes';
