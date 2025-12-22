#!/usr/bin/env python3
"""
Final search for APU topics with actual content pages (not TOC).
"""

from pypdf import PdfReader
import json
import re

pdf_path = "/Users/petruinstagram/Desktop/web-apps/gabi-airbus/A220-300_FCOM1.pdf"

reader = PdfReader(pdf_path)

# Search for specific page markers from the TOC
# From page 455, we saw references like "04−01−1", "04−02−10", etc.
# These should appear as headers on the actual content pages

print("Searching for APU content pages by page markers...")
print("=" * 80)

page_markers_found = {}

# Search pages 455-550 for APU chapter markers
for page_num in range(454, 550):
    if page_num >= len(reader.pages):
        break

    page = reader.pages[page_num]
    text = page.extract_text()

    if not text:
        continue

    actual_page = page_num + 1

    # Look for page markers like "04−01−1", "04−02−1", etc.
    # Also look for section headers
    lines = text.split('\n')

    for line in lines[:20]:  # Check first 20 lines for headers
        # Look for page numbers like 04-01-1, 04-02-10, etc.
        if re.search(r'04[−-]\d{2}[−-]\d+', line):
            marker = re.search(r'(04[−-]\d{2}[−-]\d+)', line).group(1)

            # Also get the section name
            section = line.strip()

            if marker not in page_markers_found:
                page_markers_found[marker] = {
                    "page": actual_page,
                    "section": section[:100]
                }
                print(f"Page {actual_page}: {marker} - {section[:80]}")

print("\n" + "=" * 80)
print("Now searching for specific APU topics...")
print("=" * 80)

# Now search for specific content
topics_found = {}

# Define what we're looking for and where to search
searches = {
    "APU_overview": {
        "start": 459,
        "end": 475,
        "terms": ["APU – OVERVIEW", "self-contained gas turbine"],
        "desc": "APU overview"
    },
    "APU_description": {
        "start": 465,
        "end": 475,
        "terms": ["APU – DESCRIPTION", "APU assembly"],
        "desc": "APU description"
    },
    "APU_operation": {
        "start": 474,
        "end": 480,
        "terms": ["APU – OPERATION", "APU operation includes"],
        "desc": "APU operation"
    },
    "APU_starting": {
        "start": 475,
        "end": 478,
        "terms": ["APU starting", "battery bus supplies electrical"],
        "desc": "APU starting sequence"
    },
    "APU_shutdown": {
        "start": 478,
        "end": 481,
        "terms": ["APU shutdown", "shutdown sequence"],
        "desc": "APU shutdown"
    },
    "APU_controls": {
        "start": 481,
        "end": 495,
        "terms": ["APU panel", "APU BLEED switch", "APU GEN switch", "APU FIRE switch"],
        "desc": "APU controls and indications"
    },
    "APU_bleed": {
        "start": 483,
        "end": 488,
        "terms": ["APU BLEED switch", "APU bleed air"],
        "desc": "APU bleed air"
    },
    "APU_generator": {
        "start": 484,
        "end": 490,
        "terms": ["APU GEN switch", "APU generator"],
        "desc": "APU generator"
    },
    "APU_fire": {
        "start": 484,
        "end": 490,
        "terms": ["APU FIRE switch", "APU fire panel"],
        "desc": "APU fire protection"
    },
    "APU_fuel": {
        "start": 470,
        "end": 476,
        "terms": ["APU fuel shutoff valve", "APU Fuel Control Unit", "APU fuel system"],
        "desc": "APU fuel system"
    }
}

for topic, search_info in searches.items():
    for page_num in range(search_info["start"] - 1, search_info["end"]):
        if page_num >= len(reader.pages):
            break

        page = reader.pages[page_num]
        text = page.extract_text()

        if not text:
            continue

        actual_page = page_num + 1
        found = False

        for term in search_info["terms"]:
            if term.upper() in text.upper():
                if topic not in topics_found:
                    topics_found[topic] = {
                        "page": actual_page,
                        "desc": search_info["desc"]
                    }
                    print(f"{topic}: Page {actual_page} - {search_info['desc']}")
                    found = True
                    break

        if found:
            break

print("\n" + "=" * 80)
print("FINAL JSON OUTPUT:")
print("=" * 80)

# Create final mapping
json_output = {}

# Map based on found pages
if "APU_overview" in topics_found:
    json_output["04APU01"] = {"pdf": "FCOM1", "page": topics_found["APU_overview"]["page"]}

if "APU_description" in topics_found:
    json_output["04APU02"] = {"pdf": "FCOM1", "page": topics_found["APU_description"]["page"]}

if "APU_starting" in topics_found:
    json_output["04APU03"] = {"pdf": "FCOM1", "page": topics_found["APU_starting"]["page"]}
    json_output["04APU04"] = {"pdf": "FCOM1", "page": topics_found["APU_starting"]["page"]}

if "APU_bleed" in topics_found:
    json_output["04APU05"] = {"pdf": "FCOM1", "page": topics_found["APU_bleed"]["page"]}
    json_output["04APU06"] = {"pdf": "FCOM1", "page": topics_found["APU_bleed"]["page"]}

if "APU_generator" in topics_found:
    json_output["04APU07"] = {"pdf": "FCOM1", "page": topics_found["APU_generator"]["page"]}
    json_output["04APU08"] = {"pdf": "FCOM1", "page": topics_found["APU_generator"]["page"]}

if "APU_fuel" in topics_found:
    json_output["04APU09"] = {"pdf": "FCOM1", "page": topics_found["APU_fuel"]["page"]}

# Limitations - need to search for this specifically
for page_num in range(454, 500):
    if page_num >= len(reader.pages):
        break
    page = reader.pages[page_num]
    text = page.extract_text()
    if text and ("APU limitation" in text or "operating limits" in text or "altitude limit" in text.lower()):
        if "LIMITATION" in text.upper() and "APU" in text.upper():
            json_output["04APU10"] = {"pdf": "FCOM1", "page": page_num + 1}
            json_output["04APU11"] = {"pdf": "FCOM1", "page": page_num + 1}
            print(f"APU_limitations: Page {page_num + 1}")
            break

if "APU_fire" in topics_found:
    json_output["04APU12"] = {"pdf": "FCOM1", "page": topics_found["APU_fire"]["page"]}
    json_output["04APU13"] = {"pdf": "FCOM1", "page": topics_found["APU_fire"]["page"]}

if "APU_shutdown" in topics_found:
    json_output["04APU14"] = {"pdf": "FCOM1", "page": topics_found["APU_shutdown"]["page"]}

print(json.dumps(json_output, indent=2, sort_keys=True))
