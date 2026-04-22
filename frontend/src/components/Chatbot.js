import { useState, useRef, useEffect } from 'react';
import api from '../api';
import { MessageCircle, X, Send, Bot, User, Minimize2 } from 'lucide-react';

const QUICK_PROMPTS = [
  'Show available rooms',
  'My bookings',
  'Upcoming events',
  'How to book a room',
  'About Bennett University',
];

const formatMessage = text =>
  text.split('\n').map((line, i) => {
    const bold = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return <p key={i} className={line === '' ? 'mt-1' : ''} dangerouslySetInnerHTML={{ __html: bold }} />;
  });

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: "Hi! I'm CampusBot 🤖\nYour Bennett University assistant.\n\nAsk me about rooms, bookings, events, or anything campus-related!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput('');
    setMessages(prev => [...prev, { from: 'user', text: msg }]);
    setLoading(true);
    try {
      const { data } = await api.post('/chatbot', { message: msg });
      setMessages(prev => [...prev, { from: 'bot', text: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { from: 'bot', text: 'Sorry, something went wrong. Please try again!' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button onClick={() => { setOpen(true); setMinimized(false); }}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white transition-transform hover:scale-110"
          style={{ background: 'linear-gradient(135deg, #c8102e, #9b0a23)' }}>
          <MessageCircle size={26} />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white" />
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div className={`fixed bottom-6 right-6 z-50 w-80 sm:w-96 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-white/10 transition-all duration-300 ${minimized ? 'h-14' : 'h-[520px]'}`}
          style={{ background: '#1a1a2e' }}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 shrink-0"
            style={{ background: 'linear-gradient(135deg, #c8102e, #9b0a23)' }}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot size={18} className="text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">CampusBot</p>
                <p className="text-red-200 text-xs">Bennett University Assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setMinimized(!minimized)} className="p-1.5 hover:bg-white/20 rounded-lg text-white">
                <Minimize2 size={15} />
              </button>
              <button onClick={() => setOpen(false)} className="p-1.5 hover:bg-white/20 rounded-lg text-white">
                <X size={15} />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: '#16213e' }}>
                {messages.map((msg, i) => (
                  <div key={i} className={`flex items-end gap-2 ${msg.from === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0
                      ${msg.from === 'bot' ? 'bg-red-700' : 'bg-blue-600'}`}>
                      {msg.from === 'bot' ? <Bot size={14} className="text-white" /> : <User size={14} className="text-white" />}
                    </div>
                    <div className={`max-w-[78%] px-3 py-2 rounded-2xl text-xs leading-relaxed space-y-0.5
                      ${msg.from === 'bot'
                        ? 'bg-white/10 text-slate-200 rounded-bl-sm'
                        : 'text-white rounded-br-sm'}`}
                      style={msg.from === 'user' ? { background: 'linear-gradient(135deg, #c8102e, #9b0a23)' } : {}}>
                      {formatMessage(msg.text)}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex items-end gap-2">
                    <div className="w-7 h-7 rounded-full bg-red-700 flex items-center justify-center">
                      <Bot size={14} className="text-white" />
                    </div>
                    <div className="bg-white/10 px-4 py-3 rounded-2xl rounded-bl-sm">
                      <div className="flex gap-1">
                        {[0, 1, 2].map(i => (
                          <div key={i} className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                            style={{ animationDelay: `${i * 0.15}s` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Quick prompts */}
              <div className="px-3 py-2 flex gap-1.5 overflow-x-auto shrink-0 scrollbar-hide" style={{ background: '#16213e', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                {QUICK_PROMPTS.map(p => (
                  <button key={p} onClick={() => sendMessage(p)}
                    className="shrink-0 text-xs px-2.5 py-1 rounded-full border border-white/20 text-slate-300 hover:bg-white/10 whitespace-nowrap transition-colors">
                    {p}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div className="px-3 py-3 flex gap-2 shrink-0" style={{ background: '#1a1a2e', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <input
                  className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  placeholder="Ask me anything..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  disabled={loading}
                />
                <button onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white disabled:opacity-40 transition-all hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #c8102e, #9b0a23)' }}>
                  <Send size={15} />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
