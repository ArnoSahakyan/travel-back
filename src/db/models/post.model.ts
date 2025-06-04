import {
    Model,
    DataTypes,
    Sequelize,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
} from 'sequelize';

export interface PostAttributes {
    post_id: number;
    title: string;
    slug: string;
    excerpt?: string;
    content?: string;
    image?: string;
    is_published: boolean;
}

export class Post
    extends Model<InferAttributes<Post>, InferCreationAttributes<Post>>
    implements PostAttributes
{
    declare post_id: CreationOptional<number>;
    declare title: string;
    declare slug: string;
    declare excerpt?: string;
    declare content?: string;
    declare image?: string;
    declare is_published: CreationOptional<boolean>;
}

export default function initPostModel(sequelize: Sequelize): typeof Post {
    Post.init(
        {
            post_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            title: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            slug: {
                type: DataTypes.STRING(255),
                allowNull: false,
                unique: true,
            },
            excerpt: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            content: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            image: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            is_published: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            }
        },
        {
            sequelize,
            modelName: 'Post',
            tableName: 'posts',
            timestamps: true,
            underscored: true,
        }
    );

    return Post;
}
