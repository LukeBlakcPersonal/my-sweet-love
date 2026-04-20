export const env = {
  firebaseApiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  firebaseAuthDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  firebaseProjectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  firebaseStorageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  firebaseMessagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  firebaseAppId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  firebaseProjectIdAdmin: process.env.FIREBASE_PROJECT_ID,
  firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  firebasePrivateKey: process.env.FIREBASE_PRIVATE_KEY,
  allowedPartnerEmailsPublic: process.env.NEXT_PUBLIC_ALLOWED_PARTNER_EMAILS,
  allowedPartnerEmailsServer: process.env.ALLOWED_PARTNER_EMAILS,
  partnerProfilesPublic: process.env.NEXT_PUBLIC_PARTNER_PROFILES,
  partnerProfilesServer: process.env.PARTNER_PROFILES,
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
  cloudinaryUploadFolder: process.env.CLOUDINARY_UPLOAD_FOLDER ?? "estrellita-lunita",
};

function parseAllowedEmails(raw?: string) {
  if (!raw) {
    return [] as string[];
  }

  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export type PartnerProfile = {
  email: string;
  name: string;
  alias: string;
};

function parsePartnerProfiles(raw?: string) {
  if (!raw) {
    return [] as PartnerProfile[];
  }

  return raw
    .split(";")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [email, name, alias] = entry.split("|").map((value) => value.trim());
      return {
        email: email?.toLowerCase() ?? "",
        name: name ?? "",
        alias: alias ?? "",
      };
    })
    .filter((profile) => profile.email && profile.name && profile.alias);
}

export function getAllowedPartnerEmailsPublic() {
  return parseAllowedEmails(env.allowedPartnerEmailsPublic);
}

export function getAllowedPartnerEmailsServer() {
  return parseAllowedEmails(env.allowedPartnerEmailsServer);
}

export function getPartnerProfilesPublic() {
  return parsePartnerProfiles(env.partnerProfilesPublic);
}

export function getPartnerProfilesServer() {
  return parsePartnerProfiles(env.partnerProfilesServer);
}

export function getPartnerProfileForEmail(email: string, profiles: PartnerProfile[]) {
  const normalizedEmail = email.trim().toLowerCase();
  const found = profiles.find((profile) => profile.email === normalizedEmail);

  if (found) {
    return found;
  }

  if (!normalizedEmail) {
    return null;
  }

  const localPart = normalizedEmail.split("@")[0] || normalizedEmail;
  const fallbackName = localPart
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ") || localPart;

  return {
    email: normalizedEmail,
    name: fallbackName,
    alias: localPart,
  };
}

export function hasFirebaseBrowserEnv() {
  return Boolean(
    env.firebaseApiKey &&
      env.firebaseAuthDomain &&
      env.firebaseProjectId &&
      env.firebaseAppId,
  );
}

export function hasFirebaseServerEnv() {
  return Boolean(
    env.firebaseProjectIdAdmin && env.firebaseClientEmail && env.firebasePrivateKey,
  );
}

export function hasCloudinaryEnv() {
  return Boolean(
    env.cloudinaryCloudName && env.cloudinaryApiKey && env.cloudinaryApiSecret,
  );
}
