"""
Encryption API Endpoints
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

from app.crypto.aes_encryption import AESEncryptor, PrivacyAmplification

router = APIRouter(tags=["Encryption"])


class EncryptRequest(BaseModel):
    """Request to encrypt data with quantum key"""
    quantum_key: list[int] = Field(..., description="Quantum key as list of bits (0s and 1s)")
    plaintext: str = Field(..., description="Text to encrypt")
    key_size: int = Field(default=256, description="AES key size: 128, 192, or 256")


class EncryptResponse(BaseModel):
    """Encryption result"""
    success: bool
    ciphertext: str
    iv: str
    key_hash: str
    algorithm: str
    mode: str
    original_length: int
    key_bits_used: int


class DecryptRequest(BaseModel):
    """Request to decrypt data with quantum key"""
    quantum_key: list[int] = Field(..., description="Same quantum key used for encryption")
    ciphertext: str = Field(..., description="Base64 encoded ciphertext")
    iv: str = Field(..., description="Base64 encoded initialization vector")
    key_size: int = Field(default=256, description="AES key size used for encryption")


class DecryptResponse(BaseModel):
    """Decryption result"""
    success: bool
    plaintext: str
    verified: bool
    key_hash: str


class AmplifyRequest(BaseModel):
    """Request for privacy amplification"""
    raw_key: list[int] = Field(..., description="Raw sifted key bits")
    qber: float = Field(..., ge=0, le=1, description="Measured QBER (0-1)")
    target_length: Optional[int] = Field(None, description="Desired output length")


class AmplifyResponse(BaseModel):
    """Privacy amplification result"""
    success: bool
    amplified_key: list[int]
    input_length: int
    output_length: int
    compression_ratio: float
    qber_used: float
    message: str


@router.post("/encrypt", response_model=EncryptResponse)
async def encrypt_with_quantum_key(request: EncryptRequest):
    """
    Encrypt data using a quantum-generated key.
    
    The quantum key from BB84 or E91 simulation is used as the 
    symmetric key for AES encryption.
    """
    try:
        # Validate key length
        if len(request.quantum_key) < 128:
            raise HTTPException(
                status_code=400,
                detail=f"Key too short: {len(request.quantum_key)} bits. Need at least 128 bits for AES-128."
            )
        
        encryptor = AESEncryptor(request.quantum_key)
        result = encryptor.encrypt(request.plaintext, request.key_size)
        
        return EncryptResponse(
            success=True,
            ciphertext=result.ciphertext,
            iv=result.iv,
            key_hash=result.key_hash,
            algorithm=result.algorithm,
            mode=result.mode,
            original_length=result.original_length,
            key_bits_used=len(request.quantum_key)
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Encryption failed: {str(e)}")


@router.post("/decrypt", response_model=DecryptResponse)
async def decrypt_with_quantum_key(request: DecryptRequest):
    """
    Decrypt data using the same quantum key used for encryption.
    """
    try:
        encryptor = AESEncryptor(request.quantum_key)
        result = encryptor.decrypt(request.ciphertext, request.iv, request.key_size)
        
        return DecryptResponse(
            success=True,
            plaintext=result.plaintext,
            verified=result.verified,
            key_hash=result.key_hash
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Decryption failed: {str(e)}")


@router.post("/amplify", response_model=AmplifyResponse)
async def privacy_amplification(request: AmplifyRequest):
    """
    Apply privacy amplification to a raw key.
    
    This reduces key length to eliminate information potentially
    leaked to an eavesdropper based on QBER measurements.
    """
    try:
        amplified_key, metadata = PrivacyAmplification.amplify(
            request.raw_key,
            request.qber,
            request.target_length
        )
        
        message = "Key successfully amplified" if metadata["success"] else metadata.get("reason", "Amplification failed")
        
        return AmplifyResponse(
            success=metadata["success"],
            amplified_key=amplified_key,
            input_length=metadata["input_length"],
            output_length=metadata["output_length"],
            compression_ratio=metadata.get("compression_ratio", 0),
            qber_used=metadata.get("qber_used", request.qber),
            message=message
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Privacy amplification failed: {str(e)}")


@router.get("/secure-length")
async def calculate_secure_length(raw_length: int, qber: float):
    """
    Calculate the secure key length after privacy amplification.
    """
    if qber < 0 or qber > 1:
        raise HTTPException(status_code=400, detail="QBER must be between 0 and 1")
    
    if raw_length <= 0:
        raise HTTPException(status_code=400, detail="Raw length must be positive")
    
    secure_length = PrivacyAmplification.calculate_secure_length(raw_length, qber)
    
    return {
        "raw_length": raw_length,
        "qber": qber,
        "secure_length": secure_length,
        "compression_ratio": secure_length / raw_length if raw_length > 0 else 0,
        "suitable_for_aes128": secure_length >= 128,
        "suitable_for_aes256": secure_length >= 256
    }
