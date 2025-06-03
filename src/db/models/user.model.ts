// user.model.ts
import {
    DataTypes,
    Model,
    Sequelize,
    Optional,
    Association,
} from 'sequelize';
import { Role } from './role.model';
import { Booking } from './booking.model';
import { Favorite } from './favorite.model';
import { Review } from './review.model';

export interface UserAttributes {
    user_id: number;
    full_name: string;
    email: string;
    password: string;
    phone_number?: string;
    role_id?: number;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
}

// For creation
export type UserCreationAttributes = Optional<UserAttributes, 'user_id'>;

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    public user_id!: number;
    public full_name!: string;
    public email!: string;
    public password!: string;
    public phone_number?: string;
    public role_id?: number;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public readonly deletedAt!: Date | null;

    // ASSOCIATION FIELDS (for TypeScript)
    public Role?: Role;
    public Bookings?: Booking[];
    public Favorites?: Favorite[];
    public Reviews?: Review[];

    // Optional: Add associations for more safety
    public static associations: {
        Role: Association<User, Role>;
        Bookings: Association<User, Booking>;
        Favorites: Association<User, Favorite>;
        Reviews: Association<User, Review>;
    };

    static associate() {
        User.belongsTo(Role, { foreignKey: 'role_id', as: 'Role', onDelete: 'SET NULL' });
        User.hasMany(Booking, { foreignKey: 'user_id', onDelete: 'CASCADE' });
        User.hasMany(Favorite, { foreignKey: 'user_id', onDelete: 'CASCADE' });
        User.hasMany(Review, { foreignKey: 'user_id', onDelete: 'CASCADE' });
    }
}

export default function initUserModel(sequelize: Sequelize): void {
    User.init(
        {
            user_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            full_name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            email: {
                type: DataTypes.STRING,
                unique: true,
                allowNull: false,
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            phone_number: {
                type: DataTypes.STRING,
            },
            role_id: {
                type: DataTypes.INTEGER,
            },
        },
        {
            sequelize,
            modelName: 'User',
            tableName: 'users',
            paranoid: true,
        }
    );
}
