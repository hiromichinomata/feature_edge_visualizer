# Feature Edge Visualizer

`features.csv` と `rest_edges.csv` を読み込み、feature をクラスタとして関係を可視化する Storybook プロジェクトです。

## Requirements

- Node.js: `.node-version` に記載のバージョン
- npm

## Setup

```bash
npm install
```

## Run

```bash
npm run dev
```

Storybook の `Feature Graph/Cluster View` を開くと可視化できます。

## Build

```bash
npm run build-storybook
```

## CSV Format

`features.csv`

```csv
feature,model
feature_1,ModelA
feature_1,ModelB
feature_2,ModelC
```

`rest_edges.csv`

```csv
from,to
ModelA,ModelB
ModelC,ModelA
```

## Replace Data

1. ルート直下の `features.csv` を差し替える
2. ルート直下の `rest_edges.csv` を差し替える
3. `npm run dev` で再表示する

## Notes

- feature が未設定のモデルは `unassigned` クラスタに入ります
- エッジは矢印なし（線のみ）で表示されます
