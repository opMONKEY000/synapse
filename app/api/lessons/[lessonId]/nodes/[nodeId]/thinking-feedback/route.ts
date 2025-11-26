import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { deepseek } from "@/lib/deepseek";
import { NextResponse } from "next/server";
import { z } from "zod";

const feedbackSchema = z.object({
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
    const { userResponse } = feedbackSchema.parse(body);

    // Verify ownership and fetch node
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId, userId: session.user.id },
      include: {
        nodes: {
          where: { id: nodeId },
          select: {
            title: true,
            thinkingQuestion: true,
          }
        },
        subject: true,
      },
    });

    if (!lesson || lesson.nodes.length === 0) {
      return new NextResponse("Node not found", { status: 404 });
    }

    const node = lesson.nodes[0];

    const systemPrompt = `You are an encouraging tutor for ${lesson.subject.name}. Evaluate the student's thinking and provide brief, positive feedback.`;
    
    const userPrompt = `Lesson Topic: ${lesson.topic}
Current Node: ${node.title}
Thinking Question: ${node.thinkingQuestion}
Student Response: ${userResponse}

Evaluate the student's response and provide brief feedback (1-2 sentences) that:
1. Validates correct understanding
2. Gently corrects misconceptions if needed
3. Bridges to the next concept
4. Is encouraging and positive

Output format: Plain text feedback`;

    const completion = await deepseek.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      model: "deepseek-chat",
    });

    const feedback = completion.choices[0].message.content;
    
    return NextResponse.json({ feedback });

  } catch (error) {
    console.error("Thinking feedback error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
