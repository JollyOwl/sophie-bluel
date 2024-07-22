import { fetchWorksApi } from "./displayworks.js";

document.addEventListener("DOMContentLoaded", (event) => {
  fetchCategoriesApi();
  fetchWorksApi();
  clickButton();
});
