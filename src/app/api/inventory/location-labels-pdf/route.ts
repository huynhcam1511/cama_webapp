import { readFile } from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const pdfPath = path.join(process.cwd(), "output", "pdf", "CAMA-Ma-Vi-Tri-Xprinter-XP-365B.pdf");
  const pdf = await readFile(pdfPath);

  return new Response(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="CAMA-Ma-Vi-Tri-Xprinter-XP-365B.pdf"',
      "Content-Length": String(pdf.byteLength),
      "Cache-Control": "no-store",
    },
  });
}
