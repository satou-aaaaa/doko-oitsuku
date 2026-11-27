// どこで追いつく？の問題を作る（ブラウザと node の両方で使う）。
// 1問＝あなた（走る人）と、d m 先にいる相手（動物）。あなたの速さは相手の r 倍。追いつく地点を4つから当てる。
// 問いは2通り：「あなたのスタートから何m？」（答え d·r/(r−1)）と「相手のスタートから何m？」（答え d/(r−1)）。
// 正解したら2段目：「相手がいた所」に着くたびに差は ÷r になる。差がはじめて X より小さくなるのは何回目か（答え：d/rⁿ < X となる最小の n）。
// 話のもとは、ゼノンの「アキレスと亀」（Stanford Encyclopedia of Philosophy "Zeno's Paradoxes"）。等比級数 d + d/r + d/r² + … = d·r/(r−1)。
// 割り切れない答えは分数（例 1000/3 m）と「約333.3 m」（小数第1位まで）で書く。
// 乱数 R は呼ぶ回数が毎回同じになるように使う（sort の比較の中では引かない）。同じ tag なら、どの端末でも同じ問題になる。
// RATIOS・ANIMALS・TH の並びや中身は、足すだけでも過去の日の問題が変わる。公開したあとは変えず、変えるときは qa/run.mjs の PINS を作り直して PR に理由を書く。
(function (root) {
  "use strict";
  const LV = ["やさしい", "ふつう", "むずかしい"];

  // 出典（画面の「なぜ」と「このゲームについて」に出す）
  const SRC = {
    sep: ["N. Huggett「Zeno's Paradoxes」Stanford Encyclopedia of Philosophy（2002年・2024年改訂）", "https://plato.stanford.edu/entries/paradox-zeno/"],
    ari: ["アリストテレス『自然学』第6巻（R. P. Hardie・R. K. Gaye 英訳）", "http://classics.mit.edu/Aristotle/physics.6.vi.html"],
  };

  // 速さの倍率 r = p/q。やさしい：2〜5倍（スタートから）・ふつう：2〜10倍・むずかしい：小数の倍率
  const RATIOS = [
    [[2, 1], [3, 1], [4, 1], [5, 1]],
    [[2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [8, 1], [9, 1], [10, 1]],
    [[6, 5], [5, 4], [7, 5], [3, 2], [8, 5], [7, 4], [9, 5], [5, 2]],
  ];
  // 先を行く相手（架空の名前は付けない）
  const ANIMALS = [["カメ", "🐢"], ["アヒル", "🦆"], ["ヒツジ", "🐑"], ["ニワトリ", "🐓"], ["ペンギン", "🐧"], ["ブタ", "🐖"]];
  // 2段目の「これより小さくなったら」（mm で持つ）
  const TH = [[100000, "100 m"], [50000, "50 m"], [10000, "10 m"], [5000, "5 m"], [1000, "1 m"], [500, "50 cm"], [100, "10 cm"], [50, "5 cm"], [10, "1 cm"], [5, "5 mm"], [1, "1 mm"]];

  // part:ri:begin（shared-workflows の template/parts/data/ri.js の写し。ここでは直さない。node scripts/sync-template.mjs で写す）
  const ri = (R, a, b) => a + Math.floor(R() * (b - a + 1));
  // part:ri:end
  // part:shuffle:begin（shared-workflows の template/parts/data/shuffle.js の写し。ここでは直さない。node scripts/sync-template.mjs で写す）
  function shuffle(R, a) { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = ri(R, 0, i); [b[i], b[j]] = [b[j], b[i]]; } return b; }
  // part:shuffle:end
  // part:pickN:begin（shared-workflows の template/parts/data/pickN.js の写し。ここでは直さない。node scripts/sync-template.mjs で写す）
  function pickN(R, a, n) { return shuffle(R, a).slice(0, n); }
  // part:pickN:end
  // part:seedOf:begin（shared-workflows の template/parts/data/seedOf.js の写し。ここでは直さない。node scripts/sync-template.mjs で写す）
  function seedOf(str) { let h = 2166136261; for (const ch of String(str)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
  // part:seedOf:end
  // part:rng:begin（shared-workflows の template/parts/data/rng.js の写し。ここでは直さない。node scripts/sync-template.mjs で写す）
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  // part:rng:end

  // ---- 分数（分子・分母は小さいので Number で足りる。どれも約分して持つ）----
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
  const fr = (n, d = 1) => { if (d < 0) { n = -n; d = -d; } const g = gcd(n, d); return [n / g, d / g]; };
  const add = (a, b) => fr(a[0] * b[1] + b[0] * a[1], a[1] * b[1]);
  const mul = (a, b) => fr(a[0] * b[0], a[1] * b[1]);
  const div = (a, b) => fr(a[0] * b[1], a[1] * b[0]);
  const eq = (a, b) => a[0] === b[0] && a[1] === b[1];
  const val = (a) => a[0] / a[1];
  // 書き方：割り切れれば「300 m」、割り切れなければ「1000/3 m」と「約333.3 m」
  const r1 = (x) => (Math.round(x * 10) / 10).toFixed(1).replace(/\.0$/, "");
  const fmt = (a) => (a[1] === 1 ? { t: `${a[0]} m`, s: "" } : { t: `${a[0]}/${a[1]} m`, s: `約${r1(val(a))} m` });
  const rTxt = (p, q) => (q === 1 ? String(p) : String(p / q)); // 倍率は小数で割り切れるものだけ使う（1.2・1.25 など）

  // 種類＝難しさ×倍率（倍率帳に集まる）
  const KINDS = [];
  RATIOS.forEach((rs, lv) => rs.forEach(([p, q]) => KINDS.push({ id: "enh"[lv] + p + (q > 1 ? "-" + q : ""), lv, p, q, name: rTxt(p, q) + "倍" })));
  const BY = Object.fromEntries(KINDS.map((k) => [k.id, k]));
  const kindsOf = (lv) => KINDS.filter((k) => k.lv === lv).map((k) => k.id);

  // 先のきょり d の候補：答え（どちらの問いでも）が整数になる d（やさしい・ふつう）。むずかしいは10の倍数（分数の答えも出る）
  function dsOf(k) {
    const out = [];
    if (k.lv === 2) { for (let d = 10; d <= 500; d += 10) out.push(d); return out; }
    const top = k.lv === 0 ? 300 : 600, step = k.lv === 0 ? 10 : 5;
    for (let d = step; d <= top; d += step) if (d % (k.p - 1) === 0 && d >= 10) out.push(d);
    return out;
  }
  const DS = Object.fromEntries(KINDS.map((k) => [k.id, dsOf(k)]));

  // 2段目：差 d/rⁿ が X（mm）より小さいか。BigInt で比べる：d·1000·qⁿ < X·pⁿ
  const below = (d, p, q, n, X) => BigInt(d) * 1000n * BigInt(q) ** BigInt(n) < BigInt(X) * BigInt(p) ** BigInt(n);
  const sameAt = (d, p, q, n, X) => BigInt(d) * 1000n * BigInt(q) ** BigInt(n) === BigInt(X) * BigInt(p) ** BigInt(n);
  function stepsTo(d, p, q, X) { let n = 0; while (!below(d, p, q, n, X)) n++; return n; }
  // 選べる X：d より小さく、答えが 2〜12 回目で、どこかの回でちょうど X にならない（「切る」がはっきりする）
  function thOk(d, p, q, X, lo, hi) { if (X >= d * 1000) return false; const n = stepsTo(d, p, q, X); if (n < lo || n > hi) return false; for (let i = 0; i <= n; i++) if (sameAt(d, p, q, i, X)) return false; return true; }

  const ZENO = "zeno", ZENO_TAG = "n10|zeno"; // 練習のはじめの1問（動画 PH2 と同じ数）
  // 1問を作る。tag は「種類|種」（例 "n3|2026-11-27:d2"）。種が "~s"・"~t" で終わるときは問いの向きをそれに決める（今日の5問のひねり）
  function make(tag) {
    const [kind, seed = ""] = String(tag).split("|"), k = Object.prototype.hasOwnProperty.call(BY, kind) ? BY[kind] : null;
    if (!k) return null;
    const R = rng(seedOf(tag)), { p, q, lv } = k;
    const zeno = seed === ZENO && kind === "n10"; // 動画の例：カメが100m先・速さ10倍 → 100 + 10 + 1 + 0.1 + … = 1000/9 m（約111.1 m）
    let ai = ri(R, 0, ANIMALS.length - 1), ds = DS[kind], d = ds[ri(R, 0, ds.length - 1)];
    const a0 = R() < 0.5 ? "s" : "t";
    let ask = /~s$/.test(seed) ? "s" : /~t$/.test(seed) ? "t" : lv === 0 ? "s" : a0;
    if (zeno) { ai = 0; d = 100; ask = "s"; }
    const r = fr(p, q), D = fr(d), rm1 = add(r, fr(-1));
    const fromThem = div(D, rm1), fromYou = mul(D, div(r, rm1)); // 相手のスタートから d/(r−1)・あなたのスタートから d·r/(r−1)
    const ans = ask === "s" ? fromYou : fromThem;
    // まちがいの候補（よくある考えちがい）。答えと同じもの・0以下・重なるものは除き、前から3つ
    const two = add(D, div(D, r)), three = add(two, div(D, mul(r, r)));
    const cands = ask === "s"
      ? [two, fromThem, mul(D, r), three, add(D, D), add(fromYou, D), mul(D, div(add(r, fr(1)), r))]
      : [fromYou, div(D, r), D, add(div(D, r), div(D, mul(r, r))), mul(fr(1, 2), D), add(fromThem, D), mul(D, fr(2))];
    const wrong = [];
    for (const c of cands) if (c[0] > 0 && !eq(c, ans) && !wrong.some((w) => eq(w, c)) && wrong.length < 3) wrong.push(c);
    const opts = shuffle(R, [ans, ...wrong]);
    // 2段目
    const ths = TH.filter(([X]) => thOk(d, p, q, X, 2, lv === 0 ? 8 : 12));
    const tPool = ths.length ? ths : TH.filter(([X]) => thOk(d, p, q, X, 1, 40));
    const [X, xl] = tPool[ri(R, 0, tPool.length - 1)];
    const n2 = stepsTo(d, p, q, X), st = Math.max(1, n2 - ri(R, 0, 3)), opts2 = [st, st + 1, st + 2, st + 3];
    const [an, ae] = ANIMALS[ai], rt = rTxt(p, q);
    const who = an, cx = p - q === q ? "" : rTxt(p - q, q); // 1x は x と書く
    return {
      tag, kind, lv, p, q, d, ask, rt, an, ae, X, xl, n2, opts2,
      name: k.name, ans: fmt(ans).t, ansS: fmt(ans).s, ansF: ans, opts: opts.map((o) => fmt(o).t), subs: opts.map((o) => fmt(o).s), optsF: opts, grp: String(n2),
      fromThem, fromYou,
      q1: ask === "s" ? `${who}に追いつくのは、あなたのスタートから何m？` : `${who}に追いつくのは、${who}のスタートから何m？`,
      look: `${who}が x m 走るあいだに、あなたは ${rt}x m 走ります。`,
      key: `あなたが走った分 − ${who}が走った分 ＝ はじめの差 ${d} m。`,
      why: `差の ${d} m は、${who}が x m 進むあいだに ${rt}x − x ＝ ${cx}x m 縮みます。${cx}x ＝ ${d} なので、${who}は ${fmt(fromThem).t}${fmt(fromThem).s ? `（${fmt(fromThem).s}）` : ""}、あなたは ${fmt(fromYou).t}${fmt(fromYou).s ? `（${fmt(fromYou).s}）` : ""} 走って追いつきます。`,
      q2: `${who}がいた所に着くたび、差は ÷${rt} になります。差がはじめて ${xl} より小さくなるのは、何回目に着いたとき？`,
      src: [SRC.sep, SRC.ari],
    };
  }
  const keyOf = (P) => `${P.kind}:${P.ask}:${P.d}`;

  // 今日の5問：やさしい2 → ふつう（スタートから）→ ふつう（相手のスタートから＝ひねり）→ むずかしい。倍率は重ねない
  function dailyTags(date) {
    // ふつうの候補から、やさしい2問の倍率（2〜5倍はやさしい・ふつうの両方にある）を除いてから選ぶ（2026-11-27 CodeRabbit。公開前に直したので過去の日は変わらない）
    const R = rng(seedOf("day:" + date)), e = pickN(R, kindsOf(0), 2), used = new Set(e.map((id) => BY[id].p / BY[id].q));
    const n = pickN(R, kindsOf(1).filter((id) => !used.has(BY[id].p / BY[id].q)), 2), h = pickN(R, kindsOf(2), 1);
    return [`${e[0]}|${date}:d0`, `${e[1]}|${date}:d1`, `${n[0]}|${date}:d2~s`, `${n[1]}|${date}:d3~t`, `${h[0]}|${date}:d4`];
  }
  // 上級：むずかしい3問（今日のむずかしいと別の倍率）
  function hardTags(date) {
    const dh = dailyTags(date)[4].split("|")[0], R = rng(seedOf("hard:" + date)), ps = pickN(R, kindsOf(2).filter((x) => x !== dh), 3);
    return ps.map((id, i) => `${id}|${date}:h${i}`);
  }

  const DOT = { ZENO_TAG, KINDS, BY, LV, SRC, RATIOS, ANIMALS, TH, DS, kindsOf, seedOf, rng, make, keyOf, dailyTags, hardTags, pickN, fmt, fr, add, mul, div, val, rTxt, stepsTo };
  if (typeof module !== "undefined" && module.exports) module.exports = DOT; else root.DOT = DOT;
})(typeof self !== "undefined" ? self : this);
