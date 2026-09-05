// Flat, geometric SVG illustrations for the app's "illustrated travel app" theme.
// Deliberately built from primitive shapes (no image assets, no emoji) so they render
// identically everywhere and stay crisp at any size.
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path, Polygon, Rect, Ellipse, Line } from 'react-native-svg';
import { COLORS } from '../theme/colors';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Full hero scene: sky, sun, layered hills, pine trees, a small farmhouse.
// Used on the Welcome screen and can be reused anywhere a big illustrated banner is wanted.
export function HeroScene({ height = 320, showHouse = true }: { height?: number; showHouse?: boolean }) {
  return (
    <Svg width="100%" height={height} viewBox="0 0 320 320" preserveAspectRatio="xMidYMax slice">
      {/* Sky */}
      <Rect x={0} y={0} width={320} height={320} fill={COLORS.primaryLight} />

      {/* Clouds */}
      <CloudCluster cx={60} cy={54} />
      <CloudCluster cx={230} cy={40} scale={0.8} />

      {/* Sun glow */}
      <Circle cx={160} cy={80} r={34} fill="#F5EAC2" opacity={0.9} />

      {/* Far mountain */}
      <Polygon points="0,210 90,90 180,210" fill={COLORS.primary} opacity={0.55} />
      <Polygon points="140,210 240,110 320,210" fill={COLORS.primary} opacity={0.55} />

      {/* Near rolling hills */}
      <Path d="M0,230 Q80,180 160,220 T320,215 V320 H0 Z" fill={COLORS.primary} opacity={0.85} />
      <Path d="M0,260 Q90,225 190,255 T320,250 V320 H0 Z" fill={COLORS.primaryDark} />

      {/* Pine trees */}
      <PineTree x={40} y={250} scale={1} />
      <PineTree x={70} y={262} scale={0.7} />
      <PineTree x={260} y={252} scale={1.1} />
      <PineTree x={288} y={266} scale={0.65} />

      {showHouse ? <Farmhouse x={150} y={252} /> : null}
    </Svg>
  );
}

// Smaller banner variant (sun + hills only) for detail-style headers.
export function SunHillsBanner({ height = 160 }: { height?: number }) {
  return (
    <Svg width="100%" height={height} viewBox="0 0 320 160" preserveAspectRatio="xMidYMax slice">
      <Rect x={0} y={0} width={320} height={160} fill={COLORS.primaryLight} />
      <Circle cx={250} cy={44} r={26} fill="#F5EAC2" />
      <Polygon points="0,120 70,60 140,120" fill={COLORS.primary} opacity={0.6} />
      <Polygon points="90,120 170,70 260,120" fill={COLORS.primary} opacity={0.6} />
      <Path d="M0,130 Q80,100 160,125 T320,120 V160 H0 Z" fill={COLORS.primaryDark} />
      <PineTree x={30} y={122} scale={0.8} />
      <PineTree x={280} y={124} scale={0.9} />
    </Svg>
  );
}

// A hiker walking toward the mountains — used as the header illustration on the auth screens.
export function HikerScene({ height = 240 }: { height?: number }) {
  return (
    <Svg width="100%" height={height} viewBox="0 0 320 240" preserveAspectRatio="xMidYMax slice">
      <Rect x={0} y={0} width={320} height={240} fill={COLORS.primaryLight} />
      <Circle cx={252} cy={48} r={24} fill={COLORS.accent} opacity={0.9} />
      <CloudCluster cx={70} cy={42} scale={0.75} />
      <CloudCluster cx={240} cy={100} scale={0.55} />

      {/* Mountains */}
      <Polygon points="10,180 80,70 150,180" fill={COLORS.primary} />
      <Polygon points="80,180 130,110 180,180" fill={COLORS.primaryDark} opacity={0.75} />
      <Polygon points="160,180 235,85 310,180" fill={COLORS.primary} />
      <Polygon points="215,133 235,85 255,133" fill="#F2EEE3" opacity={0.75} />
      <Polygon points="60,120 80,70 100,120" fill="#F2EEE3" opacity={0.75} />

      {/* Ground */}
      <Path d="M0,186 Q80,168 170,186 T320,180 V240 H0 Z" fill={COLORS.primaryDark} />

      {/* Pines flanking the walker */}
      <PineTree x={34} y={200} scale={0.9} />
      <PineTree x={58} y={210} scale={0.6} />
      <PineTree x={276} y={202} scale={1} />
      <PineTree x={299} y={212} scale={0.65} />

      <Hiker x={160} y={206} />
    </Svg>
  );
}

