import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import config from "./config.js";

const client = new S3Client({
    region: "auto",
    endpoint: `https://${config.r2.accountId}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: config.r2.accessKey,
        secretAccessKey: config.r2.secretKey
    }
});

export async function uploadToR2(buffer, contentType, messageId) {
    const fileName = messageId ? `decrypted-media/${messageId}` : `${uuidv4()}`;

    const putCommand = new PutObjectCommand({
        Bucket: config.r2.bucket,
        Key: fileName,
        Body: buffer,
        ContentType: contentType
    });

    await client.send(putCommand);

    if (config.r2.publicDomain) {
        // Ensure no double slashes if user included trailing slash
        const domain = config.r2.publicDomain.replace(/\/$/, "");
        return `${domain}/${fileName}`;
    }

    const getCommand = new GetObjectCommand({
        Bucket: config.r2.bucket,
        Key: fileName
    });

    const signedUrl = await getSignedUrl(client, getCommand, {
        expiresIn: 604800 // 7 days (max for S3 signed URLs)
    });

    return signedUrl;
}
