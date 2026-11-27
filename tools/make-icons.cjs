// アプリのアイコン（icon-192.png・icon-512.png）を作る。紺の地に、だんだん短くなる3本の棒と、追いつく所の点線。
// 使い方: node tools/make-icons.cjs（qa/ の playwright を使う）
const path = require("path");
const { chromium } = require(path.join(__dirname, "..", "qa", "node_modules", "playwright"));
(async () => {
  const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  for (const s of [192, 512]) {
    const p = await b.newPage({ viewport: { width: s, height: s } });
    await p.setContent(`<body style="margin:0"><svg width="${s}" height="${s}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="#123554"/>
      <rect x="12" y="26" width="54" height="12" rx="2" fill="#fffdf7"/>
      <rect x="66" y="44" width="14" height="12" rx="2" fill="#8cc5f0"/>
      <rect x="80" y="62" width="4" height="12" rx="1" fill="#f6b6a8"/>
      <path d="M88 18 V82" stroke="#f6b6a8" stroke-width="3" stroke-dasharray="5 4"/></svg></body>`);
    await p.screenshot({ path: path.join(__dirname, "..", `icon-${s}.png`), clip: { x: 0, y: 0, width: s, height: s } });
  }
  await b.close();
})();
