"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Send,
  Bot,
  User,
  Sparkles,
  Key,
  Trash2,
  AlertCircle,
  HelpCircle,
  Stethoscope
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const QUICK_PROMPTS = [
  "밤에 30분~1시간마다 깨서 울어요. 수면퇴행인가요?",
  "분유를 평소의 절반도 안 먹고 젖병을 밀쳐내요.",
  "체온이 38.2도인데 해열제 어떻게 먹여야 하나요?",
  "손을 너무 심하게 빠는데 치발기 줘야 하나요?",
  "침독이 빨갛게 올라왔는데 보습 관리법 알려주세요.",
  "초기 이유식(쌀미음) 시작 시기와 준비물 알려줘."
];

export default function AICoachModal({
  isOpen,
  onClose,
  profile,
  status,
  initialQuestion
}) {
  const getInitialGreeting = () => ({
    role: "assistant",
    content: `안녕하세요! 닥터 베베 AI 육아 코치입니다. 🩺\n\n현재 **${profile?.name || "우리 아기"}** (${status?.isPregnant ? status?.gestationalText || "임신 주차" : status?.displayAge || "월령 정보"})의 상태에 맞추어 전문적인 소아과 & 임신 육아 상담을 도와드릴게요.\n\n궁금한 아기 행동이나 건강 고민, 입덧/수유/수면 질문을 편하게 남겨주세요!`
  });

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [customKey, setCustomKey] = useState("");
  const [showKeyInput, setShowKeyInput] = useState(false);
  const messagesEndRef = useRef(null);

  // 로컬스토리지에서 이전 대화 및 API 키 로드
  useEffect(() => {
    const savedKey = localStorage.getItem("datebaby_gemini_key");
    if (savedKey) setCustomKey(savedKey);

    const savedChat = localStorage.getItem("datebaby_chat_history");
    if (savedChat) {
      try {
        const parsed = JSON.parse(savedChat);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      } catch (e) {}
    }
    // 저장된 대화가 없으면 환영 메시지로 초기화
    setMessages([getInitialGreeting()]);
  }, [profile?.name, status?.gestationalText, status?.displayAge]);

  // 대화 변경 시 로컬스토리지 자동 저장
  const updateMessages = (newMsgs) => {
    setMessages(newMsgs);
    localStorage.setItem("datebaby_chat_history", JSON.stringify(newMsgs));
  };

  // initialQuestion이 들어왔을 때 자동 전송 또는 입력창 채우기
  useEffect(() => {
    if (isOpen && initialQuestion) {
      handleSendMessage(initialQuestion);
    }
  }, [isOpen, initialQuestion]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  if (!isOpen) return null;

  const handleSaveKey = () => {
    localStorage.setItem("datebaby_gemini_key", customKey.trim());
    setShowKeyInput(false);
  };

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || input.trim();
    if (!query || loading) return;

    const userMsg = { role: "user", content: query };
    const newHistory = [...messages, userMsg];
    updateMessages(newHistory);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          babyContext: {
            name: profile.name,
            ageText: status.isPregnant ? status.gestationalText : status.displayAge,
            days: status.daysSinceBirth,
            isPregnant: status.isPregnant,
            weight: profile.weight
          },
          history: messages.slice(-6), // 최근 3턴 대화 유지
          apiKey: customKey.trim() || undefined
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "답변을 가져오지 못했습니다.");
      }

      const updatedWithAnswer = [
        ...newHistory,
        { role: "assistant", content: data.answer }
      ];
      updateMessages(updatedWithAnswer);
    } catch (err) {
      const updatedWithError = [
        ...newHistory,
        {
          role: "assistant",
          content: `⚠️ 오류가 발생했습니다: ${err.message}\n\nGoogle AI Studio API 키를 등록하시려면 상단의 🔑 키 아이콘을 눌러 직접 입력해주세요.`
        }
      ];
      updateMessages(updatedWithError);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    const reset = [getInitialGreeting()];
    updateMessages(reset);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md h-[92vh] sm:h-[720px] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="p-4 bg-linear-to-r from-violet-600 to-indigo-600 text-white flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm">닥터 베베 AI 육아 코치</h3>
                <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-white/25 text-white font-semibold">
                  Gemini 3.6 Pro
                </span>
              </div>
              <p className="text-[11px] text-violet-200 font-medium">
                {profile?.name} • {status?.displayAge}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowKeyInput(!showKeyInput)}
              className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-all active:scale-95"
              title="API 키 설정"
            >
              <Key className="w-4 h-4" />
            </button>
            <button
              onClick={handleClearChat}
              className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-all active:scale-95"
              title="대화 지우기"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-all active:scale-95 ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* API Key Setting Dropdown */}
        {showKeyInput && (
          <div className="p-3 bg-slate-900 text-white text-xs border-b border-slate-800 space-y-2 animate-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200">
                Google AI Studio 무료 API Key 등록 (선택)
              </span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-violet-400 underline"
              >
                키 무료 발급 ↗
              </a>
            </div>
            <div className="flex gap-1.5">
              <input
                type="password"
                placeholder="AI Studio API 키 입력 (AIzaSy...)"
                value={customKey}
                onChange={(e) => setCustomKey(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-hidden focus:ring-1 focus:ring-violet-400"
              />
              <button
                onClick={handleSaveKey}
                className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 rounded-lg font-bold text-white text-xs"
              >
                저장
              </button>
            </div>
            <p className="text-[10px] text-slate-400">
              * 서버 환경변수(`GEMINI_API_KEY`)가 설정되어 있다면 비워두셔도 자동 동작합니다.
            </p>
          </div>
        )}

        {/* Chat Messages Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50">
          {messages.map((msg, index) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={index}
                className={`flex gap-2.5 ${
                  isUser ? "justify-end" : "justify-start"
                }`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-violet-100 border border-violet-200 flex items-center justify-center text-violet-700 shrink-0 text-xs font-bold shadow-2xs">
                    👨‍⚕️
                  </div>
                )}
                <div
                  className={`max-w-[88%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-2xs ${
                    isUser
                      ? "bg-violet-600 text-white rounded-br-xs font-medium"
                      : "bg-white text-slate-800 rounded-bl-xs border border-slate-200/90"
                  }`}
                >
                  {isUser ? (
                    <p className="whitespace-pre-line">{msg.content}</p>
                  ) : (
                    <div className="space-y-2 prose prose-xs prose-slate max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h3: ({ node, ...props }) => (
                            <h4 className="font-bold text-violet-900 text-xs sm:text-sm mt-3 mb-1 flex items-center gap-1 border-b border-violet-100 pb-1" {...props} />
                          ),
                          h4: ({ node, ...props }) => (
                            <h5 className="font-bold text-slate-800 text-xs mt-2 mb-0.5" {...props} />
                          ),
                          ul: ({ node, ...props }) => (
                            <ul className="list-disc pl-4 space-y-1 my-1 text-slate-700" {...props} />
                          ),
                          ol: ({ node, ...props }) => (
                            <ol className="list-decimal pl-4 space-y-1 my-1 text-slate-700 font-medium" {...props} />
                          ),
                          li: ({ node, ...props }) => (
                            <li className="leading-relaxed" {...props} />
                          ),
                          strong: ({ node, ...props }) => (
                            <strong className="font-bold text-violet-950 bg-violet-50/80 px-1 py-0.2 rounded" {...props} />
                          ),
                          p: ({ node, ...props }) => (
                            <p className="my-1.5 leading-relaxed text-slate-700" {...props} />
                          ),
                          blockquote: ({ node, ...props }) => (
                            <blockquote className="border-l-4 border-violet-400 pl-3 py-1 my-2 text-violet-900 bg-violet-50/50 rounded-r-lg italic" {...props} />
                          )
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-600 shrink-0 text-xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-2.5 justify-start">
              <div className="w-8 h-8 rounded-full bg-violet-100 border border-violet-200 flex items-center justify-center text-violet-700 shrink-0 text-xs font-bold animate-pulse">
                👨‍⚕️
              </div>
              <div className="bg-white rounded-2xl rounded-bl-xs p-3.5 border border-slate-200 shadow-2xs text-xs text-slate-500 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-violet-600 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-violet-600 animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-violet-600 animate-bounce [animation-delay:0.4s]" />
                <span className="font-medium text-slate-600">
                  닥터 베베가 소아과 가이드라인을 확인하고 있습니다...
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Recommendation Chips */}
        <div className="px-3 pt-2 pb-1 bg-white border-t border-slate-100 overflow-x-auto scrollbar-none flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-slate-400 shrink-0 flex items-center gap-0.5">
            <Sparkles className="w-3 h-3 text-violet-500" />
            자주 묻는 질문:
          </span>
          {QUICK_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 hover:bg-violet-100 text-slate-700 hover:text-violet-900 border border-slate-200/80 transition-all active:scale-95"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="아기 행동이나 증상을 입력하세요 (예: 젖 거부, 미열...)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white rounded-2xl active:scale-95 transition-all shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
