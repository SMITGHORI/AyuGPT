import React, { useState } from 'react';
import { Plus, MessageSquare, Trash2, LogOut, Trash, Search, X } from 'lucide-react';
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
  const [searchTerm, setSearchTerm] = useState('');

  const handleClearAllClick = () => {
      if (window.confirm("Are you sure you want to delete all chat history? This action cannot be undone.")) {
          onClearAll();
          if (window.innerWidth < 768) onClose();
      }
  };

  const filteredSessions = sessions.filter(session => 
    session.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        
        {/* Header Actions */}
        <div className="p-3 space-y-2">
          <button
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 768) onClose();
            }}
            className="flex items-center gap-3 w-full px-3 py-3 rounded-md border border-white/20 hover:bg-gray-900 transition-colors duration-200 text-sm text-white"
          >
            <Plus size={16} />
            New chat
          </button>

          {/* Search Bar */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={14} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="w-full bg-[#202123] border border-white/10 rounded-md py-2 pl-9 pr-8 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="Search chats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-500 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          <div className="text-xs font-medium text-gray-500 px-3 py-2">
            {searchTerm ? 'Search Results' : 'History'}
          </div>
          
          {sessions.length === 0 ? (
             <div className="text-sm text-gray-500 px-3 text-center mt-4">No history yet.</div>
          ) : filteredSessions.length === 0 ? (
             <div className="text-sm text-gray-500 px-3 text-center mt-4">No matching chats.</div>
          ) : (
            filteredSessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => {
                    onSelectSession(session.id);
                    if (window.innerWidth < 768) onClose();
                  }}
                  className={`
                    group relative flex items-center gap-3 px-3 py-3 text-sm rounded-md cursor-pointer break-all pr-10 transition-colors
                    ${currentSessionId === session.id ? 'bg-[#343541] pr-10' : 'hover:bg-[#2A2B32] text-gray-300'}
                  `}
                >
                  <MessageSquare size={16} className={`shrink-0 ${currentSessionId === session.id ? 'text-white' : 'text-gray-400'}`} />
                  <span className="truncate flex-1">{session.title}</span>
                  
                  {/* Delete Button */}
                  {(currentSessionId === session.id) && (
                     <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center bg-inherit shadow-[-10px_0_10px_0_rgba(52,53,65,1)]">
                        <button 
                            className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                            onClick={(e) => onDeleteSession(session.id, e)}
                            title="Delete Chat"
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
        <div className="border-t border-white/10 p-2 space-y-1">
           {sessions.length > 0 && (
             <button 
                onClick={handleClearAllClick}
                className="flex items-center gap-3 w-full px-3 py-3 rounded-md hover:bg-gray-900 transition-colors duration-200 text-sm text-white"
             >
                <Trash size={16} />
                <span>Clear conversations</span>
             </button>
           )}
           <div className="flex items-center gap-3 w-full px-3 py-3 rounded-md text-sm text-gray-400">
             <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center text-[10px] font-bold text-white">A</div>
             <span className="flex-1 text-left">AyuGPT Free</span>
           </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;