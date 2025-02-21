import { SnowstormSDK } from '@snowballmoney/mns-sdk';
import { NETWORKS, formatCAIP2, NAMESPACES } from '@snowballmoney/chain-agnostic-utils';
import type {
  OnNameLookupHandler,
  OnTransactionHandler,
} from '@metamask/snaps-sdk';
import { panel, heading, text, row, address } from '@metamask/snaps-sdk';

const sdk = new SnowstormSDK({
  baseUrl: 'https://api.modular.name/public/api',
});

export const onNameLookup: OnNameLookupHandler = async (request) => {
  const { address: addressRequest, domain, chainId } = request;

  alert('onTransaction');
  console.log('onNameLookup', request);
  try {
    if (addressRequest) {
      const identityName = await sdk.getIdentityName(
        addressRequest,
        formatCAIP2(NAMESPACES.EVM, chainId)
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

    const identityAddress = await sdk.getIdentityAddress(
      domain,
      formatCAIP2(NAMESPACES.EVM, chainId)
    );
    if (identityAddress) {
      return {
        resolvedAddresses: [
          {
            resolvedAddress: identityAddress.resolverAddress,
            domainName: domain,
            protocol: 'Snowstorm',
          },
        ],
      };
    }

    return null;
  } catch (error) {
    console.error('Snowstorm resolution error:', error);
    return null;
  }
};

export const onTransaction: OnTransactionHandler = async ({ transaction, chainId }) => {
  console.log('onTransaction', transaction, chainId);
  alert('onTransaction');
  if (transaction.to) {
    try {
      const identityName = await sdk.getIdentityName(
        transaction.to,
        formatCAIP2(NAMESPACES.EVM, chainId)
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