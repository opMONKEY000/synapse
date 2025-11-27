import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface AnimatedTextProps {
  text: string;
  vocabulary: string[];
  startDelay: number;
  isActive: boolean;
  isErased?: boolean;
  simulatedInput?: string;
  feedback?: "correct" | "incorrect" | null;
  onComplete?: () => void;
  onReset?: () => void;
  onPartialSubmit?: (term: string, input: string) => Promise<{ correct: boolean }>;
  onAllTermsSubmitted?: () => void;
  skipAnimation?: boolean; // Skip animation for completed nodes
}

export function AnimatedText({ 
  text, 
  vocabulary, 
  startDelay,
  isActive,
  isErased,
  simulatedInput,
  feedback,
  onComplete,
  onReset,
  onPartialSubmit,
  onAllTermsSubmitted,
  skipAnimation = false
}: AnimatedTextProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [submittedTerms, setSubmittedTerms] = useState<Record<string, { correct: boolean; userAnswer: string }>>({});
  const [activeBlank, setActiveBlank] = useState<string | null>(null);
  const vocabPalette = ["#0ea5e9", "#f97316", "#22c55e", "#ef4444"];

  useEffect(() => {
    if (!isActive) {
      setDisplayedText(""); 
      onReset?.();
      return;
    }

    // If skipAnimation is true, show the full text immediately
    if (skipAnimation) {
      setDisplayedText(text);
      onComplete?.();
      return;
    }

    let currentIndex = 0;
    const chars = text.split('');
    
    const startTimer = setTimeout(() => {
      const interval = setInterval(() => {
        if (currentIndex < chars.length) {
          setDisplayedText(chars.slice(0, currentIndex + 1).join(''));
          currentIndex++;
        } else {
          clearInterval(interval);
          onComplete?.();
        }
      }, 30 + Math.random() * 15); // 30-45ms per character for handwriting feel
      
      return () => clearInterval(interval);
    }, startDelay * 1000);

    return () => {
      clearTimeout(startTimer);
    };
  }, [text, isActive, startDelay, skipAnimation]); // Added skipAnimation to deps

  if (!isActive) return null;

  // Build a map of which words are part of vocabulary terms
  const textLower = displayedText.toLowerCase();
  const vocabMatches: Map<number, { color: string; term: string; termIndex: number; wordIndex: number }> = new Map();
  
  // Track unique terms for partial recall
  const uniqueTerms = new Set<string>();
  
  vocabulary.forEach((vocabTerm, termIndex) => {
    const termLower = vocabTerm.toLowerCase();
    const color = vocabPalette[termIndex % vocabPalette.length];
    
    // Find all occurrences of this vocab term in the text
    let startIndex = 0;
    while ((startIndex = textLower.indexOf(termLower, startIndex)) !== -1) {
      const beforeText = displayedText.slice(0, startIndex);
      const wordsBefore = beforeText.split(/\s+/).filter(w => w.length > 0);
      const startWordIndex = wordsBefore.length;
      
      const termWords = vocabTerm.split(/\s+/).filter(w => w.length > 0);
      
      for (let i = 0; i < termWords.length; i++) {
        vocabMatches.set(startWordIndex + i, { color, term: vocabTerm, termIndex, wordIndex: i });
      }
      
      if (isErased) {
        uniqueTerms.add(vocabTerm);
      }
      
      startIndex += termLower.length;
    }
  });

  // Check if all terms have been submitted
  const totalTerms = uniqueTerms.size;
  const submittedCount = Object.keys(submittedTerms).length;
  
  useEffect(() => {
    if (isErased && totalTerms > 0 && submittedCount === totalTerms) {
      // All terms submitted, trigger callback after a short delay
      const timer = setTimeout(() => {
        onAllTermsSubmitted?.();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [submittedCount, totalTerms, isErased, onAllTermsSubmitted]);

  const words = displayedText.split(/\s+/).filter(w => w.length > 0);

  const handleTermSubmit = async (termKey: string, term: string, input: string) => {
    if (onPartialSubmit) {
      const result = await onPartialSubmit(term, input);
      setSubmittedTerms(prev => ({
        ...prev,
        [termKey]: { correct: result.correct, userAnswer: input }
      }));
    }
  };

  return (
    <div className="text-3xl font-chalk text-gray-900 leading-relaxed relative">
      {words.map((word, idx) => {
        const vocabMatch = vocabMatches.get(idx);
        const isVocab = !!vocabMatch;
        const vocabColor = vocabMatch?.color || vocabPalette[0];
        const isErasedWord = isErased && isVocab;

        if (isErasedWord) {
            const termKey = `${vocabMatch.term}-${vocabMatch.termIndex}`;
            const submission = submittedTerms[termKey];
            const inputValue = inputs[termKey] || "";
            
            // Only render input for the first word of the term to avoid splitting inputs
            if (vocabMatch.wordIndex === 0) {
                return (
                    <span key={idx} className="inline-block mr-3 relative">
                        {submission ? (
                             <motion.span 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }}
                                className={`font-bold ${submission.correct ? 'text-green-600' : 'text-red-600'}`}
                            >
                                {submission.userAnswer}
                            </motion.span>
                        ) : (
                            <span className="relative inline-block min-w-[100px]">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputs(prev => ({ ...prev, [termKey]: e.target.value }))}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && inputValue.trim()) {
                                            handleTermSubmit(termKey, vocabMatch.term, inputValue);
                                        }
                                    }}
                                    className="bg-transparent border-b-2 border-dashed border-gray-400 focus:border-blue-500 outline-none text-center w-full font-chalk text-blue-600"
                                    placeholder="?"
                                    autoFocus={activeBlank === termKey || idx === 0} // Simple autofocus logic
                                />
                            </span>
                        )}
                    </span>
                );
            } else {
                // For subsequent words in the same term, don't render anything if we are using a single input for the term
                return null; 
            }
        }

        return (
          <span key={idx} className="inline-block mr-3 relative">
            {isVocab ? (
              <span 
                className="font-bold" 
                style={{ color: vocabColor, textDecoration: "underline", textDecorationColor: vocabColor }}
              >
                {word}
              </span>
            ) : (
              word
            )}
          </span>
        );
      })}
    </div>
  );
}
