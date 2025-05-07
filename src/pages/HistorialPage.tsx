// src/pages/HistorialPage.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Spinner, Input, Button, Card, CardBody, Pagination,
    SortDescriptor, Select, SelectItem, // Asegurar imports
    Selection as SharedSelection // Importar Selection como SharedSelection si es necesario
} from "@heroui/react";
import { supabase } from '../lib/supabaseClient';
import HistorialList from '../components/historial/HistorialList';
import { HistorialMovimiento } from '../types';
import toast from 'react-hot-toast';

const ROWS_PER_PAGE = 15;

const HistorialPage: React.FC = () => {
  const [historial, setHistorial] = useState<HistorialMovimiento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtroAccion, setFiltroAccion] = useState<string>('');
  const [filtroFechaInicio, setFiltroFechaInicio] = useState('');
  const [filtroFechaFin, setFiltroFechaFin] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
    column: "timestamp",
    direction: "descending",
  });

  // Obtener acciones únicas para el Select (sin cambios)
  const uniqueActions = useMemo(() => {
    if (!historial || historial.length === 0) return [];
    const actions = new Set(historial.map(item => item.accion).filter(Boolean));
    return Array.from(actions).sort();
  }, [historial]);

  // Función para cargar el historial
  const fetchHistorial = useCallback(async () => {
    setIsLoading(true);
    try {
      // CORREGIDO: Select explícito para evitar ambigüedad
      let query = supabase
        .from('historial_movimientos')
        .select(`
            id, timestamp, accion, caja_id, ubicacion_id, referencia_id, usuario_id, detalles,
            usuarios:usuario_id ( nombre_usuario ),
            cajas:caja_id ( ean_caja ),
            ubicaciones:ubicacion_id ( codigo_visual ),
            referencias:referencia_id ( ean_referencia )
        `);

      if (filtroAccion) { query = query.eq('accion', filtroAccion); }
      if (filtroFechaInicio) { query = query.gte('timestamp', `${filtroFechaInicio}T00:00:00`); }
      if (filtroFechaFin) { const endDate = new Date(filtroFechaFin); endDate.setHours(23, 59, 59, 999); query = query.lte('timestamp', endDate.toISOString()); }
      query = query.order('timestamp', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;

      // CORREGIDO: Mapeo robusto para relaciones (maneja objeto, array o null)
      const mappedData = (data || []).map(item => {
          const getNestedProp = (nestedData: any, prop: string) => {
              if (!nestedData) return null;
              if (Array.isArray(nestedData)) {
                  return nestedData[0]?.[prop] ?? null;
              }
              return nestedData[prop] ?? null;
          };
          return {
              ...item,
              nombre_usuario: getNestedProp(item.usuarios, 'nombre_usuario'),
              ean_caja: getNestedProp(item.cajas, 'ean_caja'),
              codigo_visual_ubicacion: getNestedProp(item.ubicaciones, 'codigo_visual'),
              ean_referencia: getNestedProp(item.referencias, 'ean_referencia'),
          };
      }) as HistorialMovimiento[];

      setHistorial(mappedData);
      setCurrentPage(1);

    } catch (err: any) {
      toast.error(`Error al cargar historial: ${err.message || 'Desconocido'}`);
      setHistorial([]);
    } finally {
      setIsLoading(false);
    }
  }, [filtroAccion, filtroFechaInicio, filtroFechaFin]);

  useEffect(() => { fetchHistorial(); }, [fetchHistorial]);

  // Lógica de Ordenamiento (sin cambios)
  const sortedHistorial = useMemo(() => { return [...historial].sort((a, b) => { if (!a || !b) return 0; let first: any; let second: any; const col = sortDescriptor.column as keyof HistorialMovimiento | 'usuario'; switch (col) { case 'timestamp': first = new Date(a.timestamp || 0).getTime(); second = new Date(b.timestamp || 0).getTime(); break; case 'usuario': first = a.nombre_usuario ?? a.usuario_id ?? ''; second = b.nombre_usuario ?? b.usuario_id ?? ''; break; default: first = a[col as keyof HistorialMovimiento] ?? ''; second = b[col as keyof HistorialMovimiento] ?? ''; break; } let cmp = 0; if (col === 'timestamp') { cmp = first - second; } else if (typeof first === 'string' && typeof second === 'string') { cmp = first.localeCompare(second, undefined, { numeric: true, sensitivity: 'base' }); } else if (first < second) { cmp = -1; } else if (first > second) { cmp = 1; } return sortDescriptor.direction === "descending" ? -cmp : cmp; }); }, [historial, sortDescriptor]);

  // Paginación (sin cambios)
  const totalPages = Math.ceil(sortedHistorial.length / ROWS_PER_PAGE);
  const itemsForCurrentPage = useMemo(() => { const start = (currentPage - 1) * ROWS_PER_PAGE; const end = start + ROWS_PER_PAGE; return sortedHistorial.slice(start, end); }, [currentPage, sortedHistorial]);
  useEffect(() => { if (currentPage > totalPages && totalPages > 0) { setCurrentPage(totalPages); } else if (totalPages === 0 && currentPage !== 1) { setCurrentPage(1); } }, [totalPages, currentPage]);

  // Manejadores
  const handleClearFilters = () => { setFiltroAccion(''); setFiltroFechaInicio(''); setFiltroFechaFin(''); };
  const handleSortChange = useCallback((descriptor: SortDescriptor) => { setSortDescriptor(descriptor); setCurrentPage(1); }, []);
  // CORREGIDO: Usar tipo SharedSelection y extraer valor
  const handleActionFilterChange = useCallback((keys: SharedSelection) => {
    let selectedAction = '';
    if (keys === 'all') {
        // Manejar caso "all" si tu librería lo usa, aquí asumimos que no
        selectedAction = '';
    } else if (keys instanceof Set) {
        selectedAction = Array.from(keys)[0]?.toString() || '';
    }
    setFiltroAccion(selectedAction);
    setCurrentPage(1);
  }, []);

  // Preparar datos para el Select de Acciones
  const uniqueActionsData = useMemo(() => {
      return [
          { key: "", label: "Todas" },
          ...uniqueActions.map(action => ({ key: action, label: action }))
      ];
  }, [uniqueActions]);

  // --- JSX ---
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Historial de Movimientos</h1>
       {/* Filtros */}
       <Card className="dark:bg-gray-800 mb-6"><CardBody>
         <div className="flex flex-wrap gap-4 items-end">
           {/* CORREGIDO: Select Acción usa 'items' prop */}
           <Select
                items={uniqueActionsData}
                label="Filtrar por Acción"
                placeholder="Todas"
                size="sm"
                variant="bordered"
                selectedKeys={filtroAccion ? new Set([filtroAccion]) : new Set([''])}
                onSelectionChange={handleActionFilterChange}
                className="max-w-xs"
                aria-label="Filtrar Acción"
            >
               {(item) => (
                    <SelectItem key={item.key} textValue={item.label}>
                        {item.label}
                    </SelectItem>
                )}
           </Select>
           <Input label="Fecha Inicio" type="date" size="sm" value={filtroFechaInicio} onValueChange={setFiltroFechaInicio} className="max-w-xs" variant="bordered" placeholder=" "/>
           <Input label="Fecha Fin" type="date" size="sm" value={filtroFechaFin} onValueChange={setFiltroFechaFin} className="max-w-xs" variant="bordered" placeholder=" "/>
           <Button onPress={handleClearFilters} size="md" variant="light" className="self-center"> Limpiar Filtros </Button>
         </div>
       </CardBody></Card>
      {/* Tabla Historial */}
      <Card className="dark:bg-gray-800"><CardBody>
        {isLoading && historial.length === 0 ? (<div className="flex justify-center items-center min-h-[420px]"><Spinner label="Cargando historial..." /></div>) : (
          <HistorialList items={itemsForCurrentPage} totalItems={sortedHistorial.length} isLoading={isLoading} sortDescriptor={sortDescriptor} onSortChange={handleSortChange} />
        )}
      </CardBody></Card>
      {/* Paginación */}
       {!isLoading && totalPages > 1 && ( <div className="py-2 px-2 flex justify-center items-center gap-2 mt-4"> <Pagination isCompact showControls showShadow color="secondary" page={currentPage} total={totalPages} onChange={setCurrentPage} /> <span className="text-default-400 text-small">Página {currentPage} de {totalPages} ({sortedHistorial.length} total filtrado)</span> </div> )}
    </div>
  );
};
export default HistorialPage;