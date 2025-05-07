// // // src/components/cajas/CajaList.tsx (FINAL v16 - Lógica Rol Botones + Completo)
// // import React from 'react';
// // import {
// //     Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
// //     Tooltip, Button, Spinner, Chip, SortDescriptor // Asegurar imports
// // } from "@heroui/react";
// // import { EditIcon } from '../icons/EditIcon';         // Para Editar Contenido
// // import { DeleteIcon } from '../icons/DeleteIcon';     // Para Despachar o Inactivar
// // import { BoxIcon } from '../icons/BoxIcon';           // Para Ubicar
// // import { EyeIcon } from '../icons/EyeIcon';           // Para Ver Contenido
// // import { Caja, UbicacionCajaInfo, TipoBodega, EstadoCaja } from '../../types'; // Importar tipos

// // // Props que recibe el componente
// // interface CajaListProps {
// //   items: (Caja & { ubicacion_info?: UbicacionCajaInfo })[];
// //   totalItems: number;
// //   onEditContenido: (caja: Caja) => void;    // Abre modal edición
// //   onViewContenido: (caja: Caja) => void;    // Abre modal visualización
// //   onUbicar: (caja: Caja) => void;           // Abre modal ubicar
// //   onDespachar: (caja: Caja) => void;        // Ejecuta acción despachar
// //   onInactivateCaja: (caja: Caja) => void;   // <-- NUEVO: Ejecuta acción inactivar (Admin)
// //   isLoading: boolean;
// //   sortDescriptor: SortDescriptor;
// //   onSortChange: (descriptor: SortDescriptor) => void;
// //   // Roles
// //   isAdmin: boolean;
// //   isOperarioPT: boolean;
// //   isOperarioInsumos: boolean;
// // }

// // // Definición de columnas (incluyendo tipo y fecha)
// // const columns = [
// //   { key: "ean_caja", name: "EAN CAJA", sortable: true },
// //   { key: "ubicacion_actual", name: "UBICACIÓN", sortable: true },
// //   { key: "tipo_bodega", name: "TIPO", sortable: true },
// //   { key: "estado", name: "ESTADO", sortable: true },
// //   { key: "created_at", name: "FECHA CREACIÓN", sortable: true },
// //   { key: "actions", name: "ACCIONES", sortable: false },
// // ];

// // // Mapeo de colores para estado y tipo
// // const statusColorMap: Record<string, "success" | "warning" | "danger" | "secondary" | "default"> = { EN_BODEGA: "success", SIN_UBICACION: "warning", DESPACHADA: "danger", INSUMOS_FIJA: "secondary" }; // INSUMOS_FIJA ya no existe como estado real
// // const tipoBodegaColorMap: Record<TipoBodega, "secondary" | "warning" | "default"> = { 'PT': "secondary", 'INSUMOS': "warning" };

// // // Helper para formatear fecha
// // const formatDate = (dateString: string | null | undefined): string => { if (!dateString) return 'N/A'; try { return new Date(dateString).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' }); } catch (e) { return 'Inválida' } }

// // // Componente funcional de la Lista de Cajas
// // const CajaList: React.FC<CajaListProps> = ({
// //     items, totalItems,
// //     onEditContenido, onViewContenido, onUbicar, onDespachar, onInactivateCaja, // Recibir onInactivateCaja
// //     isLoading, sortDescriptor, onSortChange,
// //     isAdmin, isOperarioPT, isOperarioInsumos // Recibir roles
// // }) => {

// //   // --- Función para Renderizar Celdas (con lógica de acciones actualizada) ---
// //   const renderCell = React.useCallback((caja: Caja & { ubicacion_info?: UbicacionCajaInfo }, columnKey: React.Key) => {
// //      const cellValue = caja[columnKey as keyof Caja];

