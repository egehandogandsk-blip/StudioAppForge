import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Plus, LayoutTemplate, FileBox, LogOut } from 'lucide-react';
import { auth } from '../services/firebase';

export const LauncherPage: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setUser(null);
      navigate('/');
    } catch (err) {
      console.error('Error signing out', err);
      // Fallback for dev bypass
      setUser(null);
      navigate('/');
    }
  };

  const createProject = () => {
    navigate('/studio');
  };

  return (
    <div className="min-h-screen bg-dark text-white flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-black/20 p-6 hidden md:flex flex-col relative z-20">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-glow border border-accent/50">
            <span className="text-white font-black text-2xl leading-none">F</span>
          </div>
          <span className="text-2xl font-black tracking-tight text-white">Forge</span>
        </div>

        <nav className="flex-1 space-y-3">
          <a href="#" className="flex items-center gap-3 px-4 py-3 bg-white/10 rounded-xl text-white border border-white/5 shadow-inner">
            <FileBox className="w-5 h-5 text-accent" />
            <span className="text-sm font-bold tracking-wide">Recent Files</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors border border-transparent hover:border-white/5">
            <LayoutTemplate className="w-5 h-5" />
            <span className="text-sm font-bold tracking-wide">Templates</span>
          </a>
        </nav>

        <div className="pt-6 border-t border-white/5 mt-auto">
          <div className="glass-panel p-3 mb-4 rounded-xl flex items-center gap-3 border border-white/5 bg-white/5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-accent to-purple-500 flex items-center justify-center shadow-glow shrink-0">
              <span className="text-white font-bold text-sm">
                {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{user?.displayName || 'Developer'}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-gray-400 hover:text-white hover:bg-red-500/20 hover:border-red-500/30 rounded-xl transition-all text-sm font-bold border border-transparent"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Hero Create Section */}
          <div className="mb-12 cursor-pointer group" onClick={createProject}>
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl transition-all duration-500 hover:border-accent/40 hover:shadow-glow">
              <div className="absolute inset-0 bg-gradient-to-r from-accent/20 via-indigo-500/10 to-purple-600/20 opacity-50 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
              
              <div className="relative p-10 sm:p-16 flex flex-col md:flex-row items-center justify-between gap-8 z-10">
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500 tracking-tight">
                    Enter the Forge
                  </h2>
                  <p className="text-lg text-gray-400 max-w-xl mx-auto md:mx-0 font-medium leading-relaxed">
                    Launch a new high-performance hybrid canvas. Build game UI, generate assets with AI, and sync directly to your engine.
                  </p>
                </div>
                
                <div className="shrink-0 relative">
                  <div className="absolute inset-0 bg-accent rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                  <div className="w-24 h-24 rounded-full bg-accent/20 border-2 border-accent/40 flex items-center justify-center group-hover:scale-110 group-hover:bg-accent/30 group-hover:border-accent transition-all duration-500 shadow-glow relative z-10">
                    <Plus className="w-10 h-10 text-accent group-hover:text-white transition-colors" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <h3 className="text-xl font-bold mb-6 flex items-center gap-3 tracking-wide">
             <LayoutTemplate className="w-6 h-6 text-indigo-400" />
             Recent Projects
          </h3>
          
          {/* Console-style Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            
            {/* Mock Project 1 */}
            <div className="group rounded-2xl glass-panel overflow-hidden cursor-pointer hover:-translate-y-2 transition-transform duration-500 border border-white/5 hover:border-white/20 shadow-xl">
              <div className="aspect-video bg-dark/80 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover:scale-110 group-hover:opacity-60 transition-all duration-700"></div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-sm">
                  <div className="px-6 py-2 rounded-full bg-accent/80 text-white font-bold shadow-glow tracking-wider text-sm">
                     OPEN FILE
                  </div>
                </div>
              </div>
              <div className="p-5 bg-black/60 backdrop-blur-md border-t border-white/5">
                <h4 className="font-bold text-lg text-white group-hover:text-accent transition-colors">Project Nexus UI</h4>
                <p className="text-sm text-gray-500 mt-2 flex items-center gap-2 font-medium">
                  <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span> Edited 2h ago
                </p>
              </div>
            </div>

            {/* Mock Project 2 */}
            <div className="group rounded-2xl glass-panel overflow-hidden cursor-pointer hover:-translate-y-2 transition-transform duration-500 border border-white/5 hover:border-white/20 shadow-xl">
              <div className="aspect-video bg-dark/80 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/40 via-indigo-900/40 to-blue-900/40 opacity-50 group-hover:scale-110 transition-transform duration-700"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center transform rotate-12 group-hover:rotate-0 transition-transform duration-500">
                    <span className="text-2xl">⚡</span>
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-sm">
                  <div className="px-6 py-2 rounded-full bg-accent/80 text-white font-bold shadow-glow tracking-wider text-sm">
                     OPEN FILE
                  </div>
                </div>
              </div>
              <div className="p-5 bg-black/60 backdrop-blur-md border-t border-white/5">
                <h4 className="font-bold text-lg text-white group-hover:text-accent transition-colors">FPS Mobile HUD</h4>
                <p className="text-sm text-gray-500 mt-2 flex items-center gap-2 font-medium">
                  <span className="w-2 h-2 rounded-full bg-gray-600"></span> Edited yesterday
                </p>
              </div>
            </div>

            {/* Mock Project 3 */}
            <div className="group rounded-2xl glass-panel overflow-hidden cursor-pointer hover:-translate-y-2 transition-transform duration-500 border border-white/5 hover:border-white/20 shadow-xl">
              <div className="aspect-video bg-dark/80 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 opacity-60"></div>
                <div className="absolute inset-0 flex items-center justify-center gap-2">
                  <div className="w-8 h-8 rounded bg-gray-700/50"></div>
                  <div className="w-12 h-8 rounded bg-accent/30 border border-accent/50 -translate-y-2"></div>
                  <div className="w-8 h-8 rounded bg-gray-700/50"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-sm z-10">
                  <div className="px-6 py-2 rounded-full bg-accent/80 text-white font-bold shadow-glow tracking-wider text-sm">
                     OPEN FILE
                  </div>
                </div>
              </div>
              <div className="p-5 bg-black/60 backdrop-blur-md border-t border-white/5">
                <h4 className="font-bold text-lg text-white group-hover:text-accent transition-colors">RPG Inventory Sys</h4>
                <p className="text-sm text-gray-500 mt-2 flex items-center gap-2 font-medium">
                  <span className="w-2 h-2 rounded-full bg-gray-600"></span> Edited 3 days ago
                </p>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};
