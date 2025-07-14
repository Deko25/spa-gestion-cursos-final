const API = "http://localhost:3000/usuarios";

function loginInit() {
  document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const res = await fetch(`${API}?email=${email}&password=${password}`);
    const data = await res.json();
    if (data.length) {
      sessionStorage.setItem("user", JSON.stringify(data[0]));
      location.hash = "/";
    } else {
      alert("Credenciales incorrectas");
    }
  });
}

function registerInit() {
  document.getElementById("register-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const nombre = document.getElementById("nombre").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const rol = document.getElementById("rol").value;
    const nuevo = { nombre, email, password, rol };
    await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevo)
    });
    alert("Registro exitoso");
    location.hash = "/login";
  });
}
