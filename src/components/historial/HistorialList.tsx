// src/components/historial/HistorialList.tsx (FINAL v5 - Renderizado Detallado + Sort)
import React from 'react';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Spinner, Chip, Tooltip, Code, SortDescriptor } from "@heroui/react";
import { HistorialMovimiento } from '../../types'; // Ajusta ruta

interface HistorialListProps {
  items: HistorialMovimiento[];
  totalItems: number; // Total después de filtrar
  isLoading: boolean;
  sortDescriptor: SortDescriptor; // Recibe estado de ordenamiento
  onSortChange: (descriptor: SortDescriptor) => void; // Recibe manejador
}

// Columnas con sortable habilitado
const columns = [
  { key: "timestamp", label: "FECHA Y HORA", sortable: true },
  { key: "accion", label: "ACCIÓN", sortable: true },
  { key: "usuario", label: "USUARIO", sortable: true }, // Basado en nombre_usuario o id
  { key: "entidad", label: "ENTIDAD RELACIONADA", sortable: false },
  { key: "detalles", label: "DETALLES (JSON)", sortable: false },
];

// Formateador de fecha
const formatTimestamp = (isoString: string | null): string => { if (!isoString) return 'N/A'; try { const date = new Date(isoString); const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }; return date.toLocaleString('es-CO', options).replace(',', ''); } catch (e) { return 'Inválida'; } };

// Colores para acciones
const actionColorMap: Record<string, "default" | "primary" | "secondary" | "success" | "warning" | "danger"> = { CREATE_REFERENCIA: "success", UPDATE_REFERENCIA: "secondary", INACTIVATE_REFERENCIA: "warning", CREATE_UBICACION: "success", UPDATE_UBICACION: "secondary", INACTIVATE_UBICACION: "warning", CREATE_CAJA: "success", EDITAR_CONTENIDO: "primary", ELIMINAR_CONTENIDO_REF: "warning", UBICAR_CAJA: "primary", DESPACHAR_CAJA: "danger", };

const HistorialList: React.FC<HistorialListProps> = ({ items, totalItems, isLoading, sortDescriptor, onSortChange }) => {

  // --- Render Cell con Lógica Detallada ---
  const renderCell = React.useCallback((item: HistorialMovimiento, columnKey: React.Key) => {
    const cellValue = item[columnKey as keyof HistorialMovimiento];
    switch (columnKey) {
      case "timestamp": return formatTimestamp(item.timestamp);
      case "accion": return <Chip size="sm" variant="flat" color={actionColorMap[item.accion] || "default"} className="max-w-[180px] truncate">{cellValue}</Chip>;
      case "usuario": return item.nombre_usuario ?? item.usuario_id?.substring(0,8) ?? 'N/A';
      case "entidad":
        let entidadDesc = [];
        if (item.ean_caja) { entidadDesc.push(`Cj:${item.ean_caja}`); } else if (item.caja_id) { entidadDesc.push(`CjID:${item.caja_id.substring(0,4)}..`); }
        if (item.codigo_visual_ubicacion) { entidadDesc.push(`Ub:${item.codigo_visual_ubicacion}`); } else if (item.ubicacion_id) { entidadDesc.push(`UbID:${item.ubicacion_id.substring(0,4)}..`); }
        if (item.ean_referencia) { entidadDesc.push(`Ref:${item.ean_referencia}`); } else if (item.referencia_id) { entidadDesc.push(`RfID:${item.referencia_id.substring(0,4)}..`); }
        return <span className="text-xs">{entidadDesc.join(' ')}</span> || '-';
      case "detalles":
        if (cellValue && typeof cellValue === 'object' && Object.keys(cellValue).length > 0) { const jsonString = JSON.stringify(cellValue); const shortJson = jsonString.substring(0, 40) + (jsonString.length > 40 ? '...' : ''); return (<Tooltip content={<pre className="text-xs max-w-md whitespace-pre-wrap p-2 bg-gray-700 text-white rounded">{JSON.stringify(cellValue, null, 2)}</pre>} placement="top-start" delay={300} closeDelay={100} className="dark:bg-gray-700 dark:text-white"><Code size="sm">{shortJson}</Code></Tooltip>); } return "-";
      default: return cellValue?.toString() ?? "-";
    }
  }, []);

  return (
    <Table
      aria-label="Historial de Movimientos"
      sortDescriptor={sortDescriptor} // Pasar prop
      onSortChange={onSortChange}     // Pasar prop
      classNames={{ table: "min-h-[500px]" }}
    >
      <TableHeader columns={columns}>
        {(column) => (<TableColumn key={column.key} align="start" allowsSorting={column.sortable}>{column.label}</TableColumn>)}
      </TableHeader>
      <TableBody
        items={items} // Items de la página actual
        isLoading={isLoading}
        loadingContent={<Spinner label="Cargando historial..." />}
        emptyContent={totalItems === 0 ? "No hay movimientos registrados." : "No hay movimientos que coincidan con los filtros."}
      >
        {(item) => (<TableRow key={item.id}>{(columnKey) => <TableCell className="text-xs dark:text-gray-300 whitespace-nowrap overflow-hidden text-ellipsis max-w-[250px]">{renderCell(item, columnKey)}</TableCell>}</TableRow>)}
      </TableBody>
    </Table>
  );
};
export default HistorialList;