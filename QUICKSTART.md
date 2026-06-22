# 🚀 Quick Start Guide

## ⚡ 5-Minute Setup

### 1. Prerequisites Check
```bash
node --version  # Should be 18+
npm --version
```

### 2. Installation
```bash
cd grocery
npm install
cp .env.example .env.local
```

### 3. Database Setup
Edit `.env.local`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/grocery_db"
NEXTAUTH_SECRET="generated-value"
```

Create database:
```bash
createdb grocery_db  # or use Docker
```

### 4. Initialize & Seed
```bash
npm run db:push
npm run db:seed
```

### 5. Start Development
```bash
npm run dev
```

Access: **http://localhost:3000**

---

## 🔑 Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Customer | customer@grocery.com | Password@123 |
| Admin | admin@grocery.com | Password@123 |
| Customer 2 | jane@grocery.com | Password@123 |

---

## 📚 Key Commands

```bash
npm run dev              # Start development
npm run build           # Build for production
npm start               # Start production server

npm run db:push         # Sync database
npm run db:migrate      # Run migrations
npm run db:seed         # Load sample data
npm run db:studio       # Open database GUI (http://localhost:5555)

npm run lint            # Check code
npm run type-check      # TypeScript check
```

---

## 📁 Important Folders

```
src/
├── app/              # All pages & API routes
├── components/       # Reusable components
├── store/           # State management
├── types/           # TypeScript types
└── utils/           # Helper functions

prisma/
├── schema.prisma    # Database structure
└── seed.ts          # Sample data
```

---

## 🎯 Next Development Tasks

### High Priority
- [ ] Complete product details page
- [ ] Add to cart full flow
- [ ] Payment integration
- [ ] Checkout completion
- [ ] Admin product management

### Medium Priority
- [ ] Order tracking
- [ ] User profile
- [ ] Address management
- [ ] CSV/Excel import
- [ ] Email notifications

### Lower Priority
- [ ] Recommendations
- [ ] Loyalty program
- [ ] Live chat
- [ ] Advanced analytics

---

## 🔗 Useful Links

| Resource | URL |
|----------|-----|
| Development Server | http://localhost:3000 |
| Database UI | http://localhost:5555 |
| Next.js Docs | https://nextjs.org/docs |
| Prisma Docs | https://www.prisma.io/docs |
| Tailwind Docs | https://tailwindcss.com/docs |

---

## 📝 Documentation Files

| File | Purpose |
|------|---------|
| README.md | Complete documentation |
| SETUP.md | Installation guide |
| DEPLOYMENT.md | Deployment options |
| PROJECT_OVERVIEW.md | Features & status |
| DELIVERY_SUMMARY.md | What was built |

---

## 🆘 Troubleshooting

### Port 3000 in use?
```bash
npm run dev -- -p 3001
```

### Database connection error?
```bash
# Verify PostgreSQL is running
psql -U postgres -h localhost -c "SELECT 1"
```

### NextAuth not working?
- Check NEXTAUTH_SECRET is set
- Verify NEXTAUTH_URL is correct
- Clear browser cookies
- Restart dev server

### Build errors?
```bash
npm run type-check  # Check TS errors
npm run lint        # Check lint errors
```

---

## 🎨 Customization

### Brand Name
Edit `src/components/layout/header.tsx` and `README.md`

### Colors
Edit `tailwind.config.ts` - primary/secondary colors

### Font
Edit `src/app/layout.tsx` - font imports

### Database
Change `provider` in `prisma/schema.prisma`

---

## 🚀 Deployment

### Quick Deploy (Vercel)
```bash
git push origin main  # Auto-deploys to Vercel
```

### Docker Deploy
```bash
docker-compose up -d
```

### Manual Server
See DEPLOYMENT.md for detailed instructions

---

## 💡 Tips

1. **Use Prisma Studio**: `npm run db:studio` to view/edit data
2. **Type Safety**: Let TypeScript guide you
3. **Component Reuse**: Check `src/components/ui/`
4. **State Patterns**: See `src/store/` for examples
5. **API Examples**: Check `src/app/api/`

---

## ✅ Verification Checklist

After setup, verify:
- [ ] App loads at localhost:3000
- [ ] Can see products on homepage
- [ ] Can login with test credentials
- [ ] Can add items to cart
- [ ] Dark mode toggle works
- [ ] Database has 50+ products
- [ ] Admin dashboard accessible

---

## 📞 Need Help?

1. Check documentation files (README.md, etc.)
2. Review error messages in terminal
3. Check Prisma Studio for data issues
4. Look at similar implementations in codebase

---

## 🎉 Ready to Code!

You have everything needed. Start with:

```bash
npm run dev
```

Then open: **http://localhost:3000**

**Happy Coding! 🚀**
