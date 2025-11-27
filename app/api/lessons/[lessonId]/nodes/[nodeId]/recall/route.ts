import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { deepseek } from "@/lib/deepseek";
import { NextResponse } from "next/server";
import { z } from "zod";

const recallSchema = z.object({
  recallType: z.enum(["partial", "full-forward", "full-backward", "full-comprehensive"]),
  userResponse: z.string(),
  cycleNumber: z.number().optional(),
  hintNodeIds: z.array(z.string()).optional(),
  term: z.string().optional(), // For partial recall
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
    const { recallType, userResponse, cycleNumber, hintNodeIds, term } = recallSchema.parse(body);

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
    
    // Fetch hint nodes if provided
    let hintNodesContext = "";
    if (hintNodeIds && hintNodeIds.length > 0) {
      const hintNodes = lesson.nodes.filter(n => hintNodeIds.includes(n.id));
      hintNodesContext = hintNodes.map(n => `- ${n.title}: ${n.summary}`).join("\n");
    }

    let systemPrompt = `You are an expert evaluator for ${lesson.subject.name}. Assess the student's recall accuracy and understanding depth.`;
    let userPrompt = "";

    if (recallType === "partial") {
       const targetTerm = term || "Unknown Term";
       
       // Find correct definition
       const vocab = (currentNode.vocabulary as any[])?.find((v: any) => v.term === targetTerm);
       const correctDefinition = vocab?.definition || "Definition not found";

       userPrompt = `Lesson Topic: ${lesson.topic}
Node: ${currentNode.title}
Vocabulary Term: ${targetTerm}
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
        // Full recall (forward, backward, or comprehensive)
        const vocabTerms = currentNode.vocabularyTerms.join(", ");

        userPrompt = `Lesson Topic: ${lesson.topic}
Node: ${currentNode.title}
Correct Summary: ${currentNode.summary}
Key Concepts: ${vocabTerms}
Student Recall: ${userResponse}

Context / Hint Nodes Shown:
${hintNodesContext || "None"}

Recall Type: ${recallType}
- full-forward: Recalling this node with the next node as a hint.
- full-backward: Recalling this node with the previous node as a hint.
- full-comprehensive: Recalling this node with both neighbors as hints (Mastery Check).

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
        cycleNumber,
        hintNodeIds: hintNodeIds || [],
      },
    });

    return NextResponse.json(evaluation);

  } catch (error) {
    console.error("Recall evaluation error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
