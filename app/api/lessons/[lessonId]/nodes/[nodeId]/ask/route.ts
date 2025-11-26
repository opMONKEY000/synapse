import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { deepseek } from "@/lib/deepseek";
import { NextResponse } from "next/server";
import { z } from "zod";

const askSchema = z.object({
  question: z.string(),
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
    const { question } = askSchema.parse(body);

    // Verify ownership and fetch node
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId, userId: session.user.id },
      include: {
        nodes: {
          where: { id: nodeId },
          select: {
            title: true,
            summary: true,
            vocabulary: true,
          }
        },
        subject: true,
      },
    });

    if (!lesson || lesson.nodes.length === 0) {
      return new NextResponse("Node not found", { status: 404 });
    }

    const node = lesson.nodes[0];
    const vocabTerms = Array.isArray(node.vocabulary) 
      ? (node.vocabulary as any[]).map((v: any) => v.term).join(", ") 
      : "";

    const systemPrompt = `You are a helpful tutor for ${lesson.subject.name}. Answer the student's question clearly and concisely, relating it back to the current concept.`;
    
    const userPrompt = `Lesson Topic: ${lesson.topic}
Current Node: ${node.title}
Node Summary: ${node.summary}
Vocabulary: ${vocabTerms}

Student Question: ${question}

Provide a clear, conversational answer (2-3 sentences) that:
1. Directly addresses their question
2. Relates back to the current concept
3. Uses simple language
4. Encourages further learning

Output format: Plain text response`;

    const completion = await deepseek.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      model: "deepseek-chat",
    });

    const answer = completion.choices[0].message.content;
    
    return NextResponse.json({ answer });

  } catch (error) {
    console.error("Q&A error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
