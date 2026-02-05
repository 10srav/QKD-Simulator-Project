/**
 * Simulation Detail Modal
 * Shows full simulation configuration, results, and metrics from history.
 * Supports JSON export/download.
 */
import React, { useEffect, useState } from 'react';
import {
    X,
    Download,
    Copy,
    CheckCircle,
    XCircle,
    Shield,
    Atom,
    Eye,
    EyeOff,
    Clock,
    Key,
    AlertTriangle,
    FileJson,
} from 'lucide-react';
import { historyService, type HistoryDetail } from '../../services/historyService';

interface SimulationDetailModalProps {
    simulationId: string;
    onClose: () => void;
}

export const SimulationDetailModal: React.FC<SimulationDetailModalProps> = ({
    simulationId,
    onClose,
}) => {
    const [detail, setDetail] = useState<HistoryDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const data = await historyService.getDetail(simulationId);
                setDetail(data);
            } catch {
                setError('Failed to load simulation details');
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [simulationId]);

    // Close on Escape key
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [onClose]);

    const handleExportJSON = () => {
        if (!detail) return;
        const blob = new Blob([JSON.stringify(detail, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `simulation-${detail.protocol.toLowerCase()}-${detail.id.slice(0, 8)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleCopyJSON = async () => {
        if (!detail) return;
        await navigator.clipboard.writeText(JSON.stringify(detail, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const formatDate = (iso: string) => {
        return new Date(iso).toLocaleString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 modal-overlay"
            onClick={onClose}
        >
            <div
                className="glass-card max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col modal-content"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
                    <div className="flex items-center gap-3">
                        {detail?.protocol === 'BB84' ? (
                            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                <Shield className="w-5 h-5 text-blue-400" />
                            </div>
                        ) : (
                            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                <Atom className="w-5 h-5 text-purple-400" />
                            </div>
                        )}
                        <div>
                            <h2 className="text-lg font-bold text-white">
                                {detail?.protocol || 'Loading...'} Simulation Detail
                            </h2>
                            {detail && (
                                <p className="text-xs text-slate-400">{formatDate(detail.created_at)}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleCopyJSON}
                            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title="Copy as JSON"
                        >
                            {copied ? (
                                <CheckCircle className="w-5 h-5 text-green-400" />
                            ) : (
                                <Copy className="w-5 h-5" />
                            )}
                        </button>
                        <button
                            onClick={handleExportJSON}
                            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title="Download JSON"
                        >
                            <Download className="w-5 h-5" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {loading && (
                        <div className="text-center py-12">
                            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-slate-400">Loading details...</p>
                        </div>
                    )}

                    {error && (
                        <div className="p-4 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5" />
                            {error}
                        </div>
                    )}

                    {detail && (
                        <>
                            {/* Security Status */}
                            <div className={`p-4 rounded-xl flex items-center gap-4 ${
                                detail.is_secure
                                    ? 'bg-emerald-500/10 border border-emerald-500/30'
                                    : 'bg-red-500/10 border border-red-500/30'
                            }`}>
                                {detail.is_secure ? (
                                    <CheckCircle className="w-8 h-8 text-emerald-400 flex-shrink-0" />
                                ) : (
                                    <XCircle className="w-8 h-8 text-red-400 flex-shrink-0" />
                                )}
                                <div>
                                    <h3 className={`font-bold ${detail.is_secure ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {detail.is_secure ? 'Secure Channel Established' : 'Security Compromised'}
                                    </h3>
                                    <p className="text-sm text-slate-400">
                                        {detail.protocol === 'BB84'
                                            ? `QBER: ${detail.qber?.toFixed(2)}% (threshold: 8.5%)`
                                            : `S-parameter: ${detail.s_parameter?.toFixed(4)} (threshold: 2.0)`
                                        }
                                    </p>
                                </div>
                            </div>

                            {/* Key Metrics */}
                            <div>
                                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
                                    Key Metrics
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {detail.qber !== null && (
                                        <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                                            <div className={`text-xl font-bold font-mono ${
                                                detail.qber <= 5 ? 'text-green-400' : detail.qber <= 8.5 ? 'text-amber-400' : 'text-red-400'
                                            }`}>
                                                {detail.qber.toFixed(2)}%
                                            </div>
                                            <div className="text-xs text-slate-400 mt-1">QBER</div>
                                        </div>
                                    )}
                                    {detail.s_parameter !== null && (
                                        <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                                            <div className={`text-xl font-bold font-mono ${
                                                detail.s_parameter > 2.5 ? 'text-green-400' : detail.s_parameter > 2 ? 'text-amber-400' : 'text-red-400'
                                            }`}>
                                                {detail.s_parameter.toFixed(4)}
                                            </div>
                                            <div className="text-xs text-slate-400 mt-1">S-Parameter</div>
                                        </div>
                                    )}
                                    <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                                        <div className="text-xl font-bold font-mono text-white flex items-center justify-center gap-1">
                                            <Key className="w-4 h-4 text-indigo-400" />
                                            {detail.sifted_key_length}
                                        </div>
                                        <div className="text-xs text-slate-400 mt-1">Key Bits</div>
                                    </div>
                                    <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                                        <div className="text-xl font-bold font-mono text-white flex items-center justify-center gap-1">
                                            <Clock className="w-4 h-4 text-cyan-400" />
                                            {detail.execution_time_ms.toFixed(0)}
                                        </div>
                                        <div className="text-xs text-slate-400 mt-1">Time (ms)</div>
                                    </div>
                                    {detail.key_efficiency !== null && (
                                        <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                                            <div className="text-xl font-bold font-mono text-indigo-400">
                                                {(detail.key_efficiency * 100).toFixed(1)}%
                                            </div>
                                            <div className="text-xs text-slate-400 mt-1">Efficiency</div>
                                        </div>
                                    )}
                                    {detail.key_match_rate !== null && (
                                        <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                                            <div className="text-xl font-bold font-mono text-indigo-400">
                                                {detail.key_match_rate.toFixed(1)}%
                                            </div>
                                            <div className="text-xs text-slate-400 mt-1">Match Rate</div>
                                        </div>
                                    )}
                                    <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                                        <div className="flex items-center justify-center">
                                            {detail.eve_attack ? (
                                                <Eye className="w-6 h-6 text-red-400" />
                                            ) : (
                                                <EyeOff className="w-6 h-6 text-slate-500" />
                                            )}
                                        </div>
                                        <div className="text-xs text-slate-400 mt-1">
                                            {detail.eve_attack ? 'Eve Active' : 'No Eve'}
                                        </div>
                                    </div>
                                    {detail.eve_attack && (
                                        <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                                            <div className="flex items-center justify-center">
                                                {detail.eve_detected ? (
                                                    <CheckCircle className="w-6 h-6 text-green-400" />
                                                ) : (
                                                    <XCircle className="w-6 h-6 text-red-400" />
                                                )}
                                            </div>
                                            <div className="text-xs text-slate-400 mt-1">
                                                {detail.eve_detected ? 'Eve Detected' : 'Eve Undetected'}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Configuration */}
                            <div>
                                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
                                    Simulation Configuration
                                </h3>
                                <div className="bg-slate-800/50 rounded-lg p-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        {Object.entries(detail.config).map(([key, value]) => (
                                            <div key={key} className="flex justify-between items-center py-1">
                                                <span className="text-sm text-slate-400">{key}</span>
                                                <span className="text-sm text-white font-mono">
                                                    {Array.isArray(value) ? value.join(', ') : String(value)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Full Result JSON */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                                        <FileJson className="w-4 h-4" />
                                        Full Result Data
                                    </h3>
                                    <button
                                        onClick={handleExportJSON}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700 transition-colors"
                                    >
                                        <Download className="w-3 h-3" />
                                        Export JSON
                                    </button>
                                </div>
                                <pre className="bg-slate-950/50 rounded-lg p-4 overflow-x-auto text-xs font-mono text-slate-300 max-h-64 overflow-y-auto border border-slate-800">
                                    {JSON.stringify(detail.full_result, null, 2)}
                                </pre>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SimulationDetailModal;
