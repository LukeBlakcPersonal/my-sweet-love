import { NextRequest, NextResponse } from "next/server";
import { getPartnerProfileForEmail, getPartnerProfilesServer, hasFirebaseServerEnv } from "@/lib/env";
import { getFirebaseDb } from "@/lib/firebase-admin";
import { requireFirebaseUser } from "@/lib/firebase-request";

const collectionName = "partner_profiles";

function getDefaultProfile(email: string) {
  return getPartnerProfileForEmail(email, getPartnerProfilesServer());
}

export async function GET(request: NextRequest) {
  if (!hasFirebaseServerEnv()) {
    return NextResponse.json(
      { error: "Faltan variables de Firebase Admin: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL y FIREBASE_PRIVATE_KEY." },
      { status: 503 },
    );
  }

  const user = await requireFirebaseUser(request);
  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const db = getFirebaseDb();
  const email = user.email?.toLowerCase() ?? "";
  const fallback = getDefaultProfile(email);

  if (!db) {
    return NextResponse.json({
      profile: fallback,
      fallback: true,
    });
  }

  const snapshot = await db.collection(collectionName).doc(user.uid).get();
  const stored = snapshot.exists ? snapshot.data() : null;

  return NextResponse.json({
    profile: {
      email,
      name: stored?.name ?? fallback?.name ?? "",
      alias: stored?.alias ?? fallback?.alias ?? "",
      updated_at: stored?.updatedAt ?? null,
    },
    fallback: !snapshot.exists,
  });
}

export async function POST(request: NextRequest) {
  if (!hasFirebaseServerEnv()) {
    return NextResponse.json(
      { error: "Faltan variables de Firebase Admin: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL y FIREBASE_PRIVATE_KEY." },
      { status: 503 },
    );
  }

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

  const name = String(payload.name ?? "").trim();
  const alias = String(payload.alias ?? "").trim();

  if (!name || !alias) {
    return NextResponse.json({ error: "Nombre y alias son obligatorios." }, { status: 400 });
  }

  await db.collection(collectionName).doc(user.uid).set(
    {
      uid: user.uid,
      email: user.email?.toLowerCase() ?? "",
      name,
      alias,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    },
    { merge: true },
  );

  return NextResponse.json({
    profile: {
      email: user.email?.toLowerCase() ?? "",
      name,
      alias,
      updated_at: new Date().toISOString(),
    },
  });
}