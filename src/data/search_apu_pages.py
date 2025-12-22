#!/usr/bin/env python3
"""
Search A220 FCOM1 PDF for APU question topics and find actual page numbers.
"""

import pdfplumber
import json
import sys

def search_pdf(pdf_path):
    """Search PDF for APU related terms."""

    # Define search terms for APU topics
    search_queries = {
        "APU_start": {
            "terms": [
                "APU start",
                "APU starting",
                "start sequence",
                "starting sequence",
                "APU START",
                "START SEQUENCE"
            ],
            "description": "APU start sequence"
        },
        "APU_bleed": {
            "terms": [
                "APU bleed",
                "bleed air",
                "APU BLEED",
                "BLEED AIR",
                "pneumatic"
            ],
            "description": "APU bleed air"
        },
        "APU_generator": {
            "terms": [
                "APU generator",
                "APU GEN",
                "APU electrical",
                "APU GENERATOR"
            ],
            "description": "APU generator"
        },
        "APU_fuel": {
            "terms": [
                "APU fuel consumption",
                "APU fuel flow",
                "fuel consumption",
                "APU FUEL"
            ],
            "description": "APU fuel consumption"
        },
        "APU_limitations": {
            "terms": [
                "APU limitation",
                "APU limits",
                "altitude limit",
                "temperature limit",
                "operating limits",
                "LIMITATIONS"
            ],
            "description": "APU limitations (altitude, temperature)"
        },
        "APU_fire": {
            "terms": [
                "APU fire",
                "fire protection",
                "fire detection",
                "APU FIRE",
                "FIRE PROTECTION"
            ],
            "description": "APU fire protection"
        },
        "APU_shutdown": {
            "terms": [
                "APU shutdown",
                "APU stop",
                "shutdown procedure",
                "APU SHUTDOWN"
            ],
            "description": "APU shutdown"
        }
    }

    results = {}
    page_matches = {}

    print("Opening PDF...")
    print(f"File: {pdf_path}")
    print("=" * 80)

    try:
        with pdfplumber.open(pdf_path) as pdf:
            total_pages = len(pdf.pages)
            print(f"Total pages: {total_pages}\n")

            # First find APU chapter (04APU)
            apu_chapter_start = None
            apu_chapter_end = None

            for page_num in range(total_pages):
                if page_num % 100 == 0:
                    print(f"Searching page {page_num + 1}/{total_pages}...")

                page = pdf.pages[page_num]
                text = page.extract_text()

                if not text:
                    continue

                text_upper = text.upper()
                actual_page = page_num + 1

                # Look for APU chapter marker
                if apu_chapter_start is None:
                    if "04APU" in text_upper or ("AUXILIARY POWER UNIT" in text_upper and "04" in text):
                        apu_chapter_start = actual_page
                        print(f"\nFound APU chapter starting at page {actual_page}")
                        print(f"  Context: {text[:150]}")

                # If we found the chapter, search within reasonable range
                if apu_chapter_start and actual_page >= apu_chapter_start:
                    # Stop if we've gone too far (next chapter)
                    if actual_page > apu_chapter_start + 150:
                        break

                    # Check each APU topic
                    for topic, query_info in search_queries.items():
                        for term in query_info["terms"]:
                            if term.upper() in text_upper:
                                if topic not in page_matches:
                                    page_matches[topic] = set()

                                page_matches[topic].add(actual_page)

                                # Store details
                                if topic not in results:
                                    results[topic] = {
                                        "pages": [],
                                        "terms_found": [],
                                        "description": query_info["description"]
                                    }

                                if term not in results[topic]["terms_found"]:
                                    results[topic]["terms_found"].append(term)

                                # Get context
                                lines = text.split('\n')
                                context = []
                                for line in lines:
                                    if term.upper() in line.upper():
                                        context.append(line.strip()[:120])
                                        if len(context) >= 1:
                                            break

                                print(f"\n  Found '{term}' on page {actual_page}")
                                if context:
                                    print(f"    Context: {context[0][:100]}")

                                break  # Move to next topic

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return None

    # Compile final results
    print("\n" + "=" * 80)
    print("SUMMARY OF FINDINGS:")
    print("=" * 80)

    final_results = {}

    for topic, pages in page_matches.items():
        sorted_pages = sorted(list(pages))

        print(f"\n{topic}: {results[topic]['description']}")
        print(f"  Pages found: {sorted_pages}")
        print(f"  Terms matched: {', '.join(results[topic]['terms_found'])}")

        # Use the first page found as the primary reference
        if sorted_pages:
            final_results[topic] = {
                "pdf": "FCOM1",
                "page": sorted_pages[0],
                "all_pages": sorted_pages,
                "terms_found": results[topic]["terms_found"]
            }

    # Output JSON
    print("\n" + "=" * 80)
    print("JSON OUTPUT:")
    print("=" * 80)

    json_output = {}

    # Map topics to question IDs
    topic_to_questions = {
        "APU_start": ["04APU01", "04APU02"],
        "APU_bleed": ["04APU03", "04APU04"],
        "APU_generator": ["04APU05", "04APU06"],
        "APU_fuel": ["04APU07"],
        "APU_limitations": ["04APU08", "04APU09"],
        "APU_fire": ["04APU10", "04APU11"],
        "APU_shutdown": ["04APU12", "04APU13"]
    }

    for topic, data in final_results.items():
        if topic in topic_to_questions:
            for q_id in topic_to_questions[topic]:
                json_output[q_id] = {
                    "pdf": data["pdf"],
                    "page": data["page"]
                }

    print(json.dumps(json_output, indent=2))

    return final_results

if __name__ == "__main__":
    pdf_path = "/Users/petruinstagram/Desktop/web-apps/gabi-airbus/A220-300_FCOM1.pdf"
    search_pdf(pdf_path)
