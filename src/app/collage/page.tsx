"use client";

import Image from "next/image";
import { PrivateRouteNotice } from "@/components/private-route-notice";
import { SiteFrame } from "@/components/site-frame";
import { useLoveSite } from "@/components/useLoveSite";

export default function CollagePage() {
  const site = useLoveSite();

  if (!site.activeUser) {
    return (
      <SiteFrame site={site}>
        <PrivateRouteNotice title="Collage privado" />
      </SiteFrame>
    );
  }

  return (
    <SiteFrame site={site}>
      <section className="glass rounded-3xl p-6 sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="signal-chip">Collage</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Sus recuerdos más recientes</h1>
          </div>
          <button className="btn-core btn-neutral" onClick={() => void site.loadAll()}>Refrescar</button>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
          {site.imageCollage.map((item, index) => (
            <figure
              key={item.id}
              className={`group relative overflow-hidden rounded-xl border border-[rgba(111,75,88,0.12)] ${
                index % 5 === 0 ? "md:col-span-2 md:row-span-2" : ""
              }`}
            >
              <Image
                src={item.media_url}
                alt={item.title}
                width={900}
                height={700}
                className="h-full min-h-40 w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <figcaption className="absolute inset-x-0 bottom-0 bg-linear-to-t from-white/92 to-transparent p-2 text-[11px] text-[#5f4656]">
                {item.title} - {item.uploaded_by}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </SiteFrame>
  );
}
