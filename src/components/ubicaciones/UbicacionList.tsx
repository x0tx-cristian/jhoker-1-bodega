// src/components/ubicaciones/UbicacionList.tsx
import React from 'react';
import {
    Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
    Tooltip, Button, Spinner, Chip, SortDescriptor
} from "@heroui/react";
import { EditIcon } from '../icons/EditIcon';
import { DeleteIcon } from '../icons/DeleteIcon';
import { Ubicacion, TipoBodega } from '../../types';

interface UbicacionListProps {
  items: Ubicacion[];
  totalItems: number;
  onEdit: (ubicacion: Ubicacion) => void;
  onInactivate: (id: string) => void;
  isLoading: boolean;
  sortDescriptor: SortDescriptor;
  onSortChange: (descriptor: SortDescriptor) => void;
  // CORREGIDO: Prop 'isAdmin' eliminada de la interfaz
}

const columns = [
  { key: "codigo_visual", name: "CÓDIGO VISUAL", sortable: true },
  { key: "ean_ubicacion", name: "EAN-13 (GENERADO)", sortable: false },
  { key: "tipo_bodega", name: "TIPO", sortable: true },
  { key: "descripcion_adicional", name: "DESCRIPCIÓN", sortable: true },
  { key: "actions", name: "ACCIONES", sortable: false },
];

const tipoBodegaColorMap: Record<TipoBodega, "secondary" | "warning" | "default"> = {
    'PT': "secondary",
    'INSUMOS': "warning"
};

const UbicacionList: React.FC<UbicacionListProps> = ({
    items,
    totalItems,
    onEdit,
    onInactivate,
    isLoading,
    sortDescriptor,
    onSortChange,
    // CORREGIDO: Prop 'isAdmin' eliminada de la desestructuración
}) => {

   const renderCell = React.useCallback((ubicacion: Ubicacion, columnKey: React.Key) => {
     const cellValue = ubicacion[columnKey as keyof Ubicacion];
     switch (columnKey) {
       case "codigo_visual": return <span className="font-medium text-sm">{cellValue}</span>;
       case "ean_ubicacion": return <span className="font-mono text-xs">{cellValue}</span>;
       case "tipo_bodega": return ( <Chip size="sm" variant="flat" color={cellValue ? tipoBodegaColorMap[cellValue as TipoBodega] : "default"}> {cellValue ?? 'N/A'} </Chip> );
       case "descripcion_adicional": return <span className="text-sm">{cellValue ?? "-"}</span>;
       case "actions": return ( <div className="relative flex items-center justify-center gap-1"> <Tooltip content="Editar Ubicación" placement="top" delay={300}><Button isIconOnly size="sm" variant="light" color="primary" onPress={() => onEdit(ubicacion)} aria-label="Editar"><EditIcon className="text-lg text-blue-500" /></Button></Tooltip> <Tooltip content="Inactivar Ubicación" color="danger" placement="top" delay={300}><Button isIconOnly size="sm" variant="light" color="danger" onPress={() => onInactivate(ubicacion.id)} aria-label="Inactivar"><DeleteIcon className="text-lg text-red-500" /></Button></Tooltip> </div> );
       default: return cellValue?.toString() ?? "-";
     }
  }, [onEdit, onInactivate]);


  return (
    <Table
        aria-label="Tabla de Ubicaciones"
        sortDescriptor={sortDescriptor}
        onSortChange={onSortChange}
        classNames={{
            table: "min-h-[420px]",
            th: "bg-opacity-75 dark:bg-gray-700 dark:text-gray-300 text-sm",
        }}
    >
      <TableHeader columns={columns}>
        {(column) => ( <TableColumn key={column.key} align={column.key === "actions" || column.key === "tipo_bodega" ? "center" : "start"} allowsSorting={column.sortable}> {column.name} </TableColumn> )}
      </TableHeader>
      <TableBody
        items={items}
        isLoading={isLoading}
        loadingContent={<Spinner label="Cargando ubicaciones..." />}
        emptyContent={ <div className="text-center p-8 text-gray-500 dark:text-gray-400"> {totalItems === 0 ? "No hay ubicaciones activas registradas." : "No hay ubicaciones que coincidan con los filtros."} </div> }
      >
        {(item) => (
          <TableRow key={item.id}>
            {columns.map((column) => (
              <TableCell key={column.key} className="p-3 dark:text-gray-300 text-sm align-middle">
                {renderCell(item, column.key)}
              </TableCell>
            ))}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default UbicacionList;