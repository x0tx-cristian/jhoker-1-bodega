// // // src/types.ts (FINAL v7 - Sin INSUMOS_FIJA + Dashboard Ajustado)

// // // --- Tipos de Datos Comunes y Enumerados ---
// // export type TipoBodega = 'PT' | 'INSUMOS';
// // // *** CORRECCIÓN: Eliminar INSUMOS_FIJA ***
// // export type EstadoCaja = 'EN_BODEGA' | 'SIN_UBICACION' | 'DESPACHADA';
// // export type NombreRol = 'Administrador' | 'Operario PT' | 'Operario Insumos' | 'Rol Desconocido';

// // // --- Interfaces para Entidades de la Base de Datos ---
// // export interface Referencia { id: string; ean_referencia: string; descripcion: string; talla: string | null; color: string | null; }
// // export interface Ubicacion { id: string; codigo_visual: string; ean_ubicacion: string; descripcion_adicional: string | null; tipo_bodega: TipoBodega | null; activo?: boolean; }
// // export interface Caja {
// //     id: string; ean_caja: string; ubicacion_id: string | null;
// //     estado: EstadoCaja; // <-- Usa el tipo actualizado SIN INSUMOS_FIJA
// //     tipo_bodega: TipoBodega | null; activo?: boolean; created_at?: string; updated_at?: string;
// //     ubicacion_info?: UbicacionCajaInfo | null;
// // }
// // export interface ContenidoCajaItem { id: string; caja_id: string; referencia_id: string; cantidad: number; }
// // export interface HistorialMovimiento { id: number; timestamp: string; accion: string; caja_id: string | null; ubicacion_id: string | null; referencia_id: string | null; usuario_id: string | null; detalles: any | null; nombre_usuario?: string | null; ean_caja?: string | null; codigo_visual_ubicacion?: string | null; ean_referencia?: string | null; }
// // export interface Rol { id: number; nombre_rol: NombreRol; }

// // // --- Interfaces para Formularios ---
// // export interface ReferenciaFormData { ean_referencia: string; descripcion: string; talla?: string | null; color?: string | null; }
// // export interface UbicacionFormData { codigo_visual: string; descripcion_adicional?: string | null; tipo_bodega: TipoBodega | null; }
// // export interface CajaFormData { tipo_bodega: TipoBodega | null; }

// // // --- Interfaces para Datos Combinados o Específicos de UI ---
// // export interface UbicacionCajaInfo { codigo_visual_ubicacion: string | null; ean_ubicacion: string | null; }
// // export interface ContenidoCajaDetallado { ean_referencia: string; descripcion: string; talla: string | null; color: string | null; cantidad: number; }
// // export interface VistaInventarioGeneralItem { ean_caja: string; codigo_visual_ubicacion: string | null; tipo_bodega: TipoBodega | null; estado: EstadoCaja; resumen_contenido: string; }
// // export interface UsuarioSimple { id: string; nombre_usuario: string; }

// // // --- Contexto de Autenticación ---
// // export interface AuthContextType { authToken: string | null; userId: string | null; rolId: number | null; rolNombre: NombreRol | null; isAuthenticated: boolean; isLoading: boolean; login: (token: string, uid: string, rid: number, rnombre: NombreRol) => void; logout: () => void; }

// // // --- Tipos para Componentes de Tabla ---
// // export type SortDirection = "ascending" | "descending";
// // export interface SortDescriptor { column?: React.Key; direction?: SortDirection; }

// // // --- Interfaces para Datos del Dashboard (AJUSTADAS) ---
// // /** Datos devueltos por get_dashboard_summary_admin */
// // export interface AdminDashboardSummary {
// //     total_referencias_activas: number | null;
// //     total_ubicaciones_pt_activas: number | null;
// //     total_ubicaciones_insumos_activas: number | null;
// //     total_cajas_pt_activas: number | null;
// //     // *** CAMBIO: Contador general de insumos activos ***
// //     total_cajas_insumos_activas: number | null;
// //     total_cajas_despachadas: number | null;
// //     total_unidades_pt: number | null;
// //     total_unidades_insumos: number | null;
// // }

// // /** Datos devueltos por get_dashboard_summary_operario_pt (sin cambios) */
// // export interface OperarioPTDashboardSummary {
// //     total_cajas_pt_activas: number | null;
// //     total_cajas_pt_en_bodega: number | null;
// //     total_cajas_pt_sin_ubicacion: number | null;
// //     total_ubicaciones_pt_activas: number | null;
// //     total_unidades_pt: number | null;
// // }

// // /** Datos devueltos por get_dashboard_summary_operario_insumos (contador renombrado) */
// // export interface OperarioInsumosDashboardSummary {
// //     // *** CAMBIO: Renombrado ***
// //     total_cajas_insumos_activas: number | null;
// //     total_unidades_insumos: number | null;
// // }

