import React, { useState } from "react";
import {
  Bell,
  CheckCircle2,
  CircleDashed,
  Clock,
  ListTodo,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  LayoutGrid,
  List,
} from "lucide-react";

export function Sunshine() {
  const [activeTab, setActiveTab] = useState("list");

  return (
    <div className="min-h-screen bg-green-50 font-sans text-slate-800 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 font-bold text-lg">
            TF
          </div>
          <span className="font-semibold text-slate-700 text-lg">Task Force</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tasks..."
              className="pl-9 pr-4 py-2 bg-slate-50 border-none rounded-full text-sm focus:ring-2 focus:ring-teal-100 outline-none w-64 text-slate-600"
            />
          </div>
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-teal-500 rounded-full border border-white"></span>
          </button>
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors">
            <Settings className="w-5 h-5" />
          </button>
          <img
            src="https://api.dicebear.com/7.x/notionists/svg?seed=Alice&backgroundColor=ccfbf1"
            alt="Alice"
            className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
          />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* Greeting & New Task */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex-1">
            <h2 className="text-2xl font-bold text-slate-800 mb-1">Welcome back, Alice 👋</h2>
            <p className="text-slate-500 italic">"The secret of getting ahead is getting started."</p>
          </div>
          <button className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-4 rounded-full font-medium flex items-center justify-center gap-2 transition-colors shadow-sm whitespace-nowrap">
            <Plus className="w-5 h-5" />
            New Task
          </button>
        </div>

        {/* Stat Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-teal-100 rounded-3xl p-6 flex flex-col justify-between aspect-[4/3] overflow-hidden shadow-sm">
            <div className="bg-white/50 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <ListTodo className="w-6 h-6 text-teal-800" />
            </div>
            <div>
              <p className="text-teal-800/80 font-medium text-sm mb-1">Total</p>
              <p className="text-4xl font-bold text-teal-900">17</p>
            </div>
          </div>
          <div className="bg-orange-100 rounded-3xl p-6 flex flex-col justify-between aspect-[4/3] overflow-hidden shadow-sm">
            <div className="bg-white/50 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <CircleDashed className="w-6 h-6 text-orange-800" />
            </div>
            <div>
              <p className="text-orange-800/80 font-medium text-sm mb-1">To Do</p>
              <p className="text-4xl font-bold text-orange-900">8</p>
            </div>
          </div>
          <div className="bg-sky-100 rounded-3xl p-6 flex flex-col justify-between aspect-[4/3] overflow-hidden shadow-sm">
            <div className="bg-white/50 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-sky-800" />
            </div>
            <div>
              <p className="text-sky-800/80 font-medium text-sm mb-1">In Progress</p>
              <p className="text-4xl font-bold text-sky-900">4</p>
            </div>
          </div>
          <div className="bg-lime-100 rounded-3xl p-6 flex flex-col justify-between aspect-[4/3] overflow-hidden shadow-sm">
            <div className="bg-white/50 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6 text-lime-800" />
            </div>
            <div>
              <p className="text-lime-800/80 font-medium text-sm mb-1">Done</p>
              <p className="text-4xl font-bold text-lime-900">5</p>
            </div>
          </div>
        </div>

        {/* Today's Focus — full width, 3 cards in a row */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">Today's Focus</h3>
            <button className="text-teal-600 text-sm font-medium hover:text-teal-700">See all</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-l-orange-400 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <h4 className="font-semibold text-slate-800">Review Q3 Marketing Strategy</h4>
                <button className="text-slate-400 hover:text-slate-600 shrink-0 ml-2"><MoreHorizontal className="w-5 h-5" /></button>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium flex-wrap">
                <span className="bg-orange-50 text-orange-600 px-2.5 py-1 rounded-full">High Priority</span>
                <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">Marketing</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-400 mt-auto">
                <Clock className="w-3 h-3" /> 2:00 PM today
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-l-sky-400 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <h4 className="font-semibold text-slate-800">Weekly Team Sync</h4>
                <button className="text-slate-400 hover:text-slate-600 shrink-0 ml-2"><MoreHorizontal className="w-5 h-5" /></button>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium flex-wrap">
                <span className="bg-sky-50 text-sky-600 px-2.5 py-1 rounded-full">Medium Priority</span>
                <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">Meetings</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-400 mt-auto">
                <Clock className="w-3 h-3" /> 4:30 PM today
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-l-teal-400 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <h4 className="font-semibold text-slate-800">Client Presentation</h4>
                <button className="text-slate-400 hover:text-slate-600 shrink-0 ml-2"><MoreHorizontal className="w-5 h-5" /></button>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium flex-wrap">
                <span className="bg-teal-50 text-teal-600 px-2.5 py-1 rounded-full">High Priority</span>
                <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">Sales</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-400 mt-auto">
                <Clock className="w-3 h-3" /> Tomorrow 10:00 AM
              </div>
            </div>
          </div>
        </div>

        {/* All Tasks — full width below */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">All Tasks</h3>
            <div className="flex items-center gap-1 bg-white p-1 rounded-full shadow-sm border border-slate-100">
              <button
                onClick={() => setActiveTab("list")}
                className={`px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 transition-colors ${activeTab === "list" ? "bg-teal-50 text-teal-700" : "text-slate-500 hover:text-slate-700"}`}
              >
                <List className="w-4 h-4" /> List
              </button>
              <button
                onClick={() => setActiveTab("kanban")}
                className={`px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 transition-colors ${activeTab === "kanban" ? "bg-teal-50 text-teal-700" : "text-slate-500 hover:text-slate-700"}`}
              >
                <LayoutGrid className="w-4 h-4" /> Kanban
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-slate-100 p-2">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-sm font-medium">
                    <th className="px-6 py-4 font-normal w-12"></th>
                    <th className="px-6 py-4 font-normal">Task</th>
                    <th className="px-6 py-4 font-normal">Category</th>
                    <th className="px-6 py-4 font-normal">Priority</th>
                    <th className="px-6 py-4 font-normal">Status</th>
                    <th className="px-6 py-4 font-normal">Deadline</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {[
                    { title: "Write Q3 Marketing Report", cat: "Marketing", catC: "bg-purple-50 text-purple-600", pri: "High", priC: "bg-orange-50 text-orange-600", stat: "In Progress", statC: "bg-sky-50 text-sky-600", date: "Today", done: false },
                    { title: "Update Homepage Copy", cat: "Design", catC: "bg-blue-50 text-blue-600", pri: "Medium", priC: "bg-sky-50 text-sky-600", stat: "To Do", statC: "bg-slate-100 text-slate-600", date: "Tomorrow", done: false },
                    { title: "Fix Navigation Bug", cat: "Engineering", catC: "bg-pink-50 text-pink-600", pri: "High", priC: "bg-orange-50 text-orange-600", stat: "To Do", statC: "bg-slate-100 text-slate-600", date: "Oct 12", done: false },
                    { title: "Review Q4 Budget", cat: "Finance", catC: "bg-slate-100 text-slate-500", pri: "Low", priC: "bg-slate-100 text-slate-500", stat: "Done", statC: "bg-lime-50 text-lime-700", date: "Oct 10", done: true },
                    { title: "Interview UI/UX Candidate", cat: "HR", catC: "bg-amber-50 text-amber-600", pri: "Medium", priC: "bg-sky-50 text-sky-600", stat: "In Progress", statC: "bg-sky-50 text-sky-600", date: "Oct 16", done: false },
                  ].map((task, i) => (
                    <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <button className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${task.done ? "bg-teal-500 border-teal-500 text-white" : "border-slate-300 group-hover:border-teal-400"}`}>
                          {task.done && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </button>
                      </td>
                      <td className={`px-6 py-4 font-medium ${task.done ? "text-slate-400 line-through" : "text-slate-800"}`}>{task.title}</td>
                      <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${task.catC}`}>{task.cat}</span></td>
                      <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${task.priC}`}>{task.pri}</span></td>
                      <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${task.statC}`}>{task.stat}</span></td>
                      <td className="px-6 py-4 text-slate-500">{task.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
