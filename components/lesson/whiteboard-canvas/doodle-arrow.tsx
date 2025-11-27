import { motion } from "framer-motion";

const ARROW_VERTICAL_OFFSET = 600; // Lower position within each node card

interface DoodleArrowProps {
  start: { x: number; y: number };
  end: { x: number; y: number };
  delay?: number;
}

export function DoodleArrow({ start, end, delay = 0 }: DoodleArrowProps) {
  const startCenterY = start.y + ARROW_VERTICAL_OFFSET;
  const endCenterY = end.y + ARROW_VERTICAL_OFFSET;
  const arrowY = (startCenterY + endCenterY) / 2;
  const startX = start.x + 550; // Right edge of start node
  const endX = end.x - 550; // Left edge of end node
  const arrowLength = endX - startX;

  // Create a wobbly hand-drawn path
  const midX = arrowLength / 2;
  const wobble1 = arrowLength * 0.25;
  const wobble2 = arrowLength * 0.75;

  return (
    <motion.svg
      className="absolute pointer-events-none"
      style={{
        left: `${startX}px`,
        top: `${arrowY - 40}px`,
        width: `${arrowLength}px`,
        height: "80px",
        zIndex: 5,
        overflow: "visible",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, delay }}
    >
      {/* Hand-drawn wobbly arrow path */}
      <motion.path
        d={`M 0,40 Q ${wobble1},25 ${midX},40 T ${arrowLength},40`}
        stroke="#1e293b"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, ease: "easeInOut", delay }}
      />

      {/* Hand-drawn arrowhead */}
      <motion.path
        d={`M ${arrowLength - 15},28 L ${arrowLength},40 L ${
          arrowLength - 15
        },52`}
        stroke="#1e293b"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15, delay: delay + 0.6 }}
      />
    </motion.svg>
  );
}