function Hiker({ x, y }: { x: number; y: number }) {
  return (
    <>
      {/* Back leg + front leg */}
      <Path d={`M${x - 2},${y - 34} L${x - 12},${y - 4}`} stroke={COLORS.textPrimary} strokeWidth={7} strokeLinecap="round" />
      <Path d={`M${x + 2},${y - 34} L${x + 12},${y - 6}`} stroke={COLORS.textPrimary} strokeWidth={7} strokeLinecap="round" />
      <Ellipse cx={x - 15} cy={y - 2} rx={6} ry={3} fill={COLORS.accentDark} />
      <Ellipse cx={x + 15} cy={y - 4} rx={6} ry={3} fill={COLORS.accentDark} />

      {/* Torso */}
      <Path d={`M${x - 8},${y - 62} h16 a4,4 0 0 1 4,4 v22 a4,4 0 0 1 -4,4 h-16 a4,4 0 0 1 -4,-4 v-22 a4,4 0 0 1 4,-4 z`} fill="#FFFFFF" />
      {/* Backpack */}
      <Rect x={x - 19} y={y - 60} width={12} height={22} rx={5} fill={COLORS.accent} />
      {/* Arm + trekking pole */}
      <Path d={`M${x + 7},${y - 55} L${x + 16},${y - 40}`} stroke="#F0C9A4" strokeWidth={5} strokeLinecap="round" />
      <Path d={`M${x + 17},${y - 44} L${x + 20},${y - 2}`} stroke={COLORS.primaryDark} strokeWidth={2.5} strokeLinecap="round" />
      {/* Head + hair */}
      <Circle cx={x + 1} cy={y - 71} r={8} fill="#F0C9A4" />
      <Path d={`M${x - 7},${y - 73} a8,8 0 0 1 16,-2 l0,-3 a9,9 0 0 0 -17,3 z`} fill={COLORS.textPrimary} />
    </>
  );
}

// Empty-state illustration for the Journey History tab.
export function RouteEmptyState({ height = 150 }: { height?: number }) {
  return (
    <Svg width={220} height={height} viewBox="0 0 220 150">
      <Ellipse cx={110} cy={132} rx={92} ry={12} fill={COLORS.tintGreen} />
      <Path d="M28,124 Q52,66 96,86 Q142,106 176,36" stroke={COLORS.primaryLight} strokeWidth={6} fill="none" strokeLinecap="round" strokeDasharray="2 14" />
      <Circle cx={28} cy={124} r={9} fill={COLORS.primary} />
      <Path d="M176,14 a15,15 0 0 1 15,15 c0,11 -15,25 -15,25 c0,0 -15,-14 -15,-25 a15,15 0 0 1 15,-15 z" fill={COLORS.accent} />
      <Circle cx={176} cy={29} r={5.5} fill={COLORS.bg} />
      <PineTree x={62} y={128} scale={0.75} />
      <PineTree x={148} y={128} scale={0.6} />
    </Svg>
  );
}

// Empty-state illustration for the Contacts tab.
export function PeopleEmptyState({ height = 150 }: { height?: number }) {
  return (
    <Svg width={220} height={height} viewBox="0 0 220 150">
      <Ellipse cx={110} cy={132} rx={86} ry={12} fill={COLORS.tintBlue} />
      <Circle cx={78} cy={54} r={20} fill={COLORS.primary} />
      <Path d="M42,128 Q42,84 78,84 Q114,84 114,128 Z" fill={COLORS.primary} />
      <Circle cx={134} cy={64} r={16} fill={COLORS.accent} />
      <Path d="M105,128 Q105,92 134,92 Q163,92 163,128 Z" fill={COLORS.accent} />
      <Circle cx={186} cy={40} r={8} fill={COLORS.tintYellow} />
      <Circle cx={32} cy={38} r={5} fill={COLORS.tintYellow} />
    </Svg>
  );
}

// Two clouds drifting slowly across the sky — layered on top of a static scene to give the
// landing page (or any banner) motion without animating the illustration's geometry itself.
// `height` scales the clouds' vertical position proportionally so this works on both the tall
// Welcome hero and a short in-app banner strip.
export function DriftingClouds({ width, height = 420 }: { width: number; height?: number }) {
  const slow = useRef(new Animated.Value(0)).current;
  const fast = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const drift = (value: Animated.Value, duration: number) =>
      Animated.loop(
        Animated.timing(value, {
          toValue: 1,
          duration,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );

    const a = drift(slow, 26000);
    const b = drift(fast, 17000);
    a.start();
    b.start();
    return () => {
      a.stop();
      b.stop();
    };
  }, [slow, fast]);

  // Travels from just off the left edge to just off the right edge, then wraps.
  const track = (value: Animated.Value) =>
    value.interpolate({ inputRange: [0, 1], outputRange: [-120, width + 40] });
  const scale = height / 420;

  return (
    <>
      <Animated.View style={[styles.cloud, { top: 64 * scale, transform: [{ translateX: track(slow) }] }]} pointerEvents="none">
        <SingleCloud scale={scale} />
      </Animated.View>
      <Animated.View style={[styles.cloud, { top: 132 * scale, transform: [{ translateX: track(fast) }] }]} pointerEvents="none">
        <SingleCloud scale={0.65 * scale} />
      </Animated.View>
    </>
  );
}

