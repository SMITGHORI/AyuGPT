import React from 'react';
import ReactMarkdown from 'react-markdown';
import { User, Bot, Copy, Check, ThumbsUp, ThumbsDown } from 'lucide-react';
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
    <div className={`
      group w-full text-gray-100 border-b border-black/10 dark:border-gray-900/50
      ${isUser ? 'bg-[#343541]' : 'bg-[#444654]'}
    `}>
      <div className="m-auto md:max-w-2xl lg:max-w-[38rem] xl:max-w-3xl p-4 md:py-6 flex gap-4 md:gap-6">
        
        {/* Avatar */}
        <div className="relative flex-shrink-0 flex flex-col relative items-end">
           <div className={`
             w-8 h-8 rounded-sm flex items-center justify-center
             ${isUser ? 'bg-indigo-600' : 'bg-green-500'}
           `}>
             {isUser ? <User size={20} className="text-white" /> : <Bot size={20} className="text-white" />}
           </div>
        </div>

        {/* Content */}
        <div className="relative flex-1 overflow-hidden">
          {/* Author Name */}
          <div className="font-bold text-sm mb-1 opacity-90">
             {isUser ? 'You' : 'AyuGPT'}
          </div>

          <div className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-gray-800 prose-pre:p-4 prose-pre:rounded-lg max-w-none">
             <ReactMarkdown>
                {message.content}
             </ReactMarkdown>
          </div>
          
          {/* Action Buttons (only for AI) */}
          {!isUser && (
            <div className="flex justify-start mt-2 gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
               {/* Copy Button */}
               <button 
                onClick={handleCopy}
                className="text-gray-400 hover:text-white p-1 rounded-md transition-colors flex items-center gap-1 text-xs"
                title="Copy to clipboard"
               >
                 {copied ? <Check size={14} /> : <Copy size={14} />}
               </button>

               {/* Thumbs Up */}
               <button 
                onClick={() => onFeedback(message.id, 'up')}
                className={`p-1 rounded-md transition-colors flex items-center gap-1 text-xs ${message.feedback === 'up' ? 'text-green-400' : 'text-gray-400 hover:text-white'}`}
                title="Good response"
               >
                 <ThumbsUp size={14} />
               </button>

               {/* Thumbs Down */}
               <button 
                onClick={() => onFeedback(message.id, 'down')}
                className={`p-1 rounded-md transition-colors flex items-center gap-1 text-xs ${message.feedback === 'down' ? 'text-red-400' : 'text-gray-400 hover:text-white'}`}
                title="Bad response"
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