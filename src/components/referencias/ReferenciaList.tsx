// src/components/referencias/ReferenciaList.tsx (FINAL v9 - Completo y Corregido)
import React from 'react';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Tooltip, Button, Spinner, Chip, SortDescriptor } from "@heroui/react";
import { EditIcon } from '../icons/EditIcon';
import { DeleteIcon } from '../icons/DeleteIcon';
import { Referencia } from '../../types';

interface ReferenciaListProps {
  items: Referencia[];
  totalItems: number; // Total después de filtrar
  onEdit: (referencia: Referencia) => void;
  onInactivate: (id: string) => void;
  isLoading: boolean;
  sortDescriptor: SortDescriptor; // Recibe el estado de ordenamiento
  onSortChange: (descriptor: SortDescriptor) => void; // Recibe la función para cambiar el ordenamiento
}

// Columnas con 'sortable' habilitado donde corresponde
const columns = [
  { key: "ean_referencia", name: "EAN REFERENCIA", sortable: true },
  { key: "descripcion", name: "DESCRIPCIÓN", sortable: true },
  { key: "talla", name: "TALLA", sortable: true },
  { key: "color", name: "COLOR", sortable: true },
  { key: "actions", name: "ACCIONES", sortable: false },
];

const ReferenciaList: React.FC<ReferenciaListProps> = ({ items, totalItems, onEdit, onInactivate, isLoading, sortDescriptor, onSortChange }) => {

  // Render Cell sin cambios
  const renderCell = React.useCallback((referencia: Referencia, columnKey: React.Key) => {
    const cellValue = referencia[columnKey as keyof Referencia];
    switch (columnKey) {
      case "talla": return cellValue ?? "N/A";
      case "color": return cellValue ?? "N/A";
      case "actions": return ( <div className="relative flex items-center gap-1"> <Tooltip content="Editar"><Button isIconOnly size="sm" variant="light" color="primary" onPress={() => onEdit(referencia)} aria-label="Editar"><EditIcon className="text-lg text-blue-500" /></Button></Tooltip> <Tooltip color="danger" content="Inactivar"><Button isIconOnly size="sm" variant="light" color="danger" onPress={() => onInactivate(referencia.id)} aria-label="Inactivar"><DeleteIcon className="text-lg text-red-500" /></Button></Tooltip> </div> );
      default: return cellValue;
    }
  }, [onEdit, onInactivate]);

  return (
    <Table
      aria-label="Tabla de Referencias"
      sortDescriptor={sortDescriptor} // <-- Pasar prop
      onSortChange={onSortChange}     // <-- Pasar prop
      classNames={{ table: "min-h-[420px]" }}
    >
      <TableHeader columns={columns}>
        {(column) => (
          <TableColumn key={column.key} align={column.key === "actions" ? "center" : "start"} allowsSorting={column.sortable}>
            {column.name}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody
        items={items} // Items de la página actual (ya filtrados y ordenados por el padre)
        isLoading={isLoading}
        loadingContent={<Spinner label="Cargando..." />}
        emptyContent={totalItems === 0 ? "No hay referencias activas registradas." : "No hay referencias que coincidan con los filtros."}
      >
        {(item) => (
          <TableRow key={item.id}>
            {(columnKey) => <TableCell className="dark:text-gray-300">{renderCell(item, columnKey)}</TableCell>}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
export default ReferenciaList;