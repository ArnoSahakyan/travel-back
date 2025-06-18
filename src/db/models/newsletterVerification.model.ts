import {
    Model,
    DataTypes,
    Sequelize,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
} from 'sequelize';

export interface NewsletterVerificationAttributes {
    id: number;
    email: string;
    token: string;
    expires_at: Date;
}

export class NewsletterVerification
    extends Model<InferAttributes<NewsletterVerification>, InferCreationAttributes<NewsletterVerification>>
    implements NewsletterVerificationAttributes
{
    declare id: CreationOptional<number>;
    declare email: string;
    declare token: string;
    declare expires_at: Date;
}

export default function initNewsletterVerificationModel(sequelize: Sequelize): typeof NewsletterVerification {
    NewsletterVerification.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            email: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            token: {
                type: DataTypes.STRING(255),
                allowNull: false,
                unique: true,
            },
            expires_at: {
                type: DataTypes.DATE,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: 'NewsletterVerification',
            tableName: 'newsletter_verifications',
            timestamps: false,
            underscored: true,
        }
    );

    return NewsletterVerification;
}
