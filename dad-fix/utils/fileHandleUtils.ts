// lib/api.ts
import { post } from "aws-amplify/api";

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

export async function uploadImage(file: File) {
  const response = await post({
    apiName: "myExistingApi",
    path: "/uploadImage",
    options: {
      body: { imageBase64: await fileToBase64(file) },
    },
  }).response;
  
  return response.body.json();
}
