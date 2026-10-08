# Upgrade your existing Windows receiver for incremental sync

Update the receiver **before** installing the new incremental-sync APK.

Downloads: [Receiver ZIP](https://vasishta-atmuri.github.io/galaxy-journal-prototype-pages/galaxy-journal-research-laptop.zip) · [Latest APK](https://vasishta-atmuri.github.io/galaxy-journal-prototype-pages/galaxy-journal.apk). The new receiver continues accepting APK 1.0.126's full snapshots, so existing testers can keep using that APK during the upgrade. The new APK waits/retries if it reaches an older receiver; it does not fall back to full-history uploads.

You keep the same Cloudflare account, tunnel, hostname and port. Do **not** create a new tunnel, edit GitHub configuration, delete research.sqlite, uninstall the phone app or issue tester codes.

## 1. Stop the old receiver and extract the new package

In the terminal running the receiver, press **Ctrl+C** and wait for it to exit. Stop any receiver auto-restart task/service if you created one, and finish any report/export/check command. Leave the Cloudflare tunnel configured as it is. If the receiver is running invisibly, use its original launcher/task to stop it; do not kill unrelated Node processes.

Download `galaxy-journal-research-laptop.zip` and extract it into a **new temporary folder**, for example `C:\GalaxyJournalReceiverUpdate`. That folder directly contains this guide, `Upgrade-Windows.ps1`, `package.json` and `shared`. Do not extract over the existing installation before backing it up.

## 2. Run the upgrade helper

Open PowerShell as the **same Windows user** who ran the old server. Replace the example old-server path below with your existing receiver folder (the one where you previously ran `npm.cmd start`). Node.js 24 LTS is required.

```powershell
Set-Location C:\GalaxyJournalReceiverUpdate
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\Upgrade-Windows.ps1 -ServerDirectory 'C:\path\to\your\existing\receiver'
```

The helper refuses to run while port 8787 is occupied, checks that it found an existing receiver and database, then copies the **whole stopped data directory** and old program into a timestamped private backup under `Documents\GalaxyJournalReceiverBackups`. It replaces only receiver program files, installs locked dependencies and runs the database check. It preserves the original SQLite database, installation registrations and credentials. Do not share the private backup.

Normally the data directory is `%LOCALAPPDATA%\GalaxyJournalResearch`. If you previously set `JOURNAL_BACKUP_DATA` or the helper cannot find your database, locate the original path from the old server's startup message. Pass it explicitly:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\Upgrade-Windows.ps1 -ServerDirectory 'C:\path\to\your\existing\receiver' -DataDirectory 'C:\path\to\your\existing\data'
```

Keep using that same custom data path when starting the server. The helper does not change your permanent Windows environment or scheduled task.

## 3. Start the upgraded server and verify

```powershell
Set-Location 'C:\path\to\your\existing\receiver'
# ONLY if you previously used a custom data directory:
# $env:JOURNAL_BACKUP_DATA = 'C:\path\to\your\existing\data'
npm.cmd start
```

Keep that terminal open. Preserve any existing `JOURNAL_BACKUP_ORIGINS` value; the default permits the Android app. Restart your existing Cloudflare tunnel if needed, using your existing command (`cloudflared tunnel --protocol http2 run galaxy-journal` for your reported setup).

In a second PowerShell window:

```powershell
Invoke-RestMethod http://127.0.0.1:8787/health
Invoke-RestMethod https://research.galaxyjournal.win/health
```

Both must show:

```text
ok           : True
protocol     : journal-backup-1
syncProtocol : journal-sync-2
```

The old protocol field remains for older APKs. **The new syncProtocol field confirms you are running the incremental receiver.** Health exposes no private rows and does not prove an authenticated phone upload.

## 4. Update the phone and confirm receipt

Install the latest signed APK over the existing app, preserving its data and Knox ID. Open Journal while the laptop and tunnel are running. Under Settings → App & data → Help shape Journal → Analytics sync, use **Retry sync now** once to confirm a successful receipt without waiting for the automatic window.

For a phone whose history is already on the laptop, the new client starts at the laptop's acknowledged cursor and sends only newer events. A new installation or lost laptop database sends retained history in bounded batches. Each batch contains at most 500 new events; a bounded burst drains the backlog. Large backlogs can span later sync windows. No local events are deleted after acknowledgment.

Automatic syncing uses a five-minute cooldown; there is no idle network polling. Successfully fetched central address configuration is cached for thirty minutes across restarts. A failed or interrupted fetch can retry on foreground opening. Failed attempts start retrying after one minute, increase up to thirty minutes with jitter, and honor a longer server Retry-After. These deadlines survive closing/reopening the app. A check on foreground opening also detects an older/restored laptop database once the cooldown permits. Manual retry can bypass the ordinary cooldown, but not a server Retry-After deadline.

Enrollment is now saved after its first successful acknowledgment. It repeats automatically only after an unacknowledged enrollment, a new destination/installation, or an explicit `installation_unknown` response (such as after receiver data loss). Revoked credentials do not trigger re-enrollment.

Optional owner check from the receiver folder:

```powershell
npm.cmd run check
npm.cmd run report
```

Reports/exports keep the existing cumulative per-epoch format. During a multi-batch transfer, reports retain the previous complete snapshot; a brand-new epoch appears when its transfer completes. Stored partial batches survive receiver restart and resume at the next cursor.

## Recovery and rollback

If a check fails, keep the receiver stopped and preserve the printed backup path. Do not delete either database. The update adds tables and migrates each epoch when it first receives an incremental batch. **Do not roll back just the program after incremental batches have arrived:** the older program cannot read the new tables. To roll back, stop Node and all data readers, preserve the current entire data directory separately, then restore both the old program and its matching whole stopped-server data backup. Phones retain their history and can resend it when the incremental receiver is restored.

After restoring older/empty server data, the new client detects the server cursor on its next eligible foreground check or manual retry and resends only the missing tail. It re-enrolls the saved installation credential if registration is absent. A conflicting or newer server history is retained and surfaced for review, never silently overwritten.

This helper and protocol are tested with isolated fixtures on macOS/Node 24; actual PowerShell execution, Windows upgrade and physical-phone receipt remain checks for your PC/phone. No test participant is sent to your real database.