// A small traveler that walks across a banner, left to right on a loop, with a gentle up/down
// bounce — the "moving object related to the journey" touch on otherwise-static scenes.
export function WalkingTraveler({ width, bottom = 12 }: { width: number; bottom?: number }) {
  const x = useRef(new Animated.Value(0)).current;
  const bob = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const walk = Animated.loop(
      Animated.timing(x, { toValue: 1, duration: 7000, easing: Easing.linear, useNativeDriver: true })
    );
    const bounce = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: 260, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: 260, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    walk.start();
    bounce.start();
    return () => {
      walk.stop();
      bounce.stop();
    };
  }, [x, bob]);

  const translateX = x.interpolate({ inputRange: [0, 1], outputRange: [-24, width + 24] });
  const translateY = bob.interpolate({ inputRange: [0, 1], outputRange: [0, -4] });

  return (
    <Animated.View
      style={[styles.traveler, { bottom, transform: [{ translateX }, { translateY }] }]}
      pointerEvents="none"
    >
      <Svg width={20} height={26} viewBox="0 0 20 26">
        <Circle cx={10} cy={5} r={5} fill={COLORS.textPrimary} />
        <Rect x={7.5} y={11} width={5} height={9} rx={2.5} fill={COLORS.accentDark} />
        <Path d="M8,13 L2,20 M12,13 L18,19" stroke={COLORS.accentDark} strokeWidth={2.5} strokeLinecap="round" />
      </Svg>
    </Animated.View>
  );
}

// The "you made it" moment when a journey ends: a checkmark badge settles in, then a burst of
// small dots flies outward and fades — a one-shot celebration, distinct from the looping
// ReadyPulse used on the wizard's review step.
export function JourneyCompleteBurst({ size = 220 }: { size?: number }) {
  const badge = useRef(new Animated.Value(0)).current;
  const burst = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(badge, { toValue: 1, friction: 5, tension: 90, useNativeDriver: true }),
      Animated.timing(burst, { toValue: 1, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
    ]).start();
  }, [badge, burst]);

  const center = size / 2;
  const radius = size * 0.42;
  const particleColors = [COLORS.accent, COLORS.primary, COLORS.warning, COLORS.primaryLight, COLORS.accentDark];
  const particleCount = 10;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={StyleSheet.absoluteFill}>
        {Array.from({ length: particleCount }).map((_, i) => {
          const angle = (i / particleCount) * Math.PI * 2;
          const cx = burst.interpolate({ inputRange: [0, 1], outputRange: [center, center + Math.cos(angle) * radius] });
          const cy = burst.interpolate({ inputRange: [0, 1], outputRange: [center, center + Math.sin(angle) * radius] });
          const opacity = burst.interpolate({ inputRange: [0, 0.6, 1], outputRange: [1, 1, 0] });
          const r = burst.interpolate({ inputRange: [0, 1], outputRange: [5, 2] });
          return <AnimatedCircle key={i} cx={cx} cy={cy} r={r} fill={particleColors[i % particleColors.length]} opacity={opacity} />;
        })}
      </Svg>
      <Animated.View style={{ transform: [{ scale: badge }] }}>
        <Svg width={90} height={90} viewBox="0 0 80 80">
          <Circle cx={40} cy={40} r={34} fill={COLORS.success} />
          <Path d="M25,41 L35,51 L56,28" stroke="white" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </Svg>
      </Animated.View>
    </View>
  );
}

