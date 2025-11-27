import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface HandwrittenTextProps {
  text: string;
  delay?: number;
  onComplete?: () => void;
  instant?: boolean;
}

export function HandwrittenText({ 
  text, 
  delay = 0,
  onComplete,
  instant = false
}: HandwrittenTextProps) {
  const [displayedChars, setDisplayedChars] = useState<string[]>([]);
  
  useEffect(() => {
    if (instant) {
      setDisplayedChars(text.split(""));
      onComplete?.();
      return;
    }

    const chars = text.split('');
    let currentIndex = 0;
    
    const startTimer = setTimeout(() => {
      const interval = setInterval(() => {
        if (currentIndex < chars.length) {
          setDisplayedChars(chars.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(interval);
          onComplete?.();
        }
      }, 30 + Math.random() * 15); // 30-45ms per character
      
      return () => clearInterval(interval);
    }, delay * 1000);
    
    return () => clearTimeout(startTimer);
  }, [text, delay, instant]); // Removed onComplete from deps to avoid infinite loop if it changes
  
  return (
    <span>
      {displayedChars.map((char, idx) => (
        <motion.span
          key={idx}
          initial={{ opacity: 0, y: 2 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          style={{ display: 'inline-block' }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </span>
  );
}
