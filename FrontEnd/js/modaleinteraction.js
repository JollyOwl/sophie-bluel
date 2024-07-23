/* *** MODALE INTERACTION *** */
export function modaleInteraction() {
  const modale = document.getElementById("modale");
  const modaleContainer = document.getElementById("modaleContainer");

  function handleClickOutside(event) {
    // Check if the event.target was outside the .modale_container
    if (!modaleContainer.contains(event.target)) {
      modale.style.display = "none";
    }
  }

  // Add event listener (target) to the entire document
  document.addEventListener("click", handleClickOutside);
}
