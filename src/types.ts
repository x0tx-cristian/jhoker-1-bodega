// src/types.ts (FINAL v11 - Añade IconSvgProps + Completo)

// --- Tipos de Datos Comunes y Enumerados ---
export type TipoBodega = 'PT' | 'INSUMOS';
export type EstadoCaja = 'EN_BODEGA' | 'SIN_UBICACION' | 'DESPACHADA';
export type NombreRol = 'Administrador' | 'Operario PT' | 'Operario Insumos' | 'Rol Desconocido';
export type ClasificacionCalidad = 'P' | 'SS' | 'SP';

// --- Interfaces para Entidades de la Base de Datos ---
export interface Referencia { id: string; ean_referencia: string; descripcion: string; talla: string | null; color: string | null; activo?: boolean; }
export interface Ubicacion { id: string; codigo_visual: string; ean_ubicacion: string; descripcion_adicional: string | null; tipo_bodega: TipoBodega | null; activo?: boolean; }
export interface Caja { id: string; ean_caja: string; ubicacion_id: string | null; estado: EstadoCaja; tipo_bodega: TipoBodega | null; clasificacion_calidad: ClasificacionCalidad | null; activo?: boolean; created_at?: string; updated_at?: string; ubicacion_info?: UbicacionCajaInfo | null; }
export interface ContenidoCajaItem { id: string; caja_id: string; referencia_id: string; cantidad: number; }
export interface HistorialMovimiento { id: number; timestamp: string; accion: string; caja_id: string | null; ubicacion_id: string | null; referencia_id: string | null; usuario_id: string | null; detalles: any | null; nombre_usuario?: string | null; ean_caja?: string | null; codigo_visual_ubicacion?: string | null; ean_referencia?: string | null; }
export interface Rol { id: number; nombre_rol: NombreRol; }

// --- Interfaces para Formularios ---
export interface ReferenciaFormData { ean_referencia: string; descripcion: string; talla?: string | null; color?: string | null; }
export interface UbicacionFormData { codigo_visual: string; descripcion_adicional?: string | null; tipo_bodega: TipoBodega | null; }
export interface CajaFormData { tipo_bodega: TipoBodega | null; clasificacion_calidad?: ClasificacionCalidad | null; }

// --- Interfaces para Datos Combinados o Específicos de UI ---
export interface UbicacionCajaInfo { codigo_visual_ubicacion: string | null; ean_ubicacion: string | null; }
export interface ContenidoCajaDetallado { ean_referencia: string; descripcion: string; talla: string | null; color: string | null; cantidad: number; }
export interface UsuarioSimple { id: string; nombre_usuario: string; }

// --- Tipos para Funciones RPC Específicas ---
export interface DesgloseCajaInventario { ean_caja: string; tipo_bodega: TipoBodega | null; estado: EstadoCaja; calidad: ClasificacionCalidad | null; cantidad_en_caja: number; ubicacion_visual: string | null; }
export interface InventarioPorReferenciaResult { ean_referencia_buscada: string; referencia_id: string; descripcion: string | null; stock_total: number; desglose_cajas: DesgloseCajaInventario[]; error?: string; }
export interface AgregarContarResult { mensaje: string; nueva_cantidad: number | null; }
export interface RestarItemResult { mensaje: string; nueva_cantidad: number | null; }

// --- Contexto de Autenticación ---
export interface AuthContextType { authToken: string | null; userId: string | null; rolId: number | null; rolNombre: NombreRol | null; isAuthenticated: boolean; isLoading: boolean; login: (token: string, uid: string, rid: number, rnombre: NombreRol) => void; logout: () => void; }

// --- Tipos para Componentes de Tabla ---
export type SortDirection = "ascending" | "descending";
export interface SortDescriptor { column?: React.Key; direction?: SortDirection; }

// --- Tipos para Dashboard ---
export interface AdminDashboardSummary { total_referencias_activas: number | null; total_ubicaciones_pt_activas: number | null; total_ubicaciones_insumos_activas: number | null; total_cajas_pt_activas: number | null; total_cajas_insumos_activas: number | null; total_cajas_despachadas: number | null; total_unidades_pt: number | null; total_unidades_insumos: number | null; }
export interface OperarioPTDashboardSummary { total_cajas_pt_activas: number | null; total_cajas_pt_en_bodega: number | null; total_cajas_pt_sin_ubicacion: number | null; total_ubicaciones_pt_activas: number | null; total_unidades_pt: number | null; }
export interface OperarioInsumosDashboardSummary { total_cajas_insumos_activas: number | null; total_unidades_insumos: number | null; }
export type DashboardSummaryData = AdminDashboardSummary | OperarioPTDashboardSummary | OperarioInsumosDashboardSummary | null;

// --- Tipo para Iconos SVG ---
// CORREGIDO: Descomentar y exportar
export interface IconSvgProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}