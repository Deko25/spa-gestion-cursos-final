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
      contenedor.innerHTML += `<h3>Cursos</h3><table><thead><tr><th>Título</th><th>Acciones</th></tr></thead><tbody>${
        cursos.map(c => `<tr><td>${c.titulo}</td><td>
          <button onclick="editarCurso(${c.id})">Editar</button>
          <button onclick="eliminarCurso(${c.id})">Eliminar</button>
        </td></tr>`).join("")
      }</tbody></table>`;
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
  contenedor.innerHTML += `
    <h3>Nuevo Curso</h3>
    <form id="curso-form">
      <input type="text" id="titulo" placeholder="Título del curso" required />
      <button type="submit">Guardar</button>
    </form>`;

  document.getElementById("curso-form").addEventListener("submit", async e => {
    e.preventDefault();
    const titulo = document.getElementById("titulo").value;
    await fetch(API_CURSOS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titulo })
    });
    alert("Curso agregado");
    location.reload();
  });
}

function editarCurso(id) {
  fetch(`${API_CURSOS}/${id}`)
    .then(res => res.json())
    .then(curso => {
      const contenedor = document.getElementById("app");
      contenedor.innerHTML += `
        <h3>Editar Curso</h3>
        <form id="curso-edit-form">
          <input type="text" id="tituloEdit" value="${curso.titulo}" required />
          <button type="submit">Actualizar</button>
        </form>`;
      document.getElementById("curso-edit-form").addEventListener("submit", async e => {
        e.preventDefault();
        const titulo = document.getElementById("tituloEdit").value;
        await fetch(`${API_CURSOS}/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ titulo })
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
