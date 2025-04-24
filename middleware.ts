/*
Contains middleware for protecting routes, checking user authentication, and redirecting as needed.
*/

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define routes that should be public
const isPublicRoute = createRouteMatcher([
  '/',
  '/products',
  '/product/(.*)',
  '/search',
  '/about', 
  '/api/webhooks/polar',
  '/login',
  '/signup',
  '/success'
]);

export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) {
    auth.protect();
  }
});

export const config = {
  // Protects all routes, including api/trpc.
  // See https://clerk.com/docs/references/nextjs/auth-middleware
  // for more information about configuring your middleware
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}; 