// // // Tipo unión actualizado
// // export type DashboardSummaryData = AdminDashboardSummary | OperarioPTDashboardSummary | OperarioInsumosDashboardSummary | null;











// // src/types.ts (FINAL v9 - Añade Tipo RestarResult + 100% Completo)

// // --- Tipos de Datos Comunes y Enumerados ---

// /** Define los tipos de bodega permitidos en el sistema. ('Producto Terminado' o 'Insumos') */
// export type TipoBodega = 'PT' | 'INSUMOS';

// /** Define los posibles estados de una caja. */
// export type EstadoCaja = 'EN_BODEGA' | 'SIN_UBICACION' | 'DESPACHADA';

// /** Define los nombres descriptivos de los roles de usuario permitidos. */
// export type NombreRol = 'Administrador' | 'Operario PT' | 'Operario Insumos' | 'Rol Desconocido';

// /** Define las clasificaciones de calidad permitidas para una caja. */
// export type ClasificacionCalidad = 'P' | 'SS' | 'SP';

// // --- Interfaces para Entidades de la Base de Datos ---

// /** Representa una fila de la tabla 'referencias'. */
// export interface Referencia {
//   id: string; // uuid como string
//   ean_referencia: string;
//   descripcion: string;
//   talla: string | null;
//   color: string | null;
//   activo?: boolean; // Opcional si no siempre se lee
// }

// /** Representa una fila de la tabla 'ubicaciones'. */
// export interface Ubicacion {
//     id: string; // uuid
//     codigo_visual: string;
//     ean_ubicacion: string; // EAN-13 generado
//     descripcion_adicional: string | null;
//     tipo_bodega: TipoBodega | null; // PT | INSUMOS | null
//     activo?: boolean;
// }

// /** Representa una fila de la tabla 'cajas'. */
// export interface Caja {
//     id: string; // uuid
//     ean_caja: string; // EAN-13 generado
//     ubicacion_id: string | null; // FK a Ubicaciones (el ID UUID)
//     estado: EstadoCaja; // Usa el tipo enumerado EstadoCaja
//     tipo_bodega: TipoBodega | null; // PT | INSUMOS | null
//     clasificacion_calidad: ClasificacionCalidad | null; // P | SS | SP | null
//     activo?: boolean;
//     created_at?: string; // Timestamps como strings ISO
//     updated_at?: string;
//     // Propiedad opcional para datos unidos de ubicación al consultar Cajas
//     ubicacion_info?: UbicacionCajaInfo | null;
// }

// /** Representa una fila de la tabla 'contenido_caja'. */
// export interface ContenidoCajaItem {
//     id: string; // uuid
//     caja_id: string;
//     referencia_id: string;
//     cantidad: number;
// }

// /** Representa una fila de la tabla 'historial_movimientos'. */
// export interface HistorialMovimiento {
//     id: number; // bigserial
//     timestamp: string; // TIMESTAMPTZ string ISO
//     accion: string;
//     caja_id: string | null;
//     ubicacion_id: string | null;
//     referencia_id: string | null;
//     usuario_id: string | null;
//     detalles: any | null; // JSONB
//     // Campos opcionales obtenidos mediante JOIN en la consulta de historial
//     nombre_usuario?: string | null;
//     ean_caja?: string | null;
//     codigo_visual_ubicacion?: string | null;
//     ean_referencia?: string | null;
// }

// /** Representa una fila de la tabla 'roles'. */
// export interface Rol {
//     id: number; // smallint (1, 2, 3)
//     nombre_rol: NombreRol; // Usa el tipo NombreRol
// }

// // --- Interfaces para Formularios ---

// /** Datos manejados por el formulario de Referencias. */
// export interface ReferenciaFormData {
//   ean_referencia: string;
//   descripcion: string;
//   talla?: string | null;
//   color?: string | null;
// }

// /** Datos manejados por el formulario de Ubicaciones. */
// export interface UbicacionFormData {
//   codigo_visual: string;
//   descripcion_adicional?: string | null;
//   tipo_bodega: TipoBodega | null; // Se vuelve obligatorio al crear en el form
// }

// /** Datos manejados por el formulario de Cajas (al crear). */
// export interface CajaFormData {
//     tipo_bodega: TipoBodega | null; // Obligatorio al crear
//     clasificacion_calidad?: ClasificacionCalidad | null; // Opcional al crear
// }

// /** Datos para el formulario de ACTUALIZACIÓN de calidad de caja. */
// export interface CajaUpdateFormData {
//     clasificacion_calidad: ClasificacionCalidad | null;
// }

// // --- Interfaces para Datos Combinados o Específicos de UI ---

// /** Información específica de la ubicación asociada a una caja. */
// export interface UbicacionCajaInfo {
//     codigo_visual_ubicacion: string | null;
//     ean_ubicacion: string | null;
// }

