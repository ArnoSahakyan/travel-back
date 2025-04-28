export default (sequelize, DataTypes) => {
    return sequelize.define('BlogPost', {
        post_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        title: { type: DataTypes.STRING(255), allowNull: false },
        content: { type: DataTypes.TEXT },
        created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
    }, {
        tableName: 'Blog_Posts',
        timestamps: false
    });
};
