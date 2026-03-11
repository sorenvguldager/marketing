const listEl = document.getElementById("filterList");
const wordInput = document.getElementById("newWord");
const dateInput = document.getElementById("newDate");
const addBtn = document.getElementById("addBtn");

function render(combinedFilters) {
  listEl.innerHTML = "";
  if (combinedFilters.length === 0) {
    listEl.innerHTML = '<li class="empty">Ingen filtre tilføjet endnu</li>';
    return;
  }
  combinedFilters.forEach((filter, i) => {
    const li = document.createElement("li");
    const span = document.createElement("span");
    span.textContent = filter.word + "  +  " + filter.date;
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
  chrome.storage.sync.get({ combinedFilters: [] }, (data) => {
    render(data.combinedFilters);
  });
}

function addFilter() {
  const word = wordInput.value.trim();
  const date = dateInput.value.trim();
  if (!word || !date) return;
  chrome.storage.sync.get({ combinedFilters: [] }, (data) => {
    const filters = data.combinedFilters;
    const exists = filters.some((f) => f.word === word && f.date === date);
    if (!exists) {
      filters.push({ word, date });
      chrome.storage.sync.set({ combinedFilters: filters }, () => {
        wordInput.value = "";
        dateInput.value = "";
        render(filters);
      });
    }
  });
}

function removeFilter(index) {
  chrome.storage.sync.get({ combinedFilters: [] }, (data) => {
    const filters = data.combinedFilters;
    filters.splice(index, 1);
    chrome.storage.sync.set({ combinedFilters: filters }, () => {
      render(filters);
    });
  });
}

addBtn.addEventListener("click", addFilter);
wordInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addFilter();
});
dateInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addFilter();
});

loadFilters();
