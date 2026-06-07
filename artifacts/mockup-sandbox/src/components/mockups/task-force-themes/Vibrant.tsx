import React from 'react';
import { 
  Bell, 
  Search, 
  Settings, 
  ListTodo, 
  Clock, 
  CheckCircle2, 
  LayoutDashboard, 
  Plus,
  MoreHorizontal,
  FolderOpen
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function Vibrant() {
  return (
    <div className="min-h-screen bg-indigo-50 font-sans text-slate-800 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 text-white rounded-xl w-10 h-10 flex items-center justify-center font-bold text-lg shadow-sm">
            TF
          </div>
          <span className="font-semibold text-lg text-slate-800">TaskForce</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 w-64 transition-all"
            />
          </div>
          <Button variant="ghost" size="icon" className="text-slate-500 rounded-full hover:bg-slate-100">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-slate-500 rounded-full hover:bg-slate-100">
            <Settings className="h-5 w-5" />
          </Button>
          <Avatar className="h-9 w-9 border-2 border-indigo-100 cursor-pointer">
            <AvatarImage src="https://api.dicebear.com/7.x/notionists/svg?seed=Alice&backgroundColor=e0e7ff" />
            <AvatarFallback>AL</AvatarFallback>
          </Avatar>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-8 space-y-8">
        
        {/* Top Section: Greeting & Add Button */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 w-full md:w-auto flex-1">
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              Hello, Alice <span className="text-3xl">👋</span>
            </h1>
            <p className="text-slate-500 mt-1">You have 8 tasks to complete today.</p>
          </div>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6 py-6 shadow-sm h-auto flex items-center gap-2 font-medium shrink-0">
            <Plus className="h-5 w-5" />
            New Task
          </Button>
        </div>

        {/* Stat Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-blue-100 p-6 rounded-3xl flex flex-col justify-between aspect-square md:aspect-auto md:h-44 shadow-sm border border-blue-200/50">
            <div className="bg-blue-200/50 w-12 h-12 rounded-2xl flex items-center justify-center text-blue-700 mb-4">
              <FolderOpen className="h-6 w-6" />
            </div>
            <div>
              <p className="text-blue-800/70 font-medium mb-1">Total Tasks</p>
              <h3 className="text-4xl font-bold text-blue-800">24</h3>
            </div>
          </div>
          
          <div className="bg-yellow-100 p-6 rounded-3xl flex flex-col justify-between aspect-square md:aspect-auto md:h-44 shadow-sm border border-yellow-200/50">
            <div className="bg-yellow-200/60 w-12 h-12 rounded-2xl flex items-center justify-center text-yellow-700 mb-4">
              <ListTodo className="h-6 w-6" />
            </div>
            <div>
              <p className="text-yellow-800/70 font-medium mb-1">To Do</p>
              <h3 className="text-4xl font-bold text-yellow-800">8</h3>
            </div>
          </div>
          
          <div className="bg-violet-100 p-6 rounded-3xl flex flex-col justify-between aspect-square md:aspect-auto md:h-44 shadow-sm border border-violet-200/50">
            <div className="bg-violet-200/60 w-12 h-12 rounded-2xl flex items-center justify-center text-violet-700 mb-4">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-violet-800/70 font-medium mb-1">In Progress</p>
              <h3 className="text-4xl font-bold text-violet-800">4</h3>
            </div>
          </div>
          
          <div className="bg-emerald-100 p-6 rounded-3xl flex flex-col justify-between aspect-square md:aspect-auto md:h-44 shadow-sm border border-emerald-200/50">
            <div className="bg-emerald-200/60 w-12 h-12 rounded-2xl flex items-center justify-center text-emerald-700 mb-4">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-emerald-800/70 font-medium mb-1">Done</p>
              <h3 className="text-4xl font-bold text-emerald-800">12</h3>
            </div>
          </div>
        </div>

        {/* Today's Focus */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800">Today's Focus</h2>
            <Button variant="ghost" className="text-indigo-600 font-medium hover:bg-indigo-100/50 rounded-full">
              View All
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 border-l-4 border-l-rose-400 flex flex-col gap-3 transition-transform hover:-translate-y-1">
              <div className="flex justify-between items-start">
                <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-none rounded-full px-3 font-medium">High</Badge>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 -mr-2 -mt-2">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
              <h3 className="font-semibold text-slate-800 mt-1 line-clamp-2">Prepare quarterly marketing report</h3>
              <div className="mt-auto pt-4 flex items-center text-sm text-slate-500 gap-2">
                <Clock className="h-4 w-4" />
                <span>Today, 2:00 PM</span>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 border-l-4 border-l-yellow-400 flex flex-col gap-3 transition-transform hover:-translate-y-1">
              <div className="flex justify-between items-start">
                <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-none rounded-full px-3 font-medium">Medium</Badge>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 -mr-2 -mt-2">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
              <h3 className="font-semibold text-slate-800 mt-1 line-clamp-2">Review new homepage design</h3>
              <div className="mt-auto pt-4 flex items-center text-sm text-slate-500 gap-2">
                <Clock className="h-4 w-4" />
                <span>Today, 4:30 PM</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 border-l-4 border-l-indigo-400 flex flex-col gap-3 transition-transform hover:-translate-y-1">
              <div className="flex justify-between items-start">
                <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-none rounded-full px-3 font-medium">Medium</Badge>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 -mr-2 -mt-2">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
              <h3 className="font-semibold text-slate-800 mt-1 line-clamp-2">Sync with engineering team</h3>
              <div className="mt-auto pt-4 flex items-center text-sm text-slate-500 gap-2">
                <Clock className="h-4 w-4" />
                <span>Tomorrow, 10:00 AM</span>
              </div>
            </div>
          </div>
        </div>

        {/* All Tasks */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <Tabs defaultValue="list" className="w-full">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
              <h2 className="text-xl font-bold text-slate-800">All Tasks</h2>
              <TabsList className="bg-slate-100/80 rounded-full p-1 h-auto">
                <TabsTrigger value="list" className="rounded-full px-4 py-1.5 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm text-slate-600">
                  <ListTodo className="h-4 w-4 mr-2" />
                  List
                </TabsTrigger>
                <TabsTrigger value="kanban" className="rounded-full px-4 py-1.5 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm text-slate-600">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Kanban
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="list" className="m-0 border-none outline-none">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="w-12 pl-6 py-4 text-slate-400 font-medium">
                      <Checkbox className="rounded-md border-slate-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600" />
                    </TableHead>
                    <TableHead className="py-4 text-slate-500 font-medium">Task Title</TableHead>
                    <TableHead className="py-4 text-slate-500 font-medium">Category</TableHead>
                    <TableHead className="py-4 text-slate-500 font-medium">Priority</TableHead>
                    <TableHead className="py-4 text-slate-500 font-medium">Status</TableHead>
                    <TableHead className="py-4 text-slate-500 font-medium">Deadline</TableHead>
                    <TableHead className="w-12 pr-6 py-4"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    {
                      id: 1,
                      title: "Draft Q3 goals and objectives",
                      category: "Planning",
                      categoryColor: "bg-slate-100 text-slate-700",
                      priority: "High",
                      priorityColor: "bg-rose-100 text-rose-700",
                      status: "In Progress",
                      statusColor: "bg-violet-100 text-violet-700",
                      deadline: "Today",
                      checked: false
                    },
                    {
                      id: 2,
                      title: "Update user onboarding flow",
                      category: "Design",
                      categoryColor: "bg-fuchsia-100 text-fuchsia-700",
                      priority: "Medium",
                      priorityColor: "bg-yellow-100 text-yellow-700",
                      status: "To Do",
                      statusColor: "bg-slate-100 text-slate-600",
                      deadline: "Tomorrow",
                      checked: false
                    },
                    {
                      id: 3,
                      title: "Fix navigation bug on mobile",
                      category: "Engineering",
                      categoryColor: "bg-blue-100 text-blue-700",
                      priority: "High",
                      priorityColor: "bg-rose-100 text-rose-700",
                      status: "Done",
                      statusColor: "bg-emerald-100 text-emerald-700",
                      deadline: "Yesterday",
                      checked: true
                    },
                    {
                      id: 4,
                      title: "Client kickoff meeting",
                      category: "Meetings",
                      categoryColor: "bg-amber-100 text-amber-700",
                      priority: "High",
                      priorityColor: "bg-rose-100 text-rose-700",
                      status: "To Do",
                      statusColor: "bg-slate-100 text-slate-600",
                      deadline: "Oct 12",
                      checked: false
                    },
                    {
                      id: 5,
                      title: "Approve budget for next quarter",
                      category: "Finance",
                      categoryColor: "bg-emerald-100 text-emerald-700",
                      priority: "Low",
                      priorityColor: "bg-sky-100 text-sky-700",
                      status: "In Progress",
                      statusColor: "bg-violet-100 text-violet-700",
                      deadline: "Oct 15",
                      checked: false
                    }
                  ].map((task) => (
                    <TableRow key={task.id} className="group border-slate-100 hover:bg-indigo-50/30 transition-colors">
                      <TableCell className="pl-6 py-4">
                        <Checkbox 
                          checked={task.checked}
                          className="rounded-md border-slate-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600" 
                        />
                      </TableCell>
                      <TableCell className={`py-4 font-medium ${task.checked ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                        {task.title}
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge variant="secondary" className={`${task.categoryColor} border-none rounded-full px-2.5 font-medium`}>
                          {task.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge variant="secondary" className={`${task.priorityColor} border-none rounded-full px-2.5 font-medium`}>
                          {task.priority}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge variant="secondary" className={`${task.statusColor} border-none rounded-full px-2.5 font-medium flex w-fit items-center gap-1.5`}>
                          {task.status === "Done" && <CheckCircle2 className="h-3 w-3" />}
                          {task.status === "In Progress" && <Clock className="h-3 w-3" />}
                          {task.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 text-slate-500 text-sm">
                        {task.deadline}
                      </TableCell>
                      <TableCell className="pr-6 py-4">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-indigo-100 hover:text-indigo-700">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="kanban" className="p-12 text-center text-slate-500 m-0 border-none outline-none">
              <div className="bg-slate-50 rounded-xl p-12 border border-dashed border-slate-200">
                <LayoutDashboard className="h-10 w-10 mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-medium text-slate-700 mb-1">Kanban Board</h3>
                <p>Switch to Kanban view to manage tasks by status.</p>
                <Button variant="outline" className="mt-6 rounded-full border-slate-300 text-slate-700">
                  Enable Kanban
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
