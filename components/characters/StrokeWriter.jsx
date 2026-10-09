import React, { useMemo, useRef, useState } from 'react';
import { View, Text, PanResponder, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { G, Path, Line, Rect } from 'react-native-svg';
import STROKE_DATA from '../../data/characters/strokeData';
import { STROKE_COLORS } from './StrokeAnimator';
import { DEEP_NAVY, SLATE_TEAL, WARM_ORANGE, CARD_WHITE, SUCCESS } from '../../constants/colors';

// Same coordinate space as StrokeAnimator: 1024x1024 with the y-axis pointing
// up, so rendering flips it back with translate(0,900) scale(1,-1).
const VIEWBOX = 1024;
const FLIP_Y = 900;

const GUIDE_COLOR = 'rgba(0,0,0,0.07)';
const GRID_COLOR = 'rgba(196,80,58,0.28)';
const HINT_AFTER_MISSES = 2;

// Thresholds live in viewBox units. They are intentionally forgiving — a
// fingertip covers a lot of a 1024-unit square — and scale with how long the
// stroke actually is so a short 点 is not judged like a full-width 横.
function thresholdsFor(median, leniency) {
  const len = polylineLength(median);
  return {
    start: clamp(len * 0.55, 190, 420) * leniency,
    end:   clamp(len * 0.60, 210, 460) * leniency,
    shape: clamp(len * 0.30, 110, 240) * leniency,
  };
}

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

function polylineLength(pts) {
  let n = 0;
  for (let i = 1; i < pts.length; i++) n += dist(pts[i], pts[i - 1]);
  return n;
}

// Shortest distance from a point to a line segment.
function distToSegment(p, a, b) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return dist(p, a);
  let t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len2;
  t = clamp(t, 0, 1);
  return dist(p, [a[0] + t * dx, a[1] + t * dy]);
}

const distToPolyline = (p, pts) => {
  let best = Infinity;
  for (let i = 1; i < pts.length; i++) best = Math.min(best, distToSegment(p, pts[i - 1], pts[i]));
  return best;
};

/**
 * Is this traced path an acceptable attempt at the expected stroke?
 * Mirrors what a stroke-order quiz checks: right place, right direction,
 * roughly the right shape.
 */
export function gradeStroke(userPts, median, leniency = 1) {
  if (!userPts || userPts.length < 2 || !median || median.length < 2) return false;

  const t = thresholdsFor(median, leniency);
  const first = userPts[0];
  const last = userPts[userPts.length - 1];
  const mFirst = median[0];
  const mLast = median[median.length - 1];

  // Drawn backwards? Reject before anything else — direction is the point.
  if (dist(first, mLast) < dist(first, mFirst)) return false;

  if (dist(first, mFirst) > t.start) return false;
  if (dist(last, mLast) > t.end) return false;

  const avg = userPts.reduce((sum, p) => sum + distToPolyline(p, median), 0) / userPts.length;
  return avg <= t.shape;
}

