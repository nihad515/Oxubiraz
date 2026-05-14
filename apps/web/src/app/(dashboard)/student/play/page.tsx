import { redirect } from 'next/navigation';

// Canonical URL is /student/game — keep /student/play as a redirect for old links
export default function PlayPage() {
  redirect('/student/game');
}