// The full "you made it" scenario when a journey ends: a traveler walks the last stretch home,
// arrives, and the house pops with a burst of celebration — a mini scene rather than an abstract
// badge, so it actually reads as "journey complete" and not just "success."
export function JourneyCompleteScene({ width = 260, height = 190 }: { width?: number; height?: number }) {
  const walk = useRef(new Animated.Value(0)).current;
  const arrive = useRef(new Animated.Value(0)).current;
  const bob = useRef(new Animated.Value(0)).current;
  const sun = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const bounce = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: 220, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: 220, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    bounce.start();

    Animated.timing(sun, { toValue: 1, duration: 1800, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();

    Animated.sequence([
      Animated.timing(walk, { toValue: 1, duration: 1150, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.spring(arrive, { toValue: 1, friction: 5, tension: 90, useNativeDriver: false }),
    ]).start();

    return () => bounce.stop();
  }, [walk, arrive, bob, sun]);

  const groundY = height * 0.66;
  const houseX = width - 50;
  const travelerX = walk.interpolate({ inputRange: [0, 1], outputRange: [22, houseX - 30] });
  const travelerBob = bob.interpolate({ inputRange: [0, 1], outputRange: [0, -3] });
  const travelerOpacity = walk.interpolate({ inputRange: [0, 0.9, 1], outputRange: [1, 1, 0] });
  const houseScale = arrive.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.14, 1] });
  const sunY = sun.interpolate({ inputRange: [0, 1], outputRange: [42, 20] });
  const sunOpacity = sun.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] });

  const particleColors = [COLORS.accent, COLORS.primary, COLORS.warning, COLORS.primaryLight];
  const particleCount = 9;
  const houseCenterY = groundY - 34;

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Rect x={0} y={0} width={width} height={height} fill={COLORS.tintGreen} />
        <AnimatedCircle cx={width * 0.2} cy={sunY} r={16} fill={COLORS.tintYellow} opacity={sunOpacity} />
        <Path d={`M0,${groundY} L${width},${groundY}`} stroke={COLORS.primaryDark} strokeWidth={3} opacity={0.35} />
        <Path
          d={`M12,${groundY} L${houseX - 14},${groundY}`}
          stroke={COLORS.primary}
          strokeWidth={3}
          strokeDasharray={[8, 8]}
          opacity={0.55}
        />
      </Svg>

      {/* Arrival burst, layered above the ground but below the house/traveler */}
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={StyleSheet.absoluteFill} pointerEvents="none">
        {Array.from({ length: particleCount }).map((_, i) => {
          const angle = (i / particleCount) * Math.PI * 2;
          const cx = arrive.interpolate({ inputRange: [0, 1], outputRange: [houseX, houseX + Math.cos(angle) * 50] });
          const cy = arrive.interpolate({ inputRange: [0, 1], outputRange: [houseCenterY, houseCenterY + Math.sin(angle) * 50] });
          const opacity = arrive.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 1, 0] });
          return <AnimatedCircle key={i} cx={cx} cy={cy} r={4} fill={particleColors[i % particleColors.length]} opacity={opacity} />;
        })}
      </Svg>

      <Animated.View
        style={{ position: 'absolute', left: houseX - 30, top: groundY - 60, transform: [{ scale: houseScale }] }}
      >
        <Svg width={60} height={60} viewBox="0 0 60 60">
          <Polygon points="30,6 6,28 54,28" fill={COLORS.accent} />
          <Rect x={12} y={28} width={36} height={26} fill="#F2EEE3" />
          <Rect x={26} y={38} width={10} height={16} fill={COLORS.primaryDark} />
          <Rect x={16} y={32} width={8} height={8} fill={COLORS.tintBlue} />
          <Rect x={36} y={32} width={8} height={8} fill={COLORS.tintBlue} />
        </Svg>
      </Animated.View>

      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: groundY - 34,
          left: 0,
          opacity: travelerOpacity,
          transform: [{ translateX: travelerX }, { translateY: travelerBob }],
        }}
      >
        <Svg width={22} height={30} viewBox="0 0 22 30">
          <Circle cx={11} cy={6} r={6} fill={COLORS.textPrimary} />
          <Rect x={8} y={13} width={6} height={11} rx={3} fill={COLORS.accentDark} />
          <Path d="M9,15 L2,24 M13,15 L20,23" stroke={COLORS.accentDark} strokeWidth={3} strokeLinecap="round" fill="none" />
        </Svg>
      </Animated.View>
    </View>
  );
}

// Continuous expanding-and-fading rings behind a button — used for the standalone SOS button on
// the Safety tab, where the pulse needs to run indefinitely (not settle like ReadyPulse's) to
// keep signaling "this is live and ready" the whole time the screen is open.
export function PulseRings({ size = 160, color = COLORS.danger }: { size?: number; color?: string }) {
  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = (value: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(value, { toValue: 1, duration: 1600, easing: Easing.out(Easing.ease), useNativeDriver: false }),
          Animated.timing(value, { toValue: 0, duration: 0, useNativeDriver: false }),
        ])
      );
    const p1 = pulse(ring1, 0);
    const p2 = pulse(ring2, 800);
    p1.start();
    p2.start();
    return () => {
      p1.stop();
      p2.stop();
    };
  }, [ring1, ring2]);

  const center = size / 2;
  const renderRing = (value: Animated.Value) => (
    <AnimatedCircle
      cx={center}
      cy={center}
      r={value.interpolate({ inputRange: [0, 1], outputRange: [center * 0.55, center] })}
      stroke={color}
      strokeWidth={2.5}
      fill="none"
      opacity={value.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] })}
    />
  );

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={StyleSheet.absoluteFill} pointerEvents="none">
      {renderRing(ring1)}
      {renderRing(ring2)}
    </Svg>
  );
}

// Small header illustration for the Insights tab: an upward trend line draws itself on, with a
// star popping at the peak — "your safety record, trending up."
export function AscendingChart({ width = 200, height = 110 }: { width?: number; height?: number }) {
  const draw = useRef(new Animated.Value(0)).current;
  const star = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(draw, { toValue: 1, duration: 1000, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
      Animated.spring(star, { toValue: 1, friction: 5, tension: 100, useNativeDriver: true }),
    ]).start();
  }, [draw, star]);

  const dashOffset = draw.interpolate({ inputRange: [0, 1], outputRange: [400, 0] });
  const pathD = `M10,${height - 14} L${width * 0.3},${height * 0.55} L${width * 0.55},${height * 0.68} L${width * 0.8},${height * 0.22} L${width - 14},${height * 0.14}`;

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Path d={`M10,${height - 6} L${width - 10},${height - 6}`} stroke={COLORS.border} strokeWidth={2} />
        <AnimatedPath
          d={pathD}
          stroke={COLORS.primary}
          strokeWidth={4}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={[400, 400]}
          strokeDashoffset={dashOffset}
        />
        <Circle cx={10} cy={height - 14} r={5} fill={COLORS.primaryDark} />
      </Svg>
      <Animated.View
        style={{
          position: 'absolute',
          left: width - 14 - 12,
          top: height * 0.14 - 26,
          transform: [{ scale: star }],
        }}
      >
        <Svg width={24} height={24} viewBox="0 0 24 24">
          <Polygon
            points="12,1 15,9 23,9 16.5,14 19,22 12,17 5,22 7.5,14 1,9 9,9"
            fill={COLORS.warning}
          />
        </Svg>
      </Animated.View>
    </View>
  );
}

