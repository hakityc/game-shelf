// 用 psn-api 拉取 PlayStation 玩过的游戏，写入 data/cache/ps.json
// 需要环境变量 PSN_NPSSO（获取方法见 README）
import { mkdir, writeFile } from 'node:fs/promises';
import {
  exchangeNpssoForCode,
  exchangeAccessCodeForAuthTokens,
  getUserPlayedGames,
} from 'psn-api';

try { process.loadEnvFile('.env'); } catch {}

const { PSN_NPSSO } = process.env;
if (!PSN_NPSSO) {
  console.log('[ps] 没有设置 PSN_NPSSO，跳过');
  process.exit(0);
}

const code = await exchangeNpssoForCode(PSN_NPSSO);
const auth = await exchangeAccessCodeForAuthTokens(code);

const titles = [];
for (let offset = 0; ; ) {
  const page = await getUserPlayedGames(auth, 'me', { limit: 200, offset });
  titles.push(...page.titles);
  if (!page.nextOffset || page.titles.length === 0) break;
  offset = page.nextOffset;
}

// playDuration 是 ISO 8601 时长，比如 "PT228H56M33S"
function toHours(duration = '') {
  const m = duration.match(/P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?/) ?? [];
  const [, d = 0, h = 0, min = 0] = m;
  return Math.round((Number(d) * 24 + Number(h) + Number(min) / 60) * 10) / 10;
}

// 同一款游戏可能有 PS4、PS5 多个版本，按 concept 合并
const byConcept = new Map();
for (const t of titles) {
  const key = t.concept?.id ?? t.titleId;
  const prev = byConcept.get(key);
  const hours = toHours(t.playDuration);
  if (prev) {
    prev.playtimeHours = Math.round((prev.playtimeHours + hours) * 10) / 10;
    if (t.lastPlayedDateTime?.slice(0, 10) > prev.lastPlayed) prev.lastPlayed = t.lastPlayedDateTime.slice(0, 10);
    continue;
  }
  byConcept.set(key, {
    id: `ps-${key}`,
    platform: 'ps',
    title: t.localizedName || t.name,
    cover: t.localizedImageUrl || t.imageUrl,
    playtimeHours: hours,
    lastPlayed: t.lastPlayedDateTime?.slice(0, 10) ?? null,
    format: 'digital',
  });
}

const games = [...byConcept.values()];
await mkdir('data/cache', { recursive: true });
await writeFile('data/cache/ps.json', JSON.stringify(games, null, 2));
console.log(`[ps] 拉到 ${games.length} 款游戏`);
