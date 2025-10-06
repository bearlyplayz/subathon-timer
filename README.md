# StreamElements Subathon Timer — Custom Widget

Fully client‑side, sandbox‑safe Subathon / Marathon timer for a StreamElements Custom Widget. It reacts to follows, subs (tiered), cheers/bits, and provides rich chat command control (start, pause, stop, set, increase/decrease, revert). All styling, behavior, and permissions are configurable through the widget field settings defined in `fields.json`. Optional persistence (disabled by default) lets the timer survive OBS / overlay reloads using `SE_API.store`.

---

## ✨ Features

- Add time automatically on: Follows, Bits (configurable X → Y seconds), Tier 1/2/3/Other Subs
- Broadcaster & Moderator permission toggles per command (grant granular control)
- Optional start paused / auto stop at zero / allow events while paused
- Undo (revert) the last N time additions (history capped at 100)
- Event message banner with separate message/effect styling & timed fade out
- Google Fonts support for title, timer, event message, and effect text
- All configuration exposed via `fields.json` (copy–paste into StreamElements Fields tab)
- Pure HTML/CSS/JS – no external build step; safe inside the StreamElements sandbox
- Optional persisted state (enable the “Persist timer state across overlay reloads” checkbox) stored via StreamElements widget store (uses a UUID storage key to avoid collisions; you can swap it for your own)

---

## 📁 Repository Files

| File | Purpose |
|------|---------|
| [`index.html`](./index.html) | Widget HTML template (place into the Custom Widget HTML tab) |
| [`styles.css`](./styles.css) | Widget styling (CSS tab) |
| [`script.js`](./script.js) | Widget logic: timer core, events, commands (JS tab) |
| [`fields.json`](./fields.json) | Field configuration schema (paste into the Fields → “Open Editor” JSON in StreamElements) |
| [`LICENSE`](./LICENSE) | License (review before distribution) |

---

## 🚀 Quick Start (TL;DR)

1. In StreamElements: Overlays → Create New Overlay → pick your canvas size (or existing overlay).  
2. Add Widget → Static / Custom → Custom Widget.  
3. Open its settings panel.  
4. HTML tab → Replace contents with [`index.html`](./index.html).  
5. CSS tab → Replace with [`styles.css`](./styles.css).  
6. JS tab → Replace with [`script.js`](./script.js).  
7. Fields tab → Replace the full contents of [`fields.json`](./fields.json) → Save.  
8. Adjust values (fonts, colors, seconds per event, permissions).  
   - (Optional) Enable persistence in the Logic section if you want the timer to retain time & run/pause state across restarts.  
9. Position & scale the widget on the overlay canvas.  
10. Save Overlay → Launch Preview → Test by triggering events or using chat commands.  

Done. Your subathon timer should now respond to events and commands.

---

## 🛠 Detailed Installation Guide

### 1. Create / Open an Overlay

Go to StreamElements dashboard → Overlays. Either create a new overlay (choose resolution) or edit an existing one you use on stream.

### 2. Add a Custom Widget

Click the “+” → Static / Custom → Custom Widget. Select it on the canvas so its settings appear on the left/right panel (depending on UI variant).

### 3. Insert the Code

- HTML tab: replace everything with the contents of [`index.html`](./index.html)  
- CSS tab: replace with [`styles.css`](./styles.css)  
- JS tab: replace with [`script.js`](./script.js)
- Field tab: replace with [`fields.json`](./fields.json)

### 5. Configure Appearance & Behavior

Use the new grouped panels (Title, Event, Timer, Logic, Time Additions, Commands, Event Messages, Debug):

- Set starting time (seconds)
- Decide to start paused or running
- Define seconds added per event type
- Fine‑tune fonts, sizes, colors, backgrounds
- Toggle which roles (Broadcaster / Mods) can issue each command
- (Optional) Enable console or debug logging for troubleshooting

### 6. Place & Test

