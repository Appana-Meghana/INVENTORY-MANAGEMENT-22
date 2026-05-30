import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';

// 🔥 TAILWIND CONFIGURATION INJECTION
if (typeof window !== 'undefined' && window.tailwind) {
    window.tailwind.config = {
        darkMode: 'class', // Critical for manual toggle
    };
}

// 🔥 ARCHITECTURE FIX 1: Error Boundary Class
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error("[CRASH PREVENTED] React Error Boundary Caught:", error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (
                <div className="p-6 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-500/50 rounded-2xl text-center m-4 transition-colors duration-300">
                    <h3 className="text-red-600 dark:text-red-400 font-bold mb-2">Component Error Handled Safely</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">A UI element failed to load, but the core app remains stable.</p>
                    <button onClick={() => this.setState({ hasError: false })} className="mt-4 bg-slate-800 dark:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">Try Reloading Section</button>
                </div>
            );
        }
        return this.props.children;
    }
}

function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

const iconPaths = {
    ShieldCheck: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M9 12l2 2 4-4",
    User: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
    Lock: "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z M7 11V7a5 5 0 0 1 10 0v4",
    Key: "M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4",
    XCircle: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M15 9l-6 6 M9 9l6 6",
    CheckCircle: "M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4L12 14.01l-3-3",
    Package: "M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z M3.27 6.96L12 12.01l8.73-5.05 M12 22.08V12",
    LayoutDashboard: "SPECIAL_RECTS",
    PlusCircle: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 8v8 M8 12h8",
    FileUp: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M12 18v-6 M9 15l3-3 3 3",
    Users: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
    LogOut: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9",
    ArrowLeft: "M19 12H5 M12 19l-7-7 7-7",
    Layers: "M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5",
    Search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M21 21l-4.35-4.35",
    MapPin: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
    Filter: "M22 3H2l8 9.46V19l4 2v-8.54L22 3z",
    CheckSquare: "M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1-2-2h11 M9 11l3 3L22 4",
    Square: "M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z",
    Edit: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
    Trash2: "M3 6h18 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6 M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2 M10 11v6 M14 11v6",
    Database: "M3 5c0 1.657 4.03 3 9 3s9-1.343 9-3-4.03-3-9-3-9 1.343-9 3z M3 5v14c0 1.657 4.03 3 9 3s9-1.343 9-3V5 M3 12c0 1.657 4.03 3 9 3s9-1.343 9-3",
    Download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3",
    Loader: "M12 2v4 M12 18v4 M4.93 4.93l2.83 2.83 M16.24 16.24l2.83 2.83 M2 12h4 M18 12h4 M4.93 19.07l2.83-2.83 M16.24 7.76l2.83-2.83",
    AlertTriangle: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01",
    Clock: "M12 22A10 10 0 1 0 12 2a10 10 0 0 0 0 20z M12 6v6l4 2",
    Building: "M3 21h18 M9 8h1 M9 12h1 M9 16h1 M14 8h1 M14 12h1 M14 16h1 M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16",
    RefreshCw: "M21 2v6h-6 M3 12a9 9 0 0 1 15-6.7L21 8 M3 22v-6h6 M21 12a9 9 0 0 1-15 6.7L3 16",
    Cloud: "M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z",
    ChevronLeft: "M15 18l-6-6 6-6",
    ChevronRight: "M9 18l6-6-6-6",
    Wrench: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z",
    MessageCircle: "M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z",
    Sun: "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z",
    Moon: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
};

const SafeIcon = ({ name, size = 20, className = "" }) => {
    try {
        const d = iconPaths[name];
        if (!d) {
            return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>;
        }
        return (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
                {d === "SPECIAL_RECTS" ? (
                    <g>
                        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                    </g>
                ) : (
                    <path d={d} />
                )}
            </svg>
        );
    } catch (e) {
        return null;
    }
};

const safeParse = (key, fallback) => {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : fallback;
    } catch {
        return fallback;
    }
};

const IconWrapper = ({ iconName, bgClass, colorClass, size = 20 }) => (
    <div className={`p-2.5 rounded-xl shadow-sm border border-slate-200 dark:border-white/5 flex items-center justify-center ${bgClass} ${colorClass} transition-colors duration-300`}>
        <SafeIcon name={iconName} size={size} />
    </div>
);

const StatusBadge = ({ quantity, minStock, critical, status }) => {
    if (critical) {
        return (
            <span className="px-3 py-1 bg-rose-100 dark:bg-rose-500/10 border border-rose-300 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 rounded-lg text-xs font-bold tracking-wide shadow-sm flex items-center justify-center w-max ml-auto space-x-1.5 animate-pulse transition-colors duration-300">
                <SafeIcon name="AlertTriangle" size={14} />
                <span>CRITICAL ASSET</span>
            </span>
        );
    }
    
    const lowerStatus = (status || '').toLowerCase();
    if (lowerStatus.includes('damage') || lowerStatus.includes('fault') || lowerStatus.includes('repair')) {
        return (
            <span className="px-3 py-1 bg-red-100 dark:bg-red-500/10 border border-red-300 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold tracking-wide shadow-sm flex items-center justify-center w-max ml-auto space-x-1.5 transition-colors duration-300">
                <SafeIcon name="Wrench" size={12} />
                <span>{status.toUpperCase()}</span>
            </span>
        );
    }
    if (lowerStatus.includes('spare')) {
        return (
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-500/10 border border-blue-300 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold tracking-wide shadow-sm flex items-center justify-center w-max ml-auto transition-colors duration-300">
                SPARE PART
            </span>
        );
    }
    if (lowerStatus.includes('in use') || lowerStatus.includes('installed')) {
        return (
            <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-bold tracking-wide shadow-sm flex items-center justify-center w-max ml-auto transition-colors duration-300">
                INSTALLED
            </span>
        );
    }

    if (quantity === 0) {
        return (
            <span className="px-3 py-1 bg-red-100 dark:bg-red-500/10 border border-red-300 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold tracking-wide shadow-sm flex items-center justify-center w-max ml-auto transition-colors duration-300">
                Out of Stock
            </span>
        );
    }
    if (quantity < 5 || quantity <= minStock) {
        return (
            <span className="px-3 py-1 bg-amber-100 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-lg text-xs font-bold tracking-wide shadow-sm flex items-center justify-center w-max ml-auto transition-colors duration-300">
                <SafeIcon name="AlertTriangle" size={12} className="mr-1" />
                LOW STOCK
            </span>
        );
    }
    return (
        <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-bold tracking-wide shadow-sm flex items-center justify-center w-max ml-auto transition-colors duration-300">
            {status || 'Available'}
        </span>
    );
};

const StatCard = ({ title, value, iconName, bgClass, colorClass, isActive, onClick }) => (
    <div
        onClick={onClick}
        className={`p-5 lg:p-6 rounded-2xl border ${onClick ? 'cursor-pointer' : ''} transition-all duration-300 group overflow-hidden relative flex flex-col justify-between h-full ${
            isActive ? `${bgClass} border-${colorClass.split('-')[1]}-400 dark:border-${colorClass.split('-')[1]}-500/50 shadow-lg scale-[1.02]` : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
        }`}
    >
        {isActive && (
            <div className={`absolute inset-0 opacity-5 dark:opacity-10 bg-gradient-to-br from-${colorClass.split('-')[1]}-500 to-transparent transition-opacity duration-300`} />
        )}
        <div className="flex justify-between items-start relative z-10 w-full">
            <p className="text-slate-500 dark:text-slate-400 text-[11px] lg:text-sm font-semibold tracking-wide uppercase leading-tight transition-colors duration-300">{title}</p>
            <IconWrapper iconName={iconName} bgClass={bgClass} colorClass={colorClass} size={20} />
        </div>
        <h3 className={`text-3xl lg:text-4xl font-black mt-4 relative z-10 transition-colors duration-300 ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-800 dark:text-slate-100'}`}>{value}</h3>
    </div>
);