function SingleCloud({ scale = 1 }: { scale?: number }) {
  const w = 96 * scale;
  const h = 44 * scale;
  return (
    <Svg width={w} height={h} viewBox="0 0 96 44">
      <Ellipse cx={34} cy={24} rx={26} ry={14} fill="#FFFFFF" opacity={0.9} />
      <Ellipse cx={56} cy={28} rx={18} ry={11} fill="#FFFFFF" opacity={0.9} />
      <Ellipse cx={18} cy={30} rx={16} ry={10} fill="#FFFFFF" opacity={0.9} />
    </Svg>
  );
}

const styles = StyleSheet.create({
  cloud: {
    position: 'absolute',
    left: 0,
  },
  routeMarker: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 30,
    height: 30,
    marginLeft: -15,
    marginTop: -15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routePin: {
    position: 'absolute',
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routePinDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2.5,
    borderColor: 'white',
  },
  routeMarkerDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.accent,
    borderWidth: 3,
    borderColor: 'white',
  },
  traveler: {
    position: 'absolute',
    left: 0,
  },
});

function CloudCluster({ cx, cy, scale = 1 }: { cx: number; cy: number; scale?: number }) {
  return (
    <>
      <Ellipse cx={cx} cy={cy} rx={26 * scale} ry={14 * scale} fill="#FFFFFF" opacity={0.85} />
      <Ellipse cx={cx + 20 * scale} cy={cy + 4 * scale} rx={18 * scale} ry={11 * scale} fill="#FFFFFF" opacity={0.85} />
      <Ellipse cx={cx - 18 * scale} cy={cy + 6 * scale} rx={16 * scale} ry={10 * scale} fill="#FFFFFF" opacity={0.85} />
    </>
  );
}

