import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource";
import { PolicyStatement, Effect } from "aws-cdk-lib/aws-iam";
import { myApiFunction } from "./api-function/resource";
import { Function } from "aws-cdk-lib/aws-lambda";
import { Stack } from "aws-cdk-lib";
import {
  RestApi,
  Cors,
  LambdaIntegration,
  CognitoUserPoolsAuthorizer,
  AuthorizationType,
} from "aws-cdk-lib/aws-apigateway";
import { Table } from "aws-cdk-lib/aws-dynamodb";
import { Bucket } from "aws-cdk-lib/aws-s3";

const backend = defineBackend({
  auth,
  myApiFunction,
  // ✅ dynamoFunction removed — SAM Lambda handles everything
});

// Grant authenticated users permission to invoke Nova Sonic via Bedrock
backend.auth.resources.authenticatedUserIamRole.addToPrincipalPolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ["bedrock:InvokeModelWithResponseStream", "bedrock:InvokeModel"],
    resources: [
      "arn:aws:bedrock:us-east-1::foundation-model/amazon.nova-2-sonic-v1:0",
    ],
  }),
);

const apiStack = backend.createStack("api-stack");

// Reference existing DynamoDB table
const existingTable = Table.fromTableArn(
  apiStack,
  "ExistingDynamoTable",
  "arn:aws:dynamodb:us-east-1:931324892361:table/sam-app-UploadImageTable-1RPFIG5TI3BCO",
);
const existingBucket = Bucket.fromBucketArn(
  apiStack,
  "ExistingUploadBucket",
  "arn:aws:s3:::sam-app-uploadimagebucket-podvwpwn2apf",
);
const existingLambda = Function.fromFunctionArn(
  apiStack,
  "ExistingLambda",
  "arn:aws:lambda:us-east-1:931324892361:function:sam-app-UploadImageFunction-71KMe444ooxi",
);

// permissions
// existingTable.grantReadWriteData(existingLambda);
// existingBucket.grantReadWrite(existingLambda);
// existingBucket.grantRead(existingLambda);

const restApi = new RestApi(apiStack, "RestApi", {
  restApiName: "imageAnalyzer",
  defaultCorsPreflightOptions: {
    allowOrigins: Cors.ALL_ORIGINS,
    allowMethods: Cors.ALL_METHODS,
  },
});

const lambdaIntegration = new LambdaIntegration(existingLambda);

const authorizer = new CognitoUserPoolsAuthorizer(apiStack, "CognitoAuth", {
  cognitoUserPools: [backend.auth.resources.userPool],
});

// POST /items → SAM Lambda → handle_upload()
restApi.root.addResource("items").addMethod("POST", lambdaIntegration, {
  authorizer,
  authorizationType: AuthorizationType.COGNITO,
});

// GET /records → SAM Lambda → handle_get_records()
const recordsResource = restApi.root.addResource("records");
recordsResource.addMethod("GET", lambdaIntegration, {
  authorizer,
  authorizationType: AuthorizationType.COGNITO,
});

// GET /records/{id} → SAM Lambda → handle_get_single_record()
const recordIdResource = recordsResource.addResource("{id}");
recordIdResource.addMethod("GET", lambdaIntegration, {
  authorizer,
  authorizationType: AuthorizationType.COGNITO,
});

backend.addOutput({
  custom: {
    API: {
      [restApi.restApiName]: {
        endpoint: restApi.url,
        region: Stack.of(restApi).region,
        apiName: restApi.restApiName,
      },
    },
  },
});
