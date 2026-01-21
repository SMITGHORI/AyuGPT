import React from 'react';
import ReactMarkdown from 'react-markdown';
import { User, Sparkles, Copy, Check, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
  onFeedback: (messageId: string, type: 'up' | 'down') => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onFeedback }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full text-gray-100 group">
      <div className="m-auto md:max-w-2xl lg:max-w-[38rem] xl:max-w-3xl px-4 py-6 flex gap-6">
        
        {/* Avatar */}
        <div className="flex-shrink-0 flex flex-col relative items-end">
           <div className={`
             w-8 h-8 rounded-full flex items-center justify-center shadow-lg
             ${isUser ? 'bg-indigo-600' : 'bg-emerald-600'}
           `}>
             {isUser ? <User size={18} className="text-white" /> : <Sparkles size={18} className="text-white" />}
           </div>
        </div>

        {/* Content */}
        <div className="relative flex-1 overflow-hidden">
          {/* Author Name */}
          <div className="font-semibold text-sm mb-2 text-gray-300">
             {isUser ? 'You' : 'AyuGPT'}
          </div>

          <div className="prose prose-invert prose-p:leading-7 prose-li:marker:text-emerald-500 max-w-none text-[15px] md:text-base">
             <ReactMarkdown>
                {message.content}
             </ReactMarkdown>
          </div>
          
          {/* Action Buttons (only for AI) */}
          {!isUser && message.content.length > 0 && (
            <div className="flex justify-start mt-4 gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
               {/* Copy Button */}
               <button 
                onClick={handleCopy}
                className="text-gray-500 hover:text-white p-1.5 rounded-md hover:bg-gray-800 transition-colors flex items-center gap-1 text-xs"
                title="Copy to clipboard"
               >
                 {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
               </button>

               {/* Thumbs Up */}
               <button 
                onClick={() => onFeedback(message.id, 'up')}
                className={`p-1.5 rounded-md transition-colors flex items-center gap-1 text-xs hover:bg-gray-800 ${message.feedback === 'up' ? 'text-green-400' : 'text-gray-500 hover:text-white'}`}
                title="Helpful"
               >
                 <ThumbsUp size={14} />
               </button>

               {/* Thumbs Down */}
               <button 
                onClick={() => onFeedback(message.id, 'down')}
                className={`p-1.5 rounded-md transition-colors flex items-center gap-1 text-xs hover:bg-gray-800 ${message.feedback === 'down' ? 'text-red-400' : 'text-gray-500 hover:text-white'}`}
                title="Not helpful"
               >
                 <ThumbsDown size={14} />
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;