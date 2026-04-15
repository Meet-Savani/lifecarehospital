import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import chatData from "@/data/chat_questions.json";
import { Send, Bot, User, RotateCcw } from "lucide-react";

export default function PredefinedChat() {
  const { user } = useAuth();
  const firstName = user?.fullName?.split(" ")[0] || "there";
  const LOCAL_STORAGE_KEY = "careCompanionChatHistory";

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length > 1) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };
  
  const [messages, setMessages] = useState(() => {
    // 1. Check local storage for existing chat on mount
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load chat history", e);
    }
    return [];
  });
  
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef(null);

  // Initial greeting and default options
  const defaultOptions = chatData.slice(0, 5); // First 5 questions

  useEffect(() => {
    // On mount, add the welcome message if empty
    if (messages.length === 0) {
      const initialMessage = [
        {
          id: Date.now(),
          role: "bot",
          text: `Hello, ${firstName}! How can I assist you today?`,
          options: defaultOptions,
        },
      ];
      setMessages(initialMessage);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialMessage));
    }
  }, []);

  useEffect(() => {
    // 2. Persist to local storage whenever messages update
    if (messages.length > 0) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(messages));
    }
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSelectOption = (questionObj, customUserText = null) => {
    // 1. Add user message (either custom typed or exact question string)
    const userMsg = {
      id: Date.now(),
      role: "user",
      text: customUserText || questionObj.question,
    };

    // 2. Determine follow-ups
    let followUpOptions = [];
    if (questionObj.related && questionObj.related.length > 0) {
      followUpOptions = questionObj.related.map((id) =>
        chatData.find((q) => q.id === id)
      ).filter(Boolean);
    } else {
      followUpOptions = chatData.slice(0, 2);
    }

    // 3. Add bot answer message
    const botMsg = {
      id: Date.now() + 1,
      role: "bot",
      text: questionObj.answer,
      options: followUpOptions,
      isAnswer: true,
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
  };

  const handleCustomInputSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userInputText = inputValue.trim();

    // Fuzzy match against predefined questions
    const match = chatData.find(q =>
      q.question.toLowerCase().includes(userInputText.toLowerCase()) || 
      userInputText.toLowerCase().includes(q.question.toLowerCase())
    );

    if (match) {
      // If we find a partial match, use it to answer the user!
      handleSelectOption(match, userInputText);
    } else {
      // 1. Add user's custom typed message
      const userMsg = {
        id: Date.now(),
        role: "user",
        text: userInputText,
      };

      // 2. Add bot correction message
      const botMsg = {
        id: Date.now() + 1,
        role: "bot",
        text: "I'm sorry, I couldn't find an exact answer for that. Please select a question from the suggestions below.",
        options: defaultOptions,
      };
      setMessages((prev) => [...prev, userMsg, botMsg]);
    }

    setInputValue("");
  };

  const handleReset = () => {
    // 4. Clear all previous history, flush local storage, and reset to welcome message
    const initialMessage = [
      {
        id: Date.now(),
        role: "bot",
        text: `Hello, ${firstName}! How can I assist you today?`,
        options: defaultOptions,
      },
    ];
    setMessages(initialMessage);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialMessage));
  };

  const handleBackToMenu = () => {
    const userMsg = {
      id: Date.now(),
      role: "user",
      text: "Back to Main Menu",
    };

    const botMsg = {
      id: Date.now() + 1,
      role: "bot",
      text: "Here are the main options you can choose from:",
      options: defaultOptions,
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-h-[800px] w-full max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl bg-white/90 backdrop-blur-xl border border-gray-100">
      
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center shadow-md z-10">
        <div className="w-10 h-10 rounded-full bg-white flex flex-shrink-0 items-center justify-center mr-4 shadow-sm">
          <Bot size={24} className="text-blue-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold">Care Companion AI</h2>
          <p className="text-xs text-blue-50 opacity-100">Always here to help you</p>
        </div>
        <button 
          onClick={handleReset}
          className="ml-auto flex items-center space-x-1 text-sm bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors"
          title="Delete all history and restart chat"
        >
          <RotateCcw size={14} />
          <span>Reset</span>
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-gray-50/50 custom-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {/* Bot Avatar */}
            {msg.role === "bot" && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex flex-shrink-0 items-center justify-center mr-3 mt-1 shadow-sm text-white">
                <Bot size={16} />
              </div>
            )}

            <div
              className={`max-w-[85%] sm:max-w-[75%] flex flex-col ${
                msg.role === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`px-5 py-3.5 rounded-2xl shadow-sm text-[15px] leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-tr-none"
                    : "bg-white border text-gray-800 rounded-tl-none border-gray-100 shadow-sm"
                }`}
              >
                {msg.text}
              </div>

              {/* Bot Options (Chips/Buttons) */}
              {msg.role === "bot" && msg.options && msg.options.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {msg.options.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectOption(opt)}
                      className="text-sm px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-100 rounded-full transition-all duration-200 ease-in-out font-medium shadow-sm hover:shadow-md transform hover:-translate-y-0.5 text-left"
                    >
                      {opt.question}
                    </button>
                  ))}
                  
                  {/* Provide 'Back to Main Menu' if it was an answer */}
                  {msg.isAnswer && (
                    <button
                      onClick={handleBackToMenu}
                      className="text-sm px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200 rounded-full transition-all duration-200 ease-in-out font-medium mt-1 w-full sm:w-auto text-center"
                    >
                      Back to Main Menu
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* User Avatar */}
            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex flex-shrink-0 items-center justify-center ml-3 mt-1 shadow-sm overflow-hidden text-indigo-700 font-bold text-[11px]">
                {user?.profileImage || user?.avatar ? (
                  <img src={user.profileImage || user.avatar} alt="User" className="w-full h-full object-cover" />
                ) : (
                  getInitials(user?.fullName)
                )}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100">
        <form
          onSubmit={handleCustomInputSubmit}
          className="flex items-center space-x-2 bg-gray-50 p-1.5 rounded-full border border-gray-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a query or select an option above..."
            className="flex-1 bg-transparent px-4 py-2 outline-none text-gray-700 text-sm"
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1"
          >
            <Send size={18} className="translate-x-[-1px] translate-y-[1px]" />
          </button>
        </form>
        <p className="text-center text-[11px] text-gray-500 mt-3 flex justify-center items-center gap-1">
          <Bot size={12}/> AI behaves as a navigator. You can type keywords or select predefined actions.
        </p>
      </div>

    </div>
  );
}
