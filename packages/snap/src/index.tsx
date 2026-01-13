import { SnowstormSDK } from '@snowballmoney/mns-sdk';
import type {
  OnNameLookupHandler,
  OnTransactionHandler,
} from '@metamask/snaps-sdk';
import { Box, Heading, Text, Row, Address } from '@metamask/snaps-sdk/jsx';

const sdk = new SnowstormSDK({
  baseUrl: 'https://api.modular.name/api/public/',
});

/**
 * Strips any suffix after the dot from a domain name
 * e.g., "supernova.mns" -> "supernova"
 * e.g., "supernova.anything" -> "supernova"
 */
const stripDotSuffix = (domain: string): string => {
  const dotIndex = domain.lastIndexOf('.');
  if (dotIndex > 0) {
    return domain.slice(0, dotIndex);
  }
  return domain;
};

export const onNameLookup: OnNameLookupHandler = async (request) => {
  const { address: addressRequest, domain, chainId } = request;

  try {
    if (addressRequest) {
      const identityName = await sdk.getIdentityName(
        addressRequest,
        chainId
      );
      if (!identityName) {
        return null;
      }

      return {
        resolvedDomains: [
          { resolvedDomain: identityName.name, protocol: 'Modular Naming Service' },
        ],
      };
    }

    if (!domain) {
      return null;
    }

    // Strip @ prefix if present
    let cleanDomain = domain.startsWith('@') ? domain.slice(1) : domain;
    
    // Strip everything after the dot (e.g., "supernova.anything" -> "supernova")
    cleanDomain = stripDotSuffix(cleanDomain);

    const identityAddress = await sdk.getIdentityAddress(
      cleanDomain,
      chainId
    );
    
    if (identityAddress) {
      return {
        resolvedAddresses: [
          {
            resolvedAddress: identityAddress.resolverAddress,
            domainName: domain, // Keep original domain for display
            protocol: 'Modular Naming Service',
          },
        ],
      };
    }

    return null;
  } catch (error: unknown) {
    console.error('MNS resolution error:', error);
    return null;
  }
};


export const onTransaction: OnTransactionHandler = async ({ transaction, chainId }) => {
  if (transaction.to) {
    try {
      const identityName = await sdk.getIdentityName(
        transaction.to,
        chainId
      );
      const displayName = identityName.name ?? 'n/a';

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
    } catch (error: unknown) {
      console.error('Snowstorm transaction lookup error:', error);
      return {
        content: (
          <Box>
            <Heading>Recipient Insights</Heading>
            <Row label="Identity">
              <Text>{String(error)}</Text>
            </Row>
            <Row label="Address">
              <Address address={transaction.to as `0x${string}`} />
            </Row>
          </Box>
        ),
      };
    }
  }

  return null;
};
