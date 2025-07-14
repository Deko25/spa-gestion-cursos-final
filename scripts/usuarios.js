const API_USUARIOS = "http://localhost:3000/usuarios";

function cargarUsuariosAdmin() {
  fetch(API_USUARIOS)
    .then(res => res.json())
    .then(usuarios => {
      const contenedor = document.getElementById("app");
      contenedor.innerHTML += `<h3>Usuarios</h3><table><thead><tr><th>Nombre</th><th>Email</th><th>Rol</th><th>Acciones</th></tr></thead><tbody>${
        usuarios.map(u => `<tr><td>${u.nombre}</td><td>${u.email}</td><td>${u.rol}</td><td>
          <button onclick="editarUsuario(${u.id})">Editar</button>
          <button onclick="eliminarUsuario(${u.id})">Eliminar</button>
        </td></tr>`).join("")
      }</tbody></table>`;
    });
}

function mostrarFormularioUsuario() {
  const contenedor = document.getElementById("app");
  contenedor.innerHTML += `
    <h3>Nuevo Usuario</h3>
    <form id="usuario-form">
      <input type="text" id="nombre" placeholder="Nombre" required />
      <input type="email" id="email" placeholder="Email" required />
      <input type="password" id="password" placeholder="Contraseña" required />
      <select id="rol" required>
        <option value="admin">Administrador</option>
        <option value="visitante">Visitante</option>
      </select>
      <button type="submit">Guardar</button>
    </form>`;

  document.getElementById("usuario-form").addEventListener("submit", async e => {
    e.preventDefault();
    const usuario = {
      nombre: document.getElementById("nombre").value,
      email: document.getElementById("email").value,
      password: document.getElementById("password").value,
      rol: document.getElementById("rol").value
    };
    await fetch(API_USUARIOS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(usuario)
    });
    alert("Usuario creado");
    location.reload();
  });
}

function editarUsuario(id) {
  fetch(`${API_USUARIOS}/${id}`)
    .then(res => res.json())
    .then(usuario => {
      const contenedor = document.getElementById("app");
      contenedor.innerHTML += `
        <h3>Editar Usuario</h3>
        <form id="usuario-edit-form">
          <input type="text" id="nombreEdit" value="${usuario.nombre}" required />
          <input type="email" id="emailEdit" value="${usuario.email}" required />
          <input type="password" id="passwordEdit" placeholder="Nueva contraseña" />
          <select id="rolEdit" required>
            <option value="admin" ${usuario.rol === "admin" ? "selected" : ""}>Administrador</option>
            <option value="visitante" ${usuario.rol === "visitante" ? "selected" : ""}>Visitante</option>
          </select>
          <button type="submit">Actualizar</button>
        </form>`;

      document.getElementById("usuario-edit-form").addEventListener("submit", async e => {
        e.preventDefault();
        const actualizado = {
          nombre: document.getElementById("nombreEdit").value,
          email: document.getElementById("emailEdit").value,
          password: document.getElementById("passwordEdit").value || usuario.password,
          rol: document.getElementById("rolEdit").value
        };
        await fetch(`${API_USUARIOS}/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(actualizado)
        });
        alert("Usuario actualizado");
        location.reload();
      });
    });
}

function eliminarUsuario(id) {
  if (!confirm("¿Deseas eliminar este usuario?")) return;
  fetch(`${API_USUARIOS}/${id}`, { method: "DELETE" })
    .then(() => {
      alert("Usuario eliminado");
      location.reload();
    });
}
