# S2J Acknowledgements - パイプライン

Syft / Feluda / onot を直列に実行するオーケストレーション仕様です。
本 npm パッケージは **各ツールのラッパー** であり、ロジックの本体は上流 CLI に委譲します。

**Syft フラグ・マージ・成果物コピーの正本は本ファイル** です ([specs.md](./specs.md) の正本マトリックス)。

## 全体フロー `{@pipeline:s-h001}`

```text
ターゲット解決 → Syft (SPDX JSON) → [Feluda] → onot (Notice) → 出力コピー
```

| 段 | ツール | 役割 | v1デフォルト |
| --- | --- | --- | --- |
| 0 | (本 CLI) | スキャン対象パス、作業ディレクトリ、マージ方針の決定 | 必須 |
| 1 | Syft | SBOM 生成、**SPDX JSON** に統一 | 必須 |
| 2 | Feluda | ライセンス情報の補完・監査 | **オプション** (`pipeline.feluda`) |
| 3 | onot | Acknowledgements / Notice 文書生成 | 必須 |
| 4 | (本 CLI) | onot 出力 `.md` を `output` にコピー、一時ファイル整理 | 必須 |

## Syft `{@pipeline:s-syft}`

### 入力 `{@pipeline:s-h003}`

プリセットと設定に応じ、下記のいずれか (またはマージ) を渡します。

| スキャン種別 | 例 |
| --- | --- |
| ディレクトリ | `syft scan dir:.` |
| ファイルシステム上の `.app` | `syft scan dir:/path/Foo.app` |
| 明示パス | 設定の `scanPaths[]` (`.` と `./` は同義 — ホストルート相対に正規化) |

### `scan.exclude` (v1) `{@pipeline:s-scan-exclude-v1}`

`ack.config.json` の `scan.exclude[]` は、各 Syft 呼び出しに次の形で渡します (1エントリ、1フラグ)。

```text
syft scan dir:{path} -o spdx-json={out} --exclude {pattern} ...
```

`syft.extraArgs` は **追加** で後置します。マッピング実装は [decisions/003-spdx-merge-and-syft.md](./decisions/003-spdx-merge-and-syft.md) に固定します。

### SPDX マージ (v1) `{@pipeline:s-spdx-v1}`

[decisions/003-spdx-merge-and-syft.md](./decisions/003-spdx-merge-and-syft.md) を採用します。

| 条件 | 挙動 |
| --- | --- |
| Syft 対象が **1つ** | その SPDX JSON をそのまま次段に |
| Syft 対象が **2つ以上** | 各スキャンで SPDX JSON を生成し **1つにマージ** してから Feluda / onot に |

`macos-app` の `xcode.merge` は「何をスキャンするか」の定義であり、`wordpress` の `scanPaths: [".", "vendor"]` も同じマージ規則です。

マージ手順:

1. 各スキャンで SPDX JSON を生成
2. パッケージ一覧を結合 (重複は `name@version` で一意化)
3. マージ結果を `{workDir}/sbom.spdx.json` として保存
4. **SPDX 前処理** (Feluda / onot の前、`prepareSpdxFile`):
   * **匿名化**: スキャン絶対パス → `{SCAN:<label>}`、ホストルート → `{HOST_ROOT}`、`$HOME` → `{HOME}`
   * **ドキュメント名** (`merged-sbom` 置換、onot 見出し `OSS Notice for …`): (1) `pipeline.noticeProductName`、(2) `xcode.productName` (`.app` 除去)、(3) 未設定時 `host-sbom` — `doctor` / `generate` で WARN (配布向けには (1) または (2) を推奨)
   * **除去**: `packages[].name` がパス型 (先頭 `/`、`{SCAN:…}` / `{HOME}` 等) の行を削除。コンポーネント名 (`s2j-about-window` 等) は残す
   * **Notice denylist**: `pipeline.noticeDenylist[]` の glob に一致する `name` を削除 (CI Action 等、配布物に含めないコンポーネント)。`macos-app` デフォルト: `actions/*` / `codecov/*` / `maxim-lobanov/*`
   * **ホスト License** (デフォルト ON): Syft の `.app` 行は `licenseDeclared` が空になりやすい。`pipeline.applyHostPackageLicense` が `true` のとき、`pipeline.hostPackageJson` (デフォルト `package.json`) の `license`、または `pipeline.hostPackageLicense` 明示値を、製品名と同じ `packages[].name` (`noticeProductName` / `xcode.productName`) に Feluda / onot の前に反映

`composer.lock` のみを Syft 入力にする運用は **v1非対象** (将来 v1.1)。v1では `vendor/` ディレクトリスキャンを使います。

### 出力 `{@pipeline:s-h006}`

* ファイル: `{workDir}/sbom.spdx.json` (ファイル名は設定で変更可)
* 形式: **SPDX JSON** (`-o spdx-json=...`)

### macOS アプリ向け注意 (Cozy Brew) `{@pipeline:s-macos-cozy-brew}`

`.app` 単体の Syft スキャンだけではパッケージ数が不足し得ます。
`macos-app` では `xcode.merge` により `.app` と SPM checkouts を **2対象スキャン → マージ** します ([presets.md](./presets.md))。

SPDX ドキュメント ID 等の細部は実装時に SPDX JSON 構造に合わせて調整しますが、**マージ条件と一意化キーは上記を変更しません**。

## Feluda (任意) `{@pipeline:s-feluda}`

