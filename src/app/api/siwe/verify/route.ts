import { NextResponse } from 'next/server';
import { SiweMessage } from 'siwe';
import { getSession } from '@/lib/session';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

export async function POST(request: Request) {
  try {
    const { message, signature } = await request.json();
    const session = await getSession();

    // Reconstruct the message to safely extract the nonce/address
    const siweMessage = new SiweMessage(message);
    
    // Check nonce early
    if (siweMessage.nonce !== session.nonce) {
      console.log("Nonce mismatch:", { expected: session.nonce, got: siweMessage.nonce });
      return NextResponse.json({ message: 'Invalid nonce.' }, { status: 422 });
    }

    // Since you are heavily using Base, Smart Contract Wallets (like Coinbase Smart Wallet)
    // might only be deployed/resolvable on Base. We should verify against the Base chain, 
    // NOT mainnet.
    const publicClient = createPublicClient({
      chain: base,
      transport: http(),
    });

    const isValid = await publicClient.verifyMessage({
      address: siweMessage.address as `0x${string}`,
      message: message,
      signature: signature,
    });

    if (!isValid) {
       console.log("Signature verification returned false");
       return NextResponse.json({ message: 'Invalid signature.' }, { status: 400 });
    }

    session.address = siweMessage.address;
    session.nonce = undefined; // clear nonce after successful login
    await session.save();

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("SIWE Verify Error Catch Block:", e.message || e);
    return NextResponse.json({ message: String(e) }, { status: 400 });
  }
}
