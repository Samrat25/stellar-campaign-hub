/**
 * Soroban Client Integration
 * Handles all smart contract interactions
 * OPTIMIZED: Lazy-loaded to improve initial page load
 */

import { 
  Contract, 
  SorobanRpc, 
  TransactionBuilder, 
  Networks, 
  BASE_FEE, 
  Address, 
  nativeToScVal, 
  scValToNative, 
  Account 
} from "@stellar/stellar-sdk";
import { signTransaction } from "./wallets";

// Testnet configuration
const TESTNET_RPC_URL = "https://soroban-testnet.stellar.org";
const TESTNET_NETWORK_PASSPHRASE = Networks.TESTNET;

// Contract ID - Replace with your deployed contract address
export const CONTRACT_ID = "CAPP4DRFLGD6SJNAWOFJIRCUKYGGVJZXEIIQRRNABD5VEPK6TUB6VTAG";

// Lazy initialize Soroban RPC server only when needed
let _server: SorobanRpc.Server | null = null;
const getServer = () => {
  if (!_server) {
    _server = new SorobanRpc.Server(TESTNET_RPC_URL);
  }
  return _server;
};

// Transaction status types
export type TransactionStatus = "idle" | "pending" | "success" | "failed";

export interface TransactionResult {
  status: TransactionStatus;
  hash?: string;
  error?: string;
}

// Campaign data structure
export interface Campaign {
  creator: string;
  title: string;
  targetAmount: bigint;
  totalDonated: bigint;
}

/**
 * Create a new crowdfunding campaign
 */
export const createCampaign = async (
  title: string,
  targetAmount: number,
  creatorAddress: string
): Promise<TransactionResult> => {
  try {
    // Check if contract ID is set
    if (CONTRACT_ID === "YOUR_CONTRACT_ID_HERE") {
      throw new Error("Please set CONTRACT_ID in sorobanClient.ts");
    }

    // Get account from network
    const account = await getServer().getAccount(creatorAddress);
    
    // Create contract instance
    const contract = new Contract(CONTRACT_ID);
    
    // Convert target amount to stroops (1 XLM = 10,000,000 stroops)
    const targetInStroops = BigInt(Math.floor(targetAmount * 10_000_000));
    
    // Build transaction
    const transaction = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: TESTNET_NETWORK_PASSPHRASE,
    })
      .addOperation(
        contract.call(
          "create_campaign",
          Address.fromString(creatorAddress).toScVal(),
          nativeToScVal(title, { type: "string" }),
          nativeToScVal(targetInStroops, { type: "i128" })
        )
      )
      .setTimeout(30)
      .build();

    // Prepare transaction (simulate and get auth)
    const preparedTx = await getServer().prepareTransaction(transaction);
    
    // Sign transaction with wallet
    const signedXdr = await signTransaction(preparedTx.toXDR(), creatorAddress);
    const signedTx = TransactionBuilder.fromXDR(
      signedXdr,
      TESTNET_NETWORK_PASSPHRASE
    );

    // Submit transaction
    const sendResponse = await getServer().sendTransaction(signedTx as any);
    
    if (sendResponse.status === "PENDING") {
      // Poll for transaction result
      let result = await getServer().getTransaction(sendResponse.hash);
      
      // Wait for transaction to be processed
      while (result.status === SorobanRpc.Api.GetTransactionStatus.NOT_FOUND) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        result = await getServer().getTransaction(sendResponse.hash);
      }

      if (result.status === SorobanRpc.Api.GetTransactionStatus.SUCCESS) {
        return { 
          status: "success", 
          hash: sendResponse.hash 
        };
      } else {
        return { 
          status: "failed", 
          error: "Transaction failed on network" 
        };
      }
    }

    return { 
      status: "failed", 
      error: sendResponse.errorResult?.toString() || "Transaction failed" 
    };
  } catch (error: any) {
    console.error("Create campaign error:", error);
    
    // Parse error messages
    let errorMessage = "Failed to create campaign";
    if (error.message?.includes("Campaign already exists")) {
      errorMessage = "Campaign already exists. Only one campaign per contract.";
    } else if (error.message?.includes("not found")) {
      errorMessage = "Account not found. Please fund your wallet with testnet XLM.";
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return {
      status: "failed",
      error: errorMessage,
    };
  }
};

/**
 * Donate to an existing campaign
 */
