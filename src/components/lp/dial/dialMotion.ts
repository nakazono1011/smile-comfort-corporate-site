import type { DialState } from "./dialContext";

const IDLE_DEG_PER_MS = 360 / 22000;
const SMOOTHING_MS = 140;
const HOUR_SMOOTHING_MS = 260;

export const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

export const normalizeAngle = (deg: number) => ((deg % 360) + 360) % 360;

const smoothstep = (t: number) => t * t * (3 - 2 * t);

/** dt ミリ秒ぶん、current を goal へ指数的に近づける */
const ease = (current: number, goal: number, dt: number, ms: number) =>
  current + (goal - current) * (1 - Math.exp(-dt / ms));

/** from から to へ、近い向き (±180°以内) で回るときの差分 */
function nearestDelta(from: number, to: number) {
  const d = normalizeAngle(to - normalizeAngle(from));
  return d > 180 ? d - 360 : d;
}

/**
 * 章の位置から長針の目標角度を求める。画面の中央が章より上なら null (idle)、
 * 全章を過ぎたら 360。章 i の中を進むあいだは i*90°〜(i+1)*90° を動く
 */
export function chapterAngle(rects: DOMRect[], mid: number): number | null {
  if (rects.length === 0 || rects[0].top > mid) return null;
  const i = rects.findIndex((r) => r.bottom > mid);
  if (i < 0) return 360;
  return i * 90 + clamp((mid - rects[i].top) / rects[i].height, 0, 1) * 90;
}

/** 山場の区間をどこまで進んだか (0〜1) */
export function rewindProgress(rect: DOMRect | undefined, mid: number) {
  return rect ? clamp((mid - rect.top) / (rect.height * 0.7), 0, 1) : 0;
}

/** 山場では、進み具合に合わせて針を 360° から 0° へ巻き戻す */
export function withRewind(angle: number | null, rewind: number) {
  return rewind > 0 ? 360 * (1 - smoothstep(rewind)) : angle;
}

/** 文章セクションが画面の中央付近にあるか */
export function isDimmed(rect: DOMRect | undefined, vh: number) {
  return !!rect && rect.top < vh * 0.55 && rect.bottom > vh * 0.45;
}

/**
 * 針の動きを毎フレーム計算する。target が null なら idle (ゆっくり回り続ける)、
 * 数値ならその角度へ滑らかに追従する。動きを減らす設定では補間せず目標へ直接合わせる
 */
export function createDialDriver(reduced: boolean) {
  const s = {
    mode: "idle" as "idle" | "scroll",
    idle: reduced ? 58 : 40,
    // 読み込み直後は針を 12 時から素早く回し、ゆっくりした動きに合流させる
    angle: reduced ? 58 : -360,
    hour: 315,
  };

  const enterIdle = () => {
    if (s.mode === "idle") return;
    s.mode = "idle";
    s.idle = s.angle;
  };

  const enterScroll = (target: number) => {
    if (s.mode === "scroll") return;
    s.mode = "scroll";
    // 前に進む向きのまま 0° に合流させる
    s.angle = normalizeAngle(s.angle);
    if (s.angle > target + 1) s.angle -= 360;
  };

  const goalFor = (target: number | null, dt: number) => {
    if (target !== null) {
      enterScroll(target);
      return target;
    }
    enterIdle();
    if (!reduced) s.idle += dt * IDLE_DEG_PER_MS;
    return s.idle;
  };

  const shownAngle = () =>
    s.mode === "scroll" ? clamp(s.angle, 0, 359.9) : normalizeAngle(s.angle);

  /** 短針は今の業務の象限の中央を指し、象限が変わると近い向きに回って追いつく */
  const stepHour = (active: number, dt: number) => {
    const goal = active * 90 + 45;
    s.hour = reduced ? goal : ease(s.hour, s.hour + nearestDelta(s.hour, goal), dt, HOUR_SMOOTHING_MS);
  };

  const modeFor = (rewind: number): DialState["mode"] => (rewind > 0 ? "rewind" : s.mode);

  return function step(target: number | null, dt: number, rewind: number, dim: boolean): DialState {
    const goal = goalFor(target, dt);
    s.angle = reduced ? goal : ease(s.angle, goal, dt, SMOOTHING_MS);
    const active = Math.floor(shownAngle() / 90);
    stepHour(active, dt);
    return { angle: s.angle, hour: s.hour, mode: modeFor(rewind), rewind, active, dim };
  };
}
