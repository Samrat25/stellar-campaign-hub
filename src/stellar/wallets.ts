/**
 * Stellar Wallets Kit Integration
 * Handles multi-wallet support for Freighter, Albedo, and xBull
 * LAZY LOADED to improve initial page load
 */

import {
  StellarWalletsKit,
  WalletNetwork,
  FREIGHTER_ID,
  ALBEDO_ID,
  XBULL_ID,
  FreighterModule,
  AlbedoModule,
  xBullModule,
  ISupportedWallet,
} from "@creit.tech/stellar-wallets-kit";

// Lazy initialize the wallet kit only when needed
let _kit: StellarWalletsKit | null = null;

const getKit = () => {
  if (!_kit) {
    _kit = new StellarWalletsKit({
      network: WalletNetwork.TESTNET,
      selectedWalletId: FREIGHTER_ID,
      modules: [
        new FreighterModule(),
        new AlbedoModule(),
        new xBullModule(),
      ],
    });
  }
  return _kit;
};

export const kit = {
  get instance() {
    return getKit();
  }
};

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
  {
    id: XBULL_ID,
    name: "xBull",
    icon: "🐂",
  },
];

// Get current wallet address
export const getWalletAddress = async (): Promise<string | null> => {
  try {
    const { address } = await kit.instance.getAddress();
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
  const { signedTxXdr } = await kit.instance.signTransaction(unsignedTransaction, {
    address,
    networkPassphrase: WalletNetwork.TESTNET,
  });
  return signedTxXdr;
};

// Set the active wallet
export const setWallet = (walletId: string) => {
  kit.instance.setWallet(walletId);
};

// Open the built-in wallet selector modal
export const openWalletModal = async (
  onSelect: (wallet: ISupportedWallet) => void
) => {
  await kit.instance.openModal({
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

// Get wallet balance from Horizon
export const getWalletBalance = async (address: string): Promise<string> => {
  try {
    const response = await fetch(
      `https://horizon-testnet.stellar.org/accounts/${address}`
    );
    
    if (!response.ok) {
      throw new Error("Failed to fetch balance");
    }
    
    const data = await response.json();
    const nativeBalance = data.balances.find(
      (b: any) => b.asset_type === "native"
    );
    
    return nativeBalance ? nativeBalance.balance : "0";
  } catch (error) {
    console.error("Failed to fetch balance:", error);
    return "0";
  }
};

export { FREIGHTER_ID, ALBEDO_ID, XBULL_ID, WalletNetwork };
