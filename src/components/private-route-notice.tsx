import Link from "next/link";

type PrivateRouteNoticeProps = {
  title: string;
};

export function PrivateRouteNotice({ title }: PrivateRouteNoticeProps) {
  return (
    <section className="glass rounded-3xl p-6 sm:p-8">
      <p className="signal-chip">Acceso restringido</p>
      <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">{title}</h1>
      <p className="mt-3 max-w-3xl text-sm text-[#5f4656]/88 sm:text-base">
        Esta ruta es privada para ustedes dos. Inicia sesión en la página de acceso para desbloquearla.
      </p>
      <div className="mt-5">
        <Link className="btn-core btn-bright" href="/acceso">
          Ir a acceso
        </Link>
      </div>
    </section>
  );
}
