"use client";

import { useCallback, useEffect, useRef, type ReactNode, type RefObject } from "react";
import { DialContext, type DialApply } from "./dialContext";
import { DialFace } from "./DialFace";
import { chapterAngle, createDialDriver, isDimmed, rewindProgress, withRewind } from "./dialMotion";

const rectOf = (el: Element) => el.getBoundingClientRect();

/** マウス位置に合わせて文字盤をわずかに傾ける (マウス操作の環境で、動きを減らす設定がオフのときだけ) */
function useDialTilt(tiltRef: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const target = tiltRef.current;
    const enabled = window.matchMedia(
      "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)"
    ).matches;
    if (!target || !enabled) return;

    const onPointerMove = (e: PointerEvent) => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      target.style.setProperty("--tilt-x", `${(-y * 7).toFixed(2)}deg`);
      target.style.setProperty("--tilt-y", `${(x * 9).toFixed(2)}deg`);
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, [tiltRef]);
}

export function DialStage({ children }: { children: ReactNode }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const facesRef = useRef(new Set<DialApply>());

  const register = useCallback((apply: DialApply) => {
    facesRef.current.add(apply);
    return () => {
      facesRef.current.delete(apply);
    };
  }, []);

  useDialTilt(tiltRef);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const step = createDialDriver(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const chapters = () => Array.from(stage.querySelectorAll("[data-chapter]"), rectOf);
    const climax = () => stage.querySelector("[data-climax]")?.getBoundingClientRect();
    const statement = () => stage.querySelector("#statement")?.getBoundingClientRect();

    // 章の位置から長針の目標を決める。4章の後は山場の区間で巻き戻す
    const readTarget = () => {
      const mid = window.innerHeight / 2;
      const angle = chapterAngle(chapters(), mid);
      const rewind = angle === 360 ? rewindProgress(climax(), mid) : 0;
      return { angle: withRewind(angle, rewind), rewind };
    };

    let raf = 0;
    let last = 0;
    let running = false;

    const frame = (now: number) => {
      const dt = last ? Math.min(now - last, 64) : 16;
      last = now;
      const { angle, rewind } = readTarget();
      const state = step(angle, dt, rewind, isDimmed(statement(), window.innerHeight));
      facesRef.current.forEach((apply) => apply(state));
      if (running) raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (running) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    // 文字盤のある区間が画面に入っている間だけ描画ループを回す
    const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()));
    io.observe(stage);
    return () => {
      io.disconnect();
      stop();
    };
  }, []);

  return (
    <DialContext.Provider value={register}>
      <div ref={stageRef} className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-[46vw] max-w-[860px] lg:block"
        >
          <div className="sticky top-0 flex h-[100svh] items-center justify-center pt-10 [perspective:1400px]">
            <div ref={tiltRef} className="dial-tilt">
              <DialFace className="w-[min(40vw,80svh,780px)]" />
            </div>
          </div>
        </div>
        {children}
      </div>
    </DialContext.Provider>
  );
}
