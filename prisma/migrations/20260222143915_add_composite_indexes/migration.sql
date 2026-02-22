-- CreateIndex
CREATE INDEX "ActionItem_meetingId_sortOrder_idx" ON "ActionItem"("meetingId", "sortOrder");

-- CreateIndex
CREATE INDEX "ActionItem_memberId_status_idx" ON "ActionItem"("memberId", "status");

-- CreateIndex
CREATE INDEX "Topic_meetingId_sortOrder_idx" ON "Topic"("meetingId", "sortOrder");
