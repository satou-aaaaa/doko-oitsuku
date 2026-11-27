# AGENTS.md

どこで追いつく？：先を行く動物（d m 先）に、速さ r 倍のあなたがどこで追いつくかを4つから当てる1日5問のゲーム。正解すると d ＋ d/r ＋ d/r² ＋ … の棒が積み上がる図が出て、2段目で「差がはじめて X より小さくなるのは何回目か」を当てる。話のもとはゼノンの「アキレスと亀」。`index.html` と `data.js`（倍率・先のきょり・答え・2段目の決め方）を GitHub Pages で公開する。

## 準備（最初に一度）

```bash
bash scripts/setup.sh   # Node.js（版は .nvmrc）を確かめ、検査の依存とブラウザを入れる。何度実行してもよい
```

Claude Code のクラウドセッションでは `.claude/settings.json` のフックが自動で実行する。

## push する前の確認

```bash
node qa/run.mjs   # 21種類×300の種を data.js とは別に解き直す（BigInt の分数で時間から・時間を刻んだシミュレーション・級数の和・2段目は差を1回ずつ割って数え直す）・選び肢のうち答えは1つ・今日の5問と上級（3年分）・とことん・通しで遊ぶ・2段目・復習・幅320px・PWA・引き継ぎ・見やすさ（CI の QA と同じ）
```

## このリポジトリの決まり

- 中身：あなたの速さは相手の r 倍、相手は d m 先。追いつくのは相手のスタートから d/(r−1) m、あなたのスタートから d×r/(r−1) m（等比級数 d ＋ d/r ＋ … の和と同じ）。問いはどちらから測るかを必ず書く。割り切れない答えは分数（例 1000/3 m）と「約333.3 m」（小数第1位まで）。やさしい（2〜5倍・スタートから）・ふつう（2〜10倍）は答えが整数になる d だけ。むずかしいは小数の倍率（1.2〜2.5倍）。
- 2段目：差は「相手がいた所」に着くたびに ÷r。差がはじめて X より小さくなる回（X は 100 m〜1 mm から、2〜12回目になり、どの回でもちょうど X にならないもの）。比べるのは data.js でも BigInt。
- 出典：Stanford Encyclopedia of Philosophy「Zeno's Paradoxes」（N. Huggett）と、アリストテレス『自然学』第6巻（Hardie・Gaye 英訳）。SEP はアキレスの節で『自然学』第6巻へのシンプリキオスの注釈を引くので、そのとおりに書く。ゼノンのねらいや、級数で全部解けたかは「分かれる」と書き、言い切らない。出典メモは共有フォルダ `games/doko-oitsuku-research.md`。
- 動画（PH2）の例「カメが100m先・速さ10倍 → 100＋10＋1＋… ＝ 1000/9 m（約111.1 m）」は `G.ZENO_TAG`（`n10|zeno`）。練習の「はじめの例」と、はじめての人の練習の1問はこれ。
- 今日の5問（やさしい2 → ふつう：スタートから → ふつう：相手のスタートから（ひねり）→ むずかしい1、倍率は重ねない）・上級（むずかしい3、今日のむずかしいと別の倍率）は日本時間の日付の種で決まり、だれでも同じ。`Math.random()` は練習・とことんの種だけ。乱数は `sort` の比較の中で引かない。`RATIOS`・`ANIMALS`・`TH`・乱数を引く順番は、変えると過去の日の問題が変わる。公開後は変えず、変えるときは QA の `PINS` を作り直して理由を PR に書く。`data.js` を変える PR は自動ではマージされない（`hold_paths`）。
- ★はまちがい＋ヒントの数（0で★3・1で★2・2以上で★1）。ヒントは1回目は「見るところ」、2回目はまちがいを消して2つにしぼる。上級はヒントなし。時間制限なし。
- 好きなだけ遊べる：チケット・ライフ・回数制限・🔒で開くモードを入れない（shared-workflows `routines/game-dev.md` F1〜F7。QA が見る）。とことん（`runs.e`）はまちがえても続き、「ここで降りる」で終わる。
- 1問を深くする：`depth.js` と `qa/depth-check.mjs` は shared-workflows `template/` の写しで、ここでは直さない。自信あり・2段目・復習（1→3→7日後）。記録 `dot-v1`・文字 `dot-fs`・復習 `dot-depth`。
- 共有は遊ぶ人が押したときに開くリンクだけ。シェアの文に問題・答えを出さない。感想は Issue フォーム（`.github/ISSUE_TEMPLATE/feedback.yml`）を開くだけ。応援は Ko-fi へのただのリンクだけ。
- 外へ通信しない（CSP の `connect-src 'self'` を広げない）。見やすさ（`<!-- a11y:begin -->`〜`end`・`qa/a11y.mjs`）と引き継ぎ（`transfer.js`・`qa/transfer-check.mjs`）は shared-workflows `template/` の写しで、ここでは直さない。
- 画面の土台は同じ形で作った別の新作から写した（ひな形の部品は `node scripts/sync-template.mjs` で入れた）。写し元の言葉が残っていないかを QA が見る。保存の読み直しは共通部品 GameStore（`<!-- store:begin -->`〜`end`）。
- PWA：画面のファイルを足したら `sw.js` の `SHELL` にも足し、中身を大きく変えたら `CACHE` の版を上げる。アイコンは `node tools/make-icons.cjs`、`og.png` は `node tools/make-og.cjs`。
- 公開リポジトリなので、個人情報・鍵を入れない。

## 公開

- GitHub Pages は `main` のルート（`/`）を公開する。PR の QA と Secret scan が ✅ になると `automerge.yml` が自動でマージする。止めたいときは下書きにするか、ラベル「自動マージしない」を付ける。
- `sw.js`・`manifest.webmanifest`・`data.js` を変える PR は自動ではマージされない（`hold_paths`）。CodeRabbit のレビューを読み、手でマージする直前に今の head へのレビューを読み直す。CodeRabbit は PR に `@coderabbitai review` とコメントして頼む。

## 共通のきまり

- PR の作り方・マージの仕方は satou-aaaaa/shared-workflows の `routines/pr.md`、全体のきまりは `routines/common.md` に従う。
- CI の部品は shared-workflows の共通部品を呼ぶ。リポジトリ側の .github/workflows には呼び出しと設定値だけを書く。
- Claude 以外の AI・人が作業するときは、shared-workflows の `routines/tool-map.md` と `routines/without-claude.md` を読む。
