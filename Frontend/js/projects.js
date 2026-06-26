document.addEventListener("DOMContentLoaded", () => {
  requireAuth();
  renderSidebar("projects");

  // ── LOAD PROJECTS ─────────────────────────────────────────
  async function loadProjects() {
    try {
      const projects = await projectAPI.getAll();
      const grid = document.getElementById("projectsGrid");

      if (projects.length === 0) {
        grid.innerHTML = `
          <div class="empty-state" style="grid-column:1/-1">
            <div class="empty-icon">📁</div>
            <div class="empty-title">No projects yet</div>
            <div class="empty-desc">Create your first project to get started.</div>
          </div>`;
        return;
      }

      grid.innerHTML = projects.map(p => `
    <div class="card" style="position:relative; display:flex; flex-direction:column; justify-content:space-between;">
      <div style="cursor:pointer;"
           onclick="window.location.href='project-detail.html?projectId=${p.id}'">
        <div style="font-size:18px; font-weight:700; margin-bottom:6px;">${p.name}</div>
        <div style="font-size:13px; color:var(--text-muted); margin-bottom:12px;">
          ${p.description || "No description"}
        </div>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; gap:10px;">
        <span class="badge badge-${p.myRole}">${p.myRole.replace("_", " ")}</span>
        ${p.myRole === 'admin' ? `
          <button class="btn btn-danger btn-sm"
            onclick="event.stopPropagation(); deleteProject('${p.id}')">
            Delete
          </button>
        ` : ''}
      </div>
    </div>
  `).join("");
    } catch (err) {
      document.getElementById("pageError").textContent = err.message;
      document.getElementById("pageError").classList.add("show");
    }
  }

  document.getElementById("createProjectBtn").addEventListener("click", () => {
    document.getElementById("createProjectModal").classList.add("show");
  });

  document.getElementById("closeProjectModal").addEventListener("click", () => {
    document.getElementById("createProjectModal").classList.remove("show");
  });

  document.getElementById("saveProjectBtn").addEventListener("click", async () => {
    const name = document.getElementById("projectName").value.trim();
    const description = document.getElementById("projectDesc").value.trim();
    const errEl = document.getElementById("projectModalError");
    errEl.classList.remove("show");

    if (!name) {
      errEl.textContent = "Project name is required.";
      errEl.classList.add("show");
      return;
    }

    try {
      await projectAPI.create({ name, description });
      document.getElementById("createProjectModal").classList.remove("show");
      document.getElementById("projectName").value = "";
      document.getElementById("projectDesc").value = "";
      loadProjects();
    } catch (err) {
      errEl.textContent = err.message;
      errEl.classList.add("show");
    }
  });

  window.deleteProject = async function (id) {
    const ok = await appConfirm(
      'Delete Project?',
      'This will permanently delete the project and all its tasks. This cannot be undone.',
      'Delete'
    );
    if (!ok) return;
    try {
      await projectAPI.delete(id);
      showToast('Success', 'Project deleted.', 'success');
      loadProjects();
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  };


  loadProjects();
});
