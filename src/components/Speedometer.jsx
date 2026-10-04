import { useEffect, useRef, useState } from 'react';
import { motion, useInView, animate } from 'framer-motion';

export default function Speedometer({
  value,
  max,
  label,
  unit = '',
  size = 210,
  dark = false,
  displayValue,
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const [display, setDisplay] = useState(0);

  const fraction = Math.max(0, Math.min(1, value / max));
  const a = Math.PI * (1 - fraction);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, displayValue ?? value, {
      duration: 1.5,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value, displayValue]);

  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.3;
  const pivotY = cy + r * 0.32;
  const needleLen = r * 1.14;
  const tipX = cx + needleLen * Math.cos(a);
  const tipY = pivotY - needleLen * Math.sin(a);

  const textColor = dark ? '#ffffff' : '#111111';
  const subColor = dark ? 'rgba(255,255,255,0.5)' : '#666666';
  const tickColor = dark ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.22)';
  const trackColor = dark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.08)';
  const accent = '#132853';

  const ticks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div ref={ref} style={{ textAlign: 'center', width: size }}>
      <svg width={size} height={Math.round(size * 0.6)} viewBox={`0 0 ${size} ${Math.round(size * 0.6)}`}>
        <path
          d={`M ${cx - r} ${pivotY} A ${r} ${r} 0 0 1 ${cx + r} ${pivotY}`}
          fill="none" stroke={trackColor} strokeWidth={Math.max(3, size * 0.026)} strokeLinecap="round"
        />
        <motion.path
          d={`M ${cx - r} ${pivotY} A ${r} ${r} 0 0 1 ${cx + r} ${pivotY}`}
          fill="none" stroke={accent} strokeWidth={Math.max(3, size * 0.026)} strokeLinecap="round"
          pathLength={1}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: inView ? fraction : 0 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
        {ticks.map((f) => {
          const ang = Math.PI * (1 - f);
          const inner = r - size * 0.1;
          const outer = r - size * 0.04;
          return (
            <line
              key={f}
              x1={cx + outer * Math.cos(ang)} y1={pivotY - outer * Math.sin(ang)}
              x2={cx + inner * Math.cos(ang)} y2={pivotY - inner * Math.sin(ang)}
              stroke={tickColor} strokeWidth={1.5} strokeLinecap="round"
            />
          );
        })}
        {[0, 0.5, 1].map((f) => {
          const ang = Math.PI * (1 - f);
          const lr = r - size * 0.17;
          return (
            <text
              key={f}
              x={cx + lr * Math.cos(ang)} y={pivotY - lr * Math.sin(ang) + size * 0.028}
              textAnchor="middle" fill={subColor}
              style={{ fontSize: size * 0.052, fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight: 700 }}
            >
              {Math.round(max * f)}
            </text>
          );
        })}
        <motion.line
          x1={cx} y1={pivotY}
          initial={{ x2: cx - needleLen, y2: pivotY }}
          animate={{ x2: tipX, y2: tipY }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          stroke={accent} strokeWidth={Math.max(2, size * 0.013)} strokeLinecap="round"
        />
        <circle cx={cx} cy={pivotY} r={size * 0.03} fill={accent} />
        <circle cx={cx} cy={pivotY} r={size * 0.013} fill={dark ? '#0a0a0a' : '#ffffff'} />
      </svg>

      <div style={{ marginTop: -size * 0.05, fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight: 800, fontSize: size * 0.135, color: textColor, letterSpacing: '-0.02em', lineHeight: 1 }}>
        {display}
        {unit && <span style={{ fontSize: size * 0.065, color: subColor, fontWeight: 600, marginLeft: 5 }}>{unit}</span>}
      </div>
      <div style={{ fontSize: size * 0.052, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: subColor, marginTop: 6 }}>
        {label}
      </div>
    </div>
  );
}
