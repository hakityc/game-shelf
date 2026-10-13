import Cartridge from './Cartridge.jsx';
import { PLATFORMS, SLOTS_PER_CASE } from './meta.js';

// 仿图鉴卡带盒：左右两半，每半 3×3，共 18 个卡位
export default function Case({ platform, games, index, total, onOpen }) {
  const p = PLATFORMS[platform];
  const slots = [...games, ...Array(SLOTS_PER_CASE - games.length).fill(null)];
  const halves = [slots.slice(0, 9), slots.slice(9)];

  return (
    <section className="case" style={{ '--case': p.color }}>
      <header className="case-head">
        <span className="lens" />
        <span className="led led-r" />
        <span className="led led-y" />
        <span className="led led-g" />
        <h3>
          {p.name}
          {total > 1 && <small> · No.{index + 1}/{total}</small>}
        </h3>
      </header>
      <div className="case-body">
        {halves.map((half, h) => (
          <div className="case-half" key={h}>
            {half.map((g, i) => (
              <div className="slot" key={g?.id ?? `empty-${h}-${i}`}>
                {g && <Cartridge game={g} onOpen={onOpen} />}
              </div>
            ))}
          </div>
        ))}
        <div className="hinge" />
      </div>
    </section>
  );
}
