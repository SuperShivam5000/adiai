import React, { useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatBox } from './components/ChatBox';
import { ChatMessage } from './components/ChatMessage';
import { Menu, Brain } from 'lucide-react';
import type { Conversation, Message, ApiRequest } from './types';
import { BACKEND_URL, REAL_NAME_MAP, MODEL_PROVIDER_MAP, VISION_MODELS, IMAGE_GENERATION_MODELS } from './types';
import axios from 'axios';

function simplifyConversation(conversation: Conversation){
  return conversation.messages
    .filter(msg => !msg.isImage && msg.content.trim() !== '')
    .map(({ role, content }) => ({ role, content }));
};

function App() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const response = await axios.get(BACKEND_URL);
        console.log('GET response:', response.data);
      } catch (error) {
        console.error('GET error:', error);
      }
    }

    const savedConversations = localStorage.getItem('conversations');
    if (savedConversations) {
      setConversations(JSON.parse(savedConversations));
    }
    init();
  }, []);

  useEffect(() => {
    localStorage.setItem('conversations', JSON.stringify(conversations));
  }, [conversations]);

  const createNewConversation = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      timestamp: Date.now(),
    };
    setConversations([newConversation, ...conversations]);
    setActiveConversation(newConversation.id);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const deleteConversation = (id: string) => {
    setConversations(conversations.filter(conv => conv.id !== id));
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
  
    // Update the conversation first (adding user message)
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
  
    // Safety check
    if (!updatedConversation) return;
  
    // Simplify the updated conversation
    const simplifiedMessages = simplifyConversation(updatedConversation);
    console.log("Simplified Messages:\n"+simplifiedMessages);
  
    const apiRequest: ApiRequest = {
      model: REAL_NAME_MAP[model as keyof typeof REAL_NAME_MAP],
      provider: MODEL_PROVIDER_MAP[model as keyof typeof MODEL_PROVIDER_MAP],
      use_search: useSearch,
      image_base64: image?.split(',')[1] || '',
      file_base64: files?.map(file => file.split(',')[1]) || [],
      messages: simplifiedMessages  // <-- Attach simplified conversation here
    };
  
    try {
      const response = await axios.post(BACKEND_URL + 'g4f', apiRequest);
      console.log('POST response:', response.data);
  
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
        console.error('API Error:', response.data.error);
      }
    } catch (error) {
      console.error('POST error:', error);
    }
  
    console.log('API Request:', apiRequest);
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Sidebar
        conversations={conversations}
        activeConversation={activeConversation}
        onSelectConversation={setActiveConversation}
        onNewConversation={createNewConversation}
        onDeleteConversation={deleteConversation}
        isOpen={isSidebarOpen}
      />

      <div className="flex-1 flex flex-col relative">
        <nav className="bg-gray-800 p-4 flex items-center gap-4 shadow-lg">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-3">
            <Brain size={28} className="text-blue-500" />
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