// /** Datos detallados al mostrar el contenido de una caja. */
// export interface ContenidoCajaDetallado {
//     ean_referencia: string;
//     descripcion: string;
//     talla: string | null;
//     color: string | null;
//     cantidad: number;
// }

// /** Información básica de un usuario. */
// export interface UsuarioSimple {
//     id: string; // uuid
//     nombre_usuario: string;
// }

// // --- Tipos para Funciones RPC Específicas ---

// /** Representa una caja individual en el resultado de `get_inventario_por_referencia`. */
// export interface DesgloseCajaInventario {
//     ean_caja: string;
//     tipo_bodega: TipoBodega | null;
//     estado: EstadoCaja;
//     calidad: ClasificacionCalidad | null;
//     cantidad_en_caja: number;
//     ubicacion_visual: string | null; // Código visual de la ubicación
// }

// /** Representa la estructura completa devuelta por `get_inventario_por_referencia`. */
// export interface InventarioPorReferenciaResult {
//     ean_referencia_buscada: string;
//     referencia_id: string; // uuid
//     descripcion: string | null;
//     stock_total: number;
//     // Array del desglose, puede estar vacío
//     desglose_cajas: DesgloseCajaInventario[];
//     // Campo opcional para errores devueltos por la función SQL
//     error?: string;
// }

// /** Representa la estructura devuelta por `agregar_o_contar_item_en_caja`. */
// export interface AgregarContarResult {
//     mensaje: string; // Mensaje de éxito o error
//     nueva_cantidad: number | null; // Nueva cantidad o null si hubo error
// }

// /** Representa la estructura devuelta por `restar_item_en_caja`. */
// export interface RestarItemResult {
//     mensaje: string; // Mensaje de éxito, info o error
//     nueva_cantidad: number | null; // Cantidad restante (0 si se eliminó, null si error)
// }

// // --- Contexto de Autenticación ---
// /** Define la estructura del Contexto de Autenticación global. */
// export interface AuthContextType {
//   authToken: string | null;
//   userId: string | null;
//   rolId: number | null;
//   rolNombre: NombreRol | null;
//   isAuthenticated: boolean;
//   isLoading: boolean;
//   login: (token: string, uid: string, rid: number, rnombre: NombreRol) => void;
//   logout: () => void;
// }

// // --- Tipos para Componentes de Tabla (Ej. NextUI/HeroUI) ---
// export type SortDirection = "ascending" | "descending";
// export interface SortDescriptor {
//   column?: React.Key; // La clave de la columna a ordenar
//   direction?: SortDirection; // La dirección del ordenamiento
// }

// // --- Otros Tipos (Si son necesarios) ---
// // (Vista general no implementada aún)
// export interface VistaInventarioGeneralItem {
//     ean_caja: string;
//     codigo_visual_ubicacion: string | null;
//     tipo_bodega: TipoBodega | null;
//     estado: EstadoCaja;
//     resumen_contenido: string;
// }


// src/types.ts (FINAL v10 - Limpio y Completo)

// --- Tipos de Datos Comunes y Enumerados ---
export type TipoBodega = 'PT' | 'INSUMOS';
export type EstadoCaja = 'EN_BODEGA' | 'SIN_UBICACION' | 'DESPACHADA';
export type NombreRol = 'Administrador' | 'Operario PT' | 'Operario Insumos' | 'Rol Desconocido';
export type ClasificacionCalidad = 'P' | 'SS' | 'SP';

// --- Interfaces para Entidades de la Base de Datos ---
export interface Referencia { id: string; ean_referencia: string; descripcion: string; talla: string | null; color: string | null; activo?: boolean; } // Añadir activo si se usa
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

// --- Tipos para Dashboard (Estos SÍ se usan) ---
export interface AdminDashboardSummary { total_referencias_activas: number | null; total_ubicaciones_pt_activas: number | null; total_ubicaciones_insumos_activas: number | null; total_cajas_pt_activas: number | null; total_cajas_insumos_activas: number | null; total_cajas_despachadas: number | null; total_unidades_pt: number | null; total_unidades_insumos: number | null; }
export interface OperarioPTDashboardSummary { total_cajas_pt_activas: number | null; total_cajas_pt_en_bodega: number | null; total_cajas_pt_sin_ubicacion: number | null; total_ubicaciones_pt_activas: number | null; total_unidades_pt: number | null; }
export interface OperarioInsumosDashboardSummary { total_cajas_insumos_activas: number | null; total_unidades_insumos: number | null; }
export type DashboardSummaryData = AdminDashboardSummary | OperarioPTDashboardSummary | OperarioInsumosDashboardSummary | null;

// --- Tipo para Iconos SVG (Si lo creaste en components/icons.tsx) ---
// Si tienes un archivo src/components/icons.tsx que exporta este tipo, está bien.
// Si no, puedes definirlo aquí o quitarlo de los imports donde no se use.
// export interface IconSvgProps extends React.SVGProps<SVGSVGElement> { size?: number; }