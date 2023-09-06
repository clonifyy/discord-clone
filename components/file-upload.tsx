"use-client";

import { X } from "lucide-react";

import { UploadDropzone } from "@/lib/uploadthing";
import "@uploadthing/react/styles.css";
import Image from "next/image";

interface Props {
  onChange: (url?: string) => void;
  value: string;
  endPoint: "messageFile" | "serverImage";
}
export default function FileUpload({ onChange, value, endPoint }: Props) {
  const fileType = value?.split(".").pop();
  if (value && fileType !== "pdf") {
    return (
      <div className="relative h-20 w-20">
        <Image fill src={value} alt="upload" className="rounded-full" />
      </div>
    );
  }
  return (
    <UploadDropzone
      endpoint={endPoint}
      onClientUploadComplete={(res) => {
        console.log(res);
        onChange(res?.[0]?.url);
      }}
      onUploadError={(error: Error) => {
        console.log({ error });
      }}
    />
  );
}
