# StreamElements Subathon Timer — Custom Widget

A clean, flexible **Subathon/Countdown timer** for Twitch built as a **StreamElements custom widget**. It reacts to follows, cheers (bits), and subscriptions with configurable time additions, shows a short event message overlay, and exposes chat commands for the broadcaster and/or moderators.

---

## ✨ Features

- 🕒 Start/pause/stop a visible stream timer
- ➕ Auto-add time on **follows**, **bits**, and **subs** (per-tier)
- 💬 **Chat commands** with per‑role permissions (broadcaster, mods)
- 🧩 Plug‑and‑play **custom widget** for StreamElements
- 🎨 Fully themeable (Google Fonts, colors, sizes)
- 🪄 Event message banner with fade-out
- 🛠️ Debug logging options

> Default styles, font bindings, and field controls are wired via StreamElements `{{variable}}` templating in **CSS** and **Fields**. See the **Styling** and **Configuration Reference** sections below.

---

## 🚀 Quick Start (StreamElements)

1. **Open** StreamElements dashboard → **Overlays** → choose an overlay (or create new) → **Edit**.
2. In the left panel, click **+** → **Static / Custom** → **Custom widget** → **Add**.
3. Select the new widget → open **Editor** panel (right side). You’ll see **HTML**, **CSS**, **JS**, and **Fields** tabs.
4. **Paste the files** into each tab:
   - **HTML** → use the snippet in this README (see _Minimal HTML_ below).
   - **CSS**  → paste from your `styles.css`.
   - **JS**   → paste from your `script.js`.
   - **Fields** → paste from your `fields.json`.
5. Press **Save** → **Preview** → **Launch** your overlay in OBS/Streamer software.

> Tip: If you already have an older version, **Duplicate** the widget and upgrade safely.

### Minimal HTML

> The widget’s JS will usually manage state and render live values. The structure below matches the CSS class names so your styles apply immediately.

```html
<div class="container">
  <h1 id="title"></h1>

  <div class="timer">
    <span class="timer-font" id="timer-text">00:10:00</span>
  </div>

  <div class="event hide" id="event-box">
    <span class="event-message" id="event-message">New follower!</span>
    <span class="event-effect" id="event-effect">+60s</span>
  </div>
</div>
```

---

## 🧩 What Goes Where

- **HTML**: Structure only (title, timer text, event message box).
- **CSS**: Visuals and fonts. Uses StreamElements field bindings like `{{titleFontFamily}}`, `{{timerColor}}`, etc. (See _Styling_.)
- **JavaScript**: Core logic — timer state, event listeners for follows/bits/subs, chat command parsing, permissions, and DOM updates.
- **Fields**: All user‑configurable options (fonts, sizes, colors, logic, time additions, command prefix & permissions, debug toggles).

---

## 🎛️ Configuration Reference (Fields)

Below are all available fields grouped by their section in the StreamElements **Fields** tab, with defaults and what they do.

### Title

- **titleFontFamily** (Google Font, default: _Finger Paint_) — Font for the title. fileciteturn0file2  
- **titleFontSize** (px, default: 72) — Title font size. fileciteturn0file2  
- **titleColor** (color, default: `#FFFFFF`) — Title text color. fileciteturn0file2  
- **titleText** (text, default: `Subathon Timer`) — Title content; leave blank to hide. fileciteturn0file2  

### Event

- **eventFadeMs** (ms, default: 4500) — How long the event banner stays visible before fading. Set `0` to keep it persistent until replaced. fileciteturn0file2  
- **eventBackgroundColor** (color, default: `#000000`) — Background of the event container. fileciteturn0file2  

**Event Message (text part on the left):**

- **eventMessageFontFamily** (Google Font, default: _Finger Paint_) — Font for the message (e.g., “New follower!”). fileciteturn0file2  
- **eventMessageFontSize** (px, default: 38) — Size of the event message text. fileciteturn0file2  
- **eventMessageColor** (color, default: `#FFFFFF`) — Event message text color. fileciteturn0file2  
- **eventMessageBackgroundColor** (color, default: `#000000`) — Per‑span background behind the message. fileciteturn0file2  

**Event Effect (numeric part on the right):**