function PineTree({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  const w = 22 * scale;
  const h = 44 * scale;
  return (
    <>
      <Rect x={x - 2} y={y - h * 0.15} width={4} height={h * 0.25} fill="#6B4A2F" />
      <Polygon
        points={`${x},${y - h} ${x - w / 2},${y - h * 0.45} ${x + w / 2},${y - h * 0.45}`}
        fill={COLORS.primaryDark}
      />
      <Polygon
        points={`${x},${y - h * 0.65} ${x - w * 0.42},${y - h * 0.1} ${x + w * 0.42},${y - h * 0.1}`}
        fill={COLORS.primary}
      />
    </>
  );
}

function Farmhouse({ x, y }: { x: number; y: number }) {
  return (
    <>
      <Rect x={x - 26} y={y - 24} width={52} height={30} rx={2} fill="#F2EEE3" />
      <Polygon points={`${x - 30},${y - 24} ${x},${y - 46} ${x + 30},${y - 24}`} fill={COLORS.accent} />
      <Rect x={x - 7} y={y - 14} width={14} height={20} fill={COLORS.primaryDark} />
      <Rect x={x + 10} y={y - 20} width={9} height={9} fill="#DCE8C8" />
      <Rect x={x - 19} y={y - 20} width={9} height={9} fill="#DCE8C8" />
    </>
  );
}

export type BadgeType = 'contacts' | 'history' | 'call' | 'profile' | 'walking' | 'driving' | 'cycling' | 'bus';

const BADGE_TINTS: Record<BadgeType, string> = {
  contacts: COLORS.tintBlue,
  history: COLORS.tintGreen,
  call: COLORS.tintOrange,
  profile: COLORS.tintYellow,
  walking: COLORS.tintGreen,
  driving: COLORS.tintOrange,
  cycling: COLORS.tintBlue,
  bus: COLORS.tintYellow,
};

// Small circular illustrated icon badge, used in place of flat Ionicon tiles wherever the
// design calls for the "little illustrated scene in a circle" look (Quick Actions, transport
// mode pickers, etc).
export function CategoryBadge({ type, size = 56 }: { type: BadgeType; size?: number }) {
  const tint = BADGE_TINTS[type];
  return (
    <Svg width={size} height={size} viewBox="0 0 56 56">
      <Circle cx={28} cy={28} r={28} fill={tint} />
      {renderGlyph(type)}
    </Svg>
  );
}

function renderGlyph(type: BadgeType) {
  switch (type) {
    case 'contacts':
      return (
        <>
          <Circle cx={21} cy={22} r={7} fill={COLORS.primary} />
          <Path d="M9,42 Q9,29 21,29 Q33,29 33,42 Z" fill={COLORS.primary} />
          <Circle cx={36} cy={24} r={5.5} fill={COLORS.primaryLight} />
          <Path d="M27,42 Q27,32 36,32 Q45,32 45,42 Z" fill={COLORS.primaryLight} />
        </>
      );
    case 'history':
      return (
        <>
          <Path d="M12,44 Q18,20 28,26 Q38,32 44,12" stroke={COLORS.primary} strokeWidth={4} fill="none" strokeLinecap="round" />
          <Circle cx={44} cy={12} r={5} fill={COLORS.accent} />
          <Circle cx={12} cy={44} r={5} fill={COLORS.primaryDark} />
        </>
      );
    case 'call':
      return (
        <Path
          d="M18,14 L25,14 L28,23 L23,27 Q27,36 33,40 L37,35 L46,38 L46,45 Q46,48 43,48 Q27,47 18,32 Q10,20 18,14 Z"
          fill={COLORS.accentDark}
        />
      );
    case 'profile':
      return (
        <>
          <Circle cx={28} cy={21} r={9} fill={COLORS.warning} />
          <Path d="M12,46 Q12,30 28,30 Q44,30 44,46 Z" fill={COLORS.warning} />
        </>
      );
    case 'walking':
      return (
        <>
          <Circle cx={28} cy={14} r={5} fill={COLORS.primary} />
          <Path d="M28,20 L23,34 L16,44 M28,20 L34,30 L40,26 M23,34 L33,38" stroke={COLORS.primary} strokeWidth={4} strokeLinecap="round" fill="none" />
        </>
      );
    case 'driving':
      return (
        <>
          <Rect x={13} y={24} width={30} height={13} rx={5} fill={COLORS.accentDark} />
          <Polygon points="18,24 24,15 34,15 38,24" fill={COLORS.accentDark} />
          <Circle cx={20} cy={38} r={4} fill={COLORS.textPrimary} />
          <Circle cx={36} cy={38} r={4} fill={COLORS.textPrimary} />
        </>
      );
    case 'cycling':
      return (
        <>
          <Circle cx={17} cy={36} r={8} stroke={COLORS.primary} strokeWidth={3.5} fill="none" />
          <Circle cx={39} cy={36} r={8} stroke={COLORS.primary} strokeWidth={3.5} fill="none" />
          <Path d="M17,36 L26,20 L34,20 M26,20 L39,36 M22,27 H31" stroke={COLORS.primary} strokeWidth={3.5} strokeLinecap="round" fill="none" />
        </>
      );
    case 'bus':
      return (
        <>
          <Rect x={12} y={14} width={32} height={26} rx={6} fill={COLORS.accentDark} />
          <Rect x={16} y={19} width={9} height={9} rx={1.5} fill="#F2EEE3" />
          <Rect x={29} y={19} width={9} height={9} rx={1.5} fill="#F2EEE3" />
          <Circle cx={19} cy={42} r={4} fill={COLORS.textPrimary} />
          <Circle cx={37} cy={42} r={4} fill={COLORS.textPrimary} />
        </>
      );
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------------------------
// Wizard step illustrations — each one animates differently on mount so the four steps of
// starting a journey (destination → route → contacts → review) feel distinct rather than the
// same graphic recolored. All built on RN's core Animated API (not Reanimated) — this project's
// Reanimated/Worklets version pairing has been fragile before (it's what broke the drawer), and
// these are simple enough not to need it.
// ---------------------------------------------------------------------------------------------

// Step 1 — Destination: a compass that spins in and settles, then idles with a gentle sway,
// echoing "figuring out which way to go."
export function CompassIntro({ size = 150 }: { size?: number }) {
  const intro = useRef(new Animated.Value(0)).current;
  const idle = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(intro, {
      toValue: 1,
      duration: 900,
      easing: Easing.out(Easing.back(1.4)),
      useNativeDriver: true,
    }).start(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(idle, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(idle, { toValue: -1, duration: 3000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(idle, { toValue: 0, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])
      ).start();
    });
  }, [intro, idle]);

  const introRotate = intro.interpolate({ inputRange: [0, 1], outputRange: ['-220deg', '0deg'] });
  const idleRotate = idle.interpolate({ inputRange: [-1, 1], outputRange: ['-7deg', '7deg'] });

  return (
    <Animated.View style={{ opacity: intro, transform: [{ rotate: introRotate }, { rotate: idleRotate }] }}>
      <Svg width={size} height={size} viewBox="0 0 140 140">
        <Circle cx={70} cy={70} r={58} fill={COLORS.tintYellow} />
        <Circle cx={70} cy={70} r={46} stroke={COLORS.primary} strokeWidth={3} fill="none" />
        <Line x1={70} y1={16} x2={70} y2={28} stroke={COLORS.primary} strokeWidth={3} strokeLinecap="round" />
        <Line x1={70} y1={112} x2={70} y2={124} stroke={COLORS.primary} strokeWidth={3} strokeLinecap="round" />
        <Line x1={16} y1={70} x2={28} y2={70} stroke={COLORS.primary} strokeWidth={3} strokeLinecap="round" />
        <Line x1={112} y1={70} x2={124} y2={70} stroke={COLORS.primary} strokeWidth={3} strokeLinecap="round" />
        <Polygon points="70,32 80,70 70,66 60,70" fill={COLORS.accent} />
        <Polygon points="70,108 80,70 70,74 60,70" fill={COLORS.primaryDark} />
        <Circle cx={70} cy={70} r={6} fill={COLORS.textPrimary} />
      </Svg>
    </Animated.View>
  );
}

type TravelMode = 'walking' | 'driving' | 'cycling' | 'bus';

// Step 2 — Route & mode: a small landscape where the road draws itself on, then a marker shaped
// like the chosen mode of transport travels the route continuously — the illustration that
// actually depicts movement, and reacts to what the user picks rather than staying generic.
export function RoutePathReveal({
  width = 300,
  height = 150,
  mode = 'walking',
}: {
  width?: number;
  height?: number;
  mode?: TravelMode;
}) {
  const draw = useRef(new Animated.Value(0)).current;
  const travel = useRef(new Animated.Value(0)).current;
  const pinPulse = useRef(new Animated.Value(0)).current;
  const cloud = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const travelLoop = Animated.loop(
      Animated.timing(travel, { toValue: 1, duration: 3200, easing: Easing.linear, useNativeDriver: false })
    );
    Animated.timing(draw, {
      toValue: 1,
      duration: 1100,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: false,
    }).start(() => travelLoop.start());

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pinPulse, { toValue: 1, duration: 750, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(pinPulse, { toValue: 0, duration: 750, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    pulseLoop.start();

    const cloudLoop = Animated.loop(
      Animated.timing(cloud, { toValue: 1, duration: 9000, easing: Easing.linear, useNativeDriver: true })
    );
    cloudLoop.start();

    return () => {
      travelLoop.stop();
      pulseLoop.stop();
      cloudLoop.stop();
    };
  }, [draw, travel, pinPulse, cloud]);

  const pathD = 'M20,112 Q60,52 95,57 Q140,64 160,80 Q195,102 235,47 Q260,17 290,24';
  const dashOffset = draw.interpolate({ inputRange: [0, 1], outputRange: [1000, 0] });
  const markerX = travel.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [20, 95, 160, 235, 290],
  });
  const markerY = travel.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [112, 57, 80, 47, 24],
  });
  const pinScale = pinPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.25] });
  const cloudX = cloud.interpolate({ inputRange: [0, 1], outputRange: [-40, width + 20] });

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height} viewBox="0 0 320 150">
        <Rect x={0} y={0} width={320} height={150} fill={COLORS.tintBlue} opacity={0.5} />
        <Circle cx={272} cy={30} r={16} fill={COLORS.tintYellow} />
        <Polygon points="0,140 55,95 110,140" fill={COLORS.primaryLight} opacity={0.55} />
        <Polygon points="70,140 130,100 195,140" fill={COLORS.primaryLight} opacity={0.4} />

        <Path d={pathD} stroke={COLORS.border} strokeWidth={5} fill="none" strokeLinecap="round" />
        <AnimatedPath
          d={pathD}
          stroke={COLORS.primary}
          strokeWidth={5}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={[1000, 1000]}
          strokeDashoffset={dashOffset}
        />
      </Svg>

      <Animated.View style={[styles.cloud, { top: 8, transform: [{ translateX: cloudX }] }]} pointerEvents="none">
        <SingleCloud scale={0.45} />
      </Animated.View>

      <Animated.View style={[styles.routePin, { left: 20 - 9, top: 112 - 9, transform: [{ scale: pinScale }] }]}>
        <View style={[styles.routePinDot, { backgroundColor: COLORS.primaryDark }]} />
      </Animated.View>
      <Animated.View style={[styles.routePin, { left: 290 - 9, top: 24 - 9, transform: [{ scale: pinScale }] }]}>
        <View style={[styles.routePinDot, { backgroundColor: COLORS.accent }]} />
      </Animated.View>

      <Animated.View style={[styles.routeMarker, { transform: [{ translateX: markerX }, { translateY: markerY }] }]}>
        <Svg width={30} height={30} viewBox="0 0 30 30">
          <Circle cx={15} cy={15} r={14} fill={COLORS.accentDark} />
          {renderTravelGlyph(mode)}
        </Svg>
      </Animated.View>
    </View>
  );
}

