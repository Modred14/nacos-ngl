import { NextResponse } from 'next/server';
import { createResponse, getQuestionById } from '@/lib/db';

// Simple in-memory rate limiting (per question, no IP stored)
const rateLimitMap = new Map();

function isRateLimited(key) {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequests = 5;

  const requests = rateLimitMap.get(key) || [];
  const recent = requests.filter(t => now - t < windowMs);

  if (recent.length >= maxRequests) return true;

  recent.push(now);
  rateLimitMap.set(key, recent);

  if (rateLimitMap.size > 10000) {
    for (const [k, v] of rateLimitMap) {
      if (v.every(t => now - t > windowMs)) rateLimitMap.delete(k);
    }
  }
  return false;
}

export async function POST(request) {
  try {
    const { questionId, content } = await request.json();

    if (!questionId || !content) {
      return NextResponse.json({ error: 'Question ID and content are required' }, { status: 400 });
    }
    if (typeof content !== 'string' || content.trim().length < 5) {
      return NextResponse.json({ error: 'Response must be at least 5 characters' }, { status: 400 });
    }
    if (content.trim().length > 2000) {
      return NextResponse.json({ error: 'Response is too long (max 2000 characters)' }, { status: 400 });
    }

    if (isRateLimited(`q_${questionId}`)) {
      return NextResponse.json(
        { error: 'Too many responses. Please wait a moment before submitting again.' },
        { status: 429 }
      );
    }

    // await — db is now async
    const question = await getQuestionById(questionId);
    if (!question || !question.is_active) {
      return NextResponse.json({ error: 'Question not found or is no longer active' }, { status: 404 });
    }

    const response = await createResponse(questionId, content.trim());
    if (!response) {
      return NextResponse.json({ error: 'Failed to save response' }, { status: 500 });
    }

    return NextResponse.json({ success: true, responseId: response.id }, { status: 201 });
  } catch (error) {
    console.error('Response submission error:', error);
    return NextResponse.json({ error: 'Failed to submit response' }, { status: 500 });
  }
}