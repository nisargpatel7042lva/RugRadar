async function sendRugAlert(tokenData, rugScoreResult) {
  const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;
  if (rugScoreResult.score < 80) return;

  const { name = 'Unknown', symbol = '???', address = '' } = tokenData;
  const { score, signals } = rugScoreResult;

  const flagLines = signals
    .filter((s) => s.triggered)
    .map((s) => `⚠️ ${s.label}`)
    .join('\n');

  const liquidity = tokenData.overview?.liquidity ?? tokenData.liquidity ?? 0;
  const createdAt = tokenData.security?.createdAt ?? tokenData.createdAt;
  const ageMs = createdAt ? Date.now() - createdAt * 1000 : null;
  const ageFmt = ageMs === null
    ? 'Unknown'
    : ageMs < 3600000
    ? `${Math.floor(ageMs / 60000)}m`
    : `${Math.floor(ageMs / 3600000)}h ${Math.floor((ageMs % 3600000) / 60000)}m`;

  const text = [
    `🚨 *RUGRADAR ALERT*`,
    `Token: ${name} (${symbol})`,
    `RugScore: ${score}/100 🔴`,
    ``,
    `Risk Flags:`,
    flagLines || '⚠️ Multiple signals triggered',
    ``,
    `Liquidity: $${Number(liquidity).toLocaleString()}`,
    `Age: ${ageFmt}`,
    ``,
    `🔗 rugradar-birdeye.vercel.app/token/${address}`,
  ].join('\n');

  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text, parse_mode: 'Markdown' }),
    });
    if (res.ok) {
      console.log(`[Telegram] Alert sent for ${symbol} (score: ${score})`);
    } else {
      const body = await res.text();
      console.error('[Telegram] Send failed:', body);
    }
  } catch (err) {
    console.error('[Telegram] Error:', err.message);
  }
}

module.exports = { sendRugAlert };
