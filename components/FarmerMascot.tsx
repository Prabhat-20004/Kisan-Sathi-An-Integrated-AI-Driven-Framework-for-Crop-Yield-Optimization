import React from 'react';
import { motion } from 'motion/react';

const FarmerMascot: React.FC<{ size?: number; className?: string }> = ({ size = 120, className = '' }) => {
  return (
    <motion.div 
      initial={{ scale: 0.8, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`relative inline-block ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
        {/* Body/Kurta */}
        <path 
          d="M60 180 Q100 130 140 180 L140 200 L60 200 Z" 
          fill="#f8fafc" 
          stroke="#e2e8f0"
          strokeWidth="2"
          className="dark:fill-slate-800 dark:stroke-slate-700 transition-colors duration-300"
        />
        
        {/* Face */}
        <circle cx="100" cy="90" r="45" fill="#ffd8a8" />
        
        {/* Turban (Pagri) */}
        <path 
          d="M55 75 Q100 20 145 75 Q145 85 135 90 Q100 80 65 90 Q55 85 55 75" 
          fill="#f59e0b" 
        />
        <path 
          d="M70 45 Q100 30 130 45" 
          fill="none" 
          stroke="#d97706" 
          strokeWidth="2" 
          strokeLinecap="round" 
        />

        {/* Eyes - Happy curved eyes */}
        <path d="M78 95 Q85 88 92 95" fill="none" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
        <path d="M108 95 Q115 88 122 95" fill="none" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
        
        {/* Full Beard (Sikh Dahri) */}
        <path 
          d="M58 105 Q100 160 142 105 L130 115 Q100 125 70 115 Z" 
          fill="#475569" 
        />
        
        {/* Mustache - Curled up and happy */}
        <path 
          d="M80 110 Q100 120 120 110" 
          fill="none" 
          stroke="#334155" 
          strokeWidth="4" 
          strokeLinecap="round" 
        />
        <path 
          d="M80 110 Q70 110 65 100" 
          fill="none" 
          stroke="#334155" 
          strokeWidth="4" 
          strokeLinecap="round" 
        />
        <path 
          d="M120 110 Q130 110 135 100" 
          fill="none" 
          stroke="#334155" 
          strokeWidth="4" 
          strokeLinecap="round" 
        />

        {/* Happy Smile Mouth (Visible slightly between mustache and beard) */}
        <path 
          d="M90 122 Q100 128 110 122" 
          fill="none" 
          stroke="#ffffff" 
          strokeWidth="2" 
          strokeLinecap="round" 
          opacity="0.8"
        />

        {/* Namaste Hands */}
        <motion.g
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Left Hand */}
          <path 
            d="M85 140 Q100 130 100 170" 
            fill="none" 
            stroke="#ffd8a8" 
            strokeWidth="12" 
            strokeLinecap="round" 
          />
          {/* Right Hand */}
          <path 
            d="M115 140 Q100 130 100 170" 
            fill="none" 
            stroke="#ffd8a8" 
            strokeWidth="12" 
            strokeLinecap="round" 
          />
          
          {/* Hands Junction (Folded) */}
          <path 
            d="M95 140 Q100 135 105 140 L105 160 Q100 165 95 160 Z" 
            fill="#ffec99" 
            stroke="#fab005"
            strokeWidth="1"
          />
        </motion.g>

        {/* Blush */}
        <circle cx="70" cy="105" r="5" fill="#ff8787" fillOpacity="0.4" />
        <circle cx="130" cy="105" r="5" fill="#ff8787" fillOpacity="0.4" />
      </svg>
    </motion.div>
  );
};

export default FarmerMascot;
