import {
    Model,
    DataTypes,
    Sequelize,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
    Association,
} from 'sequelize';
import { User } from './user.model';
import { DbModels } from "../../types";

export interface RoleAttributes {
    role_id: number;
    name: string;
    created_at?: Date;
    updated_at?: Date;
}

export class Role
    extends Model<InferAttributes<Role>, InferCreationAttributes<Role>>
    implements RoleAttributes {
    declare role_id: CreationOptional<number>;
    declare name: string;

    declare readonly created_at: Date;
    declare readonly updated_at: Date;

    declare users?: User[];

    public static associations: {
        users: Association<Role, User>;
    };

    static associate(models: DbModels) {
        Role.hasMany(models.User, {
            foreignKey: 'role_id',
            as: 'users',
            onDelete: 'SET NULL',
        });
    }
}

export default function initRoleModel(sequelize: Sequelize): typeof Role {
    Role.init(
        {
            role_id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            updated_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            sequelize,
            modelName: Role.name,
            tableName: 'roles',
            timestamps: true,
            underscored: true,
        }
    );

    return Role;
}
