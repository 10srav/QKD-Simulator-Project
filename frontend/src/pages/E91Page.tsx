/**
 * E91 Simulation Page
 * Entanglement-based protocol with purple-pink theme accents.
 */
import React, { useState } from 'react';
import {
    Play,
    Settings,
    Atom,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Eye,
    EyeOff,
    RotateCcw,
    ChevronDown,
    ChevronUp,
    Gauge,
    Clock,
    Key,
    Activity,
} from 'lucide-react';
import { useSimulationStore } from '../store';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { CircuitRenderer } from '../components/visualization/CircuitRenderer';
import { CHSHMeter } from '../components/visualization/CHSHMeter';
import { KeyVisualization } from '../components/visualization/KeyVisualization';
import { SecurityAnalysis } from '../components/analysis/SecurityAnalysis';

const E91Page: React.FC = () => {
    const {
        e91Config,
        e91Result,
        status,
        error,
        updateE91Config,
        runE91Simulation,
        clearResults,
    } = useSimulationStore();

    const [showAdvanced, setShowAdvanced] = useState(false);

    const handleRunSimulation = async () => {
        await runE91Simulation();
    };

    const isRunning = status === 'running';
    const hasResult = status === 'completed' && e91Result;

    return (
        <div className="min-h-screen">
            {/* Page Header */}
            <div className="page-header">
                <div className="container mx-auto px-6 py-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                                <Atom className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">E91 Protocol</h1>
                                <p className="text-sm text-[#a0a0b4]">Ekert 1991 &middot; Entanglement-Based QKD</p>
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
                        <div className="glass-card card-glow-purple p-7 sticky top-24">
                            <h2 className="text-sm font-semibold text-[#6a6a82] uppercase tracking-widest mb-6 flex items-center gap-2">
                                <div className="w-1 h-5 rounded-full bg-purple-500" />
                                <Settings className="w-4 h-4 text-purple-400" />
                                Configuration
                            </h2>

                            {/* Number of Pairs */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-[#d4d4e0] mb-2.5">
                                    Entangled Pairs
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[6, 9, 12].map((n) => (
                                        <button
                                            key={n}
                                            onClick={() => updateE91Config({ n_pairs: n })}
                                            disabled={isRunning}
                                            className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${
                                                e91Config.n_pairs === n
                                                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-lg shadow-purple-500/10'
                                                    : 'bg-[#06060e] text-[#a0a0b4] border border-[#1a1a2e] hover:border-[#2a2a42] hover:text-[#d4d4e0]'
                                            }`}
                                        >
                                            {n}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Alice's Angles */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-[#d4d4e0] mb-2.5">
                                    Alice's Angles <span className="text-[#44445a]">(degrees)</span>
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {e91Config.alice_angles.map((angle, i) => (
                                        <input
                                            key={`alice-${i}`}
                                            type="number"
                                            value={angle}
                                            onChange={(e) => {
                                                const newAngles = [...e91Config.alice_angles];
                                                newAngles[i] = parseFloat(e.target.value) || 0;
                                                updateE91Config({ alice_angles: newAngles });
                                            }}
                                            className="input-field text-center font-mono"
                                            disabled={isRunning}
                                            min={0}
                                            max={180}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Bob's Angles */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-[#d4d4e0] mb-2.5">
                                    Bob's Angles <span className="text-[#44445a]">(degrees)</span>
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {e91Config.bob_angles.map((angle, i) => (
                                        <input
                                            key={`bob-${i}`}
                                            type="number"
                                            value={angle}
                                            onChange={(e) => {
                                                const newAngles = [...e91Config.bob_angles];
                                                newAngles[i] = parseFloat(e.target.value) || 0;
                                                updateE91Config({ bob_angles: newAngles });
                                            }}
                                            className="input-field text-center font-mono"
                                            disabled={isRunning}
                                            min={0}
                                            max={180}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="section-divider my-6" />

                            {/* Eve Attack Toggle */}
                            <div className="mb-6">
                                <button
                                    onClick={() => updateE91Config({ eve_attack: !e91Config.eve_attack })}
                                    disabled={isRunning}
                                    className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
                                        e91Config.eve_attack
                                            ? 'bg-red-500/10 border border-red-500/25'
                                            : 'bg-[#06060e] border border-[#1a1a2e] hover:border-[#2a2a42]'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {e91Config.eve_attack ? (
                                            <Eye className="w-5 h-5 text-red-400" />
                                        ) : (
                                            <EyeOff className="w-5 h-5 text-[#6a6a82]" />
                                        )}
                                        <div className="text-left">
                                            <span className="font-medium text-white text-sm">Eavesdropper (Eve)</span>
                                            <p className="text-[11px] text-[#6a6a82]">Disrupts entanglement</p>
                                        </div>
                                    </div>
                                    <div className={`w-10 h-6 rounded-full relative transition-colors ${
                                        e91Config.eve_attack ? 'bg-red-500' : 'bg-slate-700'
                                    }`}>
                                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                                            e91Config.eve_attack ? 'translate-x-5' : 'translate-x-1'
                                        }`} />
                                    </div>
                                </button>
                            </div>

                            {/* Advanced Options */}
                            <button
                                onClick={() => setShowAdvanced(!showAdvanced)}
                                className="flex items-center gap-1.5 text-sm text-[#6a6a82] hover:text-[#d4d4e0] transition-colors mb-5"
                            >
                                {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                Advanced Options
                            </button>

                            {showAdvanced && (
                                <div className="space-y-5 mb-6 fade-in">
                                    <div>
                                        <label className="block text-sm font-medium text-[#d4d4e0] mb-2.5">
                                            Noise Level
                                            <span className="ml-2 text-purple-400 font-mono">
                                                {(e91Config.noise_level * 100).toFixed(0)}%
                                            </span>
                                        </label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="30"
                                            value={e91Config.noise_level * 100}
                                            onChange={(e) => updateE91Config({
                                                noise_level: parseInt(e.target.value) / 100
                                            })}
                                            disabled={isRunning}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[#d4d4e0] mb-2.5">
                                            Shots per Combination
                                        </label>
                                        <select
                                            value={e91Config.shots}
                                            onChange={(e) => updateE91Config({ shots: parseInt(e.target.value) })}
                                            className="input-field"
                                            disabled={isRunning}
                                        >
                                            <option value={512}>512</option>
                                            <option value={1024}>1024</option>
                                            <option value={2048}>2048</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            {/* Run Button */}
                            <button
                                onClick={handleRunSimulation}
                                disabled={isRunning}
                                className="w-full flex items-center justify-center gap-2.5 py-3 px-6 rounded-xl font-semibold text-white transition-all cursor-pointer bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 hover:shadow-lg hover:shadow-purple-500/25 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                            >
                                {isRunning ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
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
                                <LoadingSpinner size="lg" message="Creating entangled pairs and measuring correlations..." />
                            </div>
                        )}

                        {hasResult && (
                            <div className="space-y-8 stagger-in">
                                {/* Security Status Banner */}
                                <div className={`p-6 ${e91Result.is_secure ? 'security-banner-secure' : 'security-banner-insecure'}`}>
                                    <div className="flex items-center gap-4">
                                        {e91Result.is_secure ? (
                                            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 flex items-center justify-center">
                                                <CheckCircle className="w-8 h-8 text-emerald-400" />
                                            </div>
                                        ) : (
                                            <div className="w-14 h-14 rounded-2xl bg-red-500/15 flex items-center justify-center">
                                                <XCircle className="w-8 h-8 text-red-400" />
                                            </div>
                                        )}
                                        <div>
                                            <h3 className={`text-xl font-bold ${e91Result.is_secure ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {e91Result.is_secure ? 'Quantum Violation Confirmed' : 'CHSH Violation Failed!'}
                                            </h3>
                                            <p className="text-[#a0a0b4] text-sm mt-0.5">
                                                S-parameter: {e91Result.chsh_result.s_parameter.toFixed(4)}
                                                {e91Result.is_secure ? ' > 2 (quantum regime)' : ' ≤ 2 (classical bound)'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* CHSH Meter */}
                                <div className="glass-card p-7">
                                    <h3 className="text-sm font-semibold text-[#6a6a82] uppercase tracking-widest mb-5 flex items-center gap-2">
                                        <div className="w-1 h-5 rounded-full bg-purple-500" />
                                        <Gauge className="w-4 h-4 text-purple-400" />
                                        CHSH Inequality Test
                                    </h3>
                                    <CHSHMeter chshResult={e91Result.chsh_result} />
                                </div>

                                {/* Metrics Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="metric-card metric-card-purple">
                                        <Activity className="w-4 h-4 text-purple-400 mx-auto mb-2" />
                                        <div className="metric-value text-white">{e91Result.chsh_result.s_parameter.toFixed(3)}</div>
                                        <div className="metric-label">S-Parameter</div>
                                    </div>
                                    <div className="metric-card metric-card-pink">
                                        <Key className="w-4 h-4 text-pink-400 mx-auto mb-2" />
                                        <div className="metric-value text-white">{e91Result.sifted_alice_key.length}</div>
                                        <div className="metric-label">Key Bits</div>
                                    </div>
                                    <div className="metric-card metric-card-cyan">
                                        <CheckCircle className="w-4 h-4 text-cyan-400 mx-auto mb-2" />
                                        <div className="metric-value text-white">{e91Result.key_match_rate.toFixed(1)}%</div>
                                        <div className="metric-label">Match Rate</div>
                                    </div>
                                    <div className="metric-card metric-card-indigo">
                                        <Clock className="w-4 h-4 text-indigo-400 mx-auto mb-2" />
                                        <div className="metric-value text-white">{e91Result.execution_time_ms.toFixed(0)}ms</div>
                                        <div className="metric-label">Exec Time</div>
                                    </div>
                                </div>

                                {/* Circuit Visualization */}
                                <div className="glass-card p-7">
                                    <h3 className="text-sm font-semibold text-[#6a6a82] uppercase tracking-widest mb-5 flex items-center gap-2">
                                        <div className="w-1 h-5 rounded-full bg-pink-500" />
                                        Entanglement Circuit
                                    </h3>
                                    <CircuitRenderer circuit={e91Result.circuit_json} />
                                </div>

                                {/* Key Visualization */}
                                <div className="glass-card p-7">
                                    <h3 className="text-sm font-semibold text-[#6a6a82] uppercase tracking-widest mb-5 flex items-center gap-2">
                                        <div className="w-1 h-5 rounded-full bg-cyan-500" />
                                        Generated Keys
                                    </h3>
                                    <KeyVisualization
                                        aliceKey={e91Result.sifted_alice_key}
                                        bobKey={e91Result.sifted_bob_key}
                                    />
                                </div>

                                {/* Security Analysis */}
                                <SecurityAnalysis result={e91Result} protocol="E91" />
                            </div>
                        )}

                        {status === 'idle' && !hasResult && (
                            <div className="glass-card p-16 text-center">
                                <div className="w-20 h-20 rounded-3xl bg-purple-500/10 flex items-center justify-center mx-auto mb-6 float">
                                    <Atom className="w-10 h-10 text-purple-400/40" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">Ready to Simulate</h3>
                                <p className="text-[#6a6a82] max-w-md mx-auto leading-relaxed">
                                    Configure your entangled pairs and measurement angles, then click
                                    <span className="text-purple-400 font-medium"> Run Simulation </span>
                                    to test Bell inequality violation.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default E91Page;
