# 00_how_to_continue

この文書は再開用入口です。  
次回以降は会話履歴ではなく、ここから repo 内文書を辿って状況を把握します。

## 最初に読む順番

1. `AGENT_INDEX.md`
2. `ops/CURRENT_TASKS.md`
3. `ops/DECISION_LOG.md`
4. `docs/02_requirements.md`
5. `docs/03_architecture.md`
6. `docs/04_content_data_spec.md`
7. `docs/06_storage_state_spec.md`
8. 素材追加時は `docs/09_content_policy.md`
9. passage 追加・レビュー時は `docs/10_content_addition_workflow.md`

## 現在の重要方針

- docs-first
- 静的Web + ローカル保存を初期成立点にする
- Python は build 側、JavaScript は runtime 側に分離する
- 素材の出典と利用条件を追跡できる構造を保つ
- ライセンスが曖昧な素材は採用しない
- 初期段階では API 依存を持ち込まない
- 新規 passage は `docs/10_content_addition_workflow.md` に沿って追加する

## 再開時の最小手順

1. `ops/CURRENT_TASKS.md` で未完了タスクを確認する
2. 関連する `docs/` を読む
3. 変更前に `ops/DECISION_LOG.md` の既存判断を確認する
4. 実装または文書更新を行う
5. 必要なら `CURRENT_TASKS` と `DECISION_LOG` を更新する

## 迷った時の判断基準

- 仕様は `docs/`
- 現在の作業優先度は `ops/CURRENT_TASKS.md`
- 採用判断は `ops/DECISION_LOG.md`
- 素材可否は `docs/09_content_policy.md`
- 英文追加手順は `docs/10_content_addition_workflow.md`
