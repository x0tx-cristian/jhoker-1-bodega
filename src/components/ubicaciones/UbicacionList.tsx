// src/components/ubicaciones/UbicacionList.tsx (FINAL v9 - Completo y Corregido)
import React from 'react';
import {
    Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
    Tooltip, Button, Spinner, Chip, SortDescriptor // Asegurar imports
} from "@heroui/react";
import { EditIcon } from '../icons/EditIcon'; // Ajusta ruta
import { DeleteIcon } from '../icons/DeleteIcon'; // Ajusta ruta
import { Ubicacion, TipoBodega } from '../../types'; // Ajusta ruta, importar TipoBodega

// Props que recibe el componente
interface UbicacionListProps {
  items: Ubicacion[]; // Recibe los items ya filtrados, ordenados y paginados
  totalItems: number; // Total de items después de filtrar (para mensaje vacío)
  onEdit: (ubicacion: Ubicacion) => void; // Función para manejar clic en Editar
  onInactivate: (id: string) => void; // Función para manejar clic en Inactivar
  isLoading: boolean; // Para mostrar el spinner de carga de la tabla
  sortDescriptor: SortDescriptor; // Estado actual del ordenamiento {column, direction}
  onSortChange: (descriptor: SortDescriptor) => void; // Función para actualizar el ordenamiento
  isAdmin: boolean; // Indica si el usuario es administrador (para lógica condicional si fuera necesaria aquí)
}

// Definición de las columnas de la tabla
const columns = [
  { key: "codigo_visual", name: "CÓDIGO VISUAL", sortable: true },
  { key: "ean_ubicacion", name: "EAN-13 (GENERADO)", sortable: false },
  { key: "tipo_bodega", name: "TIPO", sortable: true }, // <-- Columna añadida y sortable
  { key: "descripcion_adicional", name: "DESCRIPCIÓN", sortable: true },
  { key: "actions", name: "ACCIONES", sortable: false },
];

// Mapeo de colores para los tipos de bodega (opcional)
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
    isAdmin // Recibido pero no usado directamente en renderizado (lógica de permiso en Page)
}) => {

  // Función para renderizar el contenido de cada celda
  const renderCell = React.useCallback((ubicacion: Ubicacion, columnKey: React.Key) => {
     // Acceder al valor de la celda usando la clave de la columna
     const cellValue = ubicacion[columnKey as keyof Ubicacion];

     switch (columnKey) {
       case "codigo_visual":
         return <span className="font-medium text-sm">{cellValue}</span>; // Negrita ligera
       case "ean_ubicacion":
         return <span className="font-mono text-xs">{cellValue}</span>; // Monoespaciado y pequeño para EAN
       case "tipo_bodega":
         // Mostrar Chip de color según el tipo de bodega
         return (
             <Chip
                size="sm"
                variant="flat"
                color={cellValue ? tipoBodegaColorMap[cellValue as TipoBodega] : "default"}
             >
                {cellValue ?? 'N/A'}
             </Chip>
         );
       case "descripcion_adicional":
         return <span className="text-sm">{cellValue ?? "-"}</span>; // Mostrar guión si no hay descripción
       case "actions":
         // Renderizar botones de acción
         return (
           <div className="relative flex items-center justify-center gap-1">
             <Tooltip content="Editar Ubicación" placement="top" delay={300}>
                <Button isIconOnly size="sm" variant="light" color="primary" onPress={() => onEdit(ubicacion)} aria-label="Editar">
                    <EditIcon className="text-lg text-blue-500" />
                </Button>
             </Tooltip>
             <Tooltip content="Inactivar Ubicación" color="danger" placement="top" delay={300}>
                <Button isIconOnly size="sm" variant="light" color="danger" onPress={() => onInactivate(ubicacion.id)} aria-label="Inactivar">
                    <DeleteIcon className="text-lg text-red-500" />
                </Button>
             </Tooltip>
           </div>
        );
       default:
         // Valor por defecto para otras columnas (si se añaden)
         return cellValue?.toString() ?? "-";
     }
  }, [onEdit, onInactivate]); // Dependencias del useCallback

  return (
    <Table
        aria-label="Tabla de Ubicaciones"
        // Control del ordenamiento
        sortDescriptor={sortDescriptor}
        onSortChange={onSortChange}
        // Estilos opcionales
        classNames={{
            table: "min-h-[420px]", // Altura mínima
            th: "bg-opacity-75 dark:bg-gray-700 dark:text-gray-300 text-sm", // Estilo cabeceras
            // td: "p-3 align-middle", // Estilo celdas (si es necesario)
        }}
    >
      {/* Cabecera de la tabla */}
      <TableHeader columns={columns}>
        {(column) => (
            <TableColumn
                key={column.key}
                align={column.key === "actions" || column.key === "tipo_bodega" ? "center" : "start"} // Centrar acciones y tipo
                allowsSorting={column.sortable} // Permitir ordenar según definición
            >
                {column.name}
            </TableColumn>
        )}
      </TableHeader>
      {/* Cuerpo de la tabla */}
      <TableBody
        items={items} // Recibe los items ya filtrados/ordenados/paginados
        isLoading={isLoading} // Pasa estado de carga
        loadingContent={<Spinner label="Cargando ubicaciones..." />} // Mensaje mientras carga
        // Mensaje a mostrar si no hay items (después de filtrar o si no hay datos)
        emptyContent={
            <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                {totalItems === 0 ? "No hay ubicaciones activas registradas." : "No hay ubicaciones que coincidan con los filtros."}
            </div>
        }
      >
        {/* Mapea cada item a una fila */}
        {(item) => (
          <TableRow key={item.id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
            {/* Mapea cada columna a una celda dentro de la fila */}
            {(columnKey) =>
                <TableCell className="p-3 dark:text-gray-300 text-sm align-middle">
                    {renderCell(item, columnKey)}
                </TableCell>
            }
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

// Exportar el componente
export default UbicacionList;