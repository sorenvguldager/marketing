const listEl = document.getElementById("filterList");
const input = document.getElementById("newFilter");
const addBtn = document.getElementById("addBtn");

function render(filterTexts) {
  listEl.innerHTML = "";
  if (filterTexts.length === 0) {
    listEl.innerHTML = '<li class="empty">Ingen filtre tilføjet endnu</li>';
    return;
  }
  filterTexts.forEach((text, i) => {
    const li = document.createElement("li");
    const span = document.createElement("span");
    span.textContent = text;
    const btn = document.createElement("button");
    btn.className = "remove-btn";
    btn.textContent = "\u00d7";
    btn.addEventListener("click", () => removeFilter(i));
    li.appendChild(span);
    li.appendChild(btn);
    listEl.appendChild(li);
  });
}

function loadFilters() {
  chrome.storage.sync.get({ filterTexts: [] }, (data) => {
    render(data.filterTexts);
  });
}

function addFilter() {
  const value = input.value.trim();
  if (!value) return;
  chrome.storage.sync.get({ filterTexts: [] }, (data) => {
    const filters = data.filterTexts;
    if (!filters.includes(value)) {
      filters.push(value);
      chrome.storage.sync.set({ filterTexts: filters }, () => {
        input.value = "";
        render(filters);
      });
    }
  });
}

function removeFilter(index) {
  chrome.storage.sync.get({ filterTexts: [] }, (data) => {
    const filters = data.filterTexts;
    filters.splice(index, 1);
    chrome.storage.sync.set({ filterTexts: filters }, () => {
      render(filters);
    });
  });
}

addBtn.addEventListener("click", addFilter);
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addFilter();
});

loadFilters();
