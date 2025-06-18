'use strict';

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    await queryInterface.bulkInsert(
        'roles',
        [
          { name: 'admin', created_at: now, updated_at: now },
          { name: 'customer', created_at: now, updated_at: now },
        ],
        {}
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('roles', null, {});
  },
};
