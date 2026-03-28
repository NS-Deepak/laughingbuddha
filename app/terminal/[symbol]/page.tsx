import { redirect } from 'next/navigation';

export default function TerminalPageRedirect() {
  redirect('/dashboard');
}
