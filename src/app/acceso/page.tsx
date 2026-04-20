"use client";

import { SiteFrame } from "@/components/site-frame";
import { useLoveSite } from "@/components/useLoveSite";

export default function AccesoPage() {
  const site = useLoveSite();

  return (
    <SiteFrame site={site}>
      <section className="glass rounded-3xl p-6 sm:p-8">
        <p className="signal-chip">Acceso</p>
        <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Entrar como pareja</h1>
        <p className="mt-3 max-w-3xl text-sm text-[#5f4656]/88 sm:text-base">
          Desde aquí pueden entrar con Firebase o cerrar sesión. El registro está desactivado.
        </p>

        <div className="mt-6 max-w-xl space-y-3">
          <input className="input-base" type="email" placeholder="correo" value={site.email} onChange={(event) => site.setEmail(event.target.value)} />
          <input className="input-base" type="password" placeholder="contrasena" value={site.password} onChange={(event) => site.setPassword(event.target.value)} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="btn-core btn-bright" type="button" onClick={() => void site.handleAuth("signin")}>Entrar</button>
          <button className="btn-core btn-neutral" type="button" onClick={() => void site.handleSignOut()}>Salir</button>
        </div>
        <p className="mt-3 text-xs text-[#6f5561]/78">Usuario activo: {site.activeUser || "sin sesion"}</p>
        <p className="mt-1 text-xs text-[#8a6676]/82">{site.authStatus}</p>
      </section>
    </SiteFrame>
  );
}
