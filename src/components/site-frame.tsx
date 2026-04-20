"use client";

import type { ReactNode } from "react";
import { SiteHeader } from "./site-header";
import { useLoveSite } from "./useLoveSite";

type SiteFrameProps = {
  site: ReturnType<typeof useLoveSite>;
  children: ReactNode;
};

export function SiteFrame({ site, children }: SiteFrameProps) {
  return (
    <div className="honeycomb-grid wolf-stripe flex min-h-screen flex-col">
      <SiteHeader
        activeUser={site.activeUser}
        viewerLabel={site.viewerLabel}
      />
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        {children}
      </main>
    </div>
  );
}
