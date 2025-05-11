export default (sequelize, DataTypes) => {
    return sequelize.define('Wishlist', {
        wishlist_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        user_id: { type: DataTypes.INTEGER, allowNull: false },
        tour_id: { type: DataTypes.INTEGER, allowNull: false },
    }, {
        tableName: 'Wishlists',
        timestamps: true
    });
};