export const donateToCampaign = async (
  amount: number,
  donorAddress: string
): Promise<TransactionResult> => {
  try {
    // Check if contract ID is set
    if (CONTRACT_ID === "YOUR_CONTRACT_ID_HERE") {
      throw new Error("Please set CONTRACT_ID in sorobanClient.ts");
    }

    // Get account from network
    const account = await getServer().getAccount(donorAddress);
    
    // Create contract instance
    const contract = new Contract(CONTRACT_ID);
    
    // Convert amount to stroops
    const amountInStroops = BigInt(Math.floor(amount * 10_000_000));
    
    // Build transaction
    const transaction = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: TESTNET_NETWORK_PASSPHRASE,
    })
      .addOperation(
        contract.call(
          "donate",
          Address.fromString(donorAddress).toScVal(),
          nativeToScVal(amountInStroops, { type: "i128" })
        )
      )
      .setTimeout(30)
      .build();

    // Prepare transaction
    const preparedTx = await getServer().prepareTransaction(transaction);
    
    // Sign transaction with wallet
    const signedXdr = await signTransaction(preparedTx.toXDR(), donorAddress);
    const signedTx = TransactionBuilder.fromXDR(
      signedXdr,
      TESTNET_NETWORK_PASSPHRASE
    );

    // Submit transaction
    const sendResponse = await getServer().sendTransaction(signedTx as any);
    
    if (sendResponse.status === "PENDING") {
      // Poll for transaction result
      let result = await getServer().getTransaction(sendResponse.hash);
      
      while (result.status === SorobanRpc.Api.GetTransactionStatus.NOT_FOUND) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        result = await getServer().getTransaction(sendResponse.hash);
      }

      if (result.status === SorobanRpc.Api.GetTransactionStatus.SUCCESS) {
        return { 
          status: "success", 
          hash: sendResponse.hash 
        };
      } else {
        return { 
          status: "failed", 
          error: "Transaction failed on network" 
        };
      }
    }

    return { 
      status: "failed", 
      error: sendResponse.errorResult?.toString() || "Transaction failed" 
    };
  } catch (error: any) {
    console.error("Donation error:", error);
    
    // Parse error messages
    let errorMessage = "Failed to process donation";
    if (error.message?.includes("Creator cannot donate")) {
      errorMessage = "Creator cannot donate to their own campaign. Please use a different wallet.";
    } else if (error.message?.includes("No campaign exists")) {
      errorMessage = "No campaign exists. Please create a campaign first.";
    } else if (error.message?.includes("not found")) {
      errorMessage = "Account not found. Please fund your wallet with testnet XLM.";
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return {
      status: "failed",
      error: errorMessage,
    };
  }
};

/**
 * Get current campaign data
 */
export const getCampaign = async (): Promise<Campaign | null> => {
  try {
    // Check if contract ID is set
    if (CONTRACT_ID === "YOUR_CONTRACT_ID_HERE") {
      return null;
    }

    // Create contract instance
    const contract = new Contract(CONTRACT_ID);
    
    // Create a dummy account for simulation
    const dummyAccount = new Account(
      "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
      "0"
    );
    
    // Build transaction for simulation
    const transaction = new TransactionBuilder(dummyAccount, {
      fee: BASE_FEE,
      networkPassphrase: TESTNET_NETWORK_PASSPHRASE,
    })
      .addOperation(contract.call("get_campaign"))
      .setTimeout(30)
      .build();

    // Simulate transaction to get result
    const simResult = await getServer().simulateTransaction(transaction);
    
    if (
      simResult.result &&
      SorobanRpc.Api.isSimulationSuccess(simResult)
    ) {
      // Parse the result
      const resultValue = simResult.result.retval;
      
      // Check if campaign exists (Some variant)
      if (resultValue && resultValue.switch().name === "some") {
        const campaignData = resultValue.value();
        
        // Extract campaign fields
        const creator = Address.fromScVal(campaignData.get("creator")!).toString();
        const title = scValToNative(campaignData.get("title")!);
        const targetAmount = scValToNative(campaignData.get("target_amount")!);
        const totalDonated = scValToNative(campaignData.get("total_donated")!);
        
        return {
          creator,
          title,
          targetAmount: BigInt(targetAmount),
          totalDonated: BigInt(totalDonated),
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error("Get campaign error:", error);
    return null;
  }
};

/**
 * Convert stroops to XLM for display
 */
export const stroopsToXLM = (stroops: bigint): number => {
  return Number(stroops) / 10_000_000;
};

/**
 * Convert XLM to stroops
 */
export const xlmToStroops = (xlm: number): bigint => {
  return BigInt(Math.floor(xlm * 10_000_000));
};

/**
 * Get wallet balance from Horizon
 */
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

/**
 * Get campaign progress percentage
 */
export const getCampaignProgress = (campaign: Campaign | null): number => {
  if (!campaign || campaign.targetAmount === BigInt(0)) {
    return 0;
  }
  
  const progress = (Number(campaign.totalDonated) / Number(campaign.targetAmount)) * 100;
  return Math.min(Math.round(progress), 100);
};

/**
 * Check if campaign target is reached
 */
export const isTargetReached = (campaign: Campaign | null): boolean => {
  if (!campaign) return false;
  return campaign.totalDonated >= campaign.targetAmount;
};

