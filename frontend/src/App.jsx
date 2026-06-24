import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Sun, Moon, Plus, Trash2, Search, Filter, 
  ArrowUpDown, Loader2, CheckCircle, Clock, 
  AlertCircle, Briefcase, LayoutGrid, ListTodo
} from 'lucide-react';
import Notification from './components/Notification.jsx';

const API_URL = 'http://localhost:5000/api/tasks';

export default function App() {
  // Core State
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  // Search, Filter & Sort State
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  
  // Theme State (Persisted in Local Storage)
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');

  // UI States (Toasts & Modals)
  const [toast, setToast] = useState({ message: '', type: '' });
  const [modal, setModal] = useState({ isOpen: false, taskId: null });

  // Handle Dark Mode Sync
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Fetch Tasks with query options from Server API
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL, {
        params: { search: searchQuery, status: statusFilter, sort: sortOrder }
      });
      setTasks(response.data);
    } catch (err) {
      showToast(err.response?.data?.message || 'Centralized Error Handled: Server unreachable.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch whenever Search, Filter, or Sort parameters change
  useEffect(() => {
    fetchTasks();
  }, [searchQuery, statusFilter, sortOrder]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 4000);
  };

  // Client-Side Validation and Creation
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      showToast('Client Validation Error: Title & Description cannot be empty spaces!', 'error');
      return;
    }

    try {
      const response = await axios.post(API_URL, { title, description });
      setTasks([response.data, ...tasks]);
      setTitle('');
      setDescription('');
      showToast('Task added to management scope.');
      fetchTasks();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to sync task generation.', 'error');
    }
  };

  // Cycle task status forward sequentially
  const handleUpdateStatus = async (id, currentStatus) => {
    const nextStatusMap = { 'Pending': 'In Progress', 'In Progress': 'Completed', 'Completed': 'Pending' };
    const nextStatus = nextStatusMap[currentStatus];

    try {
      await axios.put(`${API_URL}/${id}`, { status: nextStatus });
      showToast(`Status updated to ${nextStatus}`);
      fetchTasks();
    } catch (err) {
      showToast('Failed to patch status updates.', 'error');
    }
  };

  const triggerDeleteConfirmation = (id) => {
    setModal({ isOpen: true, taskId: id });
  };

  const handleDeleteTask = async () => {
    try {
      await axios.delete(`${API_URL}/${modal.taskId}`);
      showToast('Project task has been permanently dropped.', 'success');
      setModal({ isOpen: false, taskId: null });
      fetchTasks();
    } catch (err) {
      showToast('Failed to handle target elimination.', 'error');
    }
  };

  // Calculate Dashboard Statistics metrics dynamically
  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter(t => t.status === 'Pending').length;
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;

  return (
    <div className="min-h-screen bg-[url('https://media.istockphoto.com/id/1801272559/photo/business-development-decide-and-choose-concept-hand-stack-woods-block-step-on-table-copy-space.jpg?s=170667a&w=0&k=20&c=4WAs93uNyPzAipjj1ev7I32645IvoVtUrAT5VHsy8Ls=')] dark:bg-none dark:bg-slate-950 bg-cover bg-center bg-no-repeat bg-fixed text-slate-900 transition-colors duration-200">
     <header className="border-b border-slate-200 dark:border-slate-800 bg-white/75 dark:bg-slate-900/75 backdrop-blur-md sticky top-0 z-40 shadow-sm flex items-center justify-between p-4 px-6"></header>
    
      {/* Advanced Glassmorphism Header Layout */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 sticky top-0 z-40 shadow-sm flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-lg text-white">
            <Briefcase size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent dark:from-indigo-400 dark:to-violet-400">
              Student Mini Project Management Portal
            </h1>
            <p className="text-xs text-slate-400 font-medium"></p>
          </div>
        </div>
        <button 
          onClick={() => setDarkMode(!darkMode)}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          {darkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-indigo-600" />}
        </button>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
        
        {/* Dynamic Statistics Grid View */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Projects</p>
              <p className="text-3xl font-extrabold mt-1">{totalTasks}</p>
            </div>
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400">
              <LayoutGrid size={20} />
            </div>
          </div>
          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-500">Pending</p>
              <p className="text-3xl font-extrabold mt-1 text-amber-600 dark:text-amber-400">{pendingTasks}</p>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-xl text-amber-600 dark:text-amber-400">
              <Clock size={20} />
            </div>
          </div>
          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-500">In Progress</p>
              <p className="text-3xl font-extrabold mt-1 text-blue-600 dark:text-blue-400">{inProgressTasks}</p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-xl text-blue-600 dark:text-blue-400">
              <AlertCircle size={20} />
            </div>
          </div>
          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-500">Completed</p>
              <p className="text-3xl font-extrabold mt-1 text-emerald-600 dark:text-emerald-400">{completedTasks}</p>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl text-emerald-600 dark:text-emerald-400">
              <CheckCircle size={20} />
            </div>
          </div>
        </section>

        {/* Task Creation Module with Inline Label Formatting */}
        <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/60">
          <h2 className="text-md font-bold mb-4 flex items-center gap-2"><ListTodo size={18} className="text-indigo-500"/> Dispatch Task Order</h2>
          <form onSubmit={handleCreateTask} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Task Title</label>
              <input 
                type="text" placeholder="e.g., API Interface Optimization" value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 text-sm border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Work Description</label>
              <input 
                type="text" placeholder="Detail parameters of milestone" value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 text-sm border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white p-3 rounded-xl text-sm font-bold shadow-md shadow-indigo-600/10 hover:bg-indigo-700 hover:shadow-indigo-700/20 transition flex items-center justify-center gap-2">
              <Plus size={16} /> Deploy Task
            </button>
          </form>
        </section>

        {/* Query Controls Sub-section */}
        <section className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/60">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
            <input 
              type="text" placeholder="Search parameters..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 p-2.5 text-sm border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>
          
          <div className="flex gap-3 w-full md:w-auto justify-end">
            <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-sm font-medium">
              <Filter size={14} className="text-slate-400" />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-transparent outline-none cursor-pointer">
                <option value="">All Streams</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-sm font-medium">
              <ArrowUpDown size={14} className="text-slate-400" />
              <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="bg-transparent outline-none cursor-pointer">
                <option value="newest">Newest Sequence</option>
                <option value="oldest">Oldest Sequence</option>
              </select>
            </div>
          </div>
        </section>

        {/* Core Rendering Context Area */}
        {loading ? (
          <div className="flex flex-col items-center py-24">
            <Loader2 className="animate-spin text-indigo-600 dark:text-indigo-400" size={36} />
            <p className="mt-3 text-xs font-semibold text-slate-400 uppercase tracking-widest">Querying System Cluster...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-20 border border-dashed rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40">
            <p className="text-slate-400 font-semibold text-sm">No task matrices matches the chosen parameters.</p>
            <p className="text-xs text-slate-400/70 mt-1">Populate records or update filter selections.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {tasks.map((task) => (
              <div 
                key={task._id} 
                className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/60 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700 transition duration-200 group"
              >
                <div>
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <h3 className="font-bold text-md leading-snug tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">{task.title}</h3>
                    <button 
                      onClick={() => triggerDeleteConfirmation(task._id)}
                      className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition shrink-0"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 mb-6">{task.description}</p>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-slate-50 dark:border-slate-800/80">
                  <span className="text-xs font-medium text-slate-400">
                    {new Date(task.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <button
                    onClick={() => handleUpdateStatus(task._id, task.status)}
                    className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${
                      task.status === 'Completed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' :
                      task.status === 'In Progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400' :
                      'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400'
                    }`}
                  >
                    {task.status}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Confirmation Modal Overlay */}
      {modal.isOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 max-w-sm w-full p-6 rounded-2xl shadow-xl space-y-4 border border-slate-100 dark:border-slate-800 animate-fade-in">
            <h3 className="text-base font-bold tracking-tight">Confirm Task Drop?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">This action deletes the record from the pipeline permanently. You cannot retrieve this file sequence.</p>
            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => setModal({ isOpen: false, taskId: null })} 
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold"
              >
                Cancel Action
              </button>
              <button 
                onClick={handleDeleteTask} 
                className="px-4 py-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700 text-xs font-bold transition"
              >
                Purge Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Action Toasts */}
      <Notification message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />
    </div>
  );
}