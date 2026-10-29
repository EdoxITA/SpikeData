import { NextResponse } from "next/server";

export const runtime = "nodejs";

const FIELDS = ["venue", "name", "phone", "email", "city"] as const;

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  // honeypot: i bot compilano il campo nascosto. Rispondiamo ok senza fare nulla.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const lead: Record<string, string> = {};
  for (const f of FIELDS) {
    const v = typeof body[f] === "string" ? (body[f] as string).trim().slice(0, 200) : "";
    if (!v) return NextResponse.json({ ok: false, error: `missing_${f}` }, { status: 400 });
    lead[f] = v;
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(lead.email)) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
  }

  const payload = { ...lead, source: "brindo-site", receivedAt: new Date().toISOString() };
  const endpoint = process.env.CONTACT_ENDPOINT_URL;

  if (!endpoint) {
    console.log("[brindo] nuova richiesta demo:", payload);
    return NextResponse.json({ ok: true });
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`endpoint ${res.status}`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[brindo] invio all'endpoint fallito:", err);
    return NextResponse.json({ ok: false, error: "upstream_failed" }, { status: 502 });
  }
}
