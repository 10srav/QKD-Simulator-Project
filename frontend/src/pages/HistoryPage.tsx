/**
 * History Page - Simulation History & Comparison
 * Amber-orange theme with polished card design.
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
    Trash2,
    GitCompareArrows,
    Shield,
    Atom,
    Clock,
    Key,
    CheckCircle,
    XCircle,
    ChevronLeft,
    ChevronRight,
    Tag,
    Search,
    X,
    History,
    Filter,
} from 'lucide-react';
import {
    historyService,
    type HistoryItem,
    type HistoryFilters,
    type CompareResponse,
} from '../services/historyService';
import { SimulationDetailModal } from '../components/common/SimulationDetailModal';

const PAGE_SIZE = 10;

const HistoryPage: React.FC = () => {
    const [items, setItems] = useState<HistoryItem[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [protocolFilter, setProtocolFilter] = useState<string>('');
    const [eveFilter, setEveFilter] = useState<string>('');
    const [secureFilter, setSecureFilter] = useState<string>('');

    const [compareMode, setCompareMode] = useState(false);
    const [selected, setSelected] = useState<string[]>([]);
    const [compareResult, setCompareResult] = useState<CompareResponse | null>(null);

    const [detailId, setDetailId] = useState<string | null>(null);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [labelDraft, setLabelDraft] = useState('');

    const fetchHistory = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const filters: HistoryFilters = {
                limit: PAGE_SIZE,
                offset: page * PAGE_SIZE,
            };
            if (protocolFilter) filters.protocol = protocolFilter;
            if (eveFilter) filters.eve_attack = eveFilter === 'true';
            if (secureFilter) filters.is_secure = secureFilter === 'true';

            const res = await historyService.list(filters);
            setItems(res.items);
            setTotal(res.total);
        } catch {
            setError('Failed to load history');
        } finally {
            setLoading(false);
        }
    }, [page, protocolFilter, eveFilter, secureFilter]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const handleDelete = async (id: string) => {
        try {
            await historyService.remove(id);
            fetchHistory();
        } catch {
            setError('Failed to delete');
        }
    };

    const handleSaveLabel = async (id: string) => {
        try {
            await historyService.updateLabel(id, labelDraft);
            setEditingId(null);
            fetchHistory();
        } catch {
            setError('Failed to update label');
        }
    };

    const toggleSelect = (id: string) => {
        setSelected((prev) => {
            if (prev.includes(id)) return prev.filter((s) => s !== id);
            if (prev.length >= 2) return [prev[1], id];
            return [...prev, id];
        });
    };

    const handleCompare = async () => {
        if (selected.length !== 2) return;
        try {
            const res = await historyService.compare(selected[0], selected[1]);
            setCompareResult(res);
        } catch {
            setError('Comparison failed');
        }
    };

    const totalPages = Math.ceil(total / PAGE_SIZE);

    const formatDate = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleString(undefined, {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
        });
    };

    return (
        <div className="min-h-screen">
            {/* Page Header */}
            <div className="page-header">
                <div className="container mx-auto px-6 py-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                                <History className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">Simulation History</h1>
                                <p className="text-sm text-[#a0a0b4]">{total} simulations recorded</p>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                setCompareMode(!compareMode);
                                setSelected([]);
                                setCompareResult(null);
                            }}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                                compareMode
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                    : 'bg-[#0c0c16] text-[#a0a0b4] border border-[#1a1a2e] hover:border-[#2a2a42] hover:text-[#d4d4e0]'
                            }`}
                        >
                            <GitCompareArrows className="w-4 h-4" />
                            {compareMode ? 'Exit Compare' : 'Compare'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-10">
                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3 mb-8">
                    <Filter className="w-4 h-4 text-[#44445a]" />
                    <select
                        value={protocolFilter}
                        onChange={(e) => { setProtocolFilter(e.target.value); setPage(0); }}
                        className="py-2 px-3 text-sm bg-[#06060e] border border-[#1a1a2e] rounded-lg text-white cursor-pointer focus:outline-none focus:border-indigo-500/50"
                    >
                        <option value="">All Protocols</option>
                        <option value="BB84">BB84</option>
                        <option value="E91">E91</option>
                    </select>
                    <select
                        value={eveFilter}
                        onChange={(e) => { setEveFilter(e.target.value); setPage(0); }}
                        className="py-2 px-3 text-sm bg-[#06060e] border border-[#1a1a2e] rounded-lg text-white cursor-pointer focus:outline-none focus:border-indigo-500/50"
                    >
                        <option value="">Eve: Any</option>
                        <option value="true">With Eve</option>
                        <option value="false">Without Eve</option>
                    </select>
                    <select
                        value={secureFilter}
                        onChange={(e) => { setSecureFilter(e.target.value); setPage(0); }}
                        className="py-2 px-3 text-sm bg-[#06060e] border border-[#1a1a2e] rounded-lg text-white cursor-pointer focus:outline-none focus:border-indigo-500/50"
                    >
                        <option value="">Security: Any</option>
                        <option value="true">Secure</option>
                        <option value="false">Insecure</option>
                    </select>
                </div>

                {/* Compare Action Bar */}
                {compareMode && selected.length === 2 && (
                    <div className="mb-6 fade-in">
                        <button
                            onClick={handleCompare}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white text-sm font-semibold hover:from-amber-500 hover:to-orange-500 hover:shadow-lg hover:shadow-amber-500/20 transition-all"
                        >
                            <GitCompareArrows className="w-4 h-4" />
                            Compare Selected ({selected.length}/2)
                        </button>
                    </div>
                )}

                {error && (
                    <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm fade-in">
                        {error}
                    </div>
                )}

                {/* Compare Result */}
                {compareResult && (
                    <div className="glass-card p-6 mb-8 fade-in">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-sm font-semibold text-[#6a6a82] uppercase tracking-widest flex items-center gap-2">
                                <GitCompareArrows className="w-4 h-4 text-amber-400" />
                                Comparison Results
                            </h2>
                            <button onClick={() => setCompareResult(null)} className="p-1.5 rounded-lg text-[#6a6a82] hover:text-white hover:bg-[#161622] transition-all">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="p-4 bg-[#06060e] rounded-xl border border-[#1a1a2e]">
                                <h3 className="text-[11px] text-[#44445a] uppercase tracking-wider mb-2">Simulation 1</h3>
                                <p className="text-white font-semibold">{String(compareResult.simulation_1.protocol)}</p>
                                <p className="text-xs text-[#6a6a82] mt-1">{String(compareResult.simulation_1.created_at)}</p>
                            </div>
                            <div className="p-4 bg-[#06060e] rounded-xl border border-[#1a1a2e]">
                                <h3 className="text-[11px] text-[#44445a] uppercase tracking-wider mb-2">Simulation 2</h3>
                                <p className="text-white font-semibold">{String(compareResult.simulation_2.protocol)}</p>
                                <p className="text-xs text-[#6a6a82] mt-1">{String(compareResult.simulation_2.created_at)}</p>
                            </div>
                            <div className="p-4 bg-[#06060e] rounded-xl border border-[#1a1a2e]">
                                <h3 className="text-[11px] text-[#44445a] uppercase tracking-wider mb-2">Deltas</h3>
                                <div className="space-y-1.5">
                                    {Object.entries(compareResult.deltas).map(([key, val]) => (
                                        <div key={key} className="flex justify-between text-sm">
                                            <span className="text-[#a0a0b4]">{key}</span>
                                            <span className={`font-mono font-medium ${val > 0 ? 'text-emerald-400' : val < 0 ? 'text-red-400' : 'text-[#6a6a82]'}`}>
                                                {val > 0 ? '+' : ''}{typeof val === 'number' ? val.toFixed(2) : val}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* History List */}
                {loading ? (
                    <div className="text-center py-20">
                        <div className="quantum-loader mx-auto mb-4" />
                        <p className="text-[#6a6a82] text-sm">Loading history...</p>
                    </div>
                ) : items.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 rounded-2xl bg-[#0c0c16] flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-[#44445a]" />
                        </div>
                        <p className="text-white font-semibold mb-1">No simulations found</p>
                        <p className="text-[#6a6a82] text-sm">Run a BB84 or E91 simulation first.</p>
                    </div>
                ) : (
                    <div className="space-y-3 stagger-in">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className={`glass-card p-5 flex items-center gap-4 transition-all cursor-pointer group ${
                                    selected.includes(item.id) ? 'ring-2 ring-amber-500/60 border-amber-500/30' : ''
                                }`}
                                onClick={() => compareMode ? toggleSelect(item.id) : setDetailId(item.id)}
                            >
                                {/* Compare checkbox */}
                                {compareMode && (
                                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                        selected.includes(item.id)
                                            ? 'bg-amber-500 border-amber-500'
                                            : 'border-slate-600 group-hover:border-slate-500'
                                    }`}>
                                        {selected.includes(item.id) && (
                                            <CheckCircle className="w-3.5 h-3.5 text-white" />
                                        )}
                                    </div>
                                )}

                                {/* Protocol Icon */}
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                    item.protocol === 'BB84'
                                        ? 'bg-blue-500/15'
                                        : 'bg-purple-500/15'
                                }`}>
                                    {item.protocol === 'BB84'
                                        ? <Shield className="w-5 h-5 text-blue-400" />
                                        : <Atom className="w-5 h-5 text-purple-400" />
                                    }
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-white font-semibold text-sm">{item.protocol}</span>
                                        {item.is_secure ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                                                <CheckCircle className="w-3 h-3" /> Secure
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/15 text-red-400 border border-red-500/20">
                                                <XCircle className="w-3 h-3" /> Insecure
                                            </span>
                                        )}
                                        {item.eve_attack && (
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/20">
                                                Eve
                                            </span>
                                        )}
                                        {editingId === item.id ? (
                                            <input
                                                value={labelDraft}
                                                onChange={(e) => setLabelDraft(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSaveLabel(item.id)}
                                                onBlur={() => handleSaveLabel(item.id)}
                                                autoFocus
                                                className="bg-[#06060e] border border-[#2a2a42] rounded-lg px-2 py-0.5 text-xs text-white w-28 focus:outline-none focus:border-amber-500/50"
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        ) : item.label ? (
                                            <span
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingId(item.id);
                                                    setLabelDraft(item.label || '');
                                                }}
                                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#06060e] text-[#d4d4e0] cursor-pointer hover:bg-[#161622] transition-colors"
                                            >
                                                <Tag className="w-3 h-3" />{item.label}
                                            </span>
                                        ) : (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingId(item.id);
                                                    setLabelDraft('');
                                                }}
                                                className="text-[10px] text-[#44445a] hover:text-[#a0a0b4] transition-colors"
                                            >
                                                + label
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 text-[11px] text-[#6a6a82] mt-1.5">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {formatDate(item.created_at)}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Key className="w-3 h-3" />
                                            {item.sifted_key_length} bits
                                        </span>
                                        <span>{item.execution_time_ms.toFixed(0)}ms</span>
                                    </div>
                                </div>

                                {/* Metrics */}
                                <div className="flex items-center gap-6 flex-shrink-0">
                                    {item.qber !== null && (
                                        <div className="text-right">
                                            <div className="text-[10px] text-[#44445a] uppercase tracking-wider">QBER</div>
                                            <div className={`text-sm font-mono font-bold ${
                                                item.qber <= 5 ? 'text-emerald-400' : item.qber <= 8.5 ? 'text-amber-400' : 'text-red-400'
                                            }`}>
                                                {item.qber.toFixed(1)}%
                                            </div>
                                        </div>
                                    )}
                                    {item.s_parameter !== null && (
                                        <div className="text-right">
                                            <div className="text-[10px] text-[#44445a] uppercase tracking-wider">S-param</div>
                                            <div className={`text-sm font-mono font-bold ${
                                                item.s_parameter > 2.5 ? 'text-emerald-400' : item.s_parameter > 2 ? 'text-amber-400' : 'text-red-400'
                                            }`}>
                                                {item.s_parameter.toFixed(3)}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Delete Button */}
                                {!compareMode && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(item.id);
                                        }}
                                        className="p-2 rounded-lg text-[#44445a] hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-3 mt-8">
                        <button
                            onClick={() => setPage((p) => Math.max(0, p - 1))}
                            disabled={page === 0}
                            className="p-2.5 rounded-xl bg-[#0c0c16] border border-[#1a1a2e] text-[#a0a0b4] disabled:opacity-30 hover:bg-[#161622] hover:text-white transition-all"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-sm text-[#6a6a82] font-medium px-3">
                            {page + 1} / {totalPages}
                        </span>
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                            disabled={page >= totalPages - 1}
                            className="p-2.5 rounded-xl bg-[#0c0c16] border border-[#1a1a2e] text-[#a0a0b4] disabled:opacity-30 hover:bg-[#161622] hover:text-white transition-all"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {detailId && (
                <SimulationDetailModal
                    simulationId={detailId}
                    onClose={() => setDetailId(null)}
                />
            )}
        </div>
    );
};

export default HistoryPage;
