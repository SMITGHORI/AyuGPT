import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Sidebar from './components/Sidebar';
import ChatMessage from './components/ChatMessage';
import InputArea from './components/InputArea';
import LandingPage from './components/LandingPage';
import { Message, ChatSession } from './types';
import { streamChatResponse, generateChatTitle } from './services/geminiService';
import { Menu } from 'lucide-react';

const App: React.FC = () => {
  const [showLanding, setShowLanding] = useState(true);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Ref for auto-scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load sessions from local storage on mount
  useEffect(() => {
    const savedSessions = localStorage.getItem('ayugpt_sessions');
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions);
        setSessions(parsed);
        if (parsed.length > 0) {
          setCurrentSessionId(parsed[0].id);
        } else {
            createNewSession();
        }
      } catch (e) {
        createNewSession();
      }
    } else {
      createNewSession();
    }
  }, []);

  // Save sessions to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('ayugpt_sessions', JSON.stringify(sessions));
  }, [sessions]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (!showLanding) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [sessions, currentSessionId, isLoading, showLanding]);

  const getCurrentSession = () => sessions.find(s => s.id === currentSessionId);

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: uuidv4(),
      title: 'New Health Chat',
      messages: [],
      createdAt: Date.now(),
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    return newSession;
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSessions = sessions.filter(s => s.id !== id);
    setSessions(newSessions);
    if (currentSessionId === id) {
      if (newSessions.length > 0) {
        setCurrentSessionId(newSessions[0].id);
      } else {
        createNewSession();
      }
    }
  };

  const handleClearAllSessions = () => {
    setSessions([]);
    localStorage.removeItem('ayugpt_sessions');
    // Immediately create a new session
    const newSession: ChatSession = {
        id: uuidv4(),
        title: 'New Health Chat',
        messages: [],
        createdAt: Date.now(),
      };
    setSessions([newSession]);
    setCurrentSessionId(newSession.id);
  };

  const handleFeedback = (messageId: string, type: 'up' | 'down') => {
      setSessions(prev => prev.map(session => {
          if (session.id === currentSessionId) {
              return {
                  ...session,
                  messages: session.messages.map(msg => {
                      if (msg.id === messageId) {
                          // Toggle logic: if clicking same type, clear it. If different, set it.
                          const newFeedback = msg.feedback === type ? null : type;
                          return { ...msg, feedback: newFeedback };
                      }
                      return msg;
                  })
              }
          }
          return session;
      }));
  };

  const handleSendMessage = async (content: string) => {
    let session = getCurrentSession();
    if (!session) {
      session = createNewSession();
    }

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    // Update state with user message immediately
    const updatedMessages = [...session.messages, userMessage];
    updateSessionMessages(session.id, updatedMessages);
    setIsLoading(true);

    // Create a placeholder AI message
    const aiMessageId = uuidv4();
    const aiMessagePlaceholder: Message = {
        id: aiMessageId,
        role: 'assistant',
        content: '',
        timestamp: Date.now()
    };
    
    // Add placeholder to UI
    updateSessionMessages(session.id, [...updatedMessages, aiMessagePlaceholder]);

    try {
      let fullResponse = '';
      
      await streamChatResponse(
        session.messages, // Pass history before this new turn
        content,
        (chunk) => {
          fullResponse += chunk;
          // Update the specific AI message in the state
          setSessions(prev => prev.map(s => {
            if (s.id === session!.id) {
              return {
                ...s,
                messages: s.messages.map(m => 
                  m.id === aiMessageId ? { ...m, content: fullResponse } : m
                )
              };
            }
            return s;
          }));
        }
      );

      // Generate title if it's the first message
      if (session.messages.length === 0) {
         generateChatTitle(content).then(title => {
             setSessions(prev => prev.map(s => 
                s.id === session!.id ? { ...s, title } : s
             ));
         });
      }

    } catch (error) {
      console.error("Failed to send message", error);
      // Update the placeholder with error message
       setSessions(prev => prev.map(s => {
            if (s.id === session!.id) {
              return {
                ...s,
                messages: s.messages.map(m => 
                  m.id === aiMessageId ? { ...m, content: "Sorry, I encountered an error. Please check your connection and try again." } : m
                )
              };
            }
            return s;
        }));
    } finally {
      setIsLoading(false);
    }
  };

  const updateSessionMessages = (sessionId: string, newMessages: Message[]) => {
    setSessions(prev => prev.map(s => 
      s.id === sessionId ? { ...s, messages: newMessages } : s
    ));
  };

  const currentMessages = getCurrentSession()?.messages || [];

  if (showLanding) {
    return <LandingPage onStartChat={() => setShowLanding(false)} />;
  }

  return (
    <div className="flex h-screen bg-[#343541] overflow-hidden">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onNewChat={createNewSession}
        onSelectSession={setCurrentSessionId}
        onDeleteSession={deleteSession}
        onClearAll={handleClearAllSessions}
      />

      <main className="flex-1 flex flex-col relative h-full">
        {/* Mobile Header */}
        <div className="flex items-center p-2 text-gray-200 bg-[#343541] border-b border-white/10 md:hidden sticky top-0 z-10">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 rounded-md hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
          >
            <Menu size={24} />
          </button>
          <div className="flex-1 text-center font-normal">{getCurrentSession()?.title || 'New Chat'}</div>
          <div className="w-10"></div> {/* Spacer for alignment */}
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto w-full scroll-smooth pb-40">
           {currentMessages.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full text-white px-4">
                <div className="bg-[#444654] p-4 rounded-full mb-6 shadow-lg">
                   {/* Leaf icon for Ayurveda */}
                   <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                      <path d="M2 22s5.5-5.5 12-5.5 8 8 8 8"/>
                      <path d="M2 2s5.5 5.5 12 5.5 8-8 8-8"/>
                      <path d="M12 12c.33.33 3 1.5 5 2"/>
                   </svg>
                </div>
                <h1 className="text-4xl font-semibold mb-8">AyuGPT</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <span className="text-lg">🌿</span>
                            <span className="font-medium">Ayurveda Examples</span>
                        </div>
                         <button onClick={() => handleSendMessage("What are the best herbs for boosting immunity?")} className="bg-[#40414f] p-3 rounded-md hover:bg-gray-900 transition text-sm text-center">"What are the best herbs for boosting immunity?"</button>
                         <button onClick={() => handleSendMessage("Suggest a diet plan for Kapha body type.")} className="bg-[#40414f] p-3 rounded-md hover:bg-gray-900 transition text-sm text-center">"Suggest a diet plan for Kapha body type."</button>
                    </div>
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-center gap-2 mb-2">
                             <span className="text-lg">🧘</span>
                            <span className="font-medium">Capabilities</span>
                        </div>
                        <div className="bg-[#40414f] p-3 rounded-md text-sm text-center opacity-80 cursor-default">Specialized in Yoga, Meditation, and Herbs</div>
                        <div className="bg-[#40414f] p-3 rounded-md text-sm text-center opacity-80 cursor-default">Speaks English, Hindi, Tamil, and other Indian languages</div>
                    </div>
                     <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-center gap-2 mb-2">
                             <span className="text-lg">🏥</span>
                            <span className="font-medium">Medical Disclaimer</span>
                        </div>
                        <div className="bg-[#40414f] p-3 rounded-md text-sm text-center opacity-80 cursor-default">I am an AI, not a Doctor. Always consult a professional.</div>
                        <div className="bg-[#40414f] p-3 rounded-md text-sm text-center opacity-80 cursor-default">Will politely decline non-health related topics.</div>
                    </div>
                </div>
             </div>
           ) : (
             <div className="flex flex-col pb-20">
               {currentMessages.map((msg) => (
                 <ChatMessage 
                    key={msg.id} 
                    message={msg} 
                    onFeedback={handleFeedback}
                 />
               ))}
               {/* Invisible element to scroll to */}
               <div ref={messagesEndRef} className="h-4" />
             </div>
           )}
        </div>

        {/* Input Area */}
        <InputArea onSendMessage={handleSendMessage} isLoading={isLoading} />
      </main>
    </div>
  );
};

export default App;