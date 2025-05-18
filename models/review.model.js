export default (sequelize, DataTypes) => {
    return sequelize.define('Review', {
        review_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        user_id: { type: DataTypes.INTEGER, allowNull: false },
        tour_id: { type: DataTypes.INTEGER, allowNull: false },
        rating: { type: DataTypes.INTEGER, allowNull: false },
        comment: { type: DataTypes.TEXT },
    }, {
        tableName: 'Reviews',
        timestamps: true
    });
};
