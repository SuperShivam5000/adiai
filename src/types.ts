export const BACKEND_URL='https://adiai-backend.onrender.com/';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  model?: string;
  isImage?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  timestamp: number;
}

export interface ApiRequest {
  prompt?: string;
  model: string;
  provider: string;
  use_search: boolean;
  image_base64: string;
  file_base64: string[];
  messages?: { role: 'user' | 'assistant'; content: string }[];
}

export const REAL_NAME_MAP = {
  'GPT 4o': 'gpt-4o',
  'Gemini 2.5 Flash': 'gemini',
  'Claude 3.7 Sonnet': 'claude-3.7-sonnet',
  'Phi-4': 'phi-4',
  'Deepseek R1': 'deepseek-r1',
  'Qwen 2.5 Max': 'qwen-2-5-max',
  'Llama 4': 'llamascout',
  'Flux': 'flux',
  'Dall-E-3': 'dall-e-3',
  'Midjourney': 'midjourney'
}

export const MODEL_PROVIDER_MAP = {
  'GPT 4o': 'PollinationsAI',
  'Gemini 2.5 Flash': 'PollinationsAI',
  'Claude 3.7 Sonnet': 'PollinationsAI',
  'Phi-4': 'PollinationsAI',
  'Deepseek R1': 'PollinationsAI',
  'Qwen 2.5 Max': 'HuggingSpace',
  'Llama 4': 'PollinationsAI',
}

export const ICON_MAP: Record<string, string> = {
  'GPT 4o': "🧠👁️📁🔎",
  'Gemini 2.5 Flash': "🧠👁️📁🔎",
  'Claude 3.7 Sonnet': "🧠👁️📁🔎",
  'Phi-4': "🧠👁️📁🔎",
  'Deepseek R1': "🧠📁🔎",
  'Qwen 2.5 Max': "🧠📁🔎",
  'Llama 4': "🧠📁🔎",
  'Flux': "🖼️",
  'Dall-E-3': "🖼️",
  'Midjourney': "🖼️"
}

export const VISION_MODELS = ['Phi-4', 'Gemini 2.5 Flash', 'Claude 3.7 Sonnet', 'GPT 4o'];
export const IMAGE_GENERATION_MODELS = ['Flux', 'Dall-E-3', 'Midjourney'];