import {
    Model,
    DataTypes,
    Sequelize,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
} from 'sequelize';

export interface NewsletterSubscriberAttributes {
    subscriber_id: number;
    email: string;
    subscribed_at?: Date;
}

export class NewsletterSubscriber
    extends Model<InferAttributes<NewsletterSubscriber>, InferCreationAttributes<NewsletterSubscriber>>
    implements NewsletterSubscriberAttributes
{
    declare subscriber_id: CreationOptional<number>;
    declare email: string;
    declare subscribed_at: CreationOptional<Date>;
}

export default function initNewsletterSubscriberModel(sequelize: Sequelize): typeof NewsletterSubscriber {
    NewsletterSubscriber.init(
        {
            subscriber_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            email: {
                type: DataTypes.STRING(255),
                allowNull: false,
                unique: true,
            },
            subscribed_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            sequelize,
            modelName: 'NewsletterSubscriber',
            tableName: 'newsletter_subscribers',
            timestamps: false,
            underscored: true,
        }
    );

    return NewsletterSubscriber;
}
