let categoriesData = []; // Declare categoriesData in a higher scope
let worksData = []; // Declare worksData in a higher scope
let activeCategoryId = [];

export async function fetchCategories() {
  try {
    const response = await fetch("http://localhost:5678/api/categories");
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }
    categoriesData = await response.json(); // Assign the fetched data to categoriesData

    const filtersWrapper = document.querySelector(".filters-wrapper");
    filtersWrapper.innerHTML = ""; // Clear any existing buttons

    // Add "Tous" button
    const allButton = document.createElement("button");
    allButton.textContent = "Tous";
    allButton.classList.add("button");
    clickButton(allButton, showAllWorks);
    filtersWrapper.appendChild(allButton);

    // Add categories button
    categoriesData.forEach((category) => {
      const button = document.createElement("button");
      button.textContent = category.name;
      button.classList.add("button");
      clickButton(button, () => filterWorks(category.id)); // Attach click event listener
      filtersWrapper.appendChild(button);
    });

    return categoriesData; // Return the fetched categories
  } catch (error) {
    console.error("There has been a problem with your fetch operation:", error);
    return []; // Return an empty array in case of error
  }
}

export async function displayedWorks() {
  try {
    const response = await fetch("http://localhost:5678/api/works");
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }
    worksData = await response.json(); // Assign the fetched data to worksData

    updateGallery(worksData); // Display all works initially

    return worksData; // Return the fetched works
  } catch (error) {
    console.error("There has been a problem with your fetch operation:", error);
  }
}

function updateGallery(works) {
  const gallery = document.querySelector(".gallery");
  gallery.innerHTML = ""; // Clear existing works

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

function showAllWorks() {
  activeCategoryIds = []; // Reset active categories
  updateGallery(worksData); // Show all works
}

function filterWorks(categoryId) {
  if (activeCategoryId === categoryId) {
    // If the clicked category is already active, remove the filter
    activeCategoryId = null;
    updateGallery(worksData); // Display all works
  } else {
    // If a new category is clicked, apply the filter
    activeCategoryId = categoryId;
    const filteredWorks = worksData.filter(
      (work) => work.categoryId === categoryId
    );
    updateGallery(filteredWorks); // Display filtered works
  }
}

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
fetchCategories().then((categories) => {
  console.log("Fetched categories data:", categories); // Log categories data after the fetch operation completes
});

displayedWorks().then((works) => {
  console.log("Fetched works data:", works); // Log works data after the fetch operation completes
});