// //      switch (columnKey) {
// //       // --- Celdas de Datos ---
// //       case "ean_caja": return <span className="font-mono text-sm">{caja.ean_caja}</span>;
// //       case "ubicacion_actual": return caja.ubicacion_info?.codigo_visual_ubicacion ?? <span className="italic text-default-500">Sin Ubicación</span>;
// //       case "tipo_bodega": return <Chip size="sm" variant="flat" color={caja.tipo_bodega ? tipoBodegaColorMap[caja.tipo_bodega] : "default"}>{caja.tipo_bodega ?? 'N/A'}</Chip>;
// //       case "estado": return ( <Chip color={statusColorMap[caja.estado] || "default"} size="sm" variant="flat">{caja.estado}</Chip> );
// //       case "created_at": return formatDate(caja.created_at);

// //       // --- Celda de ACCIONES (Lógica Condicional Completa) ---
// //       case "actions":
// //         // Determinar permisos basados en rol y estado/tipo de la caja
// //         const esDespachada = caja.estado === 'DESPACHADA';
// //         // El estado INSUMOS_FIJA ya no existe, las de insumos pueden estar EN_BODEGA o SIN_UBICACION

// //         // ¿Quién puede EDITAR contenido? Si NO está despachada Y (es Admin O Op.PT/caja PT O Op.Insumos/caja INSUMOS)
// //         const puedeEditarCont = !esDespachada && (isAdmin || (isOperarioPT && caja.tipo_bodega === 'PT') || (isOperarioInsumos && caja.tipo_bodega === 'INSUMOS'));
// //         // ¿Quién puede VER contenido? Siempre
// //         const puedeVerCont = true;
// //         // ¿Quién puede UBICAR? Admin y Op. PT, y si NO está despachada y ES tipo PT
// //         const puedeUbicar = !esDespachada && (isAdmin || isOperarioPT) && caja.tipo_bodega === 'PT';
// //         // ¿Quién puede DESPACHAR? Admin y Op. PT, y solo cajas PT que NO estén despachadas.
// //         const puedeDespachar = !esDespachada && (isAdmin || isOperarioPT) && caja.tipo_bodega === 'PT';
// //         // ¿Quién puede INACTIVAR? Solo Admin, y si no está despachada.
// //         const puedeInactivar = isAdmin && !esDespachada;

// //         return (
// //           <div className="relative flex items-center justify-center gap-1">
// //             {/* Botón Ver/Editar Contenido */}
// //             {puedeEditarCont ? (
// //                 <Tooltip content="Editar Contenido" placement="top" delay={300}>
// //                     <Button isIconOnly size="sm" variant="light" color="primary" onPress={() => onEditContenido(caja)} aria-label="Editar Contenido"><EditIcon className="text-lg text-blue-500" /></Button>
// //                 </Tooltip>
// //              ) : puedeVerCont ? ( // Si no puede editar pero sí ver (ej. despachada)
// //                 <Tooltip content="Ver Contenido" placement="top" delay={300}>
// //                     <Button isIconOnly size="sm" variant="light" color="default" onPress={() => onViewContenido(caja)} aria-label="Ver Contenido"><EyeIcon className="text-lg text-default-500" /></Button>
// //                 </Tooltip>
// //              ) : null }

// //             {/* Botón Ubicar */}
// //             {puedeUbicar && <Tooltip content="Ubicar/Reubicar" placement="top" delay={300}><Button isIconOnly size="sm" variant="light" color="warning" onPress={() => onUbicar(caja)} aria-label="Ubicar"><BoxIcon className="text-lg text-yellow-600" /></Button></Tooltip>}

// //             {/* Botón Despachar */}
// //             {puedeDespachar && <Tooltip color="danger" content="Despachar" placement="top" delay={300}><Button isIconOnly size="sm" variant="light" color="danger" onPress={() => onDespachar(caja)} aria-label="Despachar"><DeleteIcon className="text-lg text-red-500" /></Button></Tooltip>}

// //             {/* Botón Inactivar (Solo Admin) */}
// //             {puedeInactivar && <Tooltip color="danger" content="Inactivar Caja (Admin)" placement="top" delay={300}><Button isIconOnly size="sm" variant="light" color="danger" onPress={() => onInactivateCaja(caja)} aria-label="Inactivar Caja"><DeleteIcon className="text-lg text-pink-600" /></Button></Tooltip>}

