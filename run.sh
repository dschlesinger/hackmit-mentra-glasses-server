# This does works I think, if doesn't copy this into 2 terminals
# ngrok http --url=minnie-unbeloved-myong.ngrok-free.app 5000
# bun run dev
NGROK_URL=minnie-unbeloved-myong.ngrok-free.app

ngrok http --url=${NGROK_URL} 5000 & bun run dev