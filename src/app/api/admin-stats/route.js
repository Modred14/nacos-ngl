import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getStats } from '@/lib/db';

export async function GET() {
  const authed = await isAuthenticated();
  if (!authed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const stats = await getStats();
    return NextResponse.json({ stats });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}