import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import {
  getAllQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getQuestionById,
} from '@/lib/db';

export async function GET() {
  const authed = await isAuthenticated();
  if (!authed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const questions = await getAllQuestions();
    return NextResponse.json({ questions });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }
}

export async function POST(request) {
  const authed = await isAuthenticated();
  if (!authed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { title, description } = await request.json();

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    if (title.trim().length > 500) {
      return NextResponse.json({ error: 'Title is too long (max 500 characters)' }, { status: 400 });
    }

    const created = await createQuestion(title.trim(), description?.trim() || null);

    if (!created) {
      return NextResponse.json({ error: 'Failed to save question to database' }, { status: 500 });
    }

    // Re-fetch so we get response_count and all computed fields
    const question = await getQuestionById(created.id);

    return NextResponse.json({ question }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create question' }, { status: 500 });
  }
}

export async function PUT(request) {
  const authed = await isAuthenticated();
  if (!authed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id, title, description, is_active } = await request.json();

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const existing = await getQuestionById(id);
    if (!existing) return NextResponse.json({ error: 'Question not found' }, { status: 404 });

    await updateQuestion(id, title.trim(), description?.trim() || null, is_active);

    // Re-fetch to get response_count and all computed fields
    const question = await getQuestionById(id);

    return NextResponse.json({ question });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update question' }, { status: 500 });
  }
}

export async function DELETE(request) {
  const authed = await isAuthenticated();
  if (!authed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const existing = await getQuestionById(id);
    if (!existing) return NextResponse.json({ error: 'Question not found' }, { status: 404 });

    await deleteQuestion(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete question' }, { status: 500 });
  }
}