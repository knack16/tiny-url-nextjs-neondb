export const runtime = "nodejs";
import { notFound, redirect } from "next/navigation";
import { prisma } from "../../lib/prisma";

const CODE_REGEX = /^[A-Za-z0-9]{6,8}$/;

export default async function CodePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if (!CODE_REGEX.test(code)) {
    notFound();
  }
  const link = await prisma.link.findUnique({ where: { code } });
  if (!link) {
    notFound();
  }
  await prisma.link.update({
    where: { id: link.id },
    data: { totalClicks: { increment: 1 }, lastClicked: new Date() },
  });
  redirect(link.url);
}