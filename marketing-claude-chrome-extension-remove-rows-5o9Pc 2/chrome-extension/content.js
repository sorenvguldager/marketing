console.log("[RowFilter] Content script loaded");

function matchesWord(text, filter) {
  const lowerText = text.toLowerCase();
  const lowerFilter = filter.toLowerCase();

  const parts = lowerFilter.split("%").filter((p) => p !== "");
  if (parts.length === 0) return false;

  const startsWild = lowerFilter.startsWith("%");
  const endsWild = lowerFilter.endsWith("%");

  let pos = 0;
  for (let i = 0; i < parts.length; i++) {
    const idx = lowerText.indexOf(parts[i], pos);
    if (idx === -1) return false;
    if (i === 0 && !startsWild && idx !== 0) return false;
    pos = idx + parts[i].length;
  }
  if (!endsWild && pos !== lowerText.length) return false;

  return true;
}

function matchesAmount(text, amount) {
  const normalized = text.replace(/\s+/g, " ");
  return normalized.includes(amount);
}

function removeMatchingRows(wordFilters, amountFilters) {
  observer.disconnect();

  const rows = document.querySelectorAll("tr");
  console.log("[RowFilter] Found " + rows.length + " rows");
  console.log("[RowFilter] Word filters:", wordFilters);
  console.log("[RowFilter] Amount filters:", amountFilters);

  let removed = 0;
  rows.forEach((row) => {
    const text = row.textContent;

    for (const w of wordFilters) {
      if (matchesWord(text, w)) {
        console.log("[RowFilter] WORD MATCH - removing row:", w, text.substring(0, 80));
        row.remove();
        removed++;
        return;
      }
    }

    for (const a of amountFilters) {
      if (matchesAmount(text, a)) {
        console.log("[RowFilter] AMOUNT MATCH - removing row:", a, text.substring(0, 80));
        row.remove();
        removed++;
        return;
      }
    }
  });

  console.log("[RowFilter] Removed " + removed + " rows");
  startObserver();
}

function runFilter() {
  chrome.storage.sync.get({ wordFilters: [], amountFilters: [] }, (data) => {
    if (data.wordFilters.length === 0 && data.amountFilters.length === 0) {
      console.log("[RowFilter] No filters set");
      return;
    }
    removeMatchingRows(data.wordFilters, data.amountFilters);
  });
}

const observer = new MutationObserver(() => {
  runFilter();
});

function startObserver() {
  observer.observe(document.body, { childList: true, subtree: true });
}

runFilter();
startObserver();

chrome.storage.onChanged.addListener((changes) => {
  console.log("[RowFilter] Storage changed:", changes);
  if (changes.wordFilters || changes.amountFilters) {
    runFilter();
  }
});
