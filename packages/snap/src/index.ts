import { SnowstormSDK } from '@snowballmoney/mns-sdk';
import { NETWORKS, formatCAIP2, NAMESPACES } from '@snowballmoney/chain-agnostic-utils';
import type {
  OnNameLookupHandler,
  OnTransactionHandler,
} from '@metamask/snaps-sdk';
import { panel, heading, text, row, address } from '@metamask/snaps-sdk';

const sdk = new SnowstormSDK({
  baseUrl: 'https://api.modular.name/api/public/',
});

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
          { resolvedDomain: identityName.name, protocol: 'Snowstorm' },
        ],
      };
    }

    if (!domain) {
      return null;
    }
    const domainWithoutAt = domain.startsWith('@') ? domain.slice(1) : domain;
    const identityAddress = await sdk.getIdentityAddress(
      domainWithoutAt,
      chainId
    );
    if (identityAddress) {
      return {
        resolvedAddresses: [
          {
            resolvedAddress: identityAddress.resolverAddress,
            domainName: domain,
            protocol: 'Modular Naming Service',
          },
        ],
      };
    }

    return null;
  } catch (error: any) {
    console.error('Snowstorm resolution error:', error);
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
        content: panel([
          heading('Recipient Insights'),
          row('Identity', text(displayName)),
          row('Address', address(transaction.to as `0x${string}`)),
        ]),
      };
    } catch (error) {
      console.error('Snowstorm transaction lookup error:', error);
    }
  }

  return null;
};