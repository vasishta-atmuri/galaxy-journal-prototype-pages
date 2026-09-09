// Run as a Tasker JavaScriptlet (Auto Exit enabled, timeout at least 60 seconds).
// This creates one local file for you to import. It sends nothing to a server.
var journalStarted = Date.now();
if (!getLocation('gps', false, 30)) {
  flash('No location fix. Check Tasker location permission and try outdoors.');
} else {
  var journalFixTime = Number(global('LOCTMS')) * 1000;
  var journalParts = String(global('LOC')).split(',');
  var journalLat = Number(journalParts[0]);
  var journalLon = Number(journalParts[1]);
  if (journalParts.length !== 2 || !isFinite(journalLat) || !isFinite(journalLon) ||
      Math.abs(journalLat) > 90 || Math.abs(journalLon) > 180 ||
      !isFinite(journalFixTime) || journalFixTime < journalStarted - 60000 || journalFixTime > Date.now() + 60000) {
    flash('The location fix is missing or stale. No file was created.');
  } else {
    var journalPacket = {version: 1, events: [{
      id: 'location-' + journalFixTime,
      source: 'Tasker device location',
      title: 'A place from today',
      text: 'Device location approximately ' + journalLat.toFixed(3) + ', ' + journalLon.toFixed(3) + '. One observation only; place name, activity and meaning are unknown.',
      time: new Date(journalFixTime).toISOString(),
      status: 'observed'
    }]};
    var journalPath = 'Download/journal-context-' + journalFixTime + '.json';
    if (writeFile(journalPath, JSON.stringify(journalPacket), false)) {
      flash('Saved ' + journalPath + '. Import it under Phone context in Journal.');
      browseURL('https://vasishta-atmuri.github.io/galaxy-journal-prototype-pages/#guided');
    } else {
      flash('Could not write to Download. Check Tasker file access and use a folder you can select in the browser.');
    }
  }
}
