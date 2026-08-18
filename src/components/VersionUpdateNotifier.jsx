"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, RotateCw, X } from "lucide-react";

export default function VersionUpdateNotifier() {
  const [hasUpdate, setHasUpdate] = useState(false);
  const [currentVersion, setCurrentVersion] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Initial version check
    fetch("/api/version")
      .then((res) => res.json())
      .then((data) => {
        if (data?.version) {
          setCurrentVersion(data.version);
        }
      })
      .catch(() => {});

    // 2. Periodic check (every 2 minutes) + on Window Focus / Tab Re-entry
    const checkForUpdates = () => {
      fetch(`/api/version?_t=${Date.now()}`, { cache: "no-store" })
        .then((res) => res.json())
        .then((data) => {
          if (data?.version && currentVersion && data.version !== currentVersion) {
            setHasUpdate(true);
          }
        })
        .catch(() => {});
    };

    const interval = setInterval(checkForUpdates, 120000);
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkForUpdates();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("focus", checkForUpdates);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("focus", checkForUpdates);
    };
  }, [currentVersion]);

  if (!hasUpdate) return null;

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-sm animate-in slide-in-from-top-4 duration-300">
      <div className="bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-2xl shadow-2xl border border-amber-400/40 flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-black text-amber-300">새 버전 업데이트 완료!</div>
            <div className="text-[11px] text-slate-300">더 최적화된 최신 기능을 사용하세요</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-1.5 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-black shadow-xs flex items-center gap-1 active:scale-95 transition-all"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>새로고침</span>
          </button>
          <button
            onClick={() => setHasUpdate(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
