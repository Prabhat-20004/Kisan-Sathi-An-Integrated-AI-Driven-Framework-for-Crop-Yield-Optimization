
import React, { useState, useRef, useEffect } from 'react';
import { getCropAdviceStream } from '../services/geminiService';
import { Message } from '../types';
import FarmerMascot from './FarmerMascot';

const Advisory: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'नमस्ते (Namaste)! I am your Kisan Sathi Advisor. How can I help your farm today? You can ask me about pests, crop diseases, or soil management.',
      timestamp: new Date()
    }
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if (!input.trim() && !selectedImage) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      image: selectedImage || undefined,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const stream = getCropAdviceStream(input || "Analyze this image and provide advice.", userMsg.image);
      let currentContent = "";
      
      const assistantMsgId = (Date.now() + 1).toString();
      
      setMessages(prev => [...prev, {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        timestamp: new Date()
      }]);

      for await (const chunk of stream) {
        currentContent += chunk;
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMsgId ? { ...msg, content: currentContent } : msg
        ));
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: 'err',
        role: 'assistant',
        content: "Network error. I've saved your query and will answer when online.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <div className="flex-1 overflow-y-auto space-y-6 pr-1 pb-4">
        {messages.map((m) => (
          <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' && (
              <div className="flex-shrink-0 mt-auto">
                <FarmerMascot size={40} className="rounded-full bg-slate-100 dark:bg-slate-800 p-1 shadow-sm" />
              </div>
            )}
            <div className={`max-w-[85%] rounded-3xl px-4 py-3 shadow-md ${
              m.role === 'user' 
                ? 'bg-green-600 text-white rounded-br-none' 
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-700 rounded-bl-none'
            }`}>
              {m.image && (
                <img src={m.image} alt="uploaded" className="w-full h-32 object-cover rounded-xl mb-2 border border-white/20" />
              )}
              <div className="text-sm leading-relaxed whitespace-pre-wrap markdown-body">{m.content}</div>
              <div className={`text-[10px] mt-2 opacity-40 font-bold ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {isLoading && messages[messages.length - 1].role === 'user' && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0 mt-auto">
              <FarmerMascot size={40} className="rounded-full bg-slate-100 dark:bg-slate-800 p-1 opacity-50" />
            </div>
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl rounded-bl-none px-4 py-3 shadow-md">
              <div className="flex gap-1.5 h-4 items-center">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce [animation-duration:0.6s]"></div>
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce [animation-duration:0.6s] [animation-delay:0.1s]"></div>
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce [animation-duration:0.6s] [animation-delay:0.2s]"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input Area */}
      <div className="mt-4 bg-white dark:bg-slate-800 rounded-3xl p-3 shadow-lg border border-slate-100 dark:border-slate-700">
        {selectedImage && (
          <div className="relative inline-block mb-3 ml-2">
            <img src={selectedImage} alt="preview" className="w-16 h-16 object-cover rounded-xl border-2 border-green-500" />
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
            >
              ×
            </button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <label className="cursor-pointer p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-full transition-colors">
            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
            <svg className="w-6 h-6 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </label>
          <button className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-full transition-colors">
            <svg className="w-6 h-6 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your question..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm dark:text-slate-100 placeholder:dark:text-slate-500"
          />
          <button 
            onClick={handleSend}
            disabled={(!input.trim() && !selectedImage) || isLoading}
            className={`p-2 rounded-2xl transition-all ${
              (!input.trim() && !selectedImage) || isLoading ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-600' : 'bg-green-600 text-white shadow-lg shadow-green-200 dark:shadow-green-900/20'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Advisory;
