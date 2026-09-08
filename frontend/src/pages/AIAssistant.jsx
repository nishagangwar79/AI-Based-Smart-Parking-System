import { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, AlertCircle } from 'lucide-react';
import { sendChatMessage } from '../services/aiService';

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: "Hello! I am your AI Smart Parking Assistant. I can help you find available parking spots, check rates, locate EV charging stations, and provide real-time parking advice across Delhi NCR. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const sampleQuestions = [
    'Where can I find EV parking in Delhi?',
    'What are the cheapest parking lots available?',
    'Is parking available near Connaught Place?',
    'Which parking lot has the most free slots right now?',
  ];

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (messageText) => {
    const query = messageText || input.trim();
    if (!query || loading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: query,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await sendChatMessage(query);
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: response || 'I processed your request, but received no text response.',
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'error',
        text: err.message || 'Sorry, I encountered an error connecting to the AI service.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-sm">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              AI Parking Assistant
              <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">
                Gemini Powered
              </span>
            </h1>
            <p className="text-sm text-slate-500">Ask anything about parking slots, rates, and locations</p>
          </div>
        </div>
      </div>

      {/* Main Chat Box */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[600px] overflow-hidden">
        {/* Messages list */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => {
            if (msg.role === 'user') {
              return (
                <div key={msg.id} className="flex justify-end items-start space-x-2">
                  <div className="bg-indigo-600 text-white rounded-2xl rounded-tr-none px-4 py-3 max-w-[80%] text-sm shadow-sm">
                    {msg.text}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                </div>
              );
            }

            if (msg.role === 'error') {
              return (
                <div key={msg.id} className="flex items-start space-x-2">
                  <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl rounded-tl-none px-4 py-3 max-w-[80%] text-sm">
                    {msg.text}
                  </div>
                </div>
              );
            }

            return (
              <div key={msg.id} className="flex items-start space-x-2">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-slate-100 text-slate-800 rounded-2xl rounded-tl-none px-4 py-3 max-w-[80%] text-sm whitespace-pre-wrap leading-relaxed">
                  {msg.text}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-start space-x-2">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-100 text-slate-500 rounded-2xl rounded-tl-none px-4 py-3 text-sm flex items-center space-x-2">
                <Sparkles className="w-4 h-4 animate-spin text-indigo-600" />
                <span>Thinking...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Suggestion Chips */}
        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/70 overflow-x-auto flex gap-2">
          {sampleQuestions.map((q) => (
            <button
              key={q}
              onClick={() => handleSend(q)}
              disabled={loading}
              className="text-xs bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-700 px-3 py-1.5 rounded-full whitespace-nowrap transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 sm:p-4 border-t border-slate-200 bg-white flex items-center space-x-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about parking, lots, rates, availability..."
            disabled={loading}
            className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIAssistant;
