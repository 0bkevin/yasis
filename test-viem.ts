import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';

async function run() {
  const client = createPublicClient({ chain: mainnet, transport: http() });
  console.log(typeof client.verifySiweMessage);
}
run();
