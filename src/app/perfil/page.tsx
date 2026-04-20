"use client";

import { SiteFrame } from "@/components/site-frame";
import { PrivateRouteNotice } from "@/components/private-route-notice";
import { useLoveSite } from "@/components/useLoveSite";

export default function PerfilPage() {
  const site = useLoveSite();

  if (!site.activeUser) {
    return (
      <SiteFrame site={site}>
        <PrivateRouteNotice title="Perfil privado" />
      </SiteFrame>
    );
  }

  return (
    <SiteFrame site={site}>
      <section className="glass rounded-3xl p-6 sm:p-8">
        <p className="signal-chip">Nuestro perfil</p>
        <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Lo esencial de ustedes dos</h1>
        <p className="mt-3 max-w-3xl text-sm text-[#5f4656]/88 sm:text-base">
          Esta ruta muestra el perfil de la pareja y, si entran con sesión, permite editar redes y contacto.
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <article className="rounded-2xl border border-[rgba(111,75,88,0.12)] bg-white/74 p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-[#8a6676]">Sesión activa</p>
            <p className="mt-2 text-sm text-[#6b4f5d]">{site.viewerLabel}</p>
          </article>
          <article className="rounded-2xl border border-[rgba(111,75,88,0.12)] bg-white/74 p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-[#8a6676]">Correo</p>
            <p className="mt-2 text-sm text-[#6b4f5d]">{site.activeUser}</p>
          </article>
          <article className="rounded-2xl border border-[rgba(111,75,88,0.12)] bg-white/74 p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-[#8a6676]">Juntos</p>
            <p className="mt-2 text-sm text-[#6b4f5d]">Un archivo de recuerdos, música y trabajos hechos con cariño.</p>
          </article>
        </div>

        <div className="mt-6 rounded-2xl border border-[rgba(111,75,88,0.12)] bg-white/72 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#8a6676]">Tu identidad</p>
          <p className="mt-2 text-sm text-[#6b4f5d]">
            Cambia el nombre y alias de esta cuenta. Se guardan en Firebase y se usan automáticamente en mensajes y subidas.
          </p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <input
              className="input-base"
              placeholder="Nombre"
              value={site.identityProfile.name}
              onChange={(event) => site.updateIdentityField("name", event.target.value)}
            />
            <input
              className="input-base"
              placeholder="Alias"
              value={site.identityProfile.alias}
              onChange={(event) => site.updateIdentityField("alias", event.target.value)}
            />
          </div>
          <button className="btn-core btn-bright mt-4" onClick={() => void site.saveIdentityProfile()} disabled={site.isSavingProfile || site.isBusy}>
            {site.isSavingProfile ? "Guardando..." : "Guardar nombre y alias"}
          </button>
        </div>

        <div className="mt-6 rounded-2xl border border-[rgba(111,75,88,0.12)] bg-white/72 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#8a6676]">Redes y contacto</p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <input className="input-base" placeholder="Instagram" value={site.portfolioProfile.instagram} onChange={(event) => site.updateProfileField("instagram", event.target.value)} />
            <input className="input-base" placeholder="Behance o portafolio web" value={site.portfolioProfile.behance} onChange={(event) => site.updateProfileField("behance", event.target.value)} />
            <input className="input-base" placeholder="Correo de contacto" value={site.portfolioProfile.contactEmail} onChange={(event) => site.updateProfileField("contactEmail", event.target.value)} />
            <input className="input-base" placeholder="Telefono de contacto" value={site.portfolioProfile.contactPhone} onChange={(event) => site.updateProfileField("contactPhone", event.target.value)} />
          </div>
        </div>
      </section>
    </SiteFrame>
  );
}
