import { NextResponse } from 'next/server';
import { getCategoriesWithStats } from '@/lib/queries/categories';

export async function GET() {
  try {
    const categories = await getCategoriesWithStats();
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json([], { status: 500 });
  }
}

