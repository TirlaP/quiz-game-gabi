#!/usr/bin/env python3
"""
Quick search for Navigation chapter topics in A220 FCOM1.
Searches for: FMS, Navigation displays, GNSS/GPS, IRS, VOR, ILS, DME
"""

try:
    from pypdf import PdfReader
except ImportError:
    print("ERROR: pypdf not installed.")
    print("Please run: pip3 install pypdf")
    exit(1)

import json

pdf_path = "/Users/petruinstagram/Desktop/web-apps/gabi-airbus/A220-300_FCOM1.pdf"

# Simple search for key topics
topics = {
    "FMS": ["flight management system", "fms", "flight management computer"],
    "GNSS": ["gnss", "global navigation satellite", "gps"],
    "IRS": ["inertial reference system", "irs"],
    "VOR": ["vor", "vhf omnidirectional"],
    "ILS": ["ils", "instrument landing system", "localizer"],
    "DME": ["dme", "distance measuring"]
}

print("Searching for Navigation topics in A220 FCOM1...")
print("=" * 60)

try:
    reader = PdfReader(pdf_path)
    total_pages = len(reader.pages)
    print(f"Total pages: {total_pages}\n")

    results = {}

    for page_num in range(total_pages):
        if page_num % 100 == 0 and page_num > 0:
            print(f"Scanned {page_num} pages...")

        page = reader.pages[page_num]
        text = page.extract_text() or ""
        text_lower = text.lower()

        for topic, terms in topics.items():
            if topic not in results:
                for term in terms:
                    if term in text_lower:
                        actual_page = page_num + 1
                        results[topic] = actual_page

                        # Find context
                        idx = text_lower.find(term)
                        context = text[max(0, idx-50):idx+100].replace('\n', ' ')

                        print(f"✓ {topic:10s} found on page {actual_page:4d} (term: '{term}')")
                        print(f"  Context: ...{context[:80]}...")
                        break

    print("\n" + "=" * 60)
    print("RESULTS:")
    print("=" * 60)

    # Map to question IDs (best guess based on content)
    question_map = {
        "FMS": ["16NAV01", "16NAV02", "16NAV03", "16NAV04"],
        "GNSS": ["16NAV05", "16NAV08", "16NAV27"],
        "IRS": ["16NAV06", "16NAV07", "16NAV24"],
        "VOR": ["16NAV23"],
        "ILS": ["16NAV23", "16NAV25"],
        "DME": ["16NAV23"]
    }

    json_output = {}
    for topic, page in results.items():
        print(f"\n{topic}: Page {page}")

        if topic in question_map:
            print(f"  Likely questions: {', '.join(question_map[topic])}")
            for qid in question_map[topic]:
                if qid not in json_output:
                    json_output[qid] = {"pdf": "FCOM1", "page": page}

    print("\n" + "=" * 60)
    print("JSON OUTPUT (suggested page references):")
    print("=" * 60)
    print(json.dumps(json_output, indent=2, sort_keys=True))

    # Save to file
    output_file = "/Users/petruinstagram/Desktop/web-apps/gabi-airbus/quiz-app/src/data/quick_nav_results.json"
    with open(output_file, 'w') as f:
        json.dump({
            "topic_pages": results,
            "suggested_references": json_output
        }, f, indent=2)

    print(f"\nResults saved to: {output_file}")

except FileNotFoundError:
    print(f"\nERROR: PDF file not found at: {pdf_path}")
    print("Please verify the path is correct.")
except Exception as e:
    print(f"\nERROR: {e}")
    import traceback
    traceback.print_exc()
