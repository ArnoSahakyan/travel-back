import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

import UserModel from './user.model.js';
import RoleModel from './role.model.js';
import DestinationModel from './destination.model.js';
import TourCategoryModel from './tourCategory.model.js';
import TourModel from './tour.model.js';
import TourImageModel from './tourImage.model.js';
import BookingModel from './booking.model.js';
import WishlistModel from './wishlist.model.js';
import ReviewModel from './review.model.js';
import BlogPostModel from './blogPost.model.js';
import NewsletterSubscriberModel from './newsletterSubscriber.model.js';
import NewsletterVerificationModel from "./newsletterVerification.model.js";

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
db.NewsletterVerification = NewsletterVerificationModel(sequelize, Sequelize);

// Define associations
// Role → Users
db.Role.hasMany(db.User, { foreignKey: 'role_id', onDelete: 'SET NULL' });
db.User.belongsTo(db.Role, { foreignKey: 'role_id', as: 'Role', onDelete: 'SET NULL' });

// Destination → Tours
db.Destination.hasMany(db.Tour, { foreignKey: 'destination_id', onDelete: 'CASCADE' });
db.Tour.belongsTo(db.Destination, { foreignKey: 'destination_id', onDelete: 'SET NULL' });

// TourCategory → Tours
db.TourCategory.hasMany(db.Tour, { foreignKey: 'category_id', onDelete: 'CASCADE' });
db.Tour.belongsTo(db.TourCategory, { foreignKey: 'category_id', onDelete: 'SET NULL' });

// Tour → TourImages
db.Tour.hasMany(db.TourImage, { foreignKey: 'tour_id', onDelete: 'CASCADE' });
db.TourImage.belongsTo(db.Tour, { foreignKey: 'tour_id', onDelete: 'CASCADE' });

// User → Bookings
db.User.hasMany(db.Booking, { foreignKey: 'user_id', onDelete: 'CASCADE' });
db.Booking.belongsTo(db.User, { foreignKey: 'user_id', onDelete: 'CASCADE' });

// Tour → Bookings
db.Tour.hasMany(db.Booking, { foreignKey: 'tour_id', onDelete: 'CASCADE' });
db.Booking.belongsTo(db.Tour, { foreignKey: 'tour_id', onDelete: 'CASCADE' });

// User → Wishlist
db.User.hasMany(db.Wishlist, { foreignKey: 'user_id', onDelete: 'CASCADE' });
db.Wishlist.belongsTo(db.User, { foreignKey: 'user_id', onDelete: 'CASCADE' });

// Tour → Wishlist
db.Tour.hasMany(db.Wishlist, { foreignKey: 'tour_id', onDelete: 'CASCADE' });
db.Wishlist.belongsTo(db.Tour, { foreignKey: 'tour_id', onDelete: 'CASCADE' });

// User → Reviews
db.User.hasMany(db.Review, { foreignKey: 'user_id', onDelete: 'CASCADE' });
db.Review.belongsTo(db.User, { foreignKey: 'user_id', onDelete: 'CASCADE' });

// Tour → Reviews
db.Tour.hasMany(db.Review, { foreignKey: 'tour_id', onDelete: 'CASCADE' });
db.Review.belongsTo(db.Tour, { foreignKey: 'tour_id', onDelete: 'CASCADE' });

export default db;
