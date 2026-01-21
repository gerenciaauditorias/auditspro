"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storageService = exports.StorageService = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const s3_1 = require("../config/s3");
const errorHandler_1 = require("../middlewares/errorHandler");
class StorageService {
    constructor() {
        this.bucket = process.env.MINIO_BUCKET || 'auditorias-documents';
    }
    async uploadFile(key, body, contentType) {
        try {
            const command = new client_s3_1.PutObjectCommand({
                Bucket: this.bucket,
                Key: key,
                Body: body,
                ContentType: contentType,
            });
            await s3_1.s3Client.send(command);
            return key;
        }
        catch (error) {
            console.error('MinIO Upload Error:', error);
            throw new errorHandler_1.AppError('Error uploading file to storage', 500);
        }
    }
    async getPresignedUrl(key, expiresIn = 3600) {
        try {
            const command = new client_s3_1.GetObjectCommand({
                Bucket: this.bucket,
                Key: key,
            });
            return await (0, s3_request_presigner_1.getSignedUrl)(s3_1.s3Client, command, { expiresIn });
        }
        catch (error) {
            console.error('MinIO Presigned URL Error:', error);
            throw new errorHandler_1.AppError('Error generating access URL', 500);
        }
    }
}
exports.StorageService = StorageService;
exports.storageService = new StorageService();
