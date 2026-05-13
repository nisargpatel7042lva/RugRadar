function computeRugScore(security, overview) {
  let score = 0;
  const signals = [];

  const mintNotRevoked = security?.mintAuthority != null;
  if (mintNotRevoked) score += 30;
  signals.push({ label: 'Mint authority not revoked', triggered: mintNotRevoked, points: 30 });

  const top10Percent = security?.top10HolderPercent ?? 0;
  const highConcentration = top10Percent > 0.6;
  if (highConcentration) score += 20;
  signals.push({ label: 'Top 10 holders own >60% supply', triggered: highConcentration, points: 20 });

  const freezeEnabled = security?.freezeAuthority != null;
  if (freezeEnabled) score += 15;
  signals.push({ label: 'Freeze authority enabled', triggered: freezeEnabled, points: 15 });

  const liquidity = overview?.liquidity ?? 0;
  const lowLiquidity = liquidity < 10000;
  if (lowLiquidity) score += 15;
  signals.push({ label: 'Liquidity below $10,000', triggered: lowLiquidity, points: 15 });

  const createdAt = security?.createdAt ?? overview?.createdAt;
  const ageMs = createdAt ? Date.now() - createdAt * 1000 : null;
  const isNew = ageMs !== null && ageMs < 2 * 60 * 60 * 1000;
  if (isNew) score += 10;
  signals.push({ label: 'Token age under 2 hours', triggered: isNew, points: 10 });

  const volume24h = overview?.volume24h ?? overview?.v24hUSD ?? 0;
  const zeroVolume = !volume24h || volume24h === 0;
  if (zeroVolume) score += 10;
  signals.push({ label: 'Zero 24h volume', triggered: zeroVolume, points: 10 });

  let level, color;
  if (score <= 30) {
    level = 'SAFE';
    color = '#22c55e';
  } else if (score <= 60) {
    level = 'CAUTION';
    color = '#f59e0b';
  } else {
    level = 'HIGH RISK';
    color = '#ef4444';
  }

  return { score, level, color, signals };
}

module.exports = { computeRugScore };
