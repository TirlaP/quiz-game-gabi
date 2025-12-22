#!/usr/bin/env python3
"""
Search A220 FCOM1 PDF for APU question topics and find actual page numbers using pypdf.
"""

from pypdf import PdfReader
import json
import sys

def search_pdf(pdf_path):
    """Search PDF for APU related terms."""

    # Define search terms for APU topics (order matters - more specific first)
    search_queries = {
        "APU_start": {
            "terms": [
                "APU STARTING SEQUENCE",
                "APU START SEQUENCE",
                "APU START PROCEDURE",
                "STARTING THE APU",
                "APU STARTING"
            ],
            "description": "APU start sequence"
        },
        "APU_shutdown": {
            "terms": [
                "APU SHUTDOWN SEQUENCE",
                "APU SHUTDOWN PROCEDURE",
                "STOPPING THE APU",
                "APU SHUTDOWN",
                "APU STOP"
            ],
            "description": "APU shutdown"
        },
        "APU_bleed": {
            "terms": [
                "APU BLEED AIR SYSTEM",
                "APU BLEED SYSTEM",
                "APU PNEUMATIC",
                "APU BLEED"
            ],
            "description": "APU bleed air"
        },
        "APU_generator": {
            "terms": [
                "APU GENERATOR SYSTEM",
                "APU ELECTRICAL SYSTEM",
                "APU GEN",
                "APU GENERATOR"
            ],
            "description": "APU generator"
        },
        "APU_fuel": {
            "terms": [
                "APU FUEL SYSTEM",
                "APU FUEL CONSUMPTION",
                "APU FUEL SUPPLY",
                "APU FUEL FLOW"
            ],
            "description": "APU fuel consumption"
        },
        "APU_limitations": {
            "terms": [
                "APU OPERATING LIMITATIONS",
                "APU ALTITUDE LIMITATION",
                "APU TEMPERATURE LIMITATION",
                "APU LIMITS"
            ],
            "description": "APU limitations (altitude, temperature)"
        },
        "APU_fire": {
            "terms": [
                "APU FIRE PROTECTION SYSTEM",
                "APU FIRE DETECTION",
                "APU FIRE EXTINGUISHING",
                "APU FIRE PROTECTION"
            ],
            "description": "APU fire protection"
        }
    }

    results = {}
    page_matches = {}

    print("Opening PDF...")
    print(f"File: {pdf_path}")
    print("=" * 80)

    try:
        reader = PdfReader(pdf_path)
        total_pages = len(reader.pages)
        print(f"Total pages: {total_pages}\n")

        # First find APU chapter (04APU)
        apu_chapter_start = None
        apu_chapter_end = None

        for page_num in range(total_pages):
            if page_num % 100 == 0:
                print(f"Searching page {page_num + 1}/{total_pages}...")

            page = reader.pages[page_num]
            text = page.extract_text()

            if not text:
                continue

            text_upper = text.upper()
            actual_page = page_num + 1

            # Look for APU chapter marker - look for actual chapter content, not TOC
            if apu_chapter_start is None:
                # Look for the actual APU chapter (04APU) with more specific patterns
                if ("04APU" in text_upper and "AUXILIARY POWER UNIT" in text_upper) or \
                   ("CHAPTER 04" in text_upper and "APU" in text_upper):
                    # Make sure it's not just a TOC entry
                    if "TABLE OF CONTENTS" not in text_upper and "EFFECTIVITY" not in text_upper:
                        apu_chapter_start = actual_page
                        print(f"\nFound APU chapter starting at page {actual_page}")
                        print(f"  Context: {text[:200].replace(chr(10), ' ')}")

            # If we found the chapter, search within reasonable range
            if apu_chapter_start and actual_page >= apu_chapter_start:
                # Stop if we've definitely moved to next chapter (look for chapter 05 or 06)
                if actual_page > apu_chapter_start + 100:
                    # Check if we've moved to a new chapter
                    if ("CHAPTER 05" in text_upper or "CHAPTER 06" in text_upper or
                        "05−01" in text or "06−01" in text):
                        print(f"\nReached next chapter at page {actual_page}, stopping search.")
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
