'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('newsletter_verifications', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      token: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('newsletter_verifications');
  },
};
