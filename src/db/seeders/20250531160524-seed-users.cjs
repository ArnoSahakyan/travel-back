'use strict';

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    await queryInterface.bulkInsert(
        'users',
        [
          {
            full_name: 'Arno Sahakyan',
            email: 'sahakyan.arno@gmail.com',
            password: '$2b$10$Cv2nRqpxhY9wybZ4cSbfX.0CNbWWZwdKDn9LfAL6idqr/8xZx/AXa',
            role_id: 1,
            created_at: now,
            updated_at: now,
          },
          {
            full_name: 'Ruben Budaghyan',
            email: 'ruben.budaghyan@gmail.com',
            password: '$2b$10$Cv2nRqpxhY9wybZ4cSbfX.0CNbWWZwdKDn9LfAL6idqr/8xZx/AXa',
            role_id: 2,
            created_at: now,
            updated_at: now,
          },
        ],
        {}
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', null, {});
  },
};
