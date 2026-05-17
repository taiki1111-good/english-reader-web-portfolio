# REPO_MAP

この repo は、仕様を `docs/`、運用判断を `ops/`、素材管理を `materials/`、公開サイトをルート直下の HTML / CSS / JavaScript / JSON に分ける最小構成です。

## ルート

- `README.md`
  - 人向けの概要入口
- `AGENT_INDEX.md`
  - AI向けの最初の入口
- `REPO_MAP.md`
  - repo 全体の責務整理

## docs

- `docs/00_how_to_continue.md`
  - 再開手順と読む順番
- `docs/01_overview.md`
  - プロジェクトの目的とスコープ
- `docs/02_requirements.md`
  - 機能要件、非機能要件、初期スコープ外
- `docs/03_architecture.md`
  - 責務分離と構成方針
- `docs/04_content_data_spec.md`
  - `passages.json` のデータ仕様
- `docs/05_ui_flow_spec.md`
  - 画面役割と遷移
- `docs/06_storage_state_spec.md`
  - `localStorage` キーと状態管理
- `docs/07_test_plan.md`
  - 最低限の検証方針
- `docs/08_development_plan.md`
  - 初期開発順序
- `docs/09_content_policy.md`
  - 採用可能素材とライセンス運用
- `docs/10_content_addition_workflow.md`
  - 新しい英文 passage の追加手順、content level、検証チェックリスト

書くべき内容:

- 仕様、前提、責務、命名ルール、スコープ境界

## ops

- `ops/AGENT_WORKFLOW.md`
  - AI 依頼時の基本運用
- `ops/CURRENT_TASKS.md`
  - 現在の実作業と優先順位
- `ops/DECISION_LOG.md`
  - 継続判断の履歴
- `ops/CHANGE_MEMO_TEMPLATE.md`
  - 変更メモの雛形

書くべき内容:

- 今やる作業、変更後に残す判断、引き継ぎメモ

## materials

- `materials/raw/`
  - 取得直後の未整形素材
- `materials/curated/`
  - 利用可能と判断した整形前後の管理用素材
- `materials/licenses/LICENSE_REGISTRY.md`
  - 採用ライセンス種別の管理
- `materials/licenses/SOURCE_LOG.md`
  - 素材ごとの出典記録

書くべき内容:

- 素材本体、出典、利用条件、改変有無

## scripts

- Python による素材整形、検証、JSON 出力を置く

書くべき内容:

- build 側の処理

## public site

- ルート直下の `index.html`, `reader.html`, `vocab.html`, `review.html`, `flashcard.html` が静的Web本体です。
- `css/`, `js/`, `data/` が公開サイト用のスタイル、動作、教材データです。

書くべき内容:

- runtime 側の表示、操作、保存

## tests

- Python スクリプトや JSON 妥当性確認のテストを置く

書くべき内容:

- 自動確認コード、簡易検証用ファイル

## portfolio

- 公開紹介文、スクリーンショット、簡易成果物メモなどを置く余地

書くべき内容:

- 実装本体ではなく外部共有用の補助資料
