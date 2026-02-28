"use client";
import {
  useState,
  useRef,
  type RefObject,
  type DragEvent,
  type ChangeEvent,
} from "react";
import { uploadImage } from "../../utils/fileHandleUtils";
import { useRouter } from "next/navigation";
import { useRefresh } from "../RefreshContext";

const ACCEPTED_TYPES = ["image/png", "image/jpeg"];
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export default function PictureUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<File | null>(null);
  const dragCounter = useRef(0);
  const router = useRouter();
  const { triggerRefresh } = useRefresh();

  function handleFile(file: File) {
    setError(null);
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Only PNG and JPG images are supported.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("File is too large. Maximum size is 10 MB.");
      return;
    }
    if (fileRef) fileRef.current = file;
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreview(url);
  }

  //   ~Drag file
  function onDragEnter(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    dragCounter.current += 1;
    if (dragCounter.current === 1) setIsDragging(true);
  }
  function onDragLeave(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) setIsDragging(false);
  }

  function onDragOver(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
  }
  function onDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function onInputChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  function clearSelection() {
    if (fileRef) fileRef.current = null;
    setSelectedFile(null);
    setPreview(null);
    setError(null);
  }

  return (
    <div className="flex flex-col items-center justify-center w-full gap-3">
      <label
        htmlFor="picture-upload"
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        className={[
          "flex flex-col items-center justify-center",
          "w-full h-64",
          "border-2 border-dashed rounded-2xl",
          "cursor-pointer transition-colors duration-200 group",
          isUploading && "opacity-50 pointer-events-none",
          isDragging
            ? "border-blue-500 bg-blue-50 scale-[1.01]"
            : "border-gray-400 bg-gray-50 hover:bg-gray-100",
        ].join(" ")}>
        {preview ? (
          <img
            src={preview}
            alt="Uploaded preview"
            className="h-full w-full object-contain rounded-2xl p-2"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 px-6 text-center pointer-events-none">
            <div
              className={[
                "p-4 rounded-full transition-colors duration-200",
                isDragging
                  ? "bg-blue-200"
                  : "bg-gray-200 group-hover:bg-gray-300",
              ].join(" ")}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={[
                  "w-8 h-8",
                  isDragging ? "text-blue-500" : "text-gray-500",
                ].join(" ")}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">
                {isDragging ? (
                  <span className="text-blue-600">Drop it here!</span>
                ) : (
                  <>
                    Click to upload{" "}
                    <span className="text-gray-400 font-normal">
                      or drag & drop
                    </span>
                  </>
                )}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                PNG, JPG, WEBP up to 10 MB
              </p>
            </div>
          </div>
        )}

        <input
          ref={inputRef}
          id="picture-upload"
          type="file"
          accept="image/png, image/jpeg, image/webp"
          className="hidden"
          onChange={onInputChange}
        />
      </label>

      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

      {preview && (
        <button
          type="button"
          onClick={clearSelection}
          className="text-xs text-gray-500 underline hover:text-red-500 transition-colors">
          Remove image
        </button>
      )}
      {selectedFile && (
        <button
          type="button"
          disabled={isUploading}
          onClick={async () => {
            if (fileRef.current) {
              setIsUploading(true);
              try {
                const { id } = await uploadImage(fileRef.current);

                setIsUploading(false);
                triggerRefresh();
                router.push(`/chat/${id}`);
                router.refresh();
              } catch (e) {
                console.error(e);
              }
            }
          }}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            isUploading
              ? "bg-gray-400 text-white cursor-not-allowed opacity-60"
              : "bg-blue-500 text-white hover:bg-blue-600 active:scale-95"
          }`}>
          {isUploading ? "Uploading..." : "Upload"}
        </button>
      )}
    </div>
  );
}
