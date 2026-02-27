// lib/api.ts
import { post } from "aws-amplify/api";

type UploadImageResponse = {
  id?: string;
  reply?: string;
  imageKey?: string;
  analysisKey?: string;
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]); // IMPORTANT
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const deriveIdFromKey = (key?: string) => {
  if (!key) return undefined;
  const lastSegment = key.split("/").pop();
  if (!lastSegment) return undefined;
  return lastSegment.split(".")[0];
};

export async function uploadImage(file: File) {
  const response = await post({
    apiName: "myExistingApi",
    path: "/items",
    options: {
      body: { imageBase64: await fileToBase64(file) },
    },
  }).response;

  const data = (await response.body.json()) as UploadImageResponse;
  const id = data.id ?? deriveIdFromKey(data.analysisKey ?? data.imageKey);

  return { ...data, id };
}
