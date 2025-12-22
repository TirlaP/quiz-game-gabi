#!/usr/bin/env python3
"""
Extract relevant information from A220 PDFs for Performance questions
"""

from pypdf import PdfReader
import json
import re

def search_pdf_for_keywords(pdf_path, keywords, context_lines=3):
    """Search PDF for keywords and return matches with context"""
    try:
        reader = PdfReader(pdf_path)
        results = []

        for page_num, page in enumerate(reader.pages, 1):
            text = page.extract_text()
            if not text:
                continue

            lines = text.split('\n')
            for keyword in keywords:
                for i, line in enumerate(lines):
                    if keyword.lower() in line.lower():
                        # Get context around the match
                        start = max(0, i - context_lines)
                        end = min(len(lines), i + context_lines + 1)
                        context = '\n'.join(lines[start:end])

                        results.append({
                            'page': page_num,
                            'keyword': keyword,
                            'context': context
                        })

        return results
    except Exception as e:
        print(f"Error reading {pdf_path}: {e}")
        return []

def main():
    fcom_path = "/Users/petruinstagram/Desktop/web-apps/gabi-airbus/A220-300_FCOM1.pdf"
    ops_manual_path = "/Users/petruinstagram/Desktop/web-apps/gabi-airbus/Operations_Manual_Part_B_A220_TR027.6.pdf"

    # Define search keywords for each topic
    search_topics = {
        'PTOW': ['PTOW', 'planned takeoff weight', 'maximum takeoff weight', 'takeoff weight limit'],
        'Flap_Setting': ['flap setting', 'takeoff flap', 'flap 5', 'flap 10', 'flap 15', 'optimum flap'],
        'Runway_Conditions': ['damp', 'wet runway', 'standing water', 'contaminated runway', 'runway condition'],
        'Engine_Failure': ['engine fail', 'L ENG FAIL', 'R ENG FAIL', 'single engine', 'OEI'],
        'Landing_Performance': ['landing performance', 'actual landing distance', 'required landing distance', 'LDA'],
        'Ice_Disposal': ['ice disposal', 'de-icing', 'anti-icing', 'ice contamination'],
        'Autopilot': ['autopilot', 'AP', 'autopilot limitation', 'autopilot disconnect', 'minimum altitude']
    }

    print("Searching FCOM...")
    fcom_results = {}
    for topic, keywords in search_topics.items():
        print(f"  Searching for {topic}...")
        fcom_results[topic] = search_pdf_for_keywords(fcom_path, keywords, context_lines=5)

    print("\nSearching Operations Manual...")
    ops_results = {}
    for topic, keywords in search_topics.items():
        print(f"  Searching for {topic}...")
        ops_results[topic] = search_pdf_for_keywords(ops_manual_path, keywords, context_lines=5)

    # Save results
    output = {
        'FCOM': fcom_results,
        'Operations_Manual': ops_results
    }

    with open('/Users/petruinstagram/Desktop/web-apps/gabi-airbus/quiz-app/pdf_search_results.json', 'w') as f:
        json.dump(output, f, indent=2)

    print("\nSearch complete. Results saved to pdf_search_results.json")

    # Print summary
    print("\n=== SUMMARY ===")
    for topic in search_topics.keys():
        fcom_count = len(fcom_results[topic])
        ops_count = len(ops_results[topic])
        print(f"{topic}: {fcom_count} matches in FCOM, {ops_count} matches in Ops Manual")

if __name__ == '__main__':
    main()
