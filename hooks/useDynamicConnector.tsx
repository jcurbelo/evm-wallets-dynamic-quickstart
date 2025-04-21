"use client";

import { useEffect } from "react";
import {
  useCrossmint,
  useWallet as useCrossmintWallet,
  type EVMSmartWalletChain,
} from "@crossmint/client-sdk-react-ui";
import {
  getAuthToken,
  useDynamicContext,
  useIsLoggedIn,
} from "@dynamic-labs/sdk-react-core";
import { isEthereumWallet } from "@dynamic-labs/ethereum";
import { SignableMessage } from "viem";

export const useDynamicConnector = () => {
  const { crossmint, setJwt } = useCrossmint();
  const {
    getOrCreateWallet: getOrCreateCrossmintWallet,
    status: crossmintWalletStatus,
    error: crossmintWalletError,
    wallet: crossmintWallet,
  } = useCrossmintWallet();

  const { primaryWallet: dynamicPrimaryWallet, sdkHasLoaded } =
    useDynamicContext();
  const isAuthenticated = useIsLoggedIn();
  const jwt = getAuthToken();

  useEffect(() => {
    setJwt(jwt);
  }, [jwt]);

  useEffect(() => {
    const fetchCrossmintWallet = async () => {
      if (
        !crossmint.jwt ||
        !isAuthenticated ||
        !dynamicPrimaryWallet ||
        !isEthereumWallet(dynamicPrimaryWallet)
      ) {
        return null;
      }

      try {
        const dynamicClient = await dynamicPrimaryWallet.getWalletClient();
        await getOrCreateCrossmintWallet({
          type: "evm-smart-wallet",
          args: {
            chain: process.env.NEXT_PUBLIC_CHAIN_ID as EVMSmartWalletChain,
            adminSigner: {
              address: dynamicPrimaryWallet.address,
              type: "evm-keypair",
              signer: {
                type: "viem_v2",
                // @ts-ignore todo: fix type issue in Wallets SDK
                account: {
                  ...dynamicClient.account,
                  signMessage: async (data: { message: SignableMessage }) => {
                    return await dynamicClient.signMessage({
                      message: data.message,
                    });
                  },
                },
              },
            },
          },
        });
      } catch (error) {
        console.error("Failed to create Crossmint wallet:", error);
      }
    };

    fetchCrossmintWallet();
  }, [jwt, isAuthenticated, dynamicPrimaryWallet, crossmint.jwt]);

  return {
    dynamicPrimaryWallet,
    crossmintWallet,
    crossmintWalletStatus,
    crossmintWalletError,
    isLoading: crossmintWalletStatus === "in-progress" || !sdkHasLoaded,
  };
};
