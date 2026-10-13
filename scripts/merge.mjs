// 把各平台数据合并成 public/games.json，网页只读这一个文件
//   data/cache/*.json   脚本自动拉取的数据（Steam 等）
//   data/manual/*.json  手动维护的清单（NS 等）
//   data/overrides.json 给任何游戏补充状态、评分、短评，按 id 覆盖
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

async function readDir(dir) {
  if (!existsSync(dir)) return [];
  const files = (await readdir(dir)).filter((f) => f.endsWith('.json'));
  const lists = await Promise.all(files.map(async (f) => JSON.parse(await readFile(`${dir}/${f}`, 'utf8'))));
  return lists.flat();
}

const overrides = existsSync('data/overrides.json')
  ? JSON.parse(await readFile('data/overrides.json', 'utf8'))
  : {};

const DAY = 24 * 60 * 60 * 1000;

// 没手动标状态时，按游玩记录推断
function inferStatus(g) {
  if (!g.playtimeHours) return 'backlog';
  if (g.lastPlayed && Date.now() - new Date(g.lastPlayed).getTime() < 30 * DAY) return 'playing';
  return 'played';
}

const games = [...(await readDir('data/cache')), ...(await readDir('data/manual'))]
  .map((g) => {
    const merged = { ...g, ...overrides[g.id] };
    return { ...merged, status: merged.status ?? inferStatus(merged) };
  })
  .sort((a, b) => (b.playtimeHours ?? 0) - (a.playtimeHours ?? 0) || a.title.localeCompare(b.title));

await mkdir('public', { recursive: true });
await writeFile('public/games.json', JSON.stringify({ updatedAt: new Date().toISOString(), games }));
console.log(`[merge] 合并 ${games.length} 款游戏 -> public/games.json`);
