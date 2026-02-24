import os
import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect

from voiceChat.nova_sonic_bridge import NovaSonicBridge, DEFAULT_SYSTEM_PROMPT
from dotenv import load_dotenv

load_dotenv()


app = FastAPI()


@app.get("/health")
async def health():
    return {"ok": True}


@app.websocket("/ws/nova")
async def ws_nova(websocket: WebSocket):
    await websocket.accept()
    print("accepted")
    send_lock = asyncio.Lock()

    async def send(payload: dict):
        async with send_lock:
            await websocket.send_json(payload)

    region = os.getenv("AWS_DEFAULT_REGION") or os.getenv("AWS_REGION") or "us-east-1"

    bridge = NovaSonicBridge(
        model_id=os.getenv("NOVA_SONIC_MODEL_ID", "amazon.nova-sonic-v1:0"),
        region=region,
        system_prompt=os.getenv("NOVA_SONIC_SYSTEM_PROMPT", DEFAULT_SYSTEM_PROMPT),
        on_text=lambda event: send({"type": "assistant_text", **event}),
        on_audio=lambda event: send({"type": "assistant_audio", **event}),
        on_error=lambda message: send({"type": "error", "message": message}),
    )

    await bridge.start()
    await send({"type": "ready", "promptName": bridge.prompt_name})

    try:
        while True:
            msg = await websocket.receive_json()
            msg_type = msg.get("type")

            if msg_type == "ping":
                await send({"type": "pong"})
                continue

            if msg_type == "start_audio":
                await bridge.start_audio_input()
                print("start audio")
                continue

            if msg_type == "audio_chunk":
                content = msg.get("content", "")
                chunk_len = len(content)
                # On first real chunk, log first 16 bytes as hex to confirm PCM format
                if not getattr(bridge, "_first_chunk_logged", False):
                    import base64 as _b64

                    first_bytes = _b64.b64decode(content[:24] + "==")[:16]
                    print(f"audio_chunk #1 first bytes (hex): {first_bytes.hex()}")
                    bridge._first_chunk_logged = True
                print(f"audio_chunk received, b64 len={chunk_len}")
                await bridge.send_audio_base64_chunk(content)
                continue

            if msg_type == "end_audio":
                await bridge.end_audio_input()
                continue

            if msg_type == "text":
                await bridge.send_text_input(msg["content"])
                continue

            if msg_type == "stop":
                break

            await send(
                {"type": "error", "message": f"Unknown message type: {msg_type}"}
            )

        print("WebSocket connection closed by client")
    except WebSocketDisconnect:
        pass
    finally:
        print("closing bridge")
        await bridge.close()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
