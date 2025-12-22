#!/usr/bin/env python3
"""
Search A220 FCOM1 PDF for specific Navigation questions based on their actual content.
This script searches for the most relevant terms from each question.
"""

from pypdf import PdfReader
import json

pdf_path = "/Users/petruinstagram/Desktop/web-apps/gabi-airbus/A220-300_FCOM1.pdf"

# Question-specific search terms based on actual question content
question_searches = {
    "16NAV01": {
        "topic": "Standby navigation display / FMS navigation data",
        "terms": ["standby navigation display", "standby nav display", "fms navigation data"]
    },
    "16NAV02": {
        "topic": "Display tuning / TUNE page / CNS",
        "terms": ["tune page", "display tuning", "cns qak", "mkps"]
    },
    "16NAV03": {
        "topic": "Nav-to-nav preview / localizer / HSI",
        "terms": ["nav-to-nav preview", "nav to nav preview", "localizer preview"]
    },
    "16NAV04": {
        "topic": "NAV SRC button / navigation sources",
        "terms": ["nav src button", "nav src", "control tuning panel", "navigation source"]
    },
    "16NAV05": {
        "topic": "GNSS tab information",
        "terms": ["gnss tab", "gnss position", "fms position"]
    },
    "16NAV06": {
        "topic": "IRS failure / cross-side IRS",
        "terms": ["irs failed", "cross-side irs", "irs 3"]
    },
    "16NAV07": {
        "topic": "IRS normal mode / FMS POS tile",
        "terms": ["irs tab", "fms pos tile", "irs normal operating mode"]
    },
    "16NAV08": {
        "topic": "GNSS computed position display",
        "terms": ["gnss computed position", "gnss position displayed"]
    },
    "16NAV09": {
        "topic": "IDENT pushbutton / CTP",
        "terms": ["ident pushbutton", "ident button", "control tuning panel"]
    },
    "16NAV10": {
        "topic": "Transponder control page",
        "terms": ["transponder control page", "xpdr control", "transponder code"]
    },
    "16NAV11": {
        "topic": "TCAS system test",
        "terms": ["tcas system test", "tcas test", "xpdr/tcas control"]
    },
    "16NAV12": {
        "topic": "TCAS collision threat advisory",
        "terms": ["tcas", "collision threat", "traffic advisory", "resolution advisory"]
    },
    "16NAV13": {
        "topic": "TAWS terrain display / MAP PLAN pages",
        "terms": ["taws", "terrain display", "map page", "plan page", "terrain ovly"]
    },
    "16NAV14": {
        "topic": "SINK RATE aural alert",
        "terms": ["sink rate", "aural alert", "rate of descent"]
    },
    "16NAV15": {
        "topic": "Terrain clearance floor function",
        "terms": ["terrain clearance floor", "tcf function"]
    },
    "16NAV16": {
        "topic": "TAWS test initiation",
        "terms": ["taws test", "taws soft key"]
    },
    "16NAV17": {
        "topic": "WXR automatic mode",
        "terms": ["wxr", "weather radar", "automatic mode", "gain tilt"]
    },
    "16NAV18": {
        "topic": "Weather radar image / MFW display",
        "terms": ["weather radar", "wxr image", "multifunction window", "mfw"]
    },
    "16NAV19": {
        "topic": "Path attenuation compensation (PAC)",
        "terms": ["path attenuation compensation", "pac function"]
    },
    "16NAV20": {
        "topic": "WXR gain settings / automatic mode compensation",
        "terms": ["wxr system", "gain settings", "weather returns", "automatic operating"]
    },
    "16NAV21": {
        "topic": "WXR image during TAWS alert",
        "terms": ["wxr image", "taws alert", "weather radar display"]
    },
    "16NAV22": {
        "topic": "WX radar turbulence detection range",
        "terms": ["wx radar", "turbulence", "detect turbulence"]
    },
    "16NAV23": {
        "topic": "LOC VOR GS failure indication on PFD",
        "terms": ["loc failure", "vor failure", "gs failure", "glideslope", "course pointer"]
    },
    "16NAV24": {
        "topic": "IRS alignment in motion",
        "terms": ["irs alignment in motion", "irs align", "in flight power interruption"]
    },
    "16NAV25": {
        "topic": "Tuned localizer frequency",
        "terms": ["localizer frequency", "tuned localizer", "loc frequency"]
    },
    "16NAV26": {
        "topic": "Navigation source for standby navigation display",
        "terms": ["standby navigation display", "navigation source", "ctp"]
    },
    "16NAV27": {
        "topic": "GNSS checkboxes / GNSS tab",
        "terms": ["gnss checkbox", "gnss available", "gnss tab"]
    },
    "16NAV28": {
        "topic": "TCAS system test IN PROG message",
        "terms": ["tcas system test", "in prog message", "cyan in prog"]
    }
}

