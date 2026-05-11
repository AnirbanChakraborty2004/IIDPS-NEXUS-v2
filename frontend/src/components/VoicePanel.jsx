import React, { useState, useEffect, useRef } from 'react';
import { Mic, CheckCircle2, Loader2, MessageSquare } from 'lucide-react';
import { sendVoiceCommand } from '../services/api';

const VoicePanel = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('System standing by. How can I assist you?');
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState([]);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Initialize Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        setTranscript(finalTranscript || interimTranscript);
        
        if (finalTranscript) {
          handleCommand(finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
        setIsProcessing(false);
        setAiResponse('Microphone error or access denied.');
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      setAiResponse("Your browser does not support Voice AI.");
    }
  }, []);

  const handleCommand = async (text) => {
    setIsListening(false);
    setIsProcessing(true);
    setAiResponse('Processing...');
    
    try {
      const res = await sendVoiceCommand(text);
      setAiResponse(res.response || "Task complete.");
      speak(res.response || "Task complete.");
      
      setHistory(prev => [
        { user: text, ai: res.response || "Task complete.", time: new Date() },
        ...prev
      ].slice(0, 5)); // Keep last 5
      
    } catch (error) {
      setAiResponse("Error communicating with backend API.");
    }
    
    setIsProcessing(false);
  };

  const speak = (text) => {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    
    const voices = synth.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Samantha') || v.lang === 'en-US');
    if (preferredVoice) utterance.voice = preferredVoice;
    
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    synth.speak(utterance);
  };

  const toggleListen = () => {
    if (!recognitionRef.current) return;
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      setAiResponse('Listening...');
      setIsProcessing(false);
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleQuickCommand = (cmd) => {
    setTranscript(cmd);
    handleCommand(cmd);
  };

  return (
    <div className="glass-panel relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-3xl"></div>
      
      <h2 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-4 border-b border-purple-500/20 pb-2 flex items-center gap-2">
        <Mic className="w-4 h-4" /> Vanguard AI // J.A.R.V.I.S
      </h2>
      
      <div className="flex flex-col items-center justify-center my-6">
        <button 
          onClick={toggleListen}
          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 border-2 outline-none
            ${isListening 
              ? 'border-purple-500 bg-purple-500/20 text-purple-400 shadow-[0_0_30px_rgba(176,0,255,0.4)] animate-pulse' 
              : 'border-[#00f0ff] bg-transparent text-[#00f0ff] hover:bg-[#00f0ff]/10 hover:shadow-[0_0_20px_rgba(0,240,255,0.2)]'
            }`}
        >
          <Mic className={`w-8 h-8 ${isListening ? 'animate-bounce' : ''}`} />
        </button>

        {isListening && (
          <div className="flex gap-1 h-6 items-end mt-4">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="w-1 bg-purple-500 rounded-full animate-[waveform_1s_ease-in-out_infinite]" style={{animationDelay: `${i*0.1}s`}}></div>
            ))}
          </div>
        )}
      </div>

      {/* Transcript & Response Area */}
      <div className="bg-black/40 rounded-lg p-4 border border-white/5 min-h-[100px] mb-4">
        {transcript && (
          <div className="mb-2 text-sm text-gray-300">
            <span className="text-purple-400 font-bold mr-2">You:</span>
            {transcript}
          </div>
        )}
        
        <div className="text-sm font-mono flex items-start gap-2">
          <span className="text-[#00f0ff] font-bold mt-0.5">AI:</span>
          {isProcessing ? (
            <span className="flex items-center gap-2 text-gray-400 italic">
              <Loader2 className="w-4 h-4 animate-spin" /> Processing...
            </span>
          ) : (
            <span className="text-emerald-400 flex items-start gap-2">
              {aiResponse !== 'Listening...' && aiResponse !== 'System standing by. How can I assist you?' && <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />}
              {aiResponse}
            </span>
          )}
        </div>
      </div>

      {/* Suggested Commands */}
      <div className="space-y-2">
        <div className="text-xs text-gray-500 uppercase font-semibold mb-2 flex items-center gap-1"><MessageSquare className="w-3 h-3"/> Suggested Actions</div>
        <div className="flex flex-wrap gap-2">
          {["Show system status", "Recent attacks", "Block last threat"].map((cmd, i) => (
            <button 
              key={i}
              onClick={() => handleQuickCommand(cmd)}
              disabled={isListening || isProcessing}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 text-xs rounded-full border border-white/10 transition-colors disabled:opacity-50"
            >
              {cmd}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VoicePanel;