- **eventEffectFontFamily** (Google Font, default: _Finger Paint_) — Font for the effect text (e.g., “+60s”). fileciteturn0file2  
- **eventEffectFontSize** (px, default: 38) — Size of the effect text. fileciteturn0file2  
- **eventEffectColor** (color, default: `#FFFF00`) — Effect text color. fileciteturn0file2  
- **eventEffectBackgroundColor** (color, default: `#000000`) — Per‑span background behind the effect. fileciteturn0file2  

### Timer

- **timerFontFamily** (Google Font, default: _Finger Paint_) — Timer digits font. fileciteturn0file2  
- **timerFontSize** (px, default: 150) — Timer digits size. fileciteturn0file2  
- **timerColor** (color, default: `#FFFFFF`) — Timer text color. fileciteturn0file2  
- **timerBackgroundColor** (color, default: `#000000`) — Background behind the timer block. fileciteturn0file2  

### Logic

- **startSeconds** (number, default: 600) — Initial countdown value in seconds (e.g., `600` = 10 minutes). fileciteturn0file2  
- **startPaused** (checkbox, default: true) — If checked, the timer loads in a paused state. fileciteturn0file2  
- **allowEventsWhilePaused** (checkbox, default: true) — If checked, events can still add time even when the timer is paused. fileciteturn0file2  
- **autoStopOnZero** (checkbox, default: true) — If checked, the timer auto‑stops when reaching zero (prevents negative time). fileciteturn0file2  

### Time Additions

- **followAddSeconds** (number, default: 60) — Seconds added per **follow**. fileciteturn0file2  
- **bitsUnitX** (number, default: 100) — Bits threshold per unit (the “X”). fileciteturn0file2  
- **bitsUnitYSeconds** (number, default: 60) — Seconds added per `bitsUnitX` bits (the “Y”). Example: with X=100 and Y=60, a 250‑bit cheer adds `floor(250/100)*60 = 120s`. fileciteturn0file2  
- **subTier1AddSeconds** (number, default: 120) — Seconds added per Tier 1 sub. fileciteturn0file2  
- **subTier2AddSeconds** (number, default: 240) — Seconds added per Tier 2 sub. fileciteturn0file2  
- **subTier3AddSeconds** (number, default: 360) — Seconds added per Tier 3 sub. fileciteturn0file2  
- **subOtherAddSeconds** (number, default: 120) — Seconds added for gifted, Prime, or unknown‑tier subs (implementation‑dependent). fileciteturn0file2  

### Commands

- **commandsPrefix** (text, default: `!`) — Prefix for chat commands, e.g., `!start`. fileciteturn0file2  

**Broadcaster permissions** (toggle which commands the broadcaster may use):  

- **broadcasterSet**, **broadcasterIncrease**, **broadcasterDecrease**, **broadcasterPause**, **broadcasterStart**, **broadcasterStop**, **broadcasterRevert** — all default to **true**. fileciteturn0file2  

**Moderator permissions** (toggle which commands moderators may use):  

- **moderatorSet**, **moderatorIncrease**, **moderatorDecrease**, **moderatorPause**, **moderatorStart**, **moderatorStop**, **moderatorRevert** — all default to **true**. fileciteturn0file2  

### Event Messages (Text Templates)

- **followMessageText** (default: `New follower!`) — Shown when a follow is detected. fileciteturn0file2  
- **cheerMessageText** (default: `Cheer!`) — Shown on a bits cheer. fileciteturn0file2  
- **subTier1MessageText** (default: `Tier 1 Sub!`) — Shown on Tier 1 sub. fileciteturn0file2  
- **subTier2MessageText** (default: `Tier 2 Sub!`) — Shown on Tier 2 sub. fileciteturn0file2  
- **subTier3MessageText** (default: `Tier 3 Sub!`) — Shown on Tier 3 sub. fileciteturn0file2  
- **subOtherMessageText** (default: `Subscription!`) — Shown for other/unknown tier. fileciteturn0file2  

### Debug

- **consoleLog** (checkbox, default: false) — Enable normal console logging. fileciteturn0file2  
- **debugLog** (checkbox, default: false) — Enable verbose debug logging. fileciteturn0file2  

---

## 🎨 Styling

The provided CSS binds to Field values using StreamElements template variables (e.g., `{{titleFontFamily}}`, `{{timerFontSize}}px`, etc.). Key hooks/classes:

