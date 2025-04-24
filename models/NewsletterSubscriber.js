export default (sequelize, DataTypes) => {
    return sequelize.define('NewsletterSubscriber', {
        subscriber_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
        subscribed_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
    }, {
        tableName: 'Newsletter_Subscribers',
        timestamps: false
    });
};
