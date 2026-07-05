#!/usr/bin/env bash
# uninstall.sh — 日次ハーネスを停止・削除する。
#   bash automation/uninstall.sh              # launchd 登録解除 (clone/ログは残す)
#   PURGE=1 bash automation/uninstall.sh       # publish clone とランチャも削除
set -uo pipefail

LABEL="com.smile-comfort.daily-articles"
PLIST_DST="$HOME/Library/LaunchAgents/$LABEL.plist"
BASE="$HOME/.smile-comfort"
PUBLISH_REPO="${PUBLISH_REPO:-$BASE/publish}"
UID_NUM="$(id -u)"

echo "== launchd 登録解除 =="
launchctl bootout "gui/$UID_NUM/$LABEL" 2>/dev/null && echo "bootout 済" || echo "(未登録)"
rm -f "$PLIST_DST" && echo "plist 削除: $PLIST_DST" || true

if [ "${PURGE:-0}" = 1 ]; then
  echo "== PURGE: ランチャ / publish clone を削除 =="
  rm -f "$BASE/launch.sh"
  rm -rf "$PUBLISH_REPO"
  echo "削除: $BASE/launch.sh, $PUBLISH_REPO"
  echo "(注) $BASE 配下の launchd ログは残しています。完全削除は 'rm -rf $BASE'"
else
  echo "publish clone とログは温存しました。完全削除は PURGE=1 で再実行。"
fi
echo "完了。"
