function removeMatchingRows(filterTexts) {
  if (!filterTexts || filterTexts.length === 0) return;

  const rows = document.querySelectorAll("tr");
  rows.forEach((row) => {
    const text = row.textContent;
    for (const filter of filterTexts) {
      if (text.includes(filter)) {
        row.remove();
        break;
      }
    }
  });
}

function runFilter() {
  chrome.storage.sync.get({ filterTexts: [] }, (data) => {
    removeMatchingRows(data.filterTexts);
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
  if (changes.filterTexts) {
    removeMatchingRows(changes.filterTexts.newValue);
  }
});
