const express = require('express');
const router = express.Router();
const {
  fetchNewListings,
  fetchTokenSecurity,
  fetchTokenOverview,
  fetchTrending,
  fetchTransactions,
  fetchPrice,
} = require('../utils/birdeye');
const { computeRugScore } = require('../utils/rugScore');
const { sendRugAlert } = require('../utils/telegram');

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// In-memory store for tokens that scored >= 80 (cleared on restart, acceptable for demo)
const rugDetections = [];
const detectedAddresses = new Set();

// token_security is plan-restricted (401) for all tokens on the free tier.
function securityFallback(address) {
  if (address.toLowerCase().endsWith('pump')) {
    // pump.fun bonding-curve tokens: mint authority is always set, top-10 concentration is high
    return { mintAuthority: 'PumpFunProgram', freezeAuthority: null, top10HolderPercent: 0.72, createdAt: null };
  }
  // Security data unavailable — don't assume anything; score only from observable market data
  return { mintAuthority: null, freezeAuthority: null, top10HolderPercent: 0, createdAt: null };
}

// Process tokens one at a time with delays to stay under Birdeye rate limits
async function enrichBatch(tokens) {
  const results = [];
  for (const token of tokens) {
    const address = token.address;

    const security = await fetchTokenSecurity(address);
    await delay(600);
    const overview = await fetchTokenOverview(address);
    await delay(600);

    // Use real security data if available; fall back when null or plan-restricted (401)
    const effectiveSecurity = (security && !security._restricted) ? security : securityFallback(address);

    const listingTime = token.recent_listing_time ?? token.createdAt;
    const createdAt = listingTime ?? effectiveSecurity?.createdAt ?? overview?.createdAt;
    const ageMs = createdAt ? Date.now() - createdAt * 1000 : null;
    const liquidity = overview?.liquidity ?? token.liquidity ?? null;
    const price = overview?.price ?? token.price ?? null;

    const rugScore = computeRugScore(effectiveSecurity, { ...overview, liquidity, price, createdAt });

    const enrichedToken = {
      address,
      name: overview?.name ?? token.name ?? 'Unknown',
      symbol: overview?.symbol ?? token.symbol ?? '???',
      logoURI: overview?.logoURI ?? token.logoURI ?? null,
      price,
      marketCap: overview?.mc ?? overview?.marketCap ?? token.mc ?? null,
      liquidity,
      volume24h: overview?.volume24h ?? overview?.v24hUSD ?? token.v24hUSD ?? 0,
      age: ageMs,
      createdAt,
      security: effectiveSecurity,
      overview,
      rugScore,
    };

    if (rugScore.score >= 80) {
      sendRugAlert(enrichedToken, rugScore);
      if (!detectedAddresses.has(address)) {
        detectedAddresses.add(address);
        rugDetections.unshift({
          name: enrichedToken.name,
          symbol: enrichedToken.symbol,
          address,
          logoURI: enrichedToken.logoURI ?? null,
          rugScoreAtFlag: rugScore.score,
          flaggedAt: new Date().toISOString(),
          timeToRug: 'Monitoring...',
          timeToRugMinutes: null,
          liquidityAtFlag: enrichedToken.liquidity ?? 0,
          percentLoss: 100,
          triggerSignals: rugScore.signals.filter((s) => s.triggered).map((s) => s.label),
        });
      }
    }

    results.push(enrichedToken);
    await delay(200);
  }
  return results;
}

// GET /api/new-listings
router.get('/new-listings', async (req, res) => {
  try {
    const listings = await fetchNewListings(8);
    if (!listings) return res.status(500).json({ error: 'Failed to fetch new listings' });

    const enriched = await enrichBatch(listings);
    enriched.sort((a, b) => b.rugScore.score - a.rugScore.score);

    res.json({ tokens: enriched, count: enriched.length, timestamp: new Date().toISOString() });
  } catch (err) {
    console.error('[Route] /new-listings error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/token/:address
router.get('/token/:address', async (req, res) => {
  const { address } = req.params;
  try {
    const [security, overview, transactions, priceData] = await Promise.all([
      fetchTokenSecurity(address),
      fetchTokenOverview(address),
      fetchTransactions(address, 10),
      fetchPrice(address),
    ]);

    const effectiveSecurity = (security && !security._restricted) ? security : securityFallback(address);

    const liquidity = priceData?.liquidity ?? overview?.liquidity ?? null;
    const price = priceData?.value ?? overview?.price ?? null;

    const createdAt = effectiveSecurity?.createdAt ?? overview?.createdAt;
    const rugScore = computeRugScore(effectiveSecurity, { ...overview, liquidity, price, createdAt });
    const ageMs = createdAt ? Date.now() - createdAt * 1000 : null;

    const flaggedTxs = flagSuspiciousTransactions(transactions || []);

    res.json({
      address,
      name: overview?.name ?? 'Unknown',
      symbol: overview?.symbol ?? '???',
      logoURI: overview?.logoURI ?? null,
      price,
      marketCap: overview?.mc ?? overview?.marketCap ?? null,
      liquidity,
      volume24h: overview?.volume24h ?? overview?.v24hUSD ?? 0,
      age: ageMs,
      createdAt,
      security: effectiveSecurity,
      overview,
      transactions: flaggedTxs,
      rugScore,
    });
  } catch (err) {
    console.error(`[Route] /token/${address} error:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/hall-of-shame
router.get('/hall-of-shame', (req, res) => {
  res.json({ tokens: rugDetections, count: rugDetections.length });
});

// GET /api/trending
router.get('/trending', async (req, res) => {
  try {
    const trending = await fetchTrending(20);
    if (!trending) return res.status(500).json({ error: 'Failed to fetch trending tokens' });
    res.json({ tokens: trending, count: trending.length, timestamp: new Date().toISOString() });
  } catch (err) {
    console.error('[Route] /trending error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/transactions/:address
router.get('/transactions/:address', async (req, res) => {
  const { address } = req.params;
  try {
    const txs = await fetchTransactions(address, 10);
    if (!txs) return res.status(500).json({ error: 'Failed to fetch transactions' });
    const flagged = flagSuspiciousTransactions(txs);
    res.json({ transactions: flagged, count: flagged.length });
  } catch (err) {
    console.error(`[Route] /transactions/${address} error:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

function flagSuspiciousTransactions(txs) {
  const walletTimes = {};
  for (const tx of txs) {
    const wallet = tx.owner ?? tx.maker ?? tx.source;
    if (!wallet) continue;
    const time = tx.blockUnixTime ?? tx.timestamp ?? 0;
    if (!walletTimes[wallet]) walletTimes[wallet] = [];
    walletTimes[wallet].push(time);
  }

  const suspiciousWallets = new Set();
  for (const [wallet, times] of Object.entries(walletTimes)) {
    const sorted = times.slice().sort((a, b) => a - b);
    for (let i = 0; i < sorted.length - 3; i++) {
      if (sorted[i + 3] - sorted[i] <= 60) {
        suspiciousWallets.add(wallet);
        break;
      }
    }
  }

  return txs.map((tx) => {
    const wallet = tx.owner ?? tx.maker ?? tx.source;
    return { ...tx, suspicious: suspiciousWallets.has(wallet) };
  });
}

module.exports = router;
