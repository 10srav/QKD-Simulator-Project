/**
 * Encryption Page Component
 * Encrypt/decrypt messages using quantum-generated keys.
 * Emerald-teal theme with clean layout.
 */
import { useState } from 'react';
import {
    Lock,
    Unlock,
    Copy,
    Download,
    Key,
    AlertTriangle,
    Check,
    Sparkles,
    ShieldCheck,
    Hash,
} from 'lucide-react';
import { cryptoService } from '../services/cryptoService';

const EncryptionPage = () => {
    const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
    const [quantumKey, setQuantumKey] = useState<string>('');
    const [inputText, setInputText] = useState<string>('');
    const [outputText, setOutputText] = useState<string>('');
    const [iv, setIv] = useState<string>('');
    const [keySize, setKeySize] = useState<number>(256);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState<string | null>(null);
    const [result, setResult] = useState<{
        algorithm?: string;
        keyHash?: string;
        keyBitsUsed?: number;
    } | null>(null);

    const parseKey = (keyStr: string): number[] => {
        return keyStr
            .split(/[\s,]+/)
            .filter(s => s === '0' || s === '1')
            .map(s => parseInt(s, 10));
    };

    const handleEncrypt = async () => {
        setError(null);
        setIsProcessing(true);
        try {
            const keyBits = parseKey(quantumKey);
            if (keyBits.length < 128) {
                throw new Error(`Key too short: ${keyBits.length} bits. Need at least 128 bits.`);
            }
            const response = await cryptoService.encrypt({
                quantum_key: keyBits,
                plaintext: inputText,
                key_size: keySize
            });
            setOutputText(response.ciphertext);
            setIv(response.iv);
            setResult({
                algorithm: response.algorithm,
                keyHash: response.key_hash,
                keyBitsUsed: response.key_bits_used
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Encryption failed');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDecrypt = async () => {
        setError(null);
        setIsProcessing(true);
        try {
            const keyBits = parseKey(quantumKey);
            if (keyBits.length < 128) {
                throw new Error(`Key too short: ${keyBits.length} bits. Need at least 128 bits.`);
            }
            const response = await cryptoService.decrypt({
                quantum_key: keyBits,
                ciphertext: inputText,
                iv: iv,
                key_size: keySize
            });
            setOutputText(response.plaintext);
            setResult({ keyHash: response.key_hash });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Decryption failed');
        } finally {
            setIsProcessing(false);
        }
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        setCopied(label);
        setTimeout(() => setCopied(null), 2000);
    };

    const downloadFile = (content: string, filename: string) => {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    const generateSampleKey = () => {
        const bits = Array.from({ length: 256 }, () => Math.random() > 0.5 ? 1 : 0);
        setQuantumKey(bits.join(' '));
    };

    const keyBits = parseKey(quantumKey);
    const keyReady = keyBits.length >= 128;

    return (
        <div className="min-h-screen">
            {/* Page Header */}
            <div className="page-header">
                <div className="container mx-auto px-6 py-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <ShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Quantum Encryption</h1>
                            <p className="text-sm text-[#a0a0b4]">AES-256 with quantum-generated keys</p>
                        </div>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-6 py-10 max-w-4xl">
                <div className="space-y-8 stagger-in">

                    {/* Info Banner */}
                    <div className="glass-card p-6 border-emerald-500/20 bg-emerald-950">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                                <Key className="w-5 h-5 text-emerald-400" />
                            </div>
                            <p className="text-sm text-[#a0a0b4] leading-relaxed">
                                Use the quantum key generated from <span className="text-blue-400 font-medium">BB84</span> or{' '}
                                <span className="text-purple-400 font-medium">E91</span> simulation to encrypt
                                your messages with AES-256. The quantum key provides information-theoretic
                                security for key distribution.
                            </p>
                        </div>
                    </div>

                    {/* Mode Toggle */}
                    <div className="flex justify-center">
                        <div className="inline-flex rounded-xl bg-[#0c0c16] border border-[#1a1a2e] p-1">
                            <button
                                onClick={() => { setMode('encrypt'); setOutputText(''); setError(null); }}
                                className={`px-8 py-2.5 rounded-lg font-medium flex items-center gap-2 text-sm transition-all ${
                                    mode === 'encrypt'
                                        ? 'bg-emerald-500/20 text-emerald-300 shadow-lg shadow-emerald-500/10'
                                        : 'text-[#6a6a82] hover:text-[#d4d4e0]'
                                }`}
                            >
                                <Lock className="w-4 h-4" />
                                Encrypt
                            </button>
                            <button
                                onClick={() => { setMode('decrypt'); setOutputText(''); setError(null); }}
                                className={`px-8 py-2.5 rounded-lg font-medium flex items-center gap-2 text-sm transition-all ${
                                    mode === 'decrypt'
                                        ? 'bg-emerald-500/20 text-emerald-300 shadow-lg shadow-emerald-500/10'
                                        : 'text-[#6a6a82] hover:text-[#d4d4e0]'
                                }`}
                            >
                                <Unlock className="w-4 h-4" />
                                Decrypt
                            </button>
                        </div>
                    </div>

                    {/* Quantum Key Input */}
                    <div className="glass-card p-7">
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-medium text-[#d4d4e0] flex items-center gap-2">
                                <Key className="w-4 h-4 text-emerald-400" />
                                Quantum Key (bits)
                            </label>
                            <button
                                onClick={generateSampleKey}
                                className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
                            >
                                <Sparkles className="w-3.5 h-3.5" />
                                Generate Sample
                            </button>
                        </div>
                        <textarea
                            value={quantumKey}
                            onChange={(e) => setQuantumKey(e.target.value)}
                            placeholder="Paste your quantum key here (e.g., 1 0 1 1 0 0 1 0 ...)"
                            className="w-full h-24 px-4 py-3 bg-[#06060e] border border-[#2a2a42] rounded-xl text-white font-mono text-sm focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 focus:outline-none resize-none transition-all placeholder:text-[#44445a]"
                        />
                        <div className="flex items-center gap-2 mt-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${
                                keyBits.length >= 256 ? 'bg-emerald-400' :
                                keyBits.length >= 128 ? 'bg-amber-400' : 'bg-red-400'
                            }`} />
                            <p className="text-xs text-[#6a6a82]">
                                {keyBits.length} bits
                                {keyBits.length >= 256 && ' — AES-256 ready'}
                                {keyBits.length >= 128 && keyBits.length < 256 && ' — AES-128 ready'}
                                {keyBits.length < 128 && ' — Need at least 128 bits'}
                            </p>
                        </div>
                    </div>

                    {/* Key Size Selection */}
                    <div className="glass-card p-7">
                        <label className="text-sm font-medium text-[#d4d4e0] mb-3 block">
                            AES Key Size
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {[128, 192, 256].map((size) => (
                                <button
                                    key={size}
                                    onClick={() => setKeySize(size)}
                                    className={`py-3 rounded-xl font-semibold text-sm transition-all ${
                                        keySize === size
                                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                                            : 'bg-[#06060e] text-[#6a6a82] border border-[#1a1a2e] hover:border-[#2a2a42] hover:text-[#d4d4e0]'
                                    }`}
                                >
                                    AES-{size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Input Text */}
                    <div className="glass-card p-7">
                        <label className="text-sm font-medium text-[#d4d4e0] mb-3 block">
                            {mode === 'encrypt' ? 'Plaintext Message' : 'Ciphertext (Base64)'}
                        </label>
                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder={mode === 'encrypt'
                                ? 'Enter your secret message...'
                                : 'Paste the Base64 encoded ciphertext...'
                            }
                            className="w-full h-32 px-4 py-3 bg-[#06060e] border border-[#2a2a42] rounded-xl text-white text-sm focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 focus:outline-none resize-none transition-all placeholder:text-[#44445a]"
                        />
                    </div>

                    {/* IV Input (for decryption) */}
                    {mode === 'decrypt' && (
                        <div className="glass-card p-7 fade-in">
                            <label className="text-sm font-medium text-[#d4d4e0] mb-3 block">
                                Initialization Vector (IV)
                            </label>
                            <input
                                type="text"
                                value={iv}
                                onChange={(e) => setIv(e.target.value)}
                                placeholder="Base64 encoded IV from encryption"
                                className="w-full px-4 py-3 bg-[#06060e] border border-[#2a2a42] rounded-xl text-white font-mono text-sm focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 focus:outline-none transition-all placeholder:text-[#44445a]"
                            />
                        </div>
                    )}

                    {/* Action Button */}
                    <button
                        onClick={mode === 'encrypt' ? handleEncrypt : handleDecrypt}
                        disabled={isProcessing || !keyReady || !inputText}
                        className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-xl font-semibold text-white text-lg transition-all cursor-pointer bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 hover:shadow-lg hover:shadow-emerald-500/25 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                    >
                        {isProcessing ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                Processing...
                            </>
                        ) : mode === 'encrypt' ? (
                            <>
                                <Lock className="w-5 h-5" />
                                Encrypt Message
                            </>
                        ) : (
                            <>
                                <Unlock className="w-5 h-5" />
                                Decrypt Message
                            </>
                        )}
                    </button>

                    {/* Error Display */}
                    {error && (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 fade-in">
                            <div className="flex items-center gap-3">
                                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                                <p className="text-red-400 text-sm">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Output */}
                    {outputText && (
                        <div className="glass-card p-7 space-y-5 fade-in border-emerald-500/20">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-[#d4d4e0] flex items-center gap-2">
                                    <Check className="w-4 h-4 text-emerald-400" />
                                    {mode === 'encrypt' ? 'Encrypted Output' : 'Decrypted Message'}
                                </label>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => copyToClipboard(outputText, 'output')}
                                        className="p-2 rounded-lg text-[#6a6a82] hover:text-white hover:bg-[#06060e] transition-all"
                                        title="Copy to clipboard"
                                    >
                                        {copied === 'output' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                    <button
                                        onClick={() => downloadFile(outputText, mode === 'encrypt' ? 'encrypted.txt' : 'decrypted.txt')}
                                        className="p-2 rounded-lg text-[#6a6a82] hover:text-white hover:bg-[#06060e] transition-all"
                                        title="Download"
                                    >
                                        <Download className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-4 bg-[#06060e] rounded-xl border border-[#1a1a2e]">
                                <p className={`font-mono text-sm ${mode === 'encrypt' ? 'break-all text-emerald-400' : 'text-emerald-300'}`}>
                                    {outputText}
                                </p>
                            </div>

                            {/* IV after encryption */}
                            {mode === 'encrypt' && iv && (
                                <div>
                                    <label className="text-sm font-medium text-[#d4d4e0] mb-2 block">
                                        Initialization Vector
                                        <span className="text-[#44445a] font-normal ml-1">(save for decryption)</span>
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <code className="flex-1 p-3 bg-[#06060e] rounded-xl border border-[#1a1a2e] font-mono text-sm text-amber-400 break-all">
                                            {iv}
                                        </code>
                                        <button
                                            onClick={() => copyToClipboard(iv, 'iv')}
                                            className="p-2.5 rounded-lg text-[#6a6a82] hover:text-white hover:bg-[#06060e] transition-all flex-shrink-0"
                                        >
                                            {copied === 'iv' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Metadata */}
                            {result && (
                                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#1a1a2e]">
                                    {result.algorithm && (
                                        <div>
                                            <div className="text-[11px] text-[#44445a] uppercase tracking-wider mb-1">Algorithm</div>
                                            <div className="text-sm text-white font-medium">{result.algorithm}</div>
                                        </div>
                                    )}
                                    {result.keyHash && (
                                        <div>
                                            <div className="text-[11px] text-[#44445a] uppercase tracking-wider mb-1 flex items-center gap-1">
                                                <Hash className="w-3 h-3" />
                                                Key Hash
                                            </div>
                                            <div className="text-sm text-white font-mono truncate">{result.keyHash}</div>
                                        </div>
                                    )}
                                    {result.keyBitsUsed && (
                                        <div>
                                            <div className="text-[11px] text-[#44445a] uppercase tracking-wider mb-1">Bits Used</div>
                                            <div className="text-sm text-white font-medium">{result.keyBitsUsed}</div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default EncryptionPage;
