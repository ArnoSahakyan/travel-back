export default (sequelize, DataTypes) => {
    return sequelize.define('Destination', {
        destination_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING(100), allowNull: false },
        description: { type: DataTypes.TEXT },
        image: { type: DataTypes.STRING(255) }
    }, {
        tableName: 'Destinations',
        timestamps: false
    });
};
