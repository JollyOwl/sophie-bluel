import { modaleInteraction } from "./modaleinteraction.js";
import { logInHandling } from "./login.js";
import { fetchWorksApi } from "./displayworks.js";

document.addEventListener("DOMContentLoaded", (event) => {
  modaleInteraction();
  logInHandling();
  fetchCategoriesApi();
  fetchWorksApi();
  clickButton();
});