function renderTravelGlyph(mode: TravelMode) {
  switch (mode) {
    case 'driving':
      return (
        <>
          <Rect x={7} y={13} width={16} height={7} rx={2.5} fill="white" />
          <Polygon points="9,13 12,9 18,9 21,13" fill="white" />
          <Circle cx={10.5} cy={20} r={2} fill={COLORS.accentDark} />
          <Circle cx={19.5} cy={20} r={2} fill={COLORS.accentDark} />
        </>
      );
    case 'cycling':
      return (
        <>
          <Circle cx={10} cy={19} r={4} stroke="white" strokeWidth={2} fill="none" />
          <Circle cx={20} cy={19} r={4} stroke="white" strokeWidth={2} fill="none" />
          <Path d="M10,19 L14,10 L18,10 M14,10 L20,19 M12,14 H17" stroke="white" strokeWidth={2} strokeLinecap="round" fill="none" />
        </>
      );
    case 'bus':
      return (
        <>
          <Rect x={7} y={8} width={16} height={12} rx={2.5} fill="white" />
          <Rect x={9.5} y={10.5} width={4.5} height={4.5} rx={1} fill={COLORS.accentDark} />
          <Rect x={16} y={10.5} width={4.5} height={4.5} rx={1} fill={COLORS.accentDark} />
          <Circle cx={11} cy={22} r={2} fill="white" />
          <Circle cx={19} cy={22} r={2} fill="white" />
        </>
      );
    default:
      return (
        <>
          <Circle cx={15} cy={9} r={3} fill="white" />
          <Path d="M15,12 L15,18 M15,18 L11,25 M15,18 L19,24 M15,14 L10,17 M15,14 L20,13" stroke="white" strokeWidth={2} strokeLinecap="round" />
        </>
      );
  }
}

