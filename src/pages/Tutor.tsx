import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import type { Student, QuizQuestion } from '../context/AppContext';
import {
  Monitor, Lock, Unlock, MessageSquare, Wifi, WifiOff,
  Eye, EyeOff, Send, X, LogOut, Clock, Users, MessageCircle,
  ClipboardList, ScrollText, Plus, BarChart3
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Tutor() {
  const {
    user, students, messages, log, quizResults,
    wsConnected, sendCommand, sendChat,
    createQuiz, fetchQuizResults, fetchStudents, fetchSessionLog, logout,
  } = useApp();

  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'quiz' | 'log'>('chat');
  const [chatInput, setChatInput] = useState('');
  const [privateChatInput, setPrivateChatInput] = useState('');
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [broadcastText, setBroadcastText] = useState('');
  const [blockInternet, setBlockInternetLocal] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [newQ, setNewQ] = useState({ text: '', options: ['', '', '', ''] });
  const [quizSent, setQuizSent] = useState(false);
  const [classes, setClasses] = useState<string[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const privateChatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchStudents();
    fetchSessionLog();
    fetch('/api/classes').then(r => r.json()).then(setClasses);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setSessionTime(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    privateChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedStudent]);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600).toString().padStart(2, '0');
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${h}:${m}:${sec}`;
  };

  const filteredStudents = selectedClass === 'All'
    ? students
    : students.filter(s => s.class === selectedClass);

  const onlineCount = students.filter(s => s.status === 'online').length;

  const handleBlankAll = () => sendCommand('BLANK_SCREEN', 'all');
  const handleUnlockAll = () => sendCommand('UNLOCK', 'all');
  const handleLockAll = () => sendCommand('LOCK_INPUT', 'all');
  const handleBroadcast = () => {
    if (!broadcastText.trim()) return;
    sendCommand('BROADCAST_MSG', 'all', { text: broadcastText });
    setShowBroadcast(false);
    setBroadcastText('');
  };
  const handleToggleInternet = () => {
    const next = !blockInternet;
    setBlockInternetLocal(next);
    sendCommand(next ? 'BLOCK_NET' : 'UNBLOCK_NET', 'all');
  };

  const handleAddQuestion = () => {
    if (!newQ.text.trim() || newQ.options.some(o => !o.trim())) return;
    setQuizQuestions(prev => [...prev, { text: newQ.text, options: newQ.options.filter(o => o.trim()) }]);
    setNewQ({ text: '', options: ['', '', '', ''] });
  };

  const handleSendQuiz = async () => {
    if (quizQuestions.length === 0) return;
    await createQuiz(quizQuestions);
    setQuizSent(true);
    setTimeout(() => fetchQuizResults(), 2000);
  };

  const statusColor = (s: string) =>
    s === 'online' ? 'bg-emerald-400' : s === 'idle' ? 'bg-amber-400' : 'bg-red-400';

  const statusBadge = (s: string) =>
    s === 'online' ? 'bg-emerald-500/20 text-emerald-400' : s === 'idle' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400';

  const privateMessages = selectedStudent
    ? messages.filter(m => m.from === selectedStudent.id || m.from === user?.name)
    : [];

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-white overflow-hidden">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800 shrink-0">
        <div className="flex items-center gap-3">
          <Monitor className="w-5 h-5 text-blue-500" />
          <span className="font-bold text-lg">EduControl</span>
          <span className="text-xs text-gray-500 border-l border-gray-700 pl-3 ml-1">Tutor Dashboard</span>
        </div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-1.5 text-xs ${wsConnected ? 'text-emerald-400' : 'text-red-400'}`}>
            <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-emerald-400' : 'bg-red-400'}`} />
            {wsConnected ? 'Connected' : 'Disconnected'}
          </div>
          <span className="text-sm text-gray-400">{user?.name}</span>
          <button onClick={logout} className="p-1.5 hover:bg-gray-800 rounded-lg transition" title="Logout">
            <LogOut className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT SIDEBAR */}
        <aside className="w-52 bg-gray-900 border-r border-gray-800 flex flex-col shrink-0">
          <div className="p-3 border-b border-gray-800">
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Classes</option>
              {classes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {filteredStudents.map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedStudent(s)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition text-left ${
                  selectedStudent?.id === s.id ? 'bg-blue-600/20 text-blue-300' : 'hover:bg-gray-800 text-gray-300'
                }`}
              >
                <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${statusColor(s.status)}`} />
                <span className="truncate">{s.name}</span>
              </button>
            ))}
          </div>
          <div className="p-3 border-t border-gray-800 text-xs text-gray-500">
            {filteredStudents.length} students
          </div>
        </aside>

        {/* CENTER */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* ACTION BAR */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-900/50 border-b border-gray-800 shrink-0 flex-wrap">
            <button onClick={handleBlankAll} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition">
              <EyeOff className="w-3.5 h-3.5" /> Blank All
            </button>
            <button onClick={handleUnlockAll} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition">
              <Unlock className="w-3.5 h-3.5" /> Unlock All
            </button>
            <button onClick={handleLockAll} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition">
              <Lock className="w-3.5 h-3.5" /> Lock All
            </button>
            <button onClick={() => setShowBroadcast(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition">
              <MessageSquare className="w-3.5 h-3.5" /> Broadcast
            </button>
            <button onClick={handleToggleInternet} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition ${
              blockInternet ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30' : 'bg-gray-800 hover:bg-gray-700'
            }`}>
              {blockInternet ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
              {blockInternet ? 'Unblock Internet' : 'Block Internet'}
            </button>
            <div className="ml-auto flex items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Session: {formatTime(sessionTime)}</span>
              <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Connected: {onlineCount}/{students.length}</span>
            </div>
          </div>

          {/* STUDENT GRID */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {filteredStudents.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedStudent(s)}
                  className={`bg-gray-900 rounded-xl border p-3 text-left transition hover:border-gray-600 ${
                    selectedStudent?.id === s.id ? 'border-blue-500' : 'border-gray-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium truncate">{s.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${statusBadge(s.status)}`}>
                      {s.status}
                    </span>
                  </div>
                  <div className={`h-20 rounded-lg flex items-center justify-center ${
                    s.status === 'online'
                      ? 'bg-gradient-to-br from-gray-700 to-gray-800 animate-pulse'
                      : s.status === 'idle'
                      ? 'bg-gradient-to-br from-gray-800 to-gray-850'
                      : 'bg-gray-800/50'
                  }`}>
                    <Monitor className={`w-6 h-6 ${s.status === 'offline' ? 'text-gray-700' : 'text-gray-500'}`} />
                  </div>
                  <div className="mt-2 text-[10px] text-gray-500">{s.class}</div>
                </button>
              ))}
            </div>
          </div>

          {/* BOTTOM TABS */}
          <div className="border-t border-gray-800 bg-gray-900 shrink-0" style={{ height: '260px' }}>
            <div className="flex border-b border-gray-800">
              {(['chat', 'quiz', 'log'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition border-b-2 ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {tab === 'chat' && <MessageCircle className="w-3.5 h-3.5" />}
                  {tab === 'quiz' && <ClipboardList className="w-3.5 h-3.5" />}
                  {tab === 'log' && <ScrollText className="w-3.5 h-3.5" />}
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className="h-[calc(100%-41px)] overflow-hidden">
              {/* CHAT TAB */}
              {activeTab === 'chat' && (
                <div className="h-full flex flex-col">
                  <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {messages.map((m, i) => (
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
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                  <div className="flex gap-2 p-2 border-t border-gray-800">
                    <input
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && chatInput.trim()) { sendChat(chatInput); setChatInput(''); } }}
                      placeholder="Type a message..."
                      className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => { if (chatInput.trim()) { sendChat(chatInput); setChatInput(''); } }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* QUIZ TAB */}
              {activeTab === 'quiz' && (
                <div className="h-full overflow-y-auto p-3">
                  {!quizSent ? (
                    <div>
                      <div className="mb-3">
                        <input
                          value={newQ.text}
                          onChange={e => setNewQ(prev => ({ ...prev, text: e.target.value }))}
                          placeholder="Question text..."
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 mb-2"
                        />
                        {newQ.options.map((opt, i) => (
                          <input
                            key={i}
                            value={opt}
                            onChange={e => {
                              const next = [...newQ.options];
                              next[i] = e.target.value;
                              setNewQ(prev => ({ ...prev, options: next }));
                            }}
                            placeholder={`Option ${String.fromCharCode(65 + i)}`}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 mb-1.5"
                          />
                        ))}
                        <button onClick={handleAddQuestion} className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition mt-1">
                          <Plus className="w-3.5 h-3.5" /> Add Question
                        </button>
                      </div>

                      {quizQuestions.length > 0 && (
                        <div className="mb-3 space-y-2">
                          <p className="text-xs text-gray-400 font-medium">Questions added:</p>
                          {quizQuestions.map((q, i) => (
                            <div key={i} className="bg-gray-800/50 rounded-lg p-2 text-sm">
                              <span className="text-gray-300">{i + 1}. {q.text}</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {q.options.map((o, j) => (
                                  <span key={j} className="text-[10px] bg-gray-700 px-2 py-0.5 rounded">{o}</span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {quizQuestions.length > 0 && (
                        <button onClick={handleSendQuiz} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition">
                          <Send className="w-3.5 h-3.5" /> Send Quiz to All
                        </button>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm text-emerald-400 font-medium">Quiz sent! Live results:</p>
                        <button
                          onClick={() => { fetchQuizResults(); }}
                          className="flex items-center gap-1 px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs transition"
                        >
                          <BarChart3 className="w-3 h-3" /> Refresh
                        </button>
                      </div>
                      {quizResults.length === 0 ? (
                        <p className="text-xs text-gray-500">Waiting for answers...</p>
                      ) : (
                        <div className="space-y-4">
                          {quizResults.map((qr, i) => (
                            <div key={i}>
                              <p className="text-xs text-gray-400 mb-1">{i + 1}. {qr.question}</p>
                              <div className="h-28">
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={Object.entries(qr.counts).map(([name, value]) => ({ name, value }))}>
                                    <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                                    <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} allowDecimals={false} />
                                    <Tooltip
                                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                                      labelStyle={{ color: '#e5e7eb' }}
                                    />
                                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                      {Object.entries(qr.counts).map((_, j) => (
                                        <Cell key={j} fill={CHART_COLORS[j % CHART_COLORS.length]} />
                                      ))}
                                    </Bar>
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* LOG TAB */}
              {activeTab === 'log' && (
                <div className="h-full overflow-y-auto p-3 space-y-1">
                  {log.length === 0 ? (
                    <p className="text-xs text-gray-500">No actions logged yet.</p>
                  ) : (
                    log.map((entry, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs py-1">
                        <span className="text-gray-500 font-mono shrink-0">[{entry.time}]</span>
                        <span className="text-gray-300">{entry.action}</span>
                        {entry.target !== 'all' && <span className="text-gray-500">→ {entry.target}</span>}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </main>

        {/* RIGHT SLIDE-OVER */}
        {selectedStudent && (
          <aside className="w-72 bg-gray-900 border-l border-gray-800 flex flex-col shrink-0 animate-in slide-in-from-right">
            <div className="flex items-center justify-between p-3 border-b border-gray-800">
              <div>
                <h3 className="font-medium text-sm">{selectedStudent.name}</h3>
                <p className="text-[10px] text-gray-500">{selectedStudent.email}</p>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="p-1 hover:bg-gray-800 rounded transition">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <div className="p-3 space-y-3 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusBadge(selectedStudent.status)}`}>
                  {selectedStudent.status}
                </span>
                <span className="text-xs text-gray-500">{selectedStudent.class}</span>
              </div>

              <div className="h-32 bg-gradient-to-br from-gray-800 to-gray-850 rounded-lg flex items-center justify-center">
                <Eye className="w-8 h-8 text-gray-600" />
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => sendCommand('BROADCAST_MSG', selectedStudent.id, { text: 'Check your screen' })}
                  className="flex items-center justify-center gap-1 px-2 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs transition"
                >
                  <MessageSquare className="w-3 h-3" /> Message
                </button>
                <button
                  onClick={() => sendCommand('LOCK_INPUT', selectedStudent.id)}
                  className="flex items-center justify-center gap-1 px-2 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs transition"
                >
                  <Lock className="w-3 h-3" /> Lock
                </button>
                <button
                  onClick={() => sendCommand('BLANK_SCREEN', selectedStudent.id)}
                  className="flex items-center justify-center gap-1 px-2 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs transition"
                >
                  <EyeOff className="w-3 h-3" /> Blank
                </button>
                <button
                  onClick={() => sendCommand('UNLOCK', selectedStudent.id)}
                  className="flex items-center justify-center gap-1 px-2 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs transition"
                >
                  <Unlock className="w-3 h-3" /> Unlock
                </button>
              </div>
            </div>

            {/* Private chat */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="px-3 py-2 text-xs font-medium text-gray-400 border-b border-gray-800">Private Chat</div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {privateMessages.map((m, i) => (
                  <div key={i} className={`flex ${m.from === user?.name ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] px-2.5 py-1.5 rounded-xl text-xs ${
                      m.from === user?.name
                        ? 'bg-blue-600 text-white rounded-br-sm'
                        : 'bg-gray-800 text-gray-200 rounded-bl-sm'
                    }`}>
                      {m.text}
                      <div className="text-[9px] opacity-50 mt-0.5">{m.time}</div>
                    </div>
                  </div>
                ))}
                <div ref={privateChatEndRef} />
              </div>
              <div className="flex gap-1.5 p-2 border-t border-gray-800">
                <input
                  value={privateChatInput}
                  onChange={e => setPrivateChatInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && privateChatInput.trim()) {
                      sendChat(privateChatInput, selectedStudent.id);
                      setPrivateChatInput('');
                    }
                  }}
                  placeholder="Message student..."
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  onClick={() => {
                    if (privateChatInput.trim()) {
                      sendChat(privateChatInput, selectedStudent.id);
                      setPrivateChatInput('');
                    }
                  }}
                  className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                >
                  <Send className="w-3 h-3" />
                </button>
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* BROADCAST MODAL */}
      {showBroadcast && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowBroadcast(false)}>
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-gray-800 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Broadcast Message</h3>
            <textarea
              value={broadcastText}
              onChange={e => setBroadcastText(e.target.value)}
              placeholder="Type your broadcast message..."
              className="w-full h-32 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowBroadcast(false)} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition">Cancel</button>
              <button onClick={handleBroadcast} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition">Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
