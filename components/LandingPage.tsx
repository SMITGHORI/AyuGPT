import React from 'react';
import { ArrowRight, Leaf, Shield, Globe, Sparkles, MessageCircle, Heart } from 'lucide-react';

interface LandingPageProps {
  onStartChat: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStartChat }) => {
  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-hidden relative selection:bg-emerald-500 selection:text-white">
      
      {/* Background Gradients/Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-green-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-10 container mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2 font-bold text-2xl tracking-tight">
          <Leaf className="text-emerald-400" size={32} />
          <span>Ayu<span className="text-emerald-400">GPT</span></span>
        </div>
        <div>
          <button 
            onClick={onStartChat}
            className="hidden md:flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2 rounded-full text-sm font-medium transition-all"
          >
            Launch App <ArrowRight size={16} />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-6 flex flex-col items-center justify-center text-center pt-20 pb-32">
        <div className="animate-fade-in-up">
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-1.5 rounded-full text-sm font-medium inline-block mb-6">
              ✨ The Future of Ayurvedic Wellness
            </span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight max-w-4xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          Your Personal AI <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
            Health Companion
          </span>
        </h1>
        
        <p className="text-xl text-gray-400 mb-10 max-w-2xl leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          Experience ancient wisdom meeting modern AI. Get personalized advice on Ayurveda, nutrition, yoga, and holistic health in your native language.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <button 
            onClick={onStartChat}
            className="group bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-lg font-semibold px-8 py-4 rounded-full shadow-lg shadow-emerald-500/25 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
          >
            Start Chatting for Free
            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <p className="mt-6 text-sm text-gray-500 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <Shield size={14} className="inline mr-1" /> No login required. 100% Free & Private.
        </p>
      </div>

      {/* Features Grid */}
      <div className="relative z-10 bg-gray-900/50 border-t border-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-24">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-800/50 border border-white/10 p-8 rounded-2xl hover:bg-gray-800 transition-colors">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6">
                <Leaf className="text-emerald-400" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Ayurvedic Expertise</h3>
              <p className="text-gray-400 leading-relaxed">
                Trained on Charaka Samhita and modern nutritional science. Understands Doshas (Vata, Pitta, Kapha) and herbal remedies deeply.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-800/50 border border-white/10 p-8 rounded-2xl hover:bg-gray-800 transition-colors">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6">
                <Globe className="text-blue-400" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Multilingual Support</h3>
              <p className="text-gray-400 leading-relaxed">
                Chat fluently in English, Hindi, Tamil, Marathi, and many other Indian regional languages. It speaks your language naturally.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-800/50 border border-white/10 p-8 rounded-2xl hover:bg-gray-800 transition-colors">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6">
                <Shield className="text-purple-400" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Private & Accessible</h3>
              <p className="text-gray-400 leading-relaxed">
                We believe health knowledge should be free. No sign-up, no credit cards, no barriers. Just open and start chatting.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-12 text-center text-gray-500 text-sm">
        <p>
          &copy; {new Date().getFullYear()} AyuGPT. Developed by <a href="https://aahavlabs.in" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 hover:underline transition-colors">Aahav Labs</a>.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;