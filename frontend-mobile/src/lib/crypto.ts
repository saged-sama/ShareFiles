function arrayBufferToBase64(buffer: ArrayBuffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

function base64toArrayBuffer(base64: string) {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

export const generateKeyPair = async () => {
    const keyPair = await window.crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: 4096,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: {name: "SHA-256"},
        },
        true,
        ["encrypt", "decrypt"]
    );

    const publicKeyBuffer = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
    const privateKeyBuffer = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

    const publicKey = arrayBufferToBase64(publicKeyBuffer);
    const privateKey = arrayBufferToBase64(privateKeyBuffer);

    return {publicKey, privateKey};
}

export const encryptData = async (data: ArrayBuffer, publicKey: string) => {
    // 1. Generate an AES-GCM key for symmetric encryption
    const aesKey = await window.crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
    );

    // 2. Generate a random initialization vector (IV) for AES encryption
    const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 12 bytes IV for AES-GCM

    // 3. Encrypt the data using AES-GCM
    const encryptedData = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        aesKey,
        data
    );

    // 4. Export and encrypt the AES key using RSA-OAEP
    const publicKeyBuffer = base64toArrayBuffer(publicKey);
    const rsaPublicKey = await window.crypto.subtle.importKey(
        "spki", publicKeyBuffer, { name: "RSA-OAEP", hash: { name: "SHA-256" } }, false, ["encrypt"]
    );

    const exportedAesKey = await window.crypto.subtle.exportKey("raw", aesKey);
    const encryptedAesKey = await window.crypto.subtle.encrypt(
        { name: "RSA-OAEP" },
        rsaPublicKey,
        exportedAesKey
    );

    // Return encrypted data, encrypted AES key, and IV (all base64 encoded)
    return {
        encryptedData: arrayBufferToBase64(encryptedData),
        encryptedAesKey: arrayBufferToBase64(encryptedAesKey),
        iv: arrayBufferToBase64(iv)
    };
};

// Hybrid decryption: AES + RSA-OAEP
export const decryptData = async (encryptedData: string, encryptedAesKey: string, iv: string, privateKey: string) => {
    // 1. Import the RSA private key
    const privateKeyBuffer = base64toArrayBuffer(privateKey);
    const rsaPrivateKey = await window.crypto.subtle.importKey(
        "pkcs8", privateKeyBuffer, { name: "RSA-OAEP", hash: { name: "SHA-256" } }, false, ["decrypt"]
    );

    // 2. Decrypt the AES key using the RSA private key
    const encryptedAesKeyBuffer = base64toArrayBuffer(encryptedAesKey);
    const aesKeyBuffer = await window.crypto.subtle.decrypt(
        { name: "RSA-OAEP" },
        rsaPrivateKey,
        encryptedAesKeyBuffer
    );

    // 3. Import the decrypted AES key
    const aesKey = await window.crypto.subtle.importKey(
        "raw", aesKeyBuffer, { name: "AES-GCM" }, false, ["decrypt"]
    );

    // 4. Decrypt the data using the AES key
    const ivBuffer = base64toArrayBuffer(iv);
    const encryptedDataBuffer = base64toArrayBuffer(encryptedData);
    const decryptedData = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv: ivBuffer },
        aesKey,
        encryptedDataBuffer
    );

    // Return the decrypted data (as a decoded string)
    return decryptedData;
};