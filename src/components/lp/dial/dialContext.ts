"use client";

import { createContext, useContext, useEffect, useRef } from "react";

/**
 * 文字盤の状態。
 * - idle: ヒーローなど。針がゆっくり回り続け、通過した作業にチェックが付く
 * - scroll: サービス章。章のスクロール量で針が0°→360°と進む
 * - rewind: 一周後の山場。針を巻き戻し、中央に一言を出す
 */
export interface DialState {
  /** 表示中の長針の角度 (度)。idleでは360を超えて増え続ける */
  angle: number;
  /** 短針の角度 (度)。今の業務 (象限の中央) を指す */
  hour: number;
  mode: "idle" | "scroll" | "rewind";
  /** 一周後の山場の進み具合 (0〜1) */
  rewind: number;
  /** 針が指している業務 (0〜3) */
  active: number;
  /** 文章セクションと重なっている間は薄くする */
  dim: boolean;
}

export type DialApply = (state: DialState) => void;
type Register = (apply: DialApply) => () => void;

export const DialContext = createContext<Register | null>(null);

/** 文字盤の見た目 (デスクトップ・スマホ・小型) を描画ループに登録する */
export function useDialFace(apply: DialApply) {
  const register = useContext(DialContext);
  const applyRef = useRef(apply);

  useEffect(() => {
    applyRef.current = apply;
  });

  useEffect(() => {
    if (!register) return;
    return register((s) => applyRef.current(s));
  }, [register]);
}
