const pasteButton = document.getElementById("pasteButton");
const clearButton = document.getElementById("clearButton");
const chunkSizeInput = document.getElementById("chunkSize");
const message = document.getElementById("message");
const summary = document.getElementById("summary");
const lineCount = document.getElementById("lineCount");
const chunkCount = document.getElementById("chunkCount");
const chunksContainer = document.getElementById("chunks");
const STORAGE_KEY = "lineSplitWebState";

function showMessage(text, type = "") {
  message.textContent = text;
  message.className = `message ${type}`.trim();
}

function clearResults() {
  chunksContainer.replaceChildren();
  summary.hidden = true;
  lineCount.textContent = "0 lines";
  chunkCount.textContent = "0 chunks";
}

function splitIntoChunks(text, size) {
  const lines = text.split(/\r\n|\n|\r/);
  const chunks = [];
  for (let index = 0; index < lines.length; index += size) {
    chunks.push(lines.slice(index, index + size).join("\n"));
  }
  return { lines, chunks };
}

function renderChunks(chunks, totalLines, size) {
  chunksContainer.replaceChildren();
  chunks.forEach((chunkText, index) => {
    const card = document.createElement("article");
    card.className = "chunk";
    const header = document.createElement("div");
    header.className = "chunk-header";
    const title = document.createElement("span");
    title.className = "chunk-title";
    const firstLine = index * size + 1;
    const lastLine = Math.min(firstLine + chunkText.split("\n").length - 1, totalLines);
    title.textContent = `Chunk ${index + 1} · Lines ${firstLine}–${lastLine}`;
    const copyButton = document.createElement("button");
    copyButton.type = "button";
    copyButton.className = "copy-button";
    copyButton.textContent = "Copy";
    copyButton.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(chunkText);
        copyButton.textContent = "Copied!";
        showMessage(`Chunk ${index + 1} copied to clipboard.`, "success");
        window.setTimeout(() => { copyButton.textContent = "Copy"; }, 1400);
      } catch {
        showMessage("Could not copy. Allow clipboard access in your browser and try again.", "error");
      }
    });
    const preview = document.createElement("pre");
    preview.className = "chunk-content";
    preview.textContent = chunkText;
    header.append(title, copyButton);
    card.append(header, preview);
    chunksContainer.append(card);
  });
  lineCount.textContent = `${totalLines} lines`;
  chunkCount.textContent = `${chunks.length} chunks`;
  summary.hidden = false;
}

pasteButton.addEventListener("click", async () => {
  const size = Number.parseInt(chunkSizeInput.value, 10);
  if (!Number.isInteger(size) || size < 1 || size > 10000) {
    showMessage("Enter a chunk size between 1 and 10,000 lines.", "error");
    return;
  }
  if (!navigator.clipboard?.readText) {
    showMessage("Clipboard reading is unavailable. Open this site over HTTPS or localhost.", "error");
    return;
  }
  pasteButton.disabled = true;
  showMessage("Reading clipboard…");
  try {
    const text = await navigator.clipboard.readText();
    if (text.length === 0) {
      clearResults();
      localStorage.removeItem(STORAGE_KEY);
      showMessage("Clipboard is empty. Copy some multi-line text first.", "error");
      return;
    }
    const { lines, chunks } = splitIntoChunks(text, size);
    renderChunks(chunks, lines.length, size);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ originalText: text, chunkSize: size, totalLines: lines.length, chunks }));
      showMessage("Text split successfully. Your chunks are saved in this browser.", "success");
    } catch {
      showMessage("Chunks are displayed, but browser storage is unavailable or full.", "error");
    }
  } catch {
    showMessage("Clipboard access was denied. Allow clipboard permission and try again.", "error");
  } finally {
    pasteButton.disabled = false;
  }
});

clearButton.addEventListener("click", () => {
  clearResults();
  try {
    localStorage.removeItem(STORAGE_KEY);
    showMessage("Cleared.", "success");
  } catch {
    showMessage("Cleared from this page, but saved browser data could not be removed.", "error");
  }
});

function restoreSavedChunks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (!saved || !Array.isArray(saved.chunks) || saved.chunks.length === 0) return;
    const size = Number(saved.chunkSize);
    if (!Number.isInteger(size) || size < 1 || size > 10000) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    chunkSizeInput.value = String(size);
    renderChunks(saved.chunks, Number(saved.totalLines) || 0, size);
    showMessage("Restored your saved chunks. Copy any chunk to continue.", "success");
  } catch {
    showMessage("Could not restore saved chunks from this browser.", "error");
  }
}

restoreSavedChunks();
