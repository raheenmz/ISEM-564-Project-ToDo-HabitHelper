import React from "react";
import { AlertCircle, CheckCircle2, Circle, Clock, LayoutList, LogOut, Plus, SquareKanban, X } from "lucide-react";

export function Vibrant() {
  return (
    <div className="min-h-screen bg-amber-50/30 font-sans text-slate-800 pb-12">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-indigo-100/50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-500/20">
              TF
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-700">
              Task Force
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 text-amber-700 font-bold border-2 border-amber-200">
              A
            </button>
            <button className="text-slate-500 hover:text-slate-700 transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Quote Banner */}
        <div className="relative rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-8 shadow-lg shadow-purple-500/20 overflow-hidden text-white">
          <div className="relative z-10 pr-8">
            <h2 className="text-3xl font-extrabold tracking-tight mb-2">Level Up Your Day</h2>
            <p className="text-purple-100 text-lg font-medium">
              "The secret of getting ahead is getting started. Let's crush today's goals."
            </p>
          </div>
          <button className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        </div>

        {/* Header with New Task Button */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold shadow-md shadow-pink-500/25 hover:shadow-lg hover:shadow-pink-500/40 transition-all hover:-translate-y-0.5">
            <Plus className="w-5 h-5" />
            New Task
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 p-5 text-white shadow-lg shadow-amber-500/20">
            <p className="text-amber-50 font-medium mb-1">Total</p>
            <p className="text-4xl font-extrabold">17</p>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 p-5 text-white shadow-lg shadow-violet-500/20">
            <p className="text-violet-100 font-medium mb-1">To Do</p>
            <p className="text-4xl font-extrabold">8</p>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 p-5 text-white shadow-lg shadow-blue-500/20">
            <p className="text-blue-100 font-medium mb-1">In Progress</p>
            <p className="text-4xl font-extrabold">4</p>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 p-5 text-white shadow-lg shadow-emerald-500/20">
            <p className="text-emerald-50 font-medium mb-1">Done</p>
            <p className="text-4xl font-extrabold">5</p>
          </div>
        </div>

        {/* Today's Focus */}
        <div>
          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            🔥 Today's Focus
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 relative overflow-hidden group">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-500"></div>
              <div className="flex justify-between items-start mb-3">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                  High Priority
                </span>
                <button className="text-slate-300 hover:text-amber-500 transition-colors">
                  <Circle className="w-6 h-6" />
                </button>
              </div>
              <h4 className="font-bold text-lg mb-1 group-hover:text-amber-600 transition-colors">Prepare Q3 Presentation</h4>
              <p className="text-sm text-slate-500">Work</p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 relative overflow-hidden group">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500"></div>
              <div className="flex justify-between items-start mb-3">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                  Medium
                </span>
                <button className="text-slate-300 hover:text-blue-500 transition-colors">
                  <Clock className="w-6 h-6" />
                </button>
              </div>
              <h4 className="font-bold text-lg mb-1 group-hover:text-blue-600 transition-colors">Review Design Specs</h4>
              <p className="text-sm text-slate-500">Project Alpha</p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 relative overflow-hidden group">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-rose-500"></div>
              <div className="flex justify-between items-start mb-3">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
                  Low
                </span>
                <button className="text-slate-300 hover:text-rose-500 transition-colors">
                  <Circle className="w-6 h-6" />
                </button>
              </div>
              <h4 className="font-bold text-lg mb-1 group-hover:text-rose-600 transition-colors">Drink 2L Water</h4>
              <p className="text-sm text-slate-500">Health</p>
            </div>
          </div>
        </div>

        {/* All Tasks */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="text-xl font-bold text-slate-800">All Tasks</h3>
            <div className="flex items-center bg-slate-100 rounded-xl p-1">
              <button className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-white shadow-sm text-sm font-semibold text-indigo-600">
                <LayoutList className="w-4 h-4" />
                List
              </button>
              <button className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors">
                <SquareKanban className="w-4 h-4" />
                Board
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-sm font-semibold text-slate-400">
                  <th className="px-6 py-4 font-medium">Task</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">Priority</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Deadline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <tr className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-rose-500" />
                      <span className="font-semibold text-slate-800">Submit expense report</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                      Finance
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                      High
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                      <Circle className="w-3.5 h-3.5" />
                      To Do
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-rose-500">
                    Yesterday
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Circle className="w-5 h-5 text-slate-300" />
                      <span className="font-semibold text-slate-800">Update landing page copy</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                      Marketing
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                      Normal
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 transition-colors">
                      <Clock className="w-3.5 h-3.5" />
                      In Progress
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">
                    Today
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Circle className="w-5 h-5 text-slate-300" />
                      <span className="font-semibold text-slate-800">Schedule team offsite</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-pink-100 text-pink-700">
                      HR
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                      Normal
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                      <Circle className="w-3.5 h-3.5" />
                      To Do
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">
                    Tomorrow
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/80 transition-colors group opacity-75">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <span className="font-semibold text-slate-500 line-through">Call internet provider</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                      Personal
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                      High
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 transition-colors">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Done
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">
                    Today
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Circle className="w-5 h-5 text-slate-300" />
                      <span className="font-semibold text-slate-800">Read 20 pages</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-100 text-cyan-700">
                      Habit
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                      Low
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                      <Circle className="w-3.5 h-3.5" />
                      To Do
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">
                    Daily
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
