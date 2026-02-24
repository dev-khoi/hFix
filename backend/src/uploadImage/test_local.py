import sys
import os

# Since test_local.py is inside src/uploadImage/, app.py is in the same folder
sys.path.insert(0, os.path.dirname(__file__))

import base64
import json

os.environ["S3_BUCKET_NAME"] = "your-actual-sam-bucket-name"

from app import lambda_handler

# Load image from same folder as this script
path = os.path.dirname(__file__)
with open(f"{path}/keetle.png", "rb") as f:
    image_base64 = base64.b64encode(f.read()).decode("utf-8")

fake_event = {
    "body": json.dumps({
        "imageBase64": image_base64,
        "extension": "jpg"
    })
}

result = lambda_handler(fake_event, None)
print(result)
