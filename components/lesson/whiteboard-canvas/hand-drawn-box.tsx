import { motion } from "framer-motion";

interface HandDrawnBoxProps {
  delay?: number;
}

export function HandDrawnBox({ delay = 0 }: HandDrawnBoxProps) {
  // Create wobbly hand-drawn paths for each side
  const wobble = 1; // Amount of wobble
  
  return (
    <svg
      className="absolute pointer-events-none"
      viewBox="-5 -5 110 110"
      preserveAspectRatio="none"
      style={{
        top: "-50px",
        left: "-50px",
        width: "calc(100% + 100px)",
        height: "calc(100% + 100px)",
        zIndex: 0,
        overflow: "visible"
      }}
    >
      {/* Top side - drawn first */}
      <motion.path
        d={`M 0,0 Q 25,${wobble} 50,${-wobble} T 100,0`}
        stroke="#1e293b"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.3, ease: "easeInOut", delay }}
      />
      
      {/* Right side - drawn second */}
      <motion.path
        d={`M 100,0 Q ${100 - wobble},25 ${100 + wobble},50 T 100,100`}
        stroke="#1e293b"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.3, ease: "easeInOut", delay: delay + 0.3 }}
      />
      
      {/* Bottom side - drawn third */}
      <motion.path
        d={`M 100,100 Q 75,${100 - wobble} 50,${100 + wobble} T 0,100`}
        stroke="#1e293b"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.3, ease: "easeInOut", delay: delay + 0.6 }}
      />
      
      {/* Left side - drawn last */}
      <motion.path
        d={`M 0,100 Q ${wobble},75 ${-wobble},50 T 0,0`}
        stroke="#1e293b"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.3, ease: "easeInOut", delay: delay + 0.9 }}
      />
    </svg>
  );
}
