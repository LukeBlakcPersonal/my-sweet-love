import { NextRequest, NextResponse } from "next/server";
import { demoPortfolio } from "@/lib/demo-data";
import { getFirebaseDb } from "@/lib/firebase-admin";
import { requireFirebaseUser } from "@/lib/firebase-request";

const collectionName = "portfolio_items";

export async function GET() {
  const db = getFirebaseDb();

  if (!db) {
    return NextResponse.json({ items: demoPortfolio, fallback: true });
  }

  const snapshot = await db.collection(collectionName).orderBy("createdAt", "desc").limit(80).get();
  const items = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title,
      description: data.description,
      media_url: data.mediaUrl,
      media_type: data.mediaType,
      evaluation_score: data.evaluationScore ?? null,
      evaluation_note: data.evaluationNote ?? null,
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
      description: payload.description,
      mediaUrl: payload.media_url,
      mediaType: payload.media_type,
      evaluationScore: payload.evaluation_score,
      evaluationNote: payload.evaluation_note,
      createdByEmail: payload.created_by_email ?? null,
      createdByName: payload.created_by_name ?? null,
      createdByAlias: payload.created_by_alias ?? null,
      ownerUid: user.uid,
      createdAt: new Date().toISOString(),
    });

  return NextResponse.json({
    item: {
      id: docRef.id,
      title: payload.title,
      description: payload.description,
      media_url: payload.media_url,
      media_type: payload.media_type,
      evaluation_score: payload.evaluation_score,
      evaluation_note: payload.evaluation_note,
      created_by_email: payload.created_by_email ?? null,
      created_by_name: payload.created_by_name ?? null,
      created_by_alias: payload.created_by_alias ?? null,
      created_at: new Date().toISOString(),
    },
  });
}

export async function PATCH(request: NextRequest) {
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

  await db.collection(collectionName).doc(payload.id).update({
      title: payload.title,
      description: payload.description,
      mediaUrl: payload.media_url,
      mediaType: payload.media_type,
      evaluationScore: payload.evaluation_score,
      evaluationNote: payload.evaluation_note,
      createdByEmail: payload.created_by_email ?? null,
      createdByName: payload.created_by_name ?? null,
      createdByAlias: payload.created_by_alias ?? null,
      updatedAt: new Date().toISOString(),
      updatedBy: user.uid,
    });

  return NextResponse.json({
    item: {
      id: payload.id,
      title: payload.title,
      description: payload.description,
      media_url: payload.media_url,
      media_type: payload.media_type,
      evaluation_score: payload.evaluation_score,
      evaluation_note: payload.evaluation_note,
      created_by_email: payload.created_by_email ?? null,
      created_by_name: payload.created_by_name ?? null,
      created_by_alias: payload.created_by_alias ?? null,
      created_at: new Date().toISOString(),
    },
  });
}

export async function DELETE(request: NextRequest) {
  const user = await requireFirebaseUser(request);
  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const db = getFirebaseDb();

  if (!id) {
    return NextResponse.json({ error: "Falta id." }, { status: 400 });
  }

  if (!db) {
    return NextResponse.json(
      { error: "Firebase no esta configurado en el servidor." },
      { status: 503 },
    );
  }

  await db.collection(collectionName).doc(id).delete();

  return NextResponse.json({ ok: true });
}
