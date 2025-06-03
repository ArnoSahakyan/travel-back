import sharp from 'sharp';
import { supabase } from './supabase';
import { v4 as uuid } from 'uuid';

const SUPABASE_STORAGE_URL = process.env.SUPABASE_PUBLIC_URL;

export const uploadAndProcessImages = async (files, bucket, identifier) => {
    const uploadedPaths = [];
    for (const file of files) {
        const filename = `${identifier}_${uuid()}.webp`;
        const folder = `${identifier}`;
        const fullPath = `${folder}/${filename}`; // e.g. tour-id/unique.webp

        const buffer = await sharp(file.buffer)
            .resize({ width: 1500 })
            .webp({ quality: 90 })
            .toBuffer();

        const { error } = await supabase.storage
            .from(bucket)
            .upload(fullPath, buffer, {
                contentType: 'image/webp',
                upsert: false,
            });

        if (error) throw error;

        uploadedPaths.push(fullPath); // only the relative path
    }

    return uploadedPaths;
};

export const addSupabaseUrl = (path, bucket) => {
    return `${SUPABASE_STORAGE_URL}/${bucket}/${path}`;
};

export const deleteFromSupabase = async (filePath, bucketName) => {
    const { error } = await supabase.storage.from(bucketName).remove([filePath]);

    if (error) {
        console.error('Supabase Image Deletion Error:', error);
        throw new Error('Failed to delete old image.');
    }
};
