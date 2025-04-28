import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import models from './models/index.js';
import seedRoles from './seeders/seedRoles.js';

const { sequelize, Role } = models;

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected successfully');

        await sequelize.sync({ alter: true });
        console.log('🔄 Database sync complete');

        await seedRoles(Role);
        console.log('🌱 Roles seeded');

        app.listen(PORT, () => {
            console.log(`🚀 Server running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Unable to start server:', error);
        process.exit(1);
    }
};

startServer();
