import React from 'react';
import { Plus, MessageSquare, Trash2, LogOut, Trash } from 'lucide-react';
import { ChatSession } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  currentSessionId: string | null;
  onNewChat: () => void;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
  onClearAll: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  sessions,
  currentSessionId,
  onNewChat,
  onSelectSession,
  onDeleteSession,
  onClearAll,
}) => {
  const handleClearAllClick = () => {
      if (window.confirm("Are you sure you want to delete all chat history? This action cannot be undone.")) {
          onClearAll();
          if (window.innerWidth < 768) onClose();
      }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 md:hidden"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-[260px] bg-[#202123] text-white transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:inset-auto
        flex flex-col
      `}>
        
        {/* New Chat Button */}
        <div className="p-2">
          <button
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 768) onClose();
            }}
            className="flex items-center gap-3 w-full px-3 py-3 rounded-md border border-white/20 hover:bg-gray-900 transition-colors duration-200 text-sm text-white mb-2"
          >
            <Plus size={16} />
            New chat
          </button>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto px-2 space-y-2">
          <div className="text-xs font-medium text-gray-500 px-3 py-2">History</div>
          {sessions.length === 0 ? (
             <div className="text-sm text-gray-500 px-3 text-center mt-4">No history yet.</div>
          ) : (
             sessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => {
                    onSelectSession(session.id);
                    if (window.innerWidth < 768) onClose();
                  }}
                  className={`
                    group relative flex items-center gap-3 px-3 py-3 text-sm rounded-md cursor-pointer break-all pr-10
                    ${currentSessionId === session.id ? 'bg-[#343541] pr-10' : 'hover:bg-[#2A2B32] text-gray-100'}
                  `}
                >
                  <MessageSquare size={16} className="text-gray-400 shrink-0" />
                  <span className="truncate flex-1">{session.title}</span>
                  
                  {/* Delete Button (visible on hover or active) */}
                  {(currentSessionId === session.id) && (
                     <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
                        <button 
                            className="p-1 text-gray-400 hover:text-white transition-colors"
                            onClick={(e) => onDeleteSession(session.id, e)}
                        >
                            <Trash2 size={14} />
                        </button>
                     </div>
                  )}
                </div>
              ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/20 p-2 space-y-1">
           {sessions.length > 0 && (
             <button 
                onClick={handleClearAllClick}
                className="flex items-center gap-3 w-full px-3 py-3 rounded-md hover:bg-gray-900 transition-colors duration-200 text-sm text-white"
             >
                <Trash size={16} />
                <span>Clear conversations</span>
             </button>
           )}
           <button className="flex items-center gap-3 w-full px-3 py-3 rounded-md hover:bg-gray-900 transition-colors duration-200 text-sm text-white">
             <div className="w-5 h-5 rounded-sm bg-indigo-500 flex items-center justify-center text-[10px] font-bold">A</div>
             <span className="flex-1 text-left">Upgrade to Pro</span>
           </button>
           <button className="flex items-center gap-3 w-full px-3 py-3 rounded-md hover:bg-gray-900 transition-colors duration-200 text-sm text-white">
             <LogOut size={16} />
             <span>Log out</span>
           </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;