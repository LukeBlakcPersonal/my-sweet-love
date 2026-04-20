"use client";

import Image from "next/image";
import { SiteFrame } from "@/components/site-frame";
import { useLoveSite } from "@/components/useLoveSite";

export default function PortafolioPage() {
  const site = useLoveSite();

  return (
    <SiteFrame site={site}>
      <section className="glass rounded-3xl p-6 sm:p-8">
        <p className="signal-chip">Portafolio</p>
        <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Su espacio creativo</h1>
        <p className="mt-3 max-w-3xl text-sm text-[#5f4656]/88 sm:text-base">
          En vista pública solo se puede mirar. Si entran como pareja, también pueden quitar piezas y evaluar trabajos.
        </p>

        <div className="mt-6 space-y-3">
          {site.portfolio.map((item) => (
            <article key={item.id} className="rounded-xl border border-[rgba(111,75,88,0.12)] bg-white/74 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-lg font-bold text-[#6d4f5c]">{item.title}</h3>
                {site.isPartnerView ? (
                  <button className="btn-core btn-neutral py-1! text-xs!" type="button" onClick={() => void site.removePortfolioItem(item.id)}>
                    Quitar
                  </button>
                ) : null}
              </div>
              <p className="mt-1 text-sm text-[#6b4f5d]/86">{item.description}</p>
              <p className="mt-1 text-xs text-[#8a6676]/72">
                Puntaje: {item.evaluation_score ?? "sin puntaje"} | Nota: {item.evaluation_note ?? "sin nota"}
              </p>
              <div className="mt-2 rounded-lg border border-[rgba(111,75,88,0.12)] bg-white/72 p-2">
                {item.media_type === "image" ? (
                  <Image src={item.media_url} alt={item.title} width={900} height={600} className="h-48 w-full rounded-md object-cover" />
                ) : null}
                {item.media_type === "video" ? (
                  <video controls className="h-48 w-full rounded-md object-cover" src={item.media_url} />
                ) : null}
                {item.media_type === "audio" ? (
                  <audio controls className="w-full" src={item.media_url} preload="none" />
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>
    </SiteFrame>
  );
}
