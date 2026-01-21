import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Mic, MicOff } from 'lucide-react';

interface InputAreaProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const handleMicClick = () => {
    if (isListening) {
      // Stop logic if we were managing the object manually, but simple toggle for UI here
      // Real stop happens in speech recognition event usually, but we can force stop if we had ref to recognition
      // For this implementation, we just restart or alert if unsupported.
      return; 
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Voice input is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US'; // Could be dynamic
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => (prev ? prev + ' ' : '') + transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <div className="absolute bottom-0 left-0 w-full border-t border-white/20 bg-[#343541] pt-2">
      <div className="mx-auto md:max-w-2xl lg:max-w-[38rem] xl:max-w-3xl px-4 pb-6">
        <div className={`relative flex items-end w-full p-3 bg-[#40414f] rounded-xl shadow-xs border border-black/10 dark:border-gray-900/50 overflow-hidden ring-offset-2 focus-within:ring-2 ring-indigo-500/50 ${isListening ? 'ring-2 ring-red-500' : ''}`}>
          <textarea
            ref={textareaRef}
            tabIndex={0}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "Listening..." : "Send a message..."}
            className="m-0 w-full resize-none border-0 bg-transparent p-0 pl-1 pr-20 text-white focus:ring-0 focus-visible:ring-0 max-h-[200px] overflow-y-auto outline-none"
            style={{ maxHeight: '200px' }}
          />
          
          {/* Microphone Button */}
          <button
            onClick={handleMicClick}
            disabled={isLoading}
            className={`
              absolute right-12 bottom-2.5 p-1 rounded-md transition-colors duration-200
              ${isListening ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-white'}
              ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            title="Voice Input"
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`
              absolute right-3 bottom-2.5 p-1 rounded-md transition-colors duration-200
              ${input.trim() && !isLoading ? 'bg-indigo-500 text-white hover:bg-indigo-600' : 'bg-transparent text-gray-500 cursor-not-allowed'}
            `}
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
        <div className="text-center text-xs text-gray-400 mt-2">
          AyuGPT may produce inaccurate information about people, places, or facts.
        </div>
      </div>
    </div>
  );
};

export default InputArea;