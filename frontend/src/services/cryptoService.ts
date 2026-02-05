/**
 * Crypto Service - API calls for encryption/decryption
 */
import api from './api';

export interface EncryptRequest {
    quantum_key: number[];
    plaintext: string;
    key_size?: number;
}

export interface EncryptResponse {
    success: boolean;
    ciphertext: string;
    iv: string;
    key_hash: string;
    algorithm: string;
    mode: string;
    original_length: number;
    key_bits_used: number;
}

export interface DecryptRequest {
    quantum_key: number[];
    ciphertext: string;
    iv: string;
    key_size?: number;
}

export interface DecryptResponse {
    success: boolean;
    plaintext: string;
    verified: boolean;
    key_hash: string;
}

export interface AmplifyRequest {
    raw_key: number[];
    qber: number;
    target_length?: number;
}

export interface AmplifyResponse {
    success: boolean;
    amplified_key: number[];
    input_length: number;
    output_length: number;
    compression_ratio: number;
    qber_used: number;
    message: string;
}

export const cryptoService = {
    /**
     * Encrypt plaintext using quantum key
     */
    encrypt: async (data: EncryptRequest): Promise<EncryptResponse> => {
        const response = await api.post('/crypto/encrypt', {
            ...data,
            key_size: data.key_size || 256
        });
        return response.data;
    },

    /**
     * Decrypt ciphertext using quantum key
     */
    decrypt: async (data: DecryptRequest): Promise<DecryptResponse> => {
        const response = await api.post('/crypto/decrypt', {
            ...data,
            key_size: data.key_size || 256
        });
        return response.data;
    },

    /**
     * Apply privacy amplification to raw key
     */
    amplify: async (data: AmplifyRequest): Promise<AmplifyResponse> => {
        const response = await api.post('/crypto/amplify', data);
        return response.data;
    },

    /**
     * Calculate secure key length
     */
    calculateSecureLength: async (rawLength: number, qber: number) => {
        const response = await api.get('/crypto/secure-length', {
            params: { raw_length: rawLength, qber }
        });
        return response.data;
    }
};

export default cryptoService;