// //             {/* Placeholder */}
// //              {!puedeVerCont && !puedeUbicar && !puedeDespachar && !puedeInactivar && <span className="text-xs text-default-400">-</span>}
// //           </div>
// //         );
// //       default:
// //           const value = caja[columnKey as keyof Caja];
// //           return typeof value === 'string' || typeof value === 'number' ? value : JSON.stringify(value);
// //     }
// //   }, [onEditContenido, onViewContenido, onUbicar, onDespachar, onInactivateCaja, isAdmin, isOperarioPT, isOperarioInsumos]); // Añadir onInactivateCaja

// //   // --- JSX de la Tabla ---
// //   return (
// //     <Table aria-label="Tabla de Cajas" sortDescriptor={sortDescriptor} onSortChange={onSortChange} classNames={{ table: "min-h-[420px]", th: "bg-opacity-75 dark:bg-gray-700 dark:text-gray-300 text-sm" }}>
// //       <TableHeader columns={columns}>{(column) => (<TableColumn key={column.key} align={column.key === "actions" || ["tipo_bodega", "estado", "created_at"].includes(column.key as string) ? "center" : "start"} allowsSorting={column.sortable}>{column.name}</TableColumn>)}</TableHeader>
// //       <TableBody items={items} isLoading={isLoading} loadingContent={<Spinner label="Cargando..." />} emptyContent={<div className="text-center p-8 text-gray-500 dark:text-gray-400">{totalItems === 0 ? "No hay cajas activas." : "No hay cajas que coincidan."}</div>}>
// //         {(item) => (<TableRow key={item.id} className="hover:bg-gray-100 dark:hover:bg-gray-700">{(columnKey) => <TableCell className="p-3 dark:text-gray-300 text-sm align-middle">{renderCell(item, columnKey)}</TableCell>}</TableRow>)}
// //       </TableBody>
// //     </Table>
// //   );
// // };
// // export default CajaList; // Exportar









// // src/components/cajas/CajaList.tsx (FINAL v17 - Añade Calidad + Permiso Ubicar Admin Insumos + Completo)
// import React, { useCallback } from 'react'; // Importar useCallback
// import {
//     Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
//     Tooltip, Button, Spinner, Chip, SortDescriptor // Asegurar imports
// } from "@heroui/react";
// import { EditIcon } from '../icons/EditIcon';         // Para Editar/Ver Contenido
// import { DeleteIcon } from '../icons/DeleteIcon';     // Para Despachar o Inactivar
// import { BoxIcon } from '../icons/BoxIcon';           // Para Ubicar
// import { EyeIcon } from '../icons/EyeIcon';           // Para Ver Contenido
// import { Caja, UbicacionCajaInfo, TipoBodega, EstadoCaja, ClasificacionCalidad } from '../../types'; // Importar tipos necesarios

// // Props que recibe el componente
// interface CajaListProps {
//   items: (Caja & { ubicacion_info?: UbicacionCajaInfo })[];
//   totalItems: number;
//   onEditContenido: (caja: Caja) => void;
//   onViewContenido: (caja: Caja) => void;
//   onUbicar: (caja: Caja) => void;
//   onDespachar: (caja: Caja) => void;
//   onInactivateCaja: (caja: Caja) => void; // Para inactivar (Admin)
//   isLoading: boolean;
//   sortDescriptor: SortDescriptor;
//   onSortChange: (descriptor: SortDescriptor) => void;
//   // Roles
//   isAdmin: boolean;
//   isOperarioPT: boolean;
//   isOperarioInsumos: boolean;
// }

// // Definición de columnas (Añadida Calidad)
// const columns = [
//   { key: "ean_caja", name: "EAN CAJA", sortable: true },
//   { key: "ubicacion_actual", name: "UBICACIÓN", sortable: true },
//   { key: "tipo_bodega", name: "TIPO", sortable: true },
//   { key: "clasificacion_calidad", name: "CALIDAD", sortable: true }, // <-- Columna añadida
//   { key: "estado", name: "ESTADO", sortable: true },
//   { key: "created_at", name: "FECHA CREACIÓN", sortable: true },
//   { key: "actions", name: "ACCIONES", sortable: false },
// ];

