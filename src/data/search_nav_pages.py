#!/usr/bin/env python3
"""
Search A220 FCOM1 PDF for Navigation chapter topics and extract actual PDF page numbers.
"""

import pdfplumber
import re
import json

pdf_path = "/Users/petruinstagram/Desktop/web-apps/gabi-airbus/A220-300_FCOM1.pdf"

# Search terms for each topic
search_topics = {
    "FMS": ["flight management system", "fms description", "flight management computer"],
    "Navigation_displays": ["navigation display", "nav display", "nd mode"],
    "GNSS_GPS": ["gnss", "gps system", "global navigation satellite"],
    "IRS": ["inertial reference system", "irs description", "inertial reference unit"],
    "VOR": ["vor system", "vhf omnidirectional", "vor navigation"],
    "ILS": ["ils system", "instrument landing system", "localizer"],
    "DME": ["dme system", "distance measuring equipment"]
}

results = {}
detailed_findings = []

print("Searching PDF for Navigation topics...")
print(f"PDF: {pdf_path}\n")

with pdfplumber.open(pdf_path) as pdf:
    total_pages = len(pdf.pages)
    print(f"Total pages in PDF: {total_pages}\n")

    # Search through all pages
    for page_num in range(total_pages):
        if page_num % 100 == 0:
            print(f"Scanning page {page_num + 1}/{total_pages}...")

        page = pdf.pages[page_num]
        text = page.extract_text()

        if text:
            text_lower = text.lower()

            # Check for each topic
            for topic, search_terms in search_topics.items():
                for term in search_terms:
                    if term.lower() in text_lower:
                        actual_page = page_num + 1

                        # Extract context
                        lines = text.split('\n')
                        context_lines = []
                        for i, line in enumerate(lines):
                            if term.lower() in line.lower():
                                # Get surrounding context
                                start = max(0, i - 2)
                                end = min(len(lines), i + 3)
                                context_lines = lines[start:end]
                                break

                        finding = {
                            "topic": topic,
                            "term": term,
                            "page": actual_page,
                            "context": " | ".join([l.strip() for l in context_lines if l.strip()])[:200]
                        }
                        detailed_findings.append(finding)

                        # Keep the first occurrence for each topic
                        if topic not in results:
                            results[topic] = actual_page
                            print(f"✓ Found '{topic}' (term: '{term}') on PDF page {actual_page}")

print("\n" + "="*80)
print("SUMMARY OF FINDINGS:")
print("="*80)

# Create JSON output with question IDs
json_output = {}
question_mapping = {
    "FMS": "16NAV01",
    "Navigation_displays": "16NAV02",
    "GNSS_GPS": "16NAV03",
    "IRS": "16NAV04",
    "VOR": "16NAV05",
    "ILS": "16NAV06",
    "DME": "16NAV07"
}

for topic, page in sorted(results.items(), key=lambda x: x[1]):
    question_id = question_mapping.get(topic, topic)
    json_output[question_id] = {"pdf": "FCOM1", "page": page}
    print(f"{question_id} ({topic}): Page {page}")

print("\n" + "="*80)
print("JSON OUTPUT:")
print("="*80)
print(json.dumps(json_output, indent=2))

# Save detailed findings
print("\n" + "="*80)
print("DETAILED FINDINGS (first 20):")
print("="*80)
for finding in detailed_findings[:20]:
    print(f"\nPage {finding['page']} - {finding['topic']} ({finding['term']}):")
    print(f"  {finding['context']}")

# Save results to file
output_file = "/Users/petruinstagram/Desktop/web-apps/gabi-airbus/quiz-app/src/data/nav_pages_results.json"
with open(output_file, 'w') as f:
    json.dump({
        "summary": json_output,
        "detailed_findings": detailed_findings
    }, f, indent=2)

print(f"\n\nResults saved to: {output_file}")

if not results:
    print("\nNo results found. The PDF might be scanned or use different terminology.")
