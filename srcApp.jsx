import React, { useState, useEffect, useMemo, createContext, useContext } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  DollarSign, 
  MousePointerClick,
  Bell,
  UserCircle,
  LogOut,
  Menu,
  X,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp
} from 'lucide-react';

// ========== MOCK DATA AWAL ==========
const INITIAL_DATA = {
  users: [
    { id: 'U001', name: 'Sabila', role: 'maker', avatar: 'SB' },
    { id: 'U002', name: 'Rian', role: 'maker', avatar: 'RN' },
    { id: 'U003', name: 'Andi', role: 'eksekutor', avatar: 'AD' },
    { id: 'U004', name: 'Budi', role: 'eksekutor', avatar: 'BD' },
  ],
  clients: [
    { id: 'CL001', name: 'Budi Santoso', company: 'PT ABC', wa: '081234567890', email: 'budi@ptabc.com', status: 'Aktif', pic: 'Sabila', tanggalMasuk: '2026-05-15', totalDeal: 25000000, paidAmount: 15000000 },
    { id: 'CL002', name: 'Siti Aminah', company: 'CV Makmur', wa: '081398765432', email: 'siti@cvmakmur.com', status: 'Aktif', pic: 'Rian', tanggalMasuk: '2026-06-01', totalDeal: 18000000, paidAmount: 5000000 },
  ],
  projects: [
    { id: 'PRJ001', name: 'Website Company Profile', clientId: 'CL001', status: 'Sedang Dikerjakan', progress: 70, deadline: '2026-06-20', nilai: 5000000, modal: 2000000 },
    { id: 'PRJ002', name: 'E-Commerce Web Store', clientId: 'CL002', status: 'Belum Mulai', progress: 0, deadline: '2026-07-15', nilai: 12000000, modal: 4000000 },
  ],
  tasks: [
    { id: 'TSK001', name: '🔍 Cari Domain', projectId: 'PRJ001', estMinutes: 15, fee: 50000, status: 'available', assignedTo: null },
    { id: 'TSK002', name: '🌐 Setting Hosting', projectId: 'PRJ001', estMinutes: 20, fee: 75000, status: 'available', assignedTo: null },
    { id: 'TSK003', name: '🎨 Install WordPress', projectId: 'PRJ001', estMinutes: 30, fee: 100000, status: 'available', assignedTo: null },
    { id: 'TSK004', name: '🔧 Setup Payment Gateway', projectId: 'PRJ002', estMinutes: 45, fee: 150000, status: 'available', assignedTo: null },
  ],
  assignments: [],
  domains: [
    { id: 'DOM001', clientId: 'CL001', domain: 'abc.com', expiredDomain: '2026-06-25', hosting: 'Shared Hosting', expiredHosting: '2026-06-30' },
    { id: 'DOM002', clientId: 'CL002', domain: 'makmurstore.com', expiredDomain: '2026-12-15', hosting: 'VPS Basic', expiredHosting: '2026-12-20' },
  ],
  operationalExpenses: [],
  notifications: []
};

// Helper Functions
const formatRupiah = (num) => {
  return 'Rp ' + (num || 0).toLocaleString('id-ID');
};

const getDaysRemaining = (dateStr) => {
  if (!dateStr) return 999;
  const today = new Date();
  today.setHours(0,0,0,0);
  const deadline = new Date(dateStr);
  deadline.setHours(0,0,0,0);
  const diff = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
  return diff;
};

// Context untuk global state
const AppContext = createContext();

