import asyncio
import base64
import json
import uuid
from collections.abc import Awaitable, Callable

# 0.5 s of silence at 16 kHz / 16-bit / mono = 16 000 zero bytes
_SILENT_PCM_B64: str = base64.b64encode(bytes(16_000)).decode("utf-8")

from aws_sdk_bedrock_runtime.client import (
    BedrockRuntimeClient,
    InvokeModelWithBidirectionalStreamOperationInput,
)
from aws_sdk_bedrock_runtime.config import Config
from aws_sdk_bedrock_runtime.models import (
    BidirectionalInputPayloadPart,
    InvokeModelWithBidirectionalStreamInputChunk,
)
from smithy_aws_core.identity.environment import EnvironmentCredentialsResolver
from dotenv import load_dotenv


load_dotenv()
DEFAULT_SYSTEM_PROMPT = """You are homeFix, a friendly and practical home maintenance AI assistant.
Your job is to help users diagnose and fix problems with home appliances,
devices, and household systems — such as Kindle e-readers, TVs, routers,
washing machines, microwaves, smart home devices, and more.

When a user describes a problem (by voice or image), you will:
1. Identify the likely cause of the issue in simple, plain language
2. Ask one follow-up question if you need more detail before diagnosing
3. Provide 2-3 clear, step-by-step fixes the user can try themselves
4. Tell the user honestly if the issue likely requires a professional

Guidelines:
- Keep responses short and conversational (2-4 sentences max per turn)
- Avoid technical jargon — speak like a helpful neighbour, not a manual
- Always prioritize safety first (e.g. unplug before inspecting)
- If the user shares a photo of an error screen or broken device,
  describe what you see and explain what it means
- If unsure, suggest the most common fix first, then escalate

You do NOT:
- Diagnose backend server or cloud service outages
- Access or request any private user data
- Handle car, medical, or structural building issues

Always end your first response by asking:
\"Can you describe what happened just before this issue started?\"
"""

OnEvent = Callable[[dict], Awaitable[None]]
OnError = Callable[[str], Awaitable[None]]


