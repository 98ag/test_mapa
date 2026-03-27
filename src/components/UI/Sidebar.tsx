import { CATEGORIES } from "../../constants/categories";

export default function Sidebar({ activeFilters, setActiveFilters, onNewReport }: any) {
    // Agrega o elimina una categoria clickeada de los filtros
    const toggleFilter = (key: string) => {
        setActiveFilters((prev: string[]) => 
            // Si la categoria clickeada esta activa, removerla de las categorias activas
            // de lo contrario, agregarla
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        );
    };

    const isAllActive = activeFilters.length === Object.keys(CATEGORIES).length;

    // Desactiva o activa todas las categorias juntas
    const toggleAll = () => {
        if (isAllActive) {
             setActiveFilters([]); // limpiar todas
        } else {
            setActiveFilters(Object.keys(CATEGORIES)); // activar todas
        }
    };

    return (
        <aside className="absolute left-6 top-1/2 -translate-y-1/2 z-[1000] flex flex-col items-center gap-4">
            {/* Boton "!" */}
            <button 
                onClick={onNewReport}
                className="group relative w-16 h-16 flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
                title="Nuevo Reclamo"
            >
                <div className="absolute inset-0 rotate-45 rounded-xl bg-[#5BB0E3] border-2 border-white/20 shadow-lg shadow-blue-500/20" />
                <span className="relative z-10 text-3xl font-black text-white italicrelative z-10 text-3xl font-black text-white italic">!</span>
            </button>

            {/* Lista de botones de filtro */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-[2.5rem] flex flex-col gap-6 shadow-2xl">
                <button 
                    onClick={toggleAll}
                    className="group relative w-14 h-14 flex items-center justify-center border-b border-white/10 pb-4 mb-2"
                >
                    <span className="relative z-10 text-[10px] font-black uppercase text-white/60 group-hover:text-white transition-colors">
                        {isAllActive ? 'Ocultar' : 'Ver Todo'}
                    </span>
                </button>
                
                {Object.entries(CATEGORIES).map(([key, cat]) => {
                    const isActive = activeFilters.includes(key);
                    return (
                        <button
                        key={key}
                        onClick={() => toggleFilter(key)}
                        className="group relative w-14 h-14 flex items-center justify-center"
                        title={cat.label}
                        >
                            <div className={`absolute inset-0 rotate-45 rounded-lg transition-all duration-300 border border-black/50
                                ${isActive 
                                    ? 'bg-[#5BB0E3] border-white/40 scale-100 shadow-md' 
                                    : 'bg-white/5 border-white/10 scale-90 group-hover:bg-white/20'}
                            `} />
                            <span className={`relative z-10 text-[10px] font-black uppercase tracking-tighter transition-colors text-center px-1 leading-tight
                                ${isActive ? 'text-white italic' : 'text-white/40'}
                            `}>
                                {cat.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </aside>
    );
}