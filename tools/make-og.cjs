// SNS で貼られたときの絵（og.png 1200×630）を作る。今日の問題（答え）は入れず、動画と同じ例（100＋10＋1＋…）の積み上がる棒だけ。
// 使い方: node tools/make-og.cjs（qa/ の playwright を使う）
const path = require("path");
const { chromium } = require(path.join(__dirname, "..", "qa", "node_modules", "playwright"));
(async () => {
  const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  const W = 400, L = 110, tot = 1000 / 9, sc = W / tot; let a = 0;
  const bars = [100, 10, 1, 0.1].map((t, k) => { const x = a * sc, w = Math.max(t * sc, 3); a += t; return `<div style="position:absolute;left:0;width:${L - 14}px;text-align:right;top:${k * 54}px;font-size:28px;font-weight:700;line-height:38px;white-space:nowrap">${k ? "+ " : ""}${t}</div><div style="position:absolute;left:${L + x}px;top:${k * 54}px;width:${w}px;height:38px;border-radius:6px;background:${k % 2 ? "#3b6f9e" : "#1f4f7a"}"></div>`; }).join("");
  await p.setContent(`<body style="margin:0;font-family:'Noto Sans CJK JP','IPAPGothic',sans-serif">
  <div style="width:1200px;height:630px;box-sizing:border-box;padding:48px 64px;background:#f3efe4;color:#1d2a3f;display:flex;gap:40px;align-items:center">
    <div style="flex:0 0 420px">
      <div style="font-size:30px;color:#83261a;letter-spacing:.06em">アキレスと亀を計算で</div>
      <div style="font-size:88px;font-weight:900;margin-top:8px;line-height:1.15;color:#123554">どこで<br><span style="color:#b23a24">追いつく？</span></div>
      <div style="font-size:32px;margin-top:14px">速さの倍率から、<br>追いつく地点を当てる</div>
    </div>
    <div style="flex:1;background:#fffdf7;border:4px solid #1d2a3f;border-radius:8px;padding:28px 26px;display:flex;flex-direction:column;gap:18px">
      <div style="font-size:30px;font-weight:700">🐢 100 m 先・速さ 10倍</div>
      <div style="position:relative;height:210px">${bars}<div style="position:absolute;left:${L + W}px;top:-6px;height:220px;border-left:4px dashed #b23a24"></div></div>
      <div style="font-size:30px;font-weight:700">100 ＋ 10 ＋ 1 ＋ 0.1 ＋ … ＝ ？</div>
    </div>
  </div></body>`);
  await p.screenshot({ path: path.join(__dirname, "..", "og.png") });
  await b.close();
})();
