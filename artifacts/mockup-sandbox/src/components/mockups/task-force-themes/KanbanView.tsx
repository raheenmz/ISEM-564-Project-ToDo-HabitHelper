import React from "react";
import {
  Bell,
  CheckCircle2,
  CircleDashed,
  Clock,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  List,
  LayoutGrid,
  CalendarDays,
  Flag,
} from "lucide-react";

const tasks = {
  todo: [
    { id: 1, title: "Update Homepage Copy", cat: "Design", catC: "bg-blue-50 text-blue-600", pri: "Medium", priC: "bg-sky-50 text-sky-700", date: "Tomorrow" },
    { id: 2, title: "Fix Navigation Bug", cat: "Engineering", catC: "bg-pink-50 text-pink-600", pri: "High", priC: "bg-orange-50 text-orange-700", date: "Oct 12" },
    { id: 3, title: "Draft Q4 OKRs", cat: "Planning", catC: "bg-violet-50 text-violet-600", pri: "Medium", priC: "bg-sky-50 text-sky-700", date: "Oct 25" },
    { id: 9, title: "Order new office supplies", cat: "Admin", catC: "bg-slate-100 text-slate-500", pri: "Low", priC: "bg-slate-100 text-slate-500", date: "Nov 1" },
  ],
  inProgress: [
    { id: 4, title: "Write Q3 Marketing Report", cat: "Marketing", catC: "bg-purple-50 text-purple-600", pri: "High", priC: "bg-orange-50 text-orange-700", date: "Today" },
    { id: 5, title: "Interview UI/UX Candidate", cat: "HR", catC: "bg-amber-50 text-amber-600", pri: "Medium", priC: "bg-sky-50 text-sky-700", date: "Oct 16" },
    { id: 10, title: "Update team wiki docs", cat: "Docs", catC: "bg-lime-50 text-lime-600", pri: "Low", priC: "bg-slate-100 text-slate-500", date: "Oct 30" },
  ],
  done: [
    { id: 6, title: "Review Q4 Budget", cat: "Finance", catC: "bg-slate-100 text-slate-500", pri: "Low", priC: "bg-slate-100 text-slate-500", date: "Oct 10" },
    { id: 7, title: "Client Onboarding Call", cat: "Meetings", catC: "bg-violet-50 text-violet-600", pri: "Medium", priC: "bg-sky-50 text-sky-700", date: "Oct 9" },
    { id: 8, title: "Set up analytics", cat: "Engineering", catC: "bg-pink-50 text-pink-600", pri: "Low", priC: "bg-slate-100 text-slate-500", date: "Oct 8" },
  ],
};

function KanbanCard({ task, done = false }: { task: typeof tasks.todo[0]; done?: boolean }) {
  return (
    <div className={`bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col gap-3 ${done ? "opacity-60" : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <p className={`font-medium text-sm leading-snug ${done ? "line-through text-slate-400" : "text-slate-800"}`}>{task.title}</p>
        <button className="text-slate-300 hover:text-slate-500 shrink-0"><MoreHorizontal className="w-4 h-4" /></button>
      </div>
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${task.catC}`}>{task.cat}</span>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${task.priC}`}>
          <Flag className="w-2.5 h-2.5" />{task.pri}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <CalendarDays className="w-3 h-3" /> {task.date}
        </div>
        {done && <CheckCircle2 className="w-4 h-4 text-lime-500" />}
      </div>
    </div>
  );
}

export function KanbanView() {
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
            <input type="text" placeholder="Search tasks..." className="pl-9 pr-4 py-2 bg-slate-50 border-none rounded-full text-sm outline-none w-64 text-slate-600" />
          </div>
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-50">
            <Bell className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-50">
            <Settings className="w-5 h-5" />
          </button>
          <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Alice&backgroundColor=ccfbf1" alt="Alice" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* Greeting & New Task */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex-1">
            <h2 className="text-2xl font-bold text-slate-800 mb-1">Hey there, Alice 👋</h2>
            <p className="text-slate-500 italic">"May the Task Force be with you."</p>
          </div>
          <button className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-4 rounded-full font-medium flex items-center gap-2 shadow-sm whitespace-nowrap">
            <Plus className="w-5 h-5" /> New Task
          </button>
        </div>

        {/* Today's Focus — full width 3 cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">Today's Focus</h3>
            <button className="text-teal-600 text-sm font-medium hover:text-teal-700">See all</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: "Review Q3 Marketing Strategy", pri: "High", priC: "bg-orange-50 text-orange-600", cat: "Marketing", borderC: "border-l-orange-400", time: "2:00 PM today" },
              { title: "Weekly Team Sync", pri: "Medium", priC: "bg-sky-50 text-sky-600", cat: "Meetings", borderC: "border-l-sky-400", time: "4:30 PM today" },
              { title: "Client Presentation", pri: "High", priC: "bg-teal-50 text-teal-600", cat: "Sales", borderC: "border-l-teal-400", time: "Tomorrow 10 AM" },
            ].map((t, i) => (
              <div key={i} className={`bg-white p-5 rounded-2xl shadow-sm border-l-4 ${t.borderC} flex flex-col gap-3`}>
                <div className="flex items-start justify-between">
                  <h4 className="font-semibold text-slate-800">{t.title}</h4>
                  <button className="text-slate-400 shrink-0 ml-2"><MoreHorizontal className="w-5 h-5" /></button>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium">
                  <span className={`px-2.5 py-1 rounded-full ${t.priC}`}>{t.pri} Priority</span>
                  <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">{t.cat}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-400 mt-auto">
                  <Clock className="w-3 h-3" /> {t.time}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Kanban Board — full width */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">All Tasks</h3>
            <div className="flex items-center gap-1 bg-white p-1 rounded-full shadow-sm border border-slate-100">
              <button className="px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 text-slate-500 hover:text-slate-700">
                <List className="w-4 h-4" /> List
              </button>
              <button className="px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 bg-teal-50 text-teal-700">
                <LayoutGrid className="w-4 h-4" /> Kanban
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-5">
            {/* To Do column */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-400"></div>
                  <span className="font-semibold text-slate-700 text-sm">To Do</span>
                  <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full">{tasks.todo.length}</span>
                </div>
                <button className="text-slate-400 hover:text-teal-600 transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                {tasks.todo.map(t => <KanbanCard key={t.id} task={t} />)}
              </div>
            </div>

            {/* In Progress column */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-sky-400"></div>
                  <span className="font-semibold text-slate-700 text-sm">In Progress</span>
                  <span className="bg-sky-100 text-sky-700 text-xs font-bold px-2 py-0.5 rounded-full">{tasks.inProgress.length}</span>
                </div>
                <button className="text-slate-400 hover:text-teal-600 transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                {tasks.inProgress.map(t => <KanbanCard key={t.id} task={t} />)}
              </div>
            </div>

            {/* Done column */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-lime-500"></div>
                  <span className="font-semibold text-slate-700 text-sm">Done</span>
                  <span className="bg-lime-100 text-lime-700 text-xs font-bold px-2 py-0.5 rounded-full">{tasks.done.length}</span>
                </div>
              </div>
              <div className="space-y-3">
                {tasks.done.map(t => <KanbanCard key={t.id} task={t} done />)}
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
