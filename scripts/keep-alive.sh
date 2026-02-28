#!/bin/bash
# keep-alive.sh — devサーバーとCloudflareトンネルの死活監視
# 使い方: bash scripts/keep-alive.sh

TUNNEL_LOG="/tmp/cloudflared-tunnel.log"

echo "🔁 Starting cloudflared tunnel with auto-reconnect..."
nohup cloudflared tunnel --url http://localhost:3001 \
  --retries 10 \
  --grace-period 30s \
  > "$TUNNEL_LOG" 2>&1 &

TUNNEL_PID=$!
echo "📡 Tunnel PID: $TUNNEL_PID"

# Wait for URL to appear in log
for i in {1..15}; do
  URL=$(grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' "$TUNNEL_LOG" | head -1)
  if [ -n "$URL" ]; then
    echo ""
    echo "✅ Tunnel URL:"
    echo "$URL"
    echo ""
    echo "$URL" > /tmp/tunnel-url.txt
    break
  fi
  sleep 1
done

if [ -z "$URL" ]; then
  echo "⚠️ URLの取得に失敗。ログ確認: cat $TUNNEL_LOG"
fi

echo "💡 トンネル停止: kill $TUNNEL_PID"
echo "📋 URL再確認: cat /tmp/tunnel-url.txt"
