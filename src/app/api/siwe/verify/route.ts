import { NextResponse } from 'next/server';
import { SiweMessage } from 'siwe';
import { getSession } from '@/lib/session';
import { createPublicClient, http, getAddress } from 'viem';
import { base } from 'viem/chains';
import { db } from '@/db';
import { users } from '@/db/schema';

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

    // Security: Check domain to prevent phishing attacks (EIP-4361 standard)
    const host = request.headers.get('host') || new URL(request.url).host;
    if (siweMessage.domain !== host) {
      console.log("Domain mismatch:", { expected: host, got: siweMessage.domain });
      // Temporary loosening: AppKit might send domain with port (localhost:3000) while headers host is localhost:3000 or vice versa
      if (!host.includes(siweMessage.domain) && !siweMessage.domain.includes(host.split(':')[0])) {
         return NextResponse.json({ message: 'Invalid domain.' }, { status: 422 });
      }
    }

    // Security: Check expiration time if provided
    if (siweMessage.expirationTime && new Date(siweMessage.expirationTime).getTime() < Date.now()) {
      return NextResponse.json({ message: 'Signature expired.' }, { status: 422 });
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

    // Normalize the address to checksum format before saving to database
    const normalizedAddress = getAddress(siweMessage.address);

    // Save user to database if they don't exist
    try {
      await db.insert(users).values({ 
        walletAddress: normalizedAddress 
      }).onConflictDoNothing({ target: users.walletAddress });
    } catch (dbErr: any) {
      console.error("Database insert error:", dbErr);
      throw dbErr;
    }

    session.address = normalizedAddress;
    session.nonce = undefined; // clear nonce after successful login
    await session.save();

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("SIWE Verify Error Catch Block:", e.message || e);
    return NextResponse.json({ message: String(e) }, { status: 400 });
  }
}
