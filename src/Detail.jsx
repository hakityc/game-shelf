import { useEffect } from 'react';
import { Cover } from './Cartridge.jsx';
import { PLATFORMS, STATUSES, formatHours } from './meta.js';

export default function Detail({ game, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const p = PLATFORMS[game.platform];
  const s = STATUSES[game.status];
  const rows = [
    ['平台', p?.name],
    ['状态', s && <span className="pill" style={{ '--pill': s.color }}>{s.label}</span>],
    ['游玩时长', formatHours(game.playtimeHours)],
    ['成就', game.achievements && `${game.achievements.unlocked} / ${game.achievements.total}`],
    ['最近游玩', game.lastPlayed],
    ['版本', game.format === 'physical' ? '实体卡带' : game.format === 'digital' ? '数字版' : null],
    ['评分', game.rating ? '★'.repeat(game.rating) + '☆'.repeat(5 - game.rating) : null],
  ].filter(([, v]) => v);

  return (
    <div className="overlay" onClick={onClose}>
      <div className="detail" style={{ '--case': p?.color }} onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={onClose} aria-label="关闭">×</button>
        <div className="detail-cart">
          <Cover game={game} />
        </div>
        <div className="detail-info">
          <h2>{game.title}</h2>
          <dl>
            {rows.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          {game.note && <p className="note">“{game.note}”</p>}
          {game.link && (
            <a className="link" href={game.link} target="_blank" rel="noreferrer">
              商店页面 ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