// // Mapeo de colores
// const statusColorMap: Record<string, "success" | "warning" | "danger" | "secondary" | "default"> = { EN_BODEGA: "success", SIN_UBICACION: "warning", DESPACHADA: "danger" };
// const tipoBodegaColorMap: Record<TipoBodega, "secondary" | "warning" | "default"> = { 'PT': "secondary", 'INSUMOS': "warning" };
// const calidadColorMap: Record<ClasificacionCalidad, "success" | "warning" | "danger" | "default"> = { 'P': "success", 'SS': "warning", 'SP': "danger" };

// // Formateador de fecha
// const formatDate = (dateString: string | null | undefined): string => { if (!dateString) return 'N/A'; try { return new Date(dateString).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' }); } catch (e) { return 'Inválida' } }

// // Componente funcional de la Lista de Cajas
// const CajaList: React.FC<CajaListProps> = ({
//     items, totalItems,
//     onEditContenido, onViewContenido, onUbicar, onDespachar, onInactivateCaja,
//     isLoading, sortDescriptor, onSortChange,
//     isAdmin, isOperarioPT, isOperarioInsumos
// }) => {

//   // --- Función para Renderizar Celdas (Lógica de Acciones Final) ---
//   const renderCell = useCallback((caja: Caja & { ubicacion_info?: UbicacionCajaInfo }, columnKey: React.Key) => {
//      const cellValue = caja[columnKey as keyof Caja];

//      switch (columnKey) {
//       // --- Celdas de Datos ---
//       case "ean_caja": return <span className="font-mono text-sm">{caja.ean_caja}</span>;
//       case "ubicacion_actual": return caja.ubicacion_info?.codigo_visual_ubicacion ?? <span className="italic text-default-500">Sin Ubicación</span>;
//       case "tipo_bodega": return <Chip size="sm" variant="flat" radius="sm" color={caja.tipo_bodega ? tipoBodegaColorMap[caja.tipo_bodega] : "default"}>{caja.tipo_bodega ?? 'N/A'}</Chip>;
//       // *** NUEVO: Renderizar Chip para Calidad ***
//       case "clasificacion_calidad": return <Chip size="sm" variant="bordered" radius="sm" color={caja.clasificacion_calidad ? calidadColorMap[caja.clasificacion_calidad] : "default"}>{caja.clasificacion_calidad ?? '-'}</Chip>;
//       case "estado": return ( <Chip color={statusColorMap[caja.estado] || "default"} size="sm" variant="flat" radius="sm">{caja.estado}</Chip> );
//       case "created_at": return <span className="text-xs">{formatDate(caja.created_at)}</span>;

//       // --- Celda de ACCIONES (Lógica Condicional Final) ---
//       case "actions":
//         // Determinar permisos basados en rol y estado/tipo de la caja
//         const esDespachada = caja.estado === 'DESPACHADA';
//         const esPT = caja.tipo_bodega === 'PT';
//         const esInsumos = caja.tipo_bodega === 'INSUMOS';

//         // ¿Quién puede EDITAR contenido? Si NO Despachada Y (Admin O (OpPT y es PT) O (OpIns y es INSUMOS))
//         const puedeEditarCont = !esDespachada && (isAdmin || (isOperarioPT && esPT) || (isOperarioInsumos && esInsumos));
//         // ¿Quién puede VER contenido? Siempre
//         const puedeVerCont = true;
//         // ¿Quién puede UBICAR? Si NO Despachada Y (Admin [puede PT e Insumos] O (OpPT y es PT))
//         const puedeUbicar = !esDespachada && (isAdmin || (isOperarioPT && esPT));
//         // ¿Quién puede DESPACHAR? Si NO Despachada Y (Admin O OpPT) Y es PT
//         const puedeDespachar = !esDespachada && (isAdmin || isOperarioPT) && esPT;
//         // ¿Quién puede INACTIVAR? Solo Admin y si NO está despachada.
//         const puedeInactivar = isAdmin && !esDespachada;

