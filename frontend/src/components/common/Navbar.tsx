/**
 * Navigation Bar
 * Premium dark navbar with active indicator glow.
 * Bottom on mobile, top on desktop.
 */
import { useNavigate, useLocation } from 'react-router-dom';
import { Atom, Shield, Lock, History, Home } from 'lucide-react';

interface NavItem {
    path: string;
    label: string;
    icon: React.ReactNode;
    matchPattern: RegExp;
}

const navItems: NavItem[] = [
    { path: '/', label: 'Home', icon: <Home className="w-4 h-4" />, matchPattern: /^\/$/ },
    { path: '/simulate/bb84', label: 'BB84', icon: <Shield className="w-4 h-4" />, matchPattern: /^\/simulate\/bb84/ },
    { path: '/simulate/e91', label: 'E91', icon: <Atom className="w-4 h-4" />, matchPattern: /^\/simulate\/e91/ },
    { path: '/encrypt', label: 'Encrypt', icon: <Lock className="w-4 h-4" />, matchPattern: /^\/encrypt/ },
    { path: '/history', label: 'History', icon: <History className="w-4 h-4" />, matchPattern: /^\/history/ },
];

export const Navbar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 md:top-0 md:bottom-auto">
            <div className="bg-[#06060e]/95 backdrop-blur-md border-t md:border-t-0 md:border-b border-[#1a1a2e]">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="flex items-center justify-between h-14">
                        {/* Logo - desktop only */}
                        <button
                            onClick={() => navigate('/')}
                            className="hidden md:flex items-center gap-2.5 group"
                        >
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
                                <Atom className="w-3.5 h-3.5 text-white" />
                            </div>
                            <span className="text-sm font-semibold text-white">QKD Simulator</span>
                        </button>

                        {/* Nav items */}
                        <div className="flex items-center justify-around md:justify-end gap-0.5 w-full md:w-auto">
                            {navItems.map((item) => {
                                const isActive = item.matchPattern.test(location.pathname);
                                return (
                                    <button
                                        key={item.path}
                                        onClick={() => navigate(item.path)}
                                        className={`relative flex flex-col md:flex-row items-center gap-1 md:gap-1.5 px-3 md:px-3.5 py-1.5 md:py-1.5 rounded-lg text-[11px] md:text-[13px] font-medium transition-all ${
                                            isActive
                                                ? 'text-white'
                                                : 'text-[#44445a] hover:text-[#a0a0b4]'
                                        }`}
                                    >
                                        <span className={isActive ? 'text-indigo-400' : ''}>{item.icon}</span>
                                        <span>{item.label}</span>
                                        {/* Active indicator line */}
                                        {isActive && (
                                            <span className="hidden md:block absolute -bottom-[9px] left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                                        )}
                                        {isActive && (
                                            <span className="md:hidden absolute -top-0.5 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-indigo-500" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
