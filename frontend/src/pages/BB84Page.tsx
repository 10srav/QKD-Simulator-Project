/**
 * BB84 Simulation Page
 * Polished layout with protocol-themed accents and metric cards.
 */
import React, { useState } from 'react';
import {
    Play,
    Settings,
    Shield,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Eye,
    EyeOff,
    RotateCcw,
    ChevronDown,
    ChevronUp,
    Zap,
    Clock,
    Key,
    Activity,
} from 'lucide-react';
import { useSimulationStore } from '../store';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { CircuitRenderer } from '../components/visualization/CircuitRenderer';
import { QBERChart } from '../components/visualization/QBERChart';
import { KeyVisualization } from '../components/visualization/KeyVisualization';
import { SecurityAnalysis } from '../components/analysis/SecurityAnalysis';

const BB84Page: React.FC = () => {
    const {
        bb84Config,
        bb84Result,
        status,
        error,
        updateBB84Config,
        runBB84Simulation,
        clearResults,
    } = useSimulationStore();

    const [showAdvanced, setShowAdvanced] = useState(false);

    const handleRunSimulation = async () => {
        await runBB84Simulation();
    };

    const isRunning = status === 'running';
    const hasResult = status === 'completed' && bb84Result;

    return (
        <div className="min-h-screen">
            {/* Page Header */}
            <div className="page-header">
                <div className="container mx-auto px-6 py-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">BB84 Protocol</h1>
                                <p className="text-sm text-[#a0a0b4]">Bennett-Brassard 1984 &middot; Polarization-Based QKD</p>
                            </div>
                        </div>
                        {hasResult && (
                            <button
                                onClick={clearResults}
                                className="btn-secondary flex items-center gap-2 text-sm"
                            >
                                <RotateCcw className="w-4 h-4" />
                                New Simulation
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-6 py-10">
                <div className="grid lg:grid-cols-3 gap-10">
                    {/* Configuration Panel */}
                    <div className="lg:col-span-1">
                        <div className="glass-card card-glow-blue p-7 sticky top-24">
                            <h2 className="text-sm font-semibold text-[#6a6a82] uppercase tracking-widest mb-6 flex items-center gap-2">
                                <div className="w-1 h-5 rounded-full bg-blue-500" />
                                <Settings className="w-4 h-4 text-blue-400" />
                                Configuration
                            </h2>

                            {/* Qubit Count */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-[#d4d4e0] mb-2.5">
                                    Number of Qubits
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[9, 12, 16].map((n) => (
                                        <button
                                            key={n}
                                            onClick={() => updateBB84Config({ n_qubits: n })}
                                            disabled={isRunning}
                                            className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${
                                                bb84Config.n_qubits === n
                                                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-lg shadow-blue-500/10'
                                                    : 'bg-[#06060e] text-[#a0a0b4] border border-[#1a1a2e] hover:border-[#2a2a42] hover:text-[#d4d4e0]'
                                            }`}
                                        >
                                            {n}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Bases Selection */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-[#d4d4e0] mb-2.5">
                                    Measurement Bases
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(['Z', 'X', 'D'] as const).map((basis) => {
                                        const isSelected = bb84Config.bases.includes(basis);
                                        return (
                                            <button
                                                key={basis}
                                                onClick={() => {
                                                    const newBases = isSelected
                                                        ? bb84Config.bases.filter((b) => b !== basis)
                                                        : [...bb84Config.bases, basis];
                                                    if (newBases.length > 0) {
                                                        updateBB84Config({ bases: newBases });
                                                    }
                                                }}
                                                disabled={isRunning}
                                                className={`py-2.5 rounded-xl font-mono font-bold text-sm transition-all ${
                                                    isSelected
                                                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                                                        : 'bg-[#06060e] text-[#6a6a82] border border-[#1a1a2e] hover:border-[#2a2a42]'
                                                }`}
                                            >
                                                {basis}
                                            </button>
                                        );
                                    })}
                                </div>
                                <p className="text-[11px] text-[#44445a] mt-2">
                                    Z: Computational &middot; X: Hadamard &middot; D: Diagonal
                                </p>
                            </div>

                            <div className="section-divider my-6" />

                            {/* Eve Attack Toggle */}
                            <div className="mb-6">
                                <button
                                    onClick={() => updateBB84Config({ eve_attack: !bb84Config.eve_attack })}
                                    disabled={isRunning}
                                    className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
                                        bb84Config.eve_attack
                                            ? 'bg-red-500/10 border border-red-500/25'
                                            : 'bg-[#06060e] border border-[#1a1a2e] hover:border-[#2a2a42]'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {bb84Config.eve_attack ? (
                                            <Eye className="w-5 h-5 text-red-400" />
                                        ) : (
                                            <EyeOff className="w-5 h-5 text-[#6a6a82]" />
                                        )}
                                        <div className="text-left">
                                            <span className="font-medium text-white text-sm">Eavesdropper (Eve)</span>
                                            <p className="text-[11px] text-[#6a6a82]">Intercept-resend attack</p>
                                        </div>
                                    </div>
                                    <div className={`w-10 h-6 rounded-full relative transition-colors ${
                                        bb84Config.eve_attack ? 'bg-red-500' : 'bg-slate-700'
                                    }`}>
                                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                                            bb84Config.eve_attack ? 'translate-x-5' : 'translate-x-1'
                                        }`} />
                                    </div>
                                </button>
                            </div>

                            {/* Eve Intercept Ratio */}
                            {bb84Config.eve_attack && (
                                <div className="mb-6 fade-in">
                                    <label className="block text-sm font-medium text-[#d4d4e0] mb-2.5">
                                        Interception Rate
                                        <span className="ml-2 text-red-400 font-mono">
                                            {Math.round(bb84Config.eve_intercept_ratio * 100)}%
                                        </span>
                                    </label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={bb84Config.eve_intercept_ratio * 100}
                                        onChange={(e) => updateBB84Config({
                                            eve_intercept_ratio: parseInt(e.target.value) / 100
                                        })}
                                        disabled={isRunning}
                                    />
                                </div>
                            )}

                            {/* Advanced Options */}
                            <button
                                onClick={() => setShowAdvanced(!showAdvanced)}
                                className="flex items-center gap-1.5 text-sm text-[#6a6a82] hover:text-[#d4d4e0] transition-colors mb-5"
                            >
                                {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                Advanced Options
                            </button>

                            {showAdvanced && (
                                <div className="mb-6 fade-in">
                                    <label className="block text-sm font-medium text-[#d4d4e0] mb-2.5">
                                        Simulation Shots
                                    </label>
                                    <select
                                        value={bb84Config.shots}
                                        onChange={(e) => updateBB84Config({ shots: parseInt(e.target.value) })}
                                        className="input-field"
                                        disabled={isRunning}
                                    >
                                        <option value={512}>512 shots</option>
                                        <option value={1024}>1024 shots</option>
                                        <option value={2048}>2048 shots</option>
                                        <option value={4096}>4096 shots</option>
                                    </select>
                                </div>
                            )}

                            {/* Run Button */}
                            <button
                                onClick={handleRunSimulation}
                                disabled={isRunning}
                                className="btn-primary w-full flex items-center justify-center gap-2.5"
                            >
                                {isRunning ? (
                                    <>
                                        <div className="quantum-loader w-5 h-5" style={{ width: 20, height: 20 }}>
                                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        </div>
                                        <span>Running Simulation...</span>
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-5 h-5" />
                                        <span>Run Simulation</span>
                                    </>
                                )}
                            </button>

                            {/* Error Display */}
                            {error && (
                                <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm fade-in">
                                    <div className="flex items-center gap-2 mb-1 font-medium">
                                        <AlertTriangle className="w-4 h-4" />
                                        Simulation Error
                                    </div>
                                    <p className="text-red-400/80">{error}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Results Panel */}
                    <div className="lg:col-span-2">
                        {isRunning && (
                            <div className="glass-card p-16 text-center">
                                <LoadingSpinner size="lg" message="Running BB84 quantum simulation..." />
                            </div>
                        )}

                        {hasResult && (
                            <div className="space-y-8 stagger-in">
                                {/* Security Status Banner */}
                                <div className={`p-6 ${bb84Result.is_secure ? 'security-banner-secure' : 'security-banner-insecure'}`}>
                                    <div className="flex items-center gap-4">
                                        {bb84Result.is_secure ? (
                                            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 flex items-center justify-center">
                                                <CheckCircle className="w-8 h-8 text-emerald-400" />
                                            </div>
                                        ) : (
                                            <div className="w-14 h-14 rounded-2xl bg-red-500/15 flex items-center justify-center">
                                                <XCircle className="w-8 h-8 text-red-400" />
                                            </div>
                                        )}
                                        <div>
                                            <h3 className={`text-xl font-bold ${bb84Result.is_secure ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {bb84Result.is_secure ? 'Secure Channel Established' : 'Eavesdropper Detected!'}
                                            </h3>
                                            <p className="text-[#a0a0b4] text-sm mt-0.5">
                                                QBER: {bb84Result.qber.toFixed(2)}%
                                                {bb84Result.is_secure ? ' — below 8.5% threshold' : ' — exceeds 8.5% threshold'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Metrics Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="metric-card metric-card-blue">
                                        <Activity className="w-4 h-4 text-blue-400 mx-auto mb-2" />
                                        <div className="metric-value text-white">{bb84Result.qber.toFixed(2)}%</div>
                                        <div className="metric-label">QBER</div>
                                    </div>
                                    <div className="metric-card metric-card-indigo">
                                        <Key className="w-4 h-4 text-indigo-400 mx-auto mb-2" />
                                        <div className="metric-value text-white">{bb84Result.sifted_alice_key.length}</div>
                                        <div className="metric-label">Key Length</div>
                                    </div>
                                    <div className="metric-card metric-card-cyan">
                                        <Zap className="w-4 h-4 text-cyan-400 mx-auto mb-2" />
                                        <div className="metric-value text-white">{(bb84Result.key_efficiency * 100).toFixed(1)}%</div>
                                        <div className="metric-label">Efficiency</div>
                                    </div>
                                    <div className="metric-card metric-card-purple">
                                        <Clock className="w-4 h-4 text-purple-400 mx-auto mb-2" />
                                        <div className="metric-value text-white">{bb84Result.execution_time_ms.toFixed(0)}ms</div>
                                        <div className="metric-label">Exec Time</div>
                                    </div>
                                </div>

                                {/* Quantum Circuit */}
                                <div className="glass-card p-7">
                                    <h3 className="text-sm font-semibold text-[#6a6a82] uppercase tracking-widest mb-5 flex items-center gap-2">
                                        <div className="w-1 h-5 rounded-full bg-blue-500" />
                                        Quantum Circuit
                                    </h3>
                                    <CircuitRenderer circuit={bb84Result.circuit_json} />
                                </div>

                                {/* Key Visualization */}
                                <div className="glass-card p-7">
                                    <h3 className="text-sm font-semibold text-[#6a6a82] uppercase tracking-widest mb-5 flex items-center gap-2">
                                        <div className="w-1 h-5 rounded-full bg-indigo-500" />
                                        Generated Keys
                                    </h3>
                                    <KeyVisualization
                                        aliceKey={bb84Result.sifted_alice_key}
                                        bobKey={bb84Result.sifted_bob_key}
                                    />
                                </div>

                                {/* QBER Chart */}
                                <div className="glass-card p-7">
                                    <h3 className="text-sm font-semibold text-[#6a6a82] uppercase tracking-widest mb-5 flex items-center gap-2">
                                        <div className="w-1 h-5 rounded-full bg-cyan-500" />
                                        QBER Analysis
                                    </h3>
                                    <QBERChart qber={bb84Result.qber} threshold={8.5} />
                                </div>

                                {/* Security Analysis */}
                                <SecurityAnalysis result={bb84Result} protocol="BB84" />
                            </div>
                        )}

                        {status === 'idle' && !hasResult && (
                            <div className="glass-card p-16 text-center">
                                <div className="float w-20 h-20 rounded-3xl bg-blue-500/10 flex items-center justify-center mx-auto mb-6">
                                    <Shield className="w-12 h-12 text-blue-400/40" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">Ready to Simulate</h3>
                                <p className="text-[#6a6a82] max-w-md mx-auto leading-relaxed">
                                    Configure your simulation parameters and click
                                    <span className="text-blue-400 font-medium"> Run Simulation </span>
                                    to execute the BB84 quantum key distribution protocol.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default BB84Page;
