'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('categories', [
      { name: 'Adventure' },
      { name: 'Cultural' },
      { name: 'Relaxation' },
      { name: 'Wildlife' },
      { name: 'Family' },
      { name: 'Romantic' },
      { name: 'Historical' },
    ], {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('categories', null, {});
  },
};
