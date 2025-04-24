export default (sequelize, DataTypes) => {
    return sequelize.define('Booking', {
        booking_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        user_id: { type: DataTypes.INTEGER, allowNull: false },
        tour_id: { type: DataTypes.INTEGER, allowNull: false },
        booking_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        number_of_people: { type: DataTypes.INTEGER, allowNull: false }
    }, {
        tableName: 'Bookings',
        timestamps: false
    });
};
