const listEl = document.getElementById("filterList");
const input = document.getElementById("newFilter");
const addBtn = document.getElementById("addBtn");

const dateListEl = document.getElementById("dateFilterList");
const dateInput = document.getElementById("newDateFilter");
const addDateBtn = document.getElementById("addDateBtn");

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

function renderDateFilters(dateFilters) {
  dateListEl.innerHTML = "";
  if (dateFilters.length === 0) {
    dateListEl.innerHTML = '<li class="empty">Ingen datofiltre tilføjet endnu</li>';
    return;
  }
  dateFilters.forEach((text, i) => {
    const li = document.createElement("li");
    const span = document.createElement("span");
    span.textContent = text;
    const btn = document.createElement("button");
    btn.className = "remove-btn";
    btn.textContent = "\u00d7";
    btn.addEventListener("click", () => removeDateFilter(i));
    li.appendChild(span);
    li.appendChild(btn);
    dateListEl.appendChild(li);
  });
}

function loadFilters() {
  chrome.storage.sync.get({ filterTexts: [], dateFilters: [] }, (data) => {
    render(data.filterTexts);
    renderDateFilters(data.dateFilters);
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

function addDateFilter() {
  const value = dateInput.value.trim();
  if (!value) return;
  chrome.storage.sync.get({ dateFilters: [] }, (data) => {
    const filters = data.dateFilters;
    if (!filters.includes(value)) {
      filters.push(value);
      chrome.storage.sync.set({ dateFilters: filters }, () => {
        dateInput.value = "";
        renderDateFilters(filters);
      });
    }
  });
}

function removeDateFilter(index) {
  chrome.storage.sync.get({ dateFilters: [] }, (data) => {
    const filters = data.dateFilters;
    filters.splice(index, 1);
    chrome.storage.sync.set({ dateFilters: filters }, () => {
      renderDateFilters(filters);
    });
  });
}

addBtn.addEventListener("click", addFilter);
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addFilter();
});

addDateBtn.addEventListener("click", addDateFilter);
dateInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addDateFilter();
});

loadFilters();
