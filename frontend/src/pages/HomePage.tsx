/**
 * Home Page — Refined Protocol Selection Dashboard
 * Deep dark palette, neon accents, pill metrics,
 * polished protocol cards, connected steps progression.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Shield, Zap, Lock, ArrowRight, Atom, GitBranch,
    History, Binary, Activity, Cpu, Sparkles, ChevronRight,
    Waves, KeyRound,
} from 'lucide-react';
import { useSimulationStore } from '../store';

const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const { setProtocol } = useSimulationStore();

    const handleSelectProtocol = (protocol: 'BB84' | 'E91') => {
        setProtocol(protocol);
        navigate(`/simulate/${protocol.toLowerCase()}`);
    };

    return (
        <div className="container mx-auto px-6 relative">

            {/* ── Hero ── */}
            <div className="text-center pt-20 pb-24 fade-in">
                <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-[#1a1a2e] bg-[#0c0c16] mb-10">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 pulse-dot" />
                    <span className="text-xs font-medium text-[#a0a0b4]">Powered by IBM Qiskit</span>
                </div>

                <h1 className="heading-xl mb-7">
                    <span className="text-white">Quantum Key</span>
                    <br />
                    <span className="gradient-text-animated">Distribution</span>
                </h1>

                <p className="text-[#6a6a82] text-base md:text-lg max-w-lg mx-auto leading-relaxed mb-14">
                    Simulate BB84 and E91 protocols with real quantum circuits.
                    Detect eavesdroppers. Generate secure encryption keys.
                </p>

                <div className="flex items-center justify-center gap-4">
                    <button
                        onClick={() => handleSelectProtocol('BB84')}
                        className="flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-semibold text-sm hover:from-indigo-500 hover:to-indigo-400 hover:shadow-[0_4px_24px_rgba(99,102,241,0.4),0_0_48px_rgba(99,102,241,0.15)] hover:-translate-y-0.5 active:translate-y-0 transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
                    >
                        <Sparkles className="w-4 h-4" />
                        Start Simulation
                    </button>
                    <button
                        onClick={() => navigate('/history')}
                        className="flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-[#0c0c16] border border-[#1a1a2e] text-[#a0a0b4] font-semibold text-sm hover:border-[#2a2a42] hover:text-white hover:bg-[#12121e] transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
                    >
                        View History
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* ── Pill Stats ── */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-24">
                {[
                    { value: '2', label: 'Protocols', icon: <Activity className="w-4 h-4 text-indigo-400" />, cls: 'pill-stat-blue' },
                    { value: '20+', label: 'Qubits', icon: <Binary className="w-4 h-4 text-cyan-400" />, cls: 'pill-stat-cyan' },
                    { value: '100%', label: 'Eve Detection', icon: <Shield className="w-4 h-4 text-emerald-400" />, cls: 'pill-stat-emerald' },
                ].map((stat) => (
                    <div key={stat.label} className={`pill-stat ${stat.cls}`}>
                        {stat.icon}
                        <span className="pill-stat-value">{stat.value}</span>
                        <span className="pill-stat-label">{stat.label}</span>
                    </div>
                ))}
            </div>

            {/* ── Protocol Cards ── */}
            <div className="mb-24">
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-1 h-6 rounded-full bg-indigo-500" />
                    <h2 className="heading-sm">Choose Protocol</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                    {/* BB84 */}
                    <button
                        onClick={() => handleSelectProtocol('BB84')}
                        className="card card-interactive card-glow-blue p-8 group text-left"
                    >
                        <div className="flex items-start justify-between mb-7">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <span className="tag-chip tag-chip-blue">Classic</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3 tracking-tight">BB84 Protocol</h3>
                        <p className="text-sm text-[#6a6a82] mb-7 leading-relaxed">
                            Bennett &amp; Brassard (1984). Polarization states and basis reconciliation for quantum key distribution.
                        </p>
                        <div className="space-y-3 mb-8">
                            {[
                                { icon: <Lock className="w-3.5 h-3.5 text-blue-400" />, text: 'QBER-based eavesdropper detection' },
                                { icon: <Zap className="w-3.5 h-3.5 text-blue-400" />, text: 'Z, X, and Diagonal measurement bases' },
                                { icon: <GitBranch className="w-3.5 h-3.5 text-blue-400" />, text: '9, 12, or 16 qubit configurations' },
                            ].map((f) => (
                                <div key={f.text} className="flex items-center gap-3 text-[13px] text-[#a0a0b4]">
                                    {f.icon}
                                    <span>{f.text}</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-blue-400 font-semibold group-hover:gap-3 transition-all">
                            <span>Start BB84</span>
                            <ArrowRight className="w-4 h-4" />
                        </div>
                    </button>

                    {/* E91 */}
                    <button
                        onClick={() => handleSelectProtocol('E91')}
                        className="card card-interactive card-glow-purple p-8 group text-left"
                    >
                        <div className="flex items-start justify-between mb-7">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                                <Atom className="w-6 h-6 text-white" />
                            </div>
                            <span className="tag-chip tag-chip-purple">Entanglement</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3 tracking-tight">E91 Protocol</h3>
                        <p className="text-sm text-[#6a6a82] mb-7 leading-relaxed">
                            Ekert (1991). Bell states and CHSH inequality violation for verifiable quantum security.
                        </p>
                        <div className="space-y-3 mb-8">
                            {[
                                { icon: <Lock className="w-3.5 h-3.5 text-purple-400" />, text: 'CHSH inequality security test' },
                                { icon: <Zap className="w-3.5 h-3.5 text-purple-400" />, text: 'EPR pair entanglement' },
                                { icon: <GitBranch className="w-3.5 h-3.5 text-purple-400" />, text: 'Configurable measurement angles' },
                            ].map((f) => (
                                <div key={f.text} className="flex items-center gap-3 text-[13px] text-[#a0a0b4]">
                                    {f.icon}
                                    <span>{f.text}</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-purple-400 font-semibold group-hover:gap-3 transition-all">
                            <span>Start E91</span>
                            <ArrowRight className="w-4 h-4" />
                        </div>
                    </button>
                </div>
            </div>

            {/* ── How It Works — Connected Steps ── */}
            <div className="mb-24">
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-1 h-6 rounded-full bg-cyan-500" />
                    <h2 className="heading-sm">How It Works</h2>
                </div>
                <div className="steps-row">
                    {[
                        { num: '01', icon: <Cpu className="w-5 h-5 text-indigo-400" />, title: 'Configure', desc: 'Set protocol parameters, qubit count, and attack scenario.', color: 'step-number-indigo' },
                        { num: '02', icon: <Waves className="w-5 h-5 text-cyan-400" />, title: 'Simulate', desc: 'Run real quantum circuits via IBM Qiskit Aer backend.', color: 'step-number-cyan' },
                        { num: '03', icon: <KeyRound className="w-5 h-5 text-purple-400" />, title: 'Extract Keys', desc: 'Sift matching bases and generate shared secret key bits.', color: 'step-number-purple' },
                        { num: '04', icon: <Lock className="w-5 h-5 text-emerald-400" />, title: 'Encrypt', desc: 'Use quantum keys for AES-256 symmetric encryption.', color: 'step-number-emerald' },
                    ].map((item) => (
                        <div key={item.num} className="step-item">
                            <div className={`step-number ${item.color}`}>
                                {item.icon}
                            </div>
                            <div className="step-label">{item.title}</div>
                            <div className="step-desc">{item.desc}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Tools ── */}
            <div className="mb-24">
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-1 h-6 rounded-full bg-emerald-500" />
                    <h2 className="heading-sm">Tools</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                    <button onClick={() => navigate('/encrypt')} className="card card-interactive card-glow-emerald p-7 group text-left w-full">
                        <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/15">
                                <Lock className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-semibold text-white mb-1">AES Encryption Tool</h3>
                                <p className="text-[#44445a] text-xs">Encrypt messages with quantum-generated keys.</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-[#2a2a42] group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                        </div>
                    </button>
                    <button onClick={() => navigate('/history')} className="card card-interactive card-glow-amber p-7 group text-left w-full">
                        <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/15">
                                <History className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-semibold text-white mb-1">Simulation History</h3>
                                <p className="text-[#44445a] text-xs">Browse, compare, and export past results.</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-[#2a2a42] group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                        </div>
                    </button>
                </div>
            </div>

            {/* ── Features ── */}
            <div className="mb-20">
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-1 h-6 rounded-full bg-purple-500" />
                    <h2 className="heading-sm">Features</h2>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                    {[
                        { icon: <Zap className="w-5 h-5" />, color: 'text-indigo-400', title: 'Real Quantum Circuits', desc: 'Powered by IBM Qiskit Aer for accurate quantum simulation with configurable shots.' },
                        { icon: <Shield className="w-5 h-5" />, color: 'text-cyan-400', title: 'Eavesdropper Detection', desc: 'Simulate intercept-resend attacks and verify security through QBER and CHSH tests.' },
                        { icon: <Lock className="w-5 h-5" />, color: 'text-purple-400', title: 'Key Generation', desc: 'Generate quantum-secure keys and use them for AES-256 symmetric encryption.' },
                    ].map((f) => (
                        <div key={f.title} className="card p-8 group hover:border-[#2a2a42] transition-all">
                            <div className={`${f.color} mb-5 group-hover:scale-110 transition-transform origin-left`}>{f.icon}</div>
                            <h3 className="text-sm font-semibold text-white mb-2.5">{f.title}</h3>
                            <p className="text-xs text-[#44445a] leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Footer ── */}
            <div className="section-divider mt-16 mb-8" />
            <p className="text-center text-xs text-[#2a2a42] pb-10">
                QKD Simulator &middot; React, FastAPI &amp; Qiskit
            </p>
        </div>
    );
};

export default HomePage;
