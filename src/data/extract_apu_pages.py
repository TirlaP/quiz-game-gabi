#!/usr/bin/env python3
"""
Extract text from APU chapter pages to understand structure.
"""

from pypdf import PdfReader

pdf_path = "/Users/petruinstagram/Desktop/web-apps/gabi-airbus/A220-300_FCOM1.pdf"

reader = PdfReader(pdf_path)

# Check pages around 1403 (where APU chapter was found)
pages_to_check = list(range(1400, 1510, 5))  # Every 5th page

for page_num in pages_to_check:
    if page_num < len(reader.pages):
        page = reader.pages[page_num - 1]  # Convert to 0-indexed
        text = page.extract_text()

        print(f"\n{'='*80}")
        print(f"PAGE {page_num}")
        print(f"{'='*80}")
        print(text[:800])  # First 800 characters
        print("...")
