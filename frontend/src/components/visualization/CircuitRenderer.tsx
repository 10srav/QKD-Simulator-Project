/**
 * Quantum Circuit Renderer Component
 * Renders quantum circuits as SVG for visualization
 */
import React from 'react';
import type { CircuitJSON, CircuitGate } from '../../types';

interface CircuitRendererProps {
    circuit: CircuitJSON;
}

const GATE_COLORS: Record<string, string> = {
    H: '#6366f1',
    X: '#ef4444',
    Y: '#22c55e',
    Z: '#3b82f6',
    S: '#8b5cf6',
    Sdg: '#a855f7',
    CNOT: '#f59e0b',
    CX: '#f59e0b',
    MEASURE: '#06b6d4',
    BARRIER: '#64748b',
};

const SECTION_COLORS: Record<string, string> = {
    alice: '#3b82f6',
    bob: '#22c55e',
    eve: '#ef4444',
    entanglement: '#8b5cf6',
    transmission: '#64748b',
    measurement: '#06b6d4',
    reverse: '#f59e0b',
};

export const CircuitRenderer: React.FC<CircuitRendererProps> = ({ circuit }) => {
    const { n_qubits, gates } = circuit;

    // Layout constants
    const wireSpacing = 50;
    const gateWidth = 36;
    const gateSpacing = 50;
    const leftPadding = 60;
    const topPadding = 30;

    // Calculate circuit dimensions
    const gateColumns = Math.max(gates.length, 1);
    const width = leftPadding + gateColumns * gateSpacing + 100;
    const height = topPadding * 2 + (n_qubits - 1) * wireSpacing + 40;

    // Group gates by column position
    const gatePositions = gates.map((gate, index) => ({
        ...gate,
        column: index,
    }));

    const renderWire = (qubitIndex: number) => {
        const y = topPadding + qubitIndex * wireSpacing;
        return (
            <g key={`wire-${qubitIndex}`}>
                {/* Qubit label */}
                <text
                    x={20}
                    y={y + 5}
                    className="fill-slate-400 text-xs font-mono"
                >
                    q{qubitIndex}
                </text>
                {/* Wire line */}
                <line
                    x1={leftPadding}
                    y1={y}
                    x2={width - 40}
                    y2={y}
                    className="stroke-slate-600"
                    strokeWidth={1.5}
                />
            </g>
        );
    };

    const renderGate = (gate: CircuitGate & { column: number }) => {
        const x = leftPadding + gate.column * gateSpacing;
        const color = GATE_COLORS[gate.type] || '#6366f1';
        const sectionColor = SECTION_COLORS[gate.section] || '#6366f1';

        if (gate.type === 'BARRIER') {
            // Render barrier as dashed line
            return (
                <g key={`gate-${gate.column}-barrier`}>
                    {gate.targets.map((target) => (
                        <line
                            key={`barrier-${target}`}
                            x1={x}
                            y1={topPadding + target * wireSpacing - 15}
                            x2={x}
                            y2={topPadding + target * wireSpacing + 15}
                            stroke="#64748b"
                            strokeWidth={2}
                            strokeDasharray="4,4"
                        />
                    ))}
                </g>
            );
        }

        if (gate.type === 'MEASURE') {
            // Render measurement symbol
            const y = topPadding + gate.targets[0] * wireSpacing;
            return (
                <g key={`gate-${gate.column}-${gate.targets[0]}`}>
                    <rect
                        x={x - gateWidth / 2}
                        y={y - gateWidth / 2}
                        width={gateWidth}
                        height={gateWidth}
                        rx={4}
                        className="fill-cyan-500/20 stroke-cyan-500"
                        strokeWidth={2}
                    />
                    {/* Meter arc */}
                    <path
                        d={`M ${x - 8} ${y + 6} A 10 10 0 0 1 ${x + 8} ${y + 6}`}
                        fill="none"
                        stroke="#06b6d4"
                        strokeWidth={2}
                    />
                    {/* Meter needle */}
                    <line
                        x1={x}
                        y1={y + 6}
                        x2={x + 5}
                        y2={y - 6}
                        stroke="#06b6d4"
                        strokeWidth={2}
                    />
                </g>
            );
        }

        if (gate.type === 'CNOT' || gate.type === 'CX') {
            // Render CNOT gate
            const control = gate.targets[0];
            const target = gate.targets[1];
            const ctrlY = topPadding + control * wireSpacing;
            const targetY = topPadding + target * wireSpacing;

            return (
                <g key={`gate-${gate.column}-cnot`}>
                    {/* Connecting line */}
                    <line
                        x1={x}
                        y1={ctrlY}
                        x2={x}
                        y2={targetY}
                        stroke={color}
                        strokeWidth={2}
                    />
                    {/* Control dot */}
                    <circle
                        cx={x}
                        cy={ctrlY}
                        r={6}
                        fill={color}
                    />
                    {/* Target circle */}
                    <circle
                        cx={x}
                        cy={targetY}
                        r={12}
                        fill="transparent"
                        stroke={color}
                        strokeWidth={2}
                    />
                    {/* Target cross */}
                    <line
                        x1={x}
                        y1={targetY - 12}
                        x2={x}
                        y2={targetY + 12}
                        stroke={color}
                        strokeWidth={2}
                    />
                </g>
            );
        }

        // Standard single-qubit gate
        const y = topPadding + gate.targets[0] * wireSpacing;
        return (
            <g key={`gate-${gate.column}-${gate.targets[0]}`}>
                {/* Gate box */}
                <rect
                    x={x - gateWidth / 2}
                    y={y - gateWidth / 2}
                    width={gateWidth}
                    height={gateWidth}
                    rx={4}
                    fill={`${color}20`}
                    stroke={color}
                    strokeWidth={2}
                    className="transition-all duration-200 hover:fill-opacity-40"
                />
                {/* Section indicator */}
                <rect
                    x={x - gateWidth / 2}
                    y={y - gateWidth / 2}
                    width={3}
                    height={gateWidth}
                    fill={sectionColor}
                    rx={1}
                />
                {/* Gate label */}
                <text
                    x={x}
                    y={y + 5}
                    textAnchor="middle"
                    className="fill-white text-sm font-bold"
                    style={{ fontSize: gate.type.length > 2 ? '10px' : '14px' }}
                >
                    {gate.type}
                </text>
            </g>
        );
    };

    return (
        <div className="overflow-x-auto">
            <svg
                width={width}
                height={height}
                className="min-w-full"
                style={{ minWidth: width }}
            >
                {/* Background */}
                <rect
                    x={0}
                    y={0}
                    width={width}
                    height={height}
                    fill="transparent"
                />

                {/* Wires */}
                {Array.from({ length: n_qubits }, (_, i) => renderWire(i))}

                {/* Gates */}
                {gatePositions.map(renderGate)}

                {/* Legend */}
                <g transform={`translate(${width - 35}, ${topPadding})`}>
                    {Object.entries(SECTION_COLORS).slice(0, 3).map(([section, color], i) => (
                        <g key={section} transform={`translate(0, ${i * 20})`}>
                            <rect x={0} y={0} width={10} height={10} fill={color} rx={2} />
                            <text x={15} y={9} className="fill-slate-400 text-xs capitalize">
                                {section}
                            </text>
                        </g>
                    ))}
                </g>
            </svg>

            {/* Circuit Info */}
            <div className="flex items-center gap-4 mt-4 text-sm text-slate-400">
                <span>Qubits: {n_qubits}</span>
                <span>•</span>
                <span>Gates: {gates.filter(g => g.type !== 'BARRIER').length}</span>
                <span>•</span>
                <span>Depth: {circuit.depth}</span>
            </div>
        </div>
    );
};

export default CircuitRenderer;
