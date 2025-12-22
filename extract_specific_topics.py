#!/usr/bin/env python3
"""
Extract specific performance topics from A220 PDFs - targeted extraction
"""

from pypdf import PdfReader
import json

def extract_page_text(pdf_path, page_num):
    """Extract text from a specific page"""
    try:
        reader = PdfReader(pdf_path)
        if page_num < len(reader.pages):
            return reader.pages[page_num].extract_text()
        return None
    except Exception as e:
        print(f"Error reading page {page_num} from {pdf_path}: {e}")
        return None

def search_term_in_pdf(pdf_path, search_term, max_pages=50):
    """Search for a term and return pages where found (limited search)"""
    try:
        reader = PdfReader(pdf_path)
        total_pages = len(reader.pages)
        print(f"  Total pages in PDF: {total_pages}")

        # Search in chunks to avoid timeout
        found_pages = []
        pages_to_search = min(max_pages, total_pages)

        for page_num in range(pages_to_search):
            if page_num % 10 == 0:
                print(f"    Searching page {page_num}/{pages_to_search}...")

            text = reader.pages[page_num].extract_text()
            if text and search_term.lower() in text.lower():
                found_pages.append({
                    'page': page_num + 1,
                    'snippet': text[:500]  # First 500 chars
                })

        return found_pages
    except Exception as e:
        print(f"Error searching {pdf_path}: {e}")
        return []

def main():
    fcom_path = "/Users/petruinstagram/Desktop/web-apps/gabi-airbus/A220-300_FCOM1.pdf"
    ops_manual_path = "/Users/petruinstagram/Desktop/web-apps/gabi-airbus/Operations_Manual_Part_B_A220_TR027.6.pdf"

    # Key search terms for each topic
    topics = {
        'RCC': 'Runway Condition Code',
        'OLD_factors': 'OLD factor',
        'VREF': 'VREF',
        'Landing_Distance': 'landing distance',
        'Ice_Disposal': 'ice disposal',
    }

    results = {}

    print("Searching FCOM (limited to first 50 pages)...")
    for topic, term in topics.items():
        print(f"\nSearching for: {topic} ({term})")
        results[f"FCOM_{topic}"] = search_term_in_pdf(fcom_path, term, max_pages=50)

    print("\n\nSearching Operations Manual (limited to first 50 pages)...")
    for topic, term in topics.items():
        print(f"\nSearching for: {topic} ({term})")
        results[f"OpsManual_{topic}"] = search_term_in_pdf(ops_manual_path, term, max_pages=50)

    # Save results
    with open('/Users/petruinstagram/Desktop/web-apps/gabi-airbus/quiz-app/pdf_limited_search.json', 'w') as f:
        json.dump(results, f, indent=2)

    print("\n\nSearch complete. Results saved to pdf_limited_search.json")

if __name__ == '__main__':
    main()
