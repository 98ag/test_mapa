export const CATEGORIES = {
    alumbrado: { label: "Alumbrado", color: "#facc15", icon: "💡" },
    arbolado: { label: "Arbolado", color: "#22c55e", icon: "🌳" },
    residuos: { label: "Residuos", color: "#f97316", icon: "🗑️" }, 
    calles: { label: "Calles", color: "#64748b", icon: "🚧"},
    veredas: { label: "Veredas", color: "#0249ad", icon: "🚶"},
    otros: { label: "Otros", color: "#25321a", icon: "❓"},
}

export type CategoryKey = keyof typeof CATEGORIES;