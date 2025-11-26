import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { deepseek } from "@/lib/deepseek";
import { NextResponse } from "next/server";
import { z } from "zod";

const generateStructureSchema = z.object({
  subjectId: z.string(),
  topic: z.string(),
  difficultyLevel: z.enum(["beginner", "intermediate", "advanced"]),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { subjectId, topic, difficultyLevel } = generateStructureSchema.parse(body);

    // Verify subject ownership
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId, userId: session.user.id },
    });

    if (!subject) {
      return new NextResponse("Subject not found", { status: 404 });
    }

    // Determine node count
    let nodeCount = "5-8";
    if (difficultyLevel === "intermediate") nodeCount = "10-15";
    if (difficultyLevel === "advanced") nodeCount = "18-25";

    const systemPrompt = `You are an expert curriculum designer for ${subject.name}. Create a logical, sequential learning path where each concept naturally flows into the next.`;
    
    const userPrompt = `Topic: ${topic}
Difficulty: ${difficultyLevel}
Create ${nodeCount} connected concept nodes that build on each other.

CRITICAL: Each node should create a clear bridge to the next node. The sequence should feel like a story unfolding, where understanding one concept naturally raises questions about the next.

For each node, provide ONLY:
1. Title (2-4 words, descriptive)
2. Vocabulary terms (2-4 key terms, NO definitions)
3. Brief metadata hint (e.g., '1776' for history, 'Pavlov' for psychology)

Output format: JSON array
[
  { "title": "string", "vocabularyTerms": ["string"], "metadataHint": "string" }
]`;

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

    // Parse JSON (handle potential markdown code blocks)
    const cleanContent = content.replace(/```json\n?|```/g, "").trim();
    let nodesData;
    try {
        nodesData = JSON.parse(cleanContent);
        // Handle if it's wrapped in an object like { nodes: [...] } or just array
        if (!Array.isArray(nodesData) && nodesData.nodes && Array.isArray(nodesData.nodes)) {
            nodesData = nodesData.nodes;
        } else if (!Array.isArray(nodesData)) {
             // If it's an object but not { nodes: ... }, try to find an array property
             const arrayProp = Object.values(nodesData).find(val => Array.isArray(val));
             if (arrayProp) {
                 nodesData = arrayProp;
             } else {
                 throw new Error("Response is not an array");
             }
        }
    } catch (e) {
        console.error("Failed to parse JSON:", cleanContent);
        throw new Error("Invalid JSON response from AI");
    }

    // Create Lesson
    const lesson = await prisma.lesson.create({
      data: {
        userId: session.user.id,
        subjectId,
        topic,
        difficultyLevel,
        status: "STRUCTURE_COMPLETE",
        nodes: {
          create: nodesData.map((node: any, index: number) => ({
            title: node.title,
            vocabularyTerms: node.vocabularyTerms,
            metadataHint: node.metadataHint,
            order: index,
            status: "PENDING_CONTENT",
          })),
        },
      },
      include: {
        nodes: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            title: true,
            vocabularyTerms: true,
            metadataHint: true,
            status: true,
          }
        }
      },
    });

    return NextResponse.json(lesson);

  } catch (error) {
    console.error("Structure generation error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
