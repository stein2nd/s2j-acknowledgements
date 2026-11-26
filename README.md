# S2J Acknowledgements

[![License: GPL v3](https://img.shields.io/badge/License-GPL%20v3-blue.svg)](https://www.gnu.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

## Description

<!-- 
S2J Acknowledgements is a lightweight **npm CLI orchestrator** that generates **acknowledgments** (e.g., `ACKNOWLEDGEMENTS.md`) for third-party software, libraries, and tools used in host projects. Similar to [S2J Docs Linter](https://github.com/stein2nd/docs-linter) (`@s2j/docs-linter`), it provides a reproducible workflow using `init`, `doctor`, and `generate`. [Syft](https://github.com/anchore/syft) (SPDX-format SBOM), [onot](https://github.com/sktelecom/onot) (Markdown notice), and the optional [Feluda](https://github.com/anistark/feluda) are not included in the package but are invoked as child processes.
 -->

S2J Acknowledgements は、ホストプロジェクトで利用するサードパーティー製ソフトウェア、ライブラリ、ツール向けの **謝辞** (`ACKNOWLEDGEMENTS.md` 等) を生成する、薄い **npm CLI オーケストレーター** です。[S2J Docs Linter](https://github.com/stein2nd/docs-linter) (`@s2j/docs-linter`) と同型に、`init` / `doctor` / `generate` で再現可能なワークフローを提供します。[Syft](https://github.com/anchore/syft) (SPDX フォーマットの SBOM)、[onot](https://github.com/sktelecom/onot) (Markdown notice)、オプショナルな [Feluda](https://github.com/anistark/feluda) はパッケージに同梱せず、子プロセスとして呼び出します。

<!-- 
The generated Markdown can be bundled and displayed using, for example, the `acknowledgementsResourceName` from the [S2J About Window](https://github.com/stein2nd/s2j-about-window).
 -->

生成した Markdown は、たとえば [S2J About Window](https://github.com/stein2nd/s2j-about-window) の `acknowledgementsResourceName` からバンドルして表示できます。

## Features

<!-- 
* **CLI**: `init` / `doctor` / `generate` and JSON Schema configuration (`ack.config.json`)
* **Presets**: `macos-app` / `wordpress` / `dir` (includes default and `onot.yaml` templates)
* **Pipeline**: Syft (SPDX JSON) → (optional) Feluda → onot (Notice) → Output to specified path on the host
* **onot**: `init` sets up `./venv/` at the host root and performs a pip installation. `doctor` and `generate` prioritize `onot` within the venv
* **macOS App**: Resolution of Release `.app` files; Notice headers based on `pipeline.noticeProductName` / `xcode.productName`
* **Quality**: Vitest, `test:doctor` (ACK fixtures), ESLint + `tsc6`. CI for npm publication with `v*` tags
 -->

* **CLI**: `init` / `doctor` / `generate` と JSON Schema 設定 (`ack.config.json`)
* **プリセット**: `macos-app` / `wordpress` / `dir` (デフォルトと `onot.yaml` ひな型同梱)
* **パイプライン**: Syft (SPDX JSON) → (任意) Feluda → onot (Notice) → ホスト指定パスへ出力
* **onot**: `init` がホストルートの `./venv/` を用意し pip インストール。`doctor` / `generate` は venv 内 `onot` を優先
* **macOS アプリ**: Release `.app` の解決、`pipeline.noticeProductName` / `xcode.productName` による Notice 見出し
* **品質**: Vitest、`test:doctor` (ACK フィクスチャ)、ESLint + `tsc6`。tag `v*` で npm 公開 CI

## License

<!-- 
This project is licensed under the GPL v3.0 or later. For details, please refer to the [LICENSE](LICENSE) file.
 -->

本プロジェクトは GPL v3.0以降ライセンスの下で提供されています。詳細は [LICENSE](LICENSE) ファイルを参照してください。

## Support and Contact

<!-- 
For support, feature requests, or bug reports, please visit the [GitHub Issues](https://github.com/stein2nd/s2j-acknowledgements/issues) page.
 -->

サポート、機能リクエスト、またはバグ報告については、[GitHub Issues](https://github.com/stein2nd/s2j-acknowledgements/issues) ページをご覧ください。

---

## Installation

### Requirements

<!-- 
* Node.js v22+
* Host OS: **macOS** or **Linux** (v1 is not supported on Windows)
* [Syft](https://github.com/anchore/syft) (Must be installed separately on the host; not included with `init`)
* When running `generate`: Python v3 and **onot** (`init` creates `./venv/`)
 -->

* Node.js v22+
* ホスト OS: **macOS** または **Linux** (v1は Windows スコープ外)
* [Syft](https://github.com/anchore/syft) (ホストに別途インストール、`init` では入れない)
* `generate` 時: Python v3と **onot** (`init` が `./venv/` を作成)

### npm

<!-- 
Install it as a devDependency in the host project.
 -->

ホストプロジェクトで devDependency としてインストールします。

```zsh
npm install -D @s2j/acknowledgements
```

## Usage

### Quick start

```zsh
npm install -D @s2j/acknowledgements
npx s2j-acknowledgements init --preset dir
# preset: macos-app | wordpress | dir
brew install syft   # If not yet installed ([install.md](docs/install.md))
npx s2j-acknowledgements doctor --config ack.config.json
npx s2j-acknowledgements generate --config ack.config.json --dry-run
npx s2j-acknowledgements generate --config ack.config.json
```

<!-- 
`init` sets up `ack.config.json`, `onot.yaml`, and the host directory `./venv/` (for onot) in an **idempotent** manner. For details, see [docs/usage.md](docs/usage.md).
 -->

`init` は `ack.config.json`・`onot.yaml`・ホストルートの `./venv/` (onot 用) を **冪等** に用意します。詳細は [docs/usage.md](docs/usage.md) を参照してください。

### Host `package.json` scripts

```json
{
  "scripts": {
    "ack:doctor": "s2j-acknowledgements doctor --config ack.config.json",
    "ack:generate": "s2j-acknowledgements generate --config ack.config.json"
  }
}
```

### Presets

<!-- 
| Preset | Intended Host |
| --- | --- |
| `macos-app` | Xcode app (Scan for Release `.app` files) |
| `wordpress` | WordPress plugins, etc. |
| `dir` | General directory scan |
 -->

| Preset | 想定ホスト |
| --- | --- |
| `macos-app` | Xcode アプリ (Release `.app` スキャン) |
| `wordpress` | WordPress プラグイン等 |
| `dir` | 汎用ディレクトリスキャン |

<!-- 
Examples by host: [examples/cozy-brew](examples/cozy-brew/) (macOS), [examples/wordpress-plugin](examples/wordpress-plugin/).
 -->

ホスト別の例: [examples/cozy-brew](examples/cozy-brew/) (macOS)、[examples/wordpress-plugin](examples/wordpress-plugin/)。

### Integration with the `S2J About Window`

<!-- 
Example of displaying the bundled `ACKNOWLEDGEMENTS.md` file in the About window:
 -->

バンドルした `ACKNOWLEDGEMENTS.md` を About ウィンドウで表示する例:

```swift
aboutWindow.showAboutWindow(
    content: aboutMarkdown,
    licenseResourceName: "LICENSE",
    acknowledgementsResourceName: "ACKNOWLEDGEMENTS.md"
)
```

<!-- 
For more details, see the [S2J About Window README](https://github.com/stein2nd/s2j-about-window#bundled-license--acknowledgments).
 -->

詳細は [S2J About Window README](https://github.com/stein2nd/s2j-about-window#bundled-license--acknowledgments) を参照してください。

## CLI Reference

<!-- 
| Command | Description |
| --- | --- |
| `init --preset <name>` | Creates a template for the configuration, `./venv/`, and onot environment (Required: preset name) |
| `doctor [--config path]` | Diagnoses Syft, Python, onot, and recommended versions |
| `generate [--config path]` | Runs the process from SBOM collection to Notice generation |
| `generate --dry-run` | Previews the execution commands and paths (no side effects) |
 -->

| コマンド | 説明 |
| --- | --- |
| `init --preset <name>` | 設定・`./venv/`・ onot 環境のひな型 (必須: プリセット名) |
| `doctor [--config path]` | Syft / Python / onot / 推奨バージョンの診断 |
| `generate [--config path]` | SBOM 収集〜 Notice 生成まで実行 |
| `generate --dry-run` | 実行コマンドとパスのプレビュー (副作用なし) |

<!-- 
Original: [docs/cli.md](docs/cli.md).
 -->

正本: [docs/cli.md](docs/cli.md)。

## Documentation

<!-- 
| Document | Content |
| --- | --- |
| [docs/specs.md](docs/specs.md) | Specification Index (Master Copy) |
| [docs/usage.md](docs/usage.md) | Workflow from the Host |
| [docs/cli.md](docs/cli.md) | Subcommand Specifications |
| [docs/pipeline.md](docs/pipeline.md) | Syft / Feluda / onot |
| [docs/presets.md](docs/presets.md) | Preset Definitions |
| [docs/status.md](docs/status.md) | Implementation Progress |
| [docs/test-results.md](docs/test-results.md) | Manual E2E Records |
| [docs/implementation.md](docs/implementation.md) | Task IDs |
| [docs/publish.md](docs/publish.md) | npm Publishing Instructions |
 -->

| 文書 | 内容 |
| --- | --- |
| [docs/specs.md](docs/specs.md) | 仕様索引 (正本) |
| [docs/usage.md](docs/usage.md) | ホストからのワークフロー |
| [docs/cli.md](docs/cli.md) | サブコマンド契約 |
| [docs/pipeline.md](docs/pipeline.md) | Syft / Feluda / onot |
| [docs/presets.md](docs/presets.md) | プリセット定義 |
| [docs/status.md](docs/status.md) | 実装進捗 |
| [docs/test-results.md](docs/test-results.md) | 手動 E2E 記録 |
| [docs/implementation.md](docs/implementation.md) | タスク ID |
| [docs/publish.md](docs/publish.md) | npm 公開手順 |

## Testing

<!-- 
| Type | Command | Notes |
| --- | --- | --- |
| Unit | `npm test` | Vitest |
| Doctor Fixture | `npm run test:doctor` | ACK-001… ACK-006 |
| Lint | `npm run lint` | ESLint + `tsc6` |
| Documentation | `npm run lint:docs` | `@s2j/docs-linter` |
 -->

| 種別 | コマンド | 備考 |
| --- | --- | --- |
| ユニット | `npm test` | Vitest |
| Doctor フィクスチャ | `npm run test:doctor` | ACK-001… ACK-006 |
| Lint | `npm run lint` | ESLint + `tsc6` |
| ドキュメント | `npm run lint:docs` | `@s2j/docs-linter` |

## Development

### Project Structure

<!-- 
* `src/` — TypeScript CLI and pipeline implementation
* `presets/` — Presets included with npm
* `schema/` — `ack.config.json` JSON Schema
* `scripts/` — `test-doctor.sh`, distribution ZIP, etc.
* `docs/` — Markdown documentation
 -->

* `src/` — TypeScript CLI とパイプライン実装
* `presets/` — npm 同梱プリセット
* `schema/` — `ack.config.json` JSON Schema
* `scripts/` — `test-doctor.sh`、配布 zip 等
* `docs/` — 仕様 Markdown

### Setting Up Development Environment

<!-- 
1. Clone the repository.
 -->

1. リポジトリをクローンします。

   ```zsh
   git clone https://github.com/stein2nd/s2j-acknowledgements.git
   cd s2j-acknowledgements
   ```

<!-- 
2. Install the dependencies and run the quality gate.
 -->

2. 依存関係をインストールし、品質ゲートを実行します。

   ```zsh
   npm install
   npm run lint
   npm run test
   npm run test:doctor
   ```

### Building and Testing

```zsh
npm run build          # Vite → dist/bin/cli.js
npm run dist           # build + distribution zip
npm run format:check   # Prettier
npm run lint:docs      # Markdown (@s2j/docs-linter)
```

<!-- 
npm Publishing Instructions: [docs/publish.md](docs/publish.md).
 -->

npm 公開手順: [docs/publish.md](docs/publish.md)。

## Contributing

<!-- 
We look forward to your contributions. Please follow the steps below.
 -->

貢献をお待ちしています。以下の手順に従ってください。

<!-- 
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m ‘Add some amazing feature’`).
4. Push to the feature branch (`git push origin feature/amazing-feature`).
5. Open a pull request.
 -->

1. リポジトリをフォークしてください。
2. 機能ブランチを作成してください (`git checkout -b feature/amazing-feature`)。
3. 変更をコミットしてください (`git commit -m 'Add some amazing feature'`)。
4. 機能ブランチにプッシュしてください (`git push origin feature/amazing-feature`)。
5. Pull Request を開いてください。

<!-- 
*For detailed specifications, see [docs/specs.md](docs/specs.md).*
 -->

*詳細な仕様については、[docs/specs.md](docs/specs.md) を参照してください。*

### Development Guidelines

<!-- 
* We recommend running `npm run lint` / `npm test` / `npm run test:doctor` / `npm run format:check` / `npm run lint:docs` before committing.
* For specification changes, please update the canonical files in `docs/` and [decisions/](docs/decisions/).
 -->

* コミット前に `npm run lint` / `npm test` / `npm run test:doctor` / `npm run format:check` / `npm run lint:docs` を推奨します。
* 仕様変更は `docs/` の正本ファイルと [decisions/](docs/decisions/) を更新してください。

## Contributors & Developers

<!-- 
**“S2J Acknowledgements”** is open-source software. The following individuals have contributed to this tool.
 -->

**"S2J Acknowledgements"** はオープンソース・ソフトウェアです。以下の皆様がこのツールに貢献しています。

<!-- 
* **Developer**: Koutarou ISHIKAWA
 -->

* **開発者**: Koutarou ISHIKAWA

## Acknowledgments

<!-- 
* Pipelines: [Syft](https://github.com/anchore/syft), [onot](https://github.com/postman-oss/onot), and optionally [Feluda](https://github.com/LF-Engineering/feluda)
* Reference for CLI and documentation structure: [S2J Docs Linter](https://github.com/stein2nd/docs-linter)
* UI integration: [S2J About Window](https://github.com/stein2nd/s2j-about-window)
 -->

* パイプライン: [Syft](https://github.com/anchore/syft)、[onot](https://github.com/postman-oss/onot)、任意で [Feluda](https://github.com/LF-Engineering/feluda)
* CLI、ドキュメント構成の参考: [S2J Docs Linter](https://github.com/stein2nd/docs-linter)
* 表示連携: [S2J About Window](https://github.com/stein2nd/s2j-about-window)
