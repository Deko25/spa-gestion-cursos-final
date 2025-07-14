// Listen for changes in the URL hash (e.g., #/dashboard or #/login)
window.addEventListener("hashchange", () => {
  route(); // Trigger routing function when hash changes
});

// Also call routing function when the page initially loads
window.addEventListener("load", () => {
  route();
});

// Routing function that determines what view to show based on the URL hash
function route() {
  // Get the current path from the hash, remove the "#" symbol
  const path = location.hash.slice(1) || "/";

  // If user is not logged in and is not trying to access login or register,
  // redirect to the login view
  if (!sessionStorage.getItem("user") && path !== "/login" && path !== "/register") {
    return loadView("login");
  }

  // If the path is "/", load the dashboard view
  if (path === "/") return loadView("dashboard");

  // Otherwise, load the corresponding view by removing the "/" prefix
  loadView(path.replace("/", ""));
}

// Load the HTML content of a view and insert it into the main container
function loadView(view) {
  fetch(`views/${view}.html`) // Fetch the view file from the "views" folder
    .then(res => res.text()) // Convert the response to text (HTML)
    .then(html => {
      // Insert the HTML into the element with ID "app"
      document.getElementById("app").innerHTML = html;

      // If there's an init function for the view (e.g., dashboardInit), run it
      if (window[`${view}Init`]) window[`${view}Init`]();
    });
}
