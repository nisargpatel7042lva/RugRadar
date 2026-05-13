const axios = require('axios');

const birdeye = axios.create({
  baseURL: 'https://public-api.birdeye.so',
  headers: {
    'X-API-KEY': process.env.BIRDEYE_API_KEY,
    'x-chain': 'solana',
  },
  timeout: 10000,
});

function log(endpoint) {
  console.log(`[Birdeye] Calling ${endpoint} at ${new Date().toISOString()}`);
}

async function fetchNewListings(limit = 20) {
  // /defi/v3/token/list with sort_by=recent_listing_time gives newest tokens first
  const endpoint = `/defi/v3/token/list?sort_by=recent_listing_time&sort_type=desc&limit=${limit}`;
  log(endpoint);
  try {
    const res = await birdeye.get(endpoint);
    return res.data?.data?.items || res.data?.data || [];
  } catch (err) {
    console.error('[Birdeye] fetchNewListings failed:', err.message);
    return null;
  }
}

async function fetchTokenSecurity(address) {
  const endpoint = `/defi/token_security?address=${address}`;
  log(endpoint);
  try {
    const res = await birdeye.get(endpoint);
    return res.data?.data || null;
  } catch (err) {
    if (err.response?.status === 401) {
      // token_security is restricted on this plan — return sentinel so caller can apply fallback
      return { _restricted: true };
    }
    console.error(`[Birdeye] fetchTokenSecurity failed for ${address}:`, err.message);
    return null;
  }
}

async function fetchTokenOverview(address) {
  const endpoint = `/defi/token_overview?address=${address}`;
  log(endpoint);
  try {
    const res = await birdeye.get(endpoint);
    return res.data?.data || null;
  } catch (err) {
    console.error(`[Birdeye] fetchTokenOverview failed for ${address}:`, err.message);
    return null;
  }
}

async function fetchTrending(limit = 20) {
  const endpoint = `/defi/token_trending?sort_by=rank&limit=${limit}`;
  log(endpoint);
  try {
    const res = await birdeye.get(endpoint);
    return res.data?.data?.tokens || res.data?.data || [];
  } catch (err) {
    console.error('[Birdeye] fetchTrending failed:', err.message);
    return null;
  }
}

async function fetchPriceVolume(address) {
  const endpoint = `/defi/price_volume/single?address=${address}`;
  log(endpoint);
  try {
    const res = await birdeye.get(endpoint);
    return res.data?.data || null;
  } catch (err) {
    console.error(`[Birdeye] fetchPriceVolume failed for ${address}:`, err.message);
    return null;
  }
}

async function fetchTransactions(address, limit = 10) {
  const endpoint = `/defi/txs/token?address=${address}&limit=${limit}`;
  log(endpoint);
  try {
    const res = await birdeye.get(endpoint);
    return res.data?.data?.items || res.data?.data || [];
  } catch (err) {
    console.error(`[Birdeye] fetchTransactions failed for ${address}:`, err.message);
    return null;
  }
}

async function fetchPrice(address) {
  const endpoint = `/defi/price?address=${address}&include_liquidity=true`;
  log(endpoint);
  try {
    const res = await birdeye.get(endpoint);
    return res.data?.data || null;
  } catch (err) {
    console.error(`[Birdeye] fetchPrice failed for ${address}:`, err.message);
    return null;
  }
}

module.exports = {
  fetchNewListings,
  fetchTokenSecurity,
  fetchTokenOverview,
  fetchTrending,
  fetchPriceVolume,
  fetchTransactions,
  fetchPrice,
};
