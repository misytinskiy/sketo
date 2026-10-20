"""Extract source rows without guessing product identity. Requires pymupdf."""
import hashlib
import json
import re
from pathlib import Path
import pymupdf

ROOT = Path(__file__).resolve().parents[2]
pdf = ROOT / "Muvna.pdf"
rows = []
with pymupdf.open(pdf) as document:
    for page_number, page in enumerate(document, 1):
        for table in page.find_tables().tables:
            for cells in table.extract():
                if len(cells) != 7 or not re.fullmatch(r"[A-Z]{1,3}\d+[A-Z0-9]*", (cells[3] or "").strip()):
                    continue
                number, name, _, sku, stock, wholesale, retail = cells
                rows.append({
                    "page": page_number, "row": int(number), "sku": sku.strip(),
                    "source_name": " ".join(name.split()),
                    "stock": int(stock),
                    "retail": int(retail.replace(",", "")),
                })
assert len(rows) == len({row["sku"] for row in rows}), "Duplicate source SKU"
payload = {"source": pdf.name, "sha256": hashlib.sha256(pdf.read_bytes()).hexdigest(), "rows": rows}
target = Path(__file__).with_name("20261012_muvna_source.json")
target.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n")
print(f"Extracted {len(rows)} SKU rows to {target.name}")
