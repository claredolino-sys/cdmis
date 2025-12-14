import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

interface Message {
    id: string;
    role: 'user' | 'model';
    text: string;
}

const AiAssistant: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: 'init', role: 'model', text: 'Hello! I am your BiPSU CDMIS Assistant. I can help you draft memos, explain records management procedures, or answer questions about the system.' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const chatSessionRef = useRef<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim() || isThinking) return;

        const userText = inputValue.trim();
        setInputValue('');
        
        const userMsg: Message = { id: Date.now().toString(), role: 'user', text: userText };
        setMessages(prev => [...prev, userMsg]);
        setIsThinking(true);

        try {
            if (!chatSessionRef.current) {
                // Initialize the Gemini client with the API key from environment variables
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                
                // Create a persistent chat session
                chatSessionRef.current = ai.chats.create({
                    model: 'gemini-2.5-flash',
                    config: {
                        systemInstruction: "You are a helpful, professional, and efficient AI assistant for the Biliran Province State University (BiPSU) Centralized Document Management Information System (CDMIS). Your role is to assist University staff, Records Custodians, and Administrators. You can help draft official memorandums, reports, and letters. You can explain general records management principles (like retention periods, disposal, and classification based on NAP Form 1). Keep your responses concise, professional, and relevant to a university office setting."
                    }
                });
            }

            // Stream the response
            const result = await chatSessionRef.current.sendMessageStream({ message: userText });
            
            const modelMsgId = (Date.now() + 1).toString();
            setMessages(prev => [...prev, { id: modelMsgId, role: 'model', text: '' }]);
            
            let fullResponse = '';

            for await (const chunk of result) {
                const c = chunk as GenerateContentResponse;
                const text = c.text; 
                if (text) {
                    fullResponse += text;
                    setMessages(prev => prev.map(msg => 
                        msg.id === modelMsgId ? { ...msg, text: fullResponse } : msg
                    ));
                }
            }
        } catch (error) {
            console.error("AI Error:", error);
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "I apologize, but I encountered an error connecting to the AI service. Please ensure the API configuration is correct and try again." }]);
        } finally {
            setIsThinking(false);
        }
    };

    return (
        <>
            {/* Trigger Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 h-14 w-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all transform hover:scale-110 z-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                title="BiPSU AI Assistant"
            >
                {isOpen ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                ) : (
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                )}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 flex flex-col overflow-hidden animate-fade-in-up" style={{ maxHeight: 'calc(100vh - 120px)', height: '500px' }}>
                    
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-4 text-white flex items-center justify-between shadow-md">
                        <div className="flex items-center">
                            <div className="bg-white/20 p-1.5 rounded-full mr-3 border border-white/30">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                            </div>
                            <div>
                                <h3 className="font-bold text-sm tracking-wide">AI Assistant</h3>
                                <p className="text-[10px] text-indigo-100 opacity-90 uppercase font-semibold">BiPSU CDMIS</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-indigo-200 hover:text-white transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                                    msg.role === 'user' 
                                        ? 'bg-indigo-600 text-white rounded-br-none' 
                                        : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                                }`}>
                                    <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                                </div>
                            </div>
                        ))}
                        {isThinking && (
                             <div className="flex justify-start">
                                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center space-x-1">
                                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex items-center space-x-2">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Type your question..."
                            className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white shadow-sm"
                            disabled={isThinking}
                        />
                        <button 
                            type="submit" 
                            disabled={!inputValue.trim() || isThinking}
                            className="bg-indigo-600 text-white p-2.5 rounded-full hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-sm"
                        >
                            <svg className="w-4 h-4 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                        </button>
                    </form>
                </div>
            )}
        </>
    );
};

export default AiAssistant;
