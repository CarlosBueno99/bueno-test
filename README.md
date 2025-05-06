# Personal website that I use to play with some tech

This application uses Convex for the backend and Clerk for authentication.

## Setup

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up Clerk:
   - Sign up for [Clerk](https://clerk.com)
   - Create a new application in Clerk
   - In the JWT Templates section of your Clerk dashboard:
     - Click "+ New template" and choose "Convex"
     - Copy the Issuer URL
     - Hit "Apply Changes" (don't rename the JWT token, it must be called `convex`)
   - In the API Keys section of the Clerk dashboard:
     - Copy the Publishable Key
     - Copy the Secret Key

4. Set up environment variables:
   - Create a `.env.local` file with the following:
```
# Convex
NEXT_PUBLIC_CONVEX_URL="your_convex_url"

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
CLERK_ISSUER_URL="https://your-clerk-instance.clerk.accounts.dev/"
```

5. Sync your auth configuration:
```bash
npx convex dev
```

6. Run the development server:
```bash
npm run dev
```

## Features

- User authentication with Clerk
- Role-based access control
- Steam and Spotify data integration
- Dashboard to display user stats

## App Structure

- `app/`: Next.js app directory with pages and layouts
- `components/`: UI components
- `convex/`: Convex backend code including database schema, queries, and mutations
  - `auth.ts`: Authentication logic
  - `schema.ts`: Database schema definition
  - `auth.config.ts`: Authentication configuration for Clerk

## Authentication Flow

1. The user clicks the Sign In button
2. Clerk handles the authentication process
3. After successful authentication, Clerk provides a JWT
4. Convex validates the JWT and identifies the user
5. Based on the user's permissions, different parts of the app are accessible

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
