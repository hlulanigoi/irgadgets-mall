# Production Readiness Checklist

This document outlines everything needed to deploy this application to production safely and reliably.

## 🚨 Critical (Must Complete Before Launch)

### 1. Firebase Configuration ⚠️
- [ ] **Get Firebase Service Account JSON**
  - Go to Firebase Console → Project Settings → Service Accounts
  - Generate new private key
  - Add to environment variables (see below)
  
- [ ] **Enable Firebase Authentication Methods**
  - Enable Email/Password in Firebase Console
  - Enable Google Sign-In
  - Add production domain to authorized domains
  
- [ ] **Configure Firebase Security Rules** (if using Firestore/Storage)
  ```javascript
  // Example Firestore rules
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /{document=**} {
        allow read, write: if request.auth != null;
      }
    }
  }
  ```

### 2. Database Setup ⚠️
- [ ] **Provision PostgreSQL Database**
  - Options: Supabase, Neon, Railway, AWS RDS, or Replit
  - Minimum specs: 2GB RAM, 10GB storage
  - Enable SSL connections
  
- [ ] **Run Database Migrations**
  ```bash
  yarn db:push
  ```
  
- [ ] **Create Database Indexes** (for performance)
  ```sql
  CREATE INDEX idx_shops_category ON shops(category);
  CREATE INDEX idx_shops_owner ON shops(owner_id);
  CREATE INDEX idx_products_shop ON products(shop_id);
  CREATE INDEX idx_orders_customer ON orders(customer_id);
  CREATE INDEX idx_orders_shop ON orders(shop_id);
  CREATE INDEX idx_tasks_status ON tasks(status);
  ```
  
- [ ] **Set up Database Backups**
  - Daily automated backups
  - 7-day retention minimum
  - Test restore process

### 3. Environment Variables ⚠️

Create production `.env` file (NEVER commit to git):

```bash
# Database (Production)
DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require

# Server
NODE_ENV=production
PORT=5000

# Firebase Admin (Backend)
FIREBASE_PROJECT_ID=designspark-a0254
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"designspark-a0254",...}

# Session Security (Generate secure random string)
SESSION_SECRET=<generate-with: openssl rand -base64 32>

# CORS (Add your production domain)
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Optional: Monitoring
SENTRY_DSN=<your-sentry-dsn>
```

**Generate SESSION_SECRET:**
```bash
openssl rand -base64 32
```

### 4. Security Hardening ⚠️

- [ ] **Configure CORS Properly**
  ```typescript
  // Add to server/index.ts
  import cors from 'cors';
  
  app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || [],
    credentials: true,
  }));
  ```

- [ ] **Add Rate Limiting**
  ```bash
  yarn add express-rate-limit
  ```
  ```typescript
  // server/index.ts
  import rateLimit from 'express-rate-limit';
  
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  });
  
  app.use('/api/', limiter);
  ```

- [ ] **Add Helmet.js for Security Headers**
  ```bash
  yarn add helmet
  ```
  ```typescript
  // server/index.ts
  import helmet from 'helmet';
  app.use(helmet());
  ```

- [ ] **Sanitize User Input**
  ```bash
  yarn add express-mongo-sanitize
  ```