export default function App() {
  // State Management
  const [currentUser, setCurrentUser] = useState(null);
  const [showLogin, setShowLogin] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [data, setData] = useState(INITIAL_DATA);
  const [notifications, setNotifications] = useState([]);
  const [toast, setToast] = useState(null);

  // Show Toast
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Add Notification
  const addNotification = (title, message, type = 'info') => {
    const newNotif = {
      id: Date.now(),
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Auto-check untuk deadline & expired
  useEffect(() => {
    const checkDeadlines = () => {
      const newNotifs = [];
      
      // Cek deadline proyek
      data.projects.forEach(project => {
        const daysLeft = getDaysRemaining(project.deadline);
        if (daysLeft <= 3 && daysLeft > 0 && project.status !== 'Selesai') {
          const client = data.clients.find(c => c.id === project.clientId);
          newNotifs.push({
            id: `notif_${project.id}_${Date.now()}`,
            title: '⚠️ Deadline Mendekat!',
            message: `Proyek "${project.name}" (${client?.company}) deadline ${daysLeft} hari lagi!`,
            type: 'warning',
            read: false,
            createdAt: new Date().toISOString()
          });
        }
      });
      
      // Cek expired domain/hosting
      data.domains.forEach(domain => {
        const daysDom = getDaysRemaining(domain.expiredDomain);
        const daysHost = getDaysRemaining(domain.expiredHosting);
        const client = data.clients.find(c => c.id === domain.clientId);
        
        if (daysDom <= 30 && daysDom > 0) {
          newNotifs.push({
            id: `notif_dom_${domain.id}_${Date.now()}`,
            title: '⚠️ Domain Akan Expired!',
            message: `Domain ${domain.domain} (${client?.company}) akan expired dalam ${daysDom} hari!`,
            type: 'danger',
            read: false,
            createdAt: new Date().toISOString()
          });
        }
        
        if (daysHost <= 30 && daysHost > 0) {
          newNotifs.push({
            id: `notif_host_${domain.id}_${Date.now()}`,
            title: '⚠️ Hosting Akan Expired!',
            message: `Hosting ${domain.hosting} (${client?.company}) akan expired dalam ${daysHost} hari!`,
            type: 'warning',
            read: false,
            createdAt: new Date().toISOString()
          });
        }
      });
      
      if (newNotifs.length > 0) {
        setNotifications(prev => [...newNotifs, ...prev]);
      }
    };
    
    checkDeadlines();
    const interval = setInterval(checkDeadlines, 60000); // Cek setiap 1 menit
    
    return () => clearInterval(interval);
  }, [data.projects, data.domains, data.clients]);

  // Login Handler
  const handleLogin = (name, role) => {
    let user = data.users.find(u => u.name === name);
    if (!user) {
      user = {
        id: 'U' + (data.users.length + 1).toString().padStart(3, '0'),
        name: name,
        role: role,
        avatar: name.substring(0,2).toUpperCase()
      };
      setData(prev => ({ ...prev, users: [...prev.users, user] }));
    }
    setCurrentUser(user);
    setShowLogin(false);
    showToast(`Selamat datang, ${name}!`, 'success');
    addNotification('Selamat Datang', `Halo ${name}, selamat bergabung di AgencyOS Pro!`, 'success');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setShowLogin(true);
    setActiveTab('dashboard');
  };

  // Task Functions
  const takeTask = (taskId) => {
    const task = data.tasks.find(t => t.id === taskId);
    if (!task || task.status !== 'available') {
      showToast('Task tidak tersedia!', 'error');
      return;
    }
    
    const newAssign = {
      id: 'A' + Date.now(),
      taskId: taskId,
      executorId: currentUser.id,
      executorName: currentUser.name,
      fee: task.fee,
      assignedAt: new Date().toISOString(),
      completed: false,
      timeSpent: null
    };
    
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === taskId ? { ...t, status: 'assigned', assignedTo: currentUser.id } : t),
      assignments: [...prev.assignments, newAssign]
    }));
    
    showToast(`✅ Task "${task.name}" berhasil diambil!`, 'success');
    addNotification('Task Diambil', `Kamu mengambil task "${task.name}". Selesaikan segera!`, 'info');
  };
  
  const completeTask = (assignId, timeSpent) => {
    const assign = data.assignments.find(a => a.id === assignId);
    if (!assign || assign.completed) return;
    
    if (!timeSpent || timeSpent <= 0) {
      showToast('Masukkan waktu yang dihabiskan!', 'error');
      return;
    }
    
    const task = data.tasks.find(t => t.id === assign.taskId);
    
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === assign.taskId ? { ...t, status: 'available', assignedTo: null } : t),
      assignments: prev.assignments.map(a => a.id === assignId ? {
        ...a,
        completed: true,
        timeSpent: timeSpent,
        completedDate: new Date().toISOString()
      } : a),
      operationalExpenses: [...prev.operationalExpenses, {
        id: 'OP' + Date.now(),
        date: new Date().toISOString(),
        category: 'Fee Eksekutor',
        description: `Fee untuk ${assign.executorName} - ${task?.name}`,
        amount: assign.fee,
        type: 'expense'
      }]
    }));
    
    showToast(`✅ Selesai! Dapat ${formatRupiah(assign.fee)} dalam ${timeSpent} menit`, 'success');
    addNotification('Task Selesai', `Task "${task?.name}" selesai! Kamu mendapat ${formatRupiah(assign.fee)}`, 'success');
  };

  // Stats Calculation
  const stats = useMemo(() => {
    const totalClients = data.clients.length;
    const activeProjects = data.projects.filter(p => p.status === 'Sedang Dikerjakan').length;
    const completedProjects = data.projects.filter(p => p.status === 'Selesai').length;
    const totalIncome = data.clients.reduce((sum, c) => sum + (c.paidAmount || 0), 0);
    const totalPiutang = data.clients.reduce((sum, c) => sum + ((c.totalDeal || 0) - (c.paidAmount || 0)), 0);
    const totalFeeOut = data.assignments.filter(a => a.completed).reduce((sum, a) => sum + a.fee, 0);
    const totalOperasional = data.operationalExpenses.reduce((sum, o) => sum + o.amount, 0);
    const completedTasks = data.assignments.filter(a => a.completed).length;
    const availableTasks = data.tasks.filter(t => t.status === 'available').length;
    const unreadNotif = notifications.filter(n => !n.read).length;
    
    // Earning per executor
    const executorEarnings = {};
    data.assignments.filter(a => a.completed).forEach(a => {
      executorEarnings[a.executorName] = (executorEarnings[a.executorName] || 0) + a.fee;
    });
    
    return {
      totalClients, activeProjects, completedProjects, totalIncome, totalPiutang,
      totalFeeOut, totalOperasional, profit: totalIncome - totalFeeOut - totalOperasional,
      completedTasks, availableTasks, unreadNotif, executorEarnings
    };
  }, [data, notifications]);

  // Mark notification as read
  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Delete notification
  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Jika belum login, tampilkan halaman login
  if (showLogin) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <AppContext.Provider value={{ data, setData, currentUser, showToast, addNotification }}>
      <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row">
        
        {/* SIDEBAR */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-xl">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-lg text-white">AgencyOS Pro</h1>
                  <p className="text-[10px] text-indigo-400 font-semibold">Task & Finance System</p>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* User Profile */}
            <div className="p-5 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-400">
                  {currentUser?.avatar}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{currentUser?.name}</p>
                  <p className="text-[10px] text-slate-400 capitalize">{currentUser?.role === 'maker' ? '👑 Owner' : '🔧 Eksekutor'}</p>
                </div>
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
              <NavItem icon={<LayoutDashboard size={18} />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }} />
              <NavItem icon={<Users size={18} />} label="Client Hub" active={activeTab === 'clients'} onClick={() => { setActiveTab('clients'); setSidebarOpen(false); }} />
              <NavItem icon={<FolderKanban size={18} />} label="Project & Task" active={activeTab === 'projects'} onClick={() => { setActiveTab('projects'); setSidebarOpen(false); }} />
              
              {currentUser?.role === 'eksekutor' && (
                <NavItem icon={<Clock size={18} />} label="Task Board" active={activeTab === 'taskboard'} onClick={() => { setActiveTab('taskboard'); setSidebarOpen(false); }} />
              )}
              
              <NavItem icon={<DollarSign size={18} />} label="Finance Hub" active={activeTab === 'finance'} onClick={() => { setActiveTab('finance'); setSidebarOpen(false); }} />
              <NavItem icon={<MousePointerClick size={18} />} label="Domain & Analytics" active={activeTab === 'analytics'} onClick={() => { setActiveTab('analytics'); setSidebarOpen(false); }} />
            </nav>
            
            {/* Footer */}
            <div className="p-4 border-t border-slate-800">
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition">
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </aside>
        
        {/* MAIN CONTENT */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-slate-900/50 border-b border-slate-800 px-4 md:px-6 py-4 flex items-center justify-between sticky top-0 z-40">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="md:hidden text-slate-400 hover:text-white">
                <Menu className="w-6 h-6" />
              </button>
              <h2 className="text-lg md:text-xl font-bold text-white">
                {activeTab === 'dashboard' && 'Dashboard Executive'}
                {activeTab === 'clients' && 'Client Management Hub'}
                {activeTab === 'projects' && 'Project & Task Tracker'}
                {activeTab === 'taskboard' && 'Task Board - Ambil & Selesaikan Task'}
                {activeTab === 'finance' && 'Finance & Profitability Hub'}
                {activeTab === 'analytics' && 'Domain, Hosting & Analytics'}
              </h2>
            </div>
            
            {/* Notifications Bell */}
            <NotificationsBell 
              notifications={notifications} 
              unreadCount={stats.unreadNotif}
              onMarkAsRead={markAsRead}
              onMarkAllAsRead={markAllAsRead}
              onDelete={deleteNotification}
            />
          </header>
          
          {/* Content Area */}
          <div className="flex-1 overflow-auto p-4 md:p-6">
            {activeTab === 'dashboard' && <Dashboard stats={stats} data={data} currentUser={currentUser} notifications={notifications} />}
            {activeTab === 'clients' && <Clients data={data} setData={setData} showToast={showToast} formatRupiah={formatRupiah} />}
            {activeTab === 'projects' && <Projects data={data} setData={setData} showToast={showToast} formatRupiah={formatRupiah} getDaysRemaining={getDaysRemaining} />}
            {activeTab === 'taskboard' && currentUser?.role === 'eksekutor' && (
              <TaskBoard 
                data={data} 
                setData={setData} 
                currentUser={currentUser}
                onTakeTask={takeTask}
                onCompleteTask={completeTask}
                formatRupiah={formatRupiah}
                showToast={showToast}
              />
            )}
            {activeTab === 'finance' && <Finance data={data} stats={stats} formatRupiah={formatRupiah} />}
            {activeTab === 'analytics' && <Analytics data={data} formatRupiah={formatRupiah} getDaysRemaining={getDaysRemaining} />}
          </div>
        </main>
        
        {/* Toast Notification */}
        {toast && (
          <div className="fixed bottom-5 right-5 z-50 animate-slide-in">
            <div className={`flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border ${
              toast.type === 'success' ? 'bg-emerald-600 border-emerald-500' : 
              toast.type === 'error' ? 'bg-rose-600 border-rose-500' : 'bg-indigo-600 border-indigo-500'
            }`}>
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-white" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-white" />}
              <span className="text-sm font-semibold text-white">{toast.message}</span>
            </div>
          </div>
        )}
        
      </div>
    </AppContext.Provider>
  );
}

