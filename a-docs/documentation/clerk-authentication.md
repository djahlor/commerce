# Clerk Authentication Guide

This guide explains how to use Clerk authentication in Next.js components and pages, with examples from our implementation.

## Table of Contents

1. [Setup and Configuration](#setup-and-configuration)
2. [Authentication in Server Components](#authentication-in-server-components)
3. [Authentication in Client Components](#authentication-in-client-components)
4. [Route Protection with Middleware](#route-protection-with-middleware)
5. [Account Linking](#account-linking)
6. [Conditional Rendering](#conditional-rendering)
7. [UI Components](#ui-components)
8. [Best Practices](#best-practices)

## Setup and Configuration

To get started with Clerk authentication:

1. Install the Clerk package:
   ```bash
   pnpm add @clerk/nextjs
   ```

2. Set up environment variables in `.env.local`:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```

3. Wrap your root layout with `ClerkProvider`:
   ```tsx
   // app/layout.tsx
   import { ClerkProvider } from '@clerk/nextjs';
   import { dark } from '@clerk/themes';

   export default function RootLayout({
     children
   }: {
     children: React.ReactNode;
   }) {
     return (
       <html lang="en">
         <body>
           <ClerkProvider appearance={{ baseTheme: dark }}>
             {children}
           </ClerkProvider>
         </body>
       </html>
     );
   }
   ```

## Authentication in Server Components

For server components, use the `auth()` function from `@clerk/nextjs/server`:

```tsx
// Server Component
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function ProtectedServerComponent() {
  const { userId } = await auth();
  
  // Redirect to login if not authenticated
  if (!userId) {
    redirect('/login');
  }
  
  return <div>Protected content for user {userId}</div>;
}
```

For more detailed user information, you can use `currentUser()`:

```tsx
import { currentUser } from '@clerk/nextjs/server';

export default async function ProfilePage() {
  const user = await currentUser();
  
  if (!user) {
    return <div>Not authenticated</div>;
  }
  
  return (
    <div>
      <h1>Welcome, {user.firstName}!</h1>
      <p>Email: {user.emailAddresses[0]?.emailAddress}</p>
    </div>
  );
}
```

## Authentication in Client Components

For client components, use Clerk's React hooks:

### `useUser` Hook

```tsx
"use client"

import { useUser } from '@clerk/nextjs';

export default function ProfileClientComponent() {
  const { user, isLoaded } = useUser();
  
  // Handle loading state
  if (!isLoaded) {
    return <div>Loading...</div>;
  }
  
  // Handle unauthenticated state
  if (!user) {
    return <div>Please sign in</div>;
  }
  
  return (
    <div>
      <h1>Hello, {user.firstName}!</h1>
      <p>Email: {user.primaryEmailAddress?.emailAddress}</p>
    </div>
  );
}
```

### `useAuth` Hook

The `useAuth` hook provides authentication state:

```tsx
"use client"

import { useAuth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const { userId, isSignedIn } = useAuth();
  
  // Redirect to login if not authenticated
  if (!userId) {
    redirect('/login');
  }

  return (
    <div className="dashboard-layout">
      {children}
    </div>
  );
}
```

## Route Protection with Middleware

To protect routes at the middleware level:

```tsx
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/products',
  '/search',
  '/about', 
  '/api/webhooks/polar',
  '/success',
  '/api(.*)',
  '/product(.*)',
  '/search/(.*)',
]);

export default clerkMiddleware((auth, req) => {
  // If the route is not public, protect it
  if (!isPublicRoute(req)) {
    auth.protect();
  }
});

export const config = {
  // Protects all routes, including api/trpc
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
```

## Account Linking

To link authenticated users with data from other sources (like purchases made via email):

1. Create a server action for linking:

```tsx
// actions/clerk-actions.ts
'use server';

import { linkClerkUserToPurchasesAction } from "@/actions/db/profiles-actions";
import { ActionState } from "@/types";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function linkClerkUserAction(): Promise<ActionState<{ updatedCount: number }>> {
  try {
    // Get the current authenticated user
    const session = await auth();
    const userId = session.userId;
    
    if (!userId) {
      return {
        isSuccess: false,
        message: "You must be signed in to perform this action."
      };
    }
    
    // Get user details from Clerk to access their email
    const user = await currentUser();
    if (!user) {
      return {
        isSuccess: false,
        message: "Unable to retrieve user details."
      };
    }
    
    // Get primary email
    const primaryEmail = user.emailAddresses.find(
      email => email.id === user.primaryEmailAddressId
    );
    
    if (!primaryEmail) {
      return {
        isSuccess: false,
        message: "No primary email found for this user."
      };
    }
    
    // Link user to purchases with this email
    const result = await linkClerkUserToPurchasesAction(userId, primaryEmail.emailAddress);
    
    return {
      isSuccess: true,
      message: `Successfully linked ${result.data.updatedCount} purchases to your account.`,
      data: result.data
    };
  } catch (error) {
    console.error('Error in linkClerkUserAction:', error);
    return {
      isSuccess: false,
      message: "An unexpected error occurred. Please try again later."
    };
  }
}
```

2. Create a client component that automatically links accounts upon dashboard access:

```tsx
// components/dashboard/account-linker.tsx
"use client"

import { linkClerkUserAction } from "@/actions/clerk-actions"
import { useUser } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function AccountLinker() {
  const { user, isLoaded } = useUser()
  const [hasLinked, setHasLinked] = useState(false)

  useEffect(() => {
    // Only attempt to link if user data is loaded and we haven't already linked
    if (isLoaded && user && !hasLinked) {
      const linkAccounts = async () => {
        try {
          const result = await linkClerkUserAction()
          
          if (result.isSuccess && result.data && result.data.updatedCount > 0) {
            toast.success(result.message || "Successfully linked your purchases!")
          }
          
          // Mark as linked regardless of success to prevent repeated attempts
          setHasLinked(true)
        } catch (error) {
          console.error("Error linking accounts:", error)
          // Don't show error toast to avoid confusion for users with no purchases
          setHasLinked(true)
        }
      }
      
      linkAccounts()
    }
  }, [isLoaded, user, hasLinked])

  // This component doesn't render anything visible
  return null
}
```

3. Include the `AccountLinker` component in your dashboard layout:

```tsx
// app/(auth)/dashboard/layout.tsx
"use client"

import AccountLinker from '@/components/dashboard/account-linker'
import DashboardSidebar from '@/components/dashboard/sidebar'
import { useAuth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const { userId } = useAuth()
  
  // Redirect to login if not authenticated
  if (!userId) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen">
      {/* AccountLinker handles linking purchases to the user's account */}
      <AccountLinker />
      <DashboardSidebar />
      <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
```

## Conditional Rendering

You can conditionally render content based on authentication state:

```tsx
"use client"

import { SignedIn, SignedOut } from '@clerk/nextjs'

export default function ConditionalComponent() {
  return (
    <>
      <SignedIn>
        {/* Content only visible to signed-in users */}
        <p>You are signed in!</p>
      </SignedIn>
      
      <SignedOut>
        {/* Content only visible to signed-out users */}
        <p>Please sign in to access this content</p>
      </SignedOut>
    </>
  )
}
```

## UI Components

Clerk provides ready-to-use authentication UI components:

### Sign In Page

```tsx
// app/(auth)/login/[[...login]]/page.tsx
"use client"

import { SignIn } from "@clerk/nextjs"
import { dark } from "@clerk/themes"
import { useTheme } from "next-themes"

export default function LoginPage() {
  const { theme } = useTheme()

  return (
    <SignIn
      forceRedirectUrl="/"
      appearance={{ baseTheme: theme === "dark" ? dark : undefined }}
    />
  )
}
```

### Sign Up Page

```tsx
// app/(auth)/signup/[[...signup]]/page.tsx
"use client"

import { SignUp } from "@clerk/nextjs"
import { dark } from "@clerk/themes"
import { useTheme } from "next-themes"

export default function SignUpPage() {
  const { theme } = useTheme()

  return (
    <SignUp
      forceRedirectUrl="/"
      appearance={{ baseTheme: theme === "dark" ? dark : undefined }}
    />
  )
}
```

### User Button

Add the Clerk `UserButton` to your navigation:

```tsx
"use client"

import { UserButton } from "@clerk/nextjs"

export default function NavBar() {
  return (
    <nav>
      <div className="flex items-center gap-4">
        {/* Your navigation links */}
        <UserButton afterSignOutUrl="/" />
      </div>
    </nav>
  )
}
```

## Best Practices

1. **Metadata Handling**: When using client components with Next.js metadata, separate the metadata into its own file:

```tsx
// app/(auth)/dashboard/metadata.tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Your account dashboard and reports',
}
```

2. **Loading States**: Always handle loading states in client components:

```tsx
if (!isLoaded) {
  return <div>Loading...</div>
}
```

3. **Error Handling**: Implement proper error handling for authentication actions:

```tsx
try {
  // Authentication action
} catch (error) {
  console.error("Authentication error:", error)
  // Show user-friendly error message
}
```

4. **Route Organization**: Consider organizing protected routes in a separate route group like `app/(auth)/`:

```
app/
├── (auth)/
│   ├── dashboard/
│   ├── login/
│   └── signup/
└── (marketing)/
    ├── products/
    └── about/
```

5. **Server vs. Client Authentication**: Choose the appropriate authentication method:
   - Use server-side `auth()` for Server Components and Server Actions
   - Use client-side hooks (`useUser`, `useAuth`) for Client Components
   - Use middleware for global route protection

By following these patterns, you can implement a robust authentication system in your Next.js application using Clerk. 