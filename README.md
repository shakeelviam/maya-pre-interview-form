# Maya Tex — Pre-Interview (candidate) form

A minimalist single-screen form walk-in candidates fill at the office. Each submission appends one
row to the **Pre Interview Form** sheet and files the photo + CV to a Drive folder.

**Files:** `index.html` (hosted on GitHub Pages) · `Code.gs` (pasted into the sheet's Apps Script).

## Setup

1. **Drive folder** for candidate uploads → copy its ID from the URL. Paste into `Code.gs`
   `DRIVE_FOLDER_ID`. (The `SHEET_ID` and `SHARED_SECRET` are already filled.)
2. Open the **Pre Interview Form** sheet → Extensions ▸ Apps Script → paste `Code.gs` → save.
3. Deploy ▸ New deployment ▸ **Web app** · Execute as **Me** · Access **Anyone** ▸ Deploy ▸ approve
   permissions ▸ copy the **/exec** URL.
4. In `index.html`, set `API` to that `/exec` URL (the `TOKEN` is already set) ▸ push to GitHub ▸
   enable Pages.

Fields captured: name, mobile/WhatsApp, nationality, position, visa status, years of experience,
currently employed, availability, expected salary, languages, photo, CV. Sheet columns are created
automatically on the first submission.
