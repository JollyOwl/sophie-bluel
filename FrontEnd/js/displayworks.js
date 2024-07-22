let categoriesData = [];
let worksData = [];
let activeCategoryId = []; // Declare activeCategoryId and initialize it to null

/*  *** DATA FETCHING FUNCTIONs *** */

// Fetch categories from API & add them to buttons
export async function fetchCategoriesApi() {
  try {
    const response = await fetch("http://localhost:5678/api/categories");
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }
    categoriesData = await response.json();

    const filtersWrapper = document.querySelector(".filters-wrapper");
    filtersWrapper.innerHTML = "";

    // Add "Tous" button
    const allButton = document.createElement("button");
    allButton.textContent = "Tous";
    allButton.classList.add("button");
    // apply event handling to default "Tous" button + show all works in the gallery
    clickButton(allButton, showAllWorks);
    filtersWrapper.appendChild(allButton);

    // Add categories button
    categoriesData.forEach((category) => {
      const button = document.createElement("button");
      button.textContent = category.name;
      button.classList.add("button");
      // apply event handling + show the gallery with filtered works based on button category
      clickButton(button, () => showFilteredWorks(category.id));
      filtersWrapper.appendChild(button);
    });

    return categoriesData;
  } catch (error) {
    console.error("There has been a problem with your fetch operation:", error);
    return []; // Return an empty array in case of error
  }
}

// Fetch works from API
export async function fetchWorksApi() {
  try {
    const response = await fetch("http://localhost:5678/api/works");
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }
    worksData = await response.json();

    populateGallery(worksData); // Display all works initially

    return worksData;
  } catch (error) {
    console.error("There has been a problem with your fetch operation:", error);
  }
}

/*  *** GALLERY UPDATE FUNCTION *** */

// called when the page load or when a filter is applied/reset
function populateGallery(works) {
  const gallery = document.querySelector(".gallery");
  gallery.innerHTML = ""; // clear to avoid the mix of previously displayed works and new filtered works.

  works.forEach((work) => {
    const figure = document.createElement("figure");

    const img = document.createElement("img");
    img.src = work.imageUrl;
    img.alt = work.title;

    const figcaption = document.createElement("figcaption");
    figcaption.textContent = work.title;

    figure.appendChild(img);
    figure.appendChild(figcaption);

    gallery.appendChild(figure);
  });
}

/*  *** FILTER FUNCTIONS *** */

// function called to reset the filter and show all works.
function showAllWorks() {
  activeCategoryId = null; // Reset to empty array to indicate no active filters
  populateGallery(worksData);
}

// function called to filter the works based on the selected category
function showFilteredWorks(categoryId) {
  if (activeCategoryId === categoryId) {
    activeCategoryId = null;
    populateGallery(worksData);
  } else {
    activeCategoryId = categoryId;
    const filteredWorks = worksData.filter(
      (work) => work.categoryId === categoryId
    );
    populateGallery(filteredWorks);
  }
}

/*  *** EVENT HANDLING FUNCTION *** */

// buttons event handling : update .clicked class and call showFilteredWorks or showAllWorks
export function clickButton(button, filterFunction) {
  button.addEventListener("click", function () {
    // Remove "clicked" class from all buttons
    const buttons = document.querySelectorAll(".filters-wrapper .button");
    buttons.forEach((btn) => btn.classList.remove("clicked"));

    // Add "clicked" class to the clicked button
    this.classList.add("clicked");

    if (filterFunction) {
      filterFunction();
    }
  });
}

// Call the functions to initiate the fetches
fetchCategoriesApi().then((categories) => {
  console.log("Fetched categories data:", categories); // Log categories data after the fetch operation completes
});

fetchWorksApi().then((works) => {
  console.log("Fetched works data:", works); // Log works data after the fetch operation completes
});
