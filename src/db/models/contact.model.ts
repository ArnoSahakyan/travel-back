import {
    Model,
    DataTypes,
    Sequelize,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
} from 'sequelize';

export type ContactStatus = 'unread' | 'read' | 'replied';

export class Contact extends Model<InferAttributes<Contact>, InferCreationAttributes<Contact>> {
    declare contact_id: CreationOptional<number>;
    declare full_name: string;
    declare email: string;
    declare phone_number: string;
    declare message: string;
    declare status: CreationOptional<ContactStatus>;
}

export default function initContactModel(sequelize: Sequelize): typeof Contact {
    Contact.init(
        {
            contact_id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            full_name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            phone_number: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            message: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            status: {
                type: DataTypes.ENUM('unread', 'read', 'replied'),
                defaultValue: 'unread',
            },
        },
        {
            sequelize,
            modelName: 'Contact',
            tableName: 'contacts',
            timestamps: true,
            underscored: true,
        }
    );

    return Contact;
}
