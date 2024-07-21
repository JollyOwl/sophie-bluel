import { displayedWorks } from "./displayworks.js";

document.addEventListener("DOMContentLoaded", (event) => {
  fetchCategories();
  displayedWorks();
  clickButton();
});