//         return (
//           <div className="relative flex items-center justify-center gap-1">
//             {/* --- Botón Ver/Editar Contenido --- */}
//             {puedeEditarCont ? ( <Tooltip content="Editar Contenido"><Button isIconOnly size="sm" variant="light" color="primary" onPress={() => onEditContenido(caja)} aria-label="Editar Contenido"><EditIcon className="text-lg text-blue-500" /></Button></Tooltip> )
//              : puedeVerCont ? ( <Tooltip content="Ver Contenido"><Button isIconOnly size="sm" variant="light" color="default" onPress={() => onViewContenido(caja)} aria-label="Ver Contenido"><EyeIcon className="text-lg text-default-500" /></Button></Tooltip> )
//              : null }
//             {/* --- Botón Ubicar --- */}
//             {puedeUbicar && <Tooltip content="Ubicar/Reubicar"><Button isIconOnly size="sm" variant="light" color="warning" onPress={() => onUbicar(caja)} aria-label="Ubicar"><BoxIcon className="text-lg text-yellow-600" /></Button></Tooltip>}
//             {/* --- Botón Despachar --- */}
//             {puedeDespachar && <Tooltip color="danger" content="Despachar"><Button isIconOnly size="sm" variant="light" color="danger" onPress={() => onDespachar(caja)} aria-label="Despachar"><DeleteIcon className="text-lg text-red-500" /></Button></Tooltip>}
//             {/* --- Botón Inactivar (Admin) --- */}
//             {puedeInactivar && <Tooltip color="danger" content="Inactivar Caja (Admin)"><Button isIconOnly size="sm" variant="light" color="danger" onPress={() => onInactivateCaja(caja)} aria-label="Inactivar Caja"><DeleteIcon className="text-lg text-pink-600" /></Button></Tooltip>}
//             {/* Placeholder */}
//              {!puedeVerCont && !puedeUbicar && !puedeDespachar && !puedeInactivar && <span className="text-xs text-default-400">-</span>}
//           </div>
//         );
//       default: const value = caja[columnKey as keyof Caja]; return typeof value === 'string' || typeof value === 'number' ? value : JSON.stringify(value);
//     }
//   }, [onEditContenido, onViewContenido, onUbicar, onDespachar, onInactivateCaja, isAdmin, isOperarioPT, isOperarioInsumos]); // Dependencias correctas

//   // --- JSX de la Tabla ---
//   return (
//     <Table aria-label="Tabla de Cajas" sortDescriptor={sortDescriptor} onSortChange={onSortChange} classNames={{ table: "min-h-[420px]", th: "bg-opacity-75 dark:bg-gray-700 dark:text-gray-300 text-sm" }}>
//       <TableHeader columns={columns}>{(column) => (<TableColumn key={column.key} align={column.key === "actions" || ["tipo_bodega", "estado", "created_at", "clasificacion_calidad"].includes(column.key as string) ? "center" : "start"} allowsSorting={column.sortable}>{column.name}</TableColumn>)}</TableHeader>
//       <TableBody items={items} isLoading={isLoading} loadingContent={<Spinner label="Cargando..." />} emptyContent={<div className="text-center p-8 text-gray-500 dark:text-gray-400">{totalItems === 0 ? "No hay cajas." : "No hay resultados."}</div>}>
//         {(item) => (<TableRow key={item.id} className="hover:bg-gray-100 dark:hover:bg-gray-700">{(columnKey) => <TableCell className="p-3 dark:text-gray-300 text-sm align-middle">{renderCell(item, columnKey)}</TableCell>}</TableRow>)}
//       </TableBody>
//     </Table>
//   );
// };
// export default CajaList; // Exportar

