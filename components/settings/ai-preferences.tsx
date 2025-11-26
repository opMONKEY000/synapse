"use client";

import { useState } from "react";
import { Bot, Sparkles } from "lucide-react";

export function AIPreferences() {
  const [responseStyle, setResponseStyle] = useState("balanced");
  const [teachingPace, setTeachingPace] = useState(50);
  const [explanationDepth, setExplanationDepth] = useState("detailed");

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
          <Bot className="w-5 h-5 text-purple-600" />
        </div>
        <h2 className="text-2xl font-chalk font-bold text-gray-900">AI Preferences</h2>
      </div>

      <div className="space-y-8">
        {/* Response Style */}
        <div>
          <label className="block text-sm font-bold text-gray-700 font-chalk mb-3">
            Response Style
          </label>
          <p className="text-sm text-gray-600 font-sans mb-4">
            Choose how the AI communicates with you during lessons
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "casual", label: "Casual", desc: "Friendly & conversational" },
              { value: "balanced", label: "Balanced", desc: "Mix of both" },
              { value: "formal", label: "Formal", desc: "Professional & precise" },
            ].map((style) => (
              <button
                key={style.value}
                onClick={() => setResponseStyle(style.value)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  responseStyle === style.value
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <p className="font-chalk font-bold text-gray-900">{style.label}</p>
                <p className="text-xs font-sans text-gray-600 mt-1">{style.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Teaching Pace */}
        <div>
          <label className="block text-sm font-bold text-gray-700 font-chalk mb-3">
            Teaching Pace
          </label>
          <p className="text-sm text-gray-600 font-sans mb-4">
            Control how quickly the AI moves through concepts
          </p>
          <div className="space-y-3">
            <input
              type="range"
              min="0"
              max="100"
              value={teachingPace}
              onChange={(e) => setTeachingPace(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <div className="flex justify-between text-xs font-sans text-gray-500">
              <span>Slow & Thorough</span>
              <span className="font-chalk font-bold text-purple-600">
                {teachingPace < 33 ? "Slow" : teachingPace < 66 ? "Moderate" : "Fast"}
              </span>
              <span>Fast & Concise</span>
            </div>
          </div>
        </div>

        {/* Explanation Depth */}
        <div>
          <label className="block text-sm font-bold text-gray-700 font-chalk mb-3">
            Explanation Depth
          </label>
          <p className="text-sm text-gray-600 font-sans mb-4">
            How much detail should the AI provide?
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: "concise", label: "Concise", desc: "Quick summaries" },
              { value: "detailed", label: "Detailed", desc: "In-depth explanations" },
            ].map((depth) => (
              <button
                key={depth.value}
                onClick={() => setExplanationDepth(depth.value)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  explanationDepth === depth.value
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <p className="font-chalk font-bold text-gray-900">{depth.label}</p>
                </div>
                <p className="text-xs font-sans text-gray-600">{depth.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-gray-200">
          <button className="w-full px-6 py-3 bg-purple-500 text-white font-chalk font-bold rounded-lg hover:bg-purple-600 transition-colors">
            Save Preferences
          </button>
          <p className="text-xs text-gray-500 font-sans text-center mt-3">
            Changes will apply to your next lesson
          </p>
        </div>
      </div>
    </div>
  );
}
