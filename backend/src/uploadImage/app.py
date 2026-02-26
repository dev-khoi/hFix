from datetime import datetime
import json
import base64
import uuid
import os
import boto3
from imageAnalyzeBot import ai_image_analyze

s3 = boto3.client("s3", region_name="us-east-1")
dynamodb = boto3.resource("dynamodb", region_name="us-east-1")
table = dynamodb.Table(os.environ["TABLE_NAME"])

BUCKET = os.environ["S3_BUCKET_NAME"]


def lambda_handler(event, context):
    body = json.loads(event["body"])

    image_base64 = body["imageBase64"]
    ext = body.get("extension", "jpg")
    image_bytes = base64.b64decode(image_base64)  # decode to actual bytes

    file_id = str(uuid.uuid4())
    image_key = f"images/{file_id}.{ext}"
    analysis_key = f"analysis/{file_id}.txt"

    s3.put_object(
        Bucket=BUCKET, Key=image_key, Body=image_bytes, ContentType=f"image/{ext}"
    )

    # Pass base64 string to Nova
    analysis_result = ai_image_analyze(image_base64)

    s3.put_object(
        Bucket=BUCKET,
        Key=analysis_key,
        Body=analysis_result.encode("utf-8"),
        ContentType="text/plain",
    )

    table.put_item(
        Item={
            "id": file_id,
            "imageKey": image_key,
            "analysisKey": analysis_key,
            "createdAt": str(datetime.timezone.utc),
            "userId": event.get("requestContext", {})
            .get("identity", {})
            .get("cognitoIdentityId", "anonymous"),

            # identity
        }
    )

    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        },
        "body": json.dumps(
            {
                "reply": analysis_result,
                "imageKey": image_key,
                "analysisKey": analysis_key,
            }
        ),
    }
