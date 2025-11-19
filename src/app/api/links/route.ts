import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
export const runtime = "nodejs";

const CODE_REGEX = /^[A-Za-z0-9]{6,8}$/;

export async function GET() {
  const links = await prisma.link.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(links);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url, code } = body as { url?: string; code?: string };

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "url is required" }, { status: 400 });
    }

    // Basic URL validation
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    if (code && !CODE_REGEX.test(code)) {
      return NextResponse.json({ error: "Code must match [A-Za-z0-9]{6,8}" }, { status: 400 });
    }

    // If code provided, enforce uniqueness and conflict status 409
    if (code) {
      const existing = await prisma.link.findUnique({ where: { code } });
      if (existing) {
        return NextResponse.json({ error: "Code already exists" }, { status: 409 });
      }
    }

    // If no code, generate one
    const finalCode = code ?? generateCode();

    const created = await prisma.link.create({
      data: { code: finalCode, url: parsed.toString() },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

function generateCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    if (CODE_REGEX.test(code)) return code;
  }
  return Math.random().toString(36).slice(2, 10).replace(/[^A-Za-z0-9]/g, "").slice(0, 8);
}