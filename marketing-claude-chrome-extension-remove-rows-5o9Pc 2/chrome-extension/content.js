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

function matchesDate(text, dateFilter) {
  return text.toLowerCase().includes(dateFilter.toLowerCase());
}

function removeMatchingRows(combinedFilters) {
  if (!combinedFilters || combinedFilters.length === 0) return;

  const rows = document.querySelectorAll("tr");
  rows.forEach((row) => {
    const text = row.textContent;

    for (const filter of combinedFilters) {
      if (matchesWord(text, filter.word) && matchesDate(text, filter.date)) {
        row.remove();
        return;
      }
    }
  });
}

function runFilter() {
  chrome.storage.sync.get({ combinedFilters: [] }, (data) => {
    removeMatchingRows(data.combinedFilters);
  });
}

// Run on page load
runFilter();

// Re-run when DOM changes (for dynamically loaded content)
const observer = new MutationObserver(() => {
  runFilter();
});
observer.observe(document.body, { childList: true, subtree: true });

// Re-run when filter list is updated from popup
chrome.storage.onChanged.addListener((changes) => {
  if (changes.combinedFilters) {
    runFilter();
  }
});
