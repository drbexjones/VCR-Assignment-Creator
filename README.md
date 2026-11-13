# VCR Clinical Reasoning Assignment Creator ; Revised

A self-contained static GitHub Pages application for instructors to create sequential Visible Clinical Reasoning (VCR) assignments, share a student-ready link, and allow students to download their completed responses.

## Publish

Replace the repository's `index.html`, `styles.css`, and prior `instructor.js` with this package's `index.html`, `styles.css`, `exports.js`, and `app.js`. In GitHub repository **Settings → Pages**, publish from the main branch root. No backend, accounts, build tools, or external libraries required. Both document formats are generated locally in the browser.

## Instructor workflow

1. Enter assignment title, learning objective, initial clinical case, and **separate** complicating information.
2. Customize Commit, Complicate, and Calibrate prompts; specify resources/AI policy and submission instructions.
3. Optionally enter instructor-only rubric criteria.
4. Generate and copy the student link. Preview it in a separate tab.
5. Download an instructor rubric as a text file.

## Student workflow

- Commit: initial case + prompt. Submit response to unlock next stage.
- Complicate: original case + locked Commit response + new information + prompt. Submit to continue.
- Calibrate: original case + locked Commit and Complicate responses + new information + prompt. Submit to finish.
- Enter a student name, then download completed assignment as a formatted `.pdf` or `.docx` file (including the name), or use the print/save-as-PDF alternative.

## Important technical and pedagogical limitations

- Assignment data is encoded in the URL fragment. This **controls the display sequence but does not securely conceal the complication** from a student who inspects or decodes the link. Secure withholding requires server-side storage and access control.
- Long cases create long links. Test links in your LMS; some systems truncate them. No central storage or link shortening is included.
- Responses and drafts are stored in the student's **current browser's localStorage**, not on a server. They are not synced across devices, and can be lost when browser data is cleared or private browsing ends. Students should download immediately after completing.
- Submitted responses are read-only in the normal interface; browser storage is under the student's control and **not tamper-proof**.
- No submission is automatically sent to the instructor. Students must download and submit the file.
- No student or patient-identifying information should be placed in case descriptions or responses; URLs may be saved in browser history, shared, or logged by LMS systems.
- VCR offers structured opportunities for reasoning and formative feedback. Artifacts do not verify independent reasoning, AI nonuse, or clinical competence. Efficacy of the framework has not been established.

## Credits

Visible Clinical Reasoning framework developed by Rebecca L. Jones, EdD, CCC-SLP. © 2026.

## Attribution and revised prompts

The top section credits Rebecca L. Jones, EdD, CCC-SLP. The default Commit prompt no longer asks for uncertainty; Complicate asks about an alternative diagnosis or recommendation and whether to change the initial decision; Calibrate focuses on remaining clinical information needs and additional tests or assessments. Instructors can still edit all prompts.

## Export notes

The PDF and Word downloads are generated locally in the browser. PDF uses standard built-in fonts; unusual characters outside the PDF font encoding may be simplified. The Word document preserves Unicode text. The Print / Save as PDF option remains available as an alternative.

The default Commit prompt has been corrected to end with a complete sentence: “Identify the relevant case evidence and explain how it supports your decision.”
