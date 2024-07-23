/* *** HANDLING LOG IN FORM *** */
export function logInHandling() {
  const loginForm = document.getElementById("loginForm");
  const errorMessage = document.getElementById("errorMessage");
  const modifyButton = document.getElementById("modifyButton");

  loginForm.addEventListener("submit", (event) => {
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
        localStorage.setItem("authToken", data.token);
        modifyButton.style.display = "flex";
        window.location.href = "./index.html";
      })
      .catch((error) => {
        console.error("Error during login:", error);
        errorMessage.style.display = "flex";
      });
  });
}
