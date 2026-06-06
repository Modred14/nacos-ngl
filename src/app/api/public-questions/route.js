import { NextResponse } from 'next/server';
import { getActiveQuestions } from '@/lib/db';

export async function GET() {
  try {
    const questions = await getActiveQuestions();
    return NextResponse.json({ questions });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }
}