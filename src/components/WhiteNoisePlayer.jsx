"use client";

import React, { useState, useEffect } from "react";
import {
  Volume2,
  VolumeX,
  Play,
  Square,
  Clock,
  Music,
  X,
  Sparkles,
  Heart,
  CloudRain,
  Wind
} from "lucide-react";
import { getSoundSynthesizer } from "@/lib/soundSynthesizer";

const SOUND_LIST = [
  {
    id: "shush",
    name: "엄마 쉬~ 소리",
    emoji: "🌬️",
    desc: "신생아 진정에 탁월한 1.5초 주기 쉬~ 리듬",
    tag: "신생아 추천"
  },
  {
    id: "heartbeat",
    name: "자궁 심장 박동음",
    emoji: "💓",
    desc: "엄마 뱃속 환경(72 BPM)을 재현한 안도감",
    tag: "숙면 유도"
  },
  {
    id: "pink_noise",
    name: "핑크 노이즈",
    emoji: "🌊",
    desc: "귀가 편안한 균형 잡힌 자연스러운 백색소음",
    tag: "통잠 유도"
  },
  {
    id: "rain",
    name: "잔잔한 빗소리",
    emoji: "🌧️",
    desc: "창가에 내리는 부드러운 빗방울 소리",
    tag: "편안한 휴식"
  },
  {
    id: "lullaby",
    name: "오르골 자장가",
    emoji: "🎼",
    desc: "반짝반짝 작은별 오르골 벨 신디사이저",
    tag: "수면 의식"
  }
];

export default function WhiteNoisePlayer({ isOpen, onClose }) {
  const [activeSound, setActiveSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [timerMinutes, setTimerMinutes] = useState(30); // 15 | 30 | 60 | 0(무제한)
  const [remainingSec, setRemainingSec] = useState(0);

  // Timer countdown
  useEffect(() => {
    let interval = null;
    if (isPlaying && timerMinutes > 0 && remainingSec > 0) {
      interval = setInterval(() => {
        setRemainingSec((prev) => {
          if (prev <= 1) {
            handleStop();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, timerMinutes, remainingSec]);

  const handlePlay = (soundId) => {
    const synth = getSoundSynthesizer();
    if (!synth) return;

    setActiveSound(soundId);
    setIsPlaying(true);
    synth.play(soundId, volume);

    if (timerMinutes > 0) {
      setRemainingSec(timerMinutes * 60);
    } else {
      setRemainingSec(0);
    }
  };

  const handleStop = () => {
    const synth = getSoundSynthesizer();
    if (synth) synth.stop();
    setIsPlaying(false);
    setActiveSound(null);
    setRemainingSec(0);
  };

  const handleVolumeChange = (newVol) => {
    setVolume(newVol);
    const synth = getSoundSynthesizer();
    if (synth) synth.setVolume(newVol);
  };

  const handleTimerChange = (mins) => {
    setTimerMinutes(mins);
    if (isPlaying && mins > 0) {
      setRemainingSec(mins * 60);
    } else {
      setRemainingSec(0);
    }
  };

  const formatCountdown = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}분 ${String(s).padStart(2, "0")}초 후 종료`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-4 bg-linear-to-r from-indigo-600 to-violet-600 text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center">
              <Music className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm">수면 유도 백색소음기</h3>
              <p className="text-[11px] text-indigo-100">
                100% 무손실 실시간 합성 • 오프라인 완벽 지원
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-all active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sound Selection List */}
        <div className="p-4 space-y-2.5 max-h-[50vh] overflow-y-auto">
          {SOUND_LIST.map((s) => {
            const isThisPlaying = isPlaying && activeSound === s.id;

            return (
              <div
                key={s.id}
                onClick={() => (isThisPlaying ? handleStop() : handlePlay(s.id))}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                  isThisPlaying
                    ? "bg-indigo-50 border-indigo-300 ring-2 ring-indigo-400/40 shadow-xs"
                    : "bg-slate-50/80 hover:bg-slate-100 border-slate-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-xl shadow-2xs">
                    {s.emoji}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-extrabold text-slate-800 text-xs">
                        {s.name}
                      </h4>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white text-indigo-700 border border-indigo-100">
                        {s.tag}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{s.desc}</p>
                  </div>
                </div>

                <button
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                    isThisPlaying
                      ? "bg-indigo-600 text-white shadow-md"
                      : "bg-white text-slate-700 border border-slate-200"
                  }`}
                >
                  {isThisPlaying ? (
                    <Square className="w-4 h-4 fill-white" />
                  ) : (
                    <Play className="w-4 h-4 fill-slate-700" />
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Controls: Volume & Timer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3.5">
          {/* Active Status Banner */}
          {isPlaying && (
            <div className="flex items-center justify-between p-2.5 bg-indigo-100/70 border border-indigo-200 rounded-xl text-xs text-indigo-900 font-bold">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
                <span>재생 중: {SOUND_LIST.find((s) => s.id === activeSound)?.name}</span>
              </div>
              <span className="text-[11px] text-indigo-700 font-medium">
                {timerMinutes > 0 ? formatCountdown(remainingSec) : "연속 무제한 재생"}
              </span>
            </div>
          )}

          {/* Volume Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5 text-slate-500" />
                사운드 볼륨
              </span>
              <span>{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          {/* Timer Buttons */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              자동 종료 타이머
            </label>
            <div className="flex gap-1.5">
              {[
                { label: "15분", val: 15 },
                { label: "30분", val: 30 },
                { label: "60분", val: 60 },
                { label: "무제한", val: 0 }
              ].map((t) => (
                <button
                  key={t.val}
                  onClick={() => handleTimerChange(t.val)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    timerMinutes === t.val
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-white text-slate-700 border border-slate-200"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Close / Stop Button */}
          <div className="flex gap-2 pt-1">
            {isPlaying && (
              <button
                onClick={handleStop}
                className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs rounded-xl active:scale-95 transition-all shadow-xs"
              >
                소리 끄기 (정지)
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl active:scale-95 transition-all shadow-xs"
            >
              닫기 (배경에서 계속 재생)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
