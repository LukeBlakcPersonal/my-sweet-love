"use client";

import { SiteFrame } from "@/components/site-frame";
import { useLoveSite } from "@/components/useLoveSite";

export default function MusicaPage() {
  const site = useLoveSite();

  return (
    <SiteFrame site={site}>
      <section className="glass rounded-3xl p-6 sm:p-8">
        <p className="signal-chip">Música</p>
        <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Canciones que los acompañan</h1>
        <p className="mt-3 max-w-3xl text-sm text-[#5f4656]/88 sm:text-base">
          Esta ruta reúne los MP3 subidos. Se puede escuchar sin anuncios y sin salir de la página.
        </p>

        <div className="mt-6 space-y-3">
          {site.audioTracks.length === 0 ? (
            <p className="rounded-xl border border-[rgba(111,75,88,0.12)] bg-white/70 p-3 text-sm text-[#6b4f5d]/80">
              Aun no hay canciones. Sube archivos MP3 desde la ruta de subida.
            </p>
          ) : (
            site.audioTracks.map((track) => (
              <article key={track.id} className="rounded-xl border border-[rgba(111,75,88,0.12)] bg-white/74 p-3">
                <p className="mb-2 text-sm font-semibold text-[#6d4f5c]">{track.title}</p>
                <audio controls className="w-full" src={track.media_url} preload="none" />
              </article>
            ))
          )}
        </div>
      </section>
    </SiteFrame>
  );
}
