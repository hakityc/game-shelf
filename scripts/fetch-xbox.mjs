// 用 OpenXBL（https://xbl.io）拉取 Xbox 游戏和成就，写入 data/cache/xbox.json
// 需要环境变量 OPENXBL_KEY（在 xbl.io 用微软账号登录后生成）
import { mkdir, writeFile } from 'node:fs/promises';

try { process.loadEnvFile('.env'); } catch {}

const { OPENXBL_KEY } = process.env;
if (!OPENXBL_KEY) {
  console.log('[xbox] 没有设置 OPENXBL_KEY，跳过');
  process.exit(0);
}

const res = await fetch('https://xbl.io/api/v2/achievements', {
  headers: { 'X-Authorization': OPENXBL_KEY, Accept: 'application/json' },
});
if (!res.ok) throw new Error(`[xbox] 请求失败：HTTP ${res.status}`);
const { titles = [] } = await res.json();

const games = titles
  // 只保留游戏，去掉“设置”“Netflix”这类应用
  .filter((t) => t.type === undefined || t.type === 'Game')
  .map((t) => ({
    id: `xbox-${t.titleId}`,
    platform: 'xbox',
    title: t.name,
    cover: t.displayImage || null,
    lastPlayed: t.titleHistory?.lastTimePlayed?.slice(0, 10) ?? null,
    achievements: t.achievement?.totalAchievements
      ? { unlocked: t.achievement.currentAchievements, total: t.achievement.totalAchievements }
      : null,
    format: 'digital',
  }));

await mkdir('data/cache', { recursive: true });
await writeFile('data/cache/xbox.json', JSON.stringify(games, null, 2));
console.log(`[xbox] 拉到 ${games.length} 款游戏`);
