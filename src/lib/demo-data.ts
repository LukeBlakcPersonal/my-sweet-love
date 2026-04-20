export type MediaKind = "image" | "video" | "audio";

export type MediaItem = {
  id: string;
  title: string;
  media_url: string;
  media_type: MediaKind;
  uploaded_by: string;
  uploaded_by_email?: string | null;
  uploaded_by_name?: string | null;
  uploaded_by_alias?: string | null;
  created_at: string;
};

export type LoveMessage = {
  id: string;
  author: string;
  author_email?: string | null;
  author_name?: string | null;
  author_alias?: string | null;
  content: string;
  date_label: string;
  photo_url: string | null;
  created_at: string;
};

export type PortfolioItem = {
  id: string;
  title: string;
  description: string;
  media_url: string;
  media_type: MediaKind;
  evaluation_score: number | null;
  evaluation_note: string | null;
  created_at: string;
};

export const demoImages: MediaItem[] = Array.from({ length: 12 }).map((_, index) => ({
  id: `demo-image-${index + 1}`,
  title: `Recuerdo ${index + 1}`,
  media_url: `https://picsum.photos/seed/love-${index + 1}/900/700`,
  media_type: "image",
  uploaded_by: index % 2 === 0 ? "Lunita" : "Estrellita",
  created_at: new Date(Date.now() - index * 3600_000).toISOString(),
}));

export const demoMessages: LoveMessage[] = [
  {
    id: "msg-1",
    author: "Lunita",
    content: "19 de abril: primer plan para nuestro rincón creativo y amoroso.",
    date_label: "19/04/2026",
    photo_url: null,
    created_at: new Date().toISOString(),
  },
  {
    id: "msg-2",
    author: "Estrellita",
    content: "Hoy capturé una idea para un reportaje y quería guardarla contigo.",
    date_label: "20/04/2026",
    photo_url: null,
    created_at: new Date().toISOString(),
  },
];

export const demoPortfolio: PortfolioItem[] = [
  {
    id: "pf-1",
    title: "Practica de retrato urbano",
    description: "Serie para estudiar composicion y narrativa visual.",
    media_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=900&q=80",
    media_type: "image",
    evaluation_score: 8,
    evaluation_note: "Buena lectura de luz natural.",
    created_at: new Date().toISOString(),
  },
];
