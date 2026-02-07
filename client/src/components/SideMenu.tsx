import { X, Music, Calendar, Heart, MessageCircle, LogOut } from 'lucide-react';

type PageType = 'dashboard' | 'events' | 'favorites' | 'chat' | 'profile';

interface SideMenuProps {
  showSideMenu: boolean;
  setShowSideMenu: (show: boolean) => void;
  currentPage: PageType;
  lang: string;
  onNavigateDashboard: () => void;
  onNavigateEvents: () => void;
  onNavigateFavorites: () => void;
  onNavigateChatList: () => void;
  onLogout?: () => void;
}

export default function SideMenu({
  showSideMenu,
  setShowSideMenu,
  currentPage,
  lang,
  onNavigateDashboard,
  onNavigateEvents,
  onNavigateFavorites,
  onNavigateChatList,
  onLogout
}: SideMenuProps) {
  const menuItems = [
    {
      id: 'dashboard' as PageType,
      icon: Music,
      label: 'Dashboard',
      onClick: onNavigateDashboard
    },
    {
      id: 'events' as PageType,
      icon: Calendar,
      label: lang === 'hr' ? 'Događaji' : 'Events',
      onClick: onNavigateEvents
    },
    {
      id: 'favorites' as PageType,
      icon: Heart,
      label: lang === 'hr' ? 'Omiljeni događaji' : 'Favorite Events',
      onClick: onNavigateFavorites
    },
    {
      id: 'chat' as PageType,
      icon: MessageCircle,
      label: 'Chat',
      onClick: onNavigateChatList
    }
  ];

  return (
    <>
      {/* Side Menu Overlay */}
      {showSideMenu && (
        <div className="fixed inset-0 bg-black/70 z-40" onClick={() => setShowSideMenu(false)} />
      )}

      {/* Side Menu */}
      <div className={`fixed top-0 left-0 h-full w-72 bg-slate-900 border-r border-slate-700 z-50 transform transition-transform duration-300 ${showSideMenu ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-lagoon to-coral text-xl font-black shadow-lg">TB</span>
              <p className="text-lg font-bold">TuneBuddy</p>
            </div>
            <button onClick={() => setShowSideMenu(false)} className="text-slate-400 hover:text-white">
              <X size={24} />
            </button>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const isActive = currentPage === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => { 
                    if (!isActive) item.onClick(); 
                    setShowSideMenu(false); 
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                    isActive 
                      ? 'bg-gradient-to-r from-lagoon to-coral text-slate-900 font-semibold hover:opacity-90' 
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon size={20} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {onLogout && (
            <div className="mt-8 pt-6 border-t border-slate-700">
              <button
                onClick={() => { onLogout(); setShowSideMenu(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-300 hover:bg-red-500/10 transition"
              >
                <LogOut size={20} />
                {lang === 'hr' ? 'Odjava' : 'Logout'}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
