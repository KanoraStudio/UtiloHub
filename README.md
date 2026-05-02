# 🖥 UtiloHub v2.0

> **Your Personal Web OS** — ブラウザで動くパーソナルWebOS

![UtiloHub](https://img.shields.io/badge/UtiloHub-v2.0-6366f1?style=for-the-badge&logo=data:image/svg+xml;base64,...)

## ✨ 機能一覧

| アプリ | 説明 |
|--------|------|
| 📝 メモ帳 | 複数ノート対応、文字数カウント |
| ✅ タスク管理 | 優先度設定、フィルタリング |
| 📅 カレンダー | 予定追加・管理 |
| 🎵 音楽プレイヤー | プレイリスト・シーク対応 |
| 🕐 時計 | アナログ＋デジタル時計 |
| 🧮 電卓 | 履歴表示付き高機能電卓 |
| 🌤 天気 | 世界中の天気・3日間予報 |
| 🍅 ポモドーロ | 作業・休憩タイマー |
| 🎨 ペイント | ブラシ・消しゴム・保存 |
| 🐍 スネーク | クラシックゲーム |
| 💻 ターミナル | コマンドラインエミュレータ |
| 📁 ファイル | ファイルマネージャー |

## 🚀 使い方

1. リポジトリをクローン or ZIPダウンロード
2. `index.html` をブラウザで開く
3. ゲストログインまたはアカウント作成

```bash
git clone https://github.com/KanoraStudio/UtiloHub.git
cd UtiloHub
open index.html
```

## 🎨 デザイン

- アニメーション壁紙グラデーション
- パーティクルエフェクト
- macOS風ドック（ホバーアニメーション）
- スプラッシュ画面
- スライドイン通知
- ウィンドウ開閉アニメーション

## 🛠 技術スタック

- **フロントエンド**: Vanilla JS (ES Modules)
- **スタイル**: Tailwind CSS + Custom CSS Animations
- **認証**: Firebase Authentication
- **フォント**: Inter + JetBrains Mono
- **データ**: localStorage

## 📁 ファイル構成

```
UtiloHub/
├── index.html          # メイン・認証
├── css/
│   └── animations.css  # アニメーション・デザイン
├── js/
│   └── core.js         # ウィンドウマネージャー
└── apps/
    ├── notepad.js      # メモ帳
    ├── music.js        # 音楽プレイヤー
    ├── tools.js        # 電卓・時計・天気・ゲーム・ペイント
    └── productivity.js # タスク・カレンダー・ターミナル
```

## 📄 ライセンス

MIT License © 2025 KanoraStudio