// src/components/cajas/CajaList.tsx (FINAL v18 - Limpio de TS6133 + Completo)
import React, { useCallback } from 'react';
import {
    Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
    Tooltip, Button, Spinner, Chip, SortDescriptor
} from "@heroui/react";
import { EditIcon } from '../icons/EditIcon';
import { DeleteIcon } from '../icons/DeleteIcon';
import { BoxIcon } from '../icons/BoxIcon';
import { EyeIcon } from '../icons/EyeIcon';
// Importar tipos necesarios, quitando EstadoCaja si no se usa directamente aquí
import { Caja, UbicacionCajaInfo, TipoBodega, ClasificacionCalidad } from '../../types';

// Props
interface CajaListProps {
  items: (Caja & { ubicacion_info?: UbicacionCajaInfo })[];
  totalItems: number;
  onEditContenido: (caja: Caja) => void;
  onViewContenido: (caja: Caja) => void;
  onUbicar: (caja: Caja) => void;
  onDespachar: (caja: Caja) => void;
  onInactivateCaja: (caja: Caja) => void;
  isLoading: boolean;
  sortDescriptor: SortDescriptor;
  onSortChange: (descriptor: SortDescriptor) => void;
  isAdmin: boolean;
  isOperarioPT: boolean;
  isOperarioInsumos: boolean;
}

// Columnas
const columns = [
  { key: "ean_caja", name: "EAN CAJA", sortable: true },
  { key: "ubicacion_actual", name: "UBICACIÓN", sortable: true },
  { key: "tipo_bodega", name: "TIPO", sortable: true },
  { key: "clasificacion_calidad", name: "CALIDAD", sortable: true },
  { key: "estado", name: "ESTADO", sortable: true },
  { key: "created_at", name: "FECHA CREACIÓN", sortable: true },
  { key: "actions", name: "ACCIONES", sortable: false },
];

// Mapeo de colores
const statusColorMap: Record<string, "success" | "warning" | "danger" | "secondary" | "default"> = { EN_BODEGA: "success", SIN_UBICACION: "warning", DESPACHADA: "danger" };
const tipoBodegaColorMap: Record<TipoBodega, "secondary" | "warning" | "default"> = { 'PT': "secondary", 'INSUMOS': "warning" };
const calidadColorMap: Record<ClasificacionCalidad, "success" | "warning" | "danger" | "default"> = { 'P': "success", 'SS': "warning", 'SP': "danger" };

