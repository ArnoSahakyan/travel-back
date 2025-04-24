import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

import UserModel from './User.js';
import RoleModel from './Role.js';
import DestinationModel from './Destination.js';
import TourCategoryModel from './TourCategory.js';
import TourModel from './Tour.js';
import TourImageModel from './TourImage.js';
import BookingModel from './Booking.js';
import WishlistModel from './Wishlist.js';
import ReviewModel from './Review.js';
import BlogPostModel from './BlogPost.js';
import NewsletterSubscriberModel from './NewsletterSubscriber.js';

dotenv.config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'postgres',
        logging: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Define models
db.User = UserModel(sequelize, Sequelize);
db.Role = RoleModel(sequelize, Sequelize);
db.Destination = DestinationModel(sequelize, Sequelize);
db.TourCategory = TourCategoryModel(sequelize, Sequelize);
db.Tour = TourModel(sequelize, Sequelize);
db.TourImage = TourImageModel(sequelize, Sequelize);
db.Booking = BookingModel(sequelize, Sequelize);
db.Wishlist = WishlistModel(sequelize, Sequelize);
db.Review = ReviewModel(sequelize, Sequelize);
db.BlogPost = BlogPostModel(sequelize, Sequelize);
db.NewsletterSubscriber = NewsletterSubscriberModel(sequelize, Sequelize);

// Define associations
db.Role.hasMany(db.User, { foreignKey: 'role_id' });
db.User.belongsTo(db.Role, { foreignKey: 'role_id', as: 'Role' });

db.Destination.hasMany(db.Tour, { foreignKey: 'destination_id' });
db.Tour.belongsTo(db.Destination, { foreignKey: 'destination_id' });

db.TourCategory.hasMany(db.Tour, { foreignKey: 'category_id' });
db.Tour.belongsTo(db.TourCategory, { foreignKey: 'category_id' });

db.Tour.hasMany(db.TourImage, { foreignKey: 'tour_id' });
db.TourImage.belongsTo(db.Tour, { foreignKey: 'tour_id' });

db.User.hasMany(db.Booking, { foreignKey: 'user_id' });
db.Booking.belongsTo(db.User, { foreignKey: 'user_id' });

db.Tour.hasMany(db.Booking, { foreignKey: 'tour_id' });
db.Booking.belongsTo(db.Tour, { foreignKey: 'tour_id' });

db.User.hasMany(db.Wishlist, { foreignKey: 'user_id' });
db.Wishlist.belongsTo(db.User, { foreignKey: 'user_id' });

db.Tour.hasMany(db.Wishlist, { foreignKey: 'tour_id' });
db.Wishlist.belongsTo(db.Tour, { foreignKey: 'tour_id' });

db.User.hasMany(db.Review, { foreignKey: 'user_id' });
db.Review.belongsTo(db.User, { foreignKey: 'user_id' });

db.Tour.hasMany(db.Review, { foreignKey: 'tour_id' });
db.Review.belongsTo(db.Tour, { foreignKey: 'tour_id' });

export default db;
