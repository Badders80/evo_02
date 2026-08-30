import { redirect } from 'next/navigation';

/**
 * /login → /auth/login (pass-3).
 * The sign-in experience moved to /auth/login for prod parity; this redirect
 * keeps legacy links (middleware, bookmarks, robots, old emails) working.
 */
export default function LoginPage() {
  redirect('/auth/login');
}
