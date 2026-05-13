const express = require('express');
const router = express.Router();
const {
  fetchNewListings,
  fetchTokenSecurity,
  fetchTokenOverview,
  fetchTrending,
  fetchTransactions,
} = require('../utils/birdeye');
const { computeRugScore } = require('../utils/rugScore');
const { sendRugAlert } = require('../utils/telegram');

// GET /api/new-listings
router.get('/new-listings', async (req, res) => {
  try {
    const listings = await fetchNewListings(20);
    if (!listings) return res.status(500).json({ error: 'Failed to fetch new listings' });

    const enriched = await Promise.all(
      listings.map(async (token) => {
        const address = token.address;
        const [security, overview] = await Promise.all([
          fetchTokenSecurity(address),
          fetchTokenOverview(address),
        ]);

        const rugScore = computeRugScore(security, overview);

        const createdAt = security?.createdAt ?? overview?.createdAt;
        const ageMs = createdAt ? Date.now() - createdAt * 1000 : null;

        const enrichedToken = {
          address,
          name: overview?.name ?? token.name ?? 'Unknown',
          symbol: overview?.symbol ?? token.symbol ?? '???',
          logoURI: overview?.logoURI ?? token.logoURI ?? null,
          price: overview?.price ?? null,
          marketCap: overview?.mc ?? overview?.marketCap ?? null,
          liquidity: overview?.liquidity ?? null,
          volume24h: overview?.volume24h ?? overview?.v24hUSD ?? 0,
          age: ageMs,
          createdAt,
          security,
          overview,
          rugScore,
        };

        if (rugScore.score >= 80) {
          sendRugAlert(enrichedToken, rugScore);
        }

        return enrichedToken;
      })
    );

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
    const [security, overview, transactions] = await Promise.all([
      fetchTokenSecurity(address),
      fetchTokenOverview(address),
      fetchTransactions(address, 10),
    ]);

    const rugScore = computeRugScore(security, overview);
    const createdAt = security?.createdAt ?? overview?.createdAt;
    const ageMs = createdAt ? Date.now() - createdAt * 1000 : null;

    const flaggedTxs = flagSuspiciousTransactions(transactions || []);

    res.json({
      address,
      name: overview?.name ?? 'Unknown',
      symbol: overview?.symbol ?? '???',
      logoURI: overview?.logoURI ?? null,
      price: overview?.price ?? null,
      marketCap: overview?.mc ?? overview?.marketCap ?? null,
      liquidity: overview?.liquidity ?? null,
      volume24h: overview?.volume24h ?? overview?.v24hUSD ?? 0,
      age: ageMs,
      createdAt,
      security,
      overview,
      transactions: flaggedTxs,
      rugScore,
    });
  } catch (err) {
    console.error(`[Route] /token/${address} error:`, err.message);
    res.status(500).json({ error: err.message });
  }
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
