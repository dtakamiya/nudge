-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ActionItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "meetingId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'TODO',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "dueDate" DATETIME,
    "completedAt" DATETIME,
    "goalId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ActionItem_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ActionItem_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ActionItem_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ActionItem" ("completedAt", "createdAt", "description", "dueDate", "id", "meetingId", "memberId", "priority", "sortOrder", "status", "title", "updatedAt") SELECT "completedAt", "createdAt", "description", "dueDate", "id", "meetingId", "memberId", "priority", "sortOrder", "status", "title", "updatedAt" FROM "ActionItem";
DROP TABLE "ActionItem";
ALTER TABLE "new_ActionItem" RENAME TO "ActionItem";
CREATE INDEX "ActionItem_meetingId_idx" ON "ActionItem"("meetingId");
CREATE INDEX "ActionItem_meetingId_sortOrder_idx" ON "ActionItem"("meetingId", "sortOrder");
CREATE INDEX "ActionItem_memberId_idx" ON "ActionItem"("memberId");
CREATE INDEX "ActionItem_memberId_status_idx" ON "ActionItem"("memberId", "status");
CREATE INDEX "ActionItem_status_idx" ON "ActionItem"("status");
CREATE INDEX "ActionItem_priority_idx" ON "ActionItem"("priority");
CREATE INDEX "ActionItem_goalId_idx" ON "ActionItem"("goalId");
CREATE TABLE "new_Goal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "memberId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "progressMode" TEXT NOT NULL DEFAULT 'MANUAL',
    "dueDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Goal_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Goal" ("createdAt", "description", "dueDate", "id", "memberId", "progress", "status", "title", "updatedAt") SELECT "createdAt", "description", "dueDate", "id", "memberId", "progress", "status", "title", "updatedAt" FROM "Goal";
DROP TABLE "Goal";
ALTER TABLE "new_Goal" RENAME TO "Goal";
CREATE INDEX "Goal_memberId_idx" ON "Goal"("memberId");
CREATE INDEX "Goal_memberId_status_idx" ON "Goal"("memberId", "status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
