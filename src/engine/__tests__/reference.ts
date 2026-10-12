/* eslint-disable */
// @ts-nocheck
/**
 * Verbatim copy of the engine from the approved Studio mockup (Main.dc.html).
 * Used only as an oracle by parity.test.ts so the TypeScript port can be
 * checked against the design reference. Do not import from app code.
 */
export function mockupEngine() {
  const MOTIFS = {
    petal: [
      ['M0 0C45 8 70 35 100 100C35 70 8 45 0 0Z', 1],
      ['M0 0L72 72', -1],
      ['M-18 0a18 18 0 1 0 36 0a18 18 0 1 0 -36 0Z', 2],
    ],
    arcs: [
      ['M0 0L100 0A100 100 0 0 1 0 100Z', 1],
      ['M0 0L68 0A68 68 0 0 1 0 68Z', 0],
      ['M0 0L38 0A38 38 0 0 1 0 38Z', 2],
    ],
    kite: [
      ['M0 0L100 34L50 50L34 100Z', 1],
      ['M50 50L100 100L66 100L50 66Z', 2],
      ['M100 0L100 22L78 0Z', 3],
    ],
    wave: [
      ['M0 28Q25 4 50 28T100 28L100 52Q75 28 50 52T0 52Z', 1],
      ['M0 78Q25 60 50 78T100 78L100 92Q75 74 50 92T0 92Z', 2],
    ],
    dots: [
      ['M5 25a20 20 0 1 0 40 0a20 20 0 1 0 -40 0Z', 1],
      ['M63 75a12 12 0 1 0 24 0a12 12 0 1 0 -24 0Z', 2],
      ['M69 25a6 6 0 1 0 12 0a6 6 0 1 0 -12 0Z', 3],
    ],
    leaf: [
      ['M8 92C8 40 40 8 92 8C92 60 60 92 8 92Z', 1],
      ['M8 92L92 8', -1],
      ['M70 78a8 8 0 1 0 16 0a8 8 0 1 0 -16 0Z', 3],
    ],
  };
  const SYM = {
    p1: { ops: ['id', 'id', 'id', 'id'] },
    p2: { ops: ['id', 'r180', 'r180', 'id'] },
    pm: { ops: ['id', 'id', 'my', 'my'] },
    pmm: { ops: ['id', 'mx', 'my', 'r180'] },
    p4: { ops: ['id', 'r90', 'r270', 'r180'] },
    p4m: { ops: ['id', 'r90', 'r270', 'r180'], diag: true },
  };
  const HARM = {
    analogous: [0, 32, -32],
    complement: [0, 180, 24],
    triadic: [0, 120, 240],
    split: [0, 150, 210],
  };
  const hsl = (h, s, l) => {
    h = ((h % 360) + 360) % 360;
    s /= 100;
    l /= 100;
    const k = (n) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    const x = (v) =>
      Math.round(v * 255)
        .toString(16)
        .padStart(2, '0');
    return ('#' + x(f(0)) + x(f(8)) + x(f(4))).toUpperCase();
  };
  const lum = (hex) => {
    const c = [1, 3, 5]
      .map((i) => parseInt(hex.substr(i, 2), 16) / 255)
      .map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const contrast = (a, b) => {
    const x = lum(a),
      y = lum(b);
    return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
  };
  const palette = (h, harm, ground) => {
    const o = HARM[harm];
    const paper = ground === 'paper';
    const bg = paper ? hsl(h + o[1], 18, 95) : hsl(h, 28, 9);
    let l1 = paper ? 44 : 64;
    let c1 = hsl(h + o[0], 72, l1);
    for (let i = 0; i < 12 && contrast(c1, bg) < 3.2; i++) {
      l1 += paper ? -3 : 3;
      c1 = hsl(h + o[0], 72, l1);
    }
    return {
      bg,
      c1,
      c2: hsl(h + o[1], 64, paper ? 66 : 42),
      c3: hsl(h + o[2], 80, paper ? 30 : 74),
      line: paper ? '#121212' : '#F1F1EC',
    };
  };
  const op = (name, qx, qy, c) => {
    const s = c / 100;
    switch (name) {
      case 'mx':
        return `translate(${qx + c} ${qy}) scale(${-s} ${s})`;
      case 'my':
        return `translate(${qx} ${qy + c}) scale(${s} ${-s})`;
      case 'r180':
        return `translate(${qx + c} ${qy + c}) scale(${-s} ${-s})`;
      case 'r90':
        return `translate(${qx + c} ${qy}) rotate(90) scale(${s})`;
      case 'r270':
        return `translate(${qx} ${qy + c}) rotate(-90) scale(${s})`;
      default:
        return `translate(${qx} ${qy}) scale(${s})`;
    }
  };
  const build = (cfg, T, pal, sw) => {
    const c = T / 2;
    const sym = SYM[cfg.sym];
    const shapesSrc = MOTIFS[cfg.motif];
    const roles = [pal.bg, pal.c1, pal.c2, pal.c3];
    const offsets =
      cfg.grid === 'brick'
        ? [
            [0, 0],
            [T / 2, T],
            [-T / 2, T],
          ]
        : [[0, 0]];
    const quads = [
      [0, 0],
      [c, 0],
      [0, c],
      [c, c],
    ];
    const shapes = [];
    offsets.forEach(([ox, oy]) =>
      quads.forEach(([qx, qy], qi) => {
        const base = op(sym.ops[qi], qx + ox, qy + oy, c);
        const layers = sym.diag ? [base, base + ' matrix(0 1 1 0 0 0)'] : [base];
        layers.forEach((t) =>
          shapesSrc.forEach(([d, r]) =>
            shapes.push({
              d,
              t,
              fill: r < 0 ? 'none' : roles[r],
              stroke: r < 0 || sw > 0 ? pal.line : 'none',
              sw: r < 0 ? Math.max(sw, 1) : sw,
            }),
          ),
        );
      }),
    );
    return { w: T, h: cfg.grid === 'brick' ? 2 * T : T, shapes };
  };
  const rng = (a) => () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return { MOTIFS, SYM, HARM, hsl, contrast, palette, build, rng };
}
