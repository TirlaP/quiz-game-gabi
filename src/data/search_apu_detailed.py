#!/usr/bin/env python3
"""
Search APU chapter (starting around page 455) for specific topics.
"""

from pypdf import PdfReader
import json

pdf_path = "/Users/petruinstagram/Desktop/web-apps/gabi-airbus/A220-300_FCOM1.pdf"

# Search terms for APU topics
search_queries = {
    "APU_overview": {
        "terms": ["APU – OVERVIEW", "APU OVERVIEW", "AUXILIARY POWER UNIT"],
        "description": "APU overview and general description"
    },
    "APU_start": {
        "terms": ["APU STARTING", "APU START", "STARTING SEQUENCE"],
        "description": "APU start sequence"
    },
    "APU_operation": {
        "terms": ["APU OPERATION", "APU – OPERATION"],
        "description": "APU operation"
    },
    "APU_bleed": {
        "terms": ["APU BLEED", "APU pneumatic", "APU air"],
        "description": "APU bleed air"
    },
    "APU_generator": {
        "terms": ["APU GENERATOR", "APU GEN", "APU electrical"],
        "description": "APU generator"
    },
    "APU_fuel": {
        "terms": ["APU FUEL", "APU fuel system", "fuel consumption"],
        "description": "APU fuel system"
    },
    "APU_limitations": {
        "terms": ["APU limitation", "APU limit", "altitude limit", "operating envelope"],
        "description": "APU limitations"
    },
    "APU_fire": {
        "terms": ["APU FIRE", "fire protection", "fire detection", "APU fire panel"],
        "description": "APU fire protection"
    },
    "APU_shutdown": {
        "terms": ["APU shutdown", "APU stop", "shutdown sequence"],
        "description": "APU shutdown"
    },
    "APU_controls": {
        "terms": ["APU controls", "APU panel", "APU MASTER"],
        "description": "APU controls and indications"
    }
}

reader = PdfReader(pdf_path)
total_pages = len(reader.pages)

print(f"Total pages: {total_pages}")
print("Searching APU chapter (pages 450-550)...\n")

results = {}
page_matches = {}

# Search pages 450-550 (APU chapter range)
for page_num in range(449, 550):  # 0-indexed, so 449 = page 450
    if page_num >= total_pages:
        break

    page = reader.pages[page_num]
    text = page.extract_text()

    if not text:
        continue

    text_upper = text.upper()
    actual_page = page_num + 1

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
                        context.append(line.strip())
                        if len(context) >= 1:
                            break

                if actual_page not in results[topic]["pages"]:
                    results[topic]["pages"].append(actual_page)
                    print(f"Page {actual_page}: Found '{term}' for {topic}")
                    if context:
                        print(f"  Context: {context[0][:100]}")

                break  # Move to next topic

# Compile final results
print("\n" + "=" * 80)
print("SUMMARY OF FINDINGS:")
print("=" * 80)

final_results = {}

for topic, pages in page_matches.items():
    sorted_pages = sorted(list(pages))

    print(f"\n{topic}: {results[topic]['description']}")
    print(f"  Pages found: {sorted_pages[:10]}")  # Show first 10
    if len(sorted_pages) > 10:
        print(f"  ... and {len(sorted_pages) - 10} more")
    print(f"  Primary page: {sorted_pages[0]}")

    # Use the first page found as the primary reference
    if sorted_pages:
        final_results[topic] = {
            "pdf": "FCOM1",
            "page": sorted_pages[0],
            "all_pages": sorted_pages
        }

# Output JSON
print("\n" + "=" * 80)
print("JSON OUTPUT FOR QUESTIONS:")
print("=" * 80)

json_output = {}

# Map topics to question IDs based on typical distribution
topic_to_questions = {
    "APU_overview": ["04APU01"],
    "APU_start": ["04APU02", "04APU03"],
    "APU_operation": ["04APU04"],
    "APU_bleed": ["04APU05", "04APU06"],
    "APU_generator": ["04APU07", "04APU08"],
    "APU_fuel": ["04APU09"],
    "APU_limitations": ["04APU10", "04APU11"],
    "APU_fire": ["04APU12", "04APU13"],
    "APU_shutdown": ["04APU14"],
    "APU_controls": ["04APU15"]
}

for topic, data in final_results.items():
    if topic in topic_to_questions:
        for q_id in topic_to_questions[topic]:
            json_output[q_id] = {
                "pdf": "FCOM1",
                "page": data["page"]
            }

print(json.dumps(json_output, indent=2, sort_keys=True))
