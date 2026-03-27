import { useEffect, useRef, useState, useActionState } from 'react';
import ModalMap from '../Map/ModalMap';
import { CATEGORIES } from '../../constants/categories';
import { COORDS_CENTER } from '../../constants/coordinates';

export default function ReportModal({ isOpen, onClose, onSave }: any) {
    const submitAction = async (prevState: any, formData: FormData) => {
        const data = {
            description: formData.get('description'),
            category: formData.get('category'),
            lat: pos[0],
            lng: pos[1],
        };

        try {
            await onSave(data);
            onClose();
            return { success: true };
        } catch (err) {
            return { error: "Error al guardar" };
        }
    };

    const [pos, setPos] = useState<[number, number]>(COORDS_CENTER); // Posicion en el minimapa
    const [address, setAddress] = useState("");                      // Valor de la entrada de direccion
    const [results, setResults] = useState<any[]>([]);               // Resultados de la API
    const [isLoading, setIsLoading] = useState(false);               // Bandera para mostrar 'cargando' mientras responde la API
    const [showDropdown, setShowDropdown] = useState(false);         // Bandera para des/activar el dropdown de direcciones
    const [error, setError] = useState(false);                       // Bandera para mostrar mensaje de error en el dropdown de direcciones
    const isSelectingRef = useRef(false);                            // Bandera (ref no hace re-render) para evitar query demas a la API 
    const [state, formAction, isPending] = useActionState(submitAction, null);

    // Tiempo de espera para buscar direccion en API de Georef desde que el usuario dejo de escribir
    // Tiempo: 1000ms
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            // Ejecuta busqueda si la entrada es >= 5 caracteres y no se eligio ningun resultado aun
            if (!isSelectingRef.current && address.length >= 5) {
                handleSearch(address);
            }

            // Resetea la bandera y permite busqueda
            isSelectingRef.current = false;
        }, 1000);

        return () => clearTimeout(delayDebounceFn);
    }, [address]);

    // Resetea las coordenadas y estados cuando se cierra el modal
    useEffect(() => {
        if (!isOpen) {
            setPos(COORDS_CENTER);
            setAddress("");
            setResults([]);
            setError(false);
        }        
    }, [isOpen]);

    // Desactivamos el modal cuando se presiona Cerrar
    if (!isOpen) return null;

    // Funcion para buscar las coordenadas de una direccion dada
    // OLD: Usamos la API de Nominatim (gratis, TODO: rate limit? no creo pero... existe opcion self hosted)
    // ACTUAL: Usamos API de Georef (Argentina), sigue siendo gratis pero quiza rate limit mas laxo
    const handleSearch = async (query: string) => {
        setIsLoading(true);
        setShowDropdown(true);
        setError(false);

        try {
            // Limita las busquedas a Victoria, Entre Rios
            const url = `https://apis.datos.gob.ar/georef/api/direcciones?direccion=${encodeURIComponent(query)}&localidad=Victoria&provincia=Entre Rios&max=5`;
            console.log("Enviando request...")
            const response = await fetch(url);

            if (!response.ok) throw new Error("Error de Georef.");

            const data = await response.json();

            if (data.direcciones && data.direcciones.length > 0) 
                setResults(data.direcciones);
            else {
                setResults([]);
                setError(true);
            }
                
        } catch (error) {
            console.error("Error buscando direccion:", error);
            setError(true);
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    const selectLocation = (res: any) => {
        // El usuario eligio un resultado del dropdown, cambio bandera
        isSelectingRef.current = true;

        // Seteo la ubicacion del minimapa y la direccion a las del resultado
        setPos([res.ubicacion.lat, res.ubicacion.lon]);
        setAddress(res.nomenclatura);
        
        // Limpio los resultados y banderas (busqueda exitosa)
        setResults([]);
        setShowDropdown(false);
        setError(false);
    };

    return (
        <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4 backdrop-blur-md">
            <div className="bg-[#1a1c1e] text-gray-200 w-full max-w-2xl rounded-2xl p-6 shadow-2xl border border-white/10 max-h-[90vh] overflow-hidden">
                { /* Header */ }
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold uppercase tracking-tight">Nuevo Reclamo</h2>
                    <button onClick={onClose} className="bg-gray-800 px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">Cerrar</button>
                </div>

                <form action={formAction} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                    { /* Descripcion */ }
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Descripción</label>
                        <textarea name="description" className="w-full bg-black border border-gray-700 rounded-lg p-3 h-24 focus:border-orange-500 outline-none" required />
                    </div>

                    { /* Categorias */ }
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Categoría</label>
                        <select 
                            name="category" 
                            required
                            className="w-full bg-black border border-gray-700 rounded-lg p-3 focus:border-orange-500 outline-none text-gray-500 valid:text-gray-200"
                            defaultValue=""
                        >
                            <option value="" disabled>Elegí una categoria</option>
                            {Object.entries(CATEGORIES).map(([key, value]) => (
                                <option key={key} value={key} className="bg-[#1a1c1e] text-gray-200">{value.label}</option>
                            ))}
                        </select>
                    </div>
                    
                    { /* Ubicacion - minimapa */}
                    <div className="space-y-4 pt-4 border-t border-white/5">
                        <h3 className="font-bold uppercase text-sm border-b border-gray-800 pb-2">Ubicación</h3>
                        <div className="relative">
                            <input 
                                name="address"
                                type="text" 
                                value={address}
                                placeholder="Buscar por dirección (Por ej: 'Congreso 500' o 'Bartoloni y Matanza')" 
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 focus:border-orange-500 outline-none text-sm"
                                onChange={(e) => setAddress(e.target.value)}
                                autoComplete="off"
                            />

                            { /* Dropdown */ }
                            {showDropdown && (
                            <ul className="absolute z-[10001] w-full mt-2 bg-[#1a1c1e] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                                {isLoading 
                                    ? (<li className="p-4 text-sm text-gray-500 italic">Cargando...</li>) 
                                    : error
                                        ? (<li className="p-4 text-sm text-orange-400/80">No se pudo cargar dirección, elija en el mapa o ingrese nuevamente.</li>) 
                                        : results.length > 0
                                            ? (results.map((res, index) => (
                                                <li 
                                                    key={index}
                                                    onClick={() => selectLocation(res)}
                                                    className="p-4 text-sm text-gray-300 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-none transition-colors"
                                                >
                                                    {res.nomenclatura}
                                                </li>
                                            )))
                                            : null 
                                }
                            </ul>
                            )}
                        </div>

                        <div className="flex justify-between items-center px-1">
                            <p className="text-[10px] font-mono text-gray-500">Lat: {pos[0].toFixed(5)} · Lng: {pos[1].toFixed(5)}</p>
                            <span className="text-[10px] uppercase text-gray-600 font-bold">Tocar mapa para ajustar</span>
                        </div>

                        <ModalMap position={pos} setPosition={setPos} />
                    </div>
                    
                    { /* Boton de enviado */}
                    <button     
                        type="submit" 
                        disabled={isPending}
                        className="w-full font-black py-4 rounded-xl uppercase transition-all shadow-lg
                            bg-[#fb8c00] hover:bg-[#e67e59] text-black 
                            disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                        {isPending ? 'Guardando...' : 'Enviar Reclamo'}
                    </button>
                </form>
            </div>
        </div>
    );
}