"use client";

import Link from "next/link";
import { SiteFrame } from "@/components/site-frame";
import { useLoveSite } from "@/components/useLoveSite";

export default function Home() {
  const site = useLoveSite();

  return (
    <SiteFrame site={site}>
      <section id="inicio" className="glass relative overflow-hidden rounded-3xl p-6 sm:p-8">
        <div className="absolute -right-10 -top-16 h-44 w-44 rounded-full bg-[radial-gradient(circle,var(--green),transparent_64%)] opacity-34" />
        <div className="absolute -bottom-14 -left-10 h-44 w-44 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--green)_78%,var(--mustard-strong)),transparent_64%)] opacity-30" />
        <p className="signal-chip">[ICONO_ABEJA: colocar en public/resources/icon-bee.svg]</p>
        <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Estrellita + Lunita</h1>
        <p className="mt-3 max-w-3xl text-sm text-[#5f4656]/88 sm:text-base">
          Un álbum vivo para guardar fotos, notas, canciones y piezas bonitas. La navegación está separada por rutas para que cada parte tenga su propio espacio.
        </p>
        <div className="mt-5 flex flex-wrap gap-3 text-xs">
          <span className="signal-chip">Paleta suave para ambos</span>
          <span className="signal-chip">{site.status}</span>
          <span className="signal-chip">Vista: {site.viewerLabel}</span>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.45fr_0.95fr]">
          <article className="rounded-2xl border border-[rgba(111,75,88,0.12)] bg-white/72 p-4">
            <p className="text-xs uppercase tracking-[0.28em] text-[#8a6676]">Cómo se siente</p>
            <h2 className="mt-2 text-2xl font-semibold text-[#5b3c48]">Romántica, delicada y elegante</h2>
            <p className="mt-2 text-sm text-[#6b4f5d]">
              Cada ruta tiene un propósito claro: perfil, collage, música, portafolio, acceso, mensajes y subida.
            </p>
          </article>

          <article className="rounded-2xl border border-[rgba(111,75,88,0.12)] bg-white/72 p-4">
            <p className="text-xs uppercase tracking-[0.28em] text-[#8a6676]">Entradas rápidas</p>
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              <Link className="btn-core btn-neutral" href="/perfil">Perfil</Link>
              <Link className="btn-core btn-neutral" href="/collage">Collage</Link>
              <Link className="btn-core btn-neutral" href="/musica">Música</Link>
              <Link className="btn-core btn-neutral" href="/portafolio">Portafolio</Link>
            </div>
          </article>
        </div>
      </section>
    </SiteFrame>
  );
}
