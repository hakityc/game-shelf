// 从 Steam Web API 拉取已拥有的游戏，写入 data/cache/steam.json
// 需要环境变量 STEAM_API_KEY 和 STEAM_ID（可写在项目根目录的 .env 里）
import { mkdir, writeFile } from 'node:fs/promises';

try { process.loadEnvFile('.env'); } catch {}

const { STEAM_API_KEY, STEAM_ID } = process.env;
if (!STEAM_API_KEY || !STEAM_ID) {
  console.log('[steam] 没有设置 STEAM_API_KEY / STEAM_ID，跳过');
  process.exit(0);
}

const url = new URL('https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/');
url.search = new URLSearchParams({
  key: STEAM_API_KEY,
  steamid: STEAM_ID,
  include_appinfo: '1',
  include_played_free_games: '1',
  format: 'json',
});

const res = await fetch(url);
if (!res.ok) throw new Error(`[steam] 请求失败：HTTP ${res.status}`);
const { response } = await res.json();
if (!response?.games) {
  throw new Error('[steam] 没拿到游戏列表，检查 Steam 个人资料的“游戏详情”是否设为公开');
}

const games = response.games.map((g) => ({
  id: `steam-${g.appid}`,
  platform: 'steam',
  title: g.name,
  cover: `https://cdn.cloudflare.steamstatic.com/steam/apps/${g.appid}/library_600x900.jpg`,
  coverFallback: `https://cdn.cloudflare.steamstatic.com/steam/apps/${g.appid}/header.jpg`,
  playtimeHours: Math.round((g.playtime_forever / 60) * 10) / 10,
  lastPlayed: g.rtime_last_played ? new Date(g.rtime_last_played * 1000).toISOString().slice(0, 10) : null,
  format: 'digital',
  link: `https://store.steampowered.com/app/${g.appid}`,
}));

await mkdir('data/cache', { recursive: true });
await writeFile('data/cache/steam.json', JSON.stringify(games, null, 2));
console.log(`[steam] 拉到 ${games.length} 款游戏`);
