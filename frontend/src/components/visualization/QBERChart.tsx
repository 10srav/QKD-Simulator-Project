/**
 * QBER Chart Component
 * Displays Quantum Bit Error Rate visualization
 */
import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ReferenceLine,
    ResponsiveContainer,
    Cell
} from 'recharts';

interface QBERChartProps {
    qber: number;
    threshold?: number;
}

export const QBERChart: React.FC<QBERChartProps> = ({
    qber,
    threshold = 8.5
}) => {
    const data = [
        { name: 'QBER', value: qber, fill: qber <= threshold ? '#22c55e' : '#ef4444' }
    ];

    return (
        <div className="space-y-6">
            {/* QBER Gauge */}
            <div className="flex items-center justify-center">
                <div className="relative w-64 h-32">
                    {/* Background arc */}
                    <svg viewBox="0 0 200 100" className="w-full h-full">
                        {/* Zone arcs */}
                        <path
                            d="M 20 90 A 80 80 0 0 1 100 10"
                            fill="none"
                            stroke="#22c55e"
                            strokeWidth="12"
                            strokeLinecap="round"
                        />
                        <path
                            d="M 100 10 A 80 80 0 0 1 146 30"
                            fill="none"
                            stroke="#f59e0b"
                            strokeWidth="12"
                            strokeLinecap="round"
                        />
                        <path
                            d="M 146 30 A 80 80 0 0 1 180 90"
                            fill="none"
                            stroke="#ef4444"
                            strokeWidth="12"
                            strokeLinecap="round"
                        />

                        {/* Needle */}
                        {(() => {
                            // Convert QBER (0-30%) to angle (-150 to 30 degrees)
                            const normalizedQber = Math.min(qber, 30) / 30;
                            const angle = -150 + normalizedQber * 180;
                            const radians = (angle * Math.PI) / 180;
                            const needleLength = 60;
                            const endX = 100 + needleLength * Math.cos(radians);
                            const endY = 90 + needleLength * Math.sin(radians);

                            return (
                                <>
                                    <line
                                        x1={100}
                                        y1={90}
                                        x2={endX}
                                        y2={endY}
                                        stroke="white"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                    />
                                    <circle cx={100} cy={90} r={8} fill="white" />
                                </>
                            );
                        })()}

                        {/* Labels */}
                        <text x={20} y={98} fill="#64748b" fontSize="10">0%</text>
                        <text x={175} y={98} fill="#64748b" fontSize="10">30%</text>
                        <text x={92} y={20} fill="#64748b" fontSize="10">15%</text>
                    </svg>

                    {/* Center value */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
                        <div className={`text-3xl font-bold ${qber <= 5 ? 'text-green-400' :
                            qber <= threshold ? 'text-amber-400' : 'text-red-400'
                            }`}>
                            {qber.toFixed(2)}%
                        </div>
                        <div className="text-sm text-slate-400">QBER</div>
                    </div>
                </div>
            </div>

            {/* Threshold indicator */}
            <div className="flex items-center justify-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-slate-400">Secure (&lt;5%)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="text-slate-400">Warning (5-8.5%)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-slate-400">Insecure (&gt;8.5%)</span>
                </div>
            </div>

            {/* Bar Chart */}
            <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} layout="vertical">
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#334155"
                            horizontal={false}
                        />
                        <XAxis
                            type="number"
                            domain={[0, 30]}
                            tickFormatter={(v) => `${v}%`}
                            stroke="#64748b"
                        />
                        <YAxis
                            type="category"
                            dataKey="name"
                            stroke="#64748b"
                            width={60}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1e293b',
                                border: '1px solid #334155',
                                borderRadius: '8px',
                            }}
                            formatter={(value) => [`${Number(value).toFixed(2)}%`, 'QBER']}
                        />
                        <ReferenceLine
                            x={threshold}
                            stroke="#ef4444"
                            strokeDasharray="3 3"
                            label={{
                                value: `Threshold (${threshold}%)`,
                                fill: '#ef4444',
                                fontSize: 12,
                                position: 'top'
                            }}
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                            {data.map((entry, index) => (
                                <Cell key={index} fill={entry.fill} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Interpretation */}
            <div className={`p-4 rounded-lg ${qber <= 5 ? 'bg-green-500/10 border border-green-500/30' :
                qber <= threshold ? 'bg-amber-500/10 border border-amber-500/30' :
                    'bg-red-500/10 border border-red-500/30'
                }`}>
                <p className={`text-sm ${qber <= 5 ? 'text-green-400' :
                    qber <= threshold ? 'text-amber-400' : 'text-red-400'
                    }`}>
                    {qber <= 5
                        ? '✓ Excellent: Channel is highly secure with minimal errors.'
                        : qber <= threshold
                            ? '⚠ Acceptable: Channel is secure but shows some noise. Consider privacy amplification.'
                            : '✗ Critical: Error rate exceeds security threshold. Eavesdropping likely detected!'}
                </p>
            </div>
        </div>
    );
};

export default QBERChart;
