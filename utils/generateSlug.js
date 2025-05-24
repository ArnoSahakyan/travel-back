import db from "../models/index.js";

const {BlogPost} = db;

const generateSlug = (title) => {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
};

export const generateUniqueSlug = async (title) => {
    const baseSlug = generateSlug(title);
    console.log('BASE SLUG', baseSlug)
    let slug = baseSlug;
    let count = 1;

    while (true) {
        const existing = await BlogPost.findOne({ where: { slug } });
        if (!existing) {
            console.log("FINAL SLUG", slug)
            return slug;
        }
        slug = `${baseSlug}-${count}`;
        count++;
    }
};
