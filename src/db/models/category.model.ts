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

export interface CategoryAttributes {
    category_id: number;
    name: string;
}

export class Category
    extends Model<InferAttributes<Category>, InferCreationAttributes<Category>>
    implements CategoryAttributes
{
    declare category_id: CreationOptional<number>;
    declare name: string;

    declare Tours?: Tour[];

    public static associations: {
        Tours: Association<Category, Tour>;
    };

    static associate(models: DbModels) {
        Category.hasMany(models.Tour, {
            foreignKey: 'category_id',
            onDelete: 'CASCADE',
        });
    }
}

export default function initCategoryModel(sequelize: Sequelize): typeof Category {
    Category.init(
        {
            category_id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: 'Category',
            tableName: 'categories',
            timestamps: false,
            underscored: true,
        }
    );

    return Category;
}