Resize/drag the widget on the overlay canvas. Press the “Emulate” (thunder icon) in StreamElements to simulate events (Follower / Subscriber / Cheer) and observe time increases + event banner. Open your channel’s chat (in a test or offline session) and try commands below.

### 7. Go Live

Add the overlay browser source URL (copied from StreamElements) to your streaming software (OBS / Studio / etc.). Make sure the overlay is on top of any backgrounds and not blocked by other sources.

---

## ⏱ Chat Commands Reference

| Command | Arguments | Description | Example | Permission Field Flags* |
|---------|-----------|-------------|---------|-------------------------|
| `!set` | `HH:MM:SS` (required) | Directly sets remaining time to exact value. | `!set 02:30:00` | `broadcasterSet`, `moderatorSet` |
| `!increase` | `X` (minutes) | Adds X minutes (converted to seconds). Default if omitted = 1. | `!increase 5` | `broadcasterIncrease`, `moderatorIncrease` |
| `!decrease` | `X` (minutes) | Subtracts X minutes (cannot go below 0). | `!decrease 10` | `broadcasterDecrease`, `moderatorDecrease` |
| `!pause` | none | Pauses countdown (timer can still accept events if “Allow events while paused” is on). | `!pause` | `broadcasterPause`, `moderatorPause` |
| `!start` | optional `HH:MM:SS` | Starts (or resumes) timer; optional argument overrides current remaining time. | `!start 01:00:00` | `broadcasterStart`, `moderatorStart` |
| `!stop` | none | Stops timer (further automatic additions ignored unless restarted). | `!stop` | `broadcasterStop`, `moderatorStop` |
| `!revert` | optional `N` | Undo last N additions (default 1). Cannot exceed history length (max 100). | `!revert 3` | `broadcasterRevert`, `moderatorRevert` |

*A command executes only if either the broadcaster or a moderator issues it AND the respective permission checkbox in the fields is enabled. (Both can be enabled simultaneously.)*  

Notes:

- Time argument format for `!set` / `!start` must be `HH:MM:SS` (two digits per segment, 00–99 hours).
- Negative values are ignored; invalid formats default to no change.
- The revert history stores only positive deltas that added time (including event-based additions and manual increases).

---

## ➕ Automatic Time Additions

| Event | Field(s) | Default Seconds Added | Logic |
|-------|----------|-----------------------|-------|
| Follow | `followAddSeconds` | 60 | Adds exactly this amount per follow. |
| Bits / Cheer | `bitsUnitX`, `bitsUnitYSeconds` | 100 bits → 60 s | `floor(bits / X) * Y` seconds. |
| Sub Tier 1 | `subTier1AddSeconds` | 120 | Tier detection via plan/tier string include. |
| Sub Tier 2 | `subTier2AddSeconds` | 240 | Same. |
| Sub Tier 3 | `subTier3AddSeconds` | 360 | Same. |
| Other / Unknown Sub | `subOtherAddSeconds` | 120 | Fallback if tier not parsed. |

Additional Behavior:

- If “Allow events while paused” is OFF, events during pause do nothing.
- If timer hits zero: if `autoStopOnZero` is true it stops (no further countdown). Otherwise it pauses at 0.
- Stopped state ignores further event additions until `!start` reactivates.

---

## 🎨 Customization Highlights

| Group | What You Can Change |
|-------|---------------------|
| Title | Font family, size, color, displayed text (or blank to hide) |
| Timer | Font family, size, color, background block color |
| Event | Banner background, fade duration, fonts & colors for message/effect parts |
| Time Additions | Seconds per follow, tiered subs, bits (X→Y mapping) |
| Logic | Start paused, allow events while paused, auto-stop at zero, starting seconds |
| Commands | Per-role permission toggles for each chat command |
| Event Messages | Text shown for each event type (e.g., “Tier 1 Sub!”) |
| Debug | Enable console and/or debug logging in browser devtools |

Tip: Use StreamElements overlay preview → Right-click → Inspect (depending on browser) if you enabled logging.

