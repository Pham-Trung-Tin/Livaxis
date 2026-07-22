import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, User, Sparkles } from 'lucide-react';
import { sendMessageToAI, ChatMessage } from '../services/chatApi';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../contexts/auth-context';

export const AIChatbox: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      text: 'Xin chào! Tôi là trợ lý AI của Livaxis. Tôi có thể giúp gì cho bạn về nội thất và không gian sống?',
      role: 'ai',
      timestamp: Date.now(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = typeof textToSend === 'string' ? textToSend : inputValue;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      text: text.trim(),
      role: 'user',
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (typeof textToSend !== 'string') setInputValue('');
    setIsLoading(true);

    try {
      const res = await sendMessageToAI(userMsg.text, messages);
      if (res.success && res.data?.text) {
        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: res.data.text,
          role: 'ai',
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch (error) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Xin lỗi, hiện tại tôi đang gặp chút sự cố kết nối. Vui lòng thử lại sau!',
        role: 'ai',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 w-[350px] sm:w-[400px] h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col border border-neutral-200 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#161311] p-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Sparkles size={20} className="text-[#c8b898]" />
                <span className="font-medium tracking-wide" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Livaxis AI Assistant
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-neutral-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#fbf7f1]">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2 ${
                    msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      msg.role === 'user' ? 'bg-[#c8b898] text-white' : 'bg-white shadow-sm border border-neutral-200 text-[#161311]'
                    }`}
                  >
                    {msg.role === 'user' ? <User size={16} /> : <Sparkles size={16} />}
                  </div>
                  <div
                    className={`p-3 rounded-2xl max-w-[75%] text-[14px] leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[#161311] text-white rounded-tr-none'
                        : 'bg-white border border-neutral-200 text-[#141311] rounded-tl-none shadow-sm'
                    }`}
                  >
                    <ReactMarkdown 
                      components={{
                        p: ({node, ...props}) => <p className="m-0" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-semibold" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pl-4 m-0" {...props} />,
                        li: ({node, ...props}) => <li className="mt-1" {...props} />
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}
              {messages.length === 1 && !isLoading && (
                <div className="flex flex-col gap-2 mt-4 ml-10">
                  <p className="text-[12px] text-neutral-400 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Gợi ý cho bạn:</p>
                  {[
                    'Livaxis có những sản phẩm nội thất nào?',
                    'Làm sao để dùng AI thử nội thất vào phòng?',
                    'Gợi ý cho tôi một bộ sofa phong cách Hiện đại',
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => handleSend(q)}
                      className="text-left bg-white border border-[#c8b898]/40 hover:border-[#c8b898] hover:bg-[#fbf7f1] text-[#141311] text-[13px] px-3 py-2 rounded-xl transition-colors w-fit"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
              {isLoading && (
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-full bg-white shadow-sm border border-neutral-200 text-[#161311] flex items-center justify-center shrink-0">
                    <Sparkles size={16} />
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-neutral-200 rounded-tl-none shadow-sm flex gap-1">
                    <div className="w-2 h-2 bg-neutral-300 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-neutral-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-neutral-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            <div className="p-3 bg-white border-t border-neutral-200 flex items-center gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập tin nhắn..."
                className="flex-1 p-2 bg-[#f9f9f9] border border-neutral-200 rounded-xl focus:outline-none focus:border-[#a08c6a] text-[14px]"
                disabled={isLoading}
              />
              <button
                onClick={() => handleSend()}
                disabled={isLoading || !inputValue.trim()}
                className="p-2 bg-[#161311] text-white rounded-xl hover:bg-[#2a2522] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <Send size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-[#161311] text-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(20,17,14,0.3)] hover:-translate-y-1 transition-transform duration-300"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </div>
  );
};
