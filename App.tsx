import React, { useState, useEffect, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Sidebar from './components/Sidebar';
import ChatMessage from './components/ChatMessage';
import InputArea from './components/InputArea';
import LandingPage from './components/LandingPage';
import { Message, ChatSession } from './types';
import { streamChatResponse, generateChatTitle } from './services/geminiService';
import { Menu, Share2, Check, Copy, X } from 'lucide-react';

// Sound utility
const playTone = (freq: number, type: 'sine' | 'triangle', duration: number) => {
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = type;
        gain.gain.value = 0.03; // Subtle volume
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration);
        osc.stop(ctx.currentTime + duration);
    } catch (e) {
        // Ignore audio errors
    }
};

const App: React.FC = () => {
  const [showLanding, setShowLanding] = useState(true);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  
  // Ref for auto-scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Ref for auto-save debounce
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load sessions from local storage or URL on mount
  useEffect(() => {
    // 1. Check for Shared Link
    const urlParams = new URLSearchParams(window.location.search);
    const sharedData = urlParams.get('share');

    if (sharedData) {
        try {
            const decoded = JSON.parse(decodeURIComponent(escape(atob(sharedData))));
            // Create a new session from shared data
            const sharedSession: ChatSession = {
                id: uuidv4(),
                title: 'Shared Chat',
                messages: decoded,
                createdAt: Date.now()
            };
            setSessions([sharedSession]);
            setCurrentSessionId(sharedSession.id);
            setShowLanding(false);
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
            return;
        } catch (e) {
            console.error("Failed to load shared chat", e);
        }
    }

    // 2. Load from LocalStorage if no share link
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

  // Auto-save with debounce (regular intervals logic)
  useEffect(() => {
    if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
    }
    
    // Save after 1 second of inactivity or change
    saveTimeoutRef.current = setTimeout(() => {
        localStorage.setItem('ayugpt_sessions', JSON.stringify(sessions));
    }, 1000);

    return () => {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    }
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

  const handleShareChat = () => {
      const current = getCurrentSession();
      if (!current || current.messages.length === 0) return;

      try {
          // Encode messages
          const json = JSON.stringify(current.messages);
          // Standard unicode safe base64 encoding
          const encoded = btoa(unescape(encodeURIComponent(json)));
          
          if (encoded.length > 20000) {
              alert("This chat is too long to share via link.");
              return;
          }

          const url = `${window.location.origin}${window.location.pathname}?share=${encoded}`;
          setShareUrl(url);
          setShowShareModal(true);
      } catch (e) {
          console.error("Share error", e);
          alert("Could not generate share link.");
      }
  };

  const handlePlaySound = (type: 'start' | 'stop') => {
      if (type === 'start') playTone(440, 'sine', 0.1);
      if (type === 'stop') playTone(300, 'sine', 0.1);
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

    const updatedMessages = [...session.messages, userMessage];
    updateSessionMessages(session.id, updatedMessages);
    setIsLoading(true);

    // Placeholder AI message
    const aiMessageId = uuidv4();
    const aiMessagePlaceholder: Message = {
        id: aiMessageId,
        role: 'assistant',
        content: '',
        timestamp: Date.now()
    };
    
    updateSessionMessages(session.id, [...updatedMessages, aiMessagePlaceholder]);

    try {
      let fullResponse = '';
      let isFirstChunk = true;
      
      await streamChatResponse(
        session.messages, 
        content,
        (chunk) => {
          if (isFirstChunk) {
              playTone(600, 'triangle', 0.15); // AI start sound
              isFirstChunk = false;
          }
          fullResponse += chunk;
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

      // Automatic Renaming Logic: Trigger after first round trip (2 messages: 1 User, 1 AI) or 2nd round trip
      // Checking updated messages length + 1 (the AI message we just finished)
      const msgCount = updatedMessages.length + 1;
      
      // If we have exactly 2 messages (First Q&A), generate title
      if (msgCount === 2) {
         generateChatTitle(content).then(title => {
             setSessions(prev => prev.map(s => 
                s.id === session!.id ? { ...s, title } : s
             ));
         });
      } 
      // Re-evaluate title after 4 messages for better context if generic
      else if (msgCount === 4 && session.title === 'Health Chat') {
          generateChatTitle(content).then(title => {
             setSessions(prev => prev.map(s => 
                s.id === session!.id ? { ...s, title } : s
             ));
         });
      }

    } catch (error) {
      console.error("Failed to send message", error);
       setSessions(prev => prev.map(s => {
            if (s.id === session!.id) {
              return {
                ...s,
                messages: s.messages.map(m => 
                  m.id === aiMessageId ? { ...m, content: "I apologize, but I encountered a momentary issue. Please try asking again." } : m
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
    <div className="flex h-screen bg-[#343541] overflow-hidden font-sans">
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
        {/* Sticky Header */}
        <div className="flex items-center justify-between p-2 md:p-4 text-gray-200 bg-[#343541]/90 backdrop-blur-sm border-b border-white/5 sticky top-0 z-20">
          <div className="flex items-center">
            <button 
                onClick={() => setSidebarOpen(true)}
                className="p-2 -ml-2 rounded-md hover:bg-gray-800 focus:outline-none md:hidden"
            >
                <Menu size={24} />
            </button>
            <div className="ml-2 font-medium truncate max-w-[200px] md:max-w-md">
                {getCurrentSession()?.title || 'New Chat'}
            </div>
          </div>
          
          <button 
             onClick={handleShareChat}
             className="p-2 hover:bg-gray-800 rounded-md text-gray-400 hover:text-white transition-colors"
             title="Share Chat"
          >
             <Share2 size={20} />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto w-full scroll-smooth pb-40">
           {currentMessages.length === 0 ? (
             <div className="flex flex-col items-center justify-center min-h-[80%] text-white px-4 animate-fade-in-up">
                <div className="bg-[#40414f] p-4 rounded-2xl mb-6 shadow-xl ring-1 ring-white/10">
                   <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
                      <path d="M2 22s5.5-5.5 12-5.5 8 8 8 8"/>
                      <path d="M2 2s5.5 5.5 12 5.5 8-8 8-8"/>
                      <path d="M12 12c.33.33 3 1.5 5 2"/>
                   </svg>
                </div>
                <h1 className="text-3xl font-semibold mb-8">AyuGPT</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-center gap-2 mb-2 text-emerald-400">
                            <span className="text-lg">🌿</span>
                            <span className="font-medium">Ayurveda</span>
                        </div>
                         <button onClick={() => handleSendMessage("What is my Dosha type based on my habits?")} className="bg-[#40414f] hover:bg-[#2A2B32] p-4 rounded-xl transition text-sm text-center border border-white/5">"What is my Dosha type?"</button>
                         <button onClick={() => handleSendMessage("Immunity boosting herbs?")} className="bg-[#40414f] hover:bg-[#2A2B32] p-4 rounded-xl transition text-sm text-center border border-white/5">"Immunity herbs?"</button>
                    </div>
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-center gap-2 mb-2 text-indigo-400">
                             <span className="text-lg">🧘</span>
                            <span className="font-medium">Wellness</span>
                        </div>
                        <div className="bg-[#40414f]/50 p-4 rounded-xl text-sm text-center opacity-80 cursor-default border border-white/5">Yoga & Meditation Guides</div>
                        <div className="bg-[#40414f]/50 p-4 rounded-xl text-sm text-center opacity-80 cursor-default border border-white/5">Modern Nutrition Plans</div>
                    </div>
                     <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-center gap-2 mb-2 text-amber-400">
                             <span className="text-lg">⚠️</span>
                            <span className="font-medium">Note</span>
                        </div>
                        <div className="bg-[#40414f]/50 p-4 rounded-xl text-sm text-center opacity-80 cursor-default border border-white/5">I am an AI, not a Doctor.</div>
                        <div className="bg-[#40414f]/50 p-4 rounded-xl text-sm text-center opacity-80 cursor-default border border-white/5">For serious issues, visit a clinic.</div>
                    </div>
                </div>
             </div>
           ) : (
             <div className="flex flex-col pb-4">
               {currentMessages.map((msg) => (
                 <ChatMessage 
                    key={msg.id} 
                    message={msg} 
                    onFeedback={handleFeedback}
                 />
               ))}
               <div ref={messagesEndRef} className="h-4" />
             </div>
           )}
        </div>

        {/* Input Area */}
        <InputArea 
            onSendMessage={handleSendMessage} 
            isLoading={isLoading} 
            onPlaySound={handlePlaySound}
        />

        {/* Share Modal */}
        {showShareModal && (
            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                <div className="bg-[#202123] rounded-xl border border-white/10 w-full max-w-md p-6 shadow-2xl relative">
                    <button 
                        onClick={() => setShowShareModal(false)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                    <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                        <Share2 size={20} className="text-emerald-500"/> Share Chat
                    </h3>
                    <p className="text-gray-400 text-sm mb-6">
                        Anyone with this link can view this conversation.
                    </p>
                    <div className="flex items-center gap-2 bg-[#343541] p-2 rounded-lg border border-white/10">
                        <input 
                            type="text" 
                            readOnly 
                            value={shareUrl} 
                            className="bg-transparent text-gray-300 text-sm flex-1 outline-none truncate"
                        />
                        <button 
                            onClick={() => {
                                navigator.clipboard.writeText(shareUrl);
                                alert("Link copied!");
                                setShowShareModal(false);
                            }}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                        >
                            Copy
                        </button>
                    </div>
                </div>
            </div>
        )}
      </main>
    </div>
  );
};

export default App;