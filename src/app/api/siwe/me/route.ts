import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function GET() {
  const session = await getSession();

  if (!session.address) {
    return NextResponse.json(
      { address: null },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  }

  return NextResponse.json(
    { address: session.address },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  );
}
