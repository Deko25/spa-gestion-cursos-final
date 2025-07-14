// ==========================
// Constants
// ==========================

// API endpoints for courses and reservations
const API_CURSOS = "http://localhost:3000/cursos";
const API_RESERVAS = "http://localhost:3000/reservas";

// Simulated logged-in user ID
const USUARIO_ID = 1;

// ==========================
// Initialize dashboard based on user role
// ==========================
function dashboardInit() {
  const user = JSON.parse(sessionStorage.getItem("user"));
  if (!user) return;

  document.getElementById("user-info").innerText = `Bienvenido, ${user.nombre} (${user.rol})`;
  renderSidebar(user.rol);

  if (user.rol === "admin") {
    loadAdminCourses();
  } else {
    loadVisitorCourses();
  }
}

// ==========================
// Render sidebar based on role
// ==========================
function renderSidebar(role) {
  const sidebar = document.getElementById("sidebar");
  sidebar.innerHTML = role === "admin"
    ? `
      <a href="#/">Dashboard</a><br/>
      <button onclick="showCourseForm()">New Course</button>
    `
    : `<a href="#/">Available Courses</a>`;
}

// ==========================
// Load courses for admin with edit/delete
// ==========================
async function loadAdminCourses() {
  try {
    const response = await fetch(API_CURSOS);
    const courses = await response.json();
    const container = document.getElementById("app");

    container.innerHTML = `
      <h3>Courses</h3>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Capacity</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${courses.map(c => `
            <tr>
              <td>${c.titulo}</td>
              <td>${c.descripcion || ""}</td>
              <td>${c.capacidad || 0}</td>
              <td>${c.fecha || ""}</td>
              <td>
                <button class="edit-btn" data-id="${c.id}">Edit</button>
                <button class="delete-btn" data-id="${c.id}">Delete</button>
              </td>
            </tr>`).join("")}
        </tbody>
      </table>`;

    // Attach event listeners to buttons
    document.querySelectorAll(".edit-btn").forEach(btn => {
      btn.addEventListener("click", () => editCourse(btn.dataset.id));
    });

    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", () => deleteCourse(btn.dataset.id));
    });
  } catch (error) {
    console.error("Failed to load courses:", error);
  }
}

// ==========================
// Load courses for visitors (students)
// ==========================
async function loadVisitorCourses() {
  try {
    const [courseRes, reservationRes] = await Promise.all([
      fetch(API_CURSOS),
      fetch(API_RESERVAS)
    ]);

    const [courses, reservations] = await Promise.all([
      courseRes.json(),
      reservationRes.json()
    ]);

    const container = document.getElementById("app");
    container.innerHTML = "<h3>Available Courses</h3><ul></ul>";
    const list = container.querySelector("ul");

    courses.forEach(course => {
      const alreadyReserved = reservations.some(
        r => r.usuarioId === USUARIO_ID && r.cursoId === course.id
      );
      const isFull = course.capacidad <= 0;

      const li = document.createElement("li");

      const buttonText = alreadyReserved
        ? "Already Enrolled"
        : isFull
        ? "Full"
        : "Reserve";

      const buttonDisabled = alreadyReserved || isFull ? "disabled" : "";

      li.innerHTML = `
        <strong>${course.titulo}</strong> - Slots: ${course.capacidad} - Enrolled: ${course.inscritos}
        <button ${buttonDisabled} data-id="${course.id}">${buttonText}</button>
      `;

      list.appendChild(li);
    });

    // Add reservation handler to available buttons
    document.querySelectorAll("button[data-id]").forEach(btn => {
      btn.addEventListener("click", reserveCourse);
    });
  } catch (error) {
    console.error("Error loading courses or reservations:", error);
  }
}

// ==========================
// Reserve a course (for visitors)
// ==========================
async function reserveCourse(e) {
  const courseId = (e.target.dataset.id);

  try {
    // Check if already reserved
    const checkRes = await fetch(`${API_RESERVAS}?usuarioId=${USUARIO_ID}&cursoId=${courseId}`);
    const existing = await checkRes.json();

    if (existing.length > 0) {
      alert("You are already enrolled in this course.");
      return;
    }

    // Get course info
    const courseRes = await fetch(`${API_CURSOS}/${courseId}`);
    const course = await courseRes.json();

    if (course.capacidad <= 0) {
      alert("This course is already full.");
      return;
    }

    // Reserve course
    await fetch(API_RESERVAS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuarioId: USUARIO_ID, cursoId: courseId })
    });

    // Update course capacity and enrolled count
    await fetch(`${API_CURSOS}/${courseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        capacidad: course.capacidad - 1,
        inscritos: course.inscritos + 1
      })
    });

    alert("Successfully enrolled.");
    loadVisitorCourses(); // Refresh list
  } catch (error) {
    console.error("Error reserving course:", error);
  }
}

// ==========================
// Show form to add a new course
// ==========================
function showCourseForm() {
  const container = document.getElementById("app");
  container.innerHTML = `
    <h3>New Course</h3>
    <form id="course-form">
      <input type="text" id="titulo" placeholder="Course Title" required />
      <input type="text" id="descripcion" placeholder="Course Description" />
      <input type="number" id="capacidad" placeholder="Course Capacity" required />
      <input type="date" id="fecha" required />
      <button type="submit">Save</button>
    </form>`;

  // Handle form submission
  document.getElementById("course-form").addEventListener("submit", async e => {
    e.preventDefault();

    const titulo = document.getElementById("titulo").value;
    const descripcion = document.getElementById("descripcion").value;
    const capacidad = parseInt(document.getElementById("capacidad").value);
    const fecha = document.getElementById("fecha").value;

    try {
      await fetch(API_CURSOS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo, descripcion, capacidad, fecha })
      });

      alert("Course added successfully.");
      loadAdminCourses(); // Refresh list
    } catch (error) {
      console.error("Error creating course:", error);
    }
  });
}

// ==========================
// Edit an existing course
// ==========================
async function editCourse(id) {
  try {
    const res = await fetch(`${API_CURSOS}/${id}`);
    const course = await res.json();

    const container = document.getElementById("app");
    container.innerHTML = `
      <h3>Edit Course</h3>
      <form id="course-edit-form">
        <input type="text" id="tituloEdit" value="${course.titulo}" required />
        <input type="text" id="descripcionEdit" value="${course.descripcion || ""}" />
        <input type="number" id="capacidadEdit" value="${course.capacidad || 0}" required />
        <input type="date" id="fechaEdit" value="${course.fecha || ""}" required />
        <button type="submit">Update</button>
      </form>`;

    document.getElementById("course-edit-form").addEventListener("submit", async e => {
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

      alert("Course updated.");
      loadAdminCourses(); // Refresh list
    });
  } catch (error) {
    console.error("Error editing course:", error);
  }
}

// ==========================
// Delete a course
// ==========================
async function deleteCourse(id) {
  if (!confirm("Are you sure you want to delete this course?")) return;

  try {
    await fetch(`${API_CURSOS}/${id}`, { method: "DELETE" });
    alert("Course deleted.");
    loadAdminCourses(); // Refresh list
  } catch (error) {
    console.error("Error deleting course:", error);
  }
}

// ==========================
// Logout functionality
// ==========================
const logoutButton = document.getElementById("logout-button");
if (logoutButton) {
  logoutButton.addEventListener("click", () => {
    sessionStorage.removeItem("user");
    window.location.hash = "/login";
  });
}


// Entry point for visitors if no role logic applied

document.addEventListener("DOMContentLoaded", loadVisitorCourses);