---

## 🧪 Testing Tips

1. Enable console & debug logging (Debug group) to watch internal flow.  
2. Use StreamElements “Emulate” events to verify additions.  
3. Check chat command permission toggles by disabling a permission and confirming the command no longer works.  
4. Test pause logic with “Allow events while paused” toggled both ways.  
5. Confirm revert: trigger several events → `!revert 2` → time should subtract the last two deltas.  

---

## 🔧 Troubleshooting

| Symptom | Possible Cause | Fix |
|---------|----------------|-----|
| Commands ignored | Permission checkbox off | Enable the corresponding broadcaster/mod checkbox |
| Time not added during pause | Feature disabled | Enable “Allow events while paused” |
| Bits add 0 seconds | Not enough bits to reach threshold | Lower `bitsUnitX` or send more bits |
| Timer stuck at 0 | Auto-stop triggered | Uncheck auto-stop or use `!start` to resume |
| Fonts not applying | Font name mismatch / caching | Use exact Google Font name; ensure it’s requested in HTML (already templated) |
| Event banner never hides | Fade set to 0 or very large | Adjust `eventFadeMs` |
| Events don't seem to update the timer | Incomplete script copy | Re-copy full `script.js` contents into Script tab and save |

---

## 🔐 Safety & Persistence Notes

By default persistence is OFF (stateless, sandbox‑only). When you enable the field:

| Aspect | Behavior |
|--------|----------|
| Storage backend | `SE_API.store` (StreamElements internal per-channel key/value) |
| Storage key (default) | `subathonTimer:c2b528d7-6d7e-48c1-8090-c24098ae8a1a` (a UUID you can replace) |
| Writes | Throttled (≈ every 10s) and on major state changes (start/pause/stop/revert) |
| Data saved | Remaining seconds, running/paused/stopped flags, recent history (first 20 entries) |
| Restore timing | On widget load before first render/start |

Guidelines / Caveats:

- If you run multiple copies of this widget in different overlays simultaneously and want them INDEPENDENT, change the UUID portion of the `STATE_KEY` constant in `script.js` for each overlay. If you want them to SHARE the same timer, keep the UUID identical.
- If the stored state says the timer was running, it resumes with the stored remaining seconds (time passage while offline is NOT subtracted).
- Delete persistence: disable the checkbox and optionally clear the key by re‑enabling, setting remaining to 0, pausing, then disabling again (or clear manually via devtools: `SE_API.store.set('subathonTimer:c2b528d7-6d7e-48c1-8090-c24098ae8a1a', null)`). If you changed the UUID, substitute your custom key.
- History persistence is intentionally trimmed to reduce storage size.

Security: Only StreamElements’ internal widget store is used; no external servers or user secrets. Replacing the UUID does not expose data; it simply segregates storage namespaces.

### Customizing the Storage Key (Advanced)

1. Open `script.js` and locate:  
   `const STATE_KEY = "subathonTimer:c2b528d7-6d7e-48c1-8090-c24098ae8a1a";`
2. Replace the UUID segment (after `subathonTimer:`) with your own (generate one using `crypto.randomUUID()` in the browser console or an online UUID tool).
3. Save & redeploy the widget code (HTML/JS update in StreamElements).
4. (Optional) Clear the old key to prevent stale data:  
   `SE_API.store.set('subathonTimer:OLD-UUID', null)`

Use case matrix:

- Multiple overlays sharing ONE timer → keep the SAME UUID.
- Separate independent timers (e.g., different scenes) → use DIFFERENT UUIDs.
- Reset timer completely → assign a brand new UUID and reload overlay.

---

## 📄 License

This project is provided under the terms of the license in [`LICENSE`](./LICENSE). Review before redistributing or incorporating into packaged overlays.

---

## 🤝 Contributing

Issues / ideas: open a GitHub issue or submit a PR. When adding new configurable fields, remember to update `fields.json` and document them here.
