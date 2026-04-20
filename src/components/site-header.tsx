"use client";

import Link from "next/link";

type SiteHeaderProps = {
  activeUser: string;
  viewerLabel: string;
};

export function SiteHeader({ activeUser, viewerLabel }: SiteHeaderProps) {
  const isPartner = Boolean(activeUser);

  return (
    <header className="sticky top-0 z-50 border-b border-[rgba(111,75,88,0.12)] bg-[rgba(255,249,247,0.88)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(211,164,178,0.4),rgba(163,140,255,0.25))] text-sm font-bold text-[#5d4451]">
              SL
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-[#8a6676]">Estrellita y Lunita</p>
              <p className="text-sm text-[#6b4f5d]">Un álbum vivo para guardar lo de ustedes.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="signal-chip">Vista: {viewerLabel}</span>
            <span className="signal-chip">{activeUser || "Sin sesion"}</span>
          </div>
        </div>

        <nav className="flex flex-wrap gap-2 text-sm">
          <Link className="nav-link" href="/">Inicio</Link>
          <Link className="nav-link" href="/musica">Música</Link>
          <Link className="nav-link" href="/portafolio">Portafolio</Link>
          <Link className="nav-link" href="/acceso">Acceso</Link>
          {isPartner ? (
            <>
              <Link className="nav-link" href="/perfil">Perfil</Link>
              <Link className="nav-link" href="/collage">Collage</Link>
              <Link className="nav-link" href="/mensajes">Mensajes</Link>
              <Link className="nav-link" href="/subir">Subir</Link>
            </>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
