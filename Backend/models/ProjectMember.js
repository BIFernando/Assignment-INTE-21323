const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ProjectMember = sequelize.define("ProjectMember", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  projectId: { type: DataTypes.INTEGER, allowNull: false },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  role: {
    type: DataTypes.ENUM("admin","project_manager","collaborator"),
    allowNull: false,
    defaultValue: "collaborator"
  },
}, { tableName: "ProjectMember", timestamps: true });

module.exports = ProjectMember;
