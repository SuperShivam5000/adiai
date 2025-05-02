import React, { useRef } from 'react';
import { Send, Image, Paperclip, Search } from 'lucide-react';
import { REAL_NAME_MAP } from '../types';

interface ChatBoxProps {
  onSubmit: (prompt: string, model: string, useSearch: boolean, image?: string, files?: string[]) => void;
}

export function ChatBox({ onSubmit }: ChatBoxProps) {
  const [prompt, setPrompt] = React.useState('');
  const [selectedModel, setSelectedModel] = React.useState(Object.keys(REAL_NAME_MAP)[0]);
  const [useSearch, setUseSearch] = React.useState(false);
  const [image, setImage] = React.useState<string>('');
  const [files, setFiles] = React.useState<string[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const filePromises = selectedFiles.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          resolve(`${base64}*${file.name}`);
        };
        reader.readAsDataURL(file);
      });
    });
    
    const base64Files = await Promise.all(filePromises);
    setFiles(base64Files);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSubmit(prompt, selectedModel, useSearch, image, files);
      setPrompt('');
      setImage('');
      setFiles([]);
    }
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <select
        value={selectedModel}
        onChange={(e) => setSelectedModel(e.target.value)}
        className="w-full mb-4 p-2 bg-gray-700 text-white rounded border border-gray-600"
      >
        {Object.entries(REAL_NAME_MAP).map(([model]) => (
          <option key={model} value={model}>
            {model}
          </option>
        ))}
      </select>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Type your message..."
          className="w-full p-3 bg-gray-700 text-white rounded border border-gray-600 min-h-[100px]"
        />

        <div className="flex items-center gap-4">
          <input
            type="file"
            ref={imageInputRef}
            onChange={handleImageChange}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            className="p-2 rounded bg-gray-700 hover:bg-gray-600 text-white"
            title="Attach image"
          >
            <Image size={20} />
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFilesChange}
            multiple
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded bg-gray-700 hover:bg-gray-600 text-white"
            title="Attach files"
          >
            <Paperclip size={20} />
          </button>

          <button
            type="button"
            onClick={() => setUseSearch(!useSearch)}
            className={`p-2 rounded ${useSearch ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'} text-white`}
            title="Enable web search"
          >
            <Search size={20} />
          </button>

          <button
            type="submit"
            className="ml-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
          >
            <Send size={20} />
            Send
          </button>
        </div>

        {image && (
          <div className="relative">
            <img src={image} alt="Selected" className="max-h-40 rounded" />
            <button
              onClick={() => setImage('')}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
            >
              ×
            </button>
          </div>
        )}

        {files.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center gap-2 bg-gray-700 p-2 rounded">
                <span className="text-white">{file.split('*')[1]}</span>
                <button
                  onClick={() => setFiles(files.filter((_, i) => i !== index))}
                  className="text-red-500"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </form>
    </div>
  );
}