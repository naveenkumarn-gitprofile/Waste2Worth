import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Bot, User, Loader2, Minimize2, Maximize2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ChatWidget = ({ isOpen, onClose }) => {
  const { isDark } = useTheme();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);

  const starterQuestions = [
    "What can you help me with?",
    "Tell me about food waste valorization",
    "How does NutriWasteAI work?"
  ];

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: "Hello! I'm the NutriWasteAI Enquiry Agent. I can help you with questions about the platform, food science, nutrition, sustainability, or general topics. Feel free to ask me anything!",
        }
      ]);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleStarterQuestion = (question) => {
    setInputValue(question);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    
    // Add user message to conversation
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Prepare conversation history for multi-turn context
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await fetch('http://localhost:8000/enquiry/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userMessage,
          conversation_history: conversationHistory
        }),
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      } else {
        const errorData = await response.json();
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: errorData.detail || "I apologize, but I'm currently unable to process your request. Please try again later."
        }]);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: "The request timed out. Please try again."
        }]);
      } else {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: "I apologize, but I'm currently unable to connect to the service. Please try again later."
        }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed z-50 transition-all duration-300 ${
        isMinimized 
          ? 'bottom-6 right-6 w-auto' 
          : 'bottom-24 right-6 w-[calc(100vw-24px)] md:w-[380px] md:bottom-24 max-h-[85vh] md:max-h-[70vh]'
      }`}
    >
      <div className={`rounded-xl shadow-2xl overflow-hidden flex flex-col ${isDark ? 'bg-dark-card' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'} backdrop-blur-sm`}>
        {/* Header */}
        <div className="bg-primary-dark text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-secondary/20 p-1.5 rounded-full">
              <Bot className="h-5 w-5 text-secondary" />
            </div>
            <span className="font-semibold">Enquiry Agent</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-primary-light rounded transition-all duration-200 active:scale-95 focus:ring-2 focus:ring-secondary/50"
              aria-label={isMinimized ? "Maximize chat" : "Minimize chat"}
            >
              {isMinimized ? <Maximize2 className="h-4 w-4 hover:scale-110 transition-transform duration-200" /> : <Minimize2 className="h-4 w-4 hover:scale-110 transition-transform duration-200" />}
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-primary-light rounded transition-all duration-200 active:scale-95 focus:ring-2 focus:ring-secondary/50"
              aria-label="Close chat"
            >
              <X className="h-4 w-4 hover:scale-110 transition-transform duration-200" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div 
              className={`overflow-y-auto p-4 space-y-4 flex-1 ${isDark ? 'bg-dark-bg' : 'bg-gray-50'}`}
              style={{ maxHeight: '400px' }}
            >
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex items-start space-x-3 animate-fade-in ${
                    message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  <div className={`flex-shrink-0 ${
                    message.role === 'user' ? 'bg-primary text-white' : 'bg-secondary text-primary-dark'
                  } p-2 rounded-full group-hover:scale-110 transition-transform duration-300`}>
                    {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div
                    className={`flex-1 p-3 rounded-lg max-w-[80%] hover-card ${
                      message.role === 'user'
                        ? 'bg-primary text-white ml-auto'
                        : isDark ? 'bg-dark-card text-dark-text' : 'bg-white text-gray-800'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center space-x-3 animate-fade-in">
                  <div className="bg-secondary text-primary-dark p-2 rounded-full animate-pulse-slow">
                    <Bot className="h-4 w-4 animate-spin" style={{ animationDuration: '3s' }} />
                  </div>
                  <div className={`flex-1 p-3 rounded-lg ${isDark ? 'bg-dark-card' : 'bg-white'}`}>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Starter Questions */}
            {messages.length === 1 && !isLoading && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 animate-fade-in">
                <p className={`text-sm mb-3 ${isDark ? 'text-dark-muted' : 'text-gray-600'}`}>Quick questions:</p>
                <div className="space-y-2">
                  {starterQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleStarterQuestion(question)}
                      className={`w-full text-left p-2 rounded-lg text-sm transition-all duration-200 active:scale-95 focus:ring-2 focus:ring-primary/50 ${
                        isDark 
                          ? 'bg-dark-card hover:bg-gray-700 text-dark-text' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask a question..."
                  className={`flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200 ${
                    isDark
                      ? 'bg-dark-card border-gray-700 text-dark-text placeholder-gray-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputValue.trim()}
                  className="p-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-95 focus:ring-2 focus:ring-secondary/50"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-5 hover:scale-110 transition-transform duration-200" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatWidget;