- [ ] **Enable HTTPS Only**
  - Configure SSL certificate (Let's Encrypt)
  - Redirect HTTP to HTTPS
  - Set secure cookie flags

### 5. Error Handling & Logging ⚠️

- [ ] **Implement Proper Error Logging**
  ```bash
  yarn add winston
  ```
  ```typescript
  // server/lib/logger.ts
  import winston from 'winston';
  
  export const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
      new winston.transports.File({ filename: 'error.log', level: 'error' }),
      new winston.transports.File({ filename: 'combined.log' }),
    ],
  });
  
  if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
      format: winston.format.simple(),
    }));
  }
  ```

- [ ] **Add Error Monitoring** (Sentry recommended)
  ```bash
  yarn add @sentry/node @sentry/react
  ```

- [ ] **Implement Global Error Handler**
  ```typescript
  // server/index.ts - already exists, verify it's comprehensive
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    logger.error(err);
    const status = err.status || 500;
    const message = process.env.NODE_ENV === 'production' 
      ? 'Internal Server Error' 
      : err.message;
    res.status(status).json({ message });
  });
  ```

### 6. Build & Deployment ⚠️

- [ ] **Test Production Build**
  ```bash
  yarn build
  yarn start
  ```

- [ ] **Configure Process Manager** (PM2 recommended)
  ```bash
  npm install -g pm2
  ```
  
  Create `ecosystem.config.js`:
  ```javascript
  module.exports = {
    apps: [{
      name: 'emall-za',
      script: './dist/index.cjs',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
    }],
  };
  ```
  
  Start with PM2:
  ```bash
  pm2 start ecosystem.config.js
  pm2 save
  pm2 startup
  ```

- [ ] **Set Up Reverse Proxy** (Nginx)
  ```nginx
  server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
      proxy_pass http://localhost:5000;
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection 'upgrade';
      proxy_set_header Host $host;
      proxy_cache_bypass $http_upgrade;
    }
  }
  ```

## ⚠️ Important (Should Complete)

### 7. Input Validation & Sanitization

- [ ] **Add Input Validation Middleware**
  - Already using Zod schemas (good!)
  - Add XSS protection
  - Add SQL injection protection (Drizzle ORM helps)

- [ ] **Validate File Uploads** (if applicable)
  - Maximum file size
  - Allowed file types
  - Virus scanning

### 8. API Security

- [ ] **Add Request Size Limits**
  ```typescript
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  ```

- [ ] **Implement API Versioning**
  ```typescript
  // Consider: /api/v1/shops instead of /api/shops
  ```

- [ ] **Add Request ID Tracking**
  ```bash
  yarn add express-request-id
  ```

### 9. Performance Optimization

- [ ] **Add Response Compression**
  ```bash
  yarn add compression
  ```
  ```typescript
  import compression from 'compression';
  app.use(compression());
  ```

- [ ] **Implement Caching**
  - Redis for session storage
  - Cache static responses
  - CDN for assets

- [ ] **Database Connection Pooling**
  - Already using pg pool (good!)
  - Verify pool size: `max: 20` connections

- [ ] **Optimize Database Queries**
  - Add indexes (see database section)
  - Use select specific fields
  - Implement pagination

### 10. Testing

- [ ] **Unit Tests**
  ```bash
  yarn add --dev vitest @testing-library/react
  ```

- [ ] **Integration Tests**
  - Test API endpoints
  - Test database operations
  - Test authentication flow

- [ ] **E2E Tests**
  ```bash
  yarn add --dev playwright
  ```

- [ ] **Load Testing**
  ```bash
  # Use Apache Bench or Artillery
  ab -n 1000 -c 10 https://yourdomain.com/
  ```

### 11. Monitoring & Analytics

- [ ] **Application Monitoring**
  - Sentry for error tracking
  - New Relic or DataDog for APM
  - Uptime monitoring (UptimeRobot, Pingdom)

- [ ] **Database Monitoring**
  - Query performance
  - Connection pool usage
  - Slow query logging

- [ ] **Server Metrics**
  - CPU usage
  - Memory usage
  - Disk space
  - Network traffic

### 12. Email Service (if needed)

- [ ] **Configure Email Provider**
  - SendGrid, AWS SES, or Resend
  - Email templates
  - Transactional emails (password reset, order confirmations)

### 13. File Storage (if needed)

- [ ] **Configure Cloud Storage**
  - AWS S3, Google Cloud Storage, or Cloudinary
  - Image optimization
  - CDN integration

## 📝 Nice to Have

### 14. CI/CD Pipeline

- [ ] **GitHub Actions Workflow**
  ```yaml
  # .github/workflows/deploy.yml
  name: Deploy to Production
  
  on:
    push:
      branches: [main]
  
  jobs:
    deploy:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v2
        - name: Setup Node.js
          uses: actions/setup-node@v2
          with:
            node-version: '20'
        - run: yarn install
        - run: yarn check
        - run: yarn build
        - name: Deploy
          run: |
            # Your deployment script
  ```

### 15. Documentation

- [ ] **API Documentation**
  - Swagger/OpenAPI spec
  - Postman collection

- [ ] **Developer Documentation**
  - Setup instructions
  - Architecture overview
  - Contributing guidelines

- [ ] **User Documentation**
  - User guides
  - FAQ
  - Help center

### 16. Legal & Compliance

- [ ] **Privacy Policy**
- [ ] **Terms of Service**
- [ ] **Cookie Policy**
- [ ] **GDPR Compliance** (if serving EU users)
  - Data export functionality
  - Right to be forgotten
  - Cookie consent banner

### 17. Additional Features

- [ ] **Password Policy**
  - Minimum 8 characters (already enforced in signup)
  - Consider: complexity requirements

- [ ] **Email Verification**
  - Firebase already supports this
  - Implement in AuthModal

- [ ] **2FA (Two-Factor Authentication)**
  - Optional but recommended for admin users

- [ ] **Password Reset Flow**
  - Already have `resetPassword` in AuthContext
  - Create UI for it

- [ ] **Account Deletion**
  - Already have endpoint in routes
  - Add UI for user self-service

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] All environment variables set
- [ ] Database migrations run
- [ ] Firebase authentication enabled
- [ ] SSL certificate installed
- [ ] Domain DNS configured
- [ ] Production build tested locally

