import { redirect } from 'next/navigation';

export default function LegacyRequestPage() {
  redirect('/employee/requests/new');
}
