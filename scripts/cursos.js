const API_CURSOS = "http://localhost:3000/cursos";

function dashboardInit() {
  const user = JSON.parse(sessionStorage.getItem("user"));
  if (!user) return;
  document.getElementById("user-info").innerText = `Bienvenido, ${user.nombre} (${user.rol})`;
  renderSidebar(user.rol);
  if (user.rol === "admin") {
    cargarCursosAdmin();
  } else {
    cargarCursosVisitante();
  }
}

function renderSidebar(rol) {
  const sidebar = document.getElementById("sidebar");
  sidebar.innerHTML = rol === "admin" ? `
    <a href="#/">Dashboard</a><br/>
    <button onclick="mostrarFormularioCurso()">Nuevo Curso</button>
  ` : `<a href="#/">Cursos disponibles</a>`;
}

function cargarCursosAdmin() {
  fetch(API_CURSOS)
    .then(res => res.json())
    .then(cursos => {
      const contenedor = document.getElementById("app");
      contenedor.innerHTML = ` 
        <h3>Cursos</h3>
        <table>
          <thead>
            <tr>
              <th>Título</th>
              <th>Descripción</th>
              <th>Capacidad</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${cursos.map(c => `
              <tr>
                <td>${c.titulo}</td>
                <td>${c.descripcion || ""}</td>
                <td>${c.capacidad || ""}</td>
                <td>${c.fecha || ""}</td>
                <td>
                  <button class="editar-btn" data-id="${c.id}">Editar</button>
                  <button class="eliminar-btn" data-id="${c.id}">Eliminar</button>
                </td>
              </tr>`).join("")}
          </tbody>
        </table>`;

      // Ahora conectamos los botones dinámicamente
      document.querySelectorAll(".editar-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-id");
          editarCurso(id);
        });
      });

      document.querySelectorAll(".eliminar-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-id");
          eliminarCurso(id);
        });
      });
    });
}


function cargarCursosVisitante() {
  fetch(API_CURSOS)
    .then(res => res.json())
    .then(cursos => {
      const contenedor = document.getElementById("app");
      contenedor.innerHTML += `<h3>Cursos Disponibles</h3><ul>${
        cursos.map(c => `<li>${c.titulo}</li>`).join("")
      }</ul>`;
    });
}

function mostrarFormularioCurso() {
  const contenedor = document.getElementById("app");
  contenedor.innerHTML = `
    <h3>Nuevo Curso</h3>
    <form id="curso-form">
      <input type="text" id="titulo" placeholder="Título del curso" required />
      <input type="text" id="descripcion" placeholder="Descripción del curso" />
      <input type="number" id="capacidad" placeholder="Capacidad del curso" required />
      <input type="date" id="fecha" placeholder="Fecha del curso" required />
      <button type="submit">Guardar</button>
    </form>`;

  document.getElementById("curso-form").addEventListener("submit", async e => {
    e.preventDefault();

    const titulo = document.getElementById("titulo").value;
    const descripcion = document.getElementById("descripcion").value;
    const capacidad = parseInt(document.getElementById("capacidad").value);
    const fecha = document.getElementById("fecha").value;

    await fetch(API_CURSOS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titulo, descripcion, capacidad, fecha })
    });

    alert("Curso agregado");
    cargarCursosAdmin(); 
  });
}


function editarCurso(id) {
  fetch(`${API_CURSOS}/${id}`)
    .then(res => res.json())
    .then(curso => {
      const contenedor = document.getElementById("app");
      contenedor.innerHTML = `
        <h3>Editar Curso</h3>
        <form id="curso-edit-form">
          <input type="text" id="tituloEdit" value="${curso.titulo}" required />
          <input type="text" id="descripcionEdit" value="${curso.descripcion || ""}" />
          <input type="number" id="capacidadEdit" value="${curso.capacidad || 0}" required />
          <input type="date" id="fechaEdit" value="${curso.fecha || ""}" required />
          <button type="submit">Actualizar</button>
        </form>`;

      document.getElementById("curso-edit-form").addEventListener("submit", async e => {
        e.preventDefault();
        const titulo = document.getElementById("tituloEdit").value;
        const descripcion = document.getElementById("descripcionEdit").value;
        const capacidad = parseInt(document.getElementById("capacidadEdit").value);
        const fecha = document.getElementById("fechaEdit").value;

        await fetch(`${API_CURSOS}/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ titulo, descripcion, capacidad, fecha })
        });

        alert("Curso actualizado");
        location.reload();
      });
    });
}

function eliminarCurso(id) {
  if (!confirm("¿Deseas eliminar este curso?")) return;
  fetch(`${API_CURSOS}/${id}`, { method: "DELETE" })
    .then(() => {
      alert("Curso eliminado");
      location.reload();
    });
}


const logoutButton = document.getElementById("logout-button");
if (logoutButton) {
  logoutButton.addEventListener("click", () => {
    sessionStorage.removeItem("user");
    window.location.hash = "/login";
  });
}

