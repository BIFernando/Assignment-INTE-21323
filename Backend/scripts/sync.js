const sequelize = require('../config/database');
require('../models/index');


async function syncDB() {
  try {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await sequelize.sync({ force: false });
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✅ Tables created successfully!');
    process.exit();
  } catch (error) {
    console.error('❌ Error syncing database:', error);
    process.exit(1);
  }
}

syncDB();
