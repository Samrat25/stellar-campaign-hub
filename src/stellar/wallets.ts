/**
 * Stellar Wallets Kit Integration
 * Handles multi-wallet support for Freighter and Albedo
 */

import {
  StellarWalletsKit,
  WalletNetwork,
  FREIGHTER_ID,
  ALBEDO_ID,
  FreighterModule,
  AlbedoModule,
  ISupportedWallet,
} from "@creit.tech/stellar-wallets-kit";

// Initialize the wallet kit with Testnet configuration
export const kit = new StellarWalletsKit({
  network: WalletNetwork.TESTNET,
  selectedWalletId: FREIGHTER_ID,
  modules: [new FreighterModule(), new AlbedoModule()],
});

// Wallet metadata for UI display
export const SUPPORTED_WALLETS: { id: string; name: string; icon: string }[] = [
  {
    id: FREIGHTER_ID,
    name: "Freighter",
    icon: "🦊",
  },
  {
    id: ALBEDO_ID,
    name: "Albedo",
    icon: "🌟",
  },
];

// Get current wallet address
export const getWalletAddress = async (): Promise<string | null> => {
  try {
    const { address } = await kit.getAddress();
    return address;
  } catch (error) {
    console.error("Failed to get wallet address:", error);
    return null;
  }
};

// Sign a transaction using the connected wallet
export const signTransaction = async (
  unsignedTransaction: string,
  address: string
): Promise<string> => {
  const { signedTxXdr } = await kit.signTransaction(unsignedTransaction, {
    address,
    networkPassphrase: WalletNetwork.TESTNET,
  });
  return signedTxXdr;
};

// Set the active wallet
export const setWallet = (walletId: string) => {
  kit.setWallet(walletId);
};

// Open the built-in wallet selector modal
export const openWalletModal = async (
  onSelect: (wallet: ISupportedWallet) => void
) => {
  await kit.openModal({
    onWalletSelected: onSelect,
  });
};

// Shorten wallet address for display
export const shortenAddress = (address: string): string => {
  if (!address) return "";
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

// Get network passphrase
export const getNetworkPassphrase = () => WalletNetwork.TESTNET;

export { FREIGHTER_ID, ALBEDO_ID, WalletNetwork };
