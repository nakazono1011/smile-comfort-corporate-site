import type { CSSProperties } from "react";

const PARAGRAPHS = [
  "売上を伸ばすために使いたい時間が、毎日の「回すための作業」に消えていく。",
  "同じ商品をモールごとに登録し直す。在庫の数を合わせる。似た質問に一件ずつ返信する。売り場が海外に広がれば、手間はさらに増える。",
  "その作業を、AIに任せられる形に組み替える。それが私たちの仕事です。",
];

const segmenter = new Intl.Segmenter("ja", { granularity: "word" });

const CLOSE = /^[、。」）！？]+$/;
const OPEN = /^[「（]+$/;
/** 助詞・助動詞・送り仮名など、ひらがなだけの語は前の語にくっつけて文節にする */
const KANA = /^[\u3041-\u309f]+$/;
const ENDS_WITH_PUNCT = /[、。！？]$/;
/** 形態素では 2 語に分かれるが、途中で改行させたくない複合語 */
const KEEP = ["登録し直す"];

/** ひらがなだけの語を、直前の語にくっつけてよいか (開きかっこを持ち越し中や、句読点の直後は除く) */
const joinsKana = (prev: string, segment: string, carry: string) =>
  KANA.test(segment) && !carry && !ENDS_WITH_PUNCT.test(prev);

/** この語を直前の語にくっつけるか (閉じかっこ・句読点、または助詞などのひらがな) */
function joinsPrev(prev: string | undefined, segment: string, carry: string) {
  if (prev === undefined) return false;
  return CLOSE.test(segment) || joinsKana(prev, segment, carry);
}

/** 2 語にまたがって KEEP の複合語ができるか */
const spansKeep = (a: string, b: string) =>
  KEEP.some((k) => (a + b).includes(k) && !a.includes(k) && !b.includes(k));

function mergeKeep(words: string[]) {
  const out = [...words];
  for (let i = 0; i < out.length - 1; i++) {
    if (!spansKeep(out[i], out[i + 1])) continue;
    out.splice(i, 2, out[i] + out[i + 1]);
    i--;
  }
  return out;
}

/**
 * 文節に近い単位で区切る (各単位の途中では改行させない)。
 * 句読点は前の語に、開きかっこは次の語に付け、行頭・行末の禁則を守る
 */
function toWords(text: string) {
  const out: string[] = [];
  let carry = "";
  for (const { segment } of segmenter.segment(text)) {
    if (joinsPrev(out.at(-1), segment, carry)) out[out.length - 1] += segment;
    else if (OPEN.test(segment)) carry += segment;
    else {
      out.push(carry + segment);
      carry = "";
    }
  }
  return mergeKeep(out);
}

/** 単語ごとに区切り、通し番号を0〜1に正規化して返す (スクロールに合わせて順に濃くするため) */
function toSegments() {
  const words = PARAGRAPHS.map(toWords);
  const total = words.reduce((n, w) => n + w.length, 0);
  let n = 0;
  return words.map((w) =>
    w.map((text) => ({ text, i: (n++ / total) * 0.82 }))
  );
}

export function Statement() {
  const paragraphs = toSegments();

  return (
    <section
      id="statement"
      data-section-theme="dark"
      aria-label="私たちが解決したいこと"
      className="relative py-[14svh] sm:py-[22svh]"
    >
      <div className="sc-wrap">
        <p className="t-kicker text-sc-fg/60">Why we do it</p>
        <div data-progress className="mt-10 max-w-[23em] space-y-[1em] t-statement">
          {paragraphs.map((segs, k) => (
            <p
              key={k}
              className={
                k === 1
                  ? "max-w-[30em] text-[0.62em] font-medium leading-[1.8] text-sc-fg/80"
                  : k === 2
                    ? "text-sc-accent"
                    : undefined
              }
            >
              {segs.map((s, j) => (
                <span key={j} className="stmt-seg" style={{ "--i": s.i.toFixed(4) } as CSSProperties}>
                  {s.text}
                </span>
              ))}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
