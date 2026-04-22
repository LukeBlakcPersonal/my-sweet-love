"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LoveMessage,
  MediaItem,
  PortfolioItem,
  demoMessages,
  demoPortfolio,
} from "@/lib/demo-data";
import {
  getAllowedPartnerEmailsPublic,
  getPartnerProfileForEmail,
  getPartnerProfilesPublic,
  hasFirebaseBrowserEnv,
} from "@/lib/env";
import { getFirebaseAuth, getFirebaseClientDb } from "@/lib/firebase-client";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

type UploadFormState = {
  title: string;
  owner: string;
};

type PortfolioProfile = {
  instagram: string;
  behance: string;
  contactEmail: string;
  contactPhone: string;
};

type IdentityProfile = {
  name: string;
  alias: string;
};

const FALLBACK_PROFILE: PortfolioProfile = {
  instagram: "",
  behance: "",
  contactEmail: "",
  contactPhone: "",
};

function getFallbackIdentity(email: string) {
  return getPartnerProfileForEmail(email, getPartnerProfilesPublic());
}

function getTodayInputDate() {
  return new Date().toISOString().slice(0, 10);
}

export function useLoveSite() {
  const router = useRouter();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [messages, setMessages] = useState<LoveMessage[]>(demoMessages);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(demoPortfolio);
  const [status, setStatus] = useState<string>("Cargando datos...");
  const [authStatus, setAuthStatus] = useState<string>("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [activeUser, setActiveUser] = useState<string>("");
  const [authToken, setAuthToken] = useState<string>("");
  const [uploadState, setUploadState] = useState<UploadFormState>({
    title: "",
    owner: "Lunita",
  });
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [messageFile, setMessageFile] = useState<File | null>(null);
  const [messageAuthor, setMessageAuthor] = useState("Lunita");
  const [messageDate, setMessageDate] = useState(getTodayInputDate());
  const [messageText, setMessageText] = useState("");
  const [portfolioTitle, setPortfolioTitle] = useState("");
  const [portfolioDescription, setPortfolioDescription] = useState("");
  const [portfolioScore, setPortfolioScore] = useState("");
  const [portfolioNote, setPortfolioNote] = useState("");
  const [portfolioFile, setPortfolioFile] = useState<File | null>(null);
  const [portfolioProfile, setPortfolioProfile] =
    useState<PortfolioProfile>(FALLBACK_PROFILE);
  const [identityProfile, setIdentityProfile] = useState<IdentityProfile>({
    name: "",
    alias: "",
  });
  const [isLoadingIdentity, setIsLoadingIdentity] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const firebaseEnabled = hasFirebaseBrowserEnv();
  const allowedPartnerEmails = useMemo(() => getAllowedPartnerEmailsPublic(), []);
  const partnerProfiles = useMemo(() => getPartnerProfilesPublic(), []);
  const isPartnerView = Boolean(activeUser);
  const defaultIdentity = useMemo(() => {
    if (!activeUser) {
      return null;
    }

    return getPartnerProfileForEmail(activeUser, partnerProfiles);
  }, [activeUser, partnerProfiles]);
  const effectiveIdentity = useMemo(() => {
    if (!activeUser || isLoadingIdentity) {
      return null;
    }

    const fallback = defaultIdentity ?? getFallbackIdentity(activeUser);
    return {
      email: activeUser,
      name: identityProfile.name.trim() || fallback?.name || "",
      alias: identityProfile.alias.trim() || fallback?.alias || "",
    };
  }, [activeUser, defaultIdentity, identityProfile.alias, identityProfile.name, isLoadingIdentity]);
  const viewerLabel = effectiveIdentity ? `${effectiveIdentity.name} · ${effectiveIdentity.alias}` : "Visitante";

  const imageCollage = useMemo(
    () => media.filter((item) => item.media_type === "image").slice(0, 12),
    [media],
  );
  const audioTracks = useMemo(
    () => media.filter((item) => item.media_type === "audio"),
    [media],
  );

  useEffect(() => {
    const saved = localStorage.getItem("portfolio-profile");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as PortfolioProfile;
        setPortfolioProfile(parsed);
      } catch {
        setPortfolioProfile(FALLBACK_PROFILE);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("portfolio-profile", JSON.stringify(portfolioProfile));
  }, [portfolioProfile]);

  useEffect(() => {
    void loadAll();
  }, []);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      return;
    }

    return onAuthStateChanged(auth, async (user) => {
      setIsLoadingIdentity(true);
      
      const userEmail = user?.email?.toLowerCase() ?? "";
      if (user && allowedPartnerEmails.length > 0 && !allowedPartnerEmails.includes(userEmail)) {
        await signOut(auth);
        setActiveUser("");
        setAuthToken("");
        setAuthStatus("Ese correo no esta habilitado para esta pagina.");
        setIsLoadingIdentity(false);
        return;
      }

      const nextEmail = user?.email ?? "";
      const nextToken = user ? await user.getIdToken() : "";
      setActiveUser(nextEmail);
      setAuthToken(nextToken);

      if (!user) {
        setIdentityProfile({ name: "", alias: "" });
        setIsLoadingIdentity(false);
        return;
      }

      // Try to load from Firebase first (no fallback shown initially)
      let loaded = false;
      try {
        const db = getFirebaseClientDb();
        if (db) {
          const profileRef = doc(db, "partner_profiles", user.uid);
          const profileSnapshot = await getDoc(profileRef);
          if (profileSnapshot.exists()) {
            const data = profileSnapshot.data();
            setIdentityProfile({
              name: data.name ?? "",
              alias: data.alias ?? "",
            });
            loaded = true;
          }
        }
      } catch {
        // Error, will use fallback
      }

      // Only use fallback if Firebase load failed or document doesn't exist
      if (!loaded) {
        const fallback = getFallbackIdentity(nextEmail) ?? { name: "", alias: "" };
        setIdentityProfile({
          name: fallback.name,
          alias: fallback.alias,
        });
      }
      
      setIsLoadingIdentity(false);
    });
  }, [allowedPartnerEmails]);

  useEffect(() => {
    if (!effectiveIdentity) {
      return;
    }

    setMessageAuthor(effectiveIdentity.alias);
    setUploadState((prev) => ({
      ...prev,
      owner: effectiveIdentity.name,
    }));
    if (!messageDate) {
      setMessageDate(getTodayInputDate());
    }
  }, [effectiveIdentity, messageDate]);

  function getApiHeaders() {
    const headers: Record<string, string> = {};
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    return headers;
  }

  async function loadAll() {
    setStatus("Cargando sus recuerdos y mensajes...");
    try {
      const [mediaRes, msgRes, portfolioRes] = await Promise.all([
        fetch("/api/media?limit=60"),
        fetch("/api/messages"),
        fetch("/api/portfolio"),
      ]);

      const mediaJson = await mediaRes.json();
      const msgJson = await msgRes.json();
      const portfolioJson = await portfolioRes.json();

      if (Array.isArray(mediaJson.items)) {
        setMedia(mediaJson.items);
      }
      if (Array.isArray(msgJson.items)) {
        setMessages(msgJson.items);
      }
      if (Array.isArray(portfolioJson.items)) {
        setPortfolio(portfolioJson.items);
      }
      setStatus(
        mediaJson.fallback || msgJson.fallback || portfolioJson.fallback
          ? "Modo demo activo: agrega tus claves para guardar todo en Firebase."
          : "Todo listo para guardar recuerdos juntos.",
      );
    } catch {
      setStatus("No se pudieron cargar los recuerdos por ahora.");
    }
  }

  async function uploadToCloudinary(file: File, title: string) {
    const fd = new FormData();
    fd.set("file", file);
    fd.set("title", title);

    const response = await fetch("/api/upload", {
      method: "POST",
      headers: getApiHeaders(),
      body: fd,
    });
    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.error ?? "No se pudo subir el archivo.");
    }

    return json as {
      media_url: string;
      media_type: "image" | "video" | "audio";
      cloudinary_public_id?: string | null;
      cloudinary_resource_type?: "image" | "video" | "raw" | null;
    };
  }

  async function persistMedia(item: {
    title: string;
    media_url: string;
    media_type: "image" | "video" | "audio";
    cloudinary_public_id?: string | null;
    cloudinary_resource_type?: "image" | "video" | "raw" | null;
    uploaded_by: string;
    uploaded_by_email?: string | null;
    uploaded_by_name?: string | null;
    uploaded_by_alias?: string | null;
  }) {
    const response = await fetch("/api/media", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getApiHeaders() },
      body: JSON.stringify(item),
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.error ?? "No se pudo registrar el archivo.");
    }

    return json.item as MediaItem;
  }

  async function renameMediaItem(item: MediaItem, nextTitle: string) {
    if (!activeUser) {
      setStatus("Inicia sesion para editar canciones.");
      return false;
    }

    const title = nextTitle.trim();
    if (!title) {
      setStatus("El titulo no puede quedar vacio.");
      return false;
    }

    setIsBusy(true);
    try {
      const response = await fetch("/api/media", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getApiHeaders() },
        body: JSON.stringify({
          id: item.id,
          title,
          media_url: item.media_url,
          media_type: item.media_type,
          cloudinary_public_id: item.cloudinary_public_id ?? null,
          cloudinary_resource_type: item.cloudinary_resource_type ?? null,
          uploaded_by: item.uploaded_by,
        }),
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error ?? "No se pudo renombrar la cancion.");
      }

      setMedia((prev) => prev.map((track) => (track.id === item.id ? { ...track, title } : track)));
      setStatus("Nombre de la cancion actualizado.");
      return true;
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo renombrar la cancion.");
      return false;
    } finally {
      setIsBusy(false);
    }
  }

  async function deleteMediaItem(item: MediaItem) {
    if (!activeUser) {
      setStatus("Inicia sesion para eliminar canciones.");
      return false;
    }

    setIsBusy(true);
    try {
      const params = new URLSearchParams();
      if (item.id) {
        params.set("id", item.id);
      }
      if (item.media_url) {
        params.set("media_url", item.media_url);
      }
      if (item.cloudinary_public_id) {
        params.set("cloudinary_public_id", item.cloudinary_public_id);
      }
      if (item.cloudinary_resource_type) {
        params.set("cloudinary_resource_type", item.cloudinary_resource_type);
      }

      const response = await fetch(`/api/media?${params.toString()}`, {
        method: "DELETE",
        headers: getApiHeaders(),
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error ?? "No se pudo eliminar la cancion.");
      }

      setMedia((prev) => prev.filter((track) => track.id !== item.id && track.media_url !== item.media_url));
      setStatus("Cancion eliminada de Firebase y Cloudinary.");
      return true;
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo eliminar la cancion.");
      return false;
    } finally {
      setIsBusy(false);
    }
  }

  async function handleAuth(mode: "signin") {
    if (!firebaseEnabled) {
      setAuthStatus("Faltan variables de Firebase en .env.local.");
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (allowedPartnerEmails.length > 0 && !allowedPartnerEmails.includes(normalizedEmail)) {
      setAuthStatus("Ese correo no esta en la lista de las 3 cuentas permitidas.");
      return;
    }

    const auth = getFirebaseAuth();
    if (!auth) {
      return;
    }

    setAuthStatus("Procesando login...");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setAuthStatus(error instanceof Error ? error.message : "No se pudo autenticar.");
      return;
    }

    setAuthStatus("Sesion iniciada.");
  }

  async function handleSignOut() {
    const auth = getFirebaseAuth();
    if (!auth) {
      return;
    }
    await signOut(auth);
    setAuthStatus("Sesion cerrada.");
  }

  async function handleMainUpload(event: FormEvent) {
    event.preventDefault();
    if (!uploadFile) {
      setStatus("Selecciona un archivo para subir.");
      return;
    }

    if (!activeUser) {
      setStatus("Inicia sesion para subir archivos.");
      return;
    }

    setIsBusy(true);
    try {
      const currentUserEmail = effectiveIdentity?.email ?? activeUser ?? null;
      const uploaded = await uploadToCloudinary(uploadFile, uploadState.title || uploadFile.name);
      const created = await persistMedia({
        title: uploadState.title || uploadFile.name,
        media_url: uploaded.media_url,
        media_type: uploaded.media_type,
        cloudinary_public_id: uploaded.cloudinary_public_id ?? null,
        cloudinary_resource_type: uploaded.cloudinary_resource_type ?? null,
        uploaded_by: uploadState.owner,
        uploaded_by_email: currentUserEmail,
        uploaded_by_name: effectiveIdentity?.name ?? uploadState.owner,
        uploaded_by_alias: effectiveIdentity?.alias ?? uploadState.owner,
      });
      setMedia((prev) => [created, ...prev]);
      setUploadFile(null);
      setUploadState({ title: "", owner: uploadState.owner });
      setStatus("Archivo cargado y agregado al collage/biblioteca.");
      
      if (created.media_type === "audio") {
        setTimeout(() => router.push("/musica"), 800);
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Error en subida.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleMessageSubmit(event: FormEvent) {
    event.preventDefault();

    if (!messageText.trim()) {
      setStatus("Escribe un mensajito antes de enviar.");
      return;
    }

    if (!activeUser) {
      setStatus("Inicia sesion para compartir mensajes.");
      return;
    }

    setIsBusy(true);
    try {
      const currentUserEmail = effectiveIdentity?.email ?? activeUser ?? null;
      const today = getTodayInputDate();
      const resolvedDate = messageDate || today;
      let photoUrl: string | null = null;

      if (messageFile) {
        const uploaded = await uploadToCloudinary(messageFile, `mensaje-${messageAuthor}`);
        const createdMedia = await persistMedia({
          title: `Foto adjunta de ${messageAuthor}`,
          media_url: uploaded.media_url,
          media_type: uploaded.media_type,
          cloudinary_public_id: uploaded.cloudinary_public_id ?? null,
          cloudinary_resource_type: uploaded.cloudinary_resource_type ?? null,
          uploaded_by: messageAuthor,
          uploaded_by_email: currentUserEmail,
          uploaded_by_name: effectiveIdentity?.name ?? messageAuthor,
          uploaded_by_alias: effectiveIdentity?.alias ?? messageAuthor,
        });
        setMedia((prev) => [createdMedia, ...prev]);
        photoUrl = uploaded.media_url;
      }

      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getApiHeaders() },
        body: JSON.stringify({
          author: messageAuthor,
          author_name: effectiveIdentity?.name ?? messageAuthor,
          author_alias: effectiveIdentity?.alias ?? messageAuthor,
          author_email: currentUserEmail,
          content: messageText,
          date_label: resolvedDate,
          photo_url: photoUrl,
        }),
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error ?? "No se pudo guardar el mensajito.");
      }

      setMessages((prev) => [json.item as LoveMessage, ...prev]);
      setMessageText("");
      setMessageDate(getTodayInputDate());
      setMessageFile(null);
      setStatus("Mensajito publicado.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Error al guardar mensaje.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handlePortfolioCreate(event: FormEvent) {
    event.preventDefault();

    if (!activeUser) {
      setStatus("Inicia sesion para crear piezas del portafolio.");
      return;
    }

    if (!portfolioFile) {
      setStatus("El portafolio necesita un archivo (imagen, video o audio).");
      return;
    }

    setIsBusy(true);
    try {
      const currentUserEmail = effectiveIdentity?.email ?? activeUser ?? null;
      const uploaded = await uploadToCloudinary(
        portfolioFile,
        portfolioTitle || portfolioFile.name,
      );

      const response = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getApiHeaders() },
        body: JSON.stringify({
          title: portfolioTitle || portfolioFile.name,
          description: portfolioDescription,
          media_url: uploaded.media_url,
          media_type: uploaded.media_type,
          evaluation_score: portfolioScore ? Number(portfolioScore) : null,
          evaluation_note: portfolioNote || null,
          created_by_email: currentUserEmail,
          created_by_name: effectiveIdentity?.name ?? uploadState.owner,
          created_by_alias: effectiveIdentity?.alias ?? uploadState.owner,
        }),
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error ?? "No se pudo guardar pieza de portafolio.");
      }

      setPortfolio((prev) => [json.item as PortfolioItem, ...prev]);
      setPortfolioTitle("");
      setPortfolioDescription("");
      setPortfolioFile(null);
      setPortfolioScore("");
      setPortfolioNote("");
      setStatus("Nueva pieza agregada al portafolio.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Error en portafolio.");
    } finally {
      setIsBusy(false);
    }
  }

  async function removePortfolioItem(id: string) {
    if (!activeUser) {
      setStatus("Inicia sesion para eliminar piezas.");
      return;
    }

    setIsBusy(true);
    try {
      const response = await fetch(`/api/portfolio?id=${id}`, {
        method: "DELETE",
        headers: getApiHeaders(),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error ?? "No se pudo eliminar la pieza.");
      }
      setPortfolio((prev) => prev.filter((item) => item.id !== id));
      setStatus("Pieza eliminada del portafolio.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Error al eliminar pieza.");
    } finally {
      setIsBusy(false);
    }
  }

  function updateProfileField(field: keyof PortfolioProfile, value: string) {
    setPortfolioProfile((prev) => ({ ...prev, [field]: value }));
  }

  function updateIdentityField(field: keyof IdentityProfile, value: string) {
    setIdentityProfile((prev) => ({ ...prev, [field]: value }));
  }

  async function saveIdentityProfile() {
    if (!activeUser) {
      setStatus("Inicia sesion para guardar tu nombre y alias.");
      return;
    }

    if (!identityProfile.name.trim() || !identityProfile.alias.trim()) {
      setStatus("El nombre y el alias no pueden quedar vacios.");
      return;
    }

    setIsSavingProfile(true);
    try {
      const auth = getFirebaseAuth();
      const db = getFirebaseClientDb();

      if (!auth || !auth.currentUser || !db) {
        setStatus("Faltan credenciales de Firebase para guardar el perfil.");
        return;
      }

      const profileRef = doc(db, "partner_profiles", auth.currentUser.uid);
      await setDoc(
        profileRef,
        {
          uid: auth.currentUser.uid,
          email: auth.currentUser.email?.toLowerCase() ?? "",
          name: identityProfile.name.trim(),
          alias: identityProfile.alias.trim(),
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
        { merge: true },
      );

      setStatus("Perfil guardado en Firebase.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo guardar el perfil.");
    } finally {
      setIsSavingProfile(false);
    }
  }

  return {
    audioTracks,
    activeUser,
    authStatus,
    authToken,
    email,
    handleAuth,
    handleMainUpload,
    handleMessageSubmit,
    handlePortfolioCreate,
    handleSignOut,
    imageCollage,
    isBusy,
    isSavingProfile,
    isPartnerView,
    loadAll,
    messageAuthor,
    messageDate,
    messageFile,
    messageText,
    messages,
    password,
    portfolio,
    portfolioDescription,
    portfolioFile,
    portfolioNote,
    portfolioProfile,
    portfolioScore,
    portfolioTitle,
    identityProfile,
    setEmail,
    setMessageAuthor,
    setMessageDate,
    setMessageFile,
    setMessageText,
    setPassword,
    setPortfolioDescription,
    setPortfolioFile,
    setPortfolioNote,
    setPortfolioScore,
    setPortfolioTitle,
    setUploadFile,
    setUploadState,
    status,
    uploadFile,
    uploadState,
    viewerLabel,
    updateProfileField,
    updateIdentityField,
    saveIdentityProfile,
    removePortfolioItem,
    renameMediaItem,
    deleteMediaItem,
    allowedPartnerEmails,
  };
}
