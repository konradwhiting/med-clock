# med-clock

A bedside clock that also counts down medicine supplies. Built for an old iPad in landscape.

The page is just code. **No medicine data lives in this repo.** You type or import it on the device,
and it is stored only in that browser's local storage.

Each medicine has: name, units counted, the date counted, and units used per day. The page works out
units left today, days of supply left and the run-out date, and colours each row
(red 3 days or less, amber 7, yellow 14, green more).

Not medical advice. Always check labels and confirm doses with the prescriber or pharmacist.

To add a medicine, use Edit, then Add one. To remove one, tap Remove (it asks first). When a repeat
arrives, tap Edit, type how many you received in New supply and tap Add supply: the page counts what
is left today, adds the new amount and restarts the count from today.
