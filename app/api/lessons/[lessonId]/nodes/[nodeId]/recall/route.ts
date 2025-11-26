import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { deepseek } from "@/lib/deepseek";
import { NextResponse } from "next/server";
import { z } from "zod";

const recallSchema = z.object({
  recallType: z.enum(["partial", "full-forward", "full-backward"]),
  userResponse: z.string(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ lessonId: string; nodeId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { lessonId, nodeId } = await params;
    const body = await req.json();
    const { recallType, userResponse } = recallSchema.parse(body);

    // Verify ownership and fetch node with context
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId, userId: session.user.id },
      include: {
        nodes: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            title: true,
            summary: true,
            vocabulary: true,
            vocabularyTerms: true,
            order: true,
          }
        },
        subject: true,
      },
    });

    if (!lesson) {
      return new NextResponse("Lesson not found", { status: 404 });
    }

    const currentNodeIndex = lesson.nodes.findIndex(n => n.id === nodeId);
    if (currentNodeIndex === -1) {
      return new NextResponse("Node not found", { status: 404 });
    }

    const currentNode = lesson.nodes[currentNodeIndex];
    const previousNode = currentNodeIndex > 0 ? lesson.nodes[currentNodeIndex - 1] : null;

    let systemPrompt = `You are an expert evaluator for ${lesson.subject.name}. Assess the student's recall accuracy and understanding depth.`;
    let userPrompt = "";

    if (recallType === "partial") {
      // For partial recall, we might need to know WHICH term they are recalling.
      // However, the prompt in the plan implies we send the term. 
      // The current schema just sends userResponse. 
      // Let's assume for partial recall the userResponse might contain the term context or we just evaluate if it matches ANY of the missing terms?
      // Actually, looking at the prototype, partial recall is specific to a term.
      // But the API design in the plan just takes userResponse.
      // Let's assume userResponse is just the term they typed.
      // We should probably check against the vocabulary list.
      
      // Wait, the plan says:
      // "Vocabulary Term: {term}" in the prompt.
      // But the request body doesn't have 'term'.
      // I should probably infer it or ask the client to send it.
      // For now, I'll assume the client sends just the response and I'll check if it matches any definition or term?
      // Actually, let's stick to the plan's prompt structure but we need the term.
      // I will update the schema to optionally accept 'term' or just infer from context.
      // Let's update the schema to allow extra fields or just put it in userResponse?
      // No, better to add `term` to the schema for partial recall.
      
      // Let's modify the schema slightly to be more flexible or just use userResponse.
      // If it's partial, userResponse is the term they typed.
      // We can find the matching term in the node's vocabulary.
      
      const vocabList = (currentNode.vocabulary as any[]) || [];
      // Find which term matches the user response (fuzzy match?)
      // Or maybe the client should send which term ID it is.
      // For simplicity, let's assume the userResponse IS the term they are trying to recall.
      // We can pass the whole vocabulary list to the AI and ask "Did they recall any of these terms correctly?"
      // Or strictly follow the plan.
      
      // Let's stick to the plan's prompt but we need the intended term.
      // I'll add `term` to the request body schema as optional.
    }

    // Re-defining schema inside to handle conditional fields if needed, or just use a loose schema.
    // Let's stick to the plan's prompt structure.
    
    if (recallType === "partial") {
       // We need the term they are trying to define/recall.
       // I'll assume it's passed in the body, maybe I should update the schema.
       // Let's check the body again.
       const bodyWithTerm = body as { term?: string };
       const term = bodyWithTerm.term || "Unknown Term";
       
       // Find correct definition
       const vocab = (currentNode.vocabulary as any[])?.find((v: any) => v.term === term);
       const correctDefinition = vocab?.definition || "Definition not found";

       userPrompt = `Lesson Topic: ${lesson.topic}
Node: ${currentNode.title}
Vocabulary Term: ${term}
Correct Definition: ${correctDefinition}
Student Answer: ${userResponse}

Evaluate the student's answer and provide:
1. Mastery Score (0.0 to 1.0, where 1.0 = perfect match, 0.7-0.9 = good understanding with minor errors, 0.4-0.6 = partial understanding, 0.0-0.3 = incorrect)
2. Letter Grade (F, D, C, B-, B, B+, A-, A, A+)
3. Brief Feedback (1 sentence explaining the score)

Output format: JSON
{
  "masteryScore": 0.0,
  "grade": "string",
  "feedback": "string"
}`;
    } else {
        // Full recall
        const contextType = recallType === "full-forward" ? "Previous Node Context" : "Next Node Context";
        const contextNodeTitle = previousNode?.title || "None";
        const vocabTerms = currentNode.vocabularyTerms.join(", ");

        userPrompt = `Lesson Topic: ${lesson.topic}
Node: ${currentNode.title}
Correct Summary: ${currentNode.summary}
Key Concepts: ${vocabTerms}
Student Recall: ${userResponse}
Context: ${contextType} (previous node: ${contextNodeTitle})

Evaluate the student's recall and provide:
1. Mastery Score (0.0 to 1.0):
   - 1.0: Captures all key concepts with accurate causal connections
   - 0.7-0.9: Captures most concepts, minor gaps in connections
   - 0.4-0.6: Captures some concepts but missing key details
   - 0.0-0.3: Significant gaps or misconceptions
2. Letter Grade (F to A+)
3. Detailed Feedback (2-3 sentences):
   - What they got right
   - What they missed (if anything)
   - Encouragement

Output format: JSON
{
  "masteryScore": 0.0,
  "grade": "string",
  "feedback": "string"
}`;
    }

    const completion = await deepseek.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      model: "deepseek-chat",
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    if (!content) throw new Error("No content generated");

    const cleanContent = content.replace(/```json\n?|```/g, "").trim();
    const evaluation = JSON.parse(cleanContent);

    // Save Mastery Record
    await prisma.nodeMastery.create({
      data: {
        userId: session.user.id,
        nodeId,
        masteryScore: evaluation.masteryScore,
        recallType,
        userResponse,
        aiEvaluation: evaluation.feedback,
        grade: evaluation.grade,
      },
    });

    return NextResponse.json(evaluation);

  } catch (error) {
    console.error("Recall evaluation error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
