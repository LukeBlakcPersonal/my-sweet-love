"use client";

import { PrivateRouteNotice } from "@/components/private-route-notice";
import { SiteFrame } from "@/components/site-frame";
import { useLoveSite } from "@/components/useLoveSite";

export default function SubirPage() {
  const site = useLoveSite();

  if (!site.activeUser) {
    return (
      <SiteFrame site={site}>
        <PrivateRouteNotice title="Subida privada" />
      </SiteFrame>
    );
  }

  return (
    <SiteFrame site={site}>
      <section className="glass rounded-3xl p-6 sm:p-8">
        <p className="signal-chip">Subir</p>
        <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Subir recuerdos</h1>
        <p className="mt-3 max-w-3xl text-sm text-[#5f4656]/88 sm:text-base">
          Aquí suben imagen, video o MP3. Solo aparece el formulario cuando hay sesión iniciada.
        </p>

        {site.activeUser ? (
          <form className="mt-6 grid gap-3 md:grid-cols-2" onSubmit={site.handleMainUpload}>
            <input className="input-base md:col-span-2" placeholder="Titulo para el archivo" value={site.uploadState.title} onChange={(event) => site.setUploadState((prev) => ({ ...prev, title: event.target.value }))} />
            <div className="input-base flex items-center justify-between gap-3">
              <span className="text-sm text-[#8a6676]">Sube como</span>
              <span className="text-sm font-semibold text-[#5f4656]">{site.viewerLabel}</span>
            </div>
            <input className="input-base" type="file" accept="image/*,video/*,audio/mpeg" onChange={(event) => site.setUploadFile(event.target.files?.[0] ?? null)} />
            <button className="btn-core btn-bright md:col-span-2" disabled={site.isBusy}>{site.isBusy ? "Subiendo..." : "Subir archivo"}</button>
          </form>
        ) : (
          <div className="mt-6 rounded-2xl border border-[rgba(111,75,88,0.12)] bg-white/74 p-4 text-sm text-[#6b4f5d]">
            Inicien sesión en la ruta de acceso para poder subir archivos.
          </div>
        )}
      </section>
    </SiteFrame>
  );
}
