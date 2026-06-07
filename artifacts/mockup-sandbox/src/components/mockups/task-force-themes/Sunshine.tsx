import React from "react";
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  ListTodo,
  Plus,
  Bell,
  Search,
  MoreHorizontal,
  LayoutGrid,
  List
} from "lucide-react";

export function Sunshine() {
  return (
    <div className="min-h-screen bg-orange-50 text-slate-800 font-sans pb-12">
      {/* Header */}
      <header className="bg-white px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="bg-rose-100 text-rose-600 font-bold w-10 h-10 rounded-xl flex items-center justify-center text-lg">
            TF
          </div>
          <h1 className="text-xl font-semibold text-slate-800">TaskForce</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-slate-50 border-none rounded-full py-2 pl-10 pr-4 w-64 focus:ring-2 focus:ring-rose-200 outline-none text-sm text-slate-700 placeholder-slate-400"
            />
          </div>
          <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <Bell className="w-6 h-6" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
          </button>
          <img 
            src="https://api.dicebear.com/7.x/notionists/svg?seed=Alice&backgroundColor=fecdd3" 
            alt="Profile" 
            className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
          />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* Greeting & Header Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex-1">
            <h2 className="text-2xl font-bold text-slate-800 mb-1">Hey Alice! 🌸</h2>
            <p className="text-slate-500">Ready to crush today?</p>
          </div>
          <button className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-4 rounded-full font-medium flex items-center justify-center gap-2 transition-colors shadow-sm whitespace-nowrap">
            <Plus className="w-5 h-5" />
            New Task
          </button>
        </div>

        {/* Stat Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-rose-100 rounded-3xl p-6 flex flex-col justify-between aspect-[4/3] relative overflow-hidden shadow-sm">
            <div className="bg-white/40 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <ListTodo className="w-6 h-6 text-rose-800" />
            </div>
            <div>
              <p className="text-rose-800/80 font-medium text-sm mb-1">Total</p>
              <p className="text-4xl font-bold text-rose-800">42</p>
            </div>
          </div>
          
          <div className="bg-amber-100 rounded-3xl p-6 flex flex-col justify-between aspect-[4/3] relative overflow-hidden shadow-sm">
            <div className="bg-white/40 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Circle className="w-6 h-6 text-amber-800" />
            </div>
            <div>
              <p className="text-amber-800/80 font-medium text-sm mb-1">To Do</p>
              <p className="text-4xl font-bold text-amber-800">18</p>
            </div>
          </div>

          <div className="bg-purple-100 rounded-3xl p-6 flex flex-col justify-between aspect-[4/3] relative overflow-hidden shadow-sm">
            <div className="bg-white/40 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-purple-800" />
            </div>
            <div>
              <p className="text-purple-800/80 font-medium text-sm mb-1">In Progress</p>
              <p className="text-4xl font-bold text-purple-800">12</p>
            </div>
          </div>

          <div className="bg-green-100 rounded-3xl p-6 flex flex-col justify-between aspect-[4/3] relative overflow-hidden shadow-sm">
            <div className="bg-white/40 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6 text-green-800" />
            </div>
            <div>
              <p className="text-green-800/80 font-medium text-sm mb-1">Done</p>
              <p className="text-4xl font-bold text-green-800">12</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Today's Focus */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Today's Focus</h3>
              <button className="text-rose-500 text-sm font-medium hover:underline">See all</button>
            </div>
            <div className="space-y-3">
              <div className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-l-rose-400 flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <h4 className="font-semibold text-slate-800">Review Q3 Marketing Strategy</h4>
                  <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal className="w-5 h-5" /></button>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium">
                  <span className="bg-rose-50 text-rose-600 px-2.5 py-1 rounded-full">High Priority</span>
                  <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">Marketing</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-l-amber-400 flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <h4 className="font-semibold text-slate-800">Finalize Budget Allocation</h4>
                  <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal className="w-5 h-5" /></button>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium">
                  <span className="bg-amber-50 text-amber-600 px-2.5 py-1 rounded-full">Medium Priority</span>
                  <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">Finance</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-l-purple-400 flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <h4 className="font-semibold text-slate-800">Prepare Weekly Report</h4>
                  <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal className="w-5 h-5" /></button>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium">
                  <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">Low Priority</span>
                  <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">Admin</span>
                </div>
              </div>
            </div>
          </div>

          {/* All Tasks */}
          <div className="xl:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">All Tasks</h3>
              <div className="flex items-center gap-1 bg-white p-1 rounded-full shadow-sm border border-slate-100">
                <button className="bg-slate-100 text-slate-800 px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2">
                  <List className="w-4 h-4" /> List
                </button>
                <button className="text-slate-500 hover:text-slate-800 px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 transition-colors">
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
                      { title: "Update Homepage Copy", cat: "Design", catC: "bg-blue-50 text-blue-600", pri: "High", priC: "bg-rose-50 text-rose-600", stat: "To Do", statC: "bg-slate-100 text-slate-600", date: "Today" },
                      { title: "Fix Navigation Bug", cat: "Dev", catC: "bg-emerald-50 text-emerald-600", pri: "High", priC: "bg-rose-50 text-rose-600", stat: "In Progress", statC: "bg-purple-50 text-purple-600", date: "Tomorrow" },
                      { title: "Client Onboarding Call", cat: "Meetings", catC: "bg-violet-50 text-violet-600", pri: "Medium", priC: "bg-amber-50 text-amber-600", stat: "Done", statC: "bg-green-50 text-green-600", date: "Oct 24" },
                      { title: "Draft Q4 OKRs", cat: "Planning", catC: "bg-fuchsia-50 text-fuchsia-600", pri: "Medium", priC: "bg-amber-50 text-amber-600", stat: "To Do", statC: "bg-slate-100 text-slate-600", date: "Oct 25" },
                      { title: "Order Office Supplies", cat: "Admin", catC: "bg-slate-100 text-slate-600", pri: "Low", priC: "bg-slate-100 text-slate-600", stat: "Done", statC: "bg-green-50 text-green-600", date: "Oct 28" },
                    ].map((task, i) => (
                      <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <button className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${task.stat === 'Done' ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 group-hover:border-rose-300'}`}>
                            {task.stat === 'Done' && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </button>
                        </td>
                        <td className={`px-6 py-4 font-medium ${task.stat === 'Done' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                          {task.title}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${task.catC}`}>{task.cat}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${task.priC}`}>{task.pri}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${task.statC}`}>{task.stat}</span>
                        </td>
                        <td className="px-6 py-4 text-slate-500">{task.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
