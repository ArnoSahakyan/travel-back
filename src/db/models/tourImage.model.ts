import {
    Model,
    DataTypes,
    Sequelize,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
    ForeignKey, Association,
} from 'sequelize';
import {Tour} from "./tour.model";
import {DbModels} from "../../types";

export interface TourImageAttributes {
    image_id: number;
    tour_id: number;
    image_url: string;
    is_cover: boolean;
}

export class TourImage
    extends Model<InferAttributes<TourImage>, InferCreationAttributes<TourImage>>
    implements TourImageAttributes
{
    declare image_id: CreationOptional<number>;
    declare tour_id: ForeignKey<number>;
    declare image_url: string;
    declare is_cover: boolean;

    declare Tour?: Tour;

    // ✅ Typed association metadata
    public static associations: {
        Tour: Association<TourImage, Tour>;
    };

    static associate(models: DbModels) {
        TourImage.belongsTo(models.Tour, {
            foreignKey: 'tour_id',
            onDelete: 'CASCADE',
        });
    }
}

export default function initTourImageModel(sequelize: Sequelize): typeof TourImage {
    TourImage.init(
        {
            image_id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            tour_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            image_url: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            is_cover: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
        },
        {
            sequelize,
            modelName: 'TourImage',
            tableName: 'tour_images',
            timestamps: false,
            underscored: true,
        }
    );

    return TourImage;
}
