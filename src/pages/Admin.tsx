import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users, Activity, BookOpen, Wifi, Search, Plus, Trash2, LogOut, Monitor
} from 'lucide-react';

interface SessionLogEntry {
  date: string;
  tutor: string;
  class_name: string;
  duration: string;
  actions: number;
}

const MOCK_SESSION_LOG: SessionLogEntry[] = [
  { date: '2026-04-27 09:00', tutor: 'Prof. Anderson', class_name: 'CS101', duration: '01:15:00', actions: 24 },
  { date: '2026-04-26 14:00', tutor: 'Prof. Anderson', class_name: 'Math202', duration: '00:45:00', actions: 12 },
  { date: '2026-04-25 10:30', tutor: 'Prof. Anderson', class_name: 'Physics301', duration: '01:00:00', actions: 18 },
  { date: '2026-04-24 09:00', tutor: 'Prof. Anderson', class_name: 'CS101', duration: '01:30:00', actions: 31 },
  { date: '2026-04-23 11:00', tutor: 'Prof. Anderson', class_name: 'Math202', duration: '00:50:00', actions: 9 },
];

export default function Admin() {
  const { user, students, fetchStudents, logout } = useApp();
  const [classes, setClasses] = useState<string[]>([]);
  const [newClass, setNewClass] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchStudents();
    fetch('/api/classes').then(r => r.json()).then(setClasses);
  }, []);

  const onlineCount = students.filter(s => s.status === 'online').length;

  const addClass = () => {
    if (!newClass.trim() || classes.includes(newClass.trim())) return;
    setClasses(prev => [...prev, newClass.trim()]);
    setNewClass('');
  };

  const removeClass = (name: string) => {
    setClasses(prev => prev.filter(c => c !== name));
  };

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    s.class.toLowerCase().includes(search.toLowerCase())
  );

  const classStudentCount = (cls: string) => students.filter(s => s.class === cls).length;

  const statusBadge = (s: string) =>
    s === 'online' ? 'bg-emerald-500/20 text-emerald-400' : s === 'idle' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400';

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* HEADER */}
      <header className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Monitor className="w-5 h-5 text-blue-500" />
          <span className="font-bold text-lg">EduControl</span>
          <span className="text-xs text-gray-500 border-l border-gray-700 pl-3 ml-1">Admin Panel</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">{user?.name}</span>
          <button onClick={logout} className="p-1.5 hover:bg-gray-800 rounded-lg transition" title="Logout">
            <LogOut className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* STAT CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Students', value: students.length, icon: Users, color: 'text-blue-400 bg-blue-500/10' },
            { label: 'Active Sessions', value: onlineCount, icon: Activity, color: 'text-emerald-400 bg-emerald-500/10' },
            { label: 'Classes', value: classes.length, icon: BookOpen, color: 'text-amber-400 bg-amber-500/10' },
            { label: 'Online Now', value: onlineCount, icon: Wifi, color: 'text-teal-400 bg-teal-500/10' },
          ].map(stat => (
            <div key={stat.label} className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">{stat.label}</span>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-4.5 h-4.5" />
                </div>
              </div>
              <p className="text-3xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* STUDENTS TABLE */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
            <h2 className="font-semibold">Students</h2>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search students..."
                className="pl-9 pr-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 w-56"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase tracking-wider border-b border-gray-800">
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Class</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(s => (
                  <tr key={s.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition">
                    <td className="px-5 py-3 font-medium">{s.name}</td>
                    <td className="px-5 py-3 text-gray-400">{s.email}</td>
                    <td className="px-5 py-3 text-gray-400">{s.class}</td>
                    <td className="px-5 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusBadge(s.status)}`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CLASSES TABLE */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
            <h2 className="font-semibold">Classes</h2>
            <div className="flex gap-2">
              <input
                value={newClass}
                onChange={e => setNewClass(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addClass(); }}
                placeholder="New class name..."
                className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 w-44"
              />
              <button onClick={addClass} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition">
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase tracking-wider border-b border-gray-800">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Student Count</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {classes.map(c => (
                <tr key={c} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition">
                  <td className="px-5 py-3 font-medium">{c}</td>
                  <td className="px-5 py-3 text-gray-400">{classStudentCount(c)}</td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => removeClass(c)} className="p-1.5 hover:bg-red-500/10 rounded-lg transition" title="Delete class">
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* SESSION LOG TABLE */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800">
            <h2 className="font-semibold">Session Log</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase tracking-wider border-b border-gray-800">
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Tutor</th>
                  <th className="px-5 py-3">Class</th>
                  <th className="px-5 py-3">Duration</th>
                  <th className="px-5 py-3">Actions Count</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_SESSION_LOG.map((entry, i) => (
                  <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition">
                    <td className="px-5 py-3 text-gray-400">{entry.date}</td>
                    <td className="px-5 py-3">{entry.tutor}</td>
                    <td className="px-5 py-3 text-gray-400">{entry.class_name}</td>
                    <td className="px-5 py-3 text-gray-400 font-mono">{entry.duration}</td>
                    <td className="px-5 py-3 text-gray-400">{entry.actions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
