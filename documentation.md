# MetaMask Snap UI Upgrade Documentation

## Overview

This document describes the migration from the legacy function-based UI components to the new JSX-based UI system introduced by MetaMask.

## Changes Made

### 1. Package Upgrades

The following packages have been upgraded to their latest versions:

| Package | Previous Version | New Version |
|---------|-----------------|-------------|
| @metamask/snaps-sdk | 6.16.0 | ^10.3.0 |
| @metamask/snaps-cli | 6.6.0 | ^8.3.0 |
| @metamask/snaps-jest | 8.9.0 | ^9.7.0 |
| @metamask/providers | ^16.0.0 | ^22.1.1 |
| typescript | ^4.7.4 | ^5.4.0 |
| prettier | ^2.7.1 | ^3.2.0 |
| styled-components | 5.3.3 | ^6.1.0 |

### 2. UI Migration: Function-Based to JSX

#### Before (Deprecated)
```typescript
import { panel, heading, text, row, address } from '@metamask/snaps-sdk';

return {
  content: panel([
    heading('Recipient Insights'),
    row('Identity', text(displayName)),
    row('Address', address(transaction.to)),
  ]),
};
```

#### After (New JSX-Based)
```tsx
import { Box, Heading, Text, Row, Address } from '@metamask/snaps-sdk/jsx';

return {
  content: (
    <Box>
      <Heading>Recipient Insights</Heading>
      <Row label="Identity">
        <Text>{displayName}</Text>
      </Row>
      <Row label="Address">
        <Address address={transaction.to as `0x${string}`} />
      </Row>
    </Box>
  ),
};
```

### 3. File Changes

- **Renamed**: `packages/snap/src/index.ts` → `packages/snap/src/index.tsx`
- **Updated**: `packages/snap/snap.config.ts` - Changed input path to `index.tsx`
- **Updated**: `packages/snap/snap.manifest.json` - Updated platformVersion to 10.3.0

### 4. TypeScript Configuration

The `tsconfig.json` was already configured for JSX support:
```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@metamask/snaps-sdk"
  },
  "include": ["**/*.ts", "**/*.tsx"]
}
```

## Key JSX Components Available

The new JSX UI system provides these components from `@metamask/snaps-sdk/jsx`:

| Component | Description |
|-----------|-------------|
| `<Box>` | Container element (replaces `panel`) |
| `<Heading>` | Header text |
| `<Text>` | Regular text content |
| `<Row>` | Key-value display with `label` prop |
| `<Address>` | Ethereum address display with `address` prop |
| `<Button>` | Interactive button |
| `<Input>` | Form input field |
| `<Form>` | Form container |
| `<Divider>` | Visual separator |
| `<Image>` | Image display |
| `<Link>` | Hyperlink |
| `<Bold>` / `<Italic>` | Text formatting |

## MetaMask UI Changes (2024-2025)

MetaMask has introduced significant UI updates:

1. **Multichain Support**: Native support for Bitcoin and Solana
2. **Redesigned Interface**: New home screen displaying assets across networks
3. **Signature Request Redesign**: Improved readability for signature requests
4. **Design Tokens**: New standardized design tokens for consistency

## Name Resolution Configuration

The snap accepts **any domain-like input** (anything with a dot). The suffix after the dot is stripped before looking up the name in MNS.

### How It Works

| User Types | API Looks Up |
|------------|--------------|
| `supernova.mns` | `supernova` |
| `supernova.x` | `supernova` |
| `supernova.anything` | `supernova` |
| `alice.crypto` | `alice` |

### MetaMask Limitation

**Important**: MetaMask's name-lookup system only triggers for domain-like text (patterns with a dot). Plain names without any suffix are NOT sent to snaps for resolution.

**Recommended approach**: Instruct users to add any suffix with a dot:
- `username.mns` (recommended)
- `username.x` (works too)
- `username.` (even just a dot works!)

## Configuration Changes

### snap.config.ts
The `bundler: 'webpack'` option was **removed** as it's no longer supported in `@metamask/snaps-cli` v8+.

### styled-components
Kept at **v5.3.11** for Gatsby compatibility. Version 6.x has compatibility issues with `gatsby-plugin-styled-components`.

Added `babel-plugin-styled-components` as a required dev dependency.

## Testing

After installation, run:
```bash
yarn install
yarn build
yarn start
```

## Resources

- [MetaMask Snaps Documentation](https://docs.metamask.io/snaps)
- [Custom UI with JSX Guide](https://docs.metamask.io/snaps/features/custom-ui)
- [MetaMask Design Tokens](https://github.com/MetaMask/design-tokens)

