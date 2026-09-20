import React from "react";

// Procedural, deterministic abstract avatars. Each "kind" renders a distinct
// premium geometric SVG, parameterised by a seed so the onboarding grid can be
// randomised. The brand color is layered in so avatars feel themed.

export const AVATAR_KINDS = 8;

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface AvatarProps {
  kind: number;
  seed: number;
  /** CSS color (var or oklch). Defaults to the brand token. */
  color?: string;
  size?: number;
  className?: string;
}

export function AvatarArt({
  kind,
  seed,
  color = "var(--brand)",
  size = 120,
  className,
}: AvatarProps) {
  const rnd = mulberry32(seed * 2654435761 + kind * 40503 + 7);
  const k = ((kind % AVATAR_KINDS) + AVATAR_KINDS) % AVATAR_KINDS;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={className}
      role="img"
      aria-label="Avatar"
    >
      <defs>
        <radialGradient id={`bg-${kind}-${seed}`} cx="50%" cy="38%" r="75%">
          <stop offset="0%" stopColor={color} stopOpacity="0.95" />
          <stop offset="100%" stopColor={color} stopOpacity="0.55" />
        </radialGradient>
        <linearGradient id={`hi-${kind}-${seed}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="120" height="120" rx="26" fill={`url(#bg-${kind}-${seed})`} />
      <g style={{ color }}>
        {renderKind(k, rnd, color, seed)}
      </g>
      {/* soft top sheen */}
      <rect x="0" y="0" width="120" height="60" rx="26" fill={`url(#hi-${kind}-${seed})`} opacity="0.12" />
    </svg>
  );
}

function renderKind(k: number, rnd: () => number, color: string, seed: number) {
  const white = "rgba(255,255,255,0.92)";
  switch (k) {
    case 0:
      return <Orbit rnd={rnd} color={color} white={white} />;
    case 1:
      return <Bloom rnd={rnd} color={color} white={white} />;
    case 2:
      return <Prism rnd={rnd} color={color} white={white} />;
    case 3:
      return <Lattice rnd={rnd} color={color} white={white} />;
    case 4:
      return <Wave rnd={rnd} color={color} white={white} />;
    case 5:
      return <Shard rnd={rnd} color={color} white={white} />;
    case 6:
      return <Halo rnd={rnd} color={color} white={white} />;
    default:
      return <Constellation rnd={rnd} color={color} white={white} seed={seed} />;
  }
}

type PartProps = { rnd: () => number; color: string; white: string };

function Orbit({ rnd, white }: PartProps) {
  const rings = 3 + Math.floor(rnd() * 2);
  return (
    <g fill="none" stroke={white} strokeWidth="3" strokeLinecap="round">
      {Array.from({ length: rings }).map((_, i) => {
        const r = 16 + i * 12;
        const rot = rnd() * 360;
        return (
          <g key={i} transform={`rotate(${rot} 60 60)`}>
            <circle cx="60" cy="60" r={r} strokeDasharray={`${r * 0.7} ${r * 0.5}`} />
            <circle cx={60 + r} cy="60" r="4.5" fill={white} stroke="none" />
          </g>
        );
      })}
    </g>
  );
}

function Bloom({ rnd, color, white }: PartProps) {
  const petals = 6 + Math.floor(rnd() * 4);
  return (
    <g transform="translate(60 60)">
      {Array.from({ length: petals }).map((_, i) => {
        const a = (i / petals) * Math.PI * 2;
        const len = 26 + rnd() * 12;
        return (
          <ellipse
            key={i}
            cx={Math.cos(a) * len}
            cy={Math.sin(a) * len}
            rx="9"
            ry="20"
            transform={`rotate(${(a * 180) / Math.PI}) translate(${Math.cos(a) * len} ${Math.sin(a) * len})`}
            fill={i % 2 ? white : color}
            opacity={i % 2 ? 0.9 : 0.35}
          />
        );
      })}
      <circle r="9" fill={white} />
    </g>
  );
}

function Prism({ rnd, color, white }: PartProps) {
  const tris = 3;
  return (
    <g>
      {Array.from({ length: tris }).map((_, i) => {
        const r = 50 - i * 14;
        const rot = rnd() * 120;
        const p = (ang: number) => `${60 + Math.cos(ang) * r},${60 + Math.sin(ang) * r}`;
        return (
          <polygon
            key={i}
            points={`${p((rot * Math.PI) / 180)} ${p(((rot + 120) * Math.PI) / 180)} ${p(((rot + 240) * Math.PI) / 180)}`}
            fill={i % 2 ? white : color}
            opacity={0.85 - i * 0.22}
            stroke={white}
            strokeWidth="1.5"
          />
        );
      })}
    </g>
  );
}

function Lattice({ rnd, color, white }: PartProps) {
  const n = 5;
  return (
    <g>
      {Array.from({ length: n * n }).map((_, idx) => {
        const x = (idx % n) * 18 + 24;
        const y = Math.floor(idx / n) * 18 + 24;
        const on = rnd() > 0.45;
        return (
          <circle
            key={idx}
            cx={x}
            cy={y}
            r={on ? 5.5 : 2.5}
            fill={on ? white : color}
            opacity={on ? 0.95 : 0.4}
          />
        );
      })}
    </g>
  );
}

function Wave({ rnd, color, white }: PartProps) {
  const bands = 5;
  return (
    <g fill="none" strokeLinecap="round">
      {Array.from({ length: bands }).map((_, i) => {
        const y = 26 + i * 16;
        const amp = 8 + rnd() * 8;
        const phase = rnd() * 6;
        let d = `M8 ${y}`;
        for (let x = 8; x <= 112; x += 4) {
          d += ` L${x} ${y + Math.sin(x / 10 + phase) * amp}`;
        }
        return (
          <path
            key={i}
            d={d}
            stroke={i % 2 ? white : color}
            strokeWidth="4"
            opacity={0.95 - i * 0.12}
          />
        );
      })}
    </g>
  );
}

function Shard({ rnd, color, white }: PartProps) {
  const facets = 6;
  return (
    <g>
      {Array.from({ length: facets }).map((_, i) => {
        const a1 = (i / facets) * Math.PI * 2;
        const a2 = ((i + 1) / facets) * Math.PI * 2;
        const r1 = 44;
        const r2 = 18 + rnd() * 10;
        const pts = [
          [60, 60],
          [60 + Math.cos(a1) * r1, 60 + Math.sin(a1) * r1],
          [60 + Math.cos(a1) * r2, 60 + Math.sin(a1) * r2],
          [60 + Math.cos(a2) * r2, 60 + Math.sin(a2) * r2],
        ];
        return (
          <polygon
            key={i}
            points={pts.map((p) => p.join(",")).join(" ")}
            fill={i % 2 ? white : color}
            opacity={0.9 - (i % 3) * 0.18}
          />
        );
      })}
      <circle cx="60" cy="60" r="9" fill={white} />
    </g>
  );
}

function Halo({ rnd, white, color }: PartProps) {
  return (
    <g fill="none" stroke={white} strokeLinecap="round">
      <circle cx="60" cy="60" r="40" strokeWidth="3" strokeDasharray="40 14" opacity="0.9" />
      <circle cx="60" cy="60" r="28" strokeWidth="3" strokeDasharray="20 10" opacity="0.7" transform={`rotate(${rnd() * 90} 60 60)`} />
      <circle cx="60" cy="60" r="14" strokeWidth="3" opacity="0.95" />
      <circle cx="100" cy="60" r="5" fill={white} stroke="none" />
      <circle cx="20" cy="60" r="3" fill={color} stroke="none" />
    </g>
  );
}

function Constellation({ rnd, white, color, seed }: PartProps & { seed: number }) {
  const n = 7;
  const pts = Array.from({ length: n }).map(() => ({
    x: 22 + rnd() * 76,
    y: 22 + rnd() * 76,
    r: 2.5 + rnd() * 4,
  }));
  return (
    <g>
      <g stroke={white} strokeWidth="1.5" opacity="0.5" fill="none">
        {pts.map((p, i) =>
          pts.slice(i + 1).map((q, j) => (
            <line key={`${i}-${j}`} x1={p.x} y1={p.y} x2={q.x} y2={q.y} />
          ))
        )}
      </g>
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={p.r} fill={i % 3 ? white : color} opacity={0.95} />
      ))}
      {/* suppress unused seed warning */}
      <g data-seed={seed} />
    </g>
  );
}
