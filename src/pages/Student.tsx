import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Monitor, Lock, Send, CheckCircle, Wifi, WifiOff, LogOut } from 'lucide-react';

export default function Student() {
  const {
    user, messages, quiz, blanked, locked, blockInternet, toasts,
    wsConnected, sendChat, submitQuizAnswer, logout,
  } = useApp();

  const [chatInput, setChatInput] = useState('');
  const [quizAnswers, setQuizAnswers] = useState<string[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (quiz.length > 0) {
      setQuizAnswers(new Array(quiz.length).fill(''));
      setQuizSubmitted(false);
    }
  }, [quiz]);

  const handleSubmitQuiz = async () => {
    await submitQuizAnswer(quizAnswers);
    setQuizSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white relative">
      {/* BLANK SCREEN OVERLAY */}
      {blanked && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <div className="text-center">
            <Monitor className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-xl text-gray-400">Screen blanked by tutor</p>
            <p className="text-sm text-gray-600 mt-2">Wait for the tutor to unlock your screen</p>
          </div>
        </div>
      )}

      {/* LOCK BANNER */}
      {locked && !blanked && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-red-600 text-white text-center py-2 text-sm font-medium flex items-center justify-center gap-2">
          <Lock className="w-4 h-4" /> Input Locked by Tutor
        </div>
      )}

      {/* TOASTS */}
      {toasts.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50 space-y-2">
          {toasts.map((t, i) => (
            <div key={i} className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm shadow-xl max-w-xs animate-in slide-in-from-right">
              {t}
            </div>
          ))}
        </div>
      )}

      {/* HEADER */}
      <header className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <Monitor className="w-5 h-5 text-blue-500" />
          <span className="font-bold">EduControl</span>
          <span className="text-xs text-gray-500 border-l border-gray-700 pl-3 ml-1">Student View</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs">
            {blockInternet ? (
              <span className="flex items-center gap-1 text-red-400"><WifiOff className="w-3.5 h-3.5" /> Internet Blocked</span>
            ) : (
              <span className="flex items-center gap-1 text-emerald-400"><Wifi className="w-3.5 h-3.5" /> Connected</span>
            )}
          </div>
          <span className="text-sm text-gray-400">{user?.name}</span>
          <button onClick={logout} className="p-1.5 hover:bg-gray-800 rounded-lg transition" title="Logout">
            <LogOut className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto p-6 space-y-6">
        {/* STATUS */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${wsConnected ? 'bg-emerald-400' : 'bg-red-400'}`} />
            <h2 className="text-lg font-semibold">Class: CS101</h2>
            <span className={`text-xs px-2 py-0.5 rounded-full ${wsConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
              {wsConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* QUIZ PANEL */}
        {quiz.length > 0 && !quizSubmitted && (
          <div className="bg-gray-900 rounded-2xl p-6 border border-blue-500/30">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-400" /> Quiz from Tutor
            </h3>
            <div className="space-y-4">
              {quiz.map((q, qi) => (
                <div key={qi} className="bg-gray-800/50 rounded-xl p-4">
                  <p className="text-sm font-medium mb-3">{qi + 1}. {q.text}</p>
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => (
                      <label key={oi} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="radio"
                          name={`q-${qi}`}
                          checked={quizAnswers[qi] === opt}
                          onChange={() => {
                            const next = [...quizAnswers];
                            next[qi] = opt;
                            setQuizAnswers(next);
                          }}
                          className="w-4 h-4 text-blue-500 focus:ring-blue-500 border-gray-600 bg-gray-700"
                        />
                        <span className="text-sm text-gray-300 group-hover:text-white transition">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={handleSubmitQuiz}
              disabled={quizAnswers.some(a => !a)}
              className="mt-4 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 rounded-lg text-sm font-medium transition"
            >
              Submit Answers
            </button>
          </div>
        )}

        {quizSubmitted && (
          <div className="bg-gray-900 rounded-2xl p-6 border border-emerald-500/30 text-center">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <p className="text-lg font-medium text-emerald-400">Answers submitted!</p>
            <p className="text-sm text-gray-500 mt-1">Wait for the tutor to review results</p>
          </div>
        )}

        {/* CHAT */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800 text-sm font-medium text-gray-300">Chat with Tutor</div>
          <div className="h-48 overflow-y-auto p-4 space-y-2">
            {messages.length === 0 ? (
              <p className="text-xs text-gray-600 text-center py-8">No messages yet</p>
            ) : (
              messages.map((m, i) => (
                <div key={i} className={`flex ${m.from === user?.name ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] px-3 py-1.5 rounded-xl text-sm ${
                    m.from === user?.name
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-gray-800 text-gray-200 rounded-bl-sm'
                  }`}>
                    {m.from !== user?.name && <div className="text-[10px] text-gray-400 mb-0.5">{m.from}</div>}
                    {m.text}
                    <div className="text-[10px] opacity-50 mt-0.5">{m.time}</div>
                  </div>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>
          <div className="flex gap-2 p-3 border-t border-gray-800">
            <input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && chatInput.trim()) { sendChat(chatInput); setChatInput(''); } }}
              placeholder="Type a message..."
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              onClick={() => { if (chatInput.trim()) { sendChat(chatInput); setChatInput(''); } }}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