print("="*80)
print("SEARCHING A220 FCOM1 FOR NAVIGATION QUESTIONS")
print("="*80)
print(f"PDF: {pdf_path}\n")

try:
    reader = PdfReader(pdf_path)
    total_pages = len(reader.pages)
    print(f"Total pages in PDF: {total_pages}\n")

    results = {}
    detailed_findings = {}

    # For each question, search through the PDF
    for question_id, search_info in question_searches.items():
        print(f"\nSearching for {question_id}: {search_info['topic']}")
        print(f"  Terms: {', '.join(search_info['terms'][:3])}")

        found_pages = []

        for page_num in range(total_pages):
            page = reader.pages[page_num]
            text = page.extract_text()

            if text:
                text_lower = text.lower()

                # Check if any search term is found
                for term in search_info['terms']:
                    if term.lower() in text_lower:
                        actual_page = page_num + 1

                        # Extract context
                        term_pos = text_lower.find(term.lower())
                        context_start = max(0, term_pos - 150)
                        context_end = min(len(text), term_pos + 150)
                        context = text[context_start:context_end].replace('\n', ' ').strip()

                        found_pages.append({
                            "page": actual_page,
                            "term": term,
                            "context": context[:200]
                        })

                        # Use the first occurrence
                        if question_id not in results:
                            results[question_id] = actual_page
                            detailed_findings[question_id] = {
                                "topic": search_info['topic'],
                                "page": actual_page,
                                "term_found": term,
                                "context": context[:200],
                                "all_occurrences": []
                            }

                        # Add to all occurrences
                        if question_id in detailed_findings:
                            detailed_findings[question_id]["all_occurrences"].append({
                                "page": actual_page,
                                "term": term
                            })

                        break  # Found this term, move to next page

        if question_id in results:
            print(f"  ✓ Found on page {results[question_id]}")
        else:
            print(f"  ✗ Not found")

    print("\n" + "="*80)
    print("SUMMARY OF FINDINGS")
    print("="*80)

    # Create JSON output
    json_output = {}
    for question_id in sorted(results.keys(), key=lambda x: int(x.replace("16NAV", ""))):
        json_output[question_id] = {
            "pdf": "FCOM1",
            "page": results[question_id]
        }
        print(f"{question_id}: Page {results[question_id]} - {detailed_findings[question_id]['topic']}")

    print("\n" + "="*80)
    print("JSON OUTPUT FOR page_references.json")
    print("="*80)
    print(json.dumps(json_output, indent=2))

    # Save results
    output_file = "/Users/petruinstagram/Desktop/web-apps/gabi-airbus/quiz-app/src/data/nav_search_results.json"
    with open(output_file, 'w') as f:
        json.dump({
            "summary": json_output,
            "detailed_findings": detailed_findings,
            "not_found": [qid for qid in question_searches.keys() if qid not in results]
        }, f, indent=2)

    print(f"\n\nDetailed results saved to: {output_file}")

    # Show what wasn't found
    not_found = [qid for qid in question_searches.keys() if qid not in results]
    if not_found:
        print(f"\n⚠ Questions not found ({len(not_found)}):")
        for qid in not_found:
            print(f"  - {qid}: {question_searches[qid]['topic']}")

    print(f"\n✓ Found {len(results)} out of {len(question_searches)} questions")

except Exception as e:
    print(f"\nError: {e}")
    import traceback
    traceback.print_exc()
