import { useState } from 'react';
import { Cover } from './Cartridge.jsx';
import { PLATFORMS, STATUSES, formatHours } from './meta.js';

const SORTS = {
  playtime: { label: '时长', fn: (a, b) => (b.playtimeHours ?? 0) - (a.playtimeHours ?? 0) },
  recent: { label: '最近游玩', fn: (a, b) => (b.lastPlayed ?? '').localeCompare(a.lastPlayed ?? '') },
  title: { label: '名称', fn: (a, b) => a.title.localeCompare(b.title, 'zh') },
};

export default function ListView({ games, onOpen }) {
  const [sort, setSort] = useState('playtime');
  const sorted = [...games].sort(SORTS[sort].fn);

  return (
    <div className="list">
      <div className="list-sort">
        排序
        {Object.entries(SORTS).map(([k, v]) => (
          <button key={k} className={`chip ${sort === k ? 'on' : ''}`} onClick={() => setSort(k)}>
            {v.label}
          </button>
        ))}
      </div>
      {sorted.map((g) => {
        const s = STATUSES[g.status];
        return (
          <button key={g.id} className="row" onClick={() => onOpen(g)}>
            <Cover game={g} className="thumb" />
            <span className="row-title">{g.title}</span>
            <span className="row-plat" style={{ '--case': PLATFORMS[g.platform]?.color }}>
              {PLATFORMS[g.platform]?.short}
            </span>
            <span className="pill" style={{ '--pill': s?.color }}>{s?.label}</span>
            <span className="row-hours">{formatHours(g.playtimeHours)}</span>
          </button>
        );
      })}
    </div>
  );
}
