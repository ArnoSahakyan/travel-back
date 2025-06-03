import {
    Model,
    DataTypes,
    Sequelize,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
    ForeignKey,
    Association,
} from 'sequelize';
import { Tour } from './tour.model';
import { User } from './user.model';
import {DbModels} from "../../types";

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export class Booking
    extends Model<InferAttributes<Booking>, InferCreationAttributes<Booking>>
{
    declare booking_id: CreationOptional<number>;
    declare user_id: ForeignKey<number>;
    declare tour_id: ForeignKey<number>;
    declare booking_date: CreationOptional<Date>;
    declare number_of_people: number;
    declare total_price: number;
    declare status: CreationOptional<BookingStatus>;

    // Optional: declare readonly createdAt: Date;
    // Optional: declare readonly updatedAt: Date;
    declare Tour?: Tour;
    declare User?: User;

    public static associations: {
        Tour: Association<Booking, Tour>;
        User: Association<Booking, User>;
    };

    static associate(models: DbModels) {
        Booking.belongsTo(models.User, {
            foreignKey: 'user_id',
            onDelete: 'CASCADE',
        });
        Booking.belongsTo(models.Tour, {
            foreignKey: 'tour_id',
            onDelete: 'CASCADE',
        });
    }
}

export default function initBookingModel(sequelize: Sequelize): typeof Booking {
    Booking.init(
        {
            booking_id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            tour_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            booking_date: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
            number_of_people: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            total_price: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            status: {
                type: DataTypes.ENUM(
                    'pending',
                    'confirmed',
                    'cancelled',
                    'completed',
                    'no_show',
                    'refunded'
                ),
                defaultValue: 'pending',
            },
        },
        {
            sequelize,
            modelName: 'Booking',
            tableName: 'bookings',
            timestamps: true,
            underscored: true,
        }
    );

    return Booking;
}
