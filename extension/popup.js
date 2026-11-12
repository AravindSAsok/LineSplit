const pasteButton = document.getElementById("pasteButton");
const clearButton = document.getElementById("clearButton");
const chunkSizeInput = document.getElementById("chunkSize");
const message = document.getElementById("message");
const summary = document.getElementById("summary");
const lineCount = document.getElementById("lineCount");
const chunkCount = document.getElementById("chunkCount");
const chunksContainer = document.getElementById("chunks");
const STORAGE_KEY = "lineSplitState";

function showMessage(text, type = "") {
  message.textContent = text;
  message.className = `message ${type}`.trim();
}

function clearResults() {
  chunksContainer.replaceChildren();
  summary.hidden = true;
  lineCount.textContent = "0 lines";
  chunkCount.textContent = "0 chunks";
  showMessage("");
}

function splitIntoChunks(text, size) {
  // Keep blank lines and the final empty line if the source ends with a newline.
  const lines = text.split(/\r\n|\n|\r/);
  const chunks = [];

  for (let index = 0; index < lines.length; index += size) {
    chunks.push(lines.slice(index, index + size).join("\n"));
  }

  return { lines, chunks };
}

function renderChunks(chunks, totalLines) {
  chunksContainer.replaceChildren();

  chunks.forEach((chunkText, index) => {
    const card = document.createElement("article");
    card.className = "chunk";

    const header = document.createElement("div");
    header.className = "chunk-header";

    const title = document.createElement("span");
    title.className = "chunk-title";
    const firstLine = index * Number(chunkSizeInput.value) + 1;
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
        window.setTimeout(() => {
          copyButton.textContent = "Copy";
        }, 1400);
      } catch (error) {
        showMessage("Could not copy. Check clipboard permission and try again.", "error");
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

  pasteButton.disabled = true;
  showMessage("Reading clipboard…");

  try {
    // Clipboard is read only in response to this explicit button click.
    const text = await navigator.clipboard.readText();

    if (text.length === 0) {
      clearResults();
      await chrome.storage.local.remove(STORAGE_KEY);
      showMessage("Clipboard is empty. Copy some multi-line text first.", "error");
      return;
    }

    const { lines, chunks } = splitIntoChunks(text, size);
    renderChunks(chunks, lines.length);

    try {
      await chrome.storage.local.set({
        [STORAGE_KEY]: {
          originalText: text,
          chunkSize: size,
          totalLines: lines.length,
          chunks
        }
      });
      showMessage("Clipboard text split successfully. Your chunks are saved.", "success");
    } catch (storageError) {
      showMessage("Chunks are displayed, but could not be saved. Check extension storage permissions.", "error");
    }
  } catch (error) {
    showMessage(
      "Clipboard access was denied or unavailable. Allow clipboard access and try again.",
      "error"
    );
  } finally {
    pasteButton.disabled = false;
  }
});

clearButton.addEventListener("click", async () => {
  clearResults();

  try {
    await chrome.storage.local.remove(STORAGE_KEY);
    showMessage("Cleared.");
  } catch (error) {
    showMessage("Cleared from this popup, but saved data could not be removed.", "error");
  }
});

async function restoreSavedChunks() {
  try {
    const saved = await chrome.storage.local.get(STORAGE_KEY);
    const state = saved[STORAGE_KEY];

    if (!state || !Array.isArray(state.chunks) || state.chunks.length === 0) {
      return;
    }

    const size = Number(state.chunkSize);
    if (!Number.isInteger(size) || size < 1 || size > 10000) {
      await chrome.storage.local.remove(STORAGE_KEY);
      return;
    }

    chunkSizeInput.value = String(size);
    renderChunks(state.chunks, Number(state.totalLines) || 0);
    showMessage("Restored your saved chunks. Copy any chunk to continue.", "success");
  } catch (error) {
    showMessage("Could not restore saved chunks. Try reopening the extension.", "error");
  }
}

restoreSavedChunks();
