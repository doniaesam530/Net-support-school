import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

export interface Student {
  id: string;
  name: string;
  email: string;
  class: string;
  status: 'active' | 'online' | 'idle' | 'offline';
}

export interface ChatMessage {
  from: string;
  text: string;
  time: string;
}

export interface LogEntry {
  time: string;
  action: string;
  target: string;
}

export interface QuizQuestion {
  correct_answer: string;
  text: string;
  options: string[];
  correct_answer: string; // ✅ FIX: was missing
}

export interface QuizResult {
  question: string;
  counts: Record<string, number>;
}

interface AppState {
  user: { token: string; role: string; name: string; id: string } | null;
  students: Student[];
  messages: ChatMessage[];
  log: LogEntry[];
  quiz: QuizQuestion[];
  quizResults: QuizResult[];
  blanked: boolean;
  locked: boolean;
  blockInternet: boolean;
  toasts: string[];
  wsConnected: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => void;
  sendCommand: (type: string, target: string, payload?: Record<string, unknown>) => Promise<void>;
  sendChat: (text: string, target?: string) => void;
  createQuiz: (questions: QuizQuestion[]) => Promise<void>;
  submitQuizAnswer: (answers: string[]) => Promise<void>;
  fetchQuizResults: () => Promise<void>;
  fetchStudents: () => Promise<void>;
  fetchSessionLog: () => Promise<void>;
  setBlanked: (v: boolean) => void;
  setLocked: (v: boolean) => void;
  setBlockInternet: (v: boolean) => void;
}

const AppContext = createContext<AppState | null>(null);

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ token: string; role: string; name: string; id: string } | null>(() => {
    const saved = localStorage.getItem('edu_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [students, setStudents] = useState<Student[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [blanked, setBlanked] = useState(false);
  const [locked, setLocked] = useState(false);
  const [blockInternet, setBlockInternet] = useState(false);
  const [toasts, setToasts] = useState<string[]>([]);
  const [wsConnected, setWsConnected] = useState(false);
  const [wsRef, setWsRef] = useState<WebSocket | null>(null);

  const addToast = useCallback((msg: string) => {
    setToasts(prev => [...prev, msg]);
    setTimeout(() => setToasts(prev => prev.slice(1)), 4000);
  }, []);

  const connectWs = useCallback((role: string, id: string) => {
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const url = role === 'tutor'
      ? `${proto}//${window.location.host}/ws/tutor`
      : `${proto}//${window.location.host}/ws/student/${id}`;

    const ws = new WebSocket(url);

    ws.onopen = () => setWsConnected(true);
    ws.onclose = () => setWsConnected(false);

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      switch (data.type) {
        case 'STATUS_UPDATE': {
          const updates = data.payload.updates || [data.payload];
          setStudents(prev => prev.map(s => {
            const u = updates.find((up: { id: string; status: string }) => up.id === s.id);
            return u ? { ...s, status: u.status as Student['status'] } : s;
          }));
          break;
        }
        case 'STUDENT_JOIN':
          setStudents(prev => prev.map(s =>
            s.id === data.payload.id ? { ...s, status: 'online' as const } : s
          ));
          break;
        case 'CHAT':
          setMessages(prev => [...prev, data.payload as ChatMessage]);
          break;
        case 'BLANK_SCREEN':
          setBlanked(true);
          break;
        case 'UNLOCK':
          setBlanked(false);
          setLocked(false);
          break;
        case 'LOCK_INPUT':
          setLocked(true);
          break;
        case 'BROADCAST_MSG':
          addToast(data.payload.text || data.payload.message || 'Broadcast from tutor');
          break;
        case 'BLOCK_NET':
          setBlockInternet(true);
          break;
        case 'UNBLOCK_NET':
          setBlockInternet(false);
          break;
        case 'QUIZ_PUSH':
          fetch('/api/quiz').then(r => r.json()).then(d => {
            setQuiz(d.questions || []);
          });
          break;
        case 'QUIZ_ANSWER':
          break;
        case 'COMMAND_LOG':
          setLog(prev => [data.payload as LogEntry, ...prev]);
          break;
      }
    };

    setWsRef(ws);
    return ws;
  }, [addToast]);

  useEffect(() => {
    if (user) {
      const ws = connectWs(user.role, user.id);
      return () => {
        ws.close();
        setWsRef(null);
      };
    }
  }, [user?.token]);

  const login = async (email: string, password: string): Promise<string | null> => {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.error) return data.error;
    const userData = { token: data.token, role: data.role, name: data.name, id: data.id };
    setUser(userData);
    localStorage.setItem('edu_user', JSON.stringify(userData));
    return null;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('edu_user');
    setMessages([]);
    setLog([]);
    setQuiz([]);
    setQuizResults([]);
    setBlanked(false);
    setLocked(false);
    setBlockInternet(false);
    if (wsRef) wsRef.close();
  };

  const sendCommand = async (type: string, target: string, payload: Record<string, unknown> = {}) => {
    await fetch('/api/command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, target, payload }),
    });
  };

  const sendChat = (text: string, target: string = 'all') => {
    if (wsRef && wsRef.readyState === WebSocket.OPEN) {
      wsRef.send(JSON.stringify({ type: 'CHAT', target, payload: { text } }));
    }
    setMessages(prev => [...prev, { from: user?.name || 'Me', text, time: new Date().toLocaleTimeString('en-US', { hour12: false }) }]);
  };

  const createQuiz = async (questions: QuizQuestion[]) => {
    await fetch('/api/quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questions }),
    });
    setQuiz(questions);
    await sendCommand('QUIZ_PUSH', 'all');
  };

  const submitQuizAnswer = async (answers: string[]) => {
    if (!user) return;
    await fetch('/api/quiz/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: user.id, answers }),
    });
    if (wsRef && wsRef.readyState === WebSocket.OPEN) {
      wsRef.send(JSON.stringify({ type: 'QUIZ_ANSWER', payload: { answers } }));
    }
  };

  // ✅ FIX: كانت بتجيب من /api/quiz/scores وبترجع { students: [] }
  //         الصح هو /api/quiz/results اللي بترجع { questions: [...] } مع counts
  const fetchQuizResults = async () => {
    const res = await fetch('/api/quiz/results');
    const data = await res.json();
    setQuizResults(data.questions || []); // ✅ data.questions موجودة في /api/quiz/results
  };

  const fetchStudents = async () => {
    const res = await fetch('/api/students');
    const data = await res.json();
    setStudents(data);
  };

  const fetchSessionLog = async () => {
    const res = await fetch('/api/session-log');
    const data = await res.json();
    setLog(data);
  };

  return (
    <AppContext.Provider
      value={{
        user, students, messages, log, quiz, quizResults,
        blanked, locked, blockInternet, toasts, wsConnected,
        login, logout, sendCommand, sendChat,
        createQuiz, submitQuizAnswer, fetchQuizResults,
        fetchStudents, fetchSessionLog,
        setBlanked, setLocked, setBlockInternet,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}