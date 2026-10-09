import React, { useEffect, useMemo, useRef, useId } from 'react';
import { Animated, View } from 'react-native';
import Svg, { G, Path, Defs, ClipPath } from 'react-native-svg';
import STROKE_DATA from '../../data/characters/strokeData';
import { DEEP_NAVY, WARM_ORANGE } from '../../constants/colors';

const AnimatedPath = Animated.createAnimatedComponent(Path);

// hanzi-writer-data lives in a 1024x1024 space with the y-axis pointing up,
// so the whole drawing is flipped back with translate(0,900) scale(1,-1).
const VIEWBOX = 1024;
const FLIP = 'translate(0, 900) scale(1, -1)';

// Wide enough that the median line fills the stroke outline it is clipped to.
const INK_WIDTH = 128;
const GUIDE_COLOR = 'rgba(0,0,0,0.08)';

// One colour per stroke, in writing order — so a character reads as its parts
// and the colour itself tells you which stroke came when. Cycles for long
// characters. Chosen to stay legible on the cream art stage.
export const STROKE_COLORS = [
  '#1467A3', // ocean blue
  '#B63E2C', // earth red
  '#296614', // deep green
  '#DE692F', // burnt orange
  '#6B4FA0', // violet
  '#0E7C86', // teal
];

const STROKE_DURATION = 620;
const STROKE_GAP = 140;
const LOOP_PAUSE = 700; // beat between loop iterations so the finished shape reads

// medians are polylines, so exact length is just the sum of the segments.
function medianLength(points) {
  let len = 0;
  for (let i = 1; i < points.length; i++) {
    len += Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
  }
  return Math.max(len, 1); // a 1-point median would otherwise give a 0-length dash
}

function medianToPath(points) {
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');
}

export default function StrokeAnimator({
  char,
  size = 200,
  highlightStroke = null,
  hideStroke = null,
  revealUpTo = null, // show only the first N strokes; the newest one draws itself
  loop = false,      // restart forever — for stroke demos that should never sit still
  colored = false,   // give each stroke its own colour instead of one ink colour
  onComplete,
}) {
  const data = STROKE_DATA[char];
  const strokes = data?.strokes ?? [];
  const medians = data?.medians ?? [];

  // Stable, SVG-safe prefix so several animators on one screen never collide.
  const rawId = useId();
  const uid = useMemo(() => `sa${rawId.replace(/[^a-zA-Z0-9]/g, '')}`, [rawId]);

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const paths = useMemo(
    () => medians.map(m => ({ d: medianToPath(m), length: medianLength(m) })),
    [char],
  );

  // One driver per stroke: 0 = not yet drawn, 1 = fully drawn.
  const progress = useMemo(() => strokes.map(() => new Animated.Value(0)), [char]);

  const visible = useMemo(
    () => strokes
      .map((_, i) => i)
      .filter(i => i !== hideStroke)
      .filter(i => revealUpTo == null || i < revealUpTo),
    [char, hideStroke, revealUpTo],
  );

  useEffect(() => {
    if (!data) return undefined;

    let animated;
    if (highlightStroke != null) {
      // One stroke is the subject; the rest are already-written context.
      animated = visible.filter(i => i === highlightStroke);
    } else if (revealUpTo != null) {
      // Progressive build: only the stroke just revealed draws itself.
      animated = visible.filter(i => i === revealUpTo - 1);
    } else {
      animated = visible;
    }

    let seq = null;
    let timer = null;
    let cancelled = false;

    const run = () => {
      if (cancelled) return;
      visible.forEach(i => progress[i].setValue(animated.includes(i) ? 0 : 1));
      if (hideStroke != null && progress[hideStroke]) progress[hideStroke].setValue(0);

      const steps = [];
      animated.forEach((i, idx) => {
        if (idx > 0) steps.push(Animated.delay(STROKE_GAP));
        steps.push(
          Animated.timing(progress[i], {
            toValue: 1,
            duration: STROKE_DURATION,
            useNativeDriver: false, // strokeDashoffset is not a native-driver prop
          }),
        );
      });

      seq = Animated.sequence(steps);
      seq.start(({ finished }) => {
        if (!finished || cancelled) return;
        onCompleteRef.current?.();
        if (loop) timer = setTimeout(run, LOOP_PAUSE);
      });
    };

    run();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      if (seq) seq.stop();
    };
  }, [char, highlightStroke, hideStroke, revealUpTo, loop, data, progress, visible]);

  if (!data) return <View style={{ width: size, height: size }} />;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}>
      <Defs>
        {strokes.map((d, i) => (
          <ClipPath key={`${uid}-clip-${i}`} id={`${uid}-clip-${i}`}>
            <Path d={d} />
          </ClipPath>
        ))}
      </Defs>

      <G transform={FLIP}>
        {/* Light grey guide. A hidden stroke is left out so missing-stroke
            questions aren't given away by its silhouette. */}
        {visible.map(i => (
          <Path key={`${uid}-guide-${i}`} d={strokes[i]} fill={GUIDE_COLOR} />
        ))}

        {visible.map(i => (
          <G key={`${uid}-ink-${i}`} clipPath={`url(#${uid}-clip-${i})`}>
            <AnimatedPath
              d={paths[i].d}
              fill="none"
              stroke={
                i === highlightStroke
                  ? WARM_ORANGE
                  : colored
                    ? STROKE_COLORS[i % STROKE_COLORS.length]
                    : DEEP_NAVY
              }
              strokeWidth={INK_WIDTH}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={[paths[i].length, paths[i].length]}
              strokeDashoffset={progress[i].interpolate({
                inputRange: [0, 1],
                outputRange: [paths[i].length, 0],
              })}
            />
          </G>
        ))}
      </G>
    </Svg>
  );
}