export default function StrokeWriter({
  char,
  size = 280,
  leniency = 1,
  onComplete,
}) {
  const data = STROKE_DATA[char];
  const strokes = data?.strokes ?? [];
  const medians = data?.medians ?? [];

  const [done, setDone] = useState(0);       // strokes completed so far
  const [trace, setTrace] = useState([]);    // live finger path, screen px
  const [misses, setMisses] = useState(0);   // misses on the current stroke
  const [totalMisses, setTotalMisses] = useState(0);
  const [flash, setFlash] = useState(null);  // 'right' | 'wrong'

  const traceRef = useRef([]);
  const doneRef = useRef(0);
  doneRef.current = done;

  const complete = strokes.length > 0 && done >= strokes.length;

  // Screen pixels -> the flipped data space the medians live in.
  const toData = (x, y) => [
    (x * VIEWBOX) / size,
    FLIP_Y - (y * VIEWBOX) / size,
  ];

  const finish = (pts) => {
    const i = doneRef.current;
    const median = medians[i];
    const dataPts = pts.map(([x, y]) => toData(x, y));

    if (gradeStroke(dataPts, median, leniency)) {
      const next = i + 1;
      setDone(next);
      setMisses(0);
      setFlash('right');
      setTimeout(() => setFlash(null), 350);
      if (next >= strokes.length) onComplete?.({ totalMisses });
    } else {
      setMisses(m => m + 1);
      setTotalMisses(m => m + 1);
      setFlash('wrong');
      setTimeout(() => setFlash(null), 350);
    }
    setTrace([]);
    traceRef.current = [];
  };

  const pan = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => !complete,
    onMoveShouldSetPanResponder: () => !complete,
    onPanResponderGrant: (e) => {
      const { locationX, locationY } = e.nativeEvent;
      traceRef.current = [[locationX, locationY]];
      setTrace(traceRef.current);
    },
    onPanResponderMove: (e) => {
      const { locationX, locationY } = e.nativeEvent;
      const pts = traceRef.current;
      const last = pts[pts.length - 1];
      // Skip micro-movements so we are not re-rendering on every pixel.
      if (!last || Math.hypot(locationX - last[0], locationY - last[1]) > 5) {
        traceRef.current = [...pts, [locationX, locationY]];
        setTrace(traceRef.current);
      }
    },
    onPanResponderRelease: () => finish(traceRef.current),
    onPanResponderTerminate: () => { setTrace([]); traceRef.current = []; },
  }), [complete, size, leniency, strokes.length, totalMisses]);

  const reset = () => {
    setDone(0); setMisses(0); setTotalMisses(0); setTrace([]); traceRef.current = [];
  };

  if (!data) {
    return (
      <View style={[styles.canvas, { width: size, height: size }]}>
        <Text style={styles.noData}>no stroke data for {char}</Text>
      </View>
    );
  }

  const showHint = misses >= HINT_AFTER_MISSES && !complete;
  const hintMedian = medians[done];

  // Live trace is drawn in plain viewBox coordinates (no flip), since it comes
  // straight from screen touches.
  const tracePath = trace.length
    ? trace.map(([x, y], i) =>
        `${i === 0 ? 'M' : 'L'} ${(x * VIEWBOX) / size} ${(y * VIEWBOX) / size}`).join(' ')
    : '';

  const hintPath = showHint && hintMedian
    ? hintMedian.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ')
    : '';

  return (
    <View>
      <View
        style={[
          styles.canvas,
          { width: size, height: size },
          flash === 'right' && styles.flashRight,
          flash === 'wrong' && styles.flashWrong,
        ]}
        {...pan.panHandlers}
      >
        <Svg width={size} height={size} viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}>
          {/* 田字格 practice grid */}
          <Rect x={2} y={2} width={VIEWBOX - 4} height={VIEWBOX - 4}
                fill="none" stroke={GRID_COLOR} strokeWidth={3} />
          <Line x1={VIEWBOX / 2} y1={0} x2={VIEWBOX / 2} y2={VIEWBOX}
                stroke={GRID_COLOR} strokeWidth={2} strokeDasharray="14,14" />
          <Line x1={0} y1={VIEWBOX / 2} x2={VIEWBOX} y2={VIEWBOX / 2}
                stroke={GRID_COLOR} strokeWidth={2} strokeDasharray="14,14" />

          <G transform={`translate(0, ${FLIP_Y}) scale(1, -1)`}>
            {/* Faint whole character as the thing to aim at */}
            {strokes.map((d, i) => (
              <Path key={`guide-${i}`} d={d} fill={GUIDE_COLOR} />
            ))}

            {/* Strokes already written, in their stroke-order colour */}
            {strokes.slice(0, done).map((d, i) => (
              <Path key={`done-${i}`} d={d} fill={STROKE_COLORS[i % STROKE_COLORS.length]} />
            ))}

            {/* After a couple of misses, show where the next stroke goes */}
            {!!hintPath && (
              <Path
                d={hintPath}
                fill="none"
                stroke={WARM_ORANGE}
                strokeWidth={18}
                strokeDasharray="30,26"
                strokeLinecap="round"
                opacity={0.9}
              />
            )}
          </G>

          {/* The finger trace, in untransformed screen space */}
          {!!tracePath && (
            <Path
              d={tracePath}
              fill="none"
              stroke={SLATE_TEAL}
              strokeWidth={26}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.75}
            />
          )}
        </Svg>
      </View>

      <View style={styles.footer}>
        <Text style={styles.progress}>
          {complete ? 'Done' : `Stroke ${done + 1} of ${strokes.length}`}
          {totalMisses > 0 && !complete ? `  ·  ${totalMisses} retr${totalMisses === 1 ? 'y' : 'ies'}` : ''}
        </Text>
        <TouchableOpacity onPress={reset} activeOpacity={0.7}>
          <Text style={styles.resetLink}>↻ clear</Text>
        </TouchableOpacity>
      </View>

      {complete && (
        <Text style={styles.doneNote}>
          {totalMisses === 0 ? 'Perfect — no retries ✓' : `Written ✓  (${totalMisses} retries)`}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    backgroundColor: CARD_WHITE, borderRadius: 14, overflow: 'hidden',
    borderWidth: 2, borderColor: 'rgba(155,104,70,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  flashRight: { borderColor: SUCCESS },
  flashWrong: { borderColor: '#C4503A' },
  noData: { fontSize: 12, color: '#C4503A', textAlign: 'center', padding: 12 },

  footer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: 8, paddingHorizontal: 2,
  },
  progress:  { fontSize: 14, fontWeight: '700', color: SLATE_TEAL },
  resetLink: { fontSize: 14, fontWeight: '700', color: WARM_ORANGE },
  doneNote:  { fontSize: 15, fontWeight: '800', color: DEEP_NAVY, marginTop: 6, textAlign: 'center' },
});
