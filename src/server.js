import Fastify from "fastify";
import config from "./config.js";
import { decryptMedia } from "./decrypt.js";
import { uploadToR2 } from "./r2.js";

const fastify = Fastify({
    logger: true
});

// API Key middleware
fastify.addHook("onRequest", async (request, reply) => {
    const apiKey = request.headers["x-api-key"];
    if (apiKey !== config.apiKey) {
        reply.code(401).send({ error: "Unauthorized" });
    }
});

fastify.post("/decrypt", async (request, reply) => {
    try {
        const { mediaUrl, mediaKey, mediaType, mimeType, messageId } = request.body;

        if (!mediaUrl || !mediaKey || !mediaType || !mimeType || !messageId) {
            return reply.code(400).send({ error: "Missing parameters" });
        }

        const decryptedBuffer = await decryptMedia(
            mediaUrl,
            mediaKey,
            mediaType
        );

        const signedUrl = await uploadToR2(
            decryptedBuffer,
            mimeType,
            messageId
        );

        return {
            success: true,
            url: signedUrl
        };

    } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({
            success: false,
            error: "Decryption failed"
        });
    }
});

fastify.listen({ port: config.port, host: "0.0.0.0" }, (err) => {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
    console.log(`Server running on port ${config.port}`);
});
