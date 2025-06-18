import {
    Model,
    DataTypes,
    Sequelize,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional, Association,
} from 'sequelize';
import {Tour} from "./tour.model";
import {DbModels} from "../../types";

export interface DestinationAttributes {
    destination_id: number;
    name: string;
    description?: string;
    image?: string;
}

export class Destination
    extends Model<InferAttributes<Destination>, InferCreationAttributes<Destination>>
    implements DestinationAttributes
{
    declare destination_id: CreationOptional<number>;
    declare name: string;
    declare description?: string;
    declare image?: string;

    declare Tours?: Tour[];

    public static associations: {
        Tours: Association<Destination, Tour>;
    };

    static associate(models: DbModels) {
        Destination.hasMany(models.Tour, {
            foreignKey: 'destination_id',
            onDelete: 'CASCADE',
        });
    }
}

export default function initDestinationModel(sequelize: Sequelize): typeof Destination {
    Destination.init(
        {
            destination_id: {
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
            image: {
                type: DataTypes.STRING,
                allowNull: true,
            },
        },
        {
            sequelize,
            modelName: 'Destination',
            tableName: 'destinations',
            timestamps: false,
            underscored: true,
        }
    );

    return Destination;
}
