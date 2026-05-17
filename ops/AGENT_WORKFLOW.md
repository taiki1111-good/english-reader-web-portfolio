# AGENT_WORKFLOW

## AI に依頼する時の基本ルール

- 会話履歴より repo 内文書を優先する
- まず `AGENT_INDEX.md` から読む
- 実装前に関係仕様を確認する
- 推測で素材を追加せず、出典とライセンスを確認する
- passage 追加・レビュー時は `docs/10_content_addition_workflow.md` を確認する

## モデル / タスク分離

- Codex 5.5 thinking: repo 横断の仕様判断、passage データ契約、content workflow、検証方針、将来保守性に関わる作業
- Codex 5.3: 仕様確定後の小さな実装、局所修正、軽微な確認作業

## docs を先に読む順番

1. `AGENT_INDEX.md`
2. `docs/00_how_to_continue.md`
3. `docs/02_requirements.md`
4. `docs/03_architecture.md`
5. `docs/04_content_data_spec.md`
6. `docs/05_ui_flow_spec.md`
7. `docs/06_storage_state_spec.md`
8. passage 追加時は `docs/09_content_policy.md`
9. passage 追加・レビュー時は `docs/10_content_addition_workflow.md`

## 大きな変更前の確認

- UI変更前に `docs/05_ui_flow_spec.md`
- データ変更前に `docs/04_content_data_spec.md`
- passage 追加前に `docs/10_content_addition_workflow.md`
- 保存変更前に `docs/06_storage_state_spec.md`
- スコープ変更前に `docs/02_requirements.md`
- 構成変更前に `docs/03_architecture.md`

## 変更後の更新ルール

- 実作業の進捗が変わったら `ops/CURRENT_TASKS.md` を更新する
- 新しい判断をしたら `ops/DECISION_LOG.md` を更新する
- 引き継ぎ事項があるなら `ops/CHANGE_MEMO_TEMPLATE.md` を使ってメモを残す
