import {
    Model,
    DataTypes,
    Sequelize,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
    ForeignKey, Association,
} from 'sequelize';
import { Tour } from "./tour.model";
import { User } from "./user.model";
import {DbModels} from "../../types";

export interface ReviewAttributes {
    review_id: number;
    user_id: number;
    tour_id: number;
    rating: number;
    comment?: string;
}

export class Review
    extends Model<InferAttributes<Review>, InferCreationAttributes<Review>>
    implements ReviewAttributes
{
    declare review_id: CreationOptional<number>;
    declare user_id: ForeignKey<number>;
    declare tour_id: ForeignKey<number>;
    declare rating: number;
    declare comment?: string;

    // Optional: timestamps
    // declare readonly created_at: Date;
    // declare readonly updated_at: Date;

    declare User?: User;
    declare Tour?: Tour;

    public static associations: {
        User: Association<Review, User>;
        Tour: Association<Review, Tour>;
    };

    static associate(models: DbModels) {
        Review.belongsTo(models.User, { foreignKey: 'user_id', onDelete: 'CASCADE' });
        Review.belongsTo(models.Tour, { foreignKey: 'tour_id', onDelete: 'CASCADE' });
    }
}

export default function initReviewModel(sequelize: Sequelize): typeof Review {
    Review.init(
        {
            review_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            tour_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            rating: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            comment: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
        },
        {
            sequelize,
            modelName: 'Review',
            tableName: 'reviews',
            timestamps: true,
            underscored: true,
        }
    );

    return Review;
}
