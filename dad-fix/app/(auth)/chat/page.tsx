import PictureUpload from "@/components/pictureUpload/pictureUpload";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 px-4">
      <div className="text-center text-gray-600">
        <h2 className="text-2xl font-semibold mb-2">Start a New Chat</h2>
        <p>
          Upload a picture to create a chat. You will be taken to the chat once
          the upload finishes.
        </p>
      </div>
      <div className="w-full max-w-2xl">
        <PictureUpload />
      </div>
    </div>
  );
}
