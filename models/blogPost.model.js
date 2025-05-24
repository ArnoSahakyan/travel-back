export default (sequelize, DataTypes) => {
    return sequelize.define(
        'BlogPost',
        {
            post_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
            title: { type: DataTypes.STRING(255), allowNull: false },
            slug: { type: DataTypes.STRING(255), allowNull: false, unique: true },
            excerpt: { type: DataTypes.TEXT },
            content: { type: DataTypes.TEXT },
            image: { type: DataTypes.STRING },
            is_published: { type: DataTypes.BOOLEAN, defaultValue: false },
        },
        {
            tableName: 'Blog_Posts',
            timestamps: true
        }
    );
};
