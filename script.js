"use strict";

const filters = document.querySelector(".project-filters");
const cards = [...document.querySelectorAll(".project-card")];
const status = document.querySelector("#filter-status");

if (filters && cards.length && status) {
  filters.hidden = false;
  filters.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-filter]");
    if (!button || !filters.contains(button)) return;
    const category = button.dataset.filter;
    filters.querySelectorAll("button").forEach((item) => {
      item.setAttribute("aria-pressed", String(item === button));
    });
    let count = 0;
    cards.forEach((card) => {
      card.hidden = category !== "all" && !card.dataset.category.split(" ").includes(category);
      if (!card.hidden) count++;
    });
    status.textContent = `${count} ${count === 1 ? "project" : "projects"} shown.`;
  });
}

const year = document.querySelector("#year");
if (year) year.textContent = String(new Date().getFullYear());
