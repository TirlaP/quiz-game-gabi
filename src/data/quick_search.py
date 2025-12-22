import pdfplumber
import json

pdf_path = "/Users/petruinstagram/Desktop/web-apps/gabi-airbus/A220-300_FCOM1.pdf"

# Search terms for each question group
searches = {
    "02AIR21-30": ["emergency depressurization", "EMER DEPRESS", "cabin altitude", "MAN RATE", "manual mode"],
    "02AIR31-45": ["pack operation", "PACK", "temperature control", "TEMP CTRL"]
}

results = {}

with pdfplumber.open(pdf_path) as pdf:
    print(f"Searching {len(pdf.pages)} pages...")

    for page_num, page in enumerate(pdf.pages, 1):
        text = page.extract_text()
        if not text:
            continue

        text_upper = text.upper()

        for question_range, terms in searches.items():
            if question_range not in results:
                results[question_range] = []

            for term in terms:
                if term.upper() in text_upper:
                    if page_num not in results[question_range]:
                        results[question_range].append(page_num)
                        print(f"Page {page_num}: Found '{term}' for {question_range}")
                    break

# Output results
print("\n" + "="*60)
print("RESULTS:")
for qrange, pages in results.items():
    if pages:
        pages.sort()
        print(f"{qrange}: Pages {pages}")
        print(f"  Primary page: {pages[0]}")

# Generate JSON for questions 21-30 and 31-45
output = {}
if results.get("02AIR21-30"):
    page = results["02AIR21-30"][0]
    for i in range(21, 31):
        output[f"02AIR{i}"] = {"pdf": "FCOM1", "page": page}

if results.get("02AIR31-45"):
    page = results["02AIR31-45"][0]
    for i in range(31, 46):
        output[f"02AIR{i}"] = {"pdf": "FCOM1", "page": page}

print("\nJSON Output:")
print(json.dumps(output, indent=2))
