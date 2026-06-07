import React, { useState } from 'react';
import { CheckCircle2, Circle, Clock, MoreHorizontal, Plus, X, Sun, LogOut } from 'lucide-react';

export function Sunshine() {
  const [showQuote, setShowQuote] = useState(true);

  return (
    <div className="min-h-screen bg-sky-50 font-['Nunito'] text-slate-700 pb-20">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-sky-400 text-white shadow-sm px-6 py-4 flex items-center justify-between rounded-b-[2rem]">
        <div className="flex items-center gap-3">
          <div className="bg-white text-sky-500 font-extrabold w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-inner">
            TF
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Task Force</h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center justify-center w-10 h-10 rounded-full bg-sky-300 hover:bg-sky-200 transition-colors text-white">
            <LogOut size={20} />
          </button>
          <div className="w-12 h-12 rounded-full overflow-hidden border-4 border-sky-300 shadow-md">
            <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=fde047" alt="Avatar" className="w-full h-full object-cover" />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-10">
        {/* Quote Banner */}
        {showQuote && (
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-yellow-300 via-orange-400 to-rose-400 p-6 shadow-lg transform transition-all hover:scale-[1.01]">
            <button 
              onClick={() => setShowQuote(false)}
              className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/20 hover:bg-white/30 rounded-full p-1.5 transition-colors"
            >
              <X size={18} />
            </button>
            <div className="flex items-center gap-4 text-white pr-8">
              <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                <Sun size={28} className="text-white" />
              </div>
              <div>
                <p className="text-xl font-bold">"Every day is a fresh start."</p>
                <p className="text-white/90 text-sm mt-1 font-medium">Take a deep breath and let's get things done!</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Row */}
        <section>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-sky-100 rounded-[2rem] p-6 text-center shadow-sm border border-sky-200">
              <p className="text-sky-600 font-bold text-sm uppercase tracking-wider mb-1">Total</p>
              <p className="text-4xl font-extrabold text-sky-700">17</p>
            </div>
            <div className="bg-yellow-100 rounded-[2rem] p-6 text-center shadow-sm border border-yellow-200">
              <p className="text-yellow-600 font-bold text-sm uppercase tracking-wider mb-1">To Do</p>
              <p className="text-4xl font-extrabold text-yellow-700">8</p>
            </div>
            <div className="bg-orange-100 rounded-[2rem] p-6 text-center shadow-sm border border-orange-200">
              <p className="text-orange-600 font-bold text-sm uppercase tracking-wider mb-1">In Progress</p>
              <p className="text-4xl font-extrabold text-orange-700">4</p>
            </div>
            <div className="bg-emerald-100 rounded-[2rem] p-6 text-center shadow-sm border border-emerald-200">
              <p className="text-emerald-600 font-bold text-sm uppercase tracking-wider mb-1">Done</p>
              <p className="text-4xl font-extrabold text-emerald-700">5</p>
            </div>
          </div>
        </section>

        {/* Today's Focus */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-extrabold text-sky-900">Today's Focus</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-sky-200 rounded-[2rem] p-6 shadow-sm border border-sky-300 relative group hover:-translate-y-1 transition-transform">
              <div className="flex justify-between items-start mb-8">
                <span className="bg-white/60 text-sky-800 text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">Design</span>
                <button className="text-sky-700 hover:text-sky-900 bg-white/40 rounded-full p-1"><MoreHorizontal size={18} /></button>
              </div>
              <h3 className="text-xl font-bold text-sky-900 mb-2 leading-tight">Review brand guidelines</h3>
              <div className="flex items-center justify-between mt-6">
                <div className="flex items-center text-sky-800 text-sm font-bold bg-white/50 px-3 py-1.5 rounded-full">
                  <Clock size={14} className="mr-1.5" /> 10:00 AM
                </div>
                <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-sky-400 hover:bg-sky-50 hover:text-sky-500 shadow-sm transition-colors">
                  <Circle size={24} />
                </button>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-emerald-200 rounded-[2rem] p-6 shadow-sm border border-emerald-300 relative group hover:-translate-y-1 transition-transform">
              <div className="flex justify-between items-start mb-8">
                <span className="bg-white/60 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">Health</span>
                <button className="text-emerald-700 hover:text-emerald-900 bg-white/40 rounded-full p-1"><MoreHorizontal size={18} /></button>
              </div>
              <h3 className="text-xl font-bold text-emerald-900 mb-2 leading-tight">Afternoon Yoga</h3>
              <div className="flex items-center justify-between mt-6">
                <div className="flex items-center text-emerald-800 text-sm font-bold bg-white/50 px-3 py-1.5 rounded-full">
                  <Clock size={14} className="mr-1.5" /> 2:30 PM
                </div>
                <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-emerald-400 hover:bg-emerald-50 hover:text-emerald-500 shadow-sm transition-colors">
                  <Circle size={24} />
                </button>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-rose-200 rounded-[2rem] p-6 shadow-sm border border-rose-300 relative group hover:-translate-y-1 transition-transform">
              <div className="flex justify-between items-start mb-8">
                <span className="bg-white/60 text-rose-800 text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">Admin</span>
                <button className="text-rose-700 hover:text-rose-900 bg-white/40 rounded-full p-1"><MoreHorizontal size={18} /></button>
              </div>
              <h3 className="text-xl font-bold text-rose-900 mb-2 leading-tight">Pay internet bill</h3>
              <div className="flex items-center justify-between mt-6">
                <div className="flex items-center text-rose-800 text-sm font-bold bg-white/50 px-3 py-1.5 rounded-full">
                  <Clock size={14} className="mr-1.5" /> 5:00 PM
                </div>
                <button className="w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center text-white shadow-sm hover:bg-rose-600 transition-colors">
                  <CheckCircle2 size={24} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* All Tasks */}
        <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-sky-100">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-extrabold text-sky-900">All Tasks</h2>
            <div className="flex gap-4 items-center">
              <div className="bg-sky-50 p-1.5 rounded-full flex">
                <button className="px-6 py-2 rounded-full bg-white text-sky-700 font-bold shadow-sm text-sm">List</button>
                <button className="px-6 py-2 rounded-full text-slate-500 hover:text-sky-700 font-bold text-sm transition-colors">Kanban</button>
              </div>
              <button className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-extrabold px-6 py-3 rounded-full flex items-center gap-2 shadow-sm transition-transform hover:scale-105">
                <Plus size={20} strokeWidth={3} />
                New Task
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-slate-400 text-sm font-bold uppercase tracking-wider border-b-2 border-sky-50">
                  <th className="pb-4 pl-4 font-extrabold">Task</th>
                  <th className="pb-4 font-extrabold">Category</th>
                  <th className="pb-4 font-extrabold">Priority</th>
                  <th className="pb-4 font-extrabold">Status</th>
                  <th className="pb-4 font-extrabold">Deadline</th>
                  <th className="pb-4 pr-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-50">
                {/* Row 1 */}
                <tr className="group hover:bg-sky-50/50 transition-colors">
                  <td className="py-5 pl-4">
                    <div className="flex items-center gap-3">
                      <button className="text-slate-300 hover:text-sky-400 transition-colors"><Circle size={20} /></button>
                      <span className="font-bold text-slate-700 text-lg">Update weekly presentation</span>
                    </div>
                  </td>
                  <td className="py-5">
                    <span className="bg-sky-100 text-sky-700 px-3 py-1 rounded-full text-xs font-extrabold">Work</span>
                  </td>
                  <td className="py-5">
                    <span className="flex items-center gap-1.5 text-rose-500 font-bold text-sm">
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span> High
                    </span>
                  </td>
                  <td className="py-5">
                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">To Do</span>
                  </td>
                  <td className="py-5">
                    <span className="text-slate-500 font-bold text-sm">Tomorrow</span>
                  </td>
                  <td className="py-5 pr-4 text-right">
                    <button className="text-slate-300 hover:text-sky-500 transition-colors"><MoreHorizontal size={20} /></button>
                  </td>
                </tr>

                {/* Row 2 */}
                <tr className="group hover:bg-sky-50/50 transition-colors">
                  <td className="py-5 pl-4">
                    <div className="flex items-center gap-3">
                      <button className="text-slate-300 hover:text-sky-400 transition-colors"><Circle size={20} /></button>
                      <span className="font-bold text-slate-700 text-lg">Buy groceries</span>
                    </div>
                  </td>
                  <td className="py-5">
                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-extrabold">Personal</span>
                  </td>
                  <td className="py-5">
                    <span className="flex items-center gap-1.5 text-yellow-500 font-bold text-sm">
                      <span className="w-2 h-2 rounded-full bg-yellow-500"></span> Medium
                    </span>
                  </td>
                  <td className="py-5">
                    <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-bold">In Progress</span>
                  </td>
                  <td className="py-5">
                    <span className="text-slate-500 font-bold text-sm">Today</span>
                  </td>
                  <td className="py-5 pr-4 text-right">
                    <button className="text-slate-300 hover:text-sky-500 transition-colors"><MoreHorizontal size={20} /></button>
                  </td>
                </tr>

                {/* Row 3 */}
                <tr className="group hover:bg-sky-50/50 transition-colors">
                  <td className="py-5 pl-4">
                    <div className="flex items-center gap-3">
                      <button className="text-emerald-500"><CheckCircle2 size={20} /></button>
                      <span className="font-bold text-slate-400 text-lg line-through">Call mom</span>
                    </div>
                  </td>
                  <td className="py-5">
                    <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-extrabold">Family</span>
                  </td>
                  <td className="py-5">
                    <span className="flex items-center gap-1.5 text-slate-400 font-bold text-sm">
                      <span className="w-2 h-2 rounded-full bg-slate-300"></span> Low
                    </span>
                  </td>
                  <td className="py-5">
                    <span className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold">Done</span>
                  </td>
                  <td className="py-5">
                    <span className="text-slate-400 font-bold text-sm">Yesterday</span>
                  </td>
                  <td className="py-5 pr-4 text-right">
                    <button className="text-slate-300 hover:text-sky-500 transition-colors"><MoreHorizontal size={20} /></button>
                  </td>
                </tr>

                {/* Row 4 */}
                <tr className="group hover:bg-sky-50/50 transition-colors">
                  <td className="py-5 pl-4">
                    <div className="flex items-center gap-3">
                      <button className="text-slate-300 hover:text-sky-400 transition-colors"><Circle size={20} /></button>
                      <span className="font-bold text-slate-700 text-lg">Fix navigation bug</span>
                    </div>
                  </td>
                  <td className="py-5">
                    <span className="bg-sky-100 text-sky-700 px-3 py-1 rounded-full text-xs font-extrabold">Work</span>
                  </td>
                  <td className="py-5">
                    <span className="flex items-center gap-1.5 text-rose-500 font-bold text-sm">
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span> High
                    </span>
                  </td>
                  <td className="py-5">
                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">To Do</span>
                  </td>
                  <td className="py-5">
                    <span className="text-slate-500 font-bold text-sm">Oct 24</span>
                  </td>
                  <td className="py-5 pr-4 text-right">
                    <button className="text-slate-300 hover:text-sky-500 transition-colors"><MoreHorizontal size={20} /></button>
                  </td>
                </tr>

                {/* Row 5 */}
                <tr className="group hover:bg-sky-50/50 transition-colors">
                  <td className="py-5 pl-4">
                    <div className="flex items-center gap-3">
                      <button className="text-slate-300 hover:text-sky-400 transition-colors"><Circle size={20} /></button>
                      <span className="font-bold text-slate-700 text-lg">Read chapter 4</span>
                    </div>
                  </td>
                  <td className="py-5">
                    <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-xs font-extrabold">Learning</span>
                  </td>
                  <td className="py-5">
                    <span className="flex items-center gap-1.5 text-slate-400 font-bold text-sm">
                      <span className="w-2 h-2 rounded-full bg-slate-300"></span> Low
                    </span>
                  </td>
                  <td className="py-5">
                    <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-bold">In Progress</span>
                  </td>
                  <td className="py-5">
                    <span className="text-slate-500 font-bold text-sm">Next Week</span>
                  </td>
                  <td className="py-5 pr-4 text-right">
                    <button className="text-slate-300 hover:text-sky-500 transition-colors"><MoreHorizontal size={20} /></button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
