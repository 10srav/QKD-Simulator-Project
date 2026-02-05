/**
 * Security Analysis Component
 * Displays detailed security metrics and recommendations
 */
import React from 'react';
import {
    Shield,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Info,
    Lock,
    Unlock,
    Eye
} from 'lucide-react';
import type { BB84Result, E91Result } from '../../types';

interface SecurityAnalysisProps {
    result: BB84Result | E91Result;
    protocol: 'BB84' | 'E91';
}

export const SecurityAnalysis: React.FC<SecurityAnalysisProps> = ({
    result,
    protocol
}) => {
    const isSecure = result.is_secure;
    const isBB84 = protocol === 'BB84';

    // Get protocol-specific metrics
    const qber = isBB84 ? (result as BB84Result).qber : null;
    const sParameter = !isBB84 ? (result as E91Result).chsh_result.s_parameter : null;
    const eveDetected = result.eve_detected;

    // Security level calculation
    const getSecurityLevel = () => {
        if (isBB84 && qber !== null) {
            if (qber <= 5) return { level: 'Excellent', color: 'emerald', score: 95 };
            if (qber <= 8.5) return { level: 'Good', color: 'green', score: 75 };
            if (qber <= 15) return { level: 'Poor', color: 'amber', score: 40 };
            return { level: 'Compromised', color: 'red', score: 10 };
        } else if (sParameter !== null) {
            if (sParameter > 2.5) return { level: 'Excellent', color: 'emerald', score: 95 };
            if (sParameter > 2.0) return { level: 'Good', color: 'green', score: 70 };
            if (sParameter > 1.5) return { level: 'Poor', color: 'amber', score: 35 };
            return { level: 'Compromised', color: 'red', score: 10 };
        }
        return { level: 'Unknown', color: 'slate', score: 0 };
    };

    const security = getSecurityLevel();

    return (
        <div className="glass-card p-6 space-y-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-400" />
                Security Analysis
            </h3>

            {/* Security Score */}
            <div className="flex items-center gap-6">
                <div className="relative w-24 h-24">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                        <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke="rgba(100, 116, 139, 0.2)"
                            strokeWidth="8"
                        />
                        <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke={`var(--${security.color}-500, #22c55e)`}
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={`${security.score * 2.51} 251`}
                            className={`text-${security.color}-500`}
                            style={{
                                stroke: security.color === 'emerald' ? '#10b981' :
                                    security.color === 'green' ? '#22c55e' :
                                        security.color === 'amber' ? '#f59e0b' :
                                            security.color === 'red' ? '#ef4444' : '#64748b'
                            }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">{security.score}</span>
                    </div>
                </div>

                <div>
                    <div className={`text-xl font-bold ${security.color === 'emerald' || security.color === 'green' ? 'text-emerald-400' :
                            security.color === 'amber' ? 'text-amber-400' : 'text-red-400'
                        }`}>
                        {security.level}
                    </div>
                    <p className="text-slate-400 text-sm">Security Level</p>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
                {isBB84 && qber !== null && (
                    <>
                        <div className="p-4 bg-slate-800/50 rounded-lg">
                            <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
                                <Info className="w-4 h-4" />
                                QBER
                            </div>
                            <div className={`text-xl font-bold ${qber <= 8.5 ? 'text-emerald-400' : 'text-red-400'
                                }`}>
                                {qber.toFixed(2)}%
                            </div>
                            <div className="text-xs text-slate-500">Threshold: 8.5%</div>
                        </div>

                        <div className="p-4 bg-slate-800/50 rounded-lg">
                            <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
                                <Info className="w-4 h-4" />
                                Info Leakage
                            </div>
                            <div className="text-xl font-bold text-white">
                                {((result as BB84Result).information_leakage || 0).toFixed(1)}%
                            </div>
                            <div className="text-xs text-slate-500">To Eve</div>
                        </div>
                    </>
                )}

                {!isBB84 && sParameter !== null && (
                    <>
                        <div className="p-4 bg-slate-800/50 rounded-lg">
                            <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
                                <Info className="w-4 h-4" />
                                S-Parameter
                            </div>
                            <div className={`text-xl font-bold ${sParameter > 2 ? 'text-emerald-400' : 'text-red-400'
                                }`}>
                                {sParameter.toFixed(3)}
                            </div>
                            <div className="text-xs text-slate-500">Classical: 2.0</div>
                        </div>

                        <div className="p-4 bg-slate-800/50 rounded-lg">
                            <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
                                <Info className="w-4 h-4" />
                                Key Match
                            </div>
                            <div className="text-xl font-bold text-white">
                                {(result as E91Result).key_match_rate.toFixed(1)}%
                            </div>
                            <div className="text-xs text-slate-500">Alice ↔ Bob</div>
                        </div>
                    </>
                )}
            </div>

            {/* Status Indicators */}
            <div className="space-y-3">
                <div className={`flex items-center gap-3 p-3 rounded-lg ${isSecure ? 'bg-emerald-500/10' : 'bg-red-500/10'
                    }`}>
                    {isSecure ? (
                        <Lock className="w-5 h-5 text-emerald-400" />
                    ) : (
                        <Unlock className="w-5 h-5 text-red-400" />
                    )}
                    <div>
                        <span className={isSecure ? 'text-emerald-400' : 'text-red-400'}>
                            Channel {isSecure ? 'Secure' : 'Compromised'}
                        </span>
                        <p className="text-xs text-slate-400">
                            {isBB84
                                ? `QBER ${isSecure ? 'below' : 'above'} 8.5% threshold`
                                : `CHSH ${isSecure ? 'violation confirmed' : 'violation failed'}`}
                        </p>
                    </div>
                </div>

                <div className={`flex items-center gap-3 p-3 rounded-lg ${eveDetected ? 'bg-red-500/10' : 'bg-slate-800/50'
                    }`}>
                    <Eye className={`w-5 h-5 ${eveDetected ? 'text-red-400' : 'text-slate-400'}`} />
                    <div>
                        <span className={eveDetected ? 'text-red-400' : 'text-slate-400'}>
                            Eavesdropper {eveDetected ? 'Detected!' : 'Not Detected'}
                        </span>
                        <p className="text-xs text-slate-400">
                            {eveDetected
                                ? 'Quantum errors indicate interception'
                                : 'No evidence of interception'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Recommendations */}
            <div className="border-t border-slate-700 pt-4">
                <h4 className="text-sm font-semibold text-white mb-3">Recommendations</h4>
                <ul className="space-y-2 text-sm">
                    {isSecure ? (
                        <>
                            <li className="flex items-start gap-2 text-slate-300">
                                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                                Key can be used for secure communication
                            </li>
                            <li className="flex items-start gap-2 text-slate-300">
                                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                                Consider privacy amplification for added security
                            </li>
                            {isBB84 && qber && qber > 5 && (
                                <li className="flex items-start gap-2 text-slate-300">
                                    <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                                    Error rate suggests noisy channel - verify equipment
                                </li>
                            )}
                        </>
                    ) : (
                        <>
                            <li className="flex items-start gap-2 text-slate-300">
                                <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                                Abort key exchange immediately
                            </li>
                            <li className="flex items-start gap-2 text-slate-300">
                                <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                                Quantum channel may be compromised
                            </li>
                            <li className="flex items-start gap-2 text-slate-300">
                                <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                                Investigate for physical tampering or interference
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default SecurityAnalysis;
