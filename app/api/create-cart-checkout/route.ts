import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Request body:', body);

    const { items } = body ?? {};
    if (!items) {
      throw new Error('Items missing!');
    }

    console.log('Items processed:', items);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Function error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
