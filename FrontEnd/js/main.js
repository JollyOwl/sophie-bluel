document.addEventListener("DOMContentLoaded", () => {
  showModifyButton();

  // Variables to store fetched data
  let categoriesData = [];
  let worksData = [];
  let activeCategoryId = null;

  /* *** HANDLING LOG IN FORM *** */
  function logInHandling() {
    const loginForm = document.getElementById("loginForm");
    const errorMessage = document.getElementById("errorMessage");

    if (loginForm)
      loginForm.addEventListener("submit", (event) => {
        // prevent from reloading after form submission
        event.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        const loginData = {
          email: email,
          password: password,
        };

        fetch("http://localhost:5678/api/users/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(loginData),
        })
          .then((response) => {
            if (response.ok) {
              return response.json();
            } else if (response.status === 404 || response.status === 401) {
              throw new Error("Invalid credentials");
            } else {
              throw new Error("Unexpected error");
            }
          })
          .then((data) => {
            console.log("Login successful:", data);

            localStorage.setItem("authToken", data.token);

            window.location.href = "./index.html";
            showModifyButton();
          })
          .catch((error) => {
            console.error("Error during login:", error);
            errorMessage.style.display = "flex";
          });
      });
  }

  function closeModale(modale) {
    modale.style.display = "none";
  }

  /* *** MODALE INTERACTION *** */
  function modaleInteraction() {
    const modale = document.getElementById("modale");

    function handleClickOutside(event) {
      if (event.target.id == "modale") closeModale(modale);
    }
    function handleClickCloseIcon(event) {
      if (event.target.id == "close") closeModale(modale);
    }

    // Add event listener (target) to the entire document
    document.addEventListener("click", handleClickOutside);
    document.addEventListener("click", handleClickCloseIcon);
  }

  /* *** Data fetching functions *** */

  // Fetch categories from API & add them to buttons
  async function fetchCategoriesApi() {
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
      console.error(
        "There has been a problem with your fetch operation:",
        error
      );
      return []; // Return an empty array in case of error
    }
  }

  // Fetch works from API
  async function fetchWorksApi() {
    try {
      const response = await fetch("http://localhost:5678/api/works");
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      worksData = await response.json();

      populateGallery(worksData); // Display all works initially
      populateModaleGallery(worksData);

      return worksData;
    } catch (error) {
      console.error(
        "There has been a problem with your fetch operation:",
        error
      );
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

  function populateModaleGallery(works) {
    const modalePhotos = document.getElementById("modale_photos");
    if (!modalePhotos) {
      console.error("modale_photos element not found!");
      return;
    }
    console.log("populating modale photos");
    modalePhotos.innerHTML = ""; // Clear previous content

    works.forEach((work) => {
      const minifigure = document.createElement("figure");
      minifigure.classList.add("modale_photo_item");

      const minipic = document.createElement("img");
      minipic.src = work.imageUrl;
      minipic.alt = work.title;

      const trashicon = document.createElement("button");
      trashicon.classList.add("trashicon");
      trashicon.dataset.workId = work.id; // Store the work ID in a data attribute

      trashicon.innerHTML =
        '<span class="material-symbols-outlined">delete</span>';

      minifigure.appendChild(minipic);
      minifigure.appendChild(trashicon);

      modalePhotos.appendChild(minifigure);
    });
  }

  // Function to delete works using event delegation
  function deleteWorks() {
    const modalePhotos = document.getElementById("modale_photos");
    if (!modalePhotos) {
      console.error("modale_photos element not found!");
      return;
    }

    modalePhotos.addEventListener("click", async (event) => {
      const deleteButton = event.target.closest(".trashicon");
      if (deleteButton) {
        const workId = deleteButton.dataset.workId;
        const url = `http://localhost:5678/api/works/${workId}`;

        const token = localStorage.getItem("authToken");

        try {
          const response = await fetch(url, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          if (response.ok) {
            console.log("Item Deleted");
            worksData = worksData.filter((work) => work.id != workId);
            populateGallery(worksData);
            deleteButton.parentElement.remove();
          } else {
            console.error(
              "Delete request failed:",
              response.status,
              response.statusText
            );
          }
        } catch (error) {
          console.error("Error during deletion:", error);
        }
      }
    });
  }

  // Function to create works
  function createWorks() {
    const submitWorkButton = document.getElementById("submit-work");
    const modaleGalerie = document.querySelector(".modale_galerie");
    const modaleAjoutphoto = document.querySelector(".modale_ajoutphoto");
    const workForm = document.getElementById("work-form");

    submitWorkButton.addEventListener("click", () => {
      modaleGalerie.style.display = "none";
      modaleAjoutphoto.style.display = "flex";
    });

    workForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      // Retrieve form data
      const title = document.getElementById("work-name").value;
      const category = document.getElementById("work-category").value;
      const imageFile = document.getElementById("work-image").files[0];

      // Validate image file format and size
      if (!validateFile(imageFile)) return;

      // Create a new FormData object
      const formData = new FormData();
      formData.append("title", title);
      formData.append("category", category);
      formData.append("image", imageFile);

      const token = localStorage.getItem("authToken");

      try {
        const response = await fetch("http://localhost:5678/api/works", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            // 'Content-Type' should not be set when using FormData
          },
          body: formData,
        });

        if (response.ok) {
          const newWork = await response.json();
          worksData.push(newWork);
          populateGallery(worksData);
          populateModaleGallery(worksData);
          modaleAjoutphoto.style.display = "none";
          modaleGalerie.style.display = "flex";
        } else {
          console.error("Error adding work:", response.statusText);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    });
  }

  // Validate file format and size

  function validateFile(file) {
    const maxFileSize = 4 * 1024 * 1024; // 4 MB in bytes
    const allowedExtensions = ["png", "jpg"];
    const fileExtension = file.name.split(".").pop().toLowerCase();
    const errorMessageElement = document.getElementById("error-message"); // Assuming you have an element with this ID

    // Clear previous error messages
    errorMessageElement.textContent = "";

    // Check for allowed file extensions
    if (!allowedExtensions.includes(fileExtension)) {
      errorMessageElement.textContent =
        "Only .png and .jpg formats are allowed.";
      return false;
    }

    // Check for maximum file size
    if (file.size > maxFileSize) {
      errorMessageElement.textContent = "File size must not exceed 4 MB.";
      return false;
    }

    return true;
  }

  /*  *** FILTER FUNCTIONS *** */

  // function called to reset the filter and show all works.
  function showAllWorks() {
    activeCategoryId = null; // Reset to empty array to indicate no active filters
    populateGallery(worksData);
    populateModaleGallery(worksData);
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
      populateModaleGallery(filteredWorks);
    }
  }

  /*  *** EVENT HANDLING FUNCTIONS *** */

  // buttons event handling : update .clicked class and call showFilteredWorks or showAllWorks
  function clickButton(button, filterFunction) {
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

  /* *** HANDLING MODIFY BUTTON *** */
  function showModifyButton() {
    const modifyButton = document.getElementById("modifyButton");
    const authToken = localStorage.getItem("authToken");
    const modale = document.getElementById("modale");
    //console.log(authToken);
    if (authToken) {
      modifyButton.style.display = "flex";

      // Add event listener to the modify button to show the modale
      modifyButton.addEventListener("click", () => {
        modale.style.display = "flex";
      });
    }
  }

  // Call the functions to initiate the fetches
  fetchCategoriesApi().then((categories) => {
    console.log("Fetched categories data:", categories);
  });

  fetchWorksApi().then((works) => {
    console.log("Fetched works data:", works);
    deleteWorks(); // Ensure deleteWorks is called after works are fetched and populated
  });

  modaleInteraction();
  logInHandling();
  createWorks();
});
