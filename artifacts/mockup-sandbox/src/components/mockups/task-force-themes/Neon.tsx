import React, { useState } from "react";
import {
  Bell,
  CheckCircle2,
  CircleDashed,
  Clock,
  ListTodo,
  MoreVertical,
  Plus,
  Search,
  Settings,
} from "lucide-react";

export function Neon() {
  const [activeTab, setActiveTab] = useState("list");

  return (
    <div className="min-h-screen bg-green-50 font-sans text-slate-800 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 font-bold text-lg">
            TF
          </div>
          <span className="font-semibold text-slate-700 text-lg">TaskForce</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative hidden md:block">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tasks..."
              className="pl-9 pr-4 py-2 bg-slate-50 border-none rounded-full text-sm focus:ring-2 focus:ring-teal-100 outline-none w-64 text-slate-600"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <img
              src="https://api.dicebear.com/7.x/notionists/svg?seed=Alice&backgroundColor=e2e8f0"
              alt="Alice"
              className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-8 space-y-8">
        {/* Top Section: Greeting & Quick Actions */}
        <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
          <div className="bg-white px-8 py-6 rounded-3xl shadow-sm border border-slate-50 flex-1 w-full flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Good morning, Alice ☀️</h1>
              <p className="text-slate-500 mt-1">You have 12 tasks to complete today.</p>
            </div>
            <button className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-full font-medium flex items-center gap-2 transition-colors shadow-sm">
              <Plus className="w-5 h-5" />
              <span>New Task</span>
            </button>
          </div>
        </div>

        {/* Stat Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total */}
          <div className="bg-teal-100 rounded-3xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-20 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
              <ListTodo className="w-24 h-24 text-teal-800" />
            </div>
            <div className="w-12 h-12 rounded-full bg-white/60 flex items-center justify-center mb-6 shadow-sm">
              <ListTodo className="w-6 h-6 text-teal-800" />
            </div>
            <p className="text-teal-800 font-medium">Total Tasks</p>
            <h2 className="text-4xl font-bold text-teal-900 mt-2">48</h2>
          </div>

          {/* To Do */}
          <div className="bg-orange-100 rounded-3xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-20 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
              <CircleDashed className="w-24 h-24 text-orange-800" />
            </div>
            <div className="w-12 h-12 rounded-full bg-white/60 flex items-center justify-center mb-6 shadow-sm">
              <CircleDashed className="w-6 h-6 text-orange-800" />
            </div>
            <p className="text-orange-800 font-medium">To Do</p>
            <h2 className="text-4xl font-bold text-orange-900 mt-2">12</h2>
          </div>

          {/* In Progress */}
          <div className="bg-sky-100 rounded-3xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-20 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
              <Clock className="w-24 h-24 text-sky-800" />
            </div>
            <div className="w-12 h-12 rounded-full bg-white/60 flex items-center justify-center mb-6 shadow-sm">
              <Clock className="w-6 h-6 text-sky-800" />
            </div>
            <p className="text-sky-800 font-medium">In Progress</p>
            <h2 className="text-4xl font-bold text-sky-900 mt-2">5</h2>
          </div>

          {/* Done */}
          <div className="bg-lime-100 rounded-3xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-20 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
              <CheckCircle2 className="w-24 h-24 text-lime-800" />
            </div>
            <div className="w-12 h-12 rounded-full bg-white/60 flex items-center justify-center mb-6 shadow-sm">
              <CheckCircle2 className="w-6 h-6 text-lime-800" />
            </div>
            <p className="text-lime-800 font-medium">Done</p>
            <h2 className="text-4xl font-bold text-lime-900 mt-2">31</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Today's Focus */}
          <div className="xl:col-span-1 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">Today's Focus</h2>
              <button className="text-teal-600 text-sm font-medium hover:text-teal-700">View All</button>
            </div>
            
            <div className="space-y-4">
              {/* Focus Card 1 */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-orange-400">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-slate-800 text-lg">Design System Update</h3>
                    <p className="text-sm text-slate-500 mt-1">Review new component library guidelines</p>
                  </div>
                  <button className="text-slate-400 hover:text-slate-600">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-orange-50 text-orange-600 text-xs font-semibold rounded-full">High</span>
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full">Design</span>
                  </div>
                  <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" /> 2:00 PM
                  </span>
                </div>
              </div>

              {/* Focus Card 2 */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-sky-400">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-slate-800 text-lg">Weekly Team Sync</h3>
                    <p className="text-sm text-slate-500 mt-1">Prepare product roadmap slides</p>
                  </div>
                  <button className="text-slate-400 hover:text-slate-600">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-sky-50 text-sky-600 text-xs font-semibold rounded-full">Medium</span>
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full">Meeting</span>
                  </div>
                  <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" /> 4:30 PM
                  </span>
                </div>
              </div>

              {/* Focus Card 3 */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-teal-400">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-slate-800 text-lg">Client Presentation</h3>
                    <p className="text-sm text-slate-500 mt-1">Finalize deck for Acme Corp</p>
                  </div>
                  <button className="text-slate-400 hover:text-slate-600">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-teal-50 text-teal-600 text-xs font-semibold rounded-full">High</span>
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full">Sales</span>
                  </div>
                  <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Tomorrow
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* All Tasks */}
          <div className="xl:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">All Tasks</h2>
              <div className="bg-white rounded-full p-1 shadow-sm flex">
                <button 
                  onClick={() => setActiveTab("list")}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeTab === "list" ? "bg-teal-50 text-teal-700" : "text-slate-500 hover:text-slate-700"}`}
                >
                  List
                </button>
                <button 
                  onClick={() => setActiveTab("kanban")}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeTab === "kanban" ? "bg-teal-50 text-teal-700" : "text-slate-500 hover:text-slate-700"}`}
                >
                  Kanban
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-slate-50">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 text-sm">
                      <th className="py-4 px-6 font-medium w-12"></th>
                      <th className="py-4 px-6 font-medium">Task Name</th>
                      <th className="py-4 px-6 font-medium">Category</th>
                      <th className="py-4 px-6 font-medium">Priority</th>
                      <th className="py-4 px-6 font-medium">Status</th>
                      <th className="py-4 px-6 font-medium">Deadline</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {/* Row 1 */}
                    <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="w-5 h-5 rounded border-2 border-slate-300 flex items-center justify-center cursor-pointer group-hover:border-teal-400 transition-colors"></div>
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-700">Write Q3 Marketing Report</td>
                      <td className="py-4 px-6"><span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-semibold">Marketing</span></td>
                      <td className="py-4 px-6"><span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-xs font-semibold">High</span></td>
                      <td className="py-4 px-6"><span className="px-3 py-1 bg-sky-50 text-sky-600 rounded-full text-xs font-semibold">In Progress</span></td>
                      <td className="py-4 px-6 text-slate-500 font-medium">Oct 15</td>
                    </tr>
                    
                    {/* Row 2 */}
                    <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="w-5 h-5 rounded border-2 border-slate-300 flex items-center justify-center cursor-pointer group-hover:border-teal-400 transition-colors"></div>
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-700">Update User Onboarding Flow</td>
                      <td className="py-4 px-6"><span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold">Product</span></td>
                      <td className="py-4 px-6"><span className="px-3 py-1 bg-sky-50 text-sky-600 rounded-full text-xs font-semibold">Medium</span></td>
                      <td className="py-4 px-6"><span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-xs font-semibold">To Do</span></td>
                      <td className="py-4 px-6 text-slate-500 font-medium">Oct 18</td>
                    </tr>

                    {/* Row 3 */}
                    <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="w-5 h-5 rounded border-2 border-slate-300 flex items-center justify-center cursor-pointer group-hover:border-teal-400 transition-colors"></div>
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-700">Fix Navigation Bug on Mobile</td>
                      <td className="py-4 px-6"><span className="px-3 py-1 bg-pink-50 text-pink-600 rounded-full text-xs font-semibold">Engineering</span></td>
                      <td className="py-4 px-6"><span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-semibold">Urgent</span></td>
                      <td className="py-4 px-6"><span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-xs font-semibold">To Do</span></td>
                      <td className="py-4 px-6 text-slate-500 font-medium">Oct 12</td>
                    </tr>

                    {/* Row 4 */}
                    <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="w-5 h-5 rounded bg-teal-500 border-2 border-teal-500 flex items-center justify-center cursor-pointer">
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        </div>
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-400 line-through">Review Q4 Budget Draft</td>
                      <td className="py-4 px-6"><span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-semibold">Finance</span></td>
                      <td className="py-4 px-6"><span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-semibold">Low</span></td>
                      <td className="py-4 px-6"><span className="px-3 py-1 bg-lime-50 text-lime-600 rounded-full text-xs font-semibold">Done</span></td>
                      <td className="py-4 px-6 text-slate-400 font-medium">Oct 10</td>
                    </tr>

                    {/* Row 5 */}
                    <tr className="hover:bg-slate-50/50 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="w-5 h-5 rounded border-2 border-slate-300 flex items-center justify-center cursor-pointer group-hover:border-teal-400 transition-colors"></div>
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-700">Interview Candidate for UI/UX</td>
                      <td className="py-4 px-6"><span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-xs font-semibold">HR</span></td>
                      <td className="py-4 px-6"><span className="px-3 py-1 bg-sky-50 text-sky-600 rounded-full text-xs font-semibold">Medium</span></td>
                      <td className="py-4 px-6"><span className="px-3 py-1 bg-sky-50 text-sky-600 rounded-full text-xs font-semibold">In Progress</span></td>
                      <td className="py-4 px-6 text-slate-500 font-medium">Oct 16</td>
                    </tr>
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
