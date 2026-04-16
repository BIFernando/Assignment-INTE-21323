const sequelize = require('../config/database');
require('../models/index');  


async function syncDB() {
  try {
    await sequelize.sync({ force: false }); 
    console.log('✅ Tables created successfully!');
    process.exit();
  } catch (error) {
    console.error('❌ Error syncing database:', error);
    process.exit(1);
  }
}

syncDB();
