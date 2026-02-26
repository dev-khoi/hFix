"use client";

import { Amplify } from "aws-amplify";
import { parseAmplifyConfig } from "aws-amplify/utils";
import outputs from "../amplify_outputs.json";

const amplifyConfig = parseAmplifyConfig(outputs);

Amplify.configure({
  ...amplifyConfig,
  API: {
    ...amplifyConfig.API,
    REST: {
      myExistingApi: {
        endpoint: "https://7qryjxp0f1.execute-api.us-east-1.amazonaws.com/Prod",
        region: "us-east-1",
      },
    },
  },
});

export default function AmplifyProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
