-- CreateTable
CREATE TABLE "lessons" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "difficultyLevel" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_nodes" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "vocabularyTerms" TEXT[],
    "metadataHint" TEXT,
    "order" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "summary" TEXT,
    "vocabulary" JSONB,
    "thinkingQuestion" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_nodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "node_mastery" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "masteryScore" DOUBLE PRECISION NOT NULL,
    "recallType" TEXT NOT NULL,
    "userResponse" TEXT,
    "aiEvaluation" TEXT,
    "grade" TEXT,
    "attemptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "node_mastery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "node_mastery_userId_nodeId_attemptedAt_key" ON "node_mastery"("userId", "nodeId", "attemptedAt");

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_nodes" ADD CONSTRAINT "knowledge_nodes_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "node_mastery" ADD CONSTRAINT "node_mastery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "node_mastery" ADD CONSTRAINT "node_mastery_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "knowledge_nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
