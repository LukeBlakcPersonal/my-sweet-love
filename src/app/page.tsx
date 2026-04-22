"use client";

import Link from "next/link";
import { SiteFrame } from "@/components/site-frame";
import { useLoveSite } from "@/components/useLoveSite";

export default function Home() {
  const site = useLoveSite();
  const quickPaths = [
    { href: "/perfil", label: "Perfil", detail: "Conoce a quienes viven este espacio." },
    { href: "/collage", label: "Collage", detail: "Recuerdos visuales en una sola pared." },
    { href: "/musica", label: "Música", detail: "Canciones para cada momento compartido." },
    { href: "/portafolio", label: "Portafolio", detail: "Momentos especiales guardados con intención." },
  ];

  const visitModes = [
    { title: "Vengo por primera vez", copy: "Empieza por Perfil y luego explora Collage para entender la historia." },
    { title: "Quiero inspirarme", copy: "Música + Portafolio es una ruta suave para descubrir el ambiente del sitio." },
    { title: "Ya conozco el lugar", copy: "Entra directo a Mensajes o Subir para seguir construyendo recuerdos." },
  ];

  return (
    <SiteFrame site={site}>
      <section id="inicio" className="glass relative overflow-hidden rounded-3xl p-6 sm:p-8">
        <div className="absolute -right-10 -top-16 h-44 w-44 rounded-full bg-[radial-gradient(circle,var(--green),transparent_64%)] opacity-34" />
        <div className="absolute -bottom-14 -left-10 h-44 w-44 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--green)_78%,var(--mustard-strong)),transparent_64%)] opacity-30" />
        <p className="signal-chip">Un rincón para compartir, descubrir y volver</p>
        <div className="mt-4 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Bienvenido a Estrellita + Lunita</h1>
            <p className="mt-3 max-w-3xl text-sm text-[#5f4656]/88 sm:text-base">
              Este espacio nació desde el amor, pero está abierto para cualquiera que quiera conocer un pedacito de nuestra historia,
              nuestra música y los recuerdos que vamos guardando.
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-sm">
              <Link className="btn-core btn-bright" href="/perfil">Empezar recorrido</Link>
              <Link className="btn-core btn-neutral" href="/collage">Ver collage</Link>
              <Link className="btn-core btn-neutral" href="/musica">Escuchar música</Link>
            </div>
          </div>

          <article className="rounded-2xl border border-[rgba(111,75,88,0.12)] bg-white/72 p-4 sm:p-5">
            <p className="text-xs uppercase tracking-[0.28em] text-[#8a6676]">Si es tu primera vez</p>
            <h2 className="mt-2 text-xl font-semibold text-[#5b3c48]">Una guía breve para descubrir</h2>
            <ol className="mt-3 space-y-2 text-sm text-[#6b4f5d]">
              <li>1. Empieza por Perfil para conocer el corazón del proyecto.</li>
              <li>2. Pasa por Collage y Portafolio para explorar momentos y detalles.</li>
              <li>3. Cierra en Música para sentir el ambiente completo.</li>
            </ol>
          </article>
        </div>

        <div className="mt-7 grid gap-4 lg:grid-cols-3">
          {visitModes.map((mode) => (
            <article key={mode.title} className="rounded-2xl border border-[rgba(111,75,88,0.12)] bg-white/72 p-4">
              <h3 className="text-base font-semibold text-[#5b3c48]">{mode.title}</h3>
              <p className="mt-2 text-sm text-[#6b4f5d]">{mode.copy}</p>
            </article>
          ))}
        </div>

        <div className="mt-7 rounded-2xl border border-[rgba(111,75,88,0.12)] bg-white/72 p-4 sm:p-5">
          <p className="text-xs uppercase tracking-[0.28em] text-[#8a6676]">Descubre por sección</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {quickPaths.map((path) => (
              <Link
                key={path.href}
                className="rounded-2xl border border-[rgba(111,75,88,0.12)] bg-white/80 p-3 transition hover:-translate-y-0.5"
                href={path.href}
              >
                <p className="text-sm font-semibold text-[#5b3c48]">{path.label}</p>
                <p className="mt-1 text-xs text-[#6b4f5d]">{path.detail}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </SiteFrame>
  );
}
