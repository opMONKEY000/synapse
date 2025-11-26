import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'student@example.com'
  const password = await bcrypt.hash('password123', 10)

  // 1. Create User
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: 'Alex Student',
      password,
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    },
  })

  console.log({ user })

  // 2. Create Documents & Conversations (History)
  const historyDoc = await prisma.document.create({
    data: {
      userId: user.id,
      title: 'The French Revolution',
      subject: 'History',
      fileUrl: 'https://example.com/french-rev.pdf',
      fileType: 'pdf',
      fileSize: 1024,
    },
  })

  await prisma.conversation.create({
    data: {
      userId: user.id,
      documentId: historyDoc.id,
      title: 'The French Revolution: Key Events',
      subject: 'History',
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    },
  })

  // 3. Create Documents & Conversations (Math)
  const mathDoc = await prisma.document.create({
    data: {
      userId: user.id,
      title: 'Quadratic Formula',
      subject: 'Math',
      fileUrl: 'https://example.com/quadratic.pdf',
      fileType: 'pdf',
      fileSize: 2048,
    },
  })

  await prisma.conversation.create({
    data: {
      userId: user.id,
      documentId: mathDoc.id,
      title: 'Quadratic Formula Derivation',
      subject: 'Math',
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    },
  })

  // 4. Create Documents & Conversations (Physics)
  const physicsDoc = await prisma.document.create({
    data: {
      userId: user.id,
      title: 'Newtonian Mechanics',
      subject: 'Physics',
      fileUrl: 'https://example.com/newton.pdf',
      fileType: 'pdf',
      fileSize: 512,
    },
  })

  await prisma.conversation.create({
    data: {
      userId: user.id,
      documentId: physicsDoc.id,
      title: 'Newton\'s Second Law',
      subject: 'Physics',
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
    },
  })

  // 5. Create Review Items (for Progress Card)
  // Create a recall session first
  const session = await prisma.recallSession.create({
    data: {
      userId: user.id,
      title: 'Weekly Review',
      score: 85,
      completedAt: new Date(),
    },
  })

  // Create some review items
  await prisma.reviewItem.createMany({
    data: [
      { userId: user.id, recallSessionId: session.id, question: 'Q1', correctAnswer: 'A1', isCorrect: true, nextReviewAt: new Date(Date.now() + 1000 * 60 * 60 * 24) },
      { userId: user.id, recallSessionId: session.id, question: 'Q2', correctAnswer: 'A2', isCorrect: true, nextReviewAt: new Date(Date.now() + 1000 * 60 * 60 * 24) },
      { userId: user.id, recallSessionId: session.id, question: 'Q3', correctAnswer: 'A3', isCorrect: false, nextReviewAt: new Date(Date.now() - 1000 * 60 * 60) }, // Overdue
      { userId: user.id, recallSessionId: session.id, question: 'Q4', correctAnswer: 'A4', isCorrect: true, nextReviewAt: new Date(Date.now() + 1000 * 60 * 60 * 48) },
    ],
  })

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
