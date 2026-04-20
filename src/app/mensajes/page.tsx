"use client";

import Image from "next/image";
import { PrivateRouteNotice } from "@/components/private-route-notice";
import { SiteFrame } from "@/components/site-frame";
import { useLoveSite } from "@/components/useLoveSite";

export default function MensajesPage() {
  const site = useLoveSite();

  if (!site.activeUser) {
    return (
      <SiteFrame site={site}>
        <PrivateRouteNotice title="Mensajes privados" />
      </SiteFrame>
    );
  }

  return (
    <SiteFrame site={site}>
      <section className="glass rounded-3xl p-6 sm:p-8">
        <p className="signal-chip">Mensajes</p>
        <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Mensajes y momentos</h1>
        <p className="mt-3 max-w-3xl text-sm text-[#5f4656]/88 sm:text-base">
          Esta ruta está pensada para la parte privada de ustedes dos.
        </p>

        {site.isPartnerView ? (
          <>
            <form className="mt-6 space-y-3" onSubmit={site.handleMessageSubmit}>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="input-base flex items-center justify-between gap-3">
                  <span className="text-sm text-[#8a6676]">Escribe como</span>
                  <span className="text-sm font-semibold text-[#5f4656]">{site.viewerLabel}</span>
                </div>
                <input className="input-base" type="date" value={site.messageDate} onChange={(event) => site.setMessageDate(event.target.value)} />
              </div>
              <textarea className="input-base min-h-24" placeholder="Escribe aqui el mensajito o momento especial" value={site.messageText} onChange={(event) => site.setMessageText(event.target.value)} />
              <input className="input-base" type="file" accept="image/*" onChange={(event) => site.setMessageFile(event.target.files?.[0] ?? null)} />
              <button className="btn-core btn-bright" disabled={site.isBusy}>Publicar mensaje</button>
            </form>

            <div className="mt-6 space-y-3">
              {site.messages.map((msg) => (
                <article key={msg.id} className="rounded-xl border border-[rgba(111,75,88,0.12)] bg-white/74 p-3">
                  <p className="text-xs text-[#8a6676]/72">{msg.author} - {msg.date_label}</p>
                  <p className="mt-1 text-sm">{msg.content}</p>
                  {msg.photo_url ? <Image className="mt-2 h-36 w-full rounded-lg object-cover" src={msg.photo_url} alt={`Foto adjunta de ${msg.author}`} width={900} height={600} /> : null}
                </article>
              ))}
            </div>
          </>
        ) : (
          <div className="mt-6 rounded-2xl border border-[rgba(111,75,88,0.12)] bg-white/74 p-4 text-sm text-[#6b4f5d]">
            Este contenido se abre cuando entran con sesión.
          </div>
        )}
      </section>
    </SiteFrame>
  );
}