// Formateador de fecha
const formatDate = (dateString: string | null | undefined): string => { if (!dateString) return 'N/A'; try { return new Date(dateString).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' }); } catch (e) { return 'Inválida' } }

// Componente
const CajaList: React.FC<CajaListProps> = ({ items, totalItems, onEditContenido, onViewContenido, onUbicar, onDespachar, onInactivateCaja, isLoading, sortDescriptor, onSortChange, isAdmin, isOperarioPT, isOperarioInsumos }) => {

  const renderCell = useCallback((caja: Caja & { ubicacion_info?: UbicacionCajaInfo }, columnKey: React.Key) => {
     // Usar 'caja' directamente para acceder a las propiedades

     switch (columnKey) {
      case "ean_caja": return <span className="font-mono text-sm">{caja.ean_caja}</span>;
      case "ubicacion_actual": return caja.ubicacion_info?.codigo_visual_ubicacion ?? <span className="italic text-default-500">Sin Ubicación</span>;
      case "tipo_bodega": return <Chip size="sm" variant="flat" radius="sm" color={caja.tipo_bodega ? tipoBodegaColorMap[caja.tipo_bodega] : "default"}>{caja.tipo_bodega ?? 'N/A'}</Chip>;
      case "clasificacion_calidad": return <Chip size="sm" variant="bordered" radius="sm" color={caja.clasificacion_calidad ? calidadColorMap[caja.clasificacion_calidad] : "default"}>{caja.clasificacion_calidad ?? '-'}</Chip>;
      case "estado": return ( <Chip color={statusColorMap[caja.estado] || "default"} size="sm" variant="flat" radius="sm">{caja.estado}</Chip> );
      case "created_at": return <span className="text-xs">{formatDate(caja.created_at)}</span>;
      case "actions":
        const esDespachada = caja.estado === 'DESPACHADA';
        const esPT = caja.tipo_bodega === 'PT';
        const esInsumos = caja.tipo_bodega === 'INSUMOS';
        const puedeEditarCont = !esDespachada && (isAdmin || (isOperarioPT && esPT) || (isOperarioInsumos && esInsumos));
        const puedeVerCont = true;
        const puedeUbicar = !esDespachada && (isAdmin || (isOperarioPT && esPT));
        const puedeDespachar = !esDespachada && (isAdmin || isOperarioPT) && esPT;
        const puedeInactivar = isAdmin && !esDespachada;

        return (
          <div className="relative flex items-center justify-center gap-1">
            {puedeEditarCont ? ( <Tooltip content="Editar Contenido"><Button isIconOnly size="sm" variant="light" color="primary" onPress={() => onEditContenido(caja)} aria-label="Editar Contenido"><EditIcon className="text-lg text-blue-500" /></Button></Tooltip> )
             : puedeVerCont ? ( <Tooltip content="Ver Contenido"><Button isIconOnly size="sm" variant="light" color="default" onPress={() => onViewContenido(caja)} aria-label="Ver Contenido"><EyeIcon className="text-lg text-default-500" /></Button></Tooltip> )
             : null }
            {puedeUbicar && <Tooltip content="Ubicar/Reubicar"><Button isIconOnly size="sm" variant="light" color="warning" onPress={() => onUbicar(caja)} aria-label="Ubicar"><BoxIcon className="text-lg text-yellow-600" /></Button></Tooltip>}
            {puedeDespachar && <Tooltip color="danger" content="Despachar"><Button isIconOnly size="sm" variant="light" color="danger" onPress={() => onDespachar(caja)} aria-label="Despachar"><DeleteIcon className="text-lg text-red-500" /></Button></Tooltip>}
            {puedeInactivar && <Tooltip color="danger" content="Inactivar Caja (Admin)"><Button isIconOnly size="sm" variant="light" color="danger" onPress={() => onInactivateCaja(caja)} aria-label="Inactivar Caja"><DeleteIcon className="text-lg text-pink-600" /></Button></Tooltip>}
            {!puedeVerCont && !puedeUbicar && !puedeDespachar && !puedeInactivar && <span className="text-xs text-default-400">-</span>}
          </div>
        );
      default:
          // Acceder a la propiedad de 'caja' directamente
          const value = caja[columnKey as keyof Caja];
          return typeof value === 'string' || typeof value === 'number' ? value : JSON.stringify(value);
    }
  }, [onEditContenido, onViewContenido, onUbicar, onDespachar, onInactivateCaja, isAdmin, isOperarioPT, isOperarioInsumos]);

  return (
    <Table aria-label="Tabla de Cajas" sortDescriptor={sortDescriptor} onSortChange={onSortChange} classNames={{ table: "min-h-[420px]", th: "bg-opacity-75 dark:bg-gray-700 dark:text-gray-300 text-sm" }}>
      <TableHeader columns={columns}>{(column) => (<TableColumn key={column.key} align={column.key === "actions" || ["tipo_bodega", "estado", "created_at", "clasificacion_calidad"].includes(column.key as string) ? "center" : "start"} allowsSorting={column.sortable}>{column.name}</TableColumn>)}</TableHeader>
      <TableBody items={items} isLoading={isLoading} loadingContent={<Spinner label="Cargando..." />} emptyContent={<div className="text-center p-8 text-gray-500 dark:text-gray-400">{totalItems === 0 ? "No hay cajas." : "No hay resultados."}</div>}>
        {(item) => (<TableRow key={item.id} className="hover:bg-gray-100 dark:hover:bg-gray-700">{(columnKey) => <TableCell className="p-3 dark:text-gray-300 text-sm align-middle">{renderCell(item, columnKey)}</TableCell>}</TableRow>)}
      </TableBody>
    </Table>
  );
};
export default CajaList;