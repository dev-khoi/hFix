import base64
import boto3
import json

def ai_image_analyze(image_base64: str) -> str:
    client = boto3.client("bedrock-runtime", region_name="us-east-1")
    MODEL_ID = "us.amazon.nova-lite-v1:0"

    # image_base64 is already a base64 string — use directly
    base64_string = image_base64

    system_list = [
        {
            "text": """You are homeFix, a friendly and practical home maintenance AI assistant.
Your job is to help users diagnose and fix problems with home appliances,
devices, and household systems — such as Kindle e-readers, TVs, routers,
washing machines, microwaves, smart home devices, and more."""
        }
    ]

    message_list = [
        {
            "role": "user",
            "content": [
                {
                    "image": {
                        "format": "jpeg",
                        "source": {"bytes": base64_string},
                    }
                },
                {"text": "Analyze the image and categorize the main subject/device type."},
            ],
        }
    ]

    inf_params = {"maxTokens": 300, "topP": 0.1, "topK": 20, "temperature": 0.3}

    native_request = {
        "schemaVersion": "messages-v1",
        "messages": message_list,
        "system": system_list,
        "inferenceConfig": inf_params,
    }

    response = client.invoke_model(modelId=MODEL_ID, body=json.dumps(native_request))
    model_response = json.loads(response["body"].read())
    return model_response["output"]["message"]["content"][0]["text"]
