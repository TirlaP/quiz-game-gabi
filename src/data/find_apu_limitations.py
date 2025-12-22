#!/usr/bin/env python3
from pypdf import PdfReader

pdf_path = "/Users/petruinstagram/Desktop/web-apps/gabi-airbus/A220-300_FCOM1.pdf"
reader = PdfReader(pdf_path)

print("Searching for APU limitations...")

# APU limitations are typically in Volume 2 - Limitations, not in the systems chapter
# Let's search the entire document more broadly
for page_num in range(0, 500):
    if page_num >= len(reader.pages):
        break

    page = reader.pages[page_num]
    text = page.extract_text()

    if not text:
        continue

    actual_page = page_num + 1
    text_upper = text.upper()

    # Look for APU limitations - they might be in a limitations section
    if "APU" in text_upper and "LIMIT" in text_upper:
        # Check for specific limitation keywords
        if any(term in text_upper for term in ["ALTITUDE LIMIT", "MAXIMUM ALTITUDE", "TEMPERATURE LIMIT", "APU OPERATING LIMIT"]):
            lines = text.split('\n')
            for i, line in enumerate(lines[:40]):
                if "LIMIT" in line.upper() and any(word in line.upper() for word in ["APU", "ALTITUDE", "TEMPERATURE"]):
                    print(f"\nPage {actual_page}:")
                    print(f"  {line[:120]}")
                    break
