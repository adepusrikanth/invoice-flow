'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Loader2 } from 'lucide-react';

type Message = { role: 'user' | 'assistant'; content: string };

const DEFAULT_SUGGESTIONS = [
  'What is my total outstanding?',
  'How many invoices do I have?',
  'What is my total revenue?',
  'Revenue from a specific client?',
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>(DEFAULT_SUGGESTIONS);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setInput('');
    setMessages((m) => [...m, { role: 'user', content: trimmed }]);
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      setMessages((m) => [...m, { role: 'assistant', content: data.answer }]);
      if (Array.isArray(data.suggestions) && data.suggestions.length) setSuggestions(data.suggestions);
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: err instanceof Error ? err.message : 'Something went wrong. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-3xl mx-auto">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
          <MessageSquare className="w-7 h-7 text-brand-primary" aria-hidden />
          Invoice Q&A
        </h1>
        <p className="text-neutral-500 text-sm mt-1">
          Ask questions about your invoices. Answers are in INR (e.g. &quot;What is total revenue from Client A in the last quarter?&quot;).
        </p>
      </div>
      <div className="flex-1 rounded-card bg-white border border-neutral-200 shadow-sm flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <p className="font-medium text-neutral-700 mb-3">Ask anything about your invoices</p>
              <p className="text-sm text-neutral-500 mb-4">Try one of these or type your own:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => sendMessage(s)}
                    className="px-3 py-2 rounded-button bg-neutral-100 hover:bg-brand-tertiary/40 text-neutral-700 hover:text-brand-primary text-sm font-medium border border-neutral-200 hover:border-brand-primary/30 transition"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              role="article"
              aria-label={msg.role === 'user' ? 'Your message' : 'Assistant reply'}
            >
              <div
                className={`max-w-[85%] rounded-button px-4 py-2.5 text-sm ${
                  msg.role === 'user'
                    ? 'bg-brand-primary text-white'
                    : 'bg-neutral-100 text-neutral-900 border border-neutral-200'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-button px-4 py-2.5 bg-neutral-100 border border-neutral-200 flex items-center gap-2 text-neutral-600">
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                <span>Thinking…</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        {suggestions.length > 0 && messages.length > 0 && !loading && (
          <div className="px-4 pb-2 flex flex-wrap gap-2">
            <span className="text-xs text-neutral-500 self-center mr-1">Suggestions:</span>
            {suggestions.slice(0, 3).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => sendMessage(s)}
                className="px-2.5 py-1.5 rounded-button bg-neutral-50 hover:bg-brand-tertiary/30 text-neutral-600 hover:text-brand-primary text-xs border border-neutral-200 transition"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        <form onSubmit={handleSubmit} className="p-4 border-t border-neutral-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your invoices…"
              className="flex-1 px-4 py-2.5 rounded-button border border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
              disabled={loading}
              aria-label="Your question"
              maxLength={2000}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 py-2.5 rounded-button bg-brand-primary text-white font-medium hover:bg-brand-primary/90 disabled:opacity-50 disabled:pointer-events-none inline-flex items-center gap-2"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
