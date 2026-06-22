# 🚀 Project Setup Guide

This guide will help you set up the Grocery E-Commerce application locally.

## ✅ Prerequisites

Before you begin, ensure you have:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** or **yarn** (comes with Node.js)
- **PostgreSQL** 12+ ([Download](https://www.postgresql.org/download/))
- **Git** ([Download](https://git-scm.com/))
- A code editor (VS Code recommended)

## 📦 Installation Steps

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd grocery
```

### 2. Install Dependencies

```bash
npm install
```

Or if you prefer yarn:

```bash
yarn install
```

### 3. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and configure your database:

```env
# Database Connection
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/grocery_db"

# Authentication
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# API Configuration
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
```

**To generate `NEXTAUTH_SECRET`**, run:

```bash
openssl rand -base64 32
```

### 4. Create PostgreSQL Database

#### Option A: Using psql CLI

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE grocery_db;
CREATE USER grocery_user WITH PASSWORD 'your_password';
ALTER ROLE grocery_user SET client_encoding TO 'utf8';
ALTER ROLE grocery_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE grocery_user SET default_transaction_deferrable TO on;
ALTER ROLE grocery_user SET default_transaction_read_only TO off;
GRANT ALL PRIVILEGES ON DATABASE grocery_db TO grocery_user;

# Exit psql
\q
```

#### Option B: Using Docker

```bash
docker run --name grocery-db \
  -e POSTGRES_DB=grocery_db \
  -e POSTGRES_USER=grocery_user \
  -e POSTGRES_PASSWORD=your_password \
  -p 5432:5432 \
  -d postgres:15-alpine
```

#### Option C: Using Docker Compose

```bash
docker-compose up -d db
```

### 5. Set Up Prisma Database

Push the schema to your database:

```bash
npm run db:push
```

### 6. Seed Sample Data

Populate the database with sample data:

```bash
npm run db:seed
```

This will create:
- ✅ 10 product categories
- ✅ 50 sample grocery products
- ✅ 3 test user accounts
- ✅ Sample orders and reviews

### 7. Start Development Server

```bash
npm run dev
```

The application will be available at: **http://localhost:3000**

## 🔐 Test Credentials

Use these credentials to test the application:

### Customer Account
- **Email**: `customer@grocery.com`
- **Password**: `Password@123`

### Admin Account
- **Email**: `admin@grocery.com`
- **Password**: `Password@123`

### Another Customer
- **Email**: `jane@grocery.com`
- **Password**: `Password@123`

## 🛠️ Available Commands

```bash
# Development
npm run dev              # Start development server with hot reload
npm run lint            # Run ESLint to check code quality
npm run type-check      # Check TypeScript types

# Production
npm run build           # Build for production
npm start               # Start production server

# Database Management
npm run db:push         # Sync schema with database
npm run db:migrate      # Run database migrations
npm run db:seed         # Seed sample data
npm run db:studio       # Open Prisma Studio (visual database editor)
```

## 🗄️ Prisma Studio

To visually manage your database:

```bash
npm run db:studio
```

Opens at: **http://localhost:5555**

## 🔄 Project Structure

```
grocery/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── layout.tsx      # Root layout
│   │   ├── page.tsx        # Homepage
│   │   ├── api/            # API routes
│   │   ├── products/       # Products pages
│   │   ├── cart/           # Shopping cart
│   │   ├── checkout/       # Checkout flow
│   │   ├── dashboard/      # User dashboard
│   │   ├── admin/          # Admin panel
│   │   └── auth/           # Authentication
│   ├── components/         # React components
│   │   ├── ui/            # UI components
│   │   ├── layout/        # Layout components
│   │   ├── home/          # Homepage sections
│   │   └── cart/          # Cart components
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Utility libraries
│   ├── store/             # Zustand stores
│   ├── styles/            # Global styles
│   ├── types/             # TypeScript types
│   └── utils/             # Utility functions
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed script
├── public/                # Static files
├── .env.example           # Environment variables template
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
├── tailwind.config.ts     # Tailwind CSS config
└── next.config.js         # Next.js config
```

## 🐛 Troubleshooting

### Issue: PostgreSQL Connection Error

**Solution**: Verify PostgreSQL is running:

```bash
# Check if PostgreSQL service is running
sudo systemctl status postgresql

# Or with Docker
docker ps | grep postgres

# Test connection
psql -U postgres -h localhost
```

### Issue: Port 3000 Already in Use

**Solution**: Use a different port:

```bash
npm run dev -- -p 3001
```

### Issue: Database Migration Errors

**Solution**: Reset database and resync:

```bash
npm run db:push -- --force-reset
npm run db:seed
```

### Issue: NextAuth Authentication Not Working

**Solution**: Verify environment variables:

```bash
# Check .env.local
cat .env.local | grep NEXTAUTH

# Clear browser cookies and restart server
npm run dev
```

### Issue: TypeScript Errors

**Solution**: Type-check and rebuild:

```bash
npm run type-check
npm run build
```

## 📝 Initial Customization

### Change Brand Name

1. Update `Header.tsx`: Change "🛒 Grocery" to your brand
2. Update `README.md`: Change project title
3. Update `app/layout.tsx`: Change metadata

### Change Color Scheme

Edit `tailwind.config.ts`:

```typescript
colors: {
  primary: {
    500: '#YourColor', // Change primary color
  },
  secondary: {
    500: '#YourColor', // Change secondary color
  },
}
```

### Change Database

To use a different database provider:

1. Edit `prisma/schema.prisma` - change provider
2. Update `DATABASE_URL` in `.env.local`
3. Run `npm run db:push`

Supported databases:
- PostgreSQL (default)
- MySQL
- MariaDB
- SQL Server
- SQLite
- MongoDB

## 🚀 Next Steps

After setup:

1. **Browse Homepage**: Visit `http://localhost:3000`
2. **Explore Products**: Check out the product catalog
3. **Test Authentication**: Try login/register
4. **Admin Panel**: Visit `http://localhost:3000/admin` with admin account
5. **Database**: Open `http://localhost:5555` for Prisma Studio

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [NextAuth.js](https://next-auth.js.org/)
- [Zustand](https://github.com/pmndrs/zustand)

## 💡 Tips

- Use `npm run db:studio` to visually edit database records
- Enable VS Code extensions: Tailwind CSS IntelliSense, Prettier
- Use browser DevTools to debug React components
- Check terminal output for detailed error messages

## 📞 Need Help?

- Check `DEPLOYMENT.md` for deployment instructions
- Review `README.md` for comprehensive documentation
- Check GitHub Issues for common problems
- Review error messages in terminal carefully

---

**Happy Coding! 🎉**
