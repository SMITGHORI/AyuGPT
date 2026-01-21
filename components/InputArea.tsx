import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Mic, MicOff, Settings, X, Power, Volume2, VolumeX } from 'lucide-react';

interface InputAreaProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  onPlaySound: (type: 'start' | 'stop') => void;
}

const InputArea: React.FC<InputAreaProps> = ({ onSendMessage, isLoading, onPlaySound }) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // Load mic preference
  useEffect(() => {
    const savedMic = localStorage.getItem('ayugpt_mic_enabled');
    if (savedMic !== null) {
      setMicEnabled(savedMic === 'true');
    }
  }, []);

  // Persist mic preference
  const toggleMicEnabled = () => {
    const newState = !micEnabled;
    setMicEnabled(newState);
    localStorage.setItem('ayugpt_mic_enabled', String(newState));
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const startListening = () => {
     if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Voice input is not supported in this browser.");
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US'; 
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      onPlaySound('start');
    };

    recognition.onend = () => {
      setIsListening(false);
      onPlaySound('stop');
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => (prev ? prev + ' ' : '') + transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
      if (recognitionRef.current) {
          recognitionRef.current.stop();
      }
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="absolute bottom-6 left-0 w-full px-4 z-20">
      <div className="mx-auto md:max-w-2xl lg:max-w-[38rem] xl:max-w-3xl">
        
        {/* Floating Input Container */}
        <div className={`
            relative flex items-end w-full p-3 
            bg-[#40414f]/90 backdrop-blur-md 
            rounded-2xl shadow-xl 
            border border-white/10 
            transition-shadow duration-200
            ${isListening ? 'ring-2 ring-emerald-500/50' : 'focus-within:ring-2 focus-within:ring-indigo-500/30'}
        `}>
          
          {/* Settings Toggle (Mic enable/disable) */}
          <div className="absolute left-[-40px] bottom-3 hidden md:block group">
             <button 
                onClick={toggleMicEnabled}
                className={`p-2 rounded-full bg-[#40414f] border border-white/10 shadow-lg hover:bg-gray-700 transition ${!micEnabled ? 'opacity-50' : 'text-emerald-400'}`}
                title={micEnabled ? "Disable Voice Input" : "Enable Voice Input"}
             >
                {micEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
             </button>
          </div>

          <textarea
            ref={textareaRef}
            tabIndex={0}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "Listening..." : "Ask anything about Ayurveda..."}
            className="m-0 w-full resize-none border-0 bg-transparent p-1 pl-2 pr-24 text-white placeholder-gray-400 focus:ring-0 focus-visible:ring-0 max-h-[200px] overflow-y-auto outline-none"
            style={{ maxHeight: '200px' }}
          />
          
          <div className="absolute right-3 bottom-2 flex items-center gap-2">
            {/* Microphone Button */}
            {micEnabled && (
                <button
                    onClick={handleMicClick}
                    disabled={isLoading}
                    className={`
                    p-2 rounded-xl transition-all duration-200 flex items-center justify-center
                    ${isListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'hover:bg-gray-700/50 text-gray-400 hover:text-white'}
                    ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    title="Voice Input"
                >
                    {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
            )}

            {/* Send Button */}
            <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={`
                p-2 rounded-xl transition-all duration-200 flex items-center justify-center
                ${input.trim() && !isLoading ? 'bg-emerald-600 text-white shadow-lg hover:bg-emerald-500' : 'bg-transparent text-gray-500 cursor-not-allowed'}
                `}
            >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
        </div>
        
        <div className="text-center text-xs text-gray-500 mt-3 font-medium">
          AyuGPT can make mistakes. Consider checking important health information.
        </div>
      </div>
    </div>
  );
};

export default InputArea;