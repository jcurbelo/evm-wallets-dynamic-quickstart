"use client";

import { useEffect, useRef, useMemo } from "react";
import {
  type Chain,
  useCrossmint,
  useWallet as useCrossmintWallet,
} from "@crossmint/client-sdk-react-ui";
import { EVMChain, EVMWallet, Wallet } from "@crossmint/wallets-sdk";
import {
  getAuthToken,
  useDynamicContext,
  useIsLoggedIn,
} from "@dynamic-labs/sdk-react-core";
import { isEthereumWallet } from "@dynamic-labs/ethereum";
import { Account, Address, SignableMessage } from "viem";

export const useDynamicConnector = () => {
  const { crossmint, experimental_setCustomAuth } = useCrossmint();
  const {
    getOrCreateWallet: getOrCreateCrossmintWallet,
    status: crossmintWalletStatus,
    wallet: crossmintWallet,
  } = useCrossmintWallet();

  const { primaryWallet: dynamicPrimaryWallet, sdkHasLoaded } =
    useDynamicContext();
  const isAuthenticated = useIsLoggedIn();
  const jwt = getAuthToken();

  const isCreatingWallet = useRef(false);

  useEffect(() => {
    experimental_setCustomAuth({
      jwt,
    });
  }, [jwt, experimental_setCustomAuth]);

  useEffect(() => {
    const fetchCrossmintWallet = async () => {
      if (
        !crossmint.jwt ||
        !isAuthenticated ||
        !dynamicPrimaryWallet ||
        !isEthereumWallet(dynamicPrimaryWallet) ||
        !!crossmintWallet ||
        isCreatingWallet.current
      ) {
        return;
      }

      try {
        isCreatingWallet.current = true;
        const dynamicClient = await dynamicPrimaryWallet.getWalletClient();

        await getOrCreateCrossmintWallet({
          chain: process.env.NEXT_PUBLIC_CHAIN as Chain,
          // @ts-ignore todo: fix type issue in Wallets SDK
          signer: {
            type: "external-wallet",
            address: dynamicPrimaryWallet.address,
            viemAccount: {
              ...dynamicClient.account,
              signMessage: async (data: { message: SignableMessage }) => {
                return await dynamicClient.signMessage({
                  message: data.message,
                });
              },
            },
          },
        });
      } catch (error) {
        console.error("Failed to create Crossmint wallet:", error);
      } finally {
        isCreatingWallet.current = false;
      }
    };

    fetchCrossmintWallet();
  }, [
    crossmint.jwt,
    isAuthenticated,
    dynamicPrimaryWallet,
    getOrCreateCrossmintWallet,
  ]);

  // Memoize the EVMWallet creation to prevent infinite re-renders
  const memoizedCrossmintWallet = useMemo(() => {
    if (!crossmintWallet) return undefined;
    return EVMWallet.from(crossmintWallet as unknown as Wallet<EVMChain>);
  }, [crossmintWallet]);

  return {
    dynamicPrimaryWallet,
    crossmintWallet: memoizedCrossmintWallet,
    crossmintWalletStatus,
    isLoading: crossmintWalletStatus === "in-progress" || !sdkHasLoaded,
  };
};
