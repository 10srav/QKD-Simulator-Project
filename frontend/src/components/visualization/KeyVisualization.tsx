/**
 * Key Visualization Component
 * Displays Alice and Bob's generated keys with comparison
 */
import React, { useState } from 'react';
import { Copy, Check, Download } from 'lucide-react';

interface KeyVisualizationProps {
    aliceKey: number[];
    bobKey: number[];
}

export const KeyVisualization: React.FC<KeyVisualizationProps> = ({
    aliceKey,
    bobKey
}) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        const keyString = aliceKey.join('');
        navigator.clipboard.writeText(keyString);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const keyString = aliceKey.join('');
        const blob = new Blob([keyString], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'quantum_key.txt';
        a.click();
        URL.revokeObjectURL(url);
    };

    // Calculate statistics
    const matches = aliceKey.filter((bit, i) => bit === bobKey[i]).length;
    const matchRate = (matches / aliceKey.length) * 100;
    const keyLengthBits = aliceKey.length;
    const keyLengthBytes = Math.floor(keyLengthBits / 8);

    return (
        <div className="space-y-6">
            {/* Key Statistics */}
            <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                    <div className="text-2xl font-bold text-white">{keyLengthBits}</div>
                    <div className="text-sm text-slate-400">Bits</div>
                </div>
                <div>
                    <div className="text-2xl font-bold text-white">{keyLengthBytes}</div>
                    <div className="text-sm text-slate-400">Bytes</div>
                </div>
                <div>
                    <div className={`text-2xl font-bold ${matchRate === 100 ? 'text-emerald-400' : 'text-amber-400'
                        }`}>
                        {matchRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-slate-400">Match</div>
                </div>
            </div>

            {/* Key Display */}
            <div className="space-y-4">
                {/* Alice's Key */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-400">Alice's Key</span>
                        <span className="text-xs text-slate-500">Sender</span>
                    </div>
                    <div className="flex flex-wrap gap-1 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                        {aliceKey.map((bit, index) => (
                            <span
                                key={`alice-${index}`}
                                className={`key-bit ${bit === bobKey[index]
                                        ? bit === 1 ? 'key-bit-1' : 'key-bit-0'
                                        : 'key-bit-mismatch'
                                    }`}
                                title={`Bit ${index}: ${bit}`}
                            >
                                {bit}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Bob's Key */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-green-400">Bob's Key</span>
                        <span className="text-xs text-slate-500">Receiver</span>
                    </div>
                    <div className="flex flex-wrap gap-1 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                        {bobKey.map((bit, index) => (
                            <span
                                key={`bob-${index}`}
                                className={`key-bit ${bit === aliceKey[index]
                                        ? bit === 1 ? 'key-bit-1' : 'key-bit-0'
                                        : 'key-bit-mismatch'
                                    }`}
                                title={`Bit ${index}: ${bit}`}
                            >
                                {bit}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                    <span className="key-bit key-bit-0">0</span>
                    <span className="text-slate-400">Zero</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="key-bit key-bit-1">1</span>
                    <span className="text-slate-400">One</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="key-bit key-bit-mismatch">!</span>
                    <span className="text-slate-400">Mismatch</span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-center gap-3">
                <button
                    onClick={handleCopy}
                    className="btn-secondary flex items-center gap-2 text-sm"
                >
                    {copied ? (
                        <>
                            <Check className="w-4 h-4 text-emerald-400" />
                            Copied!
                        </>
                    ) : (
                        <>
                            <Copy className="w-4 h-4" />
                            Copy Key
                        </>
                    )}
                </button>
                <button
                    onClick={handleDownload}
                    className="btn-secondary flex items-center gap-2 text-sm"
                >
                    <Download className="w-4 h-4" />
                    Download
                </button>
            </div>

            {/* Binary String Display */}
            <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400">Binary String</span>
                    <span className="text-xs text-slate-500">{aliceKey.length} bits</span>
                </div>
                <code className="block text-sm text-indigo-300 font-mono break-all">
                    {aliceKey.join('')}
                </code>
            </div>

            {/* AES Compatibility Note */}
            <div className={`p-3 rounded-lg text-sm ${keyLengthBits >= 128
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                    : 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                }`}>
                {keyLengthBits >= 256
                    ? '✓ Key is suitable for AES-256 encryption'
                    : keyLengthBits >= 128
                        ? '✓ Key is suitable for AES-128 encryption'
                        : `⚠ Key too short for AES (need 128+ bits, have ${keyLengthBits})`}
            </div>
        </div>
    );
};

export default KeyVisualization;
