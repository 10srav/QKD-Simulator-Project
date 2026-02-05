"""
AES Encryption Module for QKD Simulator
Uses quantum-generated keys for symmetric encryption
"""
import os
import base64
import hashlib
from typing import Tuple, Optional
from dataclasses import dataclass

# Try to import cryptography, fall back to mock if not available
try:
    from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
    from cryptography.hazmat.backends import default_backend
    from cryptography.hazmat.primitives import padding
    CRYPTO_AVAILABLE = True
except ImportError:
    CRYPTO_AVAILABLE = False


@dataclass
class EncryptionResult:
    """Result of encryption operation"""
    ciphertext: str  # Base64 encoded
    iv: str  # Base64 encoded initialization vector
    key_hash: str  # SHA256 hash of the key (for verification)
    algorithm: str
    mode: str
    original_length: int


@dataclass 
class DecryptionResult:
    """Result of decryption operation"""
    plaintext: str
    verified: bool
    key_hash: str


class AESEncryptor:
    """
    AES Encryption using quantum-generated keys.
    
    The quantum key from BB84/E91 protocols is used as the symmetric key
    for AES encryption, providing information-theoretic security for key
    distribution combined with computational security for encryption.
    """
    
    SUPPORTED_KEY_SIZES = [128, 192, 256]  # bits
    
    def __init__(self, quantum_key: list[int]):
        """
        Initialize with a quantum-generated key.
        
        Args:
            quantum_key: List of 0s and 1s from QKD protocol
        """
        self.quantum_key_bits = quantum_key
        self.key_bytes = self._bits_to_bytes(quantum_key)
        self.key_size = len(self.key_bytes) * 8
        
        # Validate key size
        if self.key_size < 128:
            raise ValueError(f"Key too short: {self.key_size} bits. Minimum 128 bits required for AES-128.")
    
    def _bits_to_bytes(self, bits: list[int]) -> bytes:
        """Convert list of bits to bytes"""
        # Pad to multiple of 8
        padded_bits = bits + [0] * ((8 - len(bits) % 8) % 8)
        
        byte_array = []
        for i in range(0, len(padded_bits), 8):
            byte_val = 0
            for j in range(8):
                byte_val = (byte_val << 1) | padded_bits[i + j]
            byte_array.append(byte_val)
        
        return bytes(byte_array)
    
    def _get_aes_key(self, target_bits: int = 256) -> bytes:
        """
        Get AES key of specified size.
        Uses SHA-256 for key derivation if needed.
        """
        if target_bits not in self.SUPPORTED_KEY_SIZES:
            raise ValueError(f"Unsupported key size: {target_bits}")
        
        target_bytes = target_bits // 8
        
        if len(self.key_bytes) >= target_bytes:
            # Use first N bytes directly
            return self.key_bytes[:target_bytes]
        else:
            # Use key derivation (hash stretching)
            # In production, use proper KDF like HKDF
            derived = hashlib.sha256(self.key_bytes).digest()
            return derived[:target_bytes]
    
    def get_key_hash(self) -> str:
        """Get SHA-256 hash of the key for verification"""
        return hashlib.sha256(self.key_bytes).hexdigest()[:16]
    
    def encrypt(self, plaintext: str, key_size: int = 256) -> EncryptionResult:
        """
        Encrypt plaintext using AES-CBC with the quantum key.
        
        Args:
            plaintext: Text to encrypt
            key_size: AES key size in bits (128, 192, or 256)
            
        Returns:
            EncryptionResult with ciphertext and metadata
        """
        if not CRYPTO_AVAILABLE:
            # Mock encryption for demo
            return self._mock_encrypt(plaintext, key_size)
        
        key = self._get_aes_key(key_size)
        iv = os.urandom(16)  # 128-bit IV for CBC
        
        # Pad plaintext to block size
        padder = padding.PKCS7(128).padder()
        padded_data = padder.update(plaintext.encode('utf-8')) + padder.finalize()
        
        # Encrypt
        cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
        encryptor = cipher.encryptor()
        ciphertext = encryptor.update(padded_data) + encryptor.finalize()
        
        return EncryptionResult(
            ciphertext=base64.b64encode(ciphertext).decode('utf-8'),
            iv=base64.b64encode(iv).decode('utf-8'),
            key_hash=self.get_key_hash(),
            algorithm=f"AES-{key_size}",
            mode="CBC",
            original_length=len(plaintext)
        )
    
    def decrypt(self, ciphertext_b64: str, iv_b64: str, key_size: int = 256) -> DecryptionResult:
        """
        Decrypt ciphertext using AES-CBC with the quantum key.
        
        Args:
            ciphertext_b64: Base64 encoded ciphertext
            iv_b64: Base64 encoded initialization vector
            key_size: AES key size in bits
            
        Returns:
            DecryptionResult with plaintext
        """
        if not CRYPTO_AVAILABLE:
            return self._mock_decrypt(ciphertext_b64, iv_b64, key_size)
        
        key = self._get_aes_key(key_size)
        iv = base64.b64decode(iv_b64)
        ciphertext = base64.b64decode(ciphertext_b64)
        
        # Decrypt
        cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
        decryptor = cipher.decryptor()
        padded_plaintext = decryptor.update(ciphertext) + decryptor.finalize()
        
        # Unpad
        unpadder = padding.PKCS7(128).unpadder()
        plaintext = unpadder.update(padded_plaintext) + unpadder.finalize()
        
        return DecryptionResult(
            plaintext=plaintext.decode('utf-8'),
            verified=True,
            key_hash=self.get_key_hash()
        )
    
    def _mock_encrypt(self, plaintext: str, key_size: int) -> EncryptionResult:
        """Mock encryption when cryptography library not available"""
        # Simple XOR-based mock (NOT SECURE - for demo only)
        key = self._get_aes_key(key_size)
        data = plaintext.encode('utf-8')
        
        encrypted = bytes([d ^ key[i % len(key)] for i, d in enumerate(data)])
        iv = os.urandom(16) if CRYPTO_AVAILABLE else bytes([0] * 16)
        
        return EncryptionResult(
            ciphertext=base64.b64encode(encrypted).decode('utf-8'),
            iv=base64.b64encode(iv).decode('utf-8'),
            key_hash=self.get_key_hash(),
            algorithm=f"AES-{key_size} (mock)",
            mode="CBC (mock)",
            original_length=len(plaintext)
        )
    
    def _mock_decrypt(self, ciphertext_b64: str, iv_b64: str, key_size: int) -> DecryptionResult:
        """Mock decryption when cryptography library not available"""
        key = self._get_aes_key(key_size)
        encrypted = base64.b64decode(ciphertext_b64)
        
        decrypted = bytes([d ^ key[i % len(key)] for i, d in enumerate(encrypted)])
        
        return DecryptionResult(
            plaintext=decrypted.decode('utf-8'),
            verified=True,
            key_hash=self.get_key_hash()
        )


