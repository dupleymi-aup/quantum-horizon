-- CreateTable
CREATE TABLE "assessments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "topic" TEXT NOT NULL,
    "maxScore" INTEGER NOT NULL DEFAULT 100,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "grades" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assessmentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "maxScore" INTEGER NOT NULL,
    "completedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "grades_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "assessments" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "student_groups" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "student_group_members" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "groupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "student_group_members_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "student_groups" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "admin_alerts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'info',
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "assessments_topic_idx" ON "assessments"("topic");

-- CreateIndex
CREATE INDEX "assessments_createdBy_idx" ON "assessments"("createdBy");

-- CreateIndex
CREATE INDEX "grades_userId_idx" ON "grades"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "grades_assessmentId_userId_key" ON "grades"("assessmentId", "userId");

-- CreateIndex
CREATE INDEX "student_groups_createdBy_idx" ON "student_groups"("createdBy");

-- CreateIndex
CREATE INDEX "student_group_members_groupId_idx" ON "student_group_members"("groupId");

-- CreateIndex
CREATE INDEX "student_group_members_userId_idx" ON "student_group_members"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "student_group_members_groupId_userId_key" ON "student_group_members"("groupId", "userId");

-- CreateIndex
CREATE INDEX "admin_alerts_userId_idx" ON "admin_alerts"("userId");

-- CreateIndex
CREATE INDEX "admin_alerts_read_idx" ON "admin_alerts"("read");

-- CreateIndex
CREATE INDEX "admin_alerts_createdAt_idx" ON "admin_alerts"("createdAt");
