from datetime import datetime
import json
import base64
import uuid
import os
import boto3
from imageAnalyzeBot import ai_image_analyze
import datetime

s3 = boto3.client("s3", region_name="us-east-1")
dynamodb = boto3.resource("dynamodb", region_name="us-east-1")
table = dynamodb.Table(os.environ["TABLE_NAME"])

BUCKET = os.environ["S3_BUCKET_NAME"]


def lambda_handler(event, context):
    http_method = event.get("httpMethod", "")
    resource = event.get("resource", "")
    path_parameters = event.get("pathParameters") or {}

    if http_method == "POST" and resource == "/items":
        return handle_upload(event)

    if http_method == "GET" and resource == "/records":
        return handle_get_records(event)

    if http_method == "GET" and resource == "/records/{id}":
        item_id = path_parameters.get("id")
        if not item_id:
            return {
                "statusCode": 400,
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
                "body": json.dumps({"error": "Missing item ID"}),
            }
        return handle_get_single_record(event, item_id)

    return {
        "statusCode": 404,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        },
        "body": json.dumps({"error": "Route not found"}),
    }


def handle_upload(event):
    body = json.loads(event["body"])
    image_base64 = body["imageBase64"]
    ext = body.get("extension", "jpg")
    image_bytes = base64.b64decode(image_base64)

    file_id = str(uuid.uuid4())
    image_key = f"images/{file_id}.{ext}"
    analysis_key = f"analysis/{file_id}.txt"

    s3.put_object(
        Bucket=BUCKET, Key=image_key, Body=image_bytes, ContentType=f"image/{ext}"
    )

    analysis_result = ai_image_analyze(image_base64)

    s3.put_object(
        Bucket=BUCKET,
        Key=analysis_key,
        Body=analysis_result.encode("utf-8"),
        ContentType="text/plain",
    )

    created_at = datetime.datetime.now(datetime.timezone.utc).isoformat()

    table.put_item(
        Item={
            "id": file_id,
            "imageKey": image_key,
            "analysisKey": analysis_key,
            "createdAt": created_at,
            "userId": event.get("requestContext", {})
            .get("identity", {})
            .get("cognitoIdentityId", "anonymous"),
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


def handle_get_records(event):
    user_id = (
        event.get("requestContext", {})
        .get("identity", {})
        .get("cognitoIdentityId", "anonymous")
    )

    result = table.scan(
        FilterExpression=boto3.dynamodb.conditions.Attr("userId").eq(user_id)
    )
    items = result.get("Items", [])

    # handle pagination
    while "LastEvaluatedKey" in result:
        result = table.scan(
            ExclusiveStartKey=result["LastEvaluatedKey"],
            FilterExpression=boto3.dynamodb.conditions.Attr("userId").eq(user_id),
        )
        items.extend(result.get("Items", []))

    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        },
        "body": json.dumps(items, default=str),
    }


def handle_get_single_record(event, item_id):
    user_id = (
        event.get("requestContext", {})
        .get("identity", {})
        .get("cognitoIdentityId", "anonymous")
    )

    try:
        response = table.get_item(Key={"id": item_id})
        item = response.get("Item")

        if not item:
            return {
                "statusCode": 404,
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
                "body": json.dumps({"error": "Record not found"}),
            }

        # Check if user owns this record
        if item.get("userId") != user_id:
            return {
                "statusCode": 403,
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
                "body": json.dumps({"error": "Access denied"}),
            }

        # Generate signed URLs for this specific item
        if "imageKey" in item and item["imageKey"]:
            item["imageUrl"] = s3.generate_presigned_url(
                "get_object",
                Params={"Bucket": BUCKET, "Key": item["imageKey"]},
                ExpiresIn=3600,
            )
        if "analysisKey" in item and item["analysisKey"]:
            item["analysisUrl"] = s3.generate_presigned_url(
                "get_object",
                Params={"Bucket": BUCKET, "Key": item["analysisKey"]},
                ExpiresIn=3600,
            )

        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            "body": json.dumps(item, default=str),
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            "body": json.dumps({"error": str(e)}),
        }
