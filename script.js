/*****************************************************
 * Subathon Timer — StreamElements Custom Widget (Sandbox-Safe)
 * - No hard dependency on SE_API.store or localStorage
 * - Reacts to follow / sub (T1/T2/T3/Prime) / bits
 * - Commands (via chat):
 *   !set HH:MM:SS
 *   !increase X     (minutes)
 *   !decrease X     (minutes)
 *   !pause
 *   !start [HH:MM:SS]
 *   !stop
 *   !revert [N]     (undo last N deltas)
 *****************************************************/

/* -------------------- Utilities -------------------- */
function $(sel, root = document) {
  return root.querySelector(sel);
}
function $all(sel, root = document) {
  return Array.from(root.querySelectorAll(sel));
}
function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}
function toHMS(total) {
  total = Math.max(0, Math.floor(Number(total || 0)));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return { h, m, s };
}
function parseHMS(str) {
  if (!str) return 0;
  const m = String(str)
    .trim()
    .match(/^(\d{1,2}):(\d{1,2}):(\d{1,2})$/);
  if (!m) return 0;
  const h = Number(m[1]),
    mm = Number(m[2]),
    ss = Number(m[3]);
  return h * 3600 + mm * 60 + ss;
}
function hexToRgba(hex, a = 1) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || "#000000");
  if (!m) return `rgba(0,0,0,${a})`;
  const r = parseInt(m[1], 16),
    g = parseInt(m[2], 16),
    b = parseInt(m[3], 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
function log(...args) {
  if (F.consoleLog) console.log("[Subathon]", ...args);
}
function debug(...args) {
  if (F.debugLog) console.debug("[Subathon]", ...args);
}

/* -------------------- Configuration -------------------- */
let F = {}; // fields
let channel = "";
const STATE_KEY = "subathonTimer:c2b528d7-6d7e-48c1-8090-c24098ae8a1a"; // storage key when persistence enabled
const HISTORY_MAX = 100;
const eventHistory = []; // in-memory only
let intervalId = null;
let persistTO = null;
const PERSIST_THROTTLE_MS = 10000;
/* -------------------- State -------------------- */
let state = {
  remainingSeconds: 0,
  running: false,
  paused: true,
  stopped: false,
  lastTick: Date.now(),
};

function stopTimer() {
  state.running = false;
  state.paused = true;
  state.stopped = true;
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  schedulePersist(true);
}

function startTimer() {
  state.running = true;
  state.paused = false;
  state.stopped = false;
  if (intervalId) clearInterval(intervalId);
  state.lastTick = Date.now();
  intervalId = setInterval(tick, 1000);
  schedulePersist(true);
}

function pauseTimer() {
  state.running = false;
  state.paused = true;
  state.stopped = false;
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  schedulePersist(true);
}

function render() {
  const { h, m, s } = toHMS(state.remainingSeconds);
  const hour = $("#hour"),
    minute = $("#minute"),
    second = $("#second");
  if (hour) hour.textContent = String(h).padStart(2, "0");
  if (minute) minute.textContent = String(m).padStart(2, "0");
  if (second) second.textContent = String(s).padStart(2, "0");
}

let eventHideTO = null;
function showEvent(message, effect) {
  const box = $("#event");
  if (!box) return;
  if (!message && !effect) {
    box.classList.add("hide");
    return;
  }

  let msgEl = box.querySelector(".event-message");
  let effEl = box.querySelector(".event-effect");
  if (!msgEl) {
    msgEl = document.createElement("span");
    msgEl.className = "event-message";
    box.appendChild(msgEl);
  }
  if (!effEl) {
    effEl = document.createElement("span");
    effEl.className = "event-effect";
    box.appendChild(effEl);
  }

  msgEl.textContent = message || "";
  effEl.textContent = effect || "";

  box.classList.remove("hide");
  clearTimeout(eventHideTO);
  eventHideTO = setTimeout(
    () => box.classList.add("hide"),
    Number(F.eventFadeMs || 4500)
  );
}

/* -------------------- Event Messages -------------------- */
function eventMessageFor(kind) {
  switch (kind) {
    case "follow":
      return F.followMessageText || "New follower!";
    case "cheer":
      return F.cheerMessageText || "Cheer!";
    case "sub:T1":
      return F.subTier1MessageText || "Tier 1 Sub!";
    case "sub:T2":
      return F.subTier2MessageText || "Tier 2 Sub!";
    case "sub:T3":
      return F.subTier3MessageText || "Tier 3 Sub!";
    case "sub:Other":
      return F.subOtherMessageText || "Subscription!";
    default:
      return typeof kind === "string" ? kind : "";
  }
}

/* -------------------- Timer core -------------------- */
function applyDelta(
  deltaSec,
  { kind = "manual", message = "", record = true } = {}
) {
  debug("Apply delta", deltaSec, kind, message);
  const prev = state.remainingSeconds;
  const now = Math.max(0, prev + Number(deltaSec || 0));
  state.remainingSeconds = now;
  if (record && deltaSec) {
    eventHistory.unshift({
      ts: Date.now(),
      delta: Number(deltaSec),
      kind,
      message,
    });
    if (eventHistory.length > HISTORY_MAX) eventHistory.length = HISTORY_MAX;
  }
  render();
  schedulePersist();
}

function addSeconds(sec, effectLabel, kind = null) {
  debug("Add seconds", sec, effectLabel, kind);
  if (state.stopped) {
    debug("Add seconds ignored: stopped");
    return;
  }
  if (state.paused && !F.allowEventsWhilePaused) {
    debug("Add seconds ignored: paused");
    return;
  }
  debug("Add seconds allowed");
  const add = Math.max(0, Math.floor(Number(sec || 0)));
  if (!add) return;
  applyDelta(add, {
    kind: kind || "manual",
    message: effectLabel,
    record: true,
  });
  const msg = eventMessageFor(kind || "manual");
  showEvent(msg, effectLabel);
}

function revert(n = 1) {
  n = clamp(Math.floor(Number(n || 1)), 1, HISTORY_MAX);
  while (n-- > 0 && eventHistory.length) {
    const ev = eventHistory.shift();
    applyDelta(-ev.delta, {
      kind: "revert",
      message: `Revert ${ev.kind}: ${ev.delta}s`,
      record: false,
    });
  }
  showEvent("Reverted", "");
  schedulePersist(true);
}

function tick() {
  debug("Tick");
  const now = Date.now();
  const elapsed = Math.floor((now - state.lastTick) / 1000);
  state.lastTick = now;
  if (state.running && !state.paused && !state.stopped && elapsed > 0) {
    if (state.remainingSeconds > 0) {
      state.remainingSeconds = Math.max(0, state.remainingSeconds - elapsed);
      render();
      schedulePersist();
    } else if (F.autoStopOnZero) {
      stopTimer();
    } else {
      pauseTimer();
    }
  }
}

/* -------------------- Persistence -------------------- */
function loadPersistedState() {
  if (!F.persistenceEnabled || !SE_API || !SE_API.store)
    return Promise.resolve(false);
  try {
    return SE_API.store
      .get(STATE_KEY)
      .then((val) => {
        if (!val) return false;
        debug("Loaded persisted state", val);
        if (typeof val.remainingSeconds === "number")
          state.remainingSeconds = Math.max(0, val.remainingSeconds | 0);
        if (typeof val.running === "boolean") state.running = val.running;
        if (typeof val.paused === "boolean") state.paused = val.paused;
        if (typeof val.stopped === "boolean") state.stopped = val.stopped;
        if (Array.isArray(val.history)) {
          eventHistory.length = 0;
          val.history
            .slice(0, HISTORY_MAX)
            .forEach((e) => eventHistory.push(e));
        }
        render();
        return true;
      })
      .catch((err) => {
        debug("Persist load failed", err);
        return false;
      });
  } catch (err) {
    debug("Persist load error", err);
    return Promise.resolve(false);
  }
}

function persistState(immediate = false) {
  debug("Persist state", immediate);
  if (!F.persistenceEnabled || !SE_API || !SE_API.store){
    debug("Persistence not enabled or SE_API.store not available");
    return;
  }
  const payload = {
    remainingSeconds: state.remainingSeconds,
    running: state.running,
    paused: state.paused,
    stopped: state.stopped,
    history: eventHistory.slice(0, 20),
  };
  try {
    SE_API.store.set(STATE_KEY, payload);
    debug("Persisted state", payload);
  } catch (err) {
    debug("Persist set error", err);
  }
  if (immediate) {
    clearTimeout(persistTO);
    persistTO = null;
  }
}

function schedulePersist(forceImmediate = false) {
  debug("Schedule persist", forceImmediate);
  if (!F.persistenceEnabled) return;
  debug("Persistence enabled");
  if (forceImmediate) {
    debug("Forcing immediate persist");
    return persistState(true);
  }
  clearTimeout(persistTO);
  persistTO = setTimeout(() => {
    debug("Persist timeout fired");
    persistState();
  }, PERSIST_THROTTLE_MS);
}

/* -------------------- StreamElements Hooks -------------------- */
window.addEventListener("onWidgetLoad", async (obj) => {
  debug("Widget load", obj);
  const { fieldData } = obj?.detail ?? {};
  F = fieldData || {};

  // initial time
  state.remainingSeconds = Math.max(0, Number(F.startSeconds ?? 0));
  state.running = Boolean(!F.startPaused || false);
  state.paused = !state.running;
  state.stopped = false;
  let restored = false;
  if (F.persistenceEnabled) {
    restored = await loadPersistedState();
    debug("Restored from persistence?", restored);
  }
  render();
  if (state.running && !state.paused) startTimer();
  log("Initialized", state, F, { restored });
  schedulePersist(true);
});

window.addEventListener("onEventReceived", (obj) => {
  const data = obj?.detail || {};
  const listener = data.listener;
  const ev = data.event || {};
  log("Event received");
  debug("Event:", listener, ev);
  // Chat commands
  if (listener === "message" && ev?.data?.text) {
    debug("Chat message received", ev);
    const text = String(ev.data.text).trim();
    const isBroadcaster = (ev.data?.badges || []).some(
      (b) => b.type === "broadcaster"
    );
    const isMod = (ev.data?.badges || []).some((b) => b.type === "moderator");
    const canControl = isBroadcaster || isMod;
    if (canControl && text.startsWith("!")) {
      const parts = text.split(/\s+/);
      const cmd = parts[0].toLowerCase();
      if ((F.broadcasterSet || F.moderatorSet) && cmd === "!set" && parts[1]) {
        const sec = parseHMS(parts[1]);
        if (sec > 0) {
          state.remainingSeconds = sec;
          render();
          showEvent("Set timer", parts[1]);
        }
      }
      if (
        (F.broadcasterIncrease || F.moderatorIncrease) &&
        cmd === "!increase"
      ) {
        const min = Math.max(0, Number(parts[1] || 1) || 1);
        addSeconds(min * 60, `+${min * 60}s`, "manual");
      }
      if (
        (F.broadcasterDecrease || F.moderatorDecrease) &&
        cmd === "!decrease"
      ) {
        const min = Math.max(0, Number(parts[1] || 1) || 1);
        applyDelta(-(min * 60), { kind: "manual", message: `-${min * 60}s` });
        showEvent("Decrease", `-${min * 60}s`);
      }
      if ((F.broadcasterPause || F.moderatorPause) && cmd === "!pause") {
        pauseTimer();
        showEvent("Paused", "");
      }
      if ((F.broadcasterStart || F.moderatorStart) && cmd === "!start") {
        if (parts[1])
          state.remainingSeconds = parseHMS(parts[1]) || state.remainingSeconds;
        startTimer();
        showEvent("Started", "");
      }
      if ((F.broadcasterStop || F.moderatorStop) && cmd === "!stop") {
        stopTimer();
        showEvent("Stopped", "");
      }
      if ((F.broadcasterRevert || F.moderatorRevert) && cmd === "!revert") {
        revert(Number(parts[1] || 1));
      }
    }
  }

  // Follows
  if (listener === "follower-latest") {
    debug("Follower event received", ev);
    const add = Math.max(0, Number(F.followAddSeconds || 0));
    debug("Follow add seconds", add);
    if (add > 0) addSeconds(add, `+${add}s`, "follow");
  }

  // Subs (gift/prime/tiered)
  if (listener === "subscriber-latest") {
    debug("Subscriber event received", ev);
    const rawTier = String(
      ev?.tier || ev?.plan || ev?.tier_plan || ev?.subscriptionPlan || ""
    ).toLowerCase();
    let tier = "Other";
    if (rawTier.includes("3000") || rawTier.includes("tier3")) tier = "T3";
    else if (rawTier.includes("2000") || rawTier.includes("tier2")) tier = "T2";
    else if (
      rawTier.includes("1000") ||
      rawTier.includes("tier1") ||
      rawTier.includes("prime")
    )
      tier = "T1";
    let add = 0;
    if (tier === "T1") add = Number(F.subTier1AddSeconds || 0);
    else if (tier === "T2") add = Number(F.subTier2AddSeconds || 0);
    else if (tier === "T3") add = Number(F.subTier3AddSeconds || 0);
    else add = Number(F.subOtherAddSeconds || 0);
    add = Math.max(0, add);
    debug("Sub tier", tier, "add seconds", add);
    if (add > 0) addSeconds(add, `+${add}s`, `sub:${tier}`);
  }

  // Bits (cheers)
  if (listener === "cheer-latest") {
    debug("Cheer event received", ev);
    const bits = Number(ev.amount || 0);
    const X = Math.max(1, Number(F.bitsUnitX || 100));
    const Y = Math.max(1, Number(F.bitsUnitYSeconds || 60));
    if (bits > 0) {
      const units = Math.floor(bits / X) || 0;
      const add = units * Y;
      debug("Bits", bits, "units", units, "add seconds", add);
      if (add > 0) addSeconds(add, `+${add}s ${bits} bits`, "cheer");
    }
  }
});
