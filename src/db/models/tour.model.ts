import {
    Model,
    DataTypes,
    Sequelize,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
    ForeignKey, Association,
} from 'sequelize';
import {Destination} from "./destination.model";
import {Category} from "./category.model";
import {TourImage} from "./tourImage.model";
import {Review} from "./review.model";
import {Favorite} from "./favorite.model";
import {Booking} from "./booking.model";
import {DbModels} from "../../types";

export interface TourAttributes {
    tour_id: number;
    name: string;
    description?: string;
    price: number;
    start_date: Date;
    end_date: Date;
    available_spots: number;
    category_id?: number;
    destination_id?: number;
}

export class Tour
    extends Model<InferAttributes<Tour>, InferCreationAttributes<Tour>>
    implements TourAttributes
{
    declare tour_id: CreationOptional<number>;
    declare name: string;
    declare description?: string;
    declare price: number;
    declare start_date: Date;
    declare end_date: Date;
    declare available_spots: number;
    declare category_id?: ForeignKey<number>;
    declare destination_id?: ForeignKey<number>;

    declare Category?: Category;
    declare Destination?: Destination;
    declare Bookings?: Booking[];
    declare Favorites?: Favorite[];
    declare Reviews?: Review[];
    declare TourImages?: TourImage[];

    public static associations: {
        Category: Association<Tour, Category>;
        Destination: Association<Tour, Destination>;
        Bookings: Association<Tour, Booking>;
        Favorites: Association<Tour, Favorite>;
        Reviews: Association<Tour, Review>;
        TourImages: Association<Tour, TourImage>;
    };

    static associate(models: DbModels) {
        Tour.belongsTo(models.Category, { foreignKey: 'category_id', onDelete: 'SET NULL' });
        Tour.belongsTo(models.Destination, { foreignKey: 'destination_id', onDelete: 'SET NULL' });
        Tour.hasMany(models.Booking, { foreignKey: 'tour_id', onDelete: 'CASCADE' });
        Tour.hasMany(models.Favorite, { foreignKey: 'tour_id', onDelete: 'CASCADE' });
        Tour.hasMany(models.Review, { foreignKey: 'tour_id', onDelete: 'CASCADE' });
        Tour.hasMany(models.TourImage, { foreignKey: 'tour_id', onDelete: 'CASCADE' });
    }
}

export default function initTourModel(sequelize: Sequelize): typeof Tour {
    Tour.init(
        {
            tour_id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            price: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            start_date: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            end_date: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            available_spots: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            category_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            destination_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
        },
        {
            sequelize,
            modelName: 'Tour',
            tableName: 'tours',
            timestamps: false,
            underscored: true,
        }
    );

    return Tour;
}
