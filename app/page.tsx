"use client";

import { motion } from "framer-motion";
import { MarkerText } from "@/components/whiteboard/marker-text";
import { MarkerButton } from "@/components/whiteboard/marker-button";
import { Doodle } from "@/components/whiteboard/doodle";
import { StickyNote } from "@/components/whiteboard/sticky-note";
import { Navbar } from "@/components/whiteboard/navbar";
import { WhiteboardBackground } from "@/components/whiteboard/whiteboard-background";
import Link from "next/link";
import { Upload, BookOpen, RotateCcw, MessageSquare, HelpCircle, Brain, Lightbulb, Eye } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center overflow-hidden relative bg-white">
      <Navbar />
      <WhiteboardBackground />
      
      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
      />

      <main className="flex-1 w-full flex flex-col items-center pt-24">
        
        {/* Hero Section */}
        <section className="w-full max-w-7xl px-4 py-20 flex flex-col items-center text-center relative">
          {/* Decorative Sticky Notes */}
          <div className="absolute top-20 left-10 hidden lg:block">
            <StickyNote color="yellow" rotate={-5} delay={0.5}>
              <span className="text-2xl">Any Subject.</span>
            </StickyNote>
          </div>
          <div className="absolute top-40 right-10 hidden lg:block">
            <StickyNote color="pink" rotate={5} delay={0.7}>
              <span className="text-2xl">Active Learning.</span>
            </StickyNote>
          </div>

          <div className="relative inline-block mb-6">
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="text-7xl md:text-9xl font-chalk font- text-gray-900 drop-shadow-sm"
            >
              Synapse
            </motion.h1>
            <Doodle variant="bulb" className="absolute -top-15 -right-15 w-24 h-24 transform rotate-12" />
          </div>
          
          <div className="text-3xl md:text-5xl font-chalk mb-4 relative">
            <MarkerText text="Learn by Reconstructing" delay={1} duration={0.1} color="blue" />
            <Doodle variant="underline" color="blue" className="absolute -bottom-4 left-0 w-full h-8 opacity-50" />
          </div>

          <p className="text-xl text-gray-600 max-w-2xl mb-12 font-sans">
            History. Math. Physics. <span className="font-bold">The AI teaches, then erases.</span> You rebuild the lesson from memory.
          </p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2.5, duration: 0.5 }}
          >
            <Link href="/signup">
              <MarkerButton className="text-xl md:text-2xl px-10 py-4" variant="primary">
                Start Learning
              </MarkerButton>
            </Link>
          </motion.div>
        </section>

        {/* Subject Showcase */}
        <section id="subjects" className="w-full bg-gray-50/50 py-20 border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-chalk font-bold text-gray-900 mb-4">Designed for Every Subject</h2>
              <p className="text-xl text-gray-600 font-sans">Same engine. Different canvas.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-12">
              {/* History */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-all border border-gray-100 relative"
              >
                <div className="absolute -top-6 left-8">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center shadow-md">
                    <Doodle variant="history" className="w-10 h-10" color="blue" />
                  </div>
                </div>
                <h3 className="text-3xl font-chalk font-bold text-gray-900 mt-8 mb-4">📜 History</h3>
                <p className="text-gray-600 font-sans mb-4">
                  The AI sketches a timeline. You place events. It erases dates. You reconstruct from context.
                </p>
                <div className="bg-blue-50 rounded-lg p-4 text-sm font-sans text-gray-700 italic border-l-4 border-blue-300">
                  "When did the Boston Massacre happen?" — You answer, and the timeline redraws.
                </div>
              </motion.div>

              {/* Math */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-all border border-gray-100 relative"
              >
                <div className="absolute -top-6 left-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center shadow-md">
                    <Doodle variant="math" className="w-10 h-10" color="green" />
                  </div>
                </div>
                <h3 className="text-3xl font-chalk font-bold text-gray-900 mt-8 mb-4">🧮 Math</h3>
                <p className="text-gray-600 font-sans mb-4">
                  The AI solves step-by-step. Then erases constants, exponents, or formulas. You fill them back in.
                </p>
                <div className="bg-green-50 rounded-lg p-4 text-sm font-sans text-gray-700 italic border-l-4 border-green-300">
                  "What goes inside the square root?" — You recall b² - 4ac and rebuild the quadratic.
                </div>
              </motion.div>

              {/* Physics */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-all border border-gray-100 relative"
              >
                <div className="absolute -top-6 left-8">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center shadow-md">
                    <Doodle variant="physics" className="w-10 h-10" color="red" />
                  </div>
                </div>
                <h3 className="text-3xl font-chalk font-bold text-gray-900 mt-8 mb-4">⚛️ Physics</h3>
                <p className="text-gray-600 font-sans mb-4">
                  The AI draws diagrams with arrows and variables. It erases gravity or velocity. You recompute.
                </p>
                <div className="bg-red-50 rounded-lg p-4 text-sm font-sans text-gray-700 italic border-l-4 border-red-300">
                  "What if this were on the Moon?" — You adjust g = 1.6 m/s², and the arc redraws.
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* The Shared Engine */}
        <section className="w-full max-w-6xl px-4 py-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-6xl font-chalk font-bold text-gray-900 mb-4">One System. Five Modes.</h2>
            <p className="text-xl text-gray-600 font-sans">The AI cycles through teaching strategies to lock in what you learn.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: BookOpen, title: "Story Mode", desc: "The AI explains step-by-step, building context.", color: "blue" },
              { icon: MessageSquare, title: "Question Mode", desc: "You ask. The AI clarifies and connects dots.", color: "green" },
              { icon: Eye, title: "Prediction Mode", desc: "The AI asks: 'What happens next?'", color: "red" },
              { icon: RotateCcw, title: "Erasure Mode", desc: "The AI erases. You reconstruct from memory.", color: "blue" },
              { icon: Brain, title: "Review Mode", desc: "The AI quizzes across multiple sessions.", color: "green" },
            ].map((mode, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className={`w-12 h-12 rounded-full bg-${mode.color}-100 flex items-center justify-center mb-4`}>
                  <mode.icon className={`w-6 h-6 text-${mode.color}-600`} />
                </div>
                <h3 className="text-xl font-chalk font-bold text-gray-900 mb-2">{mode.title}</h3>
                <p className="text-gray-600 text-sm font-sans">{mode.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* The Problem Section */}
        <section id="features" className="w-full max-w-6xl px-4 py-20">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-chalk font-bold text-gray-900">
                Why traditional notes <span className="text-red-600">fail</span>.
              </h2>
              <p className="text-xl text-gray-600 font-sans leading-relaxed">
                You highlight, you re-read, you type endless bullet points. But when the test comes, your mind goes blank. That's because you're <span className="font-bold">passive</span>.
              </p>
              <div className="relative pl-8">
                <Doodle variant="arrow" className="absolute left-0 top-2 w-8 h-8 rotate-90 text-red-500" />
                <p className="font-chalk text-2xl text-red-500">Stop highlighting. Start recalling.</p>
              </div>
            </div>
            <div className="relative">
              <StickyNote color="blue" rotate={2} className="w-full max-w-md mx-auto aspect-video flex flex-col items-center justify-center gap-4">
                <span className="text-3xl">The "Illusion of Competence"</span>
                <span className="text-lg font-sans text-gray-600">(Reading ≠ Knowing)</span>
              </StickyNote>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="w-full max-w-4xl px-4 py-20">
          <h2 className="text-4xl md:text-5xl font-chalk font-bold text-center mb-12">Common Questions</h2>
          <div className="space-y-6">
            {[
              { q: "Is this better than flashcards?", a: "Yes. Flashcards are isolated. Synapse teaches you connections and context, building a deeper mental map." },
              { q: "Can I upload handwritten notes?", a: "Absolutely. Our OCR engine can read most handwriting and turn it into an interactive lesson." },
              { q: "What subjects are supported?", a: "We're starting with History, Math, and Physics. More coming soon based on demand." },
              { q: "Is there a free tier?", a: "You can try 3 lessons for free. After that, it's a simple monthly subscription." }
            ].map((faq, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-xl font-chalk font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-blue-500" />
                  {faq.q}
                </h3>
                <p className="text-gray-600 font-sans ml-7">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Footer */}
        <section className="w-full bg-gray-900 text-white py-20 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <Doodle variant="circle" className="absolute top-10 left-10 w-32 h-32 text-white" />
            <Doodle variant="star" className="absolute bottom-10 right-10 w-24 h-24 text-white" />
          </div>
          
          <div className="relative z-10 max-w-3xl mx-auto px-4 space-y-8">
            <h2 className="text-4xl md:text-6xl font-chalk font-bold">Ready to master your subjects?</h2>
            <p className="text-xl text-gray-300 font-sans">Join thousands of students who have switched to active learning.</p>
            <Link href="/signup">
              <MarkerButton variant="primary" className="text-white border-white hover:bg-white/10">
                Start Learning Now
              </MarkerButton>
            </Link>
          </div>
        </section>

      </main>

      <footer className="w-full py-8 text-center text-gray-400 text-sm font-sans border-t border-gray-100">
        <div className="flex justify-center gap-6 mb-4">
          <Link href="#" className="hover:text-blue-600">Privacy</Link>
          <Link href="#" className="hover:text-blue-600">Terms</Link>
          <Link href="#" className="hover:text-blue-600">Contact</Link>
        </div>
        <p>&copy; 2025 Synapse. Built for the curious.</p>
      </footer>
    </div>
  );
}
