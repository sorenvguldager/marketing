const wordListEl = document.getElementById("wordList");
const wordInput = document.getElementById("newWord");
const addWordBtn = document.getElementById("addWordBtn");

const amountListEl = document.getElementById("amountList");
const amountInput = document.getElementById("newAmount");
const addAmountBtn = document.getElementById("addAmountBtn");

function renderList(el, items, removeFn) {
  el.innerHTML = "";
  if (items.length === 0) {
    el.innerHTML = '<li class="empty">Ingen filtre tilføjet endnu</li>';
    return;
  }
  items.forEach((text, i) => {
    const li = document.createElement("li");
    const span = document.createElement("span");
    span.textContent = text;
    const btn = document.createElement("button");
    btn.className = "remove-btn";
    btn.textContent = "\u00d7";
    btn.addEventListener("click", () => removeFn(i));
    li.appendChild(span);
    li.appendChild(btn);
    el.appendChild(li);
  });
}

function loadAll() {
  chrome.storage.sync.get({ wordFilters: [], amountFilters: [] }, (data) => {
    renderList(wordListEl, data.wordFilters, removeWord);
    renderList(amountListEl, data.amountFilters, removeAmount);
  });
}

function addWord() {
  const value = wordInput.value.trim();
  if (!value) return;
  chrome.storage.sync.get({ wordFilters: [] }, (data) => {
    const filters = data.wordFilters;
    if (!filters.includes(value)) {
      filters.push(value);
      chrome.storage.sync.set({ wordFilters: filters }, () => {
        wordInput.value = "";
        renderList(wordListEl, filters, removeWord);
      });
    }
  });
}

function removeWord(index) {
  chrome.storage.sync.get({ wordFilters: [] }, (data) => {
    const filters = data.wordFilters;
    filters.splice(index, 1);
    chrome.storage.sync.set({ wordFilters: filters }, () => {
      renderList(wordListEl, filters, removeWord);
    });
  });
}

function addAmount() {
  const value = amountInput.value.trim();
  if (!value) return;
  chrome.storage.sync.get({ amountFilters: [] }, (data) => {
    const filters = data.amountFilters;
    if (!filters.includes(value)) {
      filters.push(value);
      chrome.storage.sync.set({ amountFilters: filters }, () => {
        amountInput.value = "";
        renderList(amountListEl, filters, removeAmount);
      });
    }
  });
}

function removeAmount(index) {
  chrome.storage.sync.get({ amountFilters: [] }, (data) => {
    const filters = data.amountFilters;
    filters.splice(index, 1);
    chrome.storage.sync.set({ amountFilters: filters }, () => {
      renderList(amountListEl, filters, removeAmount);
    });
  });
}

addWordBtn.addEventListener("click", addWord);
wordInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addWord();
});

addAmountBtn.addEventListener("click", addAmount);
amountInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addAmount();
});

// Inject content script into current tab and all its frames
async function injectAndRun() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id, allFrames: true },
      files: ["content.js"],
    });
  } catch (e) {
    console.log("Could not inject:", e);
  }
}

// Re-inject after adding/removing filters to ensure it runs
const origAddWord = addWord;
const origAddAmount = addAmount;

loadAll();
injectAndRun();
