#!/usr/bin/env python3
"""
Find the actual APU chapter location in the PDF.
"""

from pypdf import PdfReader

pdf_path = "/Users/petruinstagram/Desktop/web-apps/gabi-airbus/A220-300_FCOM1.pdf"

reader = PdfReader(pdf_path)
total_pages = len(reader.pages)

print(f"Total pages: {total_pages}")
print("Searching for APU chapter markers...\n")

apu_mentions = []

for page_num in range(total_pages):
    if page_num % 200 == 0:
        print(f"Searching page {page_num + 1}/{total_pages}...")

    page = reader.pages[page_num]
    text = page.extract_text()

    if text:
        text_upper = text.upper()
        actual_page = page_num + 1

        # Look for chapter markers
        if ("04APU" in text or "04 APU" in text or
            ("CHAPTER 04" in text_upper and "APU" in text_upper) or
            ("04−0" in text and "APU" in text_upper)):

            # Extract a snippet
            lines = text.split('\n')
            snippet = ' '.join(lines[:5])[:200]

            apu_mentions.append({
                "page": actual_page,
                "snippet": snippet
            })

            if len(apu_mentions) <= 20:  # Only print first 20
                print(f"\nPage {actual_page}:")
                print(f"  {snippet[:150]}")

print(f"\n{'='*80}")
print(f"Found {len(apu_mentions)} pages mentioning APU chapter markers")
print(f"{'='*80}")

# Find the most likely chapter start (look for page numbers like 04-01-1, etc.)
likely_starts = []
for mention in apu_mentions:
    if "04−01" in mention["snippet"] or "04−00" in mention["snippet"]:
        likely_starts.append(mention)

print("\nMost likely APU chapter starts:")
for start in likely_starts[:10]:
    print(f"  Page {start['page']}: {start['snippet'][:100]}")
