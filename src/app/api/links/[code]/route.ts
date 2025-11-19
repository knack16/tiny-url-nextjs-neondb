import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
export const runtime = "nodejs";

const CODE_REGEX = /^[A-Za-z0-9]{6,8}$/;

export async function GET(_: Request, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  if (!CODE_REGEX.test(code)) {
    return NextResponse.json({ error: "Invalid code" }, { status: 400 });
  }
  const link = await prisma.link.findUnique({ where: { code } });
  if (!link) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(link);
}

export async function DELETE(_: Request, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  if (!CODE_REGEX.test(code)) {
    return NextResponse.json({ error: "Invalid code" }, { status: 400 });
  }
  const existing = await prisma.link.findUnique({ where: { code } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await prisma.link.delete({ where: { code } });
  return NextResponse.json({ ok: true });
}