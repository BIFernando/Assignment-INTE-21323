require('dotenv').config();
const bcrypt = require('bcrypt');
const sequelize = require('../config/database');
const { User } = require('../models/index');

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    const hashed = await bcrypt.hash('Password123!', 10);

    await User.destroy({ where: {} });

    await User.bulkCreate([
      {
        name: 'Admin User',
        email: 'admin@tms.com',
        passwordHash: hashed,
        role: 'admin',
        isFirstLogin: false,
        isActive: true,
      },
      {
        name: 'Project Manager',
        email: 'pm@tms.com',
        passwordHash: hashed,
        role: 'project_manager',
        isFirstLogin: false,
        isActive: true,
      },
      {
        name: 'Collaborator',
        email: 'collab@tms.com',
        passwordHash: hashed,
        role: 'collaborator',
        isFirstLogin: false,
        isActive: true,
      },
    ]);

    console.log('✅ Seed complete! 3 users created.');
    console.log('   admin@tms.com / Password123!');
    console.log('   pm@tms.com / Password123!');
    console.log('   collab@tms.com / Password123!');
    process.exit();

  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();