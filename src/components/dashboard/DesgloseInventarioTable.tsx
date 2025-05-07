// src/components/dashboard/DesgloseInventarioTable.tsx
import React from 'react';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Spinner } from "@heroui/react";
import { DesgloseCajaInventario, EstadoCaja, TipoBodega, ClasificacionCalidad } from '../../types'; // Ajusta ruta

// Props
interface DesgloseInventarioTableProps {
  items: DesgloseCajaInventario[];
  isLoading: boolean;
}

// Columnas
const columns = [
  { key: "ean_caja", label: "EAN CAJA" },
  { key: "tipo_bodega", label: "TIPO" },
  { key: "estado", label: "ESTADO" },
  { key: "calidad", label: "CALIDAD" },
  { key: "cantidad_en_caja", label: "CANT." },
  { key: "ubicacion_visual", label: "UBICACIÓN" },
];

// Mapeo de colores (reutilizar si es posible desde un archivo común)
const statusColorMap: Record<string, "success" | "warning" | "danger" | "secondary" | "default"> = { EN_BODEGA: "success", SIN_UBICACION: "warning", DESPACHADA: "danger" };
const tipoBodegaColorMap: Record<TipoBodega, "secondary" | "warning" | "default"> = { 'PT': "secondary", 'INSUMOS': "warning" };
const calidadColorMap: Record<ClasificacionCalidad, "success" | "warning" | "danger" | "default"> = { 'P': "success", 'SS': "warning", 'SP': "danger" };

const DesgloseInventarioTable: React.FC<DesgloseInventarioTableProps> = ({ items, isLoading }) => {

  // Render Cell
  const renderCell = React.useCallback((item: DesgloseCajaInventario, columnKey: React.Key) => {
    const cellValue = item[columnKey as keyof DesgloseCajaInventario];
    switch (columnKey) {
      case "ean_caja": return <span className="font-mono text-xs">{cellValue}</span>;
      case "tipo_bodega": return <Chip size="sm" variant="flat" radius="sm" color={item.tipo_bodega ? tipoBodegaColorMap[item.tipo_bodega] : "default"}>{item.tipo_bodega ?? 'N/A'}</Chip>;
      case "estado": return <Chip size="sm" variant="flat" radius="sm" color={statusColorMap[item.estado] || "default"}>{item.estado}</Chip>;
      case "calidad": return <Chip size="sm" variant="bordered" radius="sm" color={item.calidad ? calidadColorMap[item.calidad] : "default"}>{item.calidad ?? '-'}</Chip>;
      case "cantidad_en_caja": return <div className="text-right font-medium">{cellValue}</div>;
      case "ubicacion_visual": return cellValue ?? <span className="italic text-default-500">Sin Ubic</span>;
      default: return cellValue?.toString() ?? "-";
    }
  }, []);

  return (
    <Table removeWrapper aria-label="Desglose de inventario por caja" classNames={{ wrapper: "max-h-[400px]" }}>
      <TableHeader columns={columns}>
        {(column) => (
          <TableColumn key={column.key} align={column.key === 'cantidad_en_caja' ? 'end' : 'start'} className="text-xs">
            {column.label}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody
        items={items}
        isLoading={isLoading}
        loadingContent={<Spinner size="sm" label="Cargando desglose..." />}
        emptyContent={"No se encontraron cajas con esta referencia."}
      >
        {(item) => (
          // Usar EAN de caja como key aquí está bien si es único en el resultado
          <TableRow key={item.ean_caja}>
            {(columnKey) => <TableCell className="text-xs">{renderCell(item, columnKey)}</TableCell>}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default DesgloseInventarioTable;