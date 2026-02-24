import { prisma } from "@/lib/prisma";

export async function cleanDatabase() {
  await prisma.actionItem.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.member.deleteMany();
}

export async function cleanDatabaseWithTags() {
  await prisma.actionItemTag.deleteMany();
  await prisma.topicTag.deleteMany();
  await prisma.actionItem.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.member.deleteMany();
}

export async function cleanAll() {
  await prisma.actionItemTag.deleteMany();
  await prisma.topicTag.deleteMany();
  await prisma.actionItem.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.meetingTemplate.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.member.deleteMany();
}
