import { createContext, useContext, useState } from 'react';

const EMPLOYEES = [
  { id: 'mgr1', name: 'Sarah Chen',    role: 'manager',  phone: '+15550000001' },
  { id: 'emp1', name: 'Alex Johnson',  role: 'employee', phone: '+15550000002' },
  { id: 'emp2', name: 'Jamie Smith',   role: 'employee', phone: '+15550000003' },
  { id: 'emp3', name: 'Casey Brown',   role: 'employee', phone: '+15550000004' },
];

const SEED_TASKS = [
  { id: 't1', title: 'Wipe down counters',        category: 'Facilities',  assignedTo: 'emp1', createdAt: new Date().toISOString() },
  { id: 't2', title: 'Restock cups and lids',     category: 'Stocking',    assignedTo: 'emp1', createdAt: new Date().toISOString() },
  { id: 't3', title: 'Clean coffee machines',     category: 'Operations',  assignedTo: 'emp2', createdAt: new Date().toISOString() },
  { id: 't4', title: 'Greet and assist customers',category: 'Customer',    assignedTo: 'emp3', createdAt: new Date().toISOString() },
];

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [tasks,       setTasks]       = useState(SEED_TASKS);
  const [completions, setCompletions] = useState([]);
  const [swaps,       setSwaps]       = useState([]);

  const employees   = EMPLOYEES;
  const nonManagers = employees.filter(e => e.role !== 'manager');

  const getEmployee  = (id)     => employees.find(e => e.id === id);
  const getTask      = (id)     => tasks.find(t => t.id === id);
  const tasksFor     = (empId)  => tasks.filter(t => t.assignedTo === empId);
  const isCompleted  = (taskId) => completions.includes(taskId);

  const addTask    = (task)            => setTasks(p => [...p, { ...task, id: `t${Date.now()}`, createdAt: new Date().toISOString() }]);
  const updateTask = (taskId, updates) => setTasks(p => p.map(t => t.id === taskId ? { ...t, ...updates } : t));
  const deleteTask = (taskId)          => setTasks(p => p.filter(t => t.id !== taskId));
  const completeTask= (taskId)         => setCompletions(p => [...p, taskId]);
  const addSwap    = (swap)            => setSwaps(p => [...p, { ...swap, id: `sw${Date.now()}`, createdAt: new Date().toISOString(), status: 'pending' }]);

  return (
    <AppContext.Provider value={{
      employees, currentUser, setCurrentUser, nonManagers,
      tasks, getEmployee, getTask, tasksFor, isCompleted,
      addTask, updateTask, deleteTask, completeTask,
      swaps, addSwap,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
