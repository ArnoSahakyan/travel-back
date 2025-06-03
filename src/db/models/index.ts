import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

// Import model initializers and class exports
import initUserModel, { User } from './user.model';
import initRoleModel, { Role } from './role.model';
import initDestinationModel, { Destination } from './destination.model';
import initCategoryModel, { Category } from './category.model';
import initTourModel, { Tour } from './tour.model';
import initTourImageModel, { TourImage } from './tourImage.model';
import initBookingModel, { Booking } from './booking.model';
import initFavoriteModel, { Favorite } from './favorite.model';
import initReviewModel, { Review } from './review.model';
import initPostModel, { Post } from './post.model';
import initNewsletterSubscriberModel, { NewsletterSubscriber } from './newsletterSubscriber.model';
import initNewsletterVerificationModel, { NewsletterVerification } from './newsletterVerification.model';
import {DbModels} from "../../types";

// Setup Sequelize instance
export const sequelize = new Sequelize({
  database: process.env.DB_NAME!,
  username: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  host: process.env.DB_HOST!,
  dialect: 'postgres',
  logging: false,
});

// Initialize models
initUserModel(sequelize);
initRoleModel(sequelize);
initDestinationModel(sequelize);
initCategoryModel(sequelize);
initTourModel(sequelize);
initTourImageModel(sequelize);
initBookingModel(sequelize);
initFavoriteModel(sequelize);
initReviewModel(sequelize);
initPostModel(sequelize);
initNewsletterSubscriberModel(sequelize);
initNewsletterVerificationModel(sequelize);

// Collect models into an object to pass to associate methods
const models: DbModels = {
  User,
  Role,
  Destination,
  Category,
  Tour,
  TourImage,
  Booking,
  Favorite,
  Review,
  Post,
  NewsletterSubscriber,
  NewsletterVerification,
};

// Run associations
Object.values(models).forEach((model: any) => {
  if (typeof model.associate === 'function') {
    model.associate(models);
  }
});

// Export models for usage elsewhere
export {
  User,
  Role,
  Destination,
  Category,
  Tour,
  TourImage,
  Booking,
  Favorite,
  Review,
  Post,
  NewsletterSubscriber,
  NewsletterVerification,
};
