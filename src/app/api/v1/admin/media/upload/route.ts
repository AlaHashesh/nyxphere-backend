import { withErrorHandler } from "@/utils/withErrorHandler";
import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/firebase/serverApp";
import { BadRequestError } from "@/errors/BadRequestError";
import { getFullUrl } from "@/utils/media";

const getFolder = (source: string | null) => {
  if (!source) {
    return "default";
  }

  switch (source) {
    case "icon":
      return "icons";
    case "image":
      return "images";
    case "audio":
      return "audio";
  }

  return "default";
};

export const POST = withErrorHandler(async (req: NextRequest) => {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const source = formData.get("source") as string | null;

  if (!file) {
    throw new BadRequestError("No file uploaded");
  }

  if ((source === "image" || source === "icon") && !file.type.startsWith("image")) {
    throw new BadRequestError("Invalid file type for selected source");
  }

  if (source === "audio" && !file.type.startsWith("audio")) {
    throw new BadRequestError("Invalid file type for selected source");
  }

  let folder = getFolder(source);

  // Create a buffer from the File object
  const buffer = await file.arrayBuffer();
  const bucket = storage.bucket();

  const path = `assets/${folder}/${file.name}`;
  const storageFile = bucket.file(path);
  await storageFile.save(Buffer.from(buffer), {
    metadata: {
      contentType: file.type
    }
  });

  const url = getFullUrl(path, bucket);
  return NextResponse.json({
    url: url,
    path: path
  }, { status: 200 });
});

