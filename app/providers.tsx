"use client";

import {
  CrossmintProvider,
  CrossmintWalletProvider,
} from "@crossmint/client-sdk-react-ui";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";

const dynamicEnvId = process.env.NEXT_PUBLIC_DYNAMIC_ENV_ID ?? "";
const crossmintApiKey = process.env.NEXT_PUBLIC_CROSSMINT_API_KEY ?? "";

if (!dynamicEnvId || !crossmintApiKey) {
  throw new Error(
    "NEXT_PUBLIC_DYNAMIC_ENV_ID or NEXT_PUBLIC_CROSSMINT_API_KEY is not set"
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: dynamicEnvId,
        walletConnectors: [EthereumWalletConnectors],
      }}
    >
      <CrossmintProvider apiKey={crossmintApiKey}>
        <CrossmintWalletProvider>{children}</CrossmintWalletProvider>
      </CrossmintProvider>
    </DynamicContextProvider>
  );
}
