"use client";
import { useEffect, useMemo, useState } from "react";

type Link = {
  id: number;
  code: string;
  url: string;
  totalClicks: number;
  lastClicked: string | null;
  createdAt: string;
};

export default function Dashboard() {
  const [links, setLinks] = useState<Link[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState("");
  const [code, setCode] = useState("");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<
    "code" | "totalClicks" | "lastClicked"
  >("code");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    fetch("/api/links")
      .then((r) => r.json())
      .then(setLinks)
      .catch(() => setError("Failed to load"));
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    const list = (links ?? []).filter(
      (l) => l.code.toLowerCase().includes(q) || l.url.toLowerCase().includes(q)
    );
    const compare = (a: Link, b: Link) => {
      let A: string | number | null = a[sortKey];
      let B: string | number | null = b[sortKey];

      // Normalize lastClicked to numeric timestamps
      if (sortKey === "lastClicked") {
        A = A ? new Date(A as string).getTime() : null;
        B = B ? new Date(B as string).getTime() : null;
      }

      // Always place null/undefined values last regardless of sort direction
      const aNull = A === null || A === undefined;
      const bNull = B === null || B === undefined;
      if (aNull && bNull) return 0;
      if (aNull) return 1;
      if (bNull) return -1;

      // Compare strings lexicographically and numbers arithmetically
      if (typeof A === "string" && typeof B === "string") {
        const res = A.localeCompare(B);
        return sortDir === "asc" ? res : -res;
      }

      const aNum = Number(A);
      const bNum = Number(B);
      if (aNum < bNum) return sortDir === "asc" ? -1 : 1;
      if (aNum > bNum) return sortDir === "asc" ? 1 : -1;
      return 0;
    };
    return list.sort(compare);
  }, [links, query, sortKey, sortDir]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url, code: code || undefined }),
      });
      if (res.status === 409) {
        setError("Code already exists");
      } else if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to create");
      } else {
        const created = await res.json();
        setLinks([created, ...(links ?? [])]);
        setUrl("");
        setCode("");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (codeToDelete: string) => {
    const prev = links ?? [];
    setLinks(prev.filter((l) => l.code !== codeToDelete));
    const res = await fetch(`/api/links/${codeToDelete}`, { method: "DELETE" });
    if (!res.ok) {
      // rollback
      setLinks(prev);
      setError("Failed to delete");
    }
  };

  return (
    <div className="space-y-8">
      <section className="rounded-lg border bg-black p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Add New Link</h2>
        <form
          onSubmit={onSubmit}
          className="mt-4 grid grid-cols-1 md:grid-cols-6 gap-3"
        >
          <input
            type="url"
            required
            placeholder="https://example.com/docs"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="md:col-span-3 rounded border px-3 py-2"
          />
          <input
            type="text"
            placeholder="Custom code (A-Za-z0-9, 6-8)"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            pattern="[A-Za-z0-9]{6,8}"
            className="md:col-span-2 rounded border px-3 py-2"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded bg-black text-white px-4 py-2 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </form>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </section>

      <section className="rounded-lg border bg-black p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">All Links</h2>
          <input
            type="text"
            placeholder="Search by code or URL"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="rounded border px-3 py-2"
          />
        </div>
        <div className="mt-4">

  {/* MOBILE CARD VIEW */}
  <div className="block sm:hidden space-y-4">
    {links === null ? (
      <div className="p-4 border rounded bg-white text-center">Loading...</div>
    ) : links.length === 0 ? (
      <div className="p-4 border rounded bg-white text-center">No links yet</div>
    ) : (
      filtered.map((l) => (
        <div key={l.code} className="border rounded bg-white p-4 space-y-2">
          <div>
            <span className="font-semibold">Short code:</span>
            <a href={`/${l.code}`} className="ml-2 text-blue-600 hover:underline font-mono">
              {l.code}
            </a>
          </div>

          <div>
            <span className="font-semibold">Target URL:</span>
            <div className="mt-1 break-words">
              {l.url}
            </div>
            <button
              className="mt-2 rounded border px-2 py-1"
              onClick={() => navigator.clipboard.writeText(`${location.origin}/${l.code}`)}
            >
              Copy
            </button>
          </div>

          <div className="flex justify-between pt-2 border-t">
            <div className="text-center">
              <div className="font-semibold">Clicks</div>
              <div>{l.totalClicks}</div>
            </div>

            <div className="text-center">
              <div className="font-semibold">Last clicked</div>
              <div>{l.lastClicked ? new Date(l.lastClicked).toLocaleString() : "—"}</div>
            </div>

            <div className="text-center">
              <button
                className="rounded bg-red-600 text-white px-2 py-1"
                onClick={() => onDelete(l.code)}
              >
                Delete
              </button>
              <a href={`/code/${l.code}`} className="block mt-1 text-blue-600 hover:underline">
                Stats
              </a>
            </div>
          </div>
        </div>
      ))
    )}
  </div>

  {/* DESKTOP / TABLET TABLE VIEW */}
  <div className="hidden sm:block overflow-x-hidden">
    <table className="min-w-full text-sm border-2 border-gray-300">
      <thead>
        <tr className="text-center bg-gray-50">
          <th className="px-4 py-3 cursor-pointer" onClick={() => toggleSort("code")}>Short code</th>
          <th className="px-4 py-3">Target URL</th>
          <th className="px-4 py-3 cursor-pointer" onClick={() => toggleSort("totalClicks")}>Total clicks</th>
          <th className="px-4 py-3 cursor-pointer" onClick={() => toggleSort("lastClicked")}>Last clicked</th>
          <th className="px-4 py-3">Actions</th>
        </tr>
      </thead>

      <tbody>
        {links === null ? (
          <tr><td className="px-4 py-4 text-center" colSpan={5}>Loading...</td></tr>
        ) : links.length === 0 ? (
          <tr><td className="px-4 py-4 text-center" colSpan={5}>No links yet</td></tr>
        ) : (
          filtered.map((l) => (
            <tr key={l.code} className="border-t">
              <td className="px-4 py-3 font-mono text-left">
                <a className="text-blue-600 hover:underline" href={`/${l.code}`}>{l.code}</a>
              </td>

              <td className="px-4 py-3 text-left max-w-[400px] break-words">
                {l.url}
                <button
                  className="ml-2 rounded border px-2 py-1"
                  onClick={() =>
                    navigator.clipboard.writeText(`${location.origin}/${l.code}`)
                  }
                >
                  Copy
                </button>
              </td>

              <td className="px-4 py-3 text-center">{l.totalClicks}</td>

              <td className="px-4 py-3 text-center">
                {l.lastClicked ? new Date(l.lastClicked).toLocaleString() : "—"}
              </td>

              <td className="px-4 py-3 text-center">
                <a className="mr-2 text-blue-600 hover:underline" href={`/code/${l.code}`}>
                  Stats
                </a>
                <button
                  className="rounded bg-red-600 text-white px-2 py-1"
                  onClick={() => onDelete(l.code)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
</div>

      </section>
    </div>
  );

  function toggleSort(key: typeof sortKey) {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else setSortKey(key);
  }
}