- **.container** — grid layout that centers the content. fileciteturn0file1  
- **#title** — title element; font family, color, and size map to Title fields. fileciteturn0file1  
- **.timer / .timer-font** — the timer block and its numeric text; background and color map to Timer fields. fileciteturn0file1  
- **.event** — event banner container with fade transition (`.hide` toggles opacity). fileciteturn0file1  
- **.event-message / .event-effect** — per‑span styles for the message and the “+Xs” effect; each has own font, size, color, and background. fileciteturn0file1  

> Remember to include your Google Fonts via the **Fields** (type `googleFont`) — StreamElements injects the selected fonts for you.

---

## 💬 Chat Commands

> The **prefix** is set by **commandsPrefix** (default `!`). Permissions are controlled by the **Broadcaster** and **Moderator** toggles in Fields.

- **`!start`** — Start/resume the countdown.
- **`!pause`** — Pause the timer (does not reset the time).
- **`!stop`** — Stop the timer (implementation commonly pauses and optionally snaps to zero if at/below 0 depending on `autoStopOnZero`).
- **`!set <seconds>`** — Set the timer to an exact number of seconds. Example: `!set 900` → 15:00.
- **`!increase <seconds>`** — Add seconds to the timer. Example: `!increase 60`.
- **`!decrease <seconds>`** — Subtract seconds. Example: `!decrease 30`.
- **`!revert <how many messages>`** — Undo the most recent change. `!revert 2`

> If `allowEventsWhilePaused` is enabled, follows/bits/subs can still add time even while paused; otherwise they’re ignored while paused.

---

## 🧠 Event → Time Rules

- **Follows** add `followAddSeconds` each.
- **Bits (Cheers)** add time in units: for every `bitsUnitX` bits, add `bitsUnitYSeconds`. Example: with X=100 and Y=60, a 500‑bit cheer adds `5 * 60 = 300s`.
- **Subs** add tier‑based seconds: Tier 1 → `subTier1AddSeconds`, Tier 2 → `subTier2AddSeconds`, Tier 3 → `subTier3AddSeconds`. Unknown/gift/Prime can use `subOtherAddSeconds`.

When an event occurs, the widget can display a banner like:

```
[event message] [ +seconds ]
```

…and auto‑hide it after `eventFadeMs` milliseconds.

---

## 🧪 Testing & Debugging

- Enable **consoleLog** and/or **debugLog** in Fields and check the browser console in your overlay preview for verbose output. fileciteturn0file2  
- Simulate events from StreamElements **Activity Feed** (or send test events) to verify additions and event banner formatting.
- If fonts don’t load, ensure you selected them in Fields (Google Font type) and that your browser allows web fonts.

---

## 🛡️ Permissions Tips

- You can let **only the broadcaster** control the timer by disabling all Moderator toggles, or vice‑versa.
- You can allow moderators to make small adjustments (increase/decrease) but not reset the clock by disabling **!set** for mods.
- For a public “read‑only” timer, disable all commands for everyone and control it purely via events.

---

## 📦 Files in this Widget

- `styles.css` — All styles and SE field bindings (colors, sizes, fonts). fileciteturn0file1  
- `fields.json` — All configurable options exposed in the SE Fields tab. fileciteturn0file2  
- `script.js` — Timer logic, event handlers, command parsing (paste into JS tab). *(Provided in your project repository.)*
- `README.md` — This guide. fileciteturn0file0  

---

## ❓ FAQ

**Q: Why isn’t the timer changing when I get a follow/sub/cheer?**  
A: Check that your overlay is the **active** one on stream, the widget is **visible**, and that your StreamElements **Event settings** are enabled for the overlay. Also verify the relevant “Time Additions” values aren’t set to 0.

**Q: The event banner doesn’t show.**  
A: Ensure `eventFadeMs` is not too small, and the **CSS** classes exist (`.event`, `.event-message`, `.event-effect`). The HTML must include the IDs/classes your JS updates.

**Q: Commands don’t work in chat.**  
A: Confirm the channel bot is **joined**, the **commandsPrefix** matches what you type, and that your role has permission enabled (Broadcaster/Moderator toggles).

**Q: Timer shows a weird font.**  
A: Pick a **Google Font** in the Fields for Title/Timer/Event and make sure your overlay refreshed after saving.

---

## 📝 Changelog

- **v1.0.0** — Initial public README and fields mapping.
