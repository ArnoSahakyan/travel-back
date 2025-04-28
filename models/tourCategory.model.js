export default (sequelize, DataTypes) => {
    return sequelize.define('TourCategory', {
        category_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING(100), allowNull: false, unique: true }
    }, {
        tableName: 'Tour_Categories',
        timestamps: false
    });
};
