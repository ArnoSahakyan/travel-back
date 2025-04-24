export default (sequelize, DataTypes) => {
    return sequelize.define('TourImage', {
        image_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        tour_id: { type: DataTypes.INTEGER, allowNull: false },
        image_url: { type: DataTypes.STRING(255), allowNull: false }
    }, {
        tableName: 'Tour_Images',
        timestamps: false
    });
};