// ========== COMPONENTS ==========

const NavItem = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
    {icon}
    <span>{label}</span>
  </button>
);

const LoginPage = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('eksekutor');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onLogin(name.trim(), role);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 flex items-center justify-center p-4">
      <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-2xl max-w-md w-full p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">AgencyOS Pro</h1>
          <p className="text-slate-400 text-sm mt-1">Task Management & Financial System</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">Pilih Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500">
              <option value="eksekutor">🔧 Eksekutor - Pengerja Task</option>
              <option value="maker">👑 Maker - Bos / Owner</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">Nama / Username</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Masukkan nama Anda" className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 placeholder:text-slate-500" required />
          </div>
          
          <button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-600/20">
            Masuk ke Dashboard
          </button>
        </form>
        
        <div className="mt-6 text-center text-[11px] text-slate-500">
          Demo: Eksekutor = "Andi" / Maker = "Sabila"
        </div>
      </div>
    </div>
  );
};

const NotificationsBell = ({ notifications, unreadCount, onMarkAsRead, onMarkAllAsRead, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const getTypeStyles = (type) => {
    switch(type) {
      case 'success': return 'bg-emerald-500/10 border-emerald-500/20';
      case 'warning': return 'bg-amber-500/10 border-amber-500/20';
      case 'danger': return 'bg-rose-500/10 border-rose-500/20';
      default: return 'bg-indigo-500/10 border-indigo-500/20';
    }
  };
  
  const getTypeIcon = (type) => {
    switch(type) {
      case 'success': return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-amber-400" />;
      case 'danger': return <AlertCircle className="w-4 h-4 text-rose-400" />;
      default: return <Bell className="w-4 h-4 text-indigo-400" />;
    }
  };
  
  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="relative p-2 rounded-xl hover:bg-slate-800 transition">
        <Bell className="w-5 h-5 text-slate-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="p-3 border-b border-slate-800 flex justify-between items-center">
            <h3 className="text-sm font-bold text-white">Notifikasi</h3>
            {notifications.length > 0 && (
              <button onClick={onMarkAllAsRead} className="text-[10px] text-indigo-400 hover:text-indigo-300">
                Tandai semua dibaca
              </button>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-sm">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Belum ada notifikasi</p>
              </div>
            ) : (
              notifications.map(notif => (
                <div key={notif.id} className={`p-3 border-b border-slate-800/50 hover:bg-slate-800/50 transition ${!notif.read ? 'bg-slate-800/30' : ''}`}>
                  <div className="flex gap-3">
                    <div className={`p-1.5 rounded-lg ${getTypeStyles(notif.type)}`}>
                      {getTypeIcon(notif.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <p className="text-xs font-bold text-white">{notif.title}</p>
                        <button onClick={() => onDelete(notif.id)} className="text-slate-500 hover:text-slate-300 text-xs">✕</button>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{notif.message}</p>
                      <p className="text-[9px] text-slate-500 mt-1">{new Date(notif.createdAt).toLocaleTimeString()}</p>
                    </div>
                  </div>
                  {!notif.read && (
                    <button onClick={() => onMarkAsRead(notif.id)} className="text-[9px] text-indigo-400 hover:text-indigo-300 mt-1 ml-8">
                      Tandai dibaca
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Dashboard Component
const Dashboard = ({ stats, data, currentUser, notifications }) => {
  const recentNotifications = notifications.slice(0, 5);
  
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Klien" value={stats.totalClients} icon={<Users size={20} />} color="indigo" />
        <StatCard title="Proyek Aktif" value={stats.activeProjects} icon={<FolderKanban size={20} />} color="amber" />
        <StatCard title="Pendapatan" value={formatRupiah(stats.totalIncome)} icon={<DollarSign size={20} />} color="emerald" />
        <StatCard title="Profit Bersih" value={formatRupiah(stats.profit)} icon={<TrendingUp size={20} />} color="purple" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Stats */}
        <div className="card p-6">
          <h3 className="text-sm font-bold text-white mb-4">📋 Statistik Task</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">Task Tersedia</span>
              <span className="text-2xl font-bold text-emerald-400">{stats.availableTasks}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">Task Selesai</span>
              <span className="text-2xl font-bold text-indigo-400">{stats.completedTasks}</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${stats.completedTasks + stats.availableTasks > 0 ? (stats.completedTasks / (stats.completedTasks + stats.availableTasks)) * 100 : 0}%` }} />
            </div>
          </div>
        </div>
        
        {/* Recent Notifications */}
        <div className="card p-6">
          <h3 className="text-sm font-bold text-white mb-4">🔔 Notifikasi Terbaru</h3>
          {recentNotifications.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-4">Belum ada notifikasi</p>
          ) : (
            <div className="space-y-2">
              {recentNotifications.map(notif => (
                <div key={notif.id} className="p-2 rounded-lg bg-slate-800/30">
                  <p className="text-xs font-semibold text-white">{notif.title}</p>
                  <p className="text-[10px] text-slate-400">{notif.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Warning Alerts */}
      <div className="card p-6">
        <h3 className="text-sm font-bold text-white mb-4">⚠️ Pemberitahuan Penting</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {data.projects.filter(p => getDaysRemaining(p.deadline) <= 7 && p.status !== 'Selesai').map(p => {
            const client = data.clients.find(c => c.id === p.clientId);
            return (
              <div key={p.id} className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                <p className="text-xs font-bold text-rose-400">⚠️ Deadline Mendekat!</p>
                <p className="text-xs text-slate-300 mt-1">{p.name} - {client?.company}</p>
                <p className="text-[10px] text-slate-400">Sisa {getDaysRemaining(p.deadline)} hari lagi</p>
              </div>
            );
          })}
          
          {data.domains.filter(d => getDaysRemaining(d.expiredDomain) <= 30).map(d => {
            const client = data.clients.find(c => c.id === d.clientId);
            return (
              <div key={d.id} className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <p className="text-xs font-bold text-amber-400">⚠️ Domain Akan Expired!</p>
                <p className="text-xs text-slate-300 mt-1">{d.domain} - {client?.company}</p>
                <p className="text-[10px] text-slate-400">Expired dalam {getDaysRemaining(d.expiredDomain)} hari</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => {
  const colors = {
    indigo: 'from-indigo-500 to-indigo-600',
    emerald: 'from-emerald-500 to-emerald-600',
    amber: 'from-amber-500 to-amber-600',
    purple: 'from-purple-500 to-purple-600'
  };
  
  return (
    <div className={`bg-gradient-to-r ${colors[color]} rounded-2xl p-5 shadow-lg`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-white/80 text-xs font-medium">{title}</p>
          <p className="text-white text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className="p-2 bg-white/20 rounded-xl">
          {icon}
        </div>
      </div>
    </div>
  );
};

// Clients Component (sederhana - Anda bisa kembangkan)
const Clients = ({ data, setData, showToast, formatRupiah }) => {
  return (
    <div className="card overflow-hidden">
      <div className="p-5 border-b border-slate-800/60 flex justify-between items-center">
        <h3 className="font-bold text-white">Daftar Klien</h3>
        <button className="btn-primary text-sm py-2 px-4">+ Tambah Klien</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-800/50">
            <tr className="text-slate-400 text-xs">
              <th className="p-4">Nama</th>
              <th className="p-4">Perusahaan</th>
              <th className="p-4">Kontak</th>
              <th className="p-4">Status</th>
              <th className="p-4">PIC</th>
              <th className="p-4">Deal</th>
              <th className="p-4">Terbayar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {data.clients.map(client => (
              <tr key={client.id} className="hover:bg-slate-800/30 transition">
                <td className="p-4 font-semibold text-white">{client.name}</td>
                <td className="p-4 text-slate-300">{client.company}</td>
                <td className="p-4 text-slate-400">{client.wa}</td>
                <td className="p-4"><span className="px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400">{client.status}</span></td>
                <td className="p-4 text-slate-300">{client.pic}</td>
                <td className="p-4 text-slate-300">{formatRupiah(client.totalDeal)}</td>
                <td className="p-4 text-emerald-400">{formatRupiah(client.paidAmount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Projects Component
const Projects = ({ data, setData, showToast, formatRupiah, getDaysRemaining }) => {
  return (
    <div className="card overflow-hidden">
      <div className="p-5 border-b border-slate-800/60">
        <h3 className="font-bold text-white">Daftar Proyek</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-800/50">
            <tr className="text-slate-400 text-xs">
              <th className="p-4">Nama Proyek</th>
              <th className="p-4">Klien</th>
              <th className="p-4">Status</th>
              <th className="p-4">Progress</th>
              <th className="p-4">Deadline</th>
              <th className="p-4">Nilai</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {data.projects.map(project => {
              const client = data.clients.find(c => c.id === project.clientId);
              const daysLeft = getDaysRemaining(project.deadline);
              return (
                <tr key={project.id} className="hover:bg-slate-800/30 transition">
                  <td className="p-4 font-semibold text-white">{project.name}</td>
                  <td className="p-4 text-slate-300">{client?.company}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                      project.status === 'Selesai' ? 'bg-emerald-500/10 text-emerald-400' :
                      project.status === 'Sedang Dikerjakan' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-slate-700 text-slate-400'
                    }`}>{project.status}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${project.progress}%` }} />
                      </div>
                      <span className="text-xs text-slate-300">{project.progress}%</span>
                    </div>
                  </td>
                  <td className={`p-4 text-sm ${daysLeft <= 7 ? 'text-rose-400 font-bold' : 'text-slate-400'}`}>{project.deadline}</td>
                  <td className="p-4 text-slate-300">{formatRupiah(project.nilai)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// TaskBoard Component (untuk Eksekutor)
const TaskBoard = ({ data, setData, currentUser, onTakeTask, onCompleteTask, formatRupiah, showToast }) => {
  const [timeSpent, setTimeSpent] = useState({});
  
  const availableTasks = data.tasks.filter(t => t.status === 'available');
  const myTasks = data.assignments.filter(a => a.executorId === currentUser.id && !a.completed);
  
  const handleComplete = (assignId) => {
    const spent = timeSpent[assignId];
    if (spent && spent > 0) {
      onCompleteTask(assignId, spent);
      setTimeSpent(prev => ({ ...prev, [assignId]: '' }));
    } else {
      showToast('Masukkan waktu yang dihabiskan!', 'error');
    }
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Available Tasks */}
      <div className="card">
        <div className="p-5 border-b border-slate-800/60">
          <h3 className="font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            Task Tersedia
          </h3>
          <p className="text-xs text-slate-400 mt-1">Ambil task yang ingin kamu kerjakan</p>
        </div>
        <div className="p-4 space-y-3">
          {availableTasks.length === 0 ? (
            <p className="text-center text-slate-500 py-8">Belum ada task tersedia</p>
          ) : (
            availableTasks.map(task => {
              const project = data.projects.find(p => p.id === task.projectId);
              return (
                <div key={task.id} className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/50 hover:border-slate-700 transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-white">{task.name}</p>
                      <div className="flex gap-3 mt-2">
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {task.estMinutes} menit
                        </span>
                        <span className="text-xs text-emerald-400 font-semibold">{formatRupiah(task.fee)}</span>
                        {project && <span className="text-xs text-slate-500">Proyek: {project.name}</span>}
                      </div>
                    </div>
                    <button onClick={() => onTakeTask(task.id)} className="btn-primary text-sm py-2 px-4">
                      Ambil Task
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      
      {/* My Active Tasks */}
      <div className="card">
        <div className="p-5 border-b border-slate-800/60">
          <h3 className="font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-amber-400" />
            Task Dalam Pengerjaan
          </h3>
          <p className="text-xs text-slate-400 mt-1">Selesaikan task yang sudah kamu ambil</p>
        </div>
        <div className="p-4 space-y-3">
          {myTasks.length === 0 ? (
            <p className="text-center text-slate-500 py-8">Belum ada task yang diambil</p>
          ) : (
            myTasks.map(assign => {
              const task = data.tasks.find(t => t.id === assign.taskId);
              const project = data.projects.find(p => p.id === task?.projectId);
              return (
                <div key={assign.id} className="p-4 bg-slate-800/30 rounded-xl border border-amber-500/30">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-white">{task?.name}</p>
                      <div className="flex gap-3 mt-2">
                        <span className="text-xs text-emerald-400 font-semibold">{formatRupiah(task?.fee)}</span>
                        {project && <span className="text-xs text-slate-500">Proyek: {project.name}</span>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="number" 
                        placeholder="Menit" 
                        value={timeSpent[assign.id] || ''}
                        onChange={(e) => setTimeSpent(prev => ({ ...prev, [assign.id]: e.target.value }))}
                        className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                      />
                      <button onClick={() => handleComplete(assign.id)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition">
                        Selesai
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

// Finance Component
const Finance = ({ data, stats, formatRupiah }) => {
  const totalIncome = stats.totalIncome;
  const totalExpense = stats.totalFeeOut + stats.totalOperasional;
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 text-center">
          <p className="text-slate-400 text-sm">Total Pendapatan</p>
          <p className="text-2xl font-bold text-emerald-400 mt-2">{formatRupiah(totalIncome)}</p>
        </div>
        <div className="card p-6 text-center">
          <p className="text-slate-400 text-sm">Total Pengeluaran</p>
          <p className="text-2xl font-bold text-rose-400 mt-2">{formatRupiah(totalExpense)}</p>
        </div>
        <div className="card p-6 text-center">
          <p className="text-slate-400 text-sm">Laba Bersih</p>
          <p className="text-2xl font-bold text-indigo-400 mt-2">{formatRupiah(stats.profit)}</p>
        </div>
      </div>
      
      {/* Per Eksekutor */}
      <div className="card">
        <div className="p-5 border-b border-slate-800/60">
          <h3 className="font-bold text-white">📊 Pendapatan per Eksekutor</h3>
        </div>
        <div className="p-4 space-y-3">
          {Object.entries(stats.executorEarnings).map(([name, earning]) => (
            <div key={name} className="flex justify-between items-center p-3 bg-slate-800/30 rounded-xl">
              <span className="font-semibold text-white">{name}</span>
              <span className="text-emerald-400 font-bold">{formatRupiah(earning)}</span>
            </div>
          ))}
          {Object.keys(stats.executorEarnings).length === 0 && (
            <p className="text-center text-slate-500 py-4">Belum ada data earning</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Analytics Component
const Analytics = ({ data, formatRupiah, getDaysRemaining }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {data.domains.map(domain => {
        const client = data.clients.find(c => c.id === domain.clientId);
        const daysDom = getDaysRemaining(domain.expiredDomain);
        const daysHost = getDaysRemaining(domain.expiredHosting);
        const isWarning = daysDom <= 30 || daysHost <= 30;
        
        return (
          <div key={domain.id} className={`card p-5 ${isWarning ? 'border-rose-500/30 bg-rose-500/5' : ''}`}>
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-xs text-indigo-400 font-bold">{client?.company}</p>
                <p className="text-lg font-bold text-white">{domain.domain}</p>
              </div>
              {isWarning && <AlertCircle className="w-5 h-5 text-rose-400" />}
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Domain Expired:</span>
                <span className={daysDom <= 30 ? 'text-rose-400 font-bold' : 'text-slate-300'}>{domain.expiredDomain} ({daysDom} hari)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Hosting ({domain.hosting}):</span>
                <span className={daysHost <= 30 ? 'text-rose-400 font-bold' : 'text-slate-300'}>{domain.expiredHosting} ({daysHost} hari)</span>
              </div>
            </div>
            {isWarning && (
              <a href={`https://wa.me/${client?.wa}?text=Halo%20${client?.name},%20kami%20menginfokan%20bahwa%20domain/hosting%20${domain.domain}%20akan%20segera%20habis.`} target="_blank" rel="noreferrer" className="mt-4 block text-center py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 rounded-xl text-xs font-bold transition">
                Kirim Pengingat ke WA
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Helper function yang belum didefinisikan
const getDaysRemaining = (dateStr) => {
  if (!dateStr) return 999;
  const today = new Date();
  today.setHours(0,0,0,0);
  const deadline = new Date(dateStr);
  deadline.setHours(0,0,0,0);
  return Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
};

const formatRupiah = (num) => {
  return 'Rp ' + (num || 0).toLocaleString('id-ID');
};