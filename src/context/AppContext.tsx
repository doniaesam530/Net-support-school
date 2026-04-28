import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

export interface Student {
  id: string;
  name: string;
  email: string;
  class: string;
  status: 'online' | 'idle' | 'offline';
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
  text: string;
  options: string[];
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

