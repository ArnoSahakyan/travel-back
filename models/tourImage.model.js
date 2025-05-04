export default (sequelize, DataTypes) => {
    return sequelize.define('TourImage', {
        image_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        tour_id: { type: DataTypes.INTEGER, allowNull: false },
        image_url: { type: DataTypes.STRING(255), allowNull: false },
        is_cover: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
    }, {
        tableName: 'Tour_Images',
        timestamps: false
    });
};
