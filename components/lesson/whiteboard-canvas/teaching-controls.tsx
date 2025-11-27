import { motion } from "framer-motion";
import type { DemoState } from "./types";
import { SmallHandDrawnBox } from "./small-hand-drawn-box";
import { HandwrittenText } from "./handwritten-text";

interface TeachingControlsProps {
  demoState: DemoState;
  node: {
    summary: string;
    vocabulary: Array<{ term: string; definition: string }>;
    thinkingQuestion?: string;
  };
  chatInput: string;
  setChatInput: (input: string) => void;
  isChatSubmitting: boolean;
  setIsChatSubmitting: (submitting: boolean) => void;
  thinkingInput: string;
  setThinkingInput: (input: string) => void;
  isThinkingSubmitting: boolean;
  setIsThinkingSubmitting: (submitting: boolean) => void;
  contentReady?: boolean;
  onContinue?: () => void;
  onAskQuestion?: (question: string) => Promise<void>;
  onThinkingSubmit?: (response: string) => Promise<void>;
}

export function TeachingControls({
  demoState,
  node,
  chatInput,
  setChatInput,
  isChatSubmitting,
  setIsChatSubmitting,
  thinkingInput,
  setThinkingInput,
  isThinkingSubmitting,
  setIsThinkingSubmitting,
  contentReady = true,
  onContinue,
  onAskQuestion,
  onThinkingSubmit,
}: TeachingControlsProps) {
  if (demoState.phase !== "teaching") return null;

  return (
    <div className="mt-8">
      <div className="space-y-3">
        {/* Sub-Phase: Content - Show "Do you understand" with question box */}
        {contentReady &&
          (demoState.subPhase === "content" ||
            demoState.subPhase === "user-question" ||
            demoState.subPhase === "ai-answer") && (
            <motion.div
              className="mt-6 space-y-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay:
                  1.2 +
                  node.summary.length * 0.04 +
                  node.vocabulary.length * 0.6 +
                  0.5,
              }}
            >
              <p className="text-2xl font-chalk text-gray-900 leading-snug underline decoration-wavy decoration-2 decoration-amber-400">
                Do you understand?
              </p>

              <div className="space-y-3">
                <div className="relative inline-block">
                  <button
                    onClick={onContinue}
                    className="text-xl font-chalk text-gray-900 relative z-10 px-2 py-1"
                  >
                    Yes, continue
                  </button>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                      delay:
                        1.2 +
                        node.summary.length * 0.04 +
                        node.vocabulary.length * 0.6 +
                        0.7,
                      duration: 0.3,
                    }}
                  >
                    <SmallHandDrawnBox delay={0} />
                  </motion.div>
                </div>

                {/* Question Input - always visible during content/Q&A */}
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!chatInput.trim() || isChatSubmitting || !onAskQuestion)
                      return;
                    setIsChatSubmitting(true);
                    await onAskQuestion(chatInput);
                    setChatInput("");
                    setIsChatSubmitting(false);
                  }}
                  className="flex items-center gap-2 bg-white rounded-lg border-2 border-gray-300 p-2 max-w-[600px]"
                >
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask a question..."
                    disabled={isChatSubmitting}
                    className="flex-1 bg-transparent border-none focus:ring-0 text-gray-900 placeholder-gray-400 font-chalk text-xl"
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim() || isChatSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-full font-sans text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {isChatSubmitting ? "Asking..." : "Ask"}
                  </button>
                </form>
              </div>
            </motion.div>
          )}

        {/* Sub-Phase: Continue - Only shown on nodes before recall */}
        {demoState.subPhase === "continue" && (
          <motion.div
            className="mt-6 space-y-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-2xl font-chalk text-gray-900 leading-snug underline decoration-wavy decoration-2 decoration-rose-400">
              Ready to test your knowledge?
            </p>

            <div className="relative inline-block">
              <button
                onClick={onContinue}
                className="text-xl font-chalk text-gray-900 relative z-10 px-2 py-1"
              >
                Yes, lets go!
              </button>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                <SmallHandDrawnBox delay={0} />
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* User Question Display (blue dot) */}
        {demoState.userQuestion && demoState.subPhase === "user-question" && (
          <motion.div
            className="mt-4 flex items-start gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="h-4 w-4 rounded-full bg-blue-500 inline-block shrink-0 mt-2" />
            <p className="text-2xl font-chalk text-gray-900 leading-snug">
              <HandwrittenText text={demoState.userQuestion} />
            </p>
          </motion.div>
        )}

        {/* AI Answer Display (green dot) */}
        {demoState.aiResponse && demoState.subPhase === "ai-answer" && (
          <motion.div
            className="mt-4 flex items-start gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <span className="h-4 w-4 rounded-full bg-green-500 inline-block shrink-0 mt-2" />
            <p className="text-2xl font-chalk text-gray-800 leading-snug">
              <HandwrittenText text={demoState.aiResponse} />
            </p>
          </motion.div>
        )}

        {/* Sub-Phase: Thinking Question */}
        {(demoState.subPhase === "question" ||
          demoState.subPhase === "user-thinking-response") && (
          <motion.div
            className="max-w-[600px] mt-6"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
          >
            <p className="text-2xl font-chalk text-gray-900 leading-snug">
              <span className="underline decoration-rose-400 decoration-2 mr-2">
                Think:
              </span>
              {node.thinkingQuestion || "What do you think happened next?"}
            </p>
          </motion.div>
        )}

        {/* User's Thinking Response Input */}
        {demoState.subPhase === "question" &&
          !demoState.userThinkingResponse && (
            <motion.div
              className="max-w-[600px] mt-4 ml-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="relative">
                <textarea
                  value={thinkingInput}
                  onChange={(e) => setThinkingInput(e.target.value)}
                  placeholder="Type your thoughts..."
                  className="w-full bg-transparent border-b-2 border-gray-300 focus:border-blue-500 outline-none text-xl font-chalk text-gray-700 leading-snug italic resize-none py-2"
                  rows={2}
                  disabled={isThinkingSubmitting}
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={async () => {
                      if (
                        !thinkingInput.trim() ||
                        isThinkingSubmitting ||
                        !onThinkingSubmit
                      )
                        return;
                      setIsThinkingSubmitting(true);
                      await onThinkingSubmit(thinkingInput);
                      setThinkingInput("");
                      setIsThinkingSubmitting(false);
                    }}
                    disabled={!thinkingInput.trim() || isThinkingSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-full font-sans text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {isThinkingSubmitting ? "Sharing..." : "Share Thoughts"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
      </div>
    </div>
  );
}
