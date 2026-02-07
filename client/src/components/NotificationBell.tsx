import { Bell, User } from 'lucide-react';
import { UnreadMessage } from '../hooks/useNotifications';

interface NotificationBellProps {
  showNotifications: boolean;
  setShowNotifications: (show: boolean) => void;
  unreadMessages: UnreadMessage[];
  totalUnread: number;
  notificationRef: React.RefObject<HTMLDivElement>;
  onNavigateChat: (matchId: number) => void;
  lang: string;
  getImageUrl: (url: string | null) => string;
}

export default function NotificationBell({
  showNotifications,
  setShowNotifications,
  unreadMessages,
  totalUnread,
  notificationRef,
  onNavigateChat,
  lang,
  getImageUrl
}: NotificationBellProps) {
  return (
    <div className="relative" ref={notificationRef}>
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 rounded-lg hover:bg-slate-800 transition text-slate-300 hover:text-white"
        title={lang === 'hr' ? 'Obavijesti' : 'Notifications'}
      >
        <Bell size={22} />
        {totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 bg-coral text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
            {totalUnread > 99 ? '99+' : totalUnread}
          </span>
        )}
      </button>
      
      {showNotifications && (
        <div className="absolute right-0 top-12 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
            <h3 className="font-semibold text-white">
              {lang === 'hr' ? 'Poruke' : 'Messages'}
            </h3>
            {totalUnread > 0 && (
              <span className="text-xs text-slate-400">
                {totalUnread} {lang === 'hr' ? 'nepročitanih' : 'unread'}
              </span>
            )}
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {unreadMessages.length === 0 ? (
              <div className="px-4 py-8 text-center text-slate-400">
                <Bell size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  {lang === 'hr' ? 'Nema novih poruka' : 'No new messages'}
                </p>
              </div>
            ) : (
              unreadMessages.map((msg) => (
                <button
                  key={msg.matchId}
                  onClick={() => {
                    onNavigateChat(msg.matchId);
                    setShowNotifications(false);
                  }}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-800 transition text-left border-b border-slate-800 last:border-b-0"
                >
                  <div className="relative flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
                      {msg.matchImage ? (
                        <img src={getImageUrl(msg.matchImage)} alt={msg.matchName} className="w-full h-full object-cover" />
                      ) : (
                        <User size={20} className="text-slate-400" />
                      )}
                    </div>
                    <span className="absolute -top-1 -right-1 bg-coral text-white text-[10px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center">
                      {msg.unreadCount}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm truncate">{msg.matchName}</p>
                    <p className="text-xs text-slate-400 truncate">{msg.lastMessage}</p>
                  </div>
                  <span className="text-[10px] text-slate-500 flex-shrink-0">
                    {new Date(msg.timestamp).toLocaleTimeString(lang === 'hr' ? 'hr-HR' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
