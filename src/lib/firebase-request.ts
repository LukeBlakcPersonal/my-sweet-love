import { NextRequest } from "next/server";
import { getAllowedPartnerEmailsServer } from "./env";
import { getFirebaseAdminAuth } from "./firebase-admin";

export async function requireFirebaseUser(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const idToken = authHeader.slice("Bearer ".length).trim();
  if (!idToken) {
    return null;
  }

  const auth = getFirebaseAdminAuth();
  if (!auth) {
    return null;
  }

  try {
    const decoded = await auth.verifyIdToken(idToken);
    const allowedEmails = getAllowedPartnerEmailsServer();
    const userEmail = decoded.email?.toLowerCase() ?? "";

    if (allowedEmails.length > 0 && !allowedEmails.includes(userEmail)) {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}
