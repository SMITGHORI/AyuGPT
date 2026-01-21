import React, { useState, useEffect } from 'react';
import { X, Sparkles, Save, Loader2, RefreshCw, Edit3 } from 'lucide-react';

interface RenameModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTitle: string;
  onSave: (newTitle: string) => void;
  onGenerateSuggestions: () => Promise<string[]>;
}

const RenameModal: React.FC<RenameModalProps> = ({ 
    isOpen, 
    onClose, 
    currentTitle, 
    onSave, 
    onGenerateSuggestions 
}) => {
  const [title, setTitle] = useState(currentTitle);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
        setTitle(currentTitle);
        handleGenerate();
    } else {
        setSuggestions([]);
    }
  }, [isOpen, currentTitle]);

  const handleGenerate = async () => {
      setLoading(true);
      try {
          const newSuggestions = await onGenerateSuggestions();
          setSuggestions(newSuggestions);
      } catch (e) {
          console.error("Failed to generate suggestions", e);
      } finally {
          setLoading(false);
      }
  };

  const handleSave = () => {
      if (title.trim()) {
          onSave(title);
          onClose();
      }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in-up">
        <div className="bg-[#202123] rounded-xl border border-white/10 w-full max-w-md shadow-2xl relative overflow-hidden">
            
            {/* Header */}
            <div className="p-5 border-b border-white/10 flex justify-between items-center bg-[#343541]">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Edit3 size={18} className="text-indigo-400"/> Rename Chat
                </h3>
                <button 
                    onClick={onClose}
                    className="text-gray-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            <div className="p-6 space-y-6">
                
                {/* Input Field */}
                <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Chat Title</label>
                    <input 
                        type="text" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-[#343541] border border-white/10 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                        placeholder="Enter chat title..."
                        autoFocus
                    />
                </div>

                {/* Suggestions Section */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                         <label className="text-xs font-medium text-gray-400 uppercase tracking-wider flex items-center gap-1">
                            <Sparkles size={12} className="text-emerald-400"/> AI Suggestions
                         </label>
                         <button 
                            onClick={handleGenerate}
                            disabled={loading}
                            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors disabled:opacity-50"
                         >
                            <RefreshCw size={10} className={loading ? "animate-spin" : ""} /> Refresh
                         </button>
                    </div>
                    
                    {loading ? (
                        <div className="flex flex-col gap-2 opacity-50">
                             <div className="h-8 bg-gray-700/50 rounded-md animate-pulse"></div>
                             <div className="h-8 bg-gray-700/50 rounded-md animate-pulse"></div>
                             <div className="h-8 bg-gray-700/50 rounded-md animate-pulse"></div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {suggestions.length > 0 ? suggestions.map((s, i) => (
                                <button
                                    key={i}
                                    onClick={() => setTitle(s)}
                                    className="text-left px-3 py-2 text-sm text-gray-300 bg-[#343541] hover:bg-gray-700 rounded-md border border-white/5 transition-colors hover:border-emerald-500/30 active:scale-[0.99]"
                                >
                                    {s}
                                </button>
                            )) : (
                                <div className="text-sm text-gray-500 italic">No suggestions available.</div>
                            )}
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-4">
                    <button 
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 rounded-lg border border-white/10 text-gray-300 hover:bg-gray-700 transition-colors text-sm font-medium"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSave}
                        className="flex-1 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                        <Save size={16} /> Save Changes
                    </button>
                </div>

            </div>
        </div>
    </div>
  );
};

export default RenameModal;