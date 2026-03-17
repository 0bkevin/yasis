import { NextResponse } from 'next/server';
import { generateNonce } from 'siwe';
import { getSession } from '@/lib/session';

export async function GET() {
  const session = await getSession();

  if (!session.nonce) {
    session.nonce = generateNonce();
  }

  await session.save();
  
  return NextResponse.json(
    { nonce: session.nonce },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  );
}
