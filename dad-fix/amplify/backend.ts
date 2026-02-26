import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource";
import { PolicyStatement, Effect } from "aws-cdk-lib/aws-iam";
import { myApiFunction } from "./api-function/resource";
import { Function } from "aws-cdk-lib/aws-lambda";
import { Stack } from "aws-cdk-lib";
import { RestApi, Cors, LambdaIntegration, CognitoUserPoolsAuthorizer, AuthorizationType } from "aws-cdk-lib/aws-apigateway";

const backend = defineBackend({
  auth,
  myApiFunction,
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
const existingLambda = Function.fromFunctionArn(
  apiStack,
  "ExistingLambda",
  "arn:aws:lambda:us-east-1:931324892361:function:sam-app-UploadImageFunction-71KMe444ooxi",
);

const restApi = new RestApi(apiStack, "RestApi", {
  restApiName: "imageAnalyzer",
  defaultCorsPreflightOptions: {
    allowOrigins: Cors.ALL_ORIGINS, //!
    allowMethods: Cors.ALL_METHODS,
  },
});

const lambdaIntegration = new LambdaIntegration(existingLambda);

// protect lambda 
const authorizer = new CognitoUserPoolsAuthorizer(apiStack, "CognitoAuth", {
  cognitoUserPools: [backend.auth.resources.userPool],
});

restApi.root.addResource("items").addMethod("POST", lambdaIntegration, {
  authorizer,
  authorizationType: AuthorizationType.COGNITO,
});
// Expose the URL to your frontend via amplify_outputs.json
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
