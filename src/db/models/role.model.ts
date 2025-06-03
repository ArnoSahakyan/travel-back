import {
    Model,
    DataTypes,
    Sequelize,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
    Association,
} from 'sequelize';
import {User} from './user.model';
import {DbModels} from "../../types";

export interface RoleAttributes {
    role_id: number;
    name: string;
}

export class Role
    extends Model<InferAttributes<Role>, InferCreationAttributes<Role>>
    implements RoleAttributes {
    declare role_id: CreationOptional<number>;
    declare name: string;

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
        },
        {
            sequelize,
            modelName: Role.name,
            tableName: 'roles',
            timestamps: false,
            underscored: true,
        }
    );

    return Role;
}
