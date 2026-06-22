# Deployment Guide

## 🚀 Vercel Deployment (Recommended)

### Step 1: Prepare Your Repository

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Grocery E-Commerce App"
   git remote add origin https://github.com/yourusername/grocery.git
   git push -u origin main
   ```

2. **Create `.env.production.local`** (Vercel will use this):
   ```env
   DATABASE_URL="postgresql://..."
   NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
   NEXTAUTH_URL="https://yourdomain.com"
   ```

### Step 2: Deploy to Vercel

1. **Visit [vercel.com](https://vercel.com)** and sign in with GitHub
2. **Click "New Project"**
3. **Import your GitHub repository**
4. **Configure Environment Variables**:
   - Add all variables from your `.env.production.local`
5. **Click "Deploy"**

### Step 3: Database Setup

**Option A: Vercel Postgres (Easiest)**
```bash
npm install @vercel/postgres
vercel env pull  # Gets DATABASE_URL
```

**Option B: External PostgreSQL**
- Use Supabase, Railway, or Digital Ocean
- Update `DATABASE_URL` in Vercel dashboard

### Step 4: Run Database Migrations

After connecting your database:
```bash
npm run db:push
npm run db:seed
```

### Step 5: Final Setup

1. **Verify deployment**: Visit your Vercel URL
2. **Test authentication**: Use demo credentials
3. **Monitor logs**: Dashboard → Project → Deployments

---

## 🐳 Docker Deployment

### Prerequisites
- Docker and Docker Compose installed
- PostgreSQL database or Docker image

### Step 1: Build Image

```bash
docker build -t grocery-app:latest .
```

### Step 2: Environment File

Create `.env.docker`:
```env
DATABASE_URL=postgresql://postgres:postgres@db:5432/grocery_db
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

### Step 3: Run with Docker Compose

```bash
docker-compose up -d
```

This starts:
- PostgreSQL database
- Next.js application

Access: `http://localhost:3000`

### Step 4: Database Setup

```bash
docker exec grocery-app npm run db:push
docker exec grocery-app npm run db:seed
```

### Step 5: Deploy to Production

**On AWS ECS:**
1. Push image to ECR
2. Create ECS task definition
3. Deploy with Application Load Balancer

**On Docker Swarm:**
```bash
docker swarm init
docker stack deploy -c docker-compose.yml grocery
```

**On Kubernetes:**
```bash
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
```

---

## 🚀 Manual Server Deployment

### Prerequisites
- Node.js 18+
- PostgreSQL
- Nginx or Apache
- PM2 (process manager)

### Step 1: Clone and Setup

```bash
git clone <repo>
cd grocery
npm install
npm run build
```

### Step 2: Environment Setup

```bash
cp .env.example .env
# Edit .env with production values
```

### Step 3: Database

```bash
npm run db:push
npm run db:seed
```

### Step 4: Start Application (PM2)

```bash
npm install -g pm2

pm2 start npm --name "grocery" -- start
pm2 save
pm2 startup
```

### Step 5: Nginx Configuration

Create `/etc/nginx/sites-available/grocery`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/grocery /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 6: SSL Certificate (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## 🌍 Environment Variables Checklist

### Required for Production

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/db_name

# Authentication
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
NEXTAUTH_URL=https://yourdomain.com

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Payment Gateway (Optional)
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
```

---

## 🔍 Pre-Deployment Checklist

- [ ] All environment variables set
- [ ] Database migrations run
- [ ] Seed data loaded
- [ ] Authentication tested
- [ ] Payment gateway configured (if using)
- [ ] Email service configured (if using)
- [ ] SSL certificate installed
- [ ] Backup strategy in place
- [ ] Monitoring setup (Sentry, LogRocket, etc.)
- [ ] CDN configured for images
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Database backups scheduled
- [ ] Error logging configured

---

## 📊 Monitoring & Logging

### Sentry (Error Tracking)

```typescript
// lib/sentry.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
})
```

### LogRocket (Session Replay)

```typescript
// lib/logrocket.ts
import LogRocket from 'logrocket'

LogRocket.init(process.env.NEXT_PUBLIC_LOGROCKET_ID)
```

### Vercel Analytics

Already included with Vercel deployments!

---

## 🆘 Troubleshooting

### Database Connection Error
```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

### High Memory Usage
```bash
# Check process
pm2 monit

# Restart
pm2 restart grocery
```

### Slow Performance
- Enable caching headers
- Configure CDN
- Optimize images
- Enable gzip compression

### 500 Errors
```bash
# Check logs
pm2 logs grocery

# On Vercel
vercel logs <project-name>
```

---

## 🔄 Continuous Deployment

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: vercel/action@main
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## 📞 Support

- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- PostgreSQL: https://www.postgresql.org/docs/
- NextAuth.js: https://next-auth.js.org/

Happy deploying! 🚀
