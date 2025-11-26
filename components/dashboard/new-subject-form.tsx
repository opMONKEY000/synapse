"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LearningMethodCard } from "./learning-method-card";
import { MarkerButton } from "@/components/whiteboard/marker-button";
import { AuthInput } from "@/components/auth/auth-input";
import { createSubject } from "@/app/actions/subject";

type LearningMethodType = "MEMORY_DRIVEN" | "SKILL_DRIVEN" | "CREATIVE_ANALYTICAL";

export function NewSubjectForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<LearningMethodType | null>(null);
  const [subjectName, setSubjectName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMethod || !subjectName.trim()) return;

    setLoading(true);
    try {
      const subject = await createSubject({
        name: subjectName,
        learningMethod: selectedMethod,
      });
      router.push(`/dashboard/${subject.id}`);
    } catch (error) {
      console.error("Failed to create subject:", error);
      alert("Failed to create subject. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Step 1: Learning Method Selection */}
      <div>
        <label className="block text-lg font-bold text-gray-700 font-chalk mb-4">
          1. Choose a Learning Method
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <LearningMethodCard
            method="MEMORY_DRIVEN"
            selected={selectedMethod === "MEMORY_DRIVEN"}
            onClick={() => setSelectedMethod("MEMORY_DRIVEN")}
          />
          <LearningMethodCard
            method="SKILL_DRIVEN"
            selected={selectedMethod === "SKILL_DRIVEN"}
            onClick={() => setSelectedMethod("SKILL_DRIVEN")}
          />
          <LearningMethodCard
            method="CREATIVE_ANALYTICAL"
            selected={selectedMethod === "CREATIVE_ANALYTICAL"}
            onClick={() => setSelectedMethod("CREATIVE_ANALYTICAL")}
          />
        </div>
      </div>

      {/* Step 2: Subject Name (appears after method selected) */}
      {selectedMethod && (
        <div className="space-y-4">
          <label className="block text-lg font-bold text-gray-700 font-chalk">
            2. Name Your Subject
          </label>
          <AuthInput
            label=""
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
            placeholder="e.g., AP US History, Calculus AB, English Literature..."
            required
            maxLength={50}
          />
          <p className="text-sm text-gray-500 font-sans">
            Choose a name that helps you identify this subject easily
          </p>
        </div>
      )}

      {/* Submit Button */}
      {selectedMethod && subjectName.trim() && (
        <div className="pt-4">
          <MarkerButton
            type="submit"
            variant="primary"
            className="w-full py-4 text-xl"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Subject"}
          </MarkerButton>
        </div>
      )}
    </form>
  );
}
