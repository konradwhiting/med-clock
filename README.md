# med-clock

A bedside screen that counts down medicine supplies. Built for an old iPad in landscape.
Live at https://konradwhiting.github.io/med-clock/ (GitHub Pages, main branch, root folder).

**No medicine data lives in this repo, and neither does the link to the data.** This is public code only.
`.gitignore` blocks `med-data*.json` and `*.xlsx`. Never commit names, counts or the sheet link.

Not medical advice. Always check labels and confirm doses with the prescriber or pharmacist.

## What it shows

The screen has the day and date at the top, with Edit and Full screen buttons, and the medicines below
in two columns, most urgent first. Each row shows days of supply left, the name, how many are left and
the run-out date. The left edge is coloured: red 3 days or less, amber 7, yellow 14, green more.
There is no clock on purpose.

## How the countdown works

Each medicine has a name, unit, counted, count date (YYYY-MM-DD), per day, and an optional note.

    left today = counted - (per day x whole days since the count date)
    days left  = floor(left / per day)        run-out date = today + days left

It assumes the full daily amount is taken every day, so it drifts if doses are skipped or the medicine
is "as needed" (use the maximum daily use for those). To reset it, change **counted** and set **count date to
today** together, after a real recount or when a new supply arrives. The page recalculates when it
loads or wakes and once a minute while open; the day rolls over at midnight on the device.

## Where the data comes from (two modes)

**1. Google Sheet (what is used day to day).** The medicines live in a Google Sheet with the columns
`Name, Unit, Counted, Count date, Per day, Note, Type` (one medicine per row, dates as YYYY-MM-DD; Type is Rx or OTC and shows as a small tag on the row, blank shows nothing). The sheet is
published to the web as CSV (File, Share, Publish to web, CSV). Open the page once on the device with

    https://konradwhiting.github.io/med-clock/?sheet=<the published CSV link, URL-encoded>

The link is saved in that browser's local storage only, then removed from the address bar. After that
the page reads the sheet when it loads or wakes and every 6 hours (four times a day), keeps the last
good copy for when the device is offline, and shows "Updated hh:mm" at the top right. The Edit button is
hidden in this mode. Google delays published changes by a few minutes. Use `?sheet=off` to go back to
local mode. Anyone with the published link can read the list, so keep it private.

**2. Local data (fallback).** With no sheet set, data is stored in the browser's local storage (key
`medclock.v1`). Tap Edit to add a medicine, remove one (it asks first), type how many arrived under
New supply and tap Add supply (counts what is left today, adds the new amount and restarts the count from
today), or paste a JSON list into Import. Show backup text gives a copy.

## Files

- `index.html`: page, styles and layout (design "B": date on top, two columns).
- `app.js`: the countdown maths and colour levels. No page code.
- `ui.js`: rendering, sheet fetching and CSV parsing, the Edit screen.
- `README.md`, `.gitignore`.

No build step. To test, serve the folder over http (a `file://` page cannot fetch the sheet) and open
it with a test `?sheet=` link or with sample data in local storage.

## Changing it

Edit the files, commit and push to `main`; GitHub Pages republishes in about a minute. The iPad needs a
reload to pick up new code. Layout alternatives that were mocked up (date on the left with notes, and a
card grid with colour totals) are not in the repo; the notes column was dropped in this layout but the
Note column is still read from the sheet.
