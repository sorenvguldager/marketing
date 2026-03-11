function matchesFilter(text, filter) {
  const lowerText = text.toLowerCase();
  const lowerFilter = filter.toLowerCase();

  // Split on % to get the parts that must match
  const parts = lowerFilter.split("%").filter((p) => p !== "");

  if (parts.length === 0) return false;

  // If filter doesn't start with %, first part must match from the beginning
  const startsWild = lowerFilter.startsWith("%");
  // If filter doesn't end with %, last part must match at the end
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

function matchesDateFilter(text, dateFilter) {
  return text.toLowerCase().includes(dateFilter.toLowerCase());
}

function removeMatchingRows(filterTexts, dateFilters) {
  const rows = document.querySelectorAll("tr");
  rows.forEach((row) => {
    const text = row.textContent;

    if (filterTexts && filterTexts.length > 0) {
      for (const filter of filterTexts) {
        if (matchesFilter(text, filter)) {
          row.remove();
          return;
        }
      }
    }

    if (dateFilters && dateFilters.length > 0) {
      for (const df of dateFilters) {
        if (matchesDateFilter(text, df)) {
          row.remove();
          return;
        }
      }
    }
  });
}

function runFilter() {
  chrome.storage.sync.get({ filterTexts: [], dateFilters: [] }, (data) => {
    removeMatchingRows(data.filterTexts, data.dateFilters);
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
  if (changes.filterTexts || changes.dateFilters) {
    runFilter();
  }
});
