export const PLATFORMS = {
  switch: { name: 'Nintendo Switch', short: 'NS', color: '#e60012' },
  ps: { name: 'PlayStation', short: 'PS', color: '#0050a8' },
  xbox: { name: 'Xbox', short: 'Xbox', color: '#107c10' },
  steam: { name: 'Steam', short: 'Steam', color: '#1b2838' },
};

export const STATUSES = {
  playing: { label: '在玩', color: '#f5a623' },
  finished: { label: '已通关', color: '#2ecc71' },
  played: { label: '玩过', color: '#5dade2' },
  backlog: { label: '吃灰', color: '#95a5a6' },
  wishlist: { label: '愿望单', color: '#c39bd3' },
};

export const SLOTS_PER_CASE = 18;

// 没有封面时，用标题生成一个稳定的配色
export function titleHue(title) {
  let h = 0;
  for (const ch of title) h = (h * 31 + ch.codePointAt(0)) % 360;
  return h;
}

export function formatHours(h) {
  if (!h) return '—';
  return h >= 100 ? `${Math.round(h)} 小时` : `${h} 小时`;
}
