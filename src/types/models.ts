import {
    Booking,
    Category,
    Destination,
    Favorite,
    NewsletterSubscriber, NewsletterVerification,
    Post,
    Review,
    Role,
    Tour,
    TourImage,
    User
} from "../db/models";

export interface DbModels {
    User: typeof User;
    Role: typeof Role;
    Destination: typeof Destination;
    Category: typeof Category;
    Tour: typeof Tour;
    TourImage: typeof TourImage;
    Booking: typeof Booking;
    Favorite: typeof Favorite;
    Review: typeof Review;
    Post: typeof Post;
    NewsletterSubscriber: typeof NewsletterSubscriber;
    NewsletterVerification: typeof NewsletterVerification;
}
