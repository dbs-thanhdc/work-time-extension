/**
 * popup.ts
 * Main controller for Work Time Calculator popup UI
 */

import { parseInput, calculate, formatMinutes } from "./utils/calculator.js";

// ── DOM refs ──────────────────────────────────────────────────────────────────
const statusBanner = document.getElementById("status-banner") as HTMLDivElement;
const statusText   = document.getElementById("status-text")   as HTMLSpanElement;
const textarea     = document.getElementById("data-input")     as HTMLTextAreaElement;
const btnCalc      = document.getElementById("btn-calc")       as HTMLButtonElement;
const btnClear     = document.getElementById("btn-clear")      as HTMLButtonElement;
const btnPaste     = document.getElementById("btn-paste")      as HTMLButtonElement;
const resultCard   = document.getElementById("result-card")    as HTMLDivElement;
const toastEl      = document.getElementById("toast")          as HTMLDivElement;

// ── Toast ─────────────────────────────────────────────────────────────────────
let toastTimer: ReturnType<typeof setTimeout> | null = null;

function showToast(msg: string, type: "info" | "success" | "error" = "info") {
  toastEl.textContent = msg;
  toastEl.className = `toast toast--${type} toast--show`;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.classList.remove("toast--show");
  }, 2200);
}

// ── Status banner ─────────────────────────────────────────────────────────────
function setStatus(msg: string, type: "ok" | "warn" | "neutral") {
  statusText.textContent = msg;
  statusBanner.className = `status-banner status-banner--${type}`;
}

// ── Storage helpers ───────────────────────────────────────────────────────────
const STORAGE_KEY_INPUT = "wtc_last_input";

function saveInput(text: string) {
  chrome.storage.local.set({ [STORAGE_KEY_INPUT]: text });
}

function loadSavedInput(): Promise<string> {
  return new Promise((resolve) => {
    chrome.storage.local.get(STORAGE_KEY_INPUT, (res) => {
      resolve((res[STORAGE_KEY_INPUT] as string) || "");
    });
  });
}

// ── Calculate & render ────────────────────────────────────────────────────────
function runCalculation() {
  const raw = textarea.value.trim();
  if (!raw) {
    showToast("Chưa có dữ liệu để tính!", "error");
    return;
  }

  const { validLines, skippedCount } = parseInput(raw);

  if (validLines.length === 0) {
    resultCard.innerHTML = `
      <div class="result-empty">
        <span class="result-empty__icon">⚠️</span>
        <p>Không tìm thấy dữ liệu hợp lệ.</p>
        <p class="result-empty__hint">Định dạng cần là HH:mm (ví dụ: 08:30)</p>
      </div>`;
    resultCard.classList.add("result-card--visible");
    return;
  }

  const result = calculate(validLines);
  const totalFormatted    = formatMinutes(result.totalMinutes);
  const requiredFormatted = formatMinutes(result.requiredMinutes);
  const diffFormatted     = formatMinutes(Math.abs(result.diffMinutes));
  const diffSign          = result.isOvertime ? "+" : "-";
  const diffLabel         = result.isOvertime ? "Dư" : "Thiếu";
  const diffClass         = result.isOvertime ? "diff--over" : "diff--under";

  resultCard.innerHTML = `
    <div class="result-grid">
      <div class="result-item">
        <span class="result-item__label">Ngày công</span>
        <span class="result-item__value">${result.workDays}</span>
      </div>
      <div class="result-item">
        <span class="result-item__label">Tổng giờ</span>
        <span class="result-item__value">${totalFormatted}</span>
      </div>
      <div class="result-item">
        <span class="result-item__label">Giờ chuẩn</span>
        <span class="result-item__value result-item__value--muted">${requiredFormatted}</span>
      </div>
      <div class="result-item result-item--highlight ${diffClass}">
        <span class="result-item__label">${diffLabel}</span>
        <span class="result-item__value">${diffSign}${diffFormatted}</span>
      </div>
    </div>
    ${skippedCount > 0 ? `<p class="result-skipped">Đã bỏ qua ${skippedCount} dòng không hợp lệ</p>` : ""}
  `;
  resultCard.classList.add("result-card--visible");
  saveInput(raw);
  showToast("Tính toán thành công ✓", "success");
}

// ── Clipboard ─────────────────────────────────────────────────────────────────
async function readClipboard(): Promise<string> {
  try {
    return await navigator.clipboard.readText();
  } catch {
    return "";
  }
}

async function pasteFromClipboard() {
  const text = await readClipboard();
  if (!text.trim()) {
    showToast("Clipboard đang trống", "error");
    return;
  }
  textarea.value = text;
  setStatus("Đã dán từ clipboard", "ok");
  showToast("Đã dán từ clipboard", "info");
  autoCalcIfValid(text);
}

function autoCalcIfValid(text: string) {
  const { validLines } = parseInput(text);
  if (validLines.length > 0) {
    runCalculation();
  }
}

// ── Clear ─────────────────────────────────────────────────────────────────────
function clearAll() {
  textarea.value = "";
  resultCard.innerHTML = "";
  resultCard.classList.remove("result-card--visible");
  setStatus("Đã xóa dữ liệu", "neutral");
  chrome.storage.local.remove(STORAGE_KEY_INPUT);
}

// ── Init ──────────────────────────────────────────────────────────────────────
async function init() {
  // Try clipboard first
  const clipText = await readClipboard();

  if (clipText.trim()) {
    const { validLines } = parseInput(clipText);
    if (validLines.length > 0) {
      textarea.value = clipText;
      setStatus("Đã đọc dữ liệu từ clipboard ✓", "ok");
      showToast("Đã đọc clipboard", "info");
      runCalculation();
      return;
    }
  }

  // Fallback: load last saved input
  const saved = await loadSavedInput();
  if (saved) {
    textarea.value = saved;
    setStatus("Dữ liệu lần trước", "neutral");
  } else {
    setStatus("Không có dữ liệu clipboard — vui lòng paste bên dưới", "warn");
  }
}

// ── Event listeners ───────────────────────────────────────────────────────────
btnCalc.addEventListener("click", runCalculation);
btnClear.addEventListener("click", clearAll);
btnPaste.addEventListener("click", pasteFromClipboard);

textarea.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    runCalculation();
  }
});

// ── Boot ──────────────────────────────────────────────────────────────────────
init();
