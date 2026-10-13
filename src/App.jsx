import { useEffect, useMemo, useState } from 'react';
import Case from './Case.jsx';
import Detail from './Detail.jsx';
import ListView from './ListView.jsx';
import { PLATFORMS, STATUSES, SLOTS_PER_CASE } from './meta.js';

function chunk(list, size) {
  const out = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
}

export default function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [platform, setPlatform] = useState('all');
  const [status, setStatus] = useState('all');
  const [view, setView] = useState('shelf');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetch('./games.json')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  const games = data?.games ?? [];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return games.filter(
      (g) =>
        (platform === 'all' || g.platform === platform) &&
        (status === 'all' || g.status === status) &&
        (!q || g.title.toLowerCase().includes(q)),
    );
  }, [games, query, platform, status]);

  const owned = games.filter((g) => g.status !== 'wishlist');
  const totalHours = Math.round(owned.reduce((sum, g) => sum + (g.playtimeHours ?? 0), 0));
  const platformsPresent = Object.keys(PLATFORMS).filter((p) => games.some((g) => g.platform === p));

  return (
    <div className="app">
      <header className="top">
        <div className="title">
          <h1>游戏收藏架</h1>
          <p>
            {owned.length} 款游戏 · {totalHours} 小时
            {data?.updatedAt && <span className="muted"> · 更新于 {data.updatedAt.slice(0, 10)}</span>}
          </p>
        </div>
        <div className="view-toggle">
          <button className={view === 'shelf' ? 'on' : ''} onClick={() => setView('shelf')}>卡带盒</button>
          <button className={view === 'list' ? 'on' : ''} onClick={() => setView('list')}>列表</button>
        </div>
      </header>

      <div className="filters">
        <input
          className="search"
          type="search"
          placeholder="搜索游戏"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="chips">
          <button className={`chip ${platform === 'all' ? 'on' : ''}`} onClick={() => setPlatform('all')}>全部平台</button>
          {platformsPresent.map((p) => (
            <button
              key={p}
              className={`chip ${platform === p ? 'on' : ''}`}
              style={{ '--chip': PLATFORMS[p].color }}
              onClick={() => setPlatform(p)}
            >
              {PLATFORMS[p].short}
            </button>
          ))}
        </div>
        <div className="chips">
          <button className={`chip ${status === 'all' ? 'on' : ''}`} onClick={() => setStatus('all')}>全部状态</button>
          {Object.entries(STATUSES).map(([k, s]) => (
            <button
              key={k}
              className={`chip ${status === k ? 'on' : ''}`}
              style={{ '--chip': s.color }}
              onClick={() => setStatus(k)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="empty">读取 games.json 失败：{error}</p>}
      {data && filtered.length === 0 && <p className="empty">没有符合条件的游戏</p>}

      {view === 'shelf' ? (
        <main className="shelf">
          {Object.keys(PLATFORMS).map((p) => {
            const cases = chunk(filtered.filter((g) => g.platform === p), SLOTS_PER_CASE);
            return cases.map((list, i) => (
              <Case key={`${p}-${i}`} platform={p} games={list} index={i} total={cases.length} onOpen={setSelected} />
            ));
          })}
        </main>
      ) : (
        <ListView games={filtered} onOpen={setSelected} />
      )}

      {selected && <Detail game={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
