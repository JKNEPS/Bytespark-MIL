import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Sparkles, MessageSquare, ShieldCheck, Minimize2, Maximize2, Trash2 } from 'lucide-react';
import { ChatMessage } from '../types';

interface GlobalAIChatbotProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

export const GlobalAIChatbot: React.FC<GlobalAIChatbotProps> = ({ isOpen: externalIsOpen, onToggle }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      sender: 'assistant',
      text: "👋 Hi! I'm Bytespark AI, your 24/7 Media & Information Literacy Assistant.\n\nAsk me anything about deepfakes, viral rumors, online legal rights, or scam verification!",
      timestamp: 'Just now'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sync external isOpen if passed
  useEffect(() => {
    if (externalIsOpen !== undefined) {
      setIsOpen(externalIsOpen);
    }
  }, [externalIsOpen]);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const toggleOpen = () => {
    if (onToggle) {
      onToggle();
    } else {
      setIsOpen(prev => !prev);
    }
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || isLoading) return;

    if (!customText) setInput('');

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat-identify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newHistory })
      });

      const data = await response.json();
      setMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          sender: 'assistant',
          text: data.reply || "I've analyzed that! Always verify claims using lateral reading across independent sources.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      console.error('Global Chat error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          sender: 'assistant',
          text: "I'm experiencing a brief network glitch, but remember: never forward urgent messages without verifying primary sources!",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    "How do I spot a deepfake video?",
    "Is a screenshot proof of truth?",
    "How to report non-consensual deepfakes?",
    "What is lateral reading?"
  ];

  return (
    <>
      {/* Floating Chat Button (Visible on all pages when closed) */}
      {!isOpen && (
        <button
          onClick={toggleOpen}
          aria-label="Open Bytespark AI Chatbot"
          className="fixed bottom-20 right-4 z-50 bg-[#7A1F2B] hover:bg-[#5A131E] text-white p-3.5 rounded-full shadow-lg border-2 border-white flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 group animate-bounce"
        >
          <div className="relative">
            <Bot className="w-6 h-6 text-amber-300" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-white animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-white" />
          </div>
          <span className="hidden sm:inline font-bold text-xs pr-1">AI Assistant</span>
        </button>
      )}

      {/* Expanded Chat Drawer / Widget Container */}
      {isOpen && (
        <div className="fixed inset-x-2 bottom-16 sm:inset-auto sm:bottom-20 sm:right-4 sm:w-96 h-[520px] max-h-[80vh] z-50 bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="bg-[#7A1F2B] text-white p-3.5 px-4 flex items-center justify-between shrink-0 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm tracking-tight">Bytespark AI Assistant</h3>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full uppercase border border-emerald-400/30">
                    24/7 MIL
                  </span>
                </div>
                <p className="text-[10px] text-white/80 font-medium">UNESCO Youth Literacy Guide</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setMessages([
                  {
                    id: 'msg-reset',
                    sender: 'assistant',
                    text: "Chat cleared! How can I assist your media verification today?",
                    timestamp: 'Just now'
                  }
                ])}
                title="Clear Chat History"
                className="p-1.5 hover:bg-white/10 rounded-lg text-white/80 hover:text-white transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={toggleOpen}
                title="Close Assistant"
                className="p-1.5 hover:bg-white/10 rounded-lg text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-slate-50 text-xs">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-6 h-6 rounded-full bg-[#7A1F2B] text-amber-300 flex items-center justify-center shrink-0 mt-1 shadow-xs">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] rounded-2xl p-3 leading-relaxed ${
                      isUser
                        ? 'bg-[#7A1F2B] text-white rounded-br-xs shadow-xs'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs shadow-2xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap font-sans text-xs">{msg.text}</p>
                    <span
                      className={`block text-[9px] mt-1 text-right ${
                        isUser ? 'text-white/70' : 'text-slate-400'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 text-slate-500 text-xs bg-white p-2.5 rounded-2xl border border-slate-200 w-fit">
                <Bot className="w-4 h-4 text-[#7A1F2B] animate-spin" />
                <span className="font-medium text-[11px]">Analyzing with Gemini AI...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompts Carousel */}
          <div className="p-2 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto hide-scrollbar">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(qp)}
                className="shrink-0 bg-slate-100 hover:bg-[#FDF2F4] text-slate-700 hover:text-[#7A1F2B] border border-slate-200 hover:border-[#7A1F2B]/30 rounded-full px-2.5 py-1 text-[10px] font-semibold transition-colors whitespace-nowrap"
              >
                {qp}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask about claims, deepfakes, or legal rights..."
              className="flex-1 bg-slate-100 border border-slate-200 rounded-full px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7A1F2B]/30 focus:border-[#7A1F2B]"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || isLoading}
              className="w-8 h-8 rounded-full bg-[#7A1F2B] hover:bg-[#5A131E] disabled:bg-slate-300 text-white flex items-center justify-center shrink-0 transition-colors shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}
    </>
  );
};
