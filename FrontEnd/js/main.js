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
    modalePhotos.addEventListener("click", async (event) => {
      if (event.target.closest(".trashicon")) {
        const deleteButton = event.target.closest(".trashicon");
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

            // Remove the deleted work from worksData
            worksData = worksData.filter((work) => work.id != workId);

            // Update the main gallery
            populateGallery(worksData);

            // Optionally, remove the element from the DOM in the modal
            deleteButton.parentElement.remove();
          } else if (response.status === 401) {
            console.log("Unauthorized");
          } else if (response.status === 500) {
            console.log("Unexpected Behaviour");
          } else {
            console.log("Error:", response.statusText);
          }
        } catch (error) {
          console.error("Error:", error);
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

      // Crée un nouvel objet FormData
      const formData = new FormData();

      // Récupère les données du formulaire
      const title = document.getElementById("work-name").value;
      const category = document.getElementById("work-category").value;
      const imageFile = document.getElementById("work-image").files[0]; // Le fichier image

      // Ajoute les données au FormData
      formData.append("title", title);
      formData.append("category", category);
      formData.append("image", imageFile); // Ajoute l'image

      const token = localStorage.getItem("authToken");

      try {
        const response = await fetch("http://localhost:5678/api/works", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            // 'Content-Type' ne doit pas être défini ici car FormData s'en charge automatiquement
          },
          body: formData, // Envoie l'objet FormData
        });

        if (response.ok) {
          const newWork = await response.json();
          worksData.push(newWork); // Ajoute la nouvelle œuvre aux données
          populateGallery(worksData); // Met à jour la galerie avec la nouvelle œuvre
          populateModaleGallery(worksData); // Met à jour la modale avec la nouvelle œuvre
          modaleAjoutphoto.style.display = "none"; // Ferme la modale d'ajout
          modaleGalerie.style.display = "flex"; // Affiche la galerie de la modale
        } else {
          console.error(
            "Erreur lors de l'ajout de l'œuvre :",
            response.statusText
          );
        }
      } catch (error) {
        console.error("Erreur :", error);
      }
    });
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
