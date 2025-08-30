import { Post } from '../db/models';

const generateSlug = (title: string) => {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
};

export const generateUniqueSlug = async (title: string) => {
    const baseSlug = generateSlug(title);
    let slug = baseSlug;
    let count = 1;

    while (true) {
        const existing = await Post.findOne({ where: { slug } });
        if (!existing) {
            return slug;
        }
        slug = `${baseSlug}-${count}`;
        count++;
    }
};