// Step 3 — Contacts: three trusted contacts "connect in" around you, one after another.
export function ContactsConverge({ width = 240, height = 170 }: { width?: number; height?: number }) {
  const anims = useRef([new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)]).current;

  useEffect(() => {
    Animated.stagger(
      260,
      anims.map((a) =>
        Animated.spring(a, { toValue: 1, friction: 6, tension: 70, useNativeDriver: false })
      )
    ).start();
  }, [anims]);

  const positions = [
    { x: 44, y: 40 },
    { x: 120, y: 20 },
    { x: 196, y: 40 },
  ];
  const center = { x: 120, y: 140 };
  const colors = [COLORS.tintBlue, COLORS.tintOrange, COLORS.tintGreen];
  const dotColors = [COLORS.primary, COLORS.accentDark, COLORS.primaryDark];

  return (
    <Svg width={width} height={height} viewBox="0 0 240 170">
      <Circle cx={center.x} cy={center.y} r={20} fill={COLORS.primary} />
      <Circle cx={center.x} cy={center.y} r={20} fill="none" stroke={COLORS.primaryDark} strokeWidth={2} />
      {positions.map((p, i) => {
        const dashOffset = anims[i].interpolate({ inputRange: [0, 1], outputRange: [200, 0] });
        return (
          <AnimatedPath
            key={`line-${i}`}
            d={`M${center.x},${center.y} L${p.x},${p.y}`}
            stroke={COLORS.border}
            strokeWidth={3}
            strokeDasharray={[6, 6]}
            strokeDashoffset={dashOffset}
          />
        );
      })}
      {positions.map((p, i) => (
        <AnimatedCircle
          key={`avatar-${i}`}
          cx={p.x}
          cy={p.y}
          r={anims[i].interpolate({ inputRange: [0, 1], outputRange: [0, 20] })}
          fill={colors[i]}
        />
      ))}
      {positions.map((p, i) => (
        <AnimatedCircle
          key={`dot-${i}`}
          cx={p.x}
          cy={p.y}
          r={anims[i].interpolate({ inputRange: [0, 1], outputRange: [0, 8] })}
          fill={dotColors[i]}
        />
      ))}
    </Svg>
  );
}

// Step 4 — Review: a confirmation badge settles in with a bounce while two rings pulse outward,
// the "you're all set" moment before starting.
export function ReadyPulse({ size = 160 }: { size?: number }) {
  const badge = useRef(new Animated.Value(0)).current;
  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(badge, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }).start();

    const pulse = (value: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(value, { toValue: 1, duration: 1400, easing: Easing.out(Easing.ease), useNativeDriver: false }),
          Animated.timing(value, { toValue: 0, duration: 0, useNativeDriver: false }),
        ])
      );

    const p1 = pulse(ring1, 0);
    const p2 = pulse(ring2, 700);
    p1.start();
    p2.start();
    return () => {
      p1.stop();
      p2.stop();
    };
  }, [badge, ring1, ring2]);

  const badgeScale = badge.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} viewBox="0 0 160 160" style={StyleSheet.absoluteFill}>
        <AnimatedCircle
          cx={80}
          cy={80}
          r={ring1.interpolate({ inputRange: [0, 1], outputRange: [34, 74] })}
          stroke={COLORS.accent}
          strokeWidth={2.5}
          fill="none"
          opacity={ring1.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] })}
        />
        <AnimatedCircle
          cx={80}
          cy={80}
          r={ring2.interpolate({ inputRange: [0, 1], outputRange: [34, 74] })}
          stroke={COLORS.primary}
          strokeWidth={2.5}
          fill="none"
          opacity={ring2.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] })}
        />
      </Svg>
      <Animated.View style={{ transform: [{ scale: badgeScale }] }}>
        <Svg width={80} height={80} viewBox="0 0 80 80">
          <Circle cx={40} cy={40} r={34} fill={COLORS.accent} />
          <Path d="M25,41 L35,51 L56,28" stroke="white" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </Svg>
      </Animated.View>
    </View>
  );
}
