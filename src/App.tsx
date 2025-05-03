import { useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatBox } from './components/ChatBox';
import { ChatMessage } from './components/ChatMessage';
import { Menu } from 'lucide-react';
import type { Conversation, Message, ApiRequest } from './types';
import { BACKEND_URL, REAL_NAME_MAP, MODEL_PROVIDER_MAP } from './types';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import { saveConversations, loadConversations } from './db';

function simplifyConversation(conversation: Conversation) {
  return conversation.messages
    .filter(msg => !msg.isImage && msg.content.trim() !== '')
    .map(({ role, content }) => ({ role, content }));
}

function App() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const data = await loadConversations();
        if (data && data.length > 0) {
          setConversations(data);
          setActiveConversation(data[0].id);
        } else {
          const newConversation: Conversation = {
            id: Date.now().toString(),
            title: 'New Chat',
            messages: [],
            timestamp: Date.now(),
          };
          setConversations([newConversation]);
          setActiveConversation(newConversation.id);
        }
      } catch (err) {
        console.error('Failed to load from IndexedDB:', err);
      }

      try {
        const response = await axios.get(BACKEND_URL);
        console.log('GET response:', response.data);
      } catch (error) {
        console.error('GET error:', error);
      }
    };

    init();
  }, []);

  useEffect(() => {
    const nonEmpty = conversations.filter(c => c.messages.length > 0);
    saveConversations(nonEmpty).catch(console.error);
  }, [conversations]);

  const createNewConversation = (fromInit = false) => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      timestamp: Date.now(),
    };
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversation(newConversation.id);
    if (!fromInit && window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const deleteConversation = (id: string) => {
    const updated = conversations.filter(conv => conv.id !== id);
    setConversations(updated);
    if (activeConversation === id) {
      setActiveConversation(null);
    }
  };

  const getCurrentConversation = () => {
    return conversations.find(conv => conv.id === activeConversation);
  };

  const handleSubmit = async (
    prompt: string,
    model: string,
    useSearch: boolean,
    image?: string,
    files?: string[]
  ) => {
    const userMessage: Message = {
      role: 'user',
      content: prompt,
      model: model
    };

    let updatedConversations: Conversation[] = [];
    let updatedConversation: Conversation | undefined;

    updatedConversations = conversations.map(conv => {
      if (conv.id === activeConversation) {
        const newConv = {
          ...conv,
          messages: [...conv.messages, userMessage],
          title: conv.messages.length === 0 ? prompt.slice(0, 30) : conv.title,
        };
        updatedConversation = newConv;
        return newConv;
      }
      return conv;
    });

    setConversations(updatedConversations);

    if (!updatedConversation) return;

    const simplifiedMessages = simplifyConversation(updatedConversation);
    const apiRequest: ApiRequest = {
      model: REAL_NAME_MAP[model as keyof typeof REAL_NAME_MAP],
      provider: MODEL_PROVIDER_MAP[model as keyof typeof MODEL_PROVIDER_MAP],
      use_search: useSearch,
      image_base64: image?.split(',')[1] || '',
      file_base64: files?.map(file => file.split(',')[1]) || [],
      messages: simplifiedMessages
    };

    const loadingToast = toast.loading('Generating Response...');

    try {
      const response = await axios.post(BACKEND_URL + 'g4f', apiRequest);
      toast.dismiss(loadingToast);
      toast.success('Response received');

      if (response.data.message || response.data.image_base64) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: response.data.message || response.data.image_base64,
          model: model,
          isImage: !!response.data.image_base64
        };

        const finalConversations = updatedConversations.map(conv => {
          if (conv.id === activeConversation) {
            return {
              ...conv,
              messages: [...conv.messages, assistantMessage],
            };
          }
          return conv;
        });

        setConversations(finalConversations);
      } else if (response.data.error) {
        toast.error('API Error: ' + response.data.error);
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Failed to get response');
      console.error('POST error:', error);
    }

    console.log('API Request:', apiRequest);
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Toaster />

      <Sidebar
        conversations={conversations}
        activeConversation={activeConversation}
        onSelectConversation={setActiveConversation}
        onNewConversation={createNewConversation}
        onDeleteConversation={deleteConversation}
        isOpen={isSidebarOpen}
        setSidebarOpen={setIsSidebarOpen}
      />

      <div className="flex-1 flex flex-col relative">
        <nav className="bg-gray-800 p-4 flex items-center gap-5 shadow-lg">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu size={24} />
          </button>
          <div onClick={() => (window.location.href = '/')} className="flex items-center gap-2 cursor-pointer">
            <img src="/icon.svg" width="40" alt="icon" />
            <span className="text-xl font-semibold">AdiAI</span>
          </div>
        </nav>

        <div className="flex-1 overflow-y-auto">
          {getCurrentConversation()?.messages.map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))}
        </div>

        <div className="p-4 bg-gray-900">
          <ChatBox onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
}

export default App;
