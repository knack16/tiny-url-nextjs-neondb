export const runtime = "nodejs";
import { prisma } from "../../../lib/prisma";

export default async function CodeStats({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const link = await prisma.link.findUnique({ where: { code } });

  if (!link) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Stats</h1>
        <p className="text-red-600">Not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Stats for {link.code}</h1>
      <ul className="list-disc pl-6">
        <li>Target URL: <a className="text-blue-600 hover:underline" href={link.url}>{link.url}</a></li>
        <li>Total clicks: {link.totalClicks}</li>
        <li>Last clicked: {link.lastClicked ? new Date(link.lastClicked).toLocaleString() : "—"}</li>
        <li>Created: {new Date(link.createdAt).toLocaleString()}</li>
      </ul>
    </div>
  );
}