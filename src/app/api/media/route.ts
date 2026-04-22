import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { demoImages, MediaKind } from "@/lib/demo-data";
import { env, hasCloudinaryEnv } from "@/lib/env";
import { getFirebaseDb } from "@/lib/firebase-admin";
import { requireFirebaseUser } from "@/lib/firebase-request";

const collectionName = "media_items";
const AUDIO_URL_PATTERN = /\.(mp3|m4a|wav|ogg|aac|flac)(?:$|[?#])/i;
const AUDIO_FORMATS = new Set(["mp3", "m4a", "wav", "ogg", "aac", "flac"]);

type CloudinaryResource = {
  asset_id?: string;
  public_id?: string;
  format?: string;
  secure_url?: string;
  resource_type?: "image" | "video" | "raw";
  created_at?: string;
};

function toValidResourceType(resourceType: unknown): "image" | "video" | "raw" {
  if (resourceType === "image" || resourceType === "raw") {
    return resourceType;
  }

  return "video";
}

function extractPublicIdFromUrl(mediaUrl: string) {
  const decoded = decodeURIComponent(mediaUrl);
  const versioned = decoded.match(/\/upload\/(?:[^/]+\/)*v\d+\/(.+?)\.[a-zA-Z0-9]+(?:\?|$)/);
  if (versioned?.[1]) {
    return versioned[1];
  }

  const plain = decoded.match(/\/upload\/(?:[^/]+\/)*(.+?)\.[a-zA-Z0-9]+(?:\?|$)/);
  if (plain?.[1]) {
    return plain[1];
  }

  return null;
}

function normalizeMediaType(mediaType: unknown, mediaUrl: unknown): MediaKind {
  const normalizedType = typeof mediaType === "string" ? mediaType.toLowerCase() : "";
  const normalizedUrl = typeof mediaUrl === "string" ? mediaUrl : "";

  if (normalizedType === "audio" || AUDIO_URL_PATTERN.test(normalizedUrl)) {
    return "audio";
  }

  if (normalizedType === "video") {
    return "video";
  }

  return "image";
}

function buildTitleFromPublicId(publicId: string) {
  const base = publicId.split("/").pop() ?? publicId;
  const withoutTimestamp = base.replace(/^\d+-/, "");
  const title = withoutTimestamp.replace(/[-_]+/g, " ").trim();
  return title || "Cancion";
}

async function fetchCloudinaryAudio(limit: number) {
  if (!hasCloudinaryEnv()) {
    return [] as Array<{
      id: string;
      title: string;
      media_url: string;
      media_type: MediaKind;
      cloudinary_public_id: string | null;
      cloudinary_resource_type: "image" | "video" | "raw" | null;
      uploaded_by: string;
      uploaded_by_email: null;
      uploaded_by_name: null;
      uploaded_by_alias: null;
      created_at: string;
    }>;
  }

  cloudinary.config({
    cloud_name: env.cloudinaryCloudName,
    api_key: env.cloudinaryApiKey,
    api_secret: env.cloudinaryApiSecret,
  });

  try {
    const result = await cloudinary.api.resources({
      type: "upload",
      resource_type: "video",
      prefix: `${env.cloudinaryUploadFolder}/`,
      max_results: Math.max(10, Math.min(limit * 3, 100)),
      direction: "desc",
    });

    const resources = Array.isArray(result.resources)
      ? (result.resources as CloudinaryResource[])
      : [];
    return resources
      .filter((resource) => {
        const format = String(resource.format ?? "").toLowerCase();
        const secureUrl = String(resource.secure_url ?? "");
        return AUDIO_FORMATS.has(format) || AUDIO_URL_PATTERN.test(secureUrl);
      })
      .slice(0, limit)
      .map((resource) => ({
        id: String(resource.asset_id ?? resource.public_id),
        title: buildTitleFromPublicId(String(resource.public_id ?? "")),
        media_url: String(resource.secure_url ?? ""),
        media_type: "audio" as MediaKind,
        cloudinary_public_id: String(resource.public_id ?? "") || null,
        cloudinary_resource_type: toValidResourceType(resource.resource_type ?? "video"),
        uploaded_by: "Cloudinary",
        uploaded_by_email: null,
        uploaded_by_name: null,
        uploaded_by_alias: null,
        created_at: String(resource.created_at ?? new Date().toISOString()),
      }));
  } catch {
    return [];
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit") ?? "12");
  const kind = searchParams.get("kind") as MediaKind | null;
  const db = getFirebaseDb();
  const cloudinaryAudio = !kind || kind === "audio" ? await fetchCloudinaryAudio(limit) : [];

  if (!db) {
    const fallback = demoImages.filter((item) => !kind || item.media_type === kind);
    const merged = [...cloudinaryAudio, ...fallback]
      .filter((item) => !kind || item.media_type === kind)
      .slice(0, limit);
    return NextResponse.json({ items: merged, fallback: true });
  }

  let query = db.collection(collectionName).orderBy("createdAt", "desc").limit(limit);
  if (kind && kind !== "audio") {
    query = query.where("mediaType", "==", kind) as typeof query;
  }

  const snapshot = await query.get();
  const itemsFromDb = snapshot.docs
    .map((doc) => {
      const data = doc.data();
      const mediaType = normalizeMediaType(data.mediaType, data.mediaUrl);
      return {
        id: doc.id,
        title: data.title,
        media_url: data.mediaUrl,
        media_type: mediaType,
        cloudinary_public_id: data.cloudinaryPublicId ?? null,
        cloudinary_resource_type: data.cloudinaryResourceType ?? null,
        uploaded_by: data.uploadedBy,
        uploaded_by_email: data.uploadedByEmail ?? null,
        uploaded_by_name: data.uploadedByName ?? null,
        uploaded_by_alias: data.uploadedByAlias ?? null,
        created_at: data.createdAt,
      };
    })
    .filter((item) => !kind || item.media_type === kind);

  const deduped = new Map<string, (typeof itemsFromDb)[number]>();
  [...itemsFromDb, ...cloudinaryAudio].forEach((item) => {
    const key = item.media_url || item.id;
    if (!deduped.has(key)) {
      deduped.set(key, item);
    }
  });

  const items = Array.from(deduped.values())
    .filter((item) => !kind || item.media_type === kind)
    .sort((a, b) => {
      const aTime = Date.parse(a.created_at || "") || 0;
      const bTime = Date.parse(b.created_at || "") || 0;
      return bTime - aTime;
    })
    .slice(0, limit);

  return NextResponse.json({ items, fallback: false });
}

export async function POST(request: NextRequest) {
  const db = getFirebaseDb();

  if (!db) {
    return NextResponse.json(
      { error: "Firebase no esta configurado en el servidor." },
      { status: 503 },
    );
  }

  const user = await requireFirebaseUser(request);
  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const payload = await request.json();
  const mediaType = normalizeMediaType(payload.media_type, payload.media_url);

  const docRef = await db.collection(collectionName).add({
    title: payload.title,
    mediaUrl: payload.media_url,
    mediaType,
    cloudinaryPublicId: payload.cloudinary_public_id ?? extractPublicIdFromUrl(payload.media_url),
    cloudinaryResourceType: toValidResourceType(payload.cloudinary_resource_type),
    uploadedBy: payload.uploaded_by,
    uploadedByEmail: payload.uploaded_by_email ?? null,
    uploadedByName: payload.uploaded_by_name ?? null,
    uploadedByAlias: payload.uploaded_by_alias ?? null,
    ownerUid: user.uid,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({
    item: {
      id: docRef.id,
      title: payload.title,
      media_url: payload.media_url,
      media_type: mediaType,
      cloudinary_public_id: payload.cloudinary_public_id ?? extractPublicIdFromUrl(payload.media_url),
      cloudinary_resource_type: toValidResourceType(payload.cloudinary_resource_type),
      uploaded_by: payload.uploaded_by,
      uploaded_by_email: payload.uploaded_by_email ?? null,
      uploaded_by_name: payload.uploaded_by_name ?? null,
      uploaded_by_alias: payload.uploaded_by_alias ?? null,
      created_at: new Date().toISOString(),
    },
  });
}

export async function PATCH(request: NextRequest) {
  const user = await requireFirebaseUser(request);
  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const db = getFirebaseDb();
  if (!db) {
    return NextResponse.json(
      { error: "Firebase no esta configurado en el servidor." },
      { status: 503 },
    );
  }

  const payload = await request.json();
  const id = String(payload.id ?? "").trim();
  const title = String(payload.title ?? "").trim();
  const mediaUrl = String(payload.media_url ?? "").trim();

  if (!title) {
    return NextResponse.json({ error: "El titulo no puede quedar vacio." }, { status: 400 });
  }

  let targetId = "";

  if (id) {
    const byIdRef = db.collection(collectionName).doc(id);
    const byIdSnapshot = await byIdRef.get();
    if (byIdSnapshot.exists) {
      targetId = id;
    }
  }

  if (!targetId && mediaUrl) {
    const snapshot = await db.collection(collectionName).where("mediaUrl", "==", mediaUrl).limit(1).get();
    if (!snapshot.empty) {
      targetId = snapshot.docs[0].id;
    }
  }

  if (targetId) {
    await db.collection(collectionName).doc(targetId).set(
      {
        title,
        updatedAt: new Date().toISOString(),
        updatedBy: user.uid,
      },
      { merge: true },
    );
  } else if (mediaUrl) {
    const mediaType = normalizeMediaType(payload.media_type, mediaUrl);
    const cloudinaryPublicId = payload.cloudinary_public_id ?? extractPublicIdFromUrl(mediaUrl);
    const docRef = await db.collection(collectionName).add({
      title,
      mediaUrl,
      mediaType,
      cloudinaryPublicId,
      cloudinaryResourceType: toValidResourceType(payload.cloudinary_resource_type),
      uploadedBy: payload.uploaded_by ?? "Visitante",
      ownerUid: user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      updatedBy: user.uid,
    });
    targetId = docRef.id;
  } else {
    return NextResponse.json({ error: "Falta id o media_url." }, { status: 400 });
  }

  return NextResponse.json({
    item: {
      id: targetId,
      title,
    },
  });
}

export async function DELETE(request: NextRequest) {
  const user = await requireFirebaseUser(request);
  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const db = getFirebaseDb();
  if (!db) {
    return NextResponse.json(
      { error: "Firebase no esta configurado en el servidor." },
      { status: 503 },
    );
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id")?.trim() ?? "";
  const mediaUrl = searchParams.get("media_url")?.trim() ?? "";
  const queryPublicId = searchParams.get("cloudinary_public_id")?.trim() ?? "";
  const queryResourceType = searchParams.get("cloudinary_resource_type")?.trim() ?? "";

  if (!id && !mediaUrl && !queryPublicId) {
    return NextResponse.json({ error: "Falta id, media_url o cloudinary_public_id." }, { status: 400 });
  }

  let cloudinaryPublicId = queryPublicId || null;
  let cloudinaryResourceType = queryResourceType || null;

  if (id) {
    const docRef = db.collection(collectionName).doc(id);
    const snapshot = await docRef.get();
    if (snapshot.exists) {
      const data = snapshot.data();
      cloudinaryPublicId = cloudinaryPublicId ?? data?.cloudinaryPublicId ?? extractPublicIdFromUrl(data?.mediaUrl ?? "");
      cloudinaryResourceType = cloudinaryResourceType ?? data?.cloudinaryResourceType ?? null;
      await docRef.delete();
    }
  }

  if (mediaUrl) {
    const snapshot = await db.collection(collectionName).where("mediaUrl", "==", mediaUrl).get();
    if (!snapshot.empty) {
      const first = snapshot.docs[0].data();
      cloudinaryPublicId = cloudinaryPublicId ?? first.cloudinaryPublicId ?? extractPublicIdFromUrl(first.mediaUrl ?? "");
      cloudinaryResourceType = cloudinaryResourceType ?? first.cloudinaryResourceType ?? null;
      await Promise.all(snapshot.docs.map((doc) => doc.ref.delete()));
    }

    cloudinaryPublicId = cloudinaryPublicId ?? extractPublicIdFromUrl(mediaUrl);
  }

  let cloudinaryDeleted = false;
  if (cloudinaryPublicId && hasCloudinaryEnv()) {
    cloudinary.config({
      cloud_name: env.cloudinaryCloudName,
      api_key: env.cloudinaryApiKey,
      api_secret: env.cloudinaryApiSecret,
    });

    const destroyResult = await cloudinary.uploader.destroy(cloudinaryPublicId, {
      resource_type: toValidResourceType(cloudinaryResourceType),
      type: "upload",
      invalidate: true,
    });

    cloudinaryDeleted = destroyResult.result === "ok" || destroyResult.result === "not found";
  }

  return NextResponse.json({ ok: true, cloudinary_deleted: cloudinaryDeleted });
}
