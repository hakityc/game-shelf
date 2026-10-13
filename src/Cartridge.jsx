import { useState } from 'react';
import { PLATFORMS, STATUSES, titleHue } from './meta.js';

// 一张卡带：上面是贴纸（封面），没有封面就用标题生成一张
export function Cover({ game, className = '' }) {
  const [src, setSrc] = useState(game.cover);
  const hue = titleHue(game.title);

  if (!src) {
    return (
      <div
        className={`cover cover-generated ${className}`}
        style={{ '--hue': hue }}
      >
        <span>{game.title}</span>
      </div>
    );
  }
  return (
    <img
      className={`cover ${className}`}
      src={src}
      alt={game.title}
      loading="lazy"
      onError={() => setSrc(src === game.coverFallback ? null : game.coverFallback ?? null)}
    />
  );
}

export default function Cartridge({ game, onOpen }) {
  const status = STATUSES[game.status];
  return (
    <button
      className={`cartridge ${game.status === 'wishlist' ? 'is-wish' : ''}`}
      onClick={() => onOpen(game)}
      title={`${game.title} · ${status?.label ?? ''}`}
    >
      <div className="cart-top">
        <span className="cart-brand">{PLATFORMS[game.platform]?.short}</span>
        <span className="cart-dot" style={{ background: status?.color }} />
      </div>
      <Cover game={game} />
    </button>
  );
}