### Deployment
- [ ] Deploy to production server
- [ ] Verify all services running
- [ ] Test authentication flow
- [ ] Test critical user journeys
- [ ] Monitor error logs for 24 hours

### Post-Deployment
- [ ] Set up monitoring alerts
- [ ] Configure backup schedule
- [ ] Document deployment process
- [ ] Create rollback plan
- [ ] Monitor performance metrics

## 📊 Recommended Hosting Platforms

### All-in-One Platforms (Easiest)
1. **Vercel** - Great for Next.js, but this app may need adaptation
2. **Railway** - PostgreSQL + Node.js deployment made easy
3. **Render** - Similar to Railway, auto-deploys from GitHub
4. **Fly.io** - Good for Node.js apps with PostgreSQL

### Traditional Cloud (More Control)
1. **AWS** - EC2 + RDS PostgreSQL + CloudFront CDN
2. **Google Cloud** - Cloud Run + Cloud SQL
3. **Digital Ocean** - Droplet + Managed PostgreSQL
4. **Heroku** - Simple deployment, good PostgreSQL addon

### Current Setup (Replit)
- Already configured for Replit
- Just need to provision PostgreSQL database
- Add Firebase service account
- Enable authentication methods

## 🔧 Quick Start: Minimum Viable Production Setup

If you need to go live ASAP, here's the bare minimum:

1. **Get Firebase Service Account** (10 minutes)
2. **Enable Email/Password + Google Auth** (5 minutes)
3. **Provision PostgreSQL Database** (15 minutes)
   - Recommended: Railway.app (free tier available)
4. **Set Environment Variables** (5 minutes)
5. **Run Migrations** (2 minutes): `yarn db:push`
6. **Add Rate Limiting** (10 minutes)
7. **Test Everything** (30 minutes)
8. **Deploy** (30 minutes)

**Total Time: ~2 hours**

## 📞 Support & Resources

- Firebase Console: https://console.firebase.google.com/
- PostgreSQL Hosting: https://railway.app, https://supabase.com
- Error Monitoring: https://sentry.io
- SSL Certificates: https://letsencrypt.org
- CDN: https://cloudflare.com

---

**Priority Order:**
1. 🚨 Critical Items (1-6) - Cannot go live without these
2. ⚠️ Important Items (7-13) - Should have for stability
3. 📝 Nice to Have (14-17) - Can add after launch
