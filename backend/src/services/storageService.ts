import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client } from '../config/s3';
import { AppError } from '../middlewares/errorHandler';

export class StorageService {
    private bucket: string;

    constructor() {
        this.bucket = process.env.MINIO_BUCKET || 'auditorias-documents';
    }

    async uploadFile(key: string, body: Buffer, contentType: string): Promise<string> {
        try {
            const command = new PutObjectCommand({
                Bucket: this.bucket,
                Key: key,
                Body: body,
                ContentType: contentType,
            });

            await s3Client.send(command);
            return key;
        } catch (error) {
            console.error('MinIO Upload Error:', error);
            throw new AppError('Error uploading file to storage', 500);
        }
    }

    async getPresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
        try {
            const command = new GetObjectCommand({
                Bucket: this.bucket,
                Key: key,
            });

            return await getSignedUrl(s3Client, command, { expiresIn });
        } catch (error) {
            console.error('MinIO Presigned URL Error:', error);
            throw new AppError('Error generating access URL', 500);
        }
    }
}

export const storageService = new StorageService();
