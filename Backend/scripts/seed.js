const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');
const { User } = require('../models');

async function seed() {
  try {
    await sequelize.sync({ force: false }); // ensure tables exist

    // Hash passwords
    const adminPass = await bcrypt.hash('admin123', 10);
    const pmPass = await bcrypt.hash('pm123', 10);
    const collabPass = await bcrypt.hash('collab123', 10);

    // Insert users
    await User.bulkCreate([
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password_hash: adminPass,
        role: 'admin',
        is_first_login: true,
        is_active: true
      },
      {
        name: 'Project Manager',
        email: 'pm@example.com',
        password_hash: pmPass,
        role: 'project_manager',
        is_first_login: true,
        is_active: true
      },
      {
        name: 'Collaborator User',
        email: 'collab@example.com',
        password_hash: collabPass,
        role: 'collaborator',
        is_first_login: true,
        is_active: true
      }
    ]);

    console.log('✅ Seed data inserted successfully!');
    process.exit();
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seed();
