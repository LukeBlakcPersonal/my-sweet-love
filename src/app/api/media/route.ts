import { NextRequest, NextResponse } from "next/server";
import { demoImages, MediaKind } from "@/lib/demo-data";
import { getFirebaseDb } from "@/lib/firebase-admin";
import { requireFirebaseUser } from "@/lib/firebase-request";

const collectionName = "media_items";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit") ?? "12");
  const kind = searchParams.get("kind") as MediaKind | null;
  const db = getFirebaseDb();

  if (!db) {
    const fallback = demoImages.filter((item) => !kind || item.media_type === kind);
    return NextResponse.json({ items: fallback.slice(0, limit), fallback: true });
  }

  let query = db.collection(collectionName).orderBy("createdAt", "desc").limit(limit);
  if (kind) {
    query = query.where("mediaType", "==", kind) as typeof query;
  }

  const snapshot = await query.get();
  const items = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title,
      media_url: data.mediaUrl,
      media_type: data.mediaType,
      uploaded_by: data.uploadedBy,
      uploaded_by_email: data.uploadedByEmail ?? null,
      uploaded_by_name: data.uploadedByName ?? null,
      uploaded_by_alias: data.uploadedByAlias ?? null,
      created_at: data.createdAt,
    };
  });

  return NextResponse.json({ items, fallback: false });
}

export async function POST(request: NextRequest) {
  const user = await requireFirebaseUser(request);
  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const payload = await request.json();
  const db = getFirebaseDb();

  if (!db) {
    return NextResponse.json(
      { error: "Firebase no esta configurado en el servidor." },
      { status: 503 },
    );
  }

  const docRef = await db.collection(collectionName).add({
      title: payload.title,
      mediaUrl: payload.media_url,
      mediaType: payload.media_type,
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
      media_type: payload.media_type,
      uploaded_by: payload.uploaded_by,
      uploaded_by_email: payload.uploaded_by_email ?? null,
      uploaded_by_name: payload.uploaded_by_name ?? null,
      uploaded_by_alias: payload.uploaded_by_alias ?? null,
      created_at: new Date().toISOString(),
    },
  });
}
