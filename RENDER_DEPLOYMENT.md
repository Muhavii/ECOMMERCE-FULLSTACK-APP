# Render Deployment Guide

**Render** is the most popular Railway alternative with a generous free tier.

## Quick Deploy to Render

### 1. Create Account
- Go to https://render.com
- Sign up with GitHub

### 2. Create PostgreSQL Database

1. Click "New +" → "PostgreSQL"
2. Name: `ecommerce-db`
3. Database: `ecommerce_db`
4. User: `ecommerce_user`
5. Region: Choose closest to you
6. Plan: **Free** (90 days free, then $7/month)
7. Click "Create Database"

**Save these credentials:**
- Internal Database URL (use this in your app)
- External Database URL (for psql access)

### 3. Create Web Service

1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `ecommerce-api`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: Leave empty (or `.`)
   - **Runtime**: `Java`
   - **Build Command**: `mvn clean package -DskipTests`
   - **Start Command**: `java -jar target/ecommerce-api-1.0.0.jar --spring.profiles.active=prod`
   - **Plan**: **Free**

### 4. Environment Variables

Add these in "Environment" tab:

```env
SPRING_PROFILES_ACTIVE=prod
DATABASE_URL=<paste-internal-database-url-from-step-2>
JWT_SECRET=<generate-with: openssl rand -base64 32>
PORT=10000
```

**Important:** Render uses port 10000 by default, update application-prod.properties:

```properties
server.port=${PORT:10000}
```

### 5. Deploy!

Click "Create Web Service" - Render will:
- Pull from GitHub
- Run Maven build
- Deploy your app
- Give you a URL: `https://ecommerce-api.onrender.com`

## Auto-Deploy on Git Push

Render automatically redeploys when you push to `main` branch.

## Access Logs

Dashboard → Your Service → Logs (real-time)

## Free Tier Limits

- ✅ 750 hours/month (always-on if only 1 service)
- ⚠️ Spins down after 15 min inactivity
- ⚠️ First request after spin-down takes ~30 seconds
- ✅ PostgreSQL: 90 days free, then $7/month

## Keep Service Awake (Optional)

Free tier services sleep after inactivity. To prevent:

**Option 1: UptimeRobot** (Free)
1. Go to https://uptimerobot.com
2. Add monitor → HTTP(s)
3. URL: `https://your-app.onrender.com/api/products`
4. Interval: 5 minutes

**Option 2: Cron Job**
```bash
# Every 5 minutes
*/5 * * * * curl https://your-app.onrender.com/api/products
```

## Upgrade to Paid ($7/month)

For always-on service:
- No spin-down delays
- Better performance
- 24/7 uptime

## Connect Frontend

Update Vercel environment variable:
```env
VITE_API_URL=https://your-app.onrender.com
```

Update CORS in SecurityConfig.java:
```java
configuration.setAllowedOrigins(Arrays.asList(
    "http://localhost:5173",
    "https://your-app.vercel.app"
));
```

---

**Render is production-ready and very stable!** 🚀
