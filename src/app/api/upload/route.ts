import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import { env, hasCloudinaryEnv } from "@/lib/env";

function detectType(resourceType: string, mimeType: string | null) {
  if (resourceType === "video") {
    if (mimeType?.includes("audio")) {
      return "audio";
    }
    return "video";
  }

  return "image";
}

export async function POST(request: Request) {
  if (!hasCloudinaryEnv()) {
    return NextResponse.json(
      { error: "Cloudinary no esta configurado en el servidor." },
      { status: 503 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const title = String(formData.get("title") ?? "Archivo");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No se envio archivo." }, { status: 400 });
  }

  cloudinary.config({
    cloud_name: env.cloudinaryCloudName,
    api_key: env.cloudinaryApiKey,
    api_secret: env.cloudinaryApiSecret,
  });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadResult = await new Promise<any>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: env.cloudinaryUploadFolder,
        resource_type: "auto",
        public_id: `${Date.now()}-${title.replace(/\s+/g, "-").toLowerCase()}`,
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Error al subir archivo."));
          return;
        }
        resolve(result);
      },
    );

    stream.end(buffer);
  });

  const mediaType = detectType(uploadResult.resource_type, file.type || null);

  return NextResponse.json({
    media_url: uploadResult.secure_url,
    media_type: mediaType,
    title,
  });
}
