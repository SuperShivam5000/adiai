import { User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  return (
    <div className={`flex gap-4 p-6 ${message.role === 'assistant' ? 'bg-gray-800' : ''}`}>
      <div className="flex-shrink-0">
        {message.role === 'assistant' ? (
          <Bot className="w-6 h-6 text-blue-500" />
        ) : (
          <User className="w-6 h-6 text-green-500" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        {message.model && (
          <div className="text-sm text-gray-400 mb-2">
            {message.role === 'user' ? 'You' : `Model: ${message.model}`}
          </div>
        )}
        {message.isImage ? (
          <img 
            src={`data:image/png;base64,${message.content}`} 
            alt="Generated image"
            className="max-w-full rounded-lg shadow-lg"
          />
        ) : (
          <div className="prose prose-invert break-words max-w-full overflow-x-auto text-gray-200 whitespace-pre-wrap">
            <ReactMarkdown>
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
