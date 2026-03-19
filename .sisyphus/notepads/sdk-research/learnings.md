# SDK Research Learnings

## Yo Protocol Packages

### @yo-protocol/core (v1.0.9)
- npm: https://www.npmjs.com/package/@yo-protocol/core
- Source: yo-xyz/yo-kit (private GitHub repo)
- TypeScript SDK for ERC-4626 yield vault protocol
- Chains: Ethereum (1), Base (8453), Arbitrum (42161)

### @yo-protocol/react (v1.0.6)
- npm: https://www.npmjs.com/package/@yo-protocol/react
- Built on wagmi + TanStack Query
- Provides hooks and providers

## Key Sources
- Official docs: https://docs.yo.xyz/integrations/technical-guides/sdk
- SDK reference: https://yo.xyz/build
- npm registry entries
- GitHub: https://github.com/yoprotocol (smart contracts)
- Smart contract repo: https://github.com/yoprotocol/core (Solidity only)

## Vault Functionality
- ERC-4626 compliant yield vaults
- All deposits/redeems route through YoGateway contract
- Asynchronous redemption (can be instant or queued up to 24hrs)
- 6 supported vaults: yoETH, yoBTC, yoUSD, yoEUR, yoGOLD, yoUSDT

## Integration Patterns
1. SDK (recommended) - @yo-protocol/core
2. YoGateway - single contract for all vaults
3. Individual contracts - ERC-4626 standard
