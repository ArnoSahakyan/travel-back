export default (sequelize, DataTypes) => {
    return sequelize.define('Tour', {
        tour_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING(100), allowNull: false },
        description: { type: DataTypes.TEXT },
        price: { type: DataTypes.FLOAT, allowNull: false },
        start_date: { type: DataTypes.DATE, allowNull: false },
        end_date: { type: DataTypes.DATE, allowNull: false },
        category_id: { type: DataTypes.INTEGER, allowNull: false },
        destination_id: { type: DataTypes.INTEGER, allowNull: false }
    }, {
        tableName: 'Tours',
        timestamps: false
    });
};
