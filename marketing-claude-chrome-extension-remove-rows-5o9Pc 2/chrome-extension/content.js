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
  rows.forEach((row) => {
    const text = row.textContent;

    for (const w of wordFilters) {
      if (matchesWord(text, w)) {
        row.remove();
        return;
      }
    }

    for (const a of amountFilters) {
      if (matchesAmount(text, a)) {
        row.remove();
        return;
      }
    }
  });

  // Remove empty dbp-posting-table elements (no <tr> rows left)
  const tables = document.querySelectorAll("dbp-posting-table");
  tables.forEach((table) => {
    if (table.querySelectorAll("tr").length === 0) {
      table.remove();
    }
  });

  startObserver();
}

function runFilter() {
  chrome.storage.sync.get({ wordFilters: [], amountFilters: [] }, (data) => {
    if (data.wordFilters.length === 0 && data.amountFilters.length === 0) return;
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
  if (changes.wordFilters || changes.amountFilters) {
    runFilter();
  }
});