const App = () => {
    // 🔥 PROFESSIONAL DAY/NIGHT PERSISTENCE ENGINE
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('theme');
            if (saved) return saved;
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return 'dark'; 
    });
    
    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const [currentUser, setCurrentUser] = useState(null);
    const [authMode, setAuthMode] = useState('login');
    const [authData, setAuthData] = useState({ username: '', password: '', newPassword: '' });
    const [authMessage, setAuthMessage] = useState({ type: '', text: '' });

    const [users, setUsers] = useState(() => safeParse('users', [{ id: 'u1', username: 'admin', password: 'password', role: 'admin' }]));
    const [pendingRequests, setPendingRequests] = useState(() => safeParse('pendingRequests', []));

    const [view, setView] = useState('dashboard');
    const [importing, setImporting] = useState(false);
    const [syncUrlInput, setSyncUrlInput] = useState('');
    const [isLiveSyncing, setIsLiveSyncing] = useState(false);

    // 🔥 NEW MULTI-SHEET SELECTION STATE
    const [pendingWorkbook, setPendingWorkbook] = useState(null);
    const [availableSheets, setAvailableSheets] = useState([]);
    const [selectedSheetsList, setSelectedSheetsList] = useState(new Set());
    const [showSheetSelector, setShowSheetSelector] = useState(false);

    const fallbackItems = [
        { _id: crypto.randomUUID(), id: crypto.randomUUID(), name: 'Industrial Drill', make: 'Bosch', partNumber: 'ID-100', specification: '18V Cordless', quantity: 5, minStock: 10, itemCode: 'ITM-001', po: 'PO-2024-01', remarks: 'Needs calibration', rack: 'RACK-A1', location: 'Warehouse North', status: 'Available', critical: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { _id: crypto.randomUUID(), id: crypto.randomUUID(), name: 'Safety Helmets', make: '3M', partNumber: 'SH-200', specification: 'Hard Hat Yellow', quantity: 50, minStock: 20, itemCode: 'ITM-002', po: 'PO-2024-02', remarks: '', rack: 'RACK-B4', location: 'Storage Room', status: 'Available', critical: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { _id: crypto.randomUUID(), id: crypto.randomUUID(), name: 'Copper Wiring', make: 'Polycab', partNumber: 'CW-300', specification: '2.5 sq mm', quantity: 0, minStock: 15, itemCode: 'ITM-003', po: 'PO-2024-03', remarks: 'Urgent refill', rack: 'RACK-C2', location: 'Main Floor', status: 'Damaged', critical: true, createdAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: new Date(Date.now() - 86400000).toISOString() }
    ];

    const fallbackLogs = [
        { id: '1', message: "Live Sync Activated. Connected to SharePoint.", type: "info", timestamp: new Date().toISOString() },
        { id: '2', message: "WhatsApp Alert Sent: Critical Item 'Copper Wiring' fell to 0 stock.", type: "alert", timestamp: new Date(Date.now() - 3600000).toISOString() }
    ];

    const [items, setItems] = useState(() => safeParse('inventory_items', fallbackItems));
    const [activityLogs, setActivityLogs] = useState(() => safeParse('activity_logs', fallbackLogs));
    
    const [selectedItems, setSelectedItems] = useState(new Set());

    useEffect(() => {
        if (typeof window !== 'undefined' && !window.XLSX) {
            const script = document.createElement('script');
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
            script.async = true;
            document.head.appendChild(script);
        }
    }, []);

    const refreshInventory = async () => {
        try {
            console.log("[SYNC] Pulling fresh inventory & logs from MongoDB...");
            const [itemRes, logRes] = await Promise.all([
                axios.get(`http://localhost:5000/api/items?_t=${Date.now()}`).catch(() => null),
                axios.get(`http://localhost:5000/api/activity?_t=${Date.now()}`).catch(() => null)
            ]);

            if (itemRes?.data?.success && Array.isArray(itemRes.data.data)) {
                setItems(itemRes.data.data);
            }
            if (logRes?.data?.success && Array.isArray(logRes.data.data)) {
                setActivityLogs(logRes.data.data);
            }
        } catch (error) {
            console.error("[SYNC ERROR] Backend connection failed. Running on cached local state.", error?.message);
        }
    };

    useEffect(() => {
        refreshInventory(); 
        const interval = setInterval(refreshInventory, 15000); 
        return () => clearInterval(interval);
    }, []);

    useEffect(() => { localStorage.setItem('inventory_items', JSON.stringify(items)); }, [items]);
    useEffect(() => { localStorage.setItem('activity_logs', JSON.stringify(activityLogs)); }, [activityLogs]);
    useEffect(() => { localStorage.setItem('users', JSON.stringify(users)); }, [users]);
    useEffect(() => { localStorage.setItem('pendingRequests', JSON.stringify(pendingRequests)); }, [pendingRequests]);

    const initialForm = { _id: null, id: null, name: '', make: '', partNumber: '', specification: '', quantity: 0, minStock: 0, itemCode: '', po: '', remarks: '', rack: '', location: '', status: 'Available', critical: false };
    const [formData, setFormData] = useState(initialForm);

    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearchQuery = useDebounce(searchQuery, 300); 
    
    const [filterType, setFilterType] = useState('all');
    const [locationFilter, setLocationFilter] = useState('all');
    const [makeFilter, setMakeFilter] = useState('all'); 
    const [rackFilter, setRackFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [equipmentFilter, setEquipmentFilter] = useState('all');
    
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 100;
    const fileInputRef = useRef(null);

    const uniqueLocations = useMemo(() => {
        const locs = items.map((item) => item?.location).filter(Boolean);
        return [...new Set(locs)].sort();
    }, [items]);

    const uniqueMakes = useMemo(() => {
        const makes = items.map((item) => item?.make).filter(Boolean);
        return [...new Set(makes)].sort();
    }, [items]);

    const uniqueRacks = useMemo(() => {
        const racks = items.map((item) => item?.rack).filter(Boolean);
        return [...new Set(racks)].sort();
    }, [items]);

    const uniqueStatuses = useMemo(() => {
        const statuses = items.map((item) => item?.status).filter(Boolean);
        return [...new Set(statuses)].sort();
    }, [items]);

    const uniqueEquipment = useMemo(() => {
        const eq = items.map((item) => item?.equipment).filter(Boolean);
        return [...new Set(eq)].sort();
    }, [items]);

    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            try {
                const safeName = (item?.name ?? '').toString().toLowerCase();
                const safePart = (item?.partNumber ?? '').toString().toLowerCase();
                const safeCode = (item?.itemCode ?? '').toString().toLowerCase();
                const safeMakeStr = (item?.make ?? '').toString().toLowerCase();
                const safeRack = (item?.rack ?? '').toString().toLowerCase();
                
                const query = (debouncedSearchQuery ?? '').toLowerCase();

                const matchesSearch = 
                    safeName.includes(query) || 
                    safePart.includes(query) || 
                    safeCode.includes(query) || 
                    safeMakeStr.includes(query) ||
                    safeRack.includes(query);

                const matchesLocation = locationFilter === 'all' || item?.location === locationFilter;
                const matchesMake = makeFilter === 'all' || item?.make === makeFilter;
                const matchesRack = rackFilter === 'all' || item?.rack === rackFilter;
                const matchesStatus = statusFilter === 'all' || item?.status === statusFilter;
                const matchesEquipment = equipmentFilter === 'all' || item?.equipment === equipmentFilter;

                if (!matchesSearch || !matchesLocation || !matchesMake || !matchesRack || !matchesStatus || !matchesEquipment) return false;

                const qty = Number(item?.quantity) || 0;
                const min = Number(item?.minStock) || 0;

                if (filterType === 'low-stock') return qty < 5 || (min > 0 && qty <= min && qty > 0);
                if (filterType === 'out-of-stock') return qty === 0;
                if (filterType === 'critical') return item?.critical === true;
                return true;
            } catch (error) {
                console.error("Filter calculation skipped a corrupted item:", error);
                return false;
            }
        });
    }, [items, debouncedSearchQuery, filterType, locationFilter, makeFilter, rackFilter, statusFilter, equipmentFilter]);

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchQuery, filterType, locationFilter, makeFilter, rackFilter, statusFilter, equipmentFilter]);

    const paginatedItems = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredItems.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredItems, currentPage]);

    const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;

    const recentActivity = useMemo(() => {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const newlyAdded = items.filter(i => i?.createdAt && new Date(i.createdAt) > oneDayAgo);
        const recentlyUpdated = items.filter(i => 
            i?.updatedAt && new Date(i.updatedAt) > oneDayAgo && i.createdAt !== i.updatedAt
        );
        return { newlyAdded, recentlyUpdated };
    }, [items]);

    const stats = {
        total: items.length,
        critical: items.filter(i => i?.critical).length,
        lowStock: items.filter(i => (Number(i?.quantity) || 0) < 5 || ((Number(i?.minStock) || 0) > 0 && (Number(i?.quantity) || 0) <= (Number(i?.minStock) || 0) && (Number(i?.quantity) || 0) > 0)).length,
        recentAdded: recentActivity.newlyAdded.length,
        recentUpdated: recentActivity.recentlyUpdated.length
    };

    const toggleSelection = (uniqueId) => {
        if (!uniqueId) return;
        setSelectedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(uniqueId)) newSet.delete(uniqueId);
            else newSet.add(uniqueId);
            return newSet;
        });
    };

    const toggleSelectAll = () => {
        if (selectedItems.size === filteredItems.length && filteredItems.length > 0) {
            setSelectedItems(new Set());
        } else {
            setSelectedItems(new Set(filteredItems.map(i => i._id || i.id)));
        }
    };

    const handleBulkDelete = async () => {
        if (window.confirm(`Are you sure you want to delete ${selectedItems.size} items permanently? This action cannot be undone.`)) {
            const idsToDelete = Array.from(selectedItems);
            console.log(`[BULK DELETE] Initiating purge for ${idsToDelete.length} items...`, idsToDelete);
            
            setSelectedItems(new Set());

            setItems(prevItems => prevItems.filter(item => !idsToDelete.includes(item._id || item.id)));

            try {
                const chunkSize = 5000;
                for (let i = 0; i < idsToDelete.length; i += chunkSize) {
                    const chunk = idsToDelete.slice(i, i + chunkSize);
                    await axios.post("http://localhost:5000/api/items/bulk-delete", { ids: chunk });
                }
                console.log(`[BULK DELETE SUCCESS] Backend wipe successful.`);
            } catch (error) {
                console.error("[BULK DELETE ERROR] Backend wipe partially failed:", error);
                alert("Database wipe failed or partially failed. The UI will now refresh to show true state.");
            } finally {
                await refreshInventory();
            }
        }
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        
        const activeId = formData._id || formData.id;
        const isEdit = !!activeId && items.some(i => (i._id || i.id) === activeId);
        const timestamp = new Date().toISOString();
        
        const safeItem = {
            ...formData,
            id: formData.id || crypto.randomUUID(), 
            quantity: Number(formData.quantity) || 0,
            minStock: Number(formData.minStock) || 0,
            location: formData.location || 'UNASSIGNED LOCATION',
            rack: formData.rack || 'UNASSIGNED RACK',
            status: formData.status || 'Available',
            critical: Boolean(formData.critical),
            createdAt: formData.createdAt || timestamp,
            updatedAt: timestamp
        };

        console.log(`[EDIT/ADD] Processing item with MongoDB/Local ID: ${activeId || 'NEW'}`);

        setItems(prevItems => {
            if (isEdit) return prevItems.map((i) => ((i._id || i.id) === activeId ? safeItem : i));
            return [safeItem, ...prevItems];
        });

        try {
            if (isEdit) {
                await axios.put(`http://localhost:5000/api/items/${activeId}`, safeItem);
            } else {
                await axios.post("http://localhost:5000/api/items", safeItem);
            }
        } catch (error) {
            console.error("Failed to save data to backend:", error);
        } finally {
            await refreshInventory();
        }

        setFormData(initialForm);
        setView('dashboard');
    };

    const handleEditItem = (item) => {
        console.log(`[EDIT] Selected item ID for form: ${item._id || item.id}`);
        setFormData(item);
        setView('add-item');
    };

    const handleDeleteItem = async (uniqueId) => {
        if (!uniqueId) return console.error("[DELETE ERROR] No valid ID provided");

        if (window.confirm('Are you sure you want to delete this item?')) {
            console.log(`[DELETE] Initiating wipe for item ID: ${uniqueId}`);
            
            setSelectedItems(prevSet => {
                const newSet = new Set(prevSet);
                newSet.delete(uniqueId);
                return newSet;
            });
            
            setItems(prevItems => prevItems.filter(item => (item._id || item.id) !== uniqueId));

            try {
                await axios.delete(`http://localhost:5000/api/items/${uniqueId}`);
                console.log(`[DELETE SUCCESS] Backend confirmed wiped.`);
            } catch (error) {
                console.error("[DELETE ERROR] Failed to delete item from backend:", error);
                alert("Database wipe failed. Restoring item to UI.");
            } finally {
                await refreshInventory();
            }
        }
    };

    const handleStartLiveSync = async () => {
        if (!syncUrlInput.includes("docs.google.com/spreadsheets") && !syncUrlInput.includes("sharepoint.com") && !syncUrlInput.includes("1drv.ms")) {
            alert("Please enter a valid Google Sheets or SharePoint/OneDrive URL.");
            return;
        }
        setIsLiveSyncing(true);
        try {
            await axios.post("http://localhost:5000/api/sync/start", { url: syncUrlInput });
            alert("Live Sync successfully connected! Graph API monitoring is active. Data will update automatically.");
            
            setActivityLogs(prev => [{ id: Date.now(), message: `Connected to Master Link: ${syncUrlInput.substring(0,30)}...`, type: 'info', timestamp: new Date().toISOString() }, ...prev]);
            
            setView('dashboard');
        } catch (err) {
            console.error("Failed to start sync:", err);
            alert("Error communicating with backend to start sync. Ensure Azure Graph Secrets are configured on the server.");
        } finally {
            setIsLiveSyncing(false);
            setSyncUrlInput('');
            await refreshInventory();
        }
    };

    // 🔥 EXTRACTED BULK SYNC FUNCTION
    const executeBulkSync = async (newItems) => {
        console.log(`[Smart Excel Engine] Total raw items identified: ${newItems.length}`);
        
        const existingKeys = new Set(items.map((p) => {
            const code = p?.itemCode ? String(p.itemCode).toLowerCase() : '';
            const hash = `${p?.name}-${p?.partNumber}`.toLowerCase().replace(/[^a-z0-9]/g, '');
            return code || hash;
        }));
        
        const uniqueNewItems = newItems.filter((n) => {
            const code = n?.itemCode ? String(n.itemCode).toLowerCase() : '';
            const hash = `${n?.name}-${n?.partNumber}`.toLowerCase().replace(/[^a-z0-9]/g, '');
            const keyToCheck = code || hash;
            
            if (existingKeys.has(keyToCheck)) return false;
            existingKeys.add(keyToCheck);
            return true;
        });

        if (uniqueNewItems.length === 0) {
            alert("No new items to upload. All items are duplicates or the file is empty.");
            setImporting(false);
            return;
        }

        try {
            const chunkSize = 5000;
            let totalUploaded = 0;

            for (let i = 0; i < uniqueNewItems.length; i += chunkSize) {
                const chunk = uniqueNewItems.slice(i, i + chunkSize);
                await axios.post("http://localhost:5000/api/items/bulk", chunk);
                totalUploaded += chunk.length;
                console.log(`[Smart Excel Engine] Synced ${totalUploaded}/${uniqueNewItems.length} items to database...`);
            }

            setItems((prev) => [...uniqueNewItems, ...prev]);
            alert(`Successfully processed and safely imported ${totalUploaded} new items without breaking existing data!`);
        } catch (error) {
            console.error("[Smart Excel Engine] Failed bulk sync:", error);
            alert("Database Sync Error. Valid items were likely saved. See console for details.");
        } finally {
            setImporting(false);
            setView('dashboard');
            await refreshInventory(); 
        }
    };

    // 🔥 NEW FUNCTION: ONLY PROCESS USER-SELECTED SHEETS
    const processSelectedSheets = async () => {
        setShowSheetSelector(false);
        setImporting(true);
        
        try {
            const parsedItems = [];
            const timestamp = new Date().toISOString();

            for (const sheetName of availableSheets) {
                if (!selectedSheetsList.has(sheetName)) continue;
                
                const sheet = pendingWorkbook.Sheets[sheetName];
                const rows = window.XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

                if (!rows || rows.length === 0) continue;

                let headerRowIndex = -1;
                let colMap = { 
                    name: -1, make: -1, part: -1, spec: -1, qty: -1, code: -1, po: -1, 
                    remark: -1, loc: -1, rack: -1, equipment: -1, subArea: -1, status: -1,
                    unit: -1, assembly: -1, uom: -1, rfqNo: -1, vendorDetails: -1, drgRef: -1,
                    area: -1, criticality: -1
                };
                
                const aliases = {
                    name: ['description', 'item description', 'component', 'component name', 'item name', 'name', 'asset name', 'material name', 'material description', 'part description', 'short text'],
                    make: ['maker', 'brand', 'make', 'manufacturer', 'vendor', 'supplier', 'mfg'],
                    part: ['part no', 'part number', 'code', 'pn', 'p/n', 'model', 'model no', 'model number', 'mfg part', 'mpn'],
                    spec: ['specification', 'spec', 'details', 'parameters', 'rating', 'tech spec', 'technical', 'dimensions'],
                    qty: ['installed quantity', 'required spare quantity', 'qty', 'quantity', 'stock', 'count', 'amount', 'balance', 'on hand', 'available qty', 'current stock'],
                    code: ['item code', 'sap code', 'jsw item code', 'id', 'asset id', 'material code', 'system code', 'internal code', 'material'],
                    po: ['po no', 'po', 'po number', 'order ref', 'purchase order', 'pr number', 'pr no'],
                    remark: ['remark', 'remarks', 'notes', 'comments', 'additional info', 'desc'],
                    loc: ['spare location', 'location', 'plant location', 'storage location', 'zone', 'warehouse', 'department', 'site', 'position', 'plant', 'facility', 'shop'],
                    area: ['area', 'plant area'],
                    subArea: ['sub area', 'sub-area', 'section', 'room', 'floor', 'level'],
                    rack: ['rack', 'rack no', 'rack number', 'rack location', 'storage rack', 'bin', 'bin no', 'shelf', 'cabinet', 'panel', 'drawer', 'storage bin', 'storage', 'shelf no'],
                    equipment: ['equipment', 'machine', 'system', 'parent equipment', 'asset group', 'asset', 'equipment name'],
                    status: ['status', 'condition', 'availability', 'state', 'asset status', 'current status'],
                    unit: ['unit', 'plant unit', 'production unit', 'block'],
                    assembly: ['assembly', 'sub-assembly', 'sub assembly', 'component group'],
                    uom: ['u.o.m', 'uom', 'unit of measure', 'measure', 'base unit'],
                    rfqNo: ['rfq no', 'rfq', 'request for quote'],
                    vendorDetails: ['vendor details', 'vendor name', 'supplier details', 'contact'],
                    drgRef: ['drg ref', 'drawing no', 'drawing', 'blueprint', 'drg'],
                    criticality: ['severity', 'probability', 'criticality', 'critical', 'priority']
                };

                let bestMatchCount = 0;
                
                for (let i = 0; i < Math.min(30, rows.length); i++) {
                    const row = rows[i].map(c => String(c).toLowerCase().trim());
                    let matchCount = 0;
                    const tempMap = { ...colMap };

                    row.forEach((cell, idx) => {
                        if (!cell) return;
                        const cleanCell = cell.replace(/[^a-z0-9\s]/g, '');
                        for (const [key, aliasList] of Object.entries(aliases)) {
                            if (tempMap[key] === -1 && aliasList.some(a => cleanCell === a || cleanCell.includes(a))) {
                                tempMap[key] = idx;
                                matchCount++;
                                break;
                            }
                        }
                    });

                    if (matchCount > bestMatchCount) {
                        bestMatchCount = matchCount;
                        headerRowIndex = i;
                        colMap = tempMap;
                    }
                }

                if (headerRowIndex === -1 || bestMatchCount < 2) {
                    console.warn(`[Smart Excel Engine] Could not confidently find headers in sheet "${sheetName}". Skipping.`);
                    continue;
                }

                const startRow = headerRowIndex + 1;
                let lastKnown = { unit: '', equipment: '', area: '', subArea: '', assembly: '', rack: '' };
                
                for (let i = startRow; i < rows.length; i++) {
                    try {
                        const row = rows[i];
                        if (!row || row.every(c => !c || String(c).trim() === '')) continue;

                        const getVal = (idx) => idx !== -1 ? String(row[idx] || "").trim() : "";

                        const rawUnit = getVal(colMap.unit);
                        if (rawUnit) lastKnown.unit = rawUnit;
                        
                        const rawArea = getVal(colMap.area) || getVal(colMap.loc);
                        if (rawArea) lastKnown.area = rawArea;

                        const rawEquip = getVal(colMap.equipment);
                        if (rawEquip) lastKnown.equipment = rawEquip;

                        const rawSubArea = getVal(colMap.subArea);
                        if (rawSubArea) lastKnown.subArea = rawSubArea;

                        const rawAssembly = getVal(colMap.assembly);
                        if (rawAssembly) lastKnown.assembly = rawAssembly;

                        const rawRack = getVal(colMap.rack) || getVal(colMap.drgRef);
                        if (rawRack) lastKnown.rack = rawRack;

                        const nameVal = getVal(colMap.name);
                        if (!nameVal || /^(name|component|description|item)$/i.test(nameVal) || nameVal === "0") {
                            continue; 
                        }

                        const rawQty = getVal(colMap.qty).replace(/[^0-9.-]+/g, "");
                        const safeQuantity = Number(rawQty) || 0;

                        let finalLocation = [lastKnown.area, lastKnown.subArea].filter(Boolean).join(" - ");
                        if (!finalLocation) {
                            finalLocation = (sheetName && sheetName !== 'Sheet1') ? sheetName.toUpperCase() : "UNASSIGNED LOCATION";
                        }

                        let finalRack = [lastKnown.equipment, lastKnown.assembly, lastKnown.rack].filter(Boolean).join(" - ");
                        if (!finalRack) {
                            if (/rack/i.test(sheetName)) finalRack = sheetName;
                            else finalRack = "UNASSIGNED RACK";
                        }
                        
                        finalRack = finalRack.toUpperCase().replace(/^RACK[\s-_]*(\d+)/i, 'RACK-$1').trim();

                        const rawStatus = getVal(colMap.status);
                        let finalStatus = 'Available';
                        if (rawStatus) {
                            const s = rawStatus.toLowerCase();
                            if (s.match(/damage|faulty|repair/)) finalStatus = "Damaged/Repair";
                            else if (s.match(/spare/)) finalStatus = "Spare";
                            else if (s.match(/in use|installed/)) finalStatus = "In Use";
                            else finalStatus = rawStatus; 
                        }

                        const rawCrit = getVal(colMap.criticality);
                        const isCritical = /urgent|critical|danger|important|safety|main plc/i.test(nameVal) || /high|critical/i.test(rawCrit) || /critical/i.test(sheetName);

                        parsedItems.push({
                            id: crypto.randomUUID(),
                            name: nameVal,
                            make: getVal(colMap.make),
                            partNumber: getVal(colMap.part),
                            specification: getVal(colMap.spec),
                            quantity: safeQuantity,
                            minStock: 0,
                            itemCode: getVal(colMap.code) || `AUTO-${crypto.randomUUID().substring(0,6).toUpperCase()}`,
                            po: getVal(colMap.po),
                            remarks: getVal(colMap.remark),
                            rack: finalRack,
                            location: finalLocation,
                            status: finalStatus,
                            critical: isCritical,
                            
                            unit: lastKnown.unit,
                            equipment: lastKnown.equipment,
                            subArea: lastKnown.subArea,
                            assembly: lastKnown.assembly,
                            uom: getVal(colMap.uom),
                            rfqNo: getVal(colMap.rfqNo),
                            vendorDetails: getVal(colMap.vendorDetails),
                            drgRef: getVal(colMap.drgRef),
                            
                            createdAt: timestamp,
                            updatedAt: timestamp
                        });
                    } catch(rowErr) {
                        console.warn(`[Smart Excel Engine] Safely skipped malformed row ${i}:`, rowErr.message);
                    }
                }
            }

            if (parsedItems.length === 0) {
                alert("No valid data found in the selected sheets or columns could not be mapped safely. Please check file format.");
                setImporting(false);
                return;
            }

            await executeBulkSync(parsedItems);
        } catch (error) {
            console.error("[Smart Excel Engine] Fatal parsing error:", error);
            alert("Error parsing file. Browser may have run out of memory for an extremely large file.");
            setImporting(false);
        } finally {
            setPendingWorkbook(null);
        }
    };

    // 🔥 REFACTORED: PAUSES AT WORKBOOK CREATION TO SHOW MODAL
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!window.XLSX) return alert('Excel parser loading, try again in a moment.');
        
        setImporting(true);
        const reader = new FileReader();

        reader.onload = async (event) => {
            try {
                const data = new Uint8Array(event.target.result);
                const workbook = window.XLSX.read(data, { type: 'array' });
                
                // Halts automatic execution, populates modal state instead
                setPendingWorkbook(workbook);
                setAvailableSheets(workbook.SheetNames);
                setSelectedSheetsList(new Set(workbook.SheetNames)); // All selected by default
                setShowSheetSelector(true);
                setImporting(false);
                
                if (fileInputRef.current) fileInputRef.current.value = '';
            } catch (error) {
                console.error("Excel Parsing Error:", error);
                alert("Error reading file structure.");
                setImporting(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        };

        reader.readAsArrayBuffer(file);
    };

    const downloadTemplate = () => {
        const headers = 'Component Name,Make,Part Number,Specification,Quantity,Minimum Stock,Item Code,PO,Remarks,Status,Rack Number,Location\n';
        const sampleData = 'Sample Gear,Toyota,PT-889,Metal Alloy,100,20,IC-009,PO-999,Urgent,Available,R-10,Zone A\n';
        const blob = new Blob([headers + sampleData], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'Template.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const approveUser = (req) => {
        setUsers([...users, { id: req.id, username: req.username, password: req.password, role: 'user' }]);
        setPendingRequests(pendingRequests.filter(p => p.id !== req.id));
    };

    const rejectUser = (id) => {
        setPendingRequests(pendingRequests.filter(p => p.id !== id));
    };

    const handleAuthSubmit = (e) => {
        e.preventDefault();
        setAuthMessage({ type: '', text: '' });
        if (authMode === 'login') {
            const user = users.find((u) => u.username === authData.username && u.password === authData.password);
            if (user) {
                setCurrentUser(user);
                setAuthData({ username: '', password: '', newPassword: '' });
            } else setAuthMessage({ type: 'error', text: 'Wrong username or password!' });
        } else if (authMode === 'request') {
            if (users.find((u) => u.username === authData.username) || pendingRequests.find((u) => u.username === authData.username)) {
                return setAuthMessage({ type: 'error', text: 'Username exists or request pending.' });
            }
            setPendingRequests([...pendingRequests, { id: crypto.randomUUID(), username: authData.username, password: authData.password }]);
            setAuthMessage({ type: 'success', text: 'Access request sent.' });
            setTimeout(() => setAuthMode('login'), 2000);
        } else if (authMode === 'reset') {
            const idx = users.findIndex((u) => u.username === authData.username && u.password === authData.password);
            if (idx !== -1) {
                const up = [...users];
                up[idx].password = authData.newPassword;
                setUsers(up);
                setAuthMessage({ type: 'success', text: 'Password changed!' });
                setTimeout(() => setAuthMode('login'), 2000);
            } else setAuthMessage({ type: 'error', text: 'Incorrect current credentials.' });
        }
    };

    const SidebarItem = ({ iconName, label, active, onClick, colorClass }) => (
        <button
            onClick={onClick}
            className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${active ? 'bg-slate-200 dark:bg-slate-800/80 text-slate-900 dark:text-white shadow-sm border border-slate-300 dark:border-slate-700/50' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-200'}`}
        >
            <div className={`${active ? colorClass : 'text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'} transition-colors duration-300`}>
                <SafeIcon name={iconName} size={20} />
            </div>
            <span className={`font-medium tracking-wide transition-colors duration-300 ${active ? 'font-bold' : ''}`}>{label}</span>
        </button>
    );

    return (
        <div className={`min-h-screen w-full transition-colors duration-300 ${theme === 'dark' ? 'dark' : 'light'}`}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
                body { 
                    font-family: 'Inter', sans-serif; 
                    background-color: ${theme === 'dark' ? '#020617' : '#f8fafc'};
                    color: ${theme === 'dark' ? '#f8fafc' : '#0f172a'};
                    transition: background-color 0.3s ease, color 0.3s ease;
                }
                ::-webkit-scrollbar { width: 8px; height: 8px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: ${theme === 'dark' ? '#334155' : '#cbd5e1'}; border-radius: 10px; }
                ::-webkit-scrollbar-thumb:hover { background: ${theme === 'dark' ? '#475569' : '#94a3b8'}; }
                select {
                    appearance: none;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='${theme === 'dark' ? 'white' : 'black'}'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-position: right 0.5rem center;
                    background-size: 1.25rem;
                    padding-right: 2.5rem;
                }
                .custom-scrollbar::-webkit-scrollbar { height: 6px; }
            `}</style>
            
            {!currentUser ? (
                <ErrorBoundary>
                    <div className="min-h-screen flex items-center justify-center p-4 font-sans">
                        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-2xl transition-colors duration-300">
                            <div className="flex flex-col items-center mb-8">
                                <IconWrapper iconName="ShieldCheck" bgClass="bg-blue-100 dark:bg-blue-500/10" colorClass="text-blue-600 dark:text-blue-500" size={40} />
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white text-center mt-4 tracking-tight transition-colors duration-300">Inventory Management App</h1>
                                <p className="text-slate-500 dark:text-slate-400 text-sm text-center mt-1 transition-colors duration-300">Enterprise Management Protocol</p>
                            </div>

                            <div className="flex bg-slate-100 dark:bg-slate-950 rounded-xl p-1.5 mb-6 border border-slate-200 dark:border-slate-800/50 transition-colors duration-300">
                                {['login', 'request', 'reset'].map((mode) => (
                                    <button
                                        key={mode}
                                        onClick={() => { setAuthMode(mode); setAuthMessage({ type: '', text: '' }); }}
                                        className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all capitalize ${authMode === mode ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                    >
                                        {mode.replace('request', 'access')}
                                    </button>
                                ))}
                            </div>

                            <form onSubmit={handleAuthSubmit} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400 ml-1 transition-colors duration-300">Username</label>
                                    <div className="relative group">
                                        <SafeIcon name="User" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 transition-colors duration-300" size={18} />
                                        <input required type="text" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-blue-500 dark:focus:border-blue-600 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-600 transition-all duration-300 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600" value={authData.username} onChange={(e) => setAuthData({ ...authData, username: e.target.value })} placeholder="admin" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400 ml-1 transition-colors duration-300">{authMode === 'reset' ? 'Current Password' : 'Password'}</label>
                                    <div className="relative group">
                                        <SafeIcon name="Lock" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 transition-colors duration-300" size={18} />
                                        <input required type="password" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-blue-500 dark:focus:border-blue-600 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-600 transition-all duration-300 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600" value={authData.password} onChange={(e) => setAuthData({ ...authData, password: e.target.value })} placeholder="••••••••" />
                                    </div>
                                </div>

                                {authMode === 'reset' && (
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400 ml-1 transition-colors duration-300">New Password</label>
                                        <div className="relative group">
                                            <SafeIcon name="Key" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 transition-colors duration-300" size={18} />
                                            <input required type="password" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-blue-500 dark:focus:border-blue-600 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-600 transition-all duration-300 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600" value={authData.newPassword} onChange={(e) => setAuthData({ ...authData, newPassword: e.target.value })} placeholder="••••••••" />
                                        </div>
                                    </div>
                                )}

                                {authMessage.text && (
                                    <div className={`p-3 rounded-xl text-sm font-medium flex items-center space-x-2 transition-colors duration-300 ${authMessage.type === 'error' ? 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-500/20' : 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/20'}`}>
                                        <SafeIcon name={authMessage.type === 'error' ? "XCircle" : "CheckCircle"} size={16} />
                                        <span>{authMessage.text}</span>
                                    </div>
                                )}

                                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all duration-300 mt-6 shadow-lg shadow-blue-500/20 active:scale-[0.98]">
                                    {authMode === 'login' ? 'Authenticate' : authMode === 'request' ? 'Submit Request' : 'Update Credentials'}
                                </button>
                            </form>
                        </div>
                    </div>
                </ErrorBoundary>
            ) : (
                <div className="flex h-screen font-sans selection:bg-blue-500/30">
                    <aside className="w-72 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex flex-col p-5 shrink-0 relative z-20 transition-colors duration-300">
                        <div className="flex items-center justify-between px-2 mb-12 mt-2">
                            <div className="flex items-center space-x-4">
                                <IconWrapper iconName="Package" bgClass="bg-blue-600" colorClass="text-white" size={24} />
                                <div>
                                    <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight transition-colors duration-300">Inventory<br />App</h1>
                                    <p className="text-[10px] text-blue-600 dark:text-blue-400 font-mono uppercase tracking-widest mt-1 bg-blue-100 dark:bg-blue-500/10 px-2 py-0.5 rounded w-max transition-colors duration-300">{currentUser.role} Portal</p>
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
                                className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all duration-300 border border-transparent dark:border-slate-700"
                                title="Toggle Theme"
                            >
                                <SafeIcon name={theme === 'dark' ? 'Sun' : 'Moon'} size={18} />
                            </button>
                        </div>

                        <nav className="flex-1 space-y-1.5">
                            <SidebarItem iconName="LayoutDashboard" colorClass="text-blue-600 dark:text-blue-400" label="Dashboard" active={view === 'dashboard'} onClick={() => { setView('dashboard'); setSelectedItems(new Set()); }} />
                            <SidebarItem iconName="PlusCircle" colorClass="text-emerald-600 dark:text-emerald-400" label="Add Component" active={view === 'add-item'} onClick={() => { setView('add-item'); setFormData(initialForm); }} />
                            <SidebarItem iconName="FileUp" colorClass="text-indigo-600 dark:text-indigo-400" label="Bulk Import / Sync" active={view === 'upload'} onClick={() => setView('upload')} />
                            {currentUser.role === 'admin' && (
                                <div className="pt-6 mt-6 border-t border-slate-200 dark:border-slate-800/60 transition-colors duration-300">
                                    <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 transition-colors duration-300">Admin Tools</p>
                                    <SidebarItem iconName="Users" colorClass="text-purple-600 dark:text-purple-400" label="Access Manager" active={view === 'access-manager'} onClick={() => setView('access-manager')} />
                                </div>
                            )}
                        </nav>

                        <div className="pt-6 border-t border-slate-200 dark:border-slate-800/60 transition-colors duration-300">
                            <button onClick={() => setCurrentUser(null)} className="w-full flex items-center space-x-3 px-4 py-3.5 text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 rounded-xl transition-all duration-300 group">
                                <SafeIcon name="LogOut" size={20} className="group-hover:scale-110 transition-transform" />
                                <span className="font-medium tracking-wide">Disconnect Session</span>
                            </button>
                        </div>
                    </aside>

                    <main className="flex-1 flex flex-col h-screen overflow-hidden p-8 relative">
                        <ErrorBoundary>
                            <div className="flex justify-between items-end mb-8 shrink-0">
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900 dark:text-white capitalize tracking-tight transition-colors duration-300">{view.replace('-', ' ')}</h2>
                                    <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium transition-colors duration-300">Enterprise Tracking Ecosystem</p>
                                </div>
                                {view !== 'dashboard' && (
                                    <button onClick={() => setView('dashboard')} className="flex items-center space-x-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-5 py-2.5 rounded-xl transition-all duration-300 border border-slate-300 dark:border-slate-700 shadow-sm">
                                        <SafeIcon name="ArrowLeft" size={18} />
                                        <span className="font-medium">Back to System</span>
                                    </button>
                                )}
                            </div>

                            {view === 'dashboard' ? (
                                <div className="flex flex-col h-full overflow-hidden pb-4">
                                    
                                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 shrink-0 mb-6">
                                        <StatCard title="Total Items" value={stats.total} iconName="Package" bgClass="bg-blue-100 dark:bg-blue-500/10" colorClass="text-blue-600 dark:text-blue-500" isActive={filterType === 'all'} onClick={() => setFilterType('all')} />
                                        <StatCard title="Critical Items" value={stats.critical} iconName="AlertTriangle" bgClass="bg-rose-100 dark:bg-rose-500/10" colorClass="text-rose-600 dark:text-rose-500" isActive={filterType === 'critical'} onClick={() => setFilterType('critical')} />
                                        <StatCard title="Low Stock (<5)" value={stats.lowStock} iconName="Layers" bgClass="bg-amber-100 dark:bg-amber-500/10" colorClass="text-amber-600 dark:text-amber-500" isActive={filterType === 'low-stock'} onClick={() => setFilterType('low-stock')} />
                                        <StatCard title="Recently Added" value={stats.recentAdded} iconName="Clock" bgClass="bg-emerald-100 dark:bg-emerald-500/10" colorClass="text-emerald-700 dark:text-emerald-500" />
                                        <StatCard title="Recently Updated" value={stats.recentUpdated} iconName="RefreshCw" bgClass="bg-purple-100 dark:bg-purple-500/10" colorClass="text-purple-600 dark:text-purple-500" />
                                    </div>

                                    <div className="bg-white dark:bg-slate-900/60 p-5 rounded-3xl border border-slate-200 dark:border-slate-800/80 mb-6 shrink-0 shadow-lg flex flex-col lg:flex-row gap-4 transition-colors duration-300">
                                         
                                         <div className="flex-1 max-w-[33%] border-r border-slate-200 dark:border-slate-800 pr-4 transition-colors duration-300">
                                             <div className="flex items-center justify-between mb-4">
                                                 <h3 className="font-bold text-slate-800 dark:text-white flex items-center space-x-2 transition-colors duration-300"><SafeIcon name="Clock" className="text-emerald-600 dark:text-emerald-400" size={18}/> <span>Recently Added</span></h3>
                                             </div>
                                             <div className="flex flex-col space-y-2 overflow-y-auto max-h-[160px] custom-scrollbar pr-2">
                                                 {recentActivity.newlyAdded.length > 0 ? recentActivity.newlyAdded.slice(0, 20).map(item => {
                                                      const rowId = item?._id || item?.id;
                                                      return (
                                                      <div key={rowId} className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/50 flex flex-col hover:border-slate-300 dark:hover:border-slate-600 transition-colors duration-300">
                                                           <span className="text-slate-800 dark:text-white font-bold text-xs truncate transition-colors duration-300">{item?.name || 'Unnamed'}</span>
                                                           <div className="flex justify-between mt-1">
                                                               <span className="text-[10px] text-slate-500 dark:text-slate-400">Qty: <span className="font-bold text-slate-700 dark:text-slate-200">{item?.quantity || 0}</span></span>
                                                               <span className="text-[9px] text-emerald-600 dark:text-emerald-500 font-mono">{new Date(item?.createdAt || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                                           </div>
                                                      </div>
                                                 )}) : <span className="text-slate-500 text-xs italic px-2">No new items added.</span>}
                                             </div>
                                         </div>

                                         <div className="flex-1 max-w-[33%] border-r border-slate-200 dark:border-slate-800 pr-4 pl-2 transition-colors duration-300">
                                             <div className="flex items-center justify-between mb-4">
                                                 <h3 className="font-bold text-slate-800 dark:text-white flex items-center space-x-2 transition-colors duration-300"><SafeIcon name="RefreshCw" className="text-purple-600 dark:text-purple-400" size={18}/> <span>Recently Updated</span></h3>
                                             </div>
                                             <div className="flex flex-col space-y-2 overflow-y-auto max-h-[160px] custom-scrollbar pr-2">
                                                 {recentActivity.recentlyUpdated.length > 0 ? recentActivity.recentlyUpdated.slice(0, 20).map(item => {
                                                      const rowId = item?._id || item?.id;
                                                      return (
                                                      <div key={rowId} className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/50 flex flex-col hover:border-slate-300 dark:hover:border-slate-600 transition-colors duration-300">
                                                           <span className="text-slate-800 dark:text-white font-bold text-xs truncate transition-colors duration-300">{item?.name || 'Unnamed'}</span>
                                                           <div className="flex justify-between mt-1">
                                                               <span className="text-[10px] text-slate-500 dark:text-slate-400">Updated: <span className="font-bold">{item?.location || '-'}</span></span>
                                                               <span className="text-[9px] text-purple-600 dark:text-purple-400 font-mono">{new Date(item?.updatedAt || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                                           </div>
                                                      </div>
                                                 )}) : <span className="text-slate-500 text-xs italic px-2">No items updated.</span>}
                                             </div>
                                         </div>

                                         <div className="flex-1 pl-2">
                                             <div className="flex items-center justify-between mb-4">
                                                 <h3 className="font-bold text-slate-800 dark:text-white flex items-center space-x-2 transition-colors duration-300"><SafeIcon name="MessageCircle" className="text-blue-600 dark:text-blue-400" size={18}/> <span>Live Audit & Alerts</span></h3>
                                             </div>
                                             <div className="flex flex-col space-y-2 overflow-y-auto max-h-[160px] custom-scrollbar pr-2">
                                                 {activityLogs.length > 0 ? activityLogs.slice(0, 20).map((log, idx) => (
                                                      <div key={log._id || idx} className={`bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border flex flex-col hover:border-slate-300 dark:hover:border-slate-600 transition-colors duration-300 ${log.type === 'alert' ? 'border-red-300 dark:border-red-500/30 bg-red-50 dark:bg-red-500/5' : 'border-slate-200 dark:border-slate-700/50'}`}>
                                                           <span className={`font-bold text-xs truncate transition-colors duration-300 ${log.type === 'alert' ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-300'}`}>{log.message}</span>
                                                           <span className="text-[9px] text-slate-500 font-mono mt-1 transition-colors duration-300">{new Date(log.timestamp).toLocaleString()}</span>
                                                      </div>
                                                 )) : <span className="text-slate-500 text-xs italic px-2">No system logs available.</span>}
                                             </div>
                                         </div>

                                    </div>

                                    <div className="bg-white dark:bg-slate-900/40 p-5 rounded-3xl border border-slate-200 dark:border-slate-800/80 flex flex-col lg:flex-row gap-4 items-center shrink-0 shadow-lg relative overflow-hidden transition-colors duration-300 mb-6">
                                        <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/5 blur-[80px] pointer-events-none"></div>
                                        
                                        <div className="relative w-full lg:flex-1 min-w-[250px] group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 dark:text-blue-400 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-300 transition-colors duration-300 pointer-events-none">
                                                <SafeIcon name="Search" size={20} />
                                            </div>
                                            <input 
                                                type="text" 
                                                placeholder="Search Component, Part No, Rack, or Code..." 
                                                className="w-full bg-slate-50 dark:bg-blue-950/20 border-2 border-slate-200 dark:border-blue-500/20 rounded-2xl py-3.5 pl-12 pr-4 focus:border-blue-500 dark:focus:border-blue-500/60 focus:bg-white dark:focus:bg-blue-900/20 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-500/10 outline-none transition-all duration-300 placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white font-medium shadow-inner" 
                                                value={searchQuery} 
                                                onChange={(e) => setSearchQuery(e.target.value)} 
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 w-full lg:w-auto">
                                            <div className="flex items-center space-x-3 bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-200 dark:border-emerald-500/20 rounded-2xl px-4 py-3 hover:border-emerald-300 dark:hover:border-emerald-500/40 focus-within:border-emerald-400 dark:focus-within:border-emerald-500/60 transition-all duration-300 group shadow-inner">
                                                <div className="text-emerald-600 dark:text-emerald-400"><SafeIcon name="MapPin" size={18} /></div>
                                                <div className="flex flex-col overflow-hidden">
                                                    <span className="text-[10px] uppercase font-bold text-emerald-600/70 dark:text-emerald-500/70 tracking-wider -mb-1 transition-colors duration-300">Location</span>
                                                    <select className="bg-transparent outline-none text-slate-800 dark:text-emerald-100 font-bold cursor-pointer pr-6 text-sm truncate w-full transition-colors duration-300" value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
                                                        <option value="all" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">All Areas</option>
                                                        {uniqueLocations.map((loc, idx) => (<option key={idx} value={loc} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{loc}</option>))}
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-3 bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-200 dark:border-amber-500/20 rounded-2xl px-4 py-3 hover:border-amber-300 dark:hover:border-amber-500/40 focus-within:border-amber-400 dark:focus-within:border-amber-500/60 transition-all duration-300 group shadow-inner">
                                                <div className="text-amber-600 dark:text-amber-400"><SafeIcon name="Layers" size={18} /></div>
                                                <div className="flex flex-col overflow-hidden">
                                                    <span className="text-[10px] uppercase font-bold text-amber-600/70 dark:text-amber-500/70 tracking-wider -mb-1 transition-colors duration-300">Storage Rack</span>
                                                    <select className="bg-transparent outline-none text-slate-800 dark:text-amber-100 font-bold cursor-pointer pr-6 text-sm truncate w-full transition-colors duration-300" value={rackFilter} onChange={(e) => setRackFilter(e.target.value)}>
                                                        <option value="all" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">All Racks</option>
                                                        {uniqueRacks.map((rack, idx) => (<option key={idx} value={rack} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{rack}</option>))}
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-3 bg-indigo-50 dark:bg-indigo-950/20 border-2 border-indigo-200 dark:border-indigo-500/20 rounded-2xl px-4 py-3 hover:border-indigo-300 dark:hover:border-indigo-500/40 focus-within:border-indigo-400 dark:focus-within:border-indigo-500/60 transition-all duration-300 group shadow-inner">
                                                <div className="text-indigo-600 dark:text-indigo-400"><SafeIcon name="Building" size={18} /></div>
                                                <div className="flex flex-col overflow-hidden">
                                                    <span className="text-[10px] uppercase font-bold text-indigo-600/70 dark:text-indigo-500/70 tracking-wider -mb-1 transition-colors duration-300">Manufacturer</span>
                                                    <select className="bg-transparent outline-none text-slate-800 dark:text-indigo-100 font-bold cursor-pointer pr-6 text-sm truncate w-full transition-colors duration-300" value={makeFilter} onChange={(e) => setMakeFilter(e.target.value)}>
                                                        <option value="all" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">All Brands</option>
                                                        {uniqueMakes.map((make, idx) => (<option key={idx} value={make} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{make}</option>))}
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-3 bg-purple-50 dark:bg-purple-950/20 border-2 border-purple-200 dark:border-purple-500/20 rounded-2xl px-4 py-3 hover:border-purple-300 dark:hover:border-purple-500/40 focus-within:border-purple-400 dark:focus-within:border-purple-500/60 transition-all duration-300 group shadow-inner">
                                                <div className="text-purple-600 dark:text-purple-400"><SafeIcon name="Filter" size={18} /></div>
                                                <div className="flex flex-col overflow-hidden">
                                                    <span className="text-[10px] uppercase font-bold text-purple-600/70 dark:text-purple-500/70 tracking-wider -mb-1 transition-colors duration-300">Asset Status</span>
                                                    <select className="bg-transparent outline-none text-slate-800 dark:text-purple-100 font-bold cursor-pointer pr-6 text-sm truncate w-full transition-colors duration-300" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                                        <option value="all" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">All Statuses</option>
                                                        {uniqueStatuses.map((stat, idx) => (<option key={idx} value={stat} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{stat}</option>))}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-auto shadow-sm relative mb-4 transition-colors duration-300">
                                        <table className="w-full text-left min-w-[1500px]">
                                            <thead className="sticky top-0 bg-slate-100 dark:bg-slate-900/95 backdrop-blur z-10 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
                                                <tr className="text-slate-600 dark:text-slate-400 text-xs uppercase tracking-widest font-semibold transition-colors duration-300">
                                                    <th className="px-6 py-5 w-16">
                                                        <button onClick={toggleSelectAll} className="text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-none">
                                                            {paginatedItems.length > 0 && selectedItems.size === paginatedItems.length ? <SafeIcon name="CheckSquare" size={20} className="text-blue-600 dark:text-blue-500" /> : <SafeIcon name="Square" size={20} />}
                                                        </button>
                                                    </th>
                                                    <th className="px-4 py-5">Component Registry</th>
                                                    <th className="px-4 py-5">Manufacturer</th>
                                                    <th className="px-4 py-5">Part Key</th>
                                                    <th className="px-4 py-5">Tech Specs</th>
                                                    <th className="px-4 py-5">Inventory</th>
                                                    <th className="px-4 py-5">System Code</th>
                                                    <th className="px-4 py-5">Order Ref</th>
                                                    <th className="px-4 py-5">Storage Node</th>
                                                    <th className="px-4 py-5">Sector</th>
                                                    <th className="px-4 py-5 text-right">Status Check</th>
                                                    <th className="px-6 py-5 text-center w-24">Modify</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 transition-colors duration-300">
                                                {paginatedItems.map((item) => {
                                                    const rowId = item?._id || item?.id;
                                                    const isSelected = selectedItems.has(rowId);
                                                    return (
                                                        <tr key={rowId} className={`transition-colors duration-300 whitespace-nowrap text-sm ${isSelected ? 'bg-blue-50 dark:bg-blue-500/5' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'} ${item?.critical ? 'border-l-4 border-l-rose-500 bg-rose-50 dark:bg-rose-500/5' : ''}`}>
                                                            <td className="px-6 py-4">
                                                                <button onClick={() => toggleSelection(rowId)} className="text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-none mt-1">
                                                                    {isSelected ? <SafeIcon name="CheckSquare" size={20} className="text-blue-600 dark:text-blue-500" /> : <SafeIcon name="Square" size={20} />}
                                                                </button>
                                                            </td>
                                                            <td className="px-4 py-4 font-bold text-slate-800 dark:text-slate-100 flex items-center space-x-3 transition-colors duration-300">
                                                                <div className={`w-2.5 h-2.5 rounded-full shrink-0 transition-colors duration-300 ${isSelected ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]' : (item?.critical ? 'bg-rose-500 animate-pulse' : 'bg-slate-400 dark:bg-slate-600')}`}></div>
                                                                <div className="flex flex-col">
                                                                    <span className="tracking-wide">{item?.name || 'Unnamed'}</span>
                                                                    {item?.equipment && <span className="text-[10px] text-blue-600 dark:text-blue-400 font-normal transition-colors duration-300">{item.equipment}</span>}
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-4 text-slate-600 dark:text-slate-300 transition-colors duration-300">{item?.make || '-'}</td>
                                                            <td className="px-4 py-4 font-mono text-xs text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-transparent px-2 rounded-md w-max transition-colors duration-300">{item?.partNumber || '-'}</td>
                                                            <td className="px-4 py-4 text-slate-600 dark:text-slate-300 truncate max-w-[150px] transition-colors duration-300" title={item?.specification}>{item?.specification || '-'}</td>
                                                            <td className="px-4 py-4">
                                                                <div className="flex items-baseline space-x-1 transition-colors duration-300">
                                                                    <span className={`font-bold text-base transition-colors duration-300 ${(Number(item?.quantity) || 0) < 5 ? 'text-red-600 dark:text-red-500' : 'text-slate-900 dark:text-white'}`}>{Number(item?.quantity) || 0}</span>
                                                                    <span className="text-xs font-medium text-slate-500">/ {Number(item?.minStock) || 0} {item?.uom || ''}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-4 font-mono text-xs text-emerald-700 dark:text-emerald-300 transition-colors duration-300">{item?.itemCode || '-'}</td>
                                                            <td className="px-4 py-4 text-slate-600 dark:text-slate-400 transition-colors duration-300">{item?.po || '-'}</td>
                                                            <td className="px-4 py-4 font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/5 px-2 rounded w-max border border-amber-200 dark:border-amber-500/20 transition-colors duration-300">{item?.rack || 'UNASSIGNED RACK'}</td>
                                                            <td className="px-4 py-4"><div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800/50 px-2 py-1 rounded-md w-max border border-slate-200 dark:border-slate-700/50 transition-colors duration-300"><SafeIcon name="MapPin" size={14} className="text-slate-500 dark:text-slate-400" /><span className="text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors duration-300">{item?.location || 'UNASSIGNED'}</span></div></td>
                                                            <td className="px-4 py-4"><StatusBadge quantity={Number(item?.quantity) || 0} minStock={Number(item?.minStock) || 0} critical={item?.critical} status={item?.status} /></td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex justify-center items-center space-x-1">
                                                                    <button onClick={() => handleEditItem(item)} className="p-2 bg-slate-50 dark:bg-slate-800/50 hover:bg-blue-50 dark:hover:bg-blue-500/20 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors border border-slate-200 dark:border-transparent hover:border-blue-300 dark:hover:border-blue-500/30"><SafeIcon name="Edit" size={16} /></button>
                                                                    <button onClick={() => handleDeleteItem(rowId)} className="p-2 bg-slate-50 dark:bg-slate-800/50 hover:bg-red-50 dark:hover:bg-red-500/20 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors border border-slate-200 dark:border-transparent hover:border-red-300 dark:hover:border-red-500/30"><SafeIcon name="Trash2" size={16} /></button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                                {paginatedItems.length === 0 && (
                                                    <tr><td colSpan="12" className="px-6 py-20 text-center"><div className="flex flex-col items-center justify-center space-y-3 opacity-60"><SafeIcon name="Package" size={48} className="text-slate-400 dark:text-slate-600" /><p className="text-slate-500 dark:text-slate-400 font-medium transition-colors duration-300">No assets match the current network parameters.</p></div></td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {totalPages > 1 && (
                                        <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shrink-0 transition-colors duration-300">
                                            <span className="text-slate-500 dark:text-slate-400 text-sm font-medium transition-colors duration-300">Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredItems.length)} of {filteredItems.length} entries</span>
                                            <div className="flex space-x-2">
                                                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-900 dark:text-white rounded-lg transition-colors flex items-center space-x-1">
                                                    <SafeIcon name="ChevronLeft" size={16} /> <span>Prev</span>
                                                </button>
                                                <div className="flex items-center px-4 bg-slate-50 dark:bg-slate-950 rounded-lg font-mono text-sm border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white transition-colors duration-300">
                                                    Page {currentPage} / {totalPages}
                                                </div>
                                                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-900 dark:text-white rounded-lg transition-colors flex items-center space-x-1">
                                                    <span>Next</span> <SafeIcon name="ChevronRight" size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {selectedItems.size > 0 && (
                                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-2xl px-6 py-4 flex items-center space-x-6 z-50 transition-colors duration-300">
                                            <div className="flex items-center space-x-3"><span className="flex items-center justify-center bg-blue-600 text-white font-bold h-7 w-7 rounded-full text-xs shadow-inner shadow-white/20 transition-colors duration-300">{selectedItems.size}</span><span className="text-slate-700 dark:text-slate-300 font-medium tracking-wide transition-colors duration-300">Assets Selected</span></div>
                                            <div className="h-8 w-px bg-slate-300 dark:bg-slate-700/80 transition-colors duration-300"></div>
                                            <div className="flex space-x-2">
                                                <button onClick={() => alert('Bulk Edit Protocol Initiated.')} className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-4 py-2 rounded-xl transition-colors text-sm font-medium border border-slate-300 dark:border-slate-600/50 hover:border-slate-400 dark:hover:border-slate-500"><SafeIcon name="Edit" size={16} /><span>Bulk Edit</span></button>
                                                <button onClick={handleBulkDelete} className="flex items-center space-x-2 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 px-4 py-2 rounded-xl transition-colors text-sm font-medium border border-red-200 dark:border-red-500/20 hover:border-red-300 dark:hover:border-red-500/40"><SafeIcon name="Trash2" size={16} /><span>Purge Selection</span></button>
                                            </div>
                                            <div className="h-8 w-px bg-slate-300 dark:bg-slate-700/80 transition-colors duration-300"></div>
                                            <button onClick={() => setSelectedItems(new Set())} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 bg-slate-100 dark:bg-slate-900/50 p-2 rounded-xl transition-colors border border-transparent hover:border-slate-300 dark:hover:border-slate-700"><SafeIcon name="XCircle" size={20} /></button>
                                        </div>
                                    )}
                                </div>
                            ) : view === 'add-item' ? (
                                <div className="flex-1 overflow-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-10 shadow-sm relative transition-colors duration-300">
                                    <datalist id="locations">
                                        {uniqueLocations.map((loc, i) => <option key={i} value={loc} />)}
                                    </datalist>

                                    <form onSubmit={handleAddItem} className="space-y-8 max-w-5xl mx-auto">
                                        <div className="flex items-center space-x-4 border-b border-slate-200 dark:border-slate-800 pb-4 mb-6 transition-colors duration-300">
                                            <IconWrapper iconName="Database" bgClass="bg-blue-100 dark:bg-blue-500/10" colorClass="text-blue-600 dark:text-blue-500" size={28} />
                                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight transition-colors duration-300">{formData._id || formData.id ? 'Modify Existing Asset' : 'Register New Asset Profile'}</h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider transition-colors duration-300">Component Name <span className="text-red-500">*</span></label>
                                                <input required className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl py-3.5 px-4 outline-none focus:border-blue-500 dark:focus:border-blue-600 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-600 transition-all duration-300 text-slate-900 dark:text-slate-100 shadow-inner" placeholder="e.g. Servo Motor Type-X" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider transition-colors duration-300">Manufacturer</label>
                                                <input className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl py-3.5 px-4 outline-none focus:border-blue-500 dark:focus:border-blue-600 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-600 transition-all duration-300 text-slate-900 dark:text-slate-100 shadow-inner" placeholder="e.g. Siemens Global" value={formData.make} onChange={(e) => setFormData({ ...formData, make: e.target.value })} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider transition-colors duration-300">Part Key</label>
                                                <input className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl py-3.5 px-4 outline-none focus:border-blue-500 dark:focus:border-blue-600 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-600 transition-all duration-300 text-slate-900 dark:text-slate-100 shadow-inner font-mono text-sm" placeholder="e.g. SM-500A-V2" value={formData.partNumber} onChange={(e) => setFormData({ ...formData, partNumber: e.target.value })} />
                                            </div>
                                            
                                            <div className="space-y-2 col-span-1 md:col-span-2 xl:col-span-3 bg-rose-50 dark:bg-rose-500/5 p-5 rounded-xl border border-rose-200 dark:border-rose-500/20 flex items-center justify-between shadow-inner transition-colors duration-300">
                                                <div>
                                                    <label className="text-sm font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block transition-colors duration-300">Critical Asset Priority</label>
                                                    <span className="text-xs text-rose-500/80 dark:text-rose-400/70 mt-1 block transition-colors duration-300">Mark this asset as critical to trigger immediate dashboard alerts and visual priority rendering.</span>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer ml-4">
                                                    <input type="checkbox" className="sr-only peer" checked={formData.critical} onChange={(e) => setFormData({...formData, critical: e.target.checked})} />
                                                    <div className="w-11 h-6 bg-slate-300 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-slate-300 after:border-slate-300 dark:after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500 transition-colors duration-300"></div>
                                                </label>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider transition-colors duration-300">Technical Spec</label>
                                                <input className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl py-3.5 px-4 outline-none focus:border-blue-500 dark:focus:border-blue-600 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-600 transition-all duration-300 text-slate-900 dark:text-slate-100 shadow-inner" placeholder="e.g. 24V DC, 500W High Torque" value={formData.specification} onChange={(e) => setFormData({ ...formData, specification: e.target.value }) } />
                                            </div>

                                            <div className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/50 space-y-4 col-span-1 xl:col-span-2 grid grid-cols-2 gap-x-6 gap-y-0 transition-colors duration-300">
                                                <div className="space-y-2 col-span-1">
                                                    <label className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider transition-colors duration-300">Current Quantity <span className="text-red-500">*</span></label>
                                                    <input required type="number" className="w-full bg-white dark:bg-slate-950 border border-blue-200 dark:border-blue-900/50 rounded-xl py-3.5 px-4 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-300 text-slate-900 dark:text-white font-bold text-lg shadow-inner" placeholder="0" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) || 0 }) } />
                                                </div>
                                                <div className="space-y-2 col-span-1">
                                                    <label className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider transition-colors duration-300">Alert Threshold</label>
                                                    <input type="number" className="w-full bg-white dark:bg-slate-950 border border-amber-200 dark:border-amber-900/50 rounded-xl py-3.5 px-4 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-300 text-slate-900 dark:text-slate-100 font-semibold shadow-inner" placeholder="Minimum Stock Level" value={formData.minStock} onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) || 0 }) } />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider transition-colors duration-300">System Code</label>
                                                <input className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl py-3.5 px-4 outline-none focus:border-blue-500 dark:focus:border-blue-600 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-600 transition-all duration-300 text-emerald-700 dark:text-emerald-400 shadow-inner font-mono text-sm" placeholder="Internal Identity" value={formData.itemCode} onChange={(e) => setFormData({ ...formData, itemCode: e.target.value }) } />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider transition-colors duration-300">Order Reference (PO)</label>
                                                <input className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl py-3.5 px-4 outline-none focus:border-blue-500 dark:focus:border-blue-600 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-600 transition-all duration-300 text-slate-900 dark:text-slate-100 shadow-inner" placeholder="PO-202X-XXX" value={formData.po} onChange={(e) => setFormData({ ...formData, po: e.target.value }) } />
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider transition-colors duration-300">Asset Status</label>
                                                <select className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl py-3.5 pl-4 pr-10 outline-none focus:border-blue-500 dark:focus:border-blue-600 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-600 transition-all duration-300 text-slate-900 dark:text-slate-100 shadow-inner" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value }) }>
                                                    <option value="Available">Available</option>
                                                    <option value="In Use">In Use</option>
                                                    <option value="Spare">Spare</option>
                                                    <option value="Damaged/Repair">Damaged/Repair</option>
                                                </select>
                                            </div>

                                            <div className="col-span-1 md:col-span-2 xl:col-span-1 border-t border-slate-200 dark:border-slate-800 xl:border-none pt-6 xl:pt-0 transition-colors duration-300"></div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider transition-colors duration-300">Storage Node (Rack)</label>
                                                <input className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl py-3.5 px-4 outline-none focus:border-blue-500 dark:focus:border-blue-600 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-600 transition-all duration-300 text-slate-900 dark:text-slate-100 shadow-inner" placeholder="e.g. RACK-A1" value={formData.rack} onChange={(e) => setFormData({ ...formData, rack: e.target.value }) } />
                                            </div>
                                            <div className="space-y-2 relative">
                                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between transition-colors duration-300"><span>Sector (Location)</span><span className="text-[10px] text-slate-500 font-normal normal-case">Type or Select</span></label>
                                                <input list="locations" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl py-3.5 pl-10 pr-4 outline-none focus:border-blue-500 dark:focus:border-blue-600 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-600 transition-all duration-300 text-slate-900 dark:text-slate-100 shadow-inner" placeholder="e.g. Warehouse North" value={formData.location || ''} onChange={(e) => setFormData({ ...formData, location: e.target.value || '' }) } />
                                                <SafeIcon name="MapPin" size={16} className="absolute left-4 top-[38px] text-slate-400 dark:text-slate-500 pointer-events-none transition-colors duration-300" />
                                            </div>

                                            <div className="space-y-2 xl:col-span-3">
                                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider transition-colors duration-300">Operational Remarks</label>
                                                <input className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl py-3.5 px-4 outline-none focus:border-blue-500 dark:focus:border-blue-600 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-600 transition-all duration-300 text-slate-900 dark:text-slate-100 shadow-inner" placeholder="Enter any additional operational notes or directives..." value={formData.remarks} onChange={(e) => setFormData({ ...formData, remarks: e.target.value }) } />
                                            </div>
                                        </div>

                                        <div className="pt-8 flex items-center space-x-4 max-w-lg border-t border-slate-200 dark:border-slate-800/60 mt-8 transition-colors duration-300">
                                            <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/20 active:scale-[0.98]">{formData._id || formData.id ? 'Execute Update' : 'Commit to Registry'}</button>
                                            <button type="button" onClick={() => setView('dashboard')} className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white py-3.5 rounded-xl transition-colors duration-300 border border-slate-300 dark:border-slate-700 shadow-sm font-medium">Cancel Directive</button>
                                        </div>
                                    </form>
                                </div>
                            ) : view === 'access-manager' ? (
                                <div className="flex-1 overflow-auto">
                                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-10 max-w-4xl mx-auto shadow-sm transition-colors duration-300">
                                        <div className="flex items-center space-x-4 border-b border-slate-200 dark:border-slate-800 pb-6 mb-8 transition-colors duration-300">
                                            <IconWrapper iconName="Users" bgClass="bg-purple-100 dark:bg-purple-500/10" colorClass="text-purple-600 dark:text-purple-400" size={28} />
                                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight transition-colors duration-300">Access Control Protocol</h3>
                                        </div>

                                        {pendingRequests.length === 0 ? (
                                            <div className="text-center py-20 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800/50 border-dashed transition-colors duration-300">
                                                <SafeIcon name="ShieldCheck" size={56} className="mx-auto mb-4 text-slate-400 dark:text-slate-700 transition-colors duration-300" />
                                                <h4 className="text-lg font-bold text-slate-700 dark:text-slate-300 transition-colors duration-300">Secure Environment</h4>
                                                <p className="text-slate-500 mt-1">No pending authorization requests detected in the perimeter.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {pendingRequests.map((req) => (
                                                    <div key={req.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-inner group hover:border-slate-300 dark:hover:border-slate-700 transition-colors duration-300">
                                                        <div className="flex items-center space-x-4">
                                                            <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 font-bold uppercase tracking-widest border border-slate-300 dark:border-slate-700 transition-colors duration-300">{req.username.slice(0, 2)}</div>
                                                            <div>
                                                                <div className="font-bold text-lg text-slate-900 dark:text-white tracking-wide transition-colors duration-300">{req.username}</div>
                                                                <div className="text-xs font-medium text-slate-500 flex items-center space-x-1 mt-0.5"><span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span><span>Requested Level: standard_user</span></div>
                                                            </div>
                                                        </div>
                                                        <div className="flex space-x-3 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                                                            <button onClick={() => rejectUser(req.id)} className="flex items-center space-x-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 hover:bg-red-50 dark:hover:bg-red-500/10 hover:border-red-300 dark:hover:border-red-500/30 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-xl transition-all font-semibold text-sm">
                                                                <SafeIcon name="XCircle" size={16} /><span>Deny</span>
                                                            </button>
                                                            <button onClick={() => approveUser(req)} className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 border border-transparent text-white shadow-lg shadow-blue-500/20 rounded-xl transition-all font-bold text-sm active:scale-[0.97]">
                                                                <SafeIcon name="CheckCircle" size={16} /><span>Authorize</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center relative gap-8 p-4 overflow-y-auto">
                                    
                                    {/* 🔥 NEW FEATURE: LIVE SHAREPOINT / ONEDRIVE SYNC WIDGET */}
                                    <div className="max-w-2xl w-full bg-white dark:bg-slate-900 border-2 border-emerald-200 dark:border-emerald-500/20 rounded-3xl p-10 shadow-[0_0_30px_rgba(16,185,129,0.1)] relative overflow-hidden transition-colors duration-300">
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                                        <div className="flex items-center space-x-4 mb-6">
                                            <div className="bg-emerald-50 dark:bg-emerald-500/20 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-500/30 transition-colors duration-300">
                                                <SafeIcon name="Cloud" className="text-emerald-600 dark:text-emerald-400" size={32} />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight transition-colors duration-300">Live Microsoft/Google Sync</h3>
                                                <p className="text-slate-500 dark:text-slate-400 text-sm transition-colors duration-300">Auto-update MongoDB every minute from a live remote sheet.</p>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-4">
                                            <input 
                                                type="text" 
                                                placeholder="Paste SharePoint, OneDrive, or Google Sheet Link..." 
                                                value={syncUrlInput}
                                                onChange={(e) => setSyncUrlInput(e.target.value)}
                                                className="w-full bg-slate-50 dark:bg-slate-950 border border-emerald-300 dark:border-emerald-500/30 rounded-xl py-4 px-5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-300"
                                            />
                                            <button 
                                                onClick={handleStartLiveSync}
                                                disabled={isLiveSyncing}
                                                className="w-full bg-emerald-600 hover:bg-emerald-700 dark:hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20 flex justify-center items-center space-x-2 transition-all duration-300"
                                            >
                                                {isLiveSyncing ? <SafeIcon name="Loader" className="animate-spin" /> : <SafeIcon name="RefreshCw" />}
                                                <span>{isLiveSyncing ? 'Authenticating API...' : 'Start Auto-Sync Now'}</span>
                                            </button>
                                            <p className="text-xs text-slate-500 text-center mt-2">Requires proper backend Graph API or Google Service integration. Changes trigger WhatsApp alerts.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center w-full max-w-2xl">
                                        <div className="flex-1 h-px bg-slate-300 dark:bg-slate-800 transition-colors duration-300"></div>
                                        <span className="px-4 text-slate-400 dark:text-slate-500 font-bold uppercase text-xs tracking-widest transition-colors duration-300">OR MANUAL UPLOAD</span>
                                        <div className="flex-1 h-px bg-slate-300 dark:bg-slate-800 transition-colors duration-300"></div>
                                    </div>

                                    <div className="max-w-2xl w-full text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 flex flex-col items-center relative overflow-hidden shadow-sm transition-colors duration-300">
                                        <div className="bg-gradient-to-br from-indigo-50 dark:from-indigo-500/20 to-blue-50 dark:to-blue-500/10 p-5 rounded-3xl mb-6 border border-indigo-200 dark:border-indigo-500/20 shadow-inner transition-colors duration-300">
                                            <SafeIcon name="FileUp" className="text-indigo-600 dark:text-indigo-400" size={40} />
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight transition-colors duration-300">Manual Excel Ingestion</h3>
                                        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md font-medium text-sm transition-colors duration-300">Upload compiled CSV or Excel manifests for a one-time push.</p>
                                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv, .xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" className="hidden" />
                                        <div className="flex flex-col w-full max-w-sm space-y-4">
                                            <button onClick={() => fileInputRef.current.click()} className="w-full bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center space-x-3 active:scale-[0.98] duration-300">
                                                <SafeIcon name="FileUp" size={20} /><span>Select Manifest File</span>
                                            </button>
                                            <button onClick={downloadTemplate} className="w-full bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium py-3.5 rounded-xl transition-all flex items-center justify-center space-x-2 border border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 shadow-inner duration-300">
                                                <SafeIcon name="Download" size={18} /><span>Fetch Blank Template</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* 🔥 NEW FEATURE: SHEET SELECTION MODAL */}
                                    {showSheetSelector && (
                                        <div className="absolute inset-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[60] rounded-3xl transition-colors duration-300">
                                            <div className="bg-white dark:bg-slate-900 w-full max-w-md p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[80vh] transition-colors duration-300">
                                                <div className="flex items-center space-x-3 mb-6">
                                                    <IconWrapper iconName="FileUp" bgClass="bg-blue-100 dark:bg-blue-500/10" colorClass="text-blue-600 dark:text-blue-500" size={24} />
                                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Select Sheets to Import</h3>
                                                </div>
                                                
                                                <div className="overflow-y-auto flex-1 custom-scrollbar space-y-2 mb-6 pr-2">
                                                    {availableSheets.map(sheet => (
                                                        <label key={sheet} className="flex items-center space-x-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                                                            <input 
                                                                type="checkbox" 
                                                                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700"
                                                                checked={selectedSheetsList.has(sheet)}
                                                                onChange={(e) => {
                                                                    const newSet = new Set(selectedSheetsList);
                                                                    if (e.target.checked) newSet.add(sheet);
                                                                    else newSet.delete(sheet);
                                                                    setSelectedSheetsList(newSet);
                                                                }}
                                                            />
                                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{sheet}</span>
                                                        </label>
                                                    ))}
                                                </div>

                                                <div className="flex space-x-3 mt-auto">
                                                    <button 
                                                        onClick={() => {
                                                            setShowSheetSelector(false);
                                                            setPendingWorkbook(null);
                                                        }}
                                                        className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button 
                                                        onClick={processSelectedSheets}
                                                        disabled={selectedSheetsList.size === 0}
                                                        className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-lg shadow-blue-500/20"
                                                    >
                                                        Import Selected
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {importing && (
                                        <div className="absolute inset-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-3xl transition-colors duration-300">
                                            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-2xl transition-colors duration-300">
                                                <SafeIcon name="Loader" className="animate-spin text-blue-600 dark:text-blue-500 mx-auto mb-4" size={48} />
                                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 transition-colors duration-300">Scanning Excel File...</h3>
                                                <p className="text-slate-500 text-sm">Processing multiple racks and building data matrix.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </ErrorBoundary>
                    </main>
                </div>
            )}
        </div>
    );
};

export default App;