### 目的 `{@pipeline:s-h009}`

* SPDX に欠けているライセンス ID の補完 (**前処理後の** `sbom.spdx.json` に対して in-place オーバーライト)
* 監査モードでの警告 (CI ゲート用途)

### v1デフォルト `{@pipeline:s-v1}`

* 真のデフォルト値は **`presets/<name>/defaults.json` マージ後** (正本: [presets.md](./presets.md) / `presets/`)
* 現状: `macos-app` / `wordpress` は `true`、`dir` は `false`
* **macOS 実ホスト** (Cozy Brew 等): `init --preset macos-app` で Feluda 有効がデフォルト。[install.md](./install.md) で `feluda` を PATH に用意 → `doctor` で確認
* 有効時のみ子プロセスを起動。失敗時は非ゼロ exit で終了 (設定で `feluda.strict` を将来追加可)

### インストール `{@pipeline:s-h011}`

brew 一択ではないため、[install.md](./install.md) のとおり `doctor` で検出のみ行います。

### コマンド形 (v1) `{@pipeline:s-v1-2}`

マージ済み SPDX を **その場でオーバーライト** します ([Feluda SBOM ingest](https://feluda.readthedocs.io/en/stable/sbom/ingest/))。

```text
feluda --sbom-input {workDir}/sbom.spdx.json --sbom-enriched {workDir}/sbom.spdx.json
```

`ack.config.json` の `pipeline.feludaArgs` で置き換え可。`{sbom}` は上記 JSON パスに展開されます。

## Notice エンジン `{@pipeline:s-engine}`

| `pipeline.engine` | 実行体 | 正本 |
| --- | --- | --- |
| `onot` (デフォルト) | Python `onot` | 下記 § onot |
| `oss-notice` | `s2j-oss-notice` (Node) | [@s2j/oss-notice ADR-001](https://github.com/stein2nd/s2j-oss-notice/blob/main/docs/decisions/001-pipeline-engine.md) |

`builtin` は採用しません。移行期はホストが `engine` を明示します。S2J 最終形は **`oss-notice`** をデフォルトとする想定です。

```json
{
  "pipeline": {
    "engine": "oss-notice",
    "onotConfig": "onot.yaml"
  }
}
```

解決順序 (`oss-notice`):

1. `tools.ossNoticePath`
2. `{host}/node_modules/.bin/s2j-oss-notice`
3. `PATH` 上の `s2j-oss-notice`

argv は onot と同型です (下記コマンド形)。

## onot `{@pipeline:s-onot}`

### 入力 `{@pipeline:s-h014}`

* Syft (および Feluda 後) の SPDX JSON
* `--config` で指定する **onot YAML** (`pipeline.onotConfig`、通常 `onot.yaml`)
* ファイルが **ない** 場合: v1は **WARN を出し、`--config` なしで onot を試行** (失敗時は exit コードを子プロセスに従う)

### 出力 `{@pipeline:s-h015}`

onot v1.2.x の `generate -o` は **ディレクトリ** です。配下に `OSS_Notice_*.md` が1件できます。CLI は最新の `.md` を `{output}` にコピーします。

```text
{workDir}/onot-notice/OSS_Notice_….md  →  {output}  (例: ACKNOWLEDGEMENTS.md)
```

### コマンド形 (v1) `{@pipeline:s-v1-3}`

```text
onot generate -i {workDir}/sbom.spdx.json -f md --config {onotConfigPath} -o {workDir}/onot-notice
```

### Python 環境 `{@pipeline:s-python}`

onot は PyPI 製です。実行ファイルは **`{host}/venv/bin/onot` を優先** (なければ PATH)。構築は [install.md](./install.md) の `init` 手順が正本です。

## 作業ディレクトリ `{@pipeline:s-h018}`

CLI は生成前に `workDir` を作成し、終了時に `--keep-intermediate` がない限り、中間ファイル削除を試みます (削除失敗は警告のみ)。

| パス (デフォルト) | 内容 | Git |
| --- | --- | --- |
| `build/oss-notice/` (設定 `workDir`) | 中間 SBOM、onot 出力 | **ignore 推奨** |
| ホスト指定 `output` | 最終 `ACKNOWLEDGEMENTS.md` (onot `.md` のコピー先) | ホスト方針 (多くは commit) |

## エラー処理 `{@pipeline:s-h019}`

| 状況 | 挙動 |
| --- | --- |
| 外部コマンドが見つからない | `doctor` と同様のメッセージを出し、exit `127` |
| Syft / onot が非ゼロ終了 | stderr を要約して伝播、exit コードは子プロセスに従う |
| 出力先が既存ファイル | デフォルトは **オーバーライト** (生成物の性質上)。`--dry-run` 時は書かない |
| ターゲット未解決 (`.app` 等) | 人間可読な解決手順を stderr に出し、exit `2` |

## `@s2j/oss-notice` (`engine: "oss-notice"`) `{@pipeline:s-oss-notice}`

[@s2j/oss-notice](https://github.com/stein2nd/s2j-oss-notice) は onot 互換の `generate` argv を提供します。入力・出力・`onot.yaml` は onot 節と同じです。

```text
s2j-oss-notice generate -i {workDir}/sbom.spdx.json -f md --config {onotConfigPath} -o {workDir}/onot-notice
```

ホストは `npm i -D @s2j/oss-notice` し、`doctor` でバイナリを確認します (Python venv は不要)。
