export default (sequelize, DataTypes) => {
    return sequelize.define('NewsletterVerification', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        token: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true
        },
        expires_at: {
            type: DataTypes.DATE,
            allowNull: false
        }
    }, {
        tableName: 'Newsletter_Verifications',
        timestamps: false
    });
};
