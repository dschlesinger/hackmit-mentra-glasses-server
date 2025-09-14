# This does works I think
NGROK_URL=minnie-unbeloved-myong.ngrok-free.app

ngrok http --url=${NGROK_URL} 5000 & bun run dev