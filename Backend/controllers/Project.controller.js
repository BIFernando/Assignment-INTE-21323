const { Project, ProjectMember, User } = require("../models");

// Create a new project — creator becomes admin
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

    // Creator becomes admin of the project
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

// Get all projects the logged-in user belongs to
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

// Get a single project with its members
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

    // Check caller is a member of this project
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

// Invite a user to a project by email
const inviteMember = async (req, res) => {
  try {
    const { email, role } = req.body;
    const projectId = req.params.id;

    // Check caller is project admin
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

    // Find active user by email
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

    // Check not already a member
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

// Update a member's role within a project
const updateMemberRole = async (req, res) => {
  try {
    const { id: projectId, userId } = req.params;
    const { role } = req.body;

    // Check caller is project admin
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

    // Cannot change your own role
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

// Remove a member from a project
const removeMember = async (req, res) => {
  try {
    const { id: projectId, userId } = req.params;

    // Check caller is project admin
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

    // Cannot remove yourself
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

module.exports = {
  createProject,
  getMyProjects,
  getProjectById,
  inviteMember,
  updateMemberRole,
  removeMember,
};