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

export interface FavoriteAttributes {
    favorite_id: number;
    user_id: number;
    tour_id: number;
}

export class Favorite
    extends Model<InferAttributes<Favorite>, InferCreationAttributes<Favorite>>
    implements FavoriteAttributes
{
    declare favorite_id: CreationOptional<number>;
    declare user_id: ForeignKey<number>;
    declare tour_id: ForeignKey<number>;

    declare User?: User;
    declare Tour?: Tour;

    public static associations: {
        User: Association<Favorite, User>;
        Tour: Association<Favorite, Tour>;
    };

    static associate(models: DbModels) {
        Favorite.belongsTo(models.User, { foreignKey: 'user_id', onDelete: 'CASCADE' });
        Favorite.belongsTo(models.Tour, { foreignKey: 'tour_id', onDelete: 'CASCADE' });
    }
}

export default function initFavoriteModel(sequelize: Sequelize): typeof Favorite {
    Favorite.init(
        {
            favorite_id: {
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
        },
        {
            sequelize,
            modelName: 'Favorite',
            tableName: 'favorites',
            timestamps: true,
            underscored: true,
        }
    );

    return Favorite;
}
