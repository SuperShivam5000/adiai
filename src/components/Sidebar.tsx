import { MessageCircle, Plus, Trash2, X } from 'lucide-react';
import type { Conversation } from '../types';

interface SidebarProps {
  conversations: Conversation[];
  activeConversation: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  isOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export function Sidebar({
  conversations,
  activeConversation,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  isOpen,
  setSidebarOpen
}: SidebarProps) {
  const handleNewChat = () => {
    onNewConversation();
    setSidebarOpen(false);
  };

  const handleSelectConversation = (id: string) => {
    onSelectConversation(id);
    setSidebarOpen(false);
  };

  return (
    <div 
      className={`
        fixed md:relative
        ${isOpen ? 'w-full md:w-80 lg:w-96' : 'w-0'} 
        bg-gray-900 h-screen flex flex-col overflow-hidden transition-all duration-300
        z-50
      `}
    >
      {/* Close Button for mobile */}
      <div className="flex justify-end md:hidden p-4">
        <button onClick={() => setSidebarOpen(false)} className="text-white hover:text-gray-400">
          <X size={24} />
        </button>
      </div>

      <button
        onClick={handleNewChat}
        className="flex items-center gap-2 mx-4 my-2 p-3 rounded-lg border border-gray-700 hover:bg-gray-800 text-white text-lg"
      >
        <Plus size={20} />
        New Chat
      </button>
      
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conv) => (
          <div
            key={conv.id}
            className={`
              flex items-center justify-between p-4 cursor-pointer
              hover:bg-gray-800
              ${activeConversation === conv.id ? 'bg-gray-800' : ''}
            `}
            onClick={() => handleSelectConversation(conv.id)}
          >
            <div className="flex items-center gap-3 text-gray-300 flex-1 min-w-0">
              <MessageCircle size={20} />
              <span className="truncate text-base">{conv.title}</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteConversation(conv.id);
              }}
              className="text-gray-400 hover:text-red-500 p-2"
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
