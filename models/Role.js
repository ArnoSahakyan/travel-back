// models/role.model.js
export default (sequelize, DataTypes) => {
    return sequelize.define("Role", {
        role_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        role_name: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });
};
