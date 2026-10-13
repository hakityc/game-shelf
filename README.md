# 游戏收藏架

把自己在 NS、PS、Xbox、Steam 上的游戏，放进一个个仿图鉴卡带盒（每盒 18 个卡位）里展示。

## 本地运行

```bash
npm install
cp .env.example .env   # 填上 Steam API Key 和 SteamID
npm run fetch          # 拉取 Steam、PS、Xbox 游戏（没配的会跳过）
npm run dev
```

## 数据从哪来

所有数据最后都合并成 `public/games.json`，网页只读这一个文件（`npm run merge`，dev 和 build 会自动执行）。

| 来源 | 文件 | 说明 |
| --- | --- | --- |
| Steam | `data/cache/steam.json` | `npm run fetch:steam`，Steam Web API |
| PS | `data/cache/ps.json` | `npm run fetch:ps`，用 psn-api，带游玩时长 |
| Xbox | `data/cache/xbox.json` | `npm run fetch:xbox`，用 OpenXBL，带成就进度，没有时长 |
| NS 等 | `data/manual/*.json` | 手动维护，一款游戏一条 |
| 补充信息 | `data/overrides.json` | 按 id 给任何游戏补状态、评分、短评 |

`data/cache` 不提交到仓库，部署时由 GitHub Actions 现拉。任何一个平台拉取失败都不会阻塞部署。

- Steam：个人资料的“游戏详情”需要设为公开
- PS：`PSN_NPSSO` 大约两个月会过期，过期后重新复制一次
- Xbox：OpenXBL 免费额度有调用次数限制，每天拉一次够用

### 游戏字段

```jsonc
{
  "id": "switch-zelda-totk",      // 唯一 id，Steam 游戏是 steam-<appid>
  "platform": "switch",           // switch | ps | xbox | steam
  "title": "塞尔达传说 王国之泪",
  "cover": "https://...",         // 可选，没有就用标题生成卡贴
  "status": "finished",           // playing | finished | played | backlog | wishlist
  "playtimeHours": 120,
  "lastPlayed": "2026-10-01",
  "format": "physical",           // physical | digital
  "rating": 5,                    // 1-5
  "note": "一句话短评"
}
```

没写 `status` 时会按游玩记录推断：没玩过算吃灰，30 天内玩过算在玩，其余算玩过。

## 部署

推到 GitHub 后：

1. 仓库 Settings → Pages → Source 选 **GitHub Actions**
2. Settings → Secrets and variables → Actions 里加 `STEAM_API_KEY`、`STEAM_ID`、`PSN_NPSSO`、`OPENXBL_KEY`（用不到的平台可以不加）

之后每次推送和每天凌晨都会自动拉一次数据并重新部署。

## 后续

- [ ] PS 奖杯进度
- [ ] Steam 成就进度