class PrivacyAmplification:
    """
    Privacy amplification for quantum keys.
    
    Reduces key length to eliminate information potentially
    leaked to an eavesdropper, based on QBER measurements.
    """
    
    @staticmethod
    def calculate_secure_length(
        raw_key_length: int,
        qber: float,
        security_parameter: float = 1e-10
    ) -> int:
        """
        Calculate secure key length after privacy amplification.
        
        Based on the formula from QKD theory:
        secure_length = raw_length * (1 - h(QBER) - leak_rate)
        
        where h(x) is the binary entropy function.
        
        Args:
            raw_key_length: Original sifted key length
            qber: Quantum Bit Error Rate (0-1)
            security_parameter: Target security level
            
        Returns:
            Secure key length after amplification
        """
        if qber >= 0.11:  # Above theoretical limit
            return 0
        
        # Binary entropy function
        def binary_entropy(p: float) -> float:
            if p <= 0 or p >= 1:
                return 0
            return -p * (p if p == 0 else __import__('math').log2(p)) - (1-p) * ((1-p) if (1-p) == 0 else __import__('math').log2(1-p))
        
        # Shannon limit for key rate
        key_rate = 1 - 2 * binary_entropy(qber)
        
        if key_rate <= 0:
            return 0
        
        secure_length = int(raw_key_length * key_rate * 0.9)  # 10% safety margin
        
        return max(0, secure_length)
    
    @staticmethod
    def amplify(
        raw_key: list[int],
        qber: float,
        target_length: Optional[int] = None
    ) -> Tuple[list[int], dict]:
        """
        Perform privacy amplification on a raw key.
        
        Uses a universal hash function to compress the key
        and eliminate leaked information.
        
        Args:
            raw_key: Original sifted key bits
            qber: Measured QBER
            target_length: Desired output length (auto-calculated if None)
            
        Returns:
            Tuple of (amplified_key, metadata)
        """
        if target_length is None:
            target_length = PrivacyAmplification.calculate_secure_length(
                len(raw_key), qber
            )
        
        if target_length <= 0:
            return [], {
                "success": False,
                "reason": "QBER too high for secure key generation",
                "input_length": len(raw_key),
                "output_length": 0
            }
        
        # Use SHA-256 as a universal hash function
        key_bytes = bytes([
            sum(raw_key[i+j] << (7-j) for j in range(min(8, len(raw_key)-i)))
            for i in range(0, len(raw_key), 8)
        ])
        
        hash_output = hashlib.sha256(key_bytes).digest()
        
        # Convert to bits and truncate to target length
        amplified_bits = []
        for byte in hash_output:
            for j in range(8):
                if len(amplified_bits) >= target_length:
                    break
                amplified_bits.append((byte >> (7-j)) & 1)
            if len(amplified_bits) >= target_length:
                break
        
        return amplified_bits[:target_length], {
            "success": True,
            "input_length": len(raw_key),
            "output_length": len(amplified_bits),
            "compression_ratio": len(amplified_bits) / len(raw_key) if raw_key else 0,
            "qber_used": qber
        }
