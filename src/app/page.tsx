import { redirect } from 'next/navigation';

export default function HomePage() {
  // Check session on server — for now, redirect to login
  // In production, check cookie/token here
  redirect('/login');
}
