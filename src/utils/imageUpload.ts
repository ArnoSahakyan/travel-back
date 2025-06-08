import sharp from 'sharp';
import { supabase } from './supabase';
import { v4 as uuid } from 'uuid';

const SUPABASE_STORAGE_URL = process.env.SUPABASE_PUBLIC_URL || '';

export const uploadAndProcessImages = async (
    files: Express.Multer.File[],
    bucket: string,
    identifier: string | number
): Promise<string[]> => {
    const uploadedPaths: string[] = [];

    for (const file of files) {
        const filename = `${identifier}_${uuid()}.webp`;
        const folder = `${identifier}`;
        const fullPath = `${folder}/${filename}`;

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

        if (error) throw new Error(`Supabase upload failed: ${error.message}`);

        uploadedPaths.push(fullPath);
    }

    return uploadedPaths;
};

export const addSupabaseUrl = (path: string, bucket: string): string => {
    return `${SUPABASE_STORAGE_URL}/${bucket}/${path}`;
};

export const deleteFromSupabase = async (
    filePath: string,
    bucketName: string
): Promise<void> => {
    const { error } = await supabase.storage.from(bucketName).remove([filePath]);

    if (error) {
        console.error('Supabase Image Deletion Error:', error);
        throw new Error('Failed to delete old image.');
    }
};
