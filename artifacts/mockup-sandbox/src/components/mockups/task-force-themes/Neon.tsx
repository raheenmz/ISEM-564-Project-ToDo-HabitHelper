import React from "react";
import { 
  Bell, 
  Search, 
  Plus, 
  LayoutList, 
  Kanban, 
  MoreVertical,
  CheckCircle2,
  Circle,
  Clock,
  ArrowRight
} from "lucide-react";

export function Neon() {
  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-200 overflow-x-hidden selection:bg-cyan-500/30">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-black text-xl text-cyan-400 border border-cyan-400/50"
              style={{ boxShadow: '0 0 10px rgba(34,211,238,0.4), inset 0 0 10px rgba(34,211,238,0.2)' }}
            >
              TF
            </div>
            <span className="text-xl font-bold text-white tracking-wide">Task<span className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">Force</span></span>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400/50" />
              <input 
                type="text" 
                placeholder="Search command..." 
                className="bg-slate-800/50 border border-slate-700 rounded-full pl-10 pr-4 py-1.5 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all text-slate-200 w-64 placeholder:text-slate-500"
              />
            </div>
            
            <button className="relative text-slate-400 hover:text-cyan-400 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-pink-500 rounded-full border-2 border-slate-900" style={{ boxShadow: '0 0 8px rgba(236,72,153,0.8)' }}></span>
            </button>
            
            <div className="flex items-center gap-3 pl-4 border-l border-slate-700">
              <img src="https://i.pravatar.cc/150?img=60" alt="User" className="w-8 h-8 rounded-full border border-cyan-500/30" />
              <button className="text-sm text-slate-400 hover:text-white transition-colors">Sign out</button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Quote Banner */}
        <div 
          className="relative overflow-hidden rounded-2xl bg-slate-800 p-8 border border-pink-500/30 group"
          style={{ boxShadow: '0 0 20px rgba(236,72,153,0.1), inset 0 0 20px rgba(236,72,153,0.05)' }}
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-pink-500 to-cyan-500" style={{ boxShadow: '0 0 15px rgba(236,72,153,0.8)' }}></div>
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-cyan-400 mb-2 filter drop-shadow-[0_0_8px_rgba(236,72,153,0.3)]">
                "System optimal. Ready for initialization."
              </h2>
              <p className="text-slate-400">17 tasks pending today. Maintain sequence to achieve target velocity.</p>
            </div>
            <button 
              className="whitespace-nowrap px-6 py-3 rounded-xl font-bold text-slate-900 bg-cyan-400 hover:bg-cyan-300 transition-all flex items-center gap-2"
              style={{ boxShadow: '0 0 15px rgba(34,211,238,0.5)' }}
            >
              <Plus className="w-5 h-5" />
              New Task
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Tasks", value: "17", color: "cyan", hex: "34,211,238" },
            { label: "To Do", value: "8", color: "pink", hex: "236,72,153" },
            { label: "In Progress", value: "4", color: "yellow", hex: "234,179,8" },
            { label: "Done", value: "5", color: "green", hex: "132,204,22" },
          ].map((stat, i) => (
            <div 
              key={i} 
              className="bg-slate-800 rounded-xl p-5 border border-slate-700/50 relative overflow-hidden"
            >
              <div 
                className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-20 blur-2xl pointer-events-none"
                style={{ backgroundColor: `rgb(${stat.hex})` }}
              ></div>
              <p className="text-sm font-medium text-slate-400 mb-1">{stat.label}</p>
              <p 
                className="text-4xl font-black tracking-tight"
                style={{ 
                  color: `rgb(${stat.hex})`,
                  textShadow: `0 0 20px rgba(${stat.hex}, 0.5)` 
                }}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Today's Focus */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" style={{ boxShadow: '0 0 8px rgba(34,211,238,0.8)' }}></span>
              Today's Focus
            </h3>
            <button className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: "Finalize Cyber Security Audit", time: "10:00 AM", category: "Work", color: "pink", hex: "236,72,153" },
              { title: "Deploy Frontend V2.4", time: "2:30 PM", category: "Dev", color: "yellow", hex: "234,179,8" },
              { title: "Review Q3 Metric Projections", time: "4:00 PM", category: "Planning", color: "cyan", hex: "34,211,238" },
            ].map((task, i) => (
              <div 
                key={i}
                className="bg-slate-800 rounded-xl p-5 border border-slate-700/50 hover:border-slate-600 transition-all cursor-pointer relative"
              >
                <div 
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 rounded-r-full"
                  style={{ backgroundColor: `rgb(${task.hex})`, boxShadow: `0 0 10px rgba(${task.hex}, 0.8)` }}
                ></div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{task.category}</span>
                  <button className="text-slate-500 hover:text-white transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
                <h4 className="font-semibold text-white mb-4 line-clamp-2">{task.title}</h4>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    {task.time}
                  </div>
                  <button className="w-6 h-6 rounded-full border border-slate-600 flex items-center justify-center hover:border-cyan-400 hover:text-cyan-400 transition-all">
                    <CheckCircle2 className="w-4 h-4 opacity-0 hover:opacity-100" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* All Tasks Table */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700/50 overflow-hidden">
          <div className="p-4 border-b border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-pink-500" style={{ boxShadow: '0 0 8px rgba(236,72,153,0.8)' }}></span>
              Task Database
            </h3>
            
            <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700">
              <button className="px-4 py-1.5 rounded-md bg-slate-800 text-cyan-400 text-sm font-medium flex items-center gap-2 shadow-[0_0_10px_rgba(34,211,238,0.1)]">
                <LayoutList className="w-4 h-4" />
                List
              </button>
              <button className="px-4 py-1.5 rounded-md text-slate-500 hover:text-white transition-colors text-sm font-medium flex items-center gap-2">
                <Kanban className="w-4 h-4" />
                Kanban
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-700/50 text-xs uppercase tracking-wider text-slate-500 bg-slate-900/30">
                  <th className="p-4 font-medium">Task Name</th>
                  <th className="p-4 font-medium">Category</th>
                  <th className="p-4 font-medium">Priority</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Deadline</th>
                  <th className="p-4 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {[
                  { title: "Compile weekly performance report", category: "Analytics", priority: "HIGH", status: "To Do", date: "Today" },
                  { title: "Update server configuration", category: "Infrastructure", priority: "HIGH", status: "In Progress", date: "Tomorrow" },
                  { title: "Design system dark mode palette", category: "Design", priority: "MEDIUM", status: "In Progress", date: "Oct 24" },
                  { title: "Schedule Q4 planning offsite", category: "Management", priority: "LOW", status: "To Do", date: "Oct 28" },
                  { title: "Clear technical debt in auth module", category: "Engineering", priority: "MEDIUM", status: "Done", date: "Nov 02" },
                ].map((task, i) => (
                  <tr key={i} className="hover:bg-slate-700/20 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <button className="text-slate-600 hover:text-cyan-400 transition-colors">
                          {task.status === "Done" ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" style={{ filter: 'drop-shadow(0 0 5px rgba(34,197,94,0.5))' }} />
                          ) : (
                            <Circle className="w-5 h-5" />
                          )}
                        </button>
                        <span className={`font-medium ${task.status === "Done" ? "text-slate-500 line-through" : "text-slate-200"}`}>
                          {task.title}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-900 border border-slate-700 text-slate-400">
                        {task.category}
                      </span>
                    </td>
                    <td className="p-4">
                      {task.priority === "HIGH" && (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-pink-500">
                          <span className="w-1.5 h-1.5 rounded-full bg-pink-500" style={{ boxShadow: '0 0 5px rgba(236,72,153,0.8)' }}></span>
                          HIGH
                        </span>
                      )}
                      {task.priority === "MEDIUM" && (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-yellow-500">
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" style={{ boxShadow: '0 0 5px rgba(234,179,8,0.8)' }}></span>
                          MEDIUM
                        </span>
                      )}
                      {task.priority === "LOW" && (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-lime-500">
                          <span className="w-1.5 h-1.5 rounded-full bg-lime-500" style={{ boxShadow: '0 0 5px rgba(132,204,22,0.8)' }}></span>
                          LOW
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${
                        task.status === "To Do" ? "bg-slate-900/50 text-slate-400 border-slate-700" :
                        task.status === "In Progress" ? "bg-cyan-950/30 text-cyan-400 border-cyan-500/30 shadow-[0_0_10px_rgba(34,211,238,0.1)_inset]" :
                        "bg-green-950/30 text-green-400 border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.1)_inset]"
                      }`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-400">
                      {task.date}
                    </td>
                    <td className="p-4 text-right">
                      <button className="text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
