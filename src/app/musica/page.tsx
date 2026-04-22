"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { SiteFrame } from "@/components/site-frame";
import { useLoveSite } from "@/components/useLoveSite";

export default function MusicaPage() {
  const site = useLoveSite();
  const tracks = site.audioTracks;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoPlayRequested, setAutoPlayRequested] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isRepeatEnabled, setIsRepeatEnabled] = useState(false);
  const [isShuffleEnabled, setIsShuffleEnabled] = useState(false);
  const [editingTrackId, setEditingTrackId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [tracksPerPage, setTracksPerPage] = useState(10);
  const activeIndex = tracks.length === 0 ? 0 : Math.min(currentIndex, tracks.length - 1);
  const totalPages = Math.max(1, Math.ceil(tracks.length / tracksPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * tracksPerPage;
  const pageTracks = tracks.slice(pageStart, pageStart + tracksPerPage);

  const currentTrack = useMemo(() => {
    if (tracks.length === 0) {
      return null;
    }

    return tracks[activeIndex];
  }, [activeIndex, tracks]);

  useEffect(() => {
    if (!audioRef.current || !currentTrack || !autoPlayRequested) {
      return;
    }

    void audioRef.current.play().catch(() => {
      // Browsers can block autoplay without prior interaction.
    });
  }, [autoPlayRequested, currentTrack]);

  useEffect(() => {
    if (!audioRef.current) {
      return;
    }

    audioRef.current.volume = volume;
  }, [volume]);

  function goToTrack(index: number, shouldPlay: boolean) {
    if (tracks.length === 0) {
      return;
    }

    const bounded = Math.max(0, Math.min(index, tracks.length - 1));
    setCurrentIndex(bounded);
    setAutoPlayRequested(shouldPlay);
  }

  function playNext() {
    if (tracks.length === 0) {
      return;
    }

    setCurrentIndex((prev) => {
      if (isShuffleEnabled && tracks.length > 1) {
        let next = prev;
        while (next === prev) {
          next = Math.floor(Math.random() * tracks.length);
        }
        return next;
      }

      return (prev + 1) % tracks.length;
    });
    setAutoPlayRequested(true);
  }

  function playPrevious() {
    if (tracks.length === 0) {
      return;
    }

    setCurrentIndex((prev) => {
      if (isShuffleEnabled && tracks.length > 1) {
        let next = prev;
        while (next === prev) {
          next = Math.floor(Math.random() * tracks.length);
        }
        return next;
      }

      return (prev - 1 + tracks.length) % tracks.length;
    });
    setAutoPlayRequested(true);
  }

  function handleTrackEnd() {
    if (isRepeatEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      void audioRef.current.play().catch(() => {
        // Ignore autoplay restrictions silently.
      });
      return;
    }

    playNext();
  }

  async function togglePlay() {
    const player = audioRef.current;
    if (!player) {
      return;
    }

    if (player.paused) {
      await player.play().catch(() => {
        // Ignore autoplay restrictions silently.
      });
      return;
    }

    player.pause();
  }

  function handleSeek(nextValue: number) {
    const player = audioRef.current;
    if (!player) {
      return;
    }

    player.currentTime = nextValue;
    setCurrentTime(nextValue);
  }

  function handleVolumeChange(nextValue: number) {
    setVolume(nextValue);
  }

  function formatTime(seconds: number) {
    if (!Number.isFinite(seconds) || seconds < 0) {
      return "0:00";
    }

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, "0")}`;
  }

  function beginRename(trackId: string, currentTitle: string) {
    setEditingTrackId(trackId);
    setRenameDraft(currentTitle);
  }

  async function saveRename(trackId: string) {
    const track = tracks.find((item) => item.id === trackId);
    if (!track) {
      return;
    }

    const ok = await site.renameMediaItem(track, renameDraft);
    if (ok) {
      setEditingTrackId(null);
      setRenameDraft("");
    }
  }

  async function removeTrack(trackId: string) {
    const track = tracks.find((item) => item.id === trackId);
    if (!track) {
      return;
    }

    const confirmed = window.confirm(`Eliminar \"${track.title}\" de Firebase y Cloudinary?`);
    if (!confirmed) {
      return;
    }

    const ok = await site.deleteMediaItem(track);
    if (ok && editingTrackId === trackId) {
      setEditingTrackId(null);
      setRenameDraft("");
    }
  }

  return (
    <SiteFrame site={site}>
      <section className="glass rounded-3xl p-6 sm:p-8">
        <p className="signal-chip">Música</p>
        <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Canciones que los acompañan</h1>
        <p className="mt-3 max-w-3xl text-sm text-[#5f4656]/88 sm:text-base">
          Esta ruta reúne los MP3 subidos. Se puede escuchar sin anuncios y sin salir de la página.
        </p>

        <div className="mt-5 rounded-2xl border border-[rgba(111,75,88,0.12)] bg-white/74 p-4">
          <p className="text-xs uppercase tracking-[0.26em] text-[#8a6676]">Tu reproductor propio</p>
          <p className="mt-2 text-sm text-[#6b4f5d]">
            Para tener audio propio, sube el archivo MP3 desde la sección de subida. El sistema lo aloja en Cloudinary y
            luego aparece aquí automáticamente.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link className="btn-core btn-bright" href="/subir">Ir a subir MP3</Link>
            <Link className="btn-core btn-neutral" href="/acceso">Iniciar sesión</Link>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {site.audioTracks.length === 0 ? (
            <p className="rounded-xl border border-[rgba(111,75,88,0.12)] bg-white/70 p-3 text-sm text-[#6b4f5d]/80">
              Aun no hay canciones. Sube archivos MP3 desde la ruta de subida.
            </p>
          ) : (
            <>
              <article className="rounded-xl border border-[rgba(111,75,88,0.12)] bg-white/74 p-4">
                <p className="text-xs uppercase tracking-[0.26em] text-[#8a6676]">Reproduciendo ahora</p>
                <p className="mt-2 text-base font-semibold text-[#6d4f5c]">{currentTrack?.title}</p>
                <audio
                  ref={audioRef}
                  key={currentTrack?.id}
                  className="sr-only"
                  src={currentTrack?.media_url}
                  preload="metadata"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime || 0)}
                  onLoadedMetadata={(event) => {
                    setDuration(event.currentTarget.duration || 0);
                    setCurrentTime(0);
                    event.currentTarget.volume = volume;
                  }}
                  onEnded={handleTrackEnd}
                />

                <div className="mt-4 rounded-2xl border border-[rgba(111,75,88,0.12)] bg-[linear-gradient(130deg,rgba(255,255,255,0.96),rgba(248,241,229,0.88))] p-4 sm:p-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      className="btn-core btn-bright min-w-28"
                      onClick={() => void togglePlay()}
                      aria-label={isPlaying ? "Pausar" : "Reproducir"}
                    >
                      {isPlaying ? "Pausar" : "Reproducir"}
                    </button>
                    <span className="text-xs font-semibold tracking-[0.2em] text-[#8a6676]">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                    <input
                      type="range"
                      min={0}
                      max={Math.max(duration, 0.1)}
                      step={0.1}
                      value={Math.min(currentTime, duration || 0)}
                      onChange={(event) => handleSeek(Number(event.target.value))}
                      className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[rgba(111,75,88,0.2)] accent-(--emerald)"
                      aria-label="Progreso de reproduccion"
                    />

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#8a6676]">Vol</span>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={volume}
                        onChange={(event) => handleVolumeChange(Number(event.target.value))}
                        className="h-2 w-28 cursor-pointer appearance-none rounded-full bg-[rgba(111,75,88,0.2)] accent-(--emerald)"
                        aria-label="Volumen"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" className="btn-core btn-neutral" onClick={playPrevious}>
                    Anterior
                  </button>
                  <button type="button" className="btn-core btn-bright" onClick={playNext}>
                    Siguiente
                  </button>
                  <button
                    type="button"
                    className={`btn-core ${isRepeatEnabled ? "btn-bright" : "btn-neutral"}`}
                    onClick={() => setIsRepeatEnabled((prev) => !prev)}
                  >
                    Repetir {isRepeatEnabled ? "ON" : "OFF"}
                  </button>
                  <button
                    type="button"
                    className={`btn-core ${isShuffleEnabled ? "btn-bright" : "btn-neutral"}`}
                    onClick={() => setIsShuffleEnabled((prev) => !prev)}
                  >
                    Aleatorio {isShuffleEnabled ? "ON" : "OFF"}
                  </button>
                </div>
              </article>

              <article className="rounded-xl border border-[rgba(111,75,88,0.12)] bg-white/74 p-4">
                <p className="text-xs uppercase tracking-[0.26em] text-[#8a6676]">Lista de reproducción</p>
                {site.activeUser ? (
                  <p className="mt-2 text-xs text-[#6b4f5d]">
                    Puedes renombrar o eliminar canciones. El borrado tambien elimina el archivo en Cloudinary.
                  </p>
                ) : null}

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[rgba(111,75,88,0.12)] bg-white/70 px-3 py-2 text-xs text-[#6b4f5d]">
                  <div className="flex flex-wrap items-center gap-2">
                    <span>
                      Mostrando {tracks.length === 0 ? 0 : pageStart + 1}-{Math.min(pageStart + pageTracks.length, tracks.length)} de {tracks.length}
                    </span>
                    <label className="flex items-center gap-2">
                      <span>Tamano:</span>
                      <select
                        className="rounded-lg border border-[rgba(111,75,88,0.2)] bg-white px-2 py-1 text-xs text-[#5b3c48]"
                        value={tracksPerPage}
                        onChange={(event) => {
                          setTracksPerPage(Number(event.target.value));
                          setCurrentPage(1);
                        }}
                      >
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                        <option value={20}>20</option>
                      </select>
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="btn-core btn-neutral px-3 py-1 text-xs"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={safePage <= 1}
                    >
                      Pagina anterior
                    </button>
                    <span className="font-semibold text-[#5b3c48]">{safePage} / {totalPages}</span>
                    <button
                      type="button"
                      className="btn-core btn-neutral px-3 py-1 text-xs"
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={safePage >= totalPages}
                    >
                      Pagina siguiente
                    </button>
                  </div>
                </div>

                <div className="mt-3 grid gap-2">
                  {pageTracks.map((track, pageIndex) => {
                    const index = pageStart + pageIndex;
                    const isActive = index === activeIndex;
                    const isEditing = editingTrackId === track.id;

                    return (
                      <article
                        key={track.id}
                        className={`w-full rounded-xl border px-3 py-2 text-sm transition ${
                          isActive
                            ? "border-[rgba(30,120,90,0.45)] bg-[rgba(255,255,255,0.95)] text-[#1f4f3b]"
                            : "border-[rgba(111,75,88,0.12)] bg-white/80 text-[#6d4f5c]"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => goToTrack(index, true)}
                          className="w-full text-left"
                        >
                          <span className="font-semibold">{index + 1}. {track.title}</span>
                        </button>

                        {site.activeUser ? (
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            {isEditing ? (
                              <>
                                <input
                                  value={renameDraft}
                                  onChange={(event) => setRenameDraft(event.target.value)}
                                  className="input-base max-w-xs"
                                  placeholder="Nuevo nombre"
                                />
                                <button
                                  type="button"
                                  className="btn-core btn-bright"
                                  onClick={() => void saveRename(track.id)}
                                  disabled={site.isBusy}
                                >
                                  Guardar
                                </button>
                                <button
                                  type="button"
                                  className="btn-core btn-neutral"
                                  onClick={() => {
                                    setEditingTrackId(null);
                                    setRenameDraft("");
                                  }}
                                >
                                  Cancelar
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  className="btn-core btn-neutral"
                                  onClick={() => beginRename(track.id, track.title)}
                                >
                                  Renombrar
                                </button>
                                <button
                                  type="button"
                                  className="btn-core btn-neutral"
                                  onClick={() => void removeTrack(track.id)}
                                  disabled={site.isBusy}
                                >
                                  Eliminar
                                </button>
                              </>
                            )}
                          </div>
                        ) : null}
                      </article>
                    );
                  })}
                </div>
              </article>
            </>
          )}
        </div>
      </section>
    </SiteFrame>
  );
}
