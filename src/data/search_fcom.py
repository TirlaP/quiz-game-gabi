#!/usr/bin/env python3
"""
Search A220 FCOM1 PDF for Air Conditioning question topics and find actual page numbers.
"""

import pdfplumber
import json
import sys

def search_pdf(pdf_path):
    """Search PDF for Air Conditioning related terms."""

    # Define search terms for each question range
    search_queries = {
        "02AIR21-30": {
            "terms": [
                "emergency depressurization",
                "EMER DEPRESS",
                "cabin altitude",
                "CAB ALT",
                "MAN RATE",
                "manual mode",
                "manual rate"
            ],
            "description": "Emergency depressurization, cabin altitude, manual mode"
        },
        "02AIR31-45": {
            "terms": [
                "pack operation",
                "PACK",
                "temperature control",
                "TEMP CTRL",
                "temp control",
                "zone temperature"
            ],
            "description": "Pack operation, temperature control"
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

            # Search each page
            for page_num in range(total_pages):
                if page_num % 100 == 0:
                    print(f"Searching page {page_num + 1}/{total_pages}...")

                page = pdf.pages[page_num]
                text = page.extract_text()

                if not text:
                    continue

                text_upper = text.upper()

                # Check each question range
                for question_range, query_info in search_queries.items():
                    for term in query_info["terms"]:
                        if term.upper() in text_upper:
                            actual_page = page_num + 1  # PDF page numbers are 1-indexed

                            if question_range not in page_matches:
                                page_matches[question_range] = set()

                            page_matches[question_range].add(actual_page)

                            # Store details
                            if question_range not in results:
                                results[question_range] = {
                                    "pages": [],
                                    "terms_found": [],
                                    "description": query_info["description"]
                                }

                            if term not in results[question_range]["terms_found"]:
                                results[question_range]["terms_found"].append(term)

                            # Get context
                            lines = text.split('\n')
                            context = []
                            for line in lines:
                                if term.upper() in line.upper():
                                    context.append(line.strip()[:120])
                                    if len(context) >= 2:
                                        break

                            print(f"\n  Found '{term}' on page {actual_page}")
                            if context:
                                print(f"    Context: {context[0][:100]}")

                            break  # Move to next question range

    except Exception as e:
        print(f"Error: {e}")
        return None

    # Compile final results
    print("\n" + "=" * 80)
    print("SUMMARY OF FINDINGS:")
    print("=" * 80)

    final_results = {}

    for question_range, pages in page_matches.items():
        sorted_pages = sorted(list(pages))

        print(f"\n{question_range}: {results[question_range]['description']}")
        print(f"  Pages found: {sorted_pages}")
        print(f"  Terms matched: {', '.join(results[question_range]['terms_found'])}")

        # Use the first page found as the primary reference
        if sorted_pages:
            final_results[question_range] = {
                "pdf": "FCOM1",
                "page": sorted_pages[0],
                "all_pages": sorted_pages,
                "terms_found": results[question_range]["terms_found"]
            }

    # Output JSON
    print("\n" + "=" * 80)
    print("JSON OUTPUT:")
    print("=" * 80)

    json_output = {}
    for question_range, data in final_results.items():
        # Extract question numbers from range (e.g., "02AIR21-30" -> 21-30)
        range_part = question_range.split("-")
        if len(range_part) == 2:
            start_q = range_part[0]
            end_q = int(range_part[1])

            # Create entries for each question in the range
            base = start_q[:-2]  # e.g., "02AIR"
            start_num = int(start_q[-2:])  # e.g., 21

            for q_num in range(start_num, end_q + 1):
                q_id = f"{base}{q_num}"
                json_output[q_id] = {
                    "pdf": data["pdf"],
                    "page": data["page"]
                }

    print(json.dumps(json_output, indent=2))

    return final_results

if __name__ == "__main__":
    pdf_path = "/Users/petruinstagram/Desktop/web-apps/gabi-airbus/A220-300_FCOM1.pdf"
    search_pdf(pdf_path)
