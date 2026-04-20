import { NextRequest, NextResponse } from "next/server";
import { demoMessages } from "@/lib/demo-data";
import { getFirebaseDb } from "@/lib/firebase-admin";
import { requireFirebaseUser } from "@/lib/firebase-request";

const collectionName = "love_messages";

export async function GET() {
  const db = getFirebaseDb();

  if (!db) {
    return NextResponse.json({ items: demoMessages, fallback: true });
  }

  const snapshot = await db.collection(collectionName).orderBy("createdAt", "desc").limit(40).get();
  const items = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      author: data.author,
      author_email: data.authorEmail ?? null,
      author_name: data.authorName ?? null,
      author_alias: data.authorAlias ?? null,
      content: data.content,
      date_label: data.dateLabel,
      photo_url: data.photoUrl ?? null,
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
      author: payload.author,
      authorEmail: payload.author_email ?? null,
      authorName: payload.author_name ?? null,
      authorAlias: payload.author_alias ?? null,
      content: payload.content,
      dateLabel: payload.date_label || new Date().toLocaleDateString("es-PE"),
      photoUrl: payload.photo_url,
      ownerUid: user.uid,
      createdAt: new Date().toISOString(),
    });

  return NextResponse.json({
    item: {
      id: docRef.id,
      author: payload.author,
      author_email: payload.author_email ?? null,
      author_name: payload.author_name ?? null,
      author_alias: payload.author_alias ?? null,
      content: payload.content,
      date_label: payload.date_label || new Date().toLocaleDateString("es-PE"),
      photo_url: payload.photo_url,
      created_at: new Date().toISOString(),
    },
  });
}
