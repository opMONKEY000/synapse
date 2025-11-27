import { motion } from "framer-motion";

interface SmallHandDrawnBoxProps {
  delay?: number;
}

export function SmallHandDrawnBox({ delay = 0 }: SmallHandDrawnBoxProps) {
  // Create wobbly hand-drawn paths for each side (smaller variant for buttons)
  const wobble = 1;
  
  return (
    <svg
      className="absolute pointer-events-none"
      viewBox="-5 -5 110 110"
      preserveAspectRatio="none"
      style={{
        top: "-5px",
        left: "-5px",
        width: "calc(100% + 10px)",
        height: "calc(100% + 10px)",
        zIndex: 0,
        overflow: "visible"
      }}
    >
      {/* Top side */}
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
      
      {/* Right side */}
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
      
      {/* Bottom side */}
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
      
      {/* Left side */}
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
