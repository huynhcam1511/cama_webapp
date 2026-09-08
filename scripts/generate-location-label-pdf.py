"""Generate the Xprinter XP-365B 72 x 22 mm two-column location-label PDF."""

from __future__ import annotations

import json
import os
import re
import unicodedata
import urllib.parse
import urllib.request
from pathlib import Path

from reportlab.graphics import renderPDF
from reportlab.graphics.barcode import qr
from reportlab.graphics.shapes import Drawing
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen.canvas import Canvas
from reportlab.lib.units import mm


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf" / "CAMA-Ma-Vi-Tri-Xprinter-XP-365B.pdf"
PAGE_SIZE = (72 * mm, 22 * mm)
LABEL_WIDTH = 36 * mm
LABEL_X = (0 * mm, LABEL_WIDTH)
OUTER_SAFE_MARGIN = 1.5 * mm
CENTER_SAFE_MARGIN = 0.5 * mm
QR_SIZE = 19 * mm


def load_env(path: Path) -> None:
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


def fetch_locations() -> list[dict]:
    base = os.environ["NEXT_PUBLIC_SUPABASE_URL"].rstrip("/")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ["NEXT_PUBLIC_SUPABASE_ANON_KEY"]
    url = f"{base}/rest/v1/inventory_locations?select=*"
    request = urllib.request.Request(url, headers={"apikey": key, "Authorization": f"Bearer {key}"})
    with urllib.request.urlopen(request) as response:
        locations = json.load(response)
    return sorted(
        locations,
        key=lambda location: tuple(
            natural_sort_key(location.get(field) or "")
            for field in ("floor_name", "shelf_name", "tier_name")
        ),
    )


def natural_sort_key(value: str) -> tuple:
    """Sort labels naturally so 2 comes before 10 within each floor."""
    return tuple(int(part) if part.isdigit() else part.casefold() for part in re.split(r"(\d+)", value))


def slug(value: str) -> str:
    return "-".join(value.strip().upper().split())


def location_code(location: dict) -> str:
    values = [location.get("floor_name"), location.get("shelf_name"), location.get("tier_name")]
    return "-".join(slug(value) for value in values if value)


def location_name(location: dict) -> str:
    values = [location.get("floor_name"), location.get("shelf_name"), location.get("tier_name")]
    return " › ".join(value for value in values if value)


def qr_target(location: dict, origin: str) -> str:
    query = [("floor", location["floor_name"])]
    if location.get("shelf_name"):
        query.append(("shelf", location["shelf_name"]))
    if location.get("tier_name"):
        query.append(("tier", location["tier_name"]))
    return f"{origin.rstrip('/')}/dashboard/inventory/catalog/new?{urllib.parse.urlencode(query)}"


def fit_font(canvas: Canvas, text: str, font: str, initial: float, max_width: float) -> float:
    size = initial
    while size > 5 and canvas.stringWidth(text, font, size) > max_width:
        size -= 0.25
    return size


def draw_label(canvas: Canvas, location: dict, x: float, origin: str, is_left: bool) -> None:
    # Two exact 36 x 22 mm labels fill the 72 x 22 mm page. The outer edges
    # retain 1.5 mm safe margins while the center gap is tightened to 1 mm.
    text_margin = OUTER_SAFE_MARGIN if is_left else CENTER_SAFE_MARGIN
    qr_margin = CENTER_SAFE_MARGIN if is_left else OUTER_SAFE_MARGIN
    safe_x = x + text_margin
    qr_x = x + LABEL_WIDTH - qr_margin - QR_SIZE
    qr_y = 1.5 * mm

    widget = qr.QrCodeWidget(qr_target(location, origin), barLevel="H", barBorder=2)
    x0, y0, x1, y1 = widget.getBounds()
    drawing = Drawing(QR_SIZE, QR_SIZE, transform=[QR_SIZE / (x1 - x0), 0, 0, QR_SIZE / (y1 - y0), 0, 0])
    drawing.add(widget)
    renderPDF.draw(drawing, canvas, qr_x, qr_y)

    text_width = qr_x - safe_x - 0.75 * mm
    code = location_code(location)
    name = location_name(location)
    title_size = fit_font(canvas, code, "Arial-Bold", 7, text_width)
    canvas.setFillColorRGB(0, 0, 0)
    canvas.setFont("Arial-Bold", title_size)
    canvas.drawString(safe_x, 12.25 * mm, code)
    subtitle_size = fit_font(canvas, name, "Arial", 5.5, text_width)
    canvas.setFont("Arial", subtitle_size)
    canvas.drawString(safe_x, 8.85 * mm, name)


def main() -> None:
    load_env(ROOT / ".env.local")
    locations = fetch_locations()
    project_id = os.environ.get("NEXT_PUBLIC_FIREBASE_PROJECT_ID", "").strip()
    origin = os.environ.get("NEXT_PUBLIC_APP_URL") or f"https://{project_id}.web.app"
    if not project_id and "NEXT_PUBLIC_APP_URL" not in os.environ:
        raise RuntimeError("Set NEXT_PUBLIC_APP_URL so QR codes use the deployed application origin.")

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    pdfmetrics.registerFont(TTFont("Arial", r"C:\Windows\Fonts\arial.ttf"))
    pdfmetrics.registerFont(TTFont("Arial-Bold", r"C:\Windows\Fonts\arialbd.ttf"))
    canvas = Canvas(str(OUTPUT), pagesize=PAGE_SIZE, pageCompression=1)
    canvas.setTitle("CAMA - Mã vị trí - Xprinter XP-365B")
    canvas.setAuthor("CAMA")

    for index in range(0, len(locations), 2):
        draw_label(canvas, locations[index], LABEL_X[0], origin, is_left=True)
        if index + 1 < len(locations):
            draw_label(canvas, locations[index + 1], LABEL_X[1], origin, is_left=False)
        canvas.showPage()
    canvas.save()
    print(f"Created {OUTPUT} with {len(locations)} labels on {(len(locations) + 1) // 2} pages")


if __name__ == "__main__":
    main()
