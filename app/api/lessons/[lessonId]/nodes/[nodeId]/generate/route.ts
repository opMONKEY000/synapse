import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { deepseek } from "@/lib/deepseek";
import { NextResponse } from "next/server";

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

    // Verify ownership and fetch node with context
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId, userId: session.user.id },
      include: {
        nodes: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            title: true,
            vocabularyTerms: true,
            order: true,
            status: true,
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
    
    // If already complete, return success (idempotency)
    // Actually, maybe we want to allow regeneration? For now, let's just regenerate if requested.
    // But to save costs/time, if it's already complete we might want to skip. 
    // The plan says "Updates node status to COMPLETE".
    
    const previousNode = currentNodeIndex > 0 ? lesson.nodes[currentNodeIndex - 1] : null;
    const nextNode = currentNodeIndex < lesson.nodes.length - 1 ? lesson.nodes[currentNodeIndex + 1] : null;
    const isFinalNode = currentNodeIndex === lesson.nodes.length - 1;

    const systemPrompt = `You are a master teacher for ${lesson.subject.name}. Expand this concept with rich detail and create bridges to the next concept.`;

    let userPrompt = "";
    if (!isFinalNode) {
      userPrompt = `Lesson Topic: ${lesson.topic}
Current Node: ${currentNode.title}
Previous Node: ${previousNode?.title || "None (Start of lesson)"}
Next Node: ${nextNode?.title} (this is where we're heading)
Vocabulary Terms to Define: ${currentNode.vocabularyTerms.join(", ")}

Generate:
1. Summary (2-3 sentences explaining this concept and how it connects to the previous node)
2. Vocabulary Definitions (clear, concise definitions for each term)
3. Thinking Question (ONE question that helps the student see how this concept leads naturally into '${nextNode?.title}'. The question should create curiosity about what comes next.)
4. Complete Metadata (dates, locations, key figures relevant to this concept)

Output format: JSON object
{
  "summary": "string",
  "vocabulary": [{ "term": "string", "definition": "string" }],
  "thinkingQuestion": "string",
  "metadata": { "badge": "string", "location": "string", "keyFigure": "string" }
}`;
    } else {
      userPrompt = `Lesson Topic: ${lesson.topic}
Current Node: ${currentNode.title} (FINAL NODE)
Previous Node: ${previousNode?.title}
Vocabulary Terms to Define: ${currentNode.vocabularyTerms.join(", ")}

Generate:
1. Summary (2-3 sentences explaining this concept and how it connects to the previous node)
2. Vocabulary Definitions (clear, concise definitions for each term)
3. Thinking Question (ONE question that helps the student synthesize and wrap up the key concepts from the entire lesson. Start with something like 'Now that we've covered...' or 'Looking back at the whole story...')
4. Complete Metadata (dates, locations, key figures relevant to this concept)

Output format: JSON object
{
  "summary": "string",
  "vocabulary": [{ "term": "string", "definition": "string" }],
  "thinkingQuestion": "string",
  "metadata": { "badge": "string", "location": "string", "keyFigure": "string" }
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
    const generatedData = JSON.parse(cleanContent);

    // Update Node
    const updatedNode = await prisma.knowledgeNode.update({
      where: { id: nodeId },
      data: {
        summary: generatedData.summary,
        vocabulary: generatedData.vocabulary, // Prisma handles JSON
        thinkingQuestion: generatedData.thinkingQuestion,
        metadata: generatedData.metadata,
        status: "COMPLETE",
      },
    });

    return NextResponse.json(updatedNode);

  } catch (error) {
    console.error("Content generation error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
