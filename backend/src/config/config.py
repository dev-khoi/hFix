"""
Lightweight config loader for environment-backed settings.
"""

import os
from dotenv import load_dotenv

load_dotenv()

# Access token for Amazon Bedrock (bearer token flow).
AWS_BEARER_TOKEN_BEDROCK: str | None = os.getenv("AWS_BEARER_TOKEN_BEDROCK")
