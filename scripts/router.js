window.addEventListener("hashchange", () => {
  route();
});
window.addEventListener("load", () => {
  route();
});

function route() {
  const path = location.hash.slice(1) || "/";
  if (!sessionStorage.getItem("user") && path !== "/login" && path !== "/register") {
    return loadView("login");
  }
  if (path === "/") return loadView("dashboard");
  loadView(path.replace("/", ""));
}

function loadView(view) {
  fetch(`views/${view}.html`)
    .then(res => res.text())
    .then(html => {
      document.getElementById("app").innerHTML = html;
      if (window[`${view}Init`]) window[`${view}Init`]();
    });
}