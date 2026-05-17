# AGENT_INDEX

この repo で AI が最初に読む入口文書です。  
会話履歴より、ここから辿れる repo 内文書を優先して判断してください。

## 読む順番

1. [README.md](./README.md)
2. [docs/00_how_to_continue.md](./docs/00_how_to_continue.md)
3. [docs/01_overview.md](./docs/01_overview.md)
4. [docs/02_requirements.md](./docs/02_requirements.md)
5. [docs/03_architecture.md](./docs/03_architecture.md)
6. [docs/04_content_data_spec.md](./docs/04_content_data_spec.md)
7. [docs/05_ui_flow_spec.md](./docs/05_ui_flow_spec.md)
8. [docs/06_storage_state_spec.md](./docs/06_storage_state_spec.md)
9. [docs/09_content_policy.md](./docs/09_content_policy.md)
10. [docs/10_content_addition_workflow.md](./docs/10_content_addition_workflow.md)
11. [ops/CURRENT_TASKS.md](./ops/CURRENT_TASKS.md)
12. [ops/DECISION_LOG.md](./ops/DECISION_LOG.md)

## 優先文書

- 要件判断: `docs/02_requirements.md`
- 構成判断: `docs/03_architecture.md`
- データ判断: `docs/04_content_data_spec.md`
- 英文追加・passage レビュー判断: `docs/10_content_addition_workflow.md`
- UI判断: `docs/05_ui_flow_spec.md`
- 保存判断: `docs/06_storage_state_spec.md`
- 運用判断: `ops/AGENT_WORKFLOW.md`

## 実装前確認ルール

- 大きな変更前に `requirements / architecture / storage` を確認する
- 素材や文章データを追加する前に `docs/09_content_policy.md` と `docs/10_content_addition_workflow.md` を確認する
- 出典とライセンスが不明な素材は追加しない
- 新しい保存項目を追加する前に `docs/06_storage_state_spec.md` を更新する
- 新しいデータ項目を追加する前に `docs/04_content_data_spec.md` を更新する
- 会話内の一時判断より、repo 内文書の明記を優先する

## 変更時に見るべき文書

- `docs/` を変える時: 関連仕様と重複がないかを確認する
- 公開サイトの HTML / CSS / JavaScript / JSON を変える時: `docs/05_ui_flow_spec.md` と `docs/06_storage_state_spec.md` を確認する
- `scripts/` を変える時: `docs/03_architecture.md` と `docs/04_content_data_spec.md` を確認する
- `materials/` を変える時: `docs/09_content_policy.md` と `materials/licenses/` を確認する
- `data/passages.json` に passage を追加・レビューする時: `docs/04_content_data_spec.md` と `docs/10_content_addition_workflow.md` を確認する
- 変更後は `ops/CURRENT_TASKS.md` と `ops/DECISION_LOG.md` の更新要否を確認する
