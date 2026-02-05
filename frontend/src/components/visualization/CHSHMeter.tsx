/**
 * CHSH Meter Component
 * Displays Bell inequality S-parameter gauge for E91 protocol
 */
import React from 'react';
import type { CHSHResult } from '../../types';

interface CHSHMeterProps {
    chshResult: CHSHResult;
}

export const CHSHMeter: React.FC<CHSHMeterProps> = ({ chshResult }) => {
    const { s_parameter, classical_bound, quantum_max } = chshResult;

    // Normalize S to 0-1 range (0 to quantum_max)
    const normalized = Math.min(s_parameter / quantum_max, 1);

    // Determine color based on value
    const getColor = () => {
        if (s_parameter > 2.5) return '#22c55e'; // Secure - green
        if (s_parameter > classical_bound) return '#f59e0b'; // Marginal - amber
        return '#ef4444'; // Insecure - red
    };

    const color = getColor();

    // Calculate gauge needle angle (-135 to 135 degrees)
    const angle = -135 + (normalized * 270);

    return (
        <div className="space-y-6">
            {/* Main Gauge */}
            <div className="flex justify-center">
                <div className="relative w-80 h-44">
                    <svg viewBox="0 0 300 160" className="w-full h-full">
                        {/* Background arc segments */}
                        {/* Insecure zone (0-2) */}
                        <path
                            d="M 30 140 A 120 120 0 0 1 150 20"
                            fill="none"
                            stroke="rgba(239, 68, 68, 0.2)"
                            strokeWidth="20"
                            strokeLinecap="round"
                        />
                        {/* Marginal zone (2-2.5) */}
                        <path
                            d="M 150 20 A 120 120 0 0 1 220 50"
                            fill="none"
                            stroke="rgba(245, 158, 11, 0.2)"
                            strokeWidth="20"
                            strokeLinecap="round"
                        />
                        {/* Secure zone (2.5-2.828) */}
                        <path
                            d="M 220 50 A 120 120 0 0 1 270 140"
                            fill="none"
                            stroke="rgba(34, 197, 94, 0.2)"
                            strokeWidth="20"
                            strokeLinecap="round"
                        />

                        {/* Active progress arc */}
                        <path
                            d={`M 30 140 A 120 120 0 ${normalized > 0.5 ? 1 : 0} 1 ${150 + 120 * Math.cos((angle - 90) * Math.PI / 180)
                                } ${140 + 120 * Math.sin((angle - 90) * Math.PI / 180)
                                }`}
                            fill="none"
                            stroke={color}
                            strokeWidth="20"
                            strokeLinecap="round"
                            style={{
                                filter: `drop-shadow(0 0 8px ${color}80)`
                            }}
                        />

                        {/* Tick marks and labels */}
                        {[0, 1, 2, 2.5, 2.828].map((value) => {
                            const tickNorm = value / quantum_max;
                            const tickAngle = -135 + (tickNorm * 270);
                            const radians = (tickAngle - 90) * Math.PI / 180;
                            const innerR = 95;
                            const outerR = 110;
                            const labelR = 80;

                            return (
                                <g key={value}>
                                    <line
                                        x1={150 + innerR * Math.cos(radians)}
                                        y1={140 + innerR * Math.sin(radians)}
                                        x2={150 + outerR * Math.cos(radians)}
                                        y2={140 + outerR * Math.sin(radians)}
                                        stroke={value === 2 ? '#ef4444' : '#64748b'}
                                        strokeWidth={value === 2 ? 3 : 2}
                                    />
                                    <text
                                        x={150 + labelR * Math.cos(radians)}
                                        y={145 + labelR * Math.sin(radians)}
                                        fill="#94a3b8"
                                        fontSize="12"
                                        textAnchor="middle"
                                        fontWeight={value === 2 ? 'bold' : 'normal'}
                                    >
                                        {value === 2.828 ? '2√2' : value}
                                    </text>
                                </g>
                            );
                        })}

                        {/* Classical bound indicator */}
                        <text x={150} y={95} fill="#64748b" fontSize="10" textAnchor="middle">
                            Classical Bound
                        </text>

                        {/* Needle */}
                        <g transform={`translate(150, 140) rotate(${angle})`}>
                            <polygon
                                points="0,-90 -6,0 6,0"
                                fill="white"
                                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
                            />
                        </g>

                        {/* Center cap */}
                        <circle cx={150} cy={140} r={12} fill="#1e293b" stroke="#334155" strokeWidth={2} />
                        <circle cx={150} cy={140} r={6} fill={color} />
                    </svg>

                    {/* Center value display */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-center">
                        <div className="text-4xl font-bold text-white" style={{ color }}>
                            {s_parameter.toFixed(3)}
                        </div>
                        <div className="text-sm text-slate-400">S-Parameter</div>
                    </div>
                </div>
            </div>

            {/* Status badges */}
            <div className="flex items-center justify-center gap-4">
                <div className={`px-4 py-2 rounded-lg text-sm font-medium ${s_parameter > classical_bound
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                    {s_parameter > classical_bound ? '✓ Quantum Violation' : '✗ No Violation'}
                </div>
                <div className={`px-4 py-2 rounded-lg text-sm font-medium ${s_parameter > 2.5
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : s_parameter > classical_bound
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                    {s_parameter > 2.5 ? 'Strong Security' :
                        s_parameter > classical_bound ? 'Marginal Security' : 'Insecure'}
                </div>
            </div>

            {/* Expectation values table */}
            <div className="glass-card p-4 mt-4">
                <h4 className="text-sm font-semibold text-white mb-3">Expectation Values</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    {Object.entries(chshResult.expectation_values || {}).slice(0, 4).map(([key, value]) => (
                        <div key={key} className="bg-slate-800/50 rounded p-2 text-center">
                            <div className="text-xs text-slate-400 font-mono">{key}</div>
                            <div className="text-white font-medium">
                                {typeof value === 'number' ? value.toFixed(3) : value}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Reference info */}
            <div className="text-center text-sm text-slate-500">
                <p>Classical bound: S ≤ 2 | Quantum maximum (Tsirelson): S = 2√2 ≈ 2.828</p>
            </div>
        </div>
    );
};

export default CHSHMeter;