class NovaSonicBridge:
    def __init__(
        self,
        *,
        model_id: str = "amazon.nova-sonic-v1:0",
        region: str = "us-east-1",
        system_prompt: str = DEFAULT_SYSTEM_PROMPT,
        voice_id: str = "matthew",
        on_text: OnEvent | None = None,
        on_audio: OnEvent | None = None,
        on_error: OnError | None = None,
    ):
        self.model_id = model_id
        self.region = region
        self.system_prompt = system_prompt
        self.voice_id = voice_id

        self.on_text = on_text
        self.on_audio = on_audio
        self.on_error = on_error

        self.client: BedrockRuntimeClient | None = None
        self.stream = None
        self.is_active = False

        self.prompt_name = str(uuid.uuid4())
        self.system_content_name = str(uuid.uuid4())
        self.user_audio_content_name = str(uuid.uuid4())

        self._response_task: asyncio.Task | None = None
        self._keepalive_task: asyncio.Task | None = None
        self._audio_started = False
        self._audio_data_sent = False  # True once at least one audioInput was sent
        self._role: str | None = None
        self._generation_stage: str | None = None

    def _initialize_client(self):
        cfg = Config(
            endpoint_uri=f"https://bedrock-runtime.{self.region}.amazonaws.com",
            region=self.region,
            aws_credentials_identity_resolver=EnvironmentCredentialsResolver(),
        )
        self.client = BedrockRuntimeClient(cfg)

    async def _send_event(self, payload: dict):
        event_json = json.dumps(payload, separators=(",", ":"))
        event = InvokeModelWithBidirectionalStreamInputChunk(
            value=BidirectionalInputPayloadPart(bytes_=event_json.encode("utf-8"))
        )
        await self.stream.input_stream.send(event)

    async def start(self):
        if not self.client:
            self._initialize_client()

        self.stream = await self.client.invoke_model_with_bidirectional_stream(
            InvokeModelWithBidirectionalStreamOperationInput(model_id=self.model_id)
        )
        self.is_active = True

        await self._send_event(
            {
                "event": {
                    "sessionStart": {
                        "inferenceConfiguration": {
                            "maxTokens": 1024,
                            "topP": 0.9,
                            "temperature": 0.7,
                        }
                    }
                }
            }
        )

        await self._send_event(
            {
                "event": {
                    "promptStart": {
                        "promptName": self.prompt_name,
                        "textOutputConfiguration": {"mediaType": "text/plain"},
                        "audioOutputConfiguration": {
                            "mediaType": "audio/lpcm",
                            "sampleRateHertz": 24000,
                            "sampleSizeBits": 16,
                            "channelCount": 1,
                            "voiceId": self.voice_id,
                            "encoding": "base64",
                            "audioType": "SPEECH",
                        },
                    }
                }
            }
        )

        await self._send_event(
            {
                "event": {
                    "contentStart": {
                        "promptName": self.prompt_name,
                        "contentName": self.system_content_name,
                        "type": "TEXT",
                        "interactive": False,
                        "role": "SYSTEM",
                        "textInputConfiguration": {"mediaType": "text/plain"},
                    }
                }
            }
        )

        await self._send_event(
            {
                "event": {
                    "textInput": {
                        "promptName": self.prompt_name,
                        "contentName": self.system_content_name,
                        "content": (
                            self.system_prompt or DEFAULT_SYSTEM_PROMPT
                        ).strip(),
                    }
                }
            }
        )

        await self._send_event(
            {
                "event": {
                    "contentEnd": {
                        "promptName": self.prompt_name,
                        "contentName": self.system_content_name,
                    }
                }
            }
        )

        self._response_task = asyncio.create_task(self._process_responses())
        self._keepalive_task = asyncio.create_task(self._keepalive())

    async def start_audio_input(self):
        if not self.is_active or self._audio_started:
            return

        await self._send_event(
            {
                "event": {
                    "contentStart": {
                        "promptName": self.prompt_name,
                        "contentName": self.user_audio_content_name,
                        "type": "AUDIO",
                        "interactive": True,
                        "role": "USER",
                        "audioInputConfiguration": {
                            "mediaType": "audio/lpcm",
                            "sampleRateHertz": 16000,
                            "sampleSizeBits": 16,
                            "channelCount": 1,
                            "audioType": "SPEECH",
                            "encoding": "base64",
                        },
                    }
                }
            }
        )
        self._audio_started = True
        self._audio_data_sent = False

    async def send_audio_base64_chunk(self, audio_base64: str):
        if not self.is_active:
            return
        if not self._audio_started:
            await self.start_audio_input()

        await self._send_event(
            {
                "event": {
                    "audioInput": {
                        "promptName": self.prompt_name,
                        "contentName": self.user_audio_content_name,
                        "content": audio_base64,
                    }
                }
            }
        )
        self._audio_data_sent = True

    async def end_audio_input(self):
        if not self.is_active or not self._audio_started:
            return

        if not self._audio_data_sent:
            # contentStart was sent but no audioInput data followed —
            # Nova Sonic rejects contentEnd in this case, so just roll back state.
            print("[bridge] end_audio_input: no data sent, skipping contentEnd")
            self._audio_started = False
            self._audio_data_sent = False
            self.user_audio_content_name = str(uuid.uuid4())
            return

        await self._send_event(
            {
                "event": {
                    "contentEnd": {
                        "promptName": self.prompt_name,
                        "contentName": self.user_audio_content_name,
                    }
                }
            }
        )
        self._audio_started = False
        self._audio_data_sent = False
        self.user_audio_content_name = str(uuid.uuid4())

    async def send_text_input(self, content: str):
        if not self.is_active:
            return

        content_name = str(uuid.uuid4())
        await self._send_event(
            {
                "event": {
                    "contentStart": {
                        "promptName": self.prompt_name,
                        "contentName": content_name,
                        "type": "TEXT",
                        "interactive": True,
                        "role": "USER",
                        "textInputConfiguration": {"mediaType": "text/plain"},
                    }
                }
            }
        )
        await self._send_event(
            {
                "event": {
                    "textInput": {
                        "promptName": self.prompt_name,
                        "contentName": content_name,
                        "content": content,
                    }
                }
            }
        )
        await self._send_event(
            {
                "event": {
                    "contentEnd": {
                        "promptName": self.prompt_name,
                        "contentName": content_name,
                    }
                }
            }
        )

    async def close(self):
        if not self.is_active:
            return

        self.is_active = False

        response_task = self._response_task
        self._response_task = None
        keepalive_task = self._keepalive_task
        self._keepalive_task = None

        tasks_to_cancel = [
            t for t in (response_task, keepalive_task) if t and not t.done()
        ]
        for t in tasks_to_cancel:
            t.cancel()
        if tasks_to_cancel:
            await asyncio.gather(*tasks_to_cancel, return_exceptions=True)

        try:
            await self._send_event(
                {"event": {"promptEnd": {"promptName": self.prompt_name}}}
            )
            await self._send_event({"event": {"sessionEnd": {}}})
        except Exception:
            pass

        try:
            if self.stream:
                await self.stream.input_stream.close()
        except Exception:
            pass

    async def _keepalive(self) -> None:
        """Send silent audio every 25 s to prevent Nova Sonic's 59 s idle timeout."""
        INTERVAL = 25  # seconds between keepalive pings
        while self.is_active:
            await asyncio.sleep(INTERVAL)
            if not self.is_active:
                break
            if self._audio_started:
                # Real audio is already flowing — nothing to do
                continue
            keepalive_name = str(uuid.uuid4())
            try:
                await self._send_event(
                    {
                        "event": {
                            "contentStart": {
                                "promptName": self.prompt_name,
                                "contentName": keepalive_name,
                                "type": "AUDIO",
                                "interactive": True,
                                "role": "USER",
                                "audioInputConfiguration": {
                                    "mediaType": "audio/lpcm",
                                    "sampleRateHertz": 16000,
                                    "sampleSizeBits": 16,
                                    "channelCount": 1,
                                    "audioType": "SPEECH",
                                    "encoding": "base64",
                                },
                            }
                        }
                    }
                )
                await self._send_event(
                    {
                        "event": {
                            "audioInput": {
                                "promptName": self.prompt_name,
                                "contentName": keepalive_name,
                                "content": _SILENT_PCM_B64,
                            }
                        }
                    }
                )
                await self._send_event(
                    {
                        "event": {
                            "contentEnd": {
                                "promptName": self.prompt_name,
                                "contentName": keepalive_name,
                            }
                        }
                    }
                )
            except Exception:
                pass  # stream may be closing; ignore

    async def _emit_error(self, message: str):
        if self.on_error:
            await self.on_error(message)

    async def _process_responses(self):
        try:
            while self.is_active:
                # Yield so the event loop can process incoming audio sends
                await asyncio.sleep(0)

                output = await self.stream.await_output()
                result = await output[1].receive()

                if not result.value or not result.value.bytes_:
                    continue

                response_data = result.value.bytes_.decode("utf-8")
                json_data = json.loads(response_data)
                event = json_data.get("event") or {}
                print(
                    f"[Nova] event keys: {list(event.keys())}, role={self._role}, stage={self._generation_stage}"
                )

                if "contentStart" in event:
                    content_start = event["contentStart"]
                    self._role = content_start.get("role")
                    self._generation_stage = None
                    additional = content_start.get("additionalModelFields")
                    if additional:
                        try:
                            additional_fields = json.loads(additional)
                            self._generation_stage = additional_fields.get(
                                "generationStage"
                            )
                        except Exception:
                            self._generation_stage = None
                    continue

                if "textOutput" in event:
                    if self._role == "ASSISTANT" and self.on_text:
                        await self.on_text(
                            {
                                "content": event["textOutput"].get("content", ""),
                                "generationStage": self._generation_stage,
                            }
                        )
                    continue

                if "audioOutput" in event:
                    if self._role == "ASSISTANT" and self.on_audio:
                        await self.on_audio(
                            {
                                "content": event["audioOutput"].get("content", ""),
                                "mediaType": "audio/lpcm",
                                "sampleRateHertz": 24000,
                                "sampleSizeBits": 16,
                                "channelCount": 1,
                            }
                        )
                    continue
        except asyncio.CancelledError:
            return
        except Exception as e:
            await self._emit_error(f"Nova Sonic stream error: {e}")
