import StellarSdk from '@stellar/stellar-sdk';
const { rpc } = StellarSdk;
import dotenv from 'dotenv';

dotenv.config();

const CONTRACT_ID = process.env.CONTRACT_ID || 'CDN5LREO43VK4KKCZXAEML7P4FYSJ2YYX2QELRALPC76ZELS2QME54EG';
const RPC_URL = process.env.RPC_URL || 'https://soroban-testnet.stellar.org';
const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;

const server = new rpc.Server(RPC_URL);

// Cache for campaigns (30 second TTL)
let campaignsCache = null;
let cacheTimestamp = 0;
const CACHE_TTL = 30000;

export async function getAllCampaigns() {
  if (campaignsCache && Date.now() - cacheTimestamp < CACHE_TTL) {
    return campaignsCache;
  }

  try {
    const contract = new StellarSdk.Contract(CONTRACT_ID);
    const dummyAccount = new StellarSdk.Account(
      'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF',
      '0'
    );

    const transaction = new StellarSdk.TransactionBuilder(dummyAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(contract.call('get_all_campaigns'))
      .setTimeout(30)
      .build();

    const simResult = await server.simulateTransaction(transaction);

    if (rpc.Api.isSimulationSuccess(simResult)) {
      const resultValue = simResult.result?.retval;
      if (resultValue) {
        const nativeResult = StellarSdk.scValToNative(resultValue);
        const campaigns = Array.isArray(nativeResult) ? nativeResult.map(c => ({
          id: Number(c.id),
          creator: c.creator,
          title: c.title,
          targetAmount: String(c.target_amount),
          totalDonated: String(c.total_donated),
          status: c.status === 0 ? 'Open' : c.status === 1 ? 'Funded' : 'Closed',
          endTime: Number(c.end_time || 0)
        })) : [];

        campaignsCache = campaigns;
        cacheTimestamp = Date.now();
        return campaigns;
      }
    }
    return [];
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return campaignsCache || [];
  }
}

export async function getCampaignById(campaignId) {
  try {
    const contract = new StellarSdk.Contract(CONTRACT_ID);
    const dummyAccount = new StellarSdk.Account(
      'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF',
      '0'
    );

    const transaction = new StellarSdk.TransactionBuilder(dummyAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(contract.call('get_campaign', StellarSdk.nativeToScVal(campaignId, { type: 'u64' })))
      .setTimeout(30)
      .build();

    const simResult = await server.simulateTransaction(transaction);

    if (rpc.Api.isSimulationSuccess(simResult)) {
      const resultValue = simResult.result?.retval;
      if (resultValue) {
        const nativeResult = StellarSdk.scValToNative(resultValue);
        if (nativeResult) {
          return {
            id: Number(nativeResult.id),
            creator: nativeResult.creator,
            title: nativeResult.title,
            targetAmount: String(nativeResult.target_amount),
            totalDonated: String(nativeResult.total_donated),
            status: nativeResult.status === 0 ? 'Open' : nativeResult.status === 1 ? 'Funded' : 'Closed',
            endTime: Number(nativeResult.end_time || 0)
          };
        }
      }
    }
    return null;
  } catch (error) {
    console.error('Error fetching campaign:', error);
    return null;
  }
}

export async function getDonationsByCampaign(campaignId) {
  try {
    const contract = new StellarSdk.Contract(CONTRACT_ID);
    const dummyAccount = new StellarSdk.Account(
      'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF',
      '0'
    );

    const transaction = new StellarSdk.TransactionBuilder(dummyAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(contract.call('get_donations_by_campaign', StellarSdk.nativeToScVal(campaignId, { type: 'u64' })))
      .setTimeout(30)
      .build();

    const simResult = await server.simulateTransaction(transaction);

    if (rpc.Api.isSimulationSuccess(simResult)) {
      const resultValue = simResult.result?.retval;
      if (resultValue) {
        const nativeResult = StellarSdk.scValToNative(resultValue);
        return Array.isArray(nativeResult) ? nativeResult.map(d => ({
          donor: d.donor,
          amount: String(d.amount),
          timestamp: Number(d.timestamp)
        })) : [];
      }
    }
    return [];
  } catch (error) {
    console.error('Error fetching donations:', error);
    return [];
  }
}

export async function getDonationsByWallet(wallet) {
  try {
    const contract = new StellarSdk.Contract(CONTRACT_ID);
    const dummyAccount = new StellarSdk.Account(
      'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF',
      '0'
    );

    const transaction = new StellarSdk.TransactionBuilder(dummyAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(contract.call('get_donations_by_wallet', StellarSdk.Address.fromString(wallet).toScVal()))
      .setTimeout(30)
      .build();

    const simResult = await server.simulateTransaction(transaction);

    if (rpc.Api.isSimulationSuccess(simResult)) {
      const resultValue = simResult.result?.retval;
      if (resultValue) {
        const nativeResult = StellarSdk.scValToNative(resultValue);
        return Array.isArray(nativeResult) ? nativeResult.map(Number) : [];
      }
    }
    return [];
  } catch (error) {
    console.error('Error fetching wallet donations:', error);
    return [];
  }
}
