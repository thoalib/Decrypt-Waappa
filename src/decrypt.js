import axios from "axios";
import crypto from "crypto";
import hkdf from "futoin-hkdf";

const INFO_STRINGS = {
    image: "WhatsApp Image Keys",
    video: "WhatsApp Video Keys",
    audio: "WhatsApp Audio Keys",
    document: "WhatsApp Document Keys"
};

export async function decryptMedia(mediaUrl, mediaKeyBase64, mediaType) {
    if (!INFO_STRINGS[mediaType]) {
        throw new Error("Unsupported media type");
    }

    // 1. Download encrypted media
    const response = await axios.get(mediaUrl, {
        responseType: "arraybuffer",
        timeout: 15000
    });

    const encryptedBuffer = Buffer.from(response.data);

    // 2. Decode media key
    const mediaKey = Buffer.from(mediaKeyBase64, "base64");

    // 3. Derive keys using HKDF
    const expandedKey = hkdf(mediaKey, 112, {
        salt: Buffer.alloc(32),
        info: INFO_STRINGS[mediaType],
        hash: "SHA-256"
    });

    const iv = expandedKey.slice(0, 16);
    const cipherKey = expandedKey.slice(16, 48);

    // 4. Remove last 10 bytes (MAC)
    const encryptedData = encryptedBuffer.slice(0, -10);

    // 5. AES decrypt
    const decipher = crypto.createDecipheriv(
        "aes-256-cbc",
        cipherKey,
        iv
    );

    const decrypted = Buffer.concat([
        decipher.update(encryptedData),
        decipher.final()
    ]);

    return decrypted;
}
