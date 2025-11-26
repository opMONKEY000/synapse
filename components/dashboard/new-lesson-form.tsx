"use client";

import { useState } from "react";
import { MarkerButton } from "@/components/whiteboard/marker-button";
import { AuthInput } from "@/components/auth/auth-input";
import { FileUpload } from "@/components/dashboard/file-upload";
import { useRouter } from "next/navigation";
import { createLesson } from "@/app/actions/lesson";

interface NewLessonFormProps {
  subjectId: string;
  subjectName: string;
}

export function NewLessonForm({ subjectId, subjectName }: NewLessonFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!title.trim()) {
      setError("Please enter a lesson title");
      return;
    }

    if (!topic.trim() && !file) {
      setError("Please either enter a topic or upload a PDF");
      return;
    }

    if (topic.trim() && file) {
      setError("Please choose either topic OR PDF upload, not both");
      return;
    }

    setLoading(true);
    try {
      // Redirect to the new AI lesson generation page
      router.push(`/subjects/${subjectId}/lessons/new?topic=${encodeURIComponent(topic.trim())}`);
    } catch (error) {
      console.error("Failed to navigate", error);
      setError("Failed to navigate. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Lesson Title */}
      <AuthInput
        label="Lesson Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g., American Revolution Overview, Chapter 5 Summary..."
        required
        maxLength={100}
      />

      {/* Topic OR PDF Upload */}
      <div className="space-y-4">
        <label className="block text-sm font-bold text-gray-700 font-chalk">
          Learning Material
        </label>

        {/* Topic Input */}
        <div>
          <AuthInput
            label=""
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter a topic (e.g., The Cold War, Quadratic Formula...)"
            disabled={!!file}
          />
        </div>

        {/* OR Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500 font-sans">OR</span>
          </div>
        </div>

        {/* PDF Upload */}
        <FileUpload
          onFileSelect={(selectedFile) => {
            setFile(selectedFile);
            if (selectedFile) {
              setTopic(""); // Clear topic if file is selected
            }
          }}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600 font-sans">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <div className="pt-4">
        <MarkerButton
          type="submit"
          variant="primary"
          className="w-full py-4 text-xl"
          disabled={loading}
        >
          {loading ? "Creating..." : "Start Learning"}
        </MarkerButton>
      </div>

      <p className="text-xs text-gray-500 font-sans text-center">
        Note: PDF content extraction coming soon. For now, use topic input.
      </p>
    </form>
  );
}
