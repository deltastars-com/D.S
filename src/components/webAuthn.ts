
/**
 * Sovereign Biometric Engine v21.0 - Passkey Integration
 */

const STORAGE_KEYS = {
    KEYS: 'delta-sovereign-keys-v21',
    SYSTEM_VER: 'delta-system-version-v21'
};

const getKeys = () => {
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.KEYS);
        return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
};

export const isBiometricAvailable = async (): Promise<boolean> => {
    return !!(window.PublicKeyCredential && 
           await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable());
};

export const registerBiometric = async (id: string): Promise<boolean> => {
    if (!await isBiometricAvailable()) return false;
    try {
        const challenge = window.crypto.getRandomValues(new Uint8Array(32));
        const userHandle = window.crypto.getRandomValues(new Uint8Array(16));

        const options: PublicKeyCredentialCreationOptions = {
            challenge,
            rp: { name: "Delta Stars Sovereign", id: window.location.hostname },
            user: { id: userHandle, name: id, displayName: `Partner ${id}` },
            pubKeyCredParams: [{ alg: -7, type: "public-key" }],
            authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required" },
            timeout: 60000
        };

        const credential = await navigator.credentials.create({ publicKey: options }) as PublicKeyCredential;
        if (credential) {
            const keys = getKeys();
            keys[id.toLowerCase()] = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
            localStorage.setItem(STORAGE_KEYS.KEYS, JSON.stringify(keys));
            return true;
        }
        return false;
    } catch (e) {
        console.error("Biometric registration failed", e);
        return false;
    }
};

export const authenticateBiometric = async (id: string): Promise<boolean> => {
    const keys = getKeys();
    const keyId = keys[id.toLowerCase()];
    if (!keyId) return false;

    try {
        const challenge = window.crypto.getRandomValues(new Uint8Array(32));
        const rawId = Uint8Array.from(atob(keyId), c => c.charCodeAt(0));

        const options: PublicKeyCredentialRequestOptions = {
            challenge,
            allowCredentials: [{ id: rawId, type: 'public-key' }],
            userVerification: "required",
            timeout: 60000
        };

        const assertion = await navigator.credentials.get({ publicKey: options });
        return !!assertion;
    } catch (e) {
        console.error("Biometric authentication failed", e);
        return false;
    }
};

export const hasRegisteredKey = (id: string): boolean => !!getKeys()[id.toLowerCase()];
