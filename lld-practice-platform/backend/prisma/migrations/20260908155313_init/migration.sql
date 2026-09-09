-- CreateTable
CREATE TABLE "Problem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "statement" TEXT NOT NULL,
    "functionalRequirements" TEXT NOT NULL,
    "nonFunctionalRequirements" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Rubric" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "problemId" TEXT NOT NULL,
    "expectedClasses" TEXT NOT NULL,
    "expectedPatterns" TEXT NOT NULL,
    "dimensions" TEXT NOT NULL,
    CONSTRAINT "Rubric_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Attempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "learnerId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" DATETIME,
    CONSTRAINT "Attempt_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "attemptId" TEXT NOT NULL,
    "classDesign" TEXT NOT NULL,
    "responsibilities" TEXT NOT NULL,
    "tradeoffs" TEXT NOT NULL,
    "rawText" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Submission_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "Attempt" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "attemptId" TEXT NOT NULL,
    "deterministicResults" TEXT NOT NULL,
    "llmResults" TEXT NOT NULL DEFAULT '[]',
    "summary" TEXT NOT NULL DEFAULT '',
    "overallSignal" TEXT NOT NULL DEFAULT 'needs_work',
    "llmAvailable" BOOLEAN NOT NULL DEFAULT false,
    "comparedToPrevious" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Feedback_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "Attempt" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Problem_slug_key" ON "Problem"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Rubric_problemId_key" ON "Rubric"("problemId");

-- CreateIndex
CREATE UNIQUE INDEX "Submission_attemptId_key" ON "Submission"("attemptId");

-- CreateIndex
CREATE UNIQUE INDEX "Feedback_attemptId_key" ON "Feedback"("attemptId");
