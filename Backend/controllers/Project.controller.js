const { Project, ProjectMember, User } = require("../models");

// ── CREATE A NEW PROJECT ──────────────────────────────────
const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Project name is required." });
    }

    const project = await Project.create({
      name,
      description,
      createdById: req.user.id,
    });

    await ProjectMember.create({
      projectId: project.id,
      userId: req.user.id,
      role: "admin",
    });

    return res.status(201).json({
      message: "Project created.",
      project,
    });
  } catch (err) {
    console.error("createProject error:", err);
    return res.status(500).json({
      message: "Could not create project.",
    });
  }
};

// ── GET MY PROJECTS ──────────────────────────────────
const getMyProjects = async (req, res) => {
  try {
    const memberships = await ProjectMember.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Project,
          as: "Project",
        },
      ],
    });

    const projects = memberships
      .filter((m) => m.Project)
      .map((m) => ({
        ...m.Project.toJSON(),
        myRole: m.role,
      }));

    return res.json(projects);
  } catch (err) {
    console.error("getMyProjects FULL ERROR:", err);
    return res.status(500).json({
      message: "Could not load projects.",
      detail: err.message,
    });
  }
};

// ── GET A SINGLE PROJECT ──────────────────────────────────
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [
        {
          model: ProjectMember,
          as: "members",
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "name", "email"],
            },
          ],
        },
      ],
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found.",
      });
    }

    const membership = await ProjectMember.findOne({
      where: {
        projectId: req.params.id,
        userId: req.user.id,
      },
    });

    if (!membership) {
      return res.status(403).json({
        message: "You are not a member of this project.",
      });
    }

    return res.json({
      ...project.toJSON(),
      myRole: membership.role,
    });
  } catch (err) {
    console.error("getProjectById error:", err);
    return res.status(500).json({
      message: "Could not load project.",
    });
  }
};

// ── INVITE A USER TO A PROJECT ──────────────────────────────────
const inviteMember = async (req, res) => {
  try {
    const { email, role } = req.body;
    const projectId = req.params.id;

    const caller = await ProjectMember.findOne({
      where: {
        projectId,
        userId: req.user.id,
      },
    });

    if (!caller || caller.role !== "admin") {
      return res.status(403).json({
        message: "Only project admins can invite members.",
      });
    }

    const user = await User.findOne({
      where: {
        email,
        isActive: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "No active user found with that email.",
      });
    }

    const existing = await ProjectMember.findOne({
      where: {
        projectId,
        userId: user.id,
      },
    });

    if (existing) {
      return res.status(400).json({
        message: "User is already a member of this project.",
      });
    }

    await ProjectMember.create({
      projectId,
      userId: user.id,
      role: role || "collaborator",
    });

    return res.status(201).json({
      message: "Member added to project.",
    });
  } catch (err) {
    console.error("inviteMember error:", err);
    return res.status(500).json({
      message: "Could not add member.",
    });
  }
};

// ── UPDATE A MEMBER'S ROLE ──────────────────────────────────
const updateMemberRole = async (req, res) => {
  try {
    const { id: projectId, userId } = req.params;
    const { role } = req.body;
    const caller = await ProjectMember.findOne({
      where: {
        projectId,
        userId: req.user.id,
      },
    });

    if (!caller || caller.role !== "admin") {
      return res.status(403).json({
        message: "Only project admins can change roles.",
      });
    }

    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({
        message: "You cannot change your own role.",
      });
    }

    const member = await ProjectMember.findOne({
      where: {
        projectId,
        userId,
      },
    });

    if (!member) {
      return res.status(404).json({
        message: "Member not found.",
      });
    }

    await member.update({ role });

    return res.json({
      message: "Role updated.",
    });
  } catch (err) {
    console.error("updateMemberRole error:", err);
    return res.status(500).json({
      message: "Could not update role.",
    });
  }
};

// ── REMOVE A MEMBER FROM A PROJECT ──────────────────────────────────
const removeMember = async (req, res) => {
  try {
    const { id: projectId, userId } = req.params;

    const caller = await ProjectMember.findOne({
      where: {
        projectId,
        userId: req.user.id,
      },
    });

    if (!caller || caller.role !== "admin") {
      return res.status(403).json({
        message: "Only project admins can remove members.",
      });
    }

    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({
        message: "You cannot remove yourself from the project.",
      });
    }

    await ProjectMember.destroy({
      where: {
        projectId,
        userId,
      },
    });

    return res.json({
      message: "Member removed.",
    });
  } catch (err) {
    console.error("removeMember error:", err);
    return res.status(500).json({
      message: "Could not remove member.",
    });
  }
};

// ── DELETE PROJECT ──────────────────────────────────
 const deleteProject = async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const project = await Project.findByPk(id);
      if (!project) {
        return res.status(404).json({ error: 'Project not found.' });
      }
      
      const member = await ProjectMember.findOne({
        where: { projectId: id, userId }
      });
      if (!member || member.role !== 'admin') {
        return res.status(403).json({
          error: 'Only the project admin can delete this project.'
        });
      }
 
      await project.destroy();
      res.json({ message: 'Project deleted successfully.' });
    } catch (err) {
      console.error('deleteProject error:', err);
      res.status(500).json({ error: 'Server error.' });
    }
  };

module.exports = {
  createProject,
  getMyProjects,
  getProjectById,
  inviteMember,
  updateMemberRole,
  removeMember,
  deleteProject
};