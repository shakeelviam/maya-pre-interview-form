/**
 * Maya Tex — Pre-Interview (walk-in candidate) form backend.
 * Append-only: every submission adds one row to the sheet. No master, no sync.
 *
 * SETUP: fill CONFIG, then Deploy > New deployment > Web app
 *        (Execute as: Me · Who has access: Anyone). See README.md.
 */

const CONFIG = {
  SHEET_ID: '15hadCpLBIXLYNJCqnZcq9uETUlFFFelCk27E77d83Es',   // the Pre Interview Form sheet
  TAB: 'Sheet1',                                              // tab that receives rows (created if missing)
  SHARED_SECRET: 'odma9WGOAjs5U4pzSVyzJm0KvPw0Uf7D6CTTKLgm',
  DRIVE_FOLDER_ID: '1gyDepEIJSFjmSP9HX6FDXD6CNuYgz2nY'        // "Maya Pre Interview CV" folder
};

const HEADERS = ['Timestamp', 'Full name', 'Mobile / WhatsApp', 'Nationality', 'Position applied for',
                 'Visa status', 'Years of experience', 'Currently employed', 'Availability',
                 'Expected salary (KD)', 'Languages', 'Photo', 'CV'];

function doGet(e) {
  return json_({ ok: true, message: 'Maya Tex pre-interview endpoint is live.' });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    const b = JSON.parse(e.postData.contents);
    requireToken_(b.token);
    if (b.website) throw new Error('Rejected.');                 // honeypot
    if (!String(b.name || '').trim()) throw new Error('Name is required.');

    const who = String(b.name).trim();
    let photoUrl = '', cvUrl = '';
    if (b.photo && b.photo.data) photoUrl = saveFile_(b.photo, who, 'Photo');
    if (b.cv && b.cv.data)       cvUrl   = saveFile_(b.cv,    who, 'CV');

    const sheet = getSheet_();
    sheet.appendRow([
      new Date(), who, txt_(b.mobile), txt_(b.nationality), txt_(b.position),
      txt_(b.visa), txt_(b.experience), txt_(b.employed), txt_(b.availability),
      txt_(b.salary), (Array.isArray(b.languages) ? b.languages.join(', ') : txt_(b.languages)),
      photoUrl, cvUrl
    ]);
    const row = sheet.getLastRow();
    sheet.getRange(row, 1).setNumberFormat('dd-mm-yyyy hh:mm');   // timestamp
    sheet.getRange(row, 3).setNumberFormat('@');                  // mobile as text

    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message || err) });
  } finally {
    try { lock.releaseLock(); } catch (ignore) {}
  }
}

function getSheet_() {
  const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  let sh = ss.getSheetByName(CONFIG.TAB) || ss.getSheets()[0];
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
  return sh;
}

function saveFile_(file, personName, label) {
  const folder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
  const blob = Utilities.newBlob(Utilities.base64Decode(file.data), file.mimeType || 'application/octet-stream');
  const stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss');
  const safe = String(personName || 'candidate').replace(/[^\w -]/g, '').trim() || 'candidate';
  blob.setName(label + ' - ' + safe + ' - ' + stamp + extFromMime_(file.mimeType));
  return folder.createFile(blob).getUrl();
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
function requireToken_(t) { if (String(t || '') !== CONFIG.SHARED_SECRET) throw new Error('Not authorised.'); }
function txt_(v) { return v == null ? '' : String(v).trim(); }
function extFromMime_(mt) {
  mt = String(mt || '');
  if (mt.indexOf('pdf') > -1)  return '.pdf';
  if (mt.indexOf('png') > -1)  return '.png';
  if (mt.indexOf('webp') > -1) return '.webp';
  if (mt.indexOf('jpeg') > -1 || mt.indexOf('jpg') > -1) return '.jpg';
  if (mt.indexOf('word') > -1 || mt.indexOf('officedocument') > -1) return '.docx';
  return '';
}
