import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Paperclip, X } from 'lucide-react';

export default function ClippyAgent({ currentPage, onStartGuide }) {
  const [mode, setMode] = useState('button'); // 'button' | 'agent'
  const [text, setText] = useState('');
  
  const fullText = "It looks like you're trying to find a guide for Settings.\n\nThere is no guide here! 📎\n\nTry looking at other pages.";

  useEffect(() => {
    if (mode === 'agent') {
      let i = 0;
      setText('');
      const interval = setInterval(() => {
        setText(fullText.slice(0, i + 1));
        i++;
        if (i >= fullText.length) clearInterval(interval);
      }, 30);
      return () => clearInterval(interval);
    }
  }, [mode]);

  const handleClick = () => {
    if (currentPage === 'Settings') {
      setMode('agent');
    } else {
      onStartGuide();
    }
  };

  const handleClose = (e) => {
    e.stopPropagation();
    setMode('button');
    setText('');
  };

  // Eye movement logic
  const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (mode !== 'agent') return;
      // Calculate eye movement relative to bottom right
      const x = Math.min(Math.max((e.clientX - (window.innerWidth - 50)) / 20, -3), 3);
      const y = Math.min(Math.max((e.clientY - (window.innerHeight - 50)) / 20, -3), 3);
      setEyePosition({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mode]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {mode === 'agent' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 20, x: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20, x: 20 }}
            className="absolute bottom-16 right-0 mb-4 mr-2 origin-bottom-right"
          >
            {/* Speech Bubble */}
            <div className="bg-[#FFFFCC] text-black border border-black rounded-lg p-4 shadow-[4px_4px_0px_rgba(0,0,0,0.2)] max-w-[250px] relative font-sans text-sm">
              <button 
                onClick={handleClose}
                className="absolute top-1 right-1 p-0.5 hover:bg-black/10 rounded"
              >
                <X className="w-3 h-3 text-black/50" />
              </button>
              <div className="whitespace-pre-wrap font-[Tahoma,sans-serif] leading-tight">
                {text}
                <span className="animate-pulse">|</span>
              </div>
              
              {/* Bubble Tail */}
              <div className="absolute -bottom-[8px] right-6 w-0 h-0 border-l-[8px] border-l-transparent border-r-[0px] border-r-transparent border-t-[8px] border-t-black"></div>
              <div className="absolute -bottom-[6px] right-6 w-0 h-0 border-l-[6px] border-l-transparent border-r-[0px] border-r-transparent border-t-[6px] border-t-[#FFFFCC]"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        layout
        onClick={handleClick}
        animate={mode === 'agent' ? {
          scale: 1.2,
          rotate: [0, -5, 5, -5, 0],
        } : {
          scale: 1,
          rotate: 0,
        }}
        transition={mode === 'agent' ? {
          rotate: { repeat: Infinity, duration: 2, ease: "easeInOut" }
        } : {}}
        className={`relative w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-colors duration-500 overflow-hidden ${
          mode === 'agent' ? 'bg-transparent shadow-none' : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        <AnimatePresence mode="wait">
          {mode === 'button' ? (
            <motion.div
              key="help"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <HelpCircle className="w-7 h-7" />
            </motion.div>
          ) : (
            <motion.div
              key="clippy"
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: -180 }}
              className="relative w-full h-full flex items-center justify-center"
            >
              {/* Custom CSS Clippy Body */}
              <div className="relative w-10 h-10">
                {/* Paperclip Icon Base */}
                <Paperclip className="w-full h-full text-gray-400 stroke-[1.5]" />
                
                {/* Eyes Container */}
                <div className="absolute top-[10px] left-[8px] w-full flex gap-1">
                  {/* Left Eye */}
                  <div className="w-2.5 h-2.5 bg-white rounded-full border border-gray-600 relative overflow-hidden">
                    <motion.div 
                      className="w-1 h-1 bg-black rounded-full absolute top-0.5 left-0.5"
                      animate={{ x: eyePosition.x, y: eyePosition.y }}
                    />
                  </div>
                  {/* Right Eye */}
                  <div className="w-2.5 h-2.5 bg-white rounded-full border border-gray-600 relative overflow-hidden">
                     <motion.div 
                      className="w-1 h-1 bg-black rounded-full absolute top-0.5 left-0.5"
                      animate={{ x: eyePosition.x, y: eyePosition.y }}
                    />
                  </div>
                </div>

                {/* Eyebrows */}
                <motion.div 
                  animate={{ y: [0, -2, 0] }}
                  transition={{ repeat: Infinity, duration: 4, repeatDelay: 1 }}
                  className="absolute top-[6px] left-[8px] w-2 h-[1px] bg-black rotate-[-10deg]"
                />
                <motion.div 
                  animate={{ y: [0, -2, 0] }}
                  transition={{ repeat: Infinity, duration: 4, repeatDelay: 3 }}
                  className="absolute top-[6px] left-[18px] w-2 h-[1px] bg-black rotate-[10deg]"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}