# S2J Acknowledgements - 設計決定 ADR-002: 仕様正本マトリックス

## 状況 `{@002-canonical-sources:s-h001}`

同じ内容が複数の仕様 `.md` に重複し、実装時にどれが正か迷う。正本ディレクトリは **`docs/`**。

## 決定 `{@002-canonical-sources:s-h002}`

[specs.md](../specs.md) の **仕様正本マトリックス** に従う。他ファイルは要約か例示にとどめ、矛盾時はマトリックスの「正本」側を改訂する。

機械可読の正本:

* 設定フィールド: `schema/ack.config.schema.json`
* プリセットデフォルト値: `presets/<name>/defaults.json`
* 外部ツール推奨版: `config/recommended-tools.json`

## 影響 `{@002-canonical-sources:s-h003}`

* [implementation.md](../implementation.md) のタスク P0-04、P2-03、P0-06
