# Instructions for Finding Navigation Page Numbers

I've created Python scripts to search the A220 FCOM1 PDF for Navigation chapter topics. Since I cannot execute bash commands in this environment, please run one of these scripts manually:

## Option 1: Comprehensive Search (All 28 Navigation Questions)

```bash
cd /Users/petruinstagram/Desktop/web-apps/gabi-airbus/quiz-app/src/data
python3 search_specific_nav.py
```

This will search for all 28 Navigation questions (16NAV01 through 16NAV28) and output:
- Actual PDF page numbers for each question
- JSON formatted output ready to add to page_references.json
- Detailed findings saved to `nav_search_results.json`

## Option 2: Topic-Based Search (FMS, GNSS, IRS, VOR, ILS, DME)

```bash
cd /Users/petruinstagram/Desktop/web-apps/gabi-airbus/quiz-app/src/data
python3 search_nav_pypdf.py
```

This searches for general topic areas and maps them to question IDs.

## Requirements

Make sure you have the required library installed:

```bash
pip3 install pypdf
```

## Expected Output

The script will output something like:

```json
{
  "16NAV01": {"pdf": "FCOM1", "page": 855},
  "16NAV02": {"pdf": "FCOM1", "page": 862},
  ...
}
```

## What to Search For

Based on the quiz questions, here are the main topics:

### Questions Requested:
- **16NAV01**: Standby navigation display / FMS navigation data
- **16NAV02**: Display tuning / TUNE page access
- **16NAV03**: Nav-to-nav preview / localizer
- **16NAV04**: NAV SRC button / navigation sources
- **16NAV05**: GNSS tab information
- **16NAV06**: IRS failure / cross-side IRS
- **16NAV07**: IRS normal mode / FMS POS tile
- **16NAV08**: GNSS computed position display

### General Topics:
- FMS (Flight Management System) - Questions 16NAV01, 16NAV03, 16NAV04
- Navigation displays - Questions 16NAV01, 16NAV02, 16NAV26
- GNSS/GPS - Questions 16NAV05, 16NAV08, 16NAV27
- IRS (Inertial Reference System) - Questions 16NAV06, 16NAV07, 16NAV24
- Radio navigation (VOR, ILS, DME) - Questions 16NAV23, 16NAV25

## After Running

Once you have the results, you can:
1. Check the output on screen for the JSON
2. View detailed findings in `nav_search_results.json`
3. Copy the JSON output to update `page_references.json`

## Troubleshooting

If you get "ModuleNotFoundError: No module named 'pypdf'":
```bash
pip3 install pypdf
```

If the PDF path is incorrect, update the `pdf_path` variable in the script to point to the correct location of the A220-300_FCOM1.pdf file.
