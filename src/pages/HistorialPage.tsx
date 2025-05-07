// src/pages/HistorialPage.tsx (FINAL v4 - Fix Select String + Completo)
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Spinner, Input, Button, Card, CardBody, Pagination,
    SortDescriptor, Select, SelectItem // Asegurar imports
} from "@heroui/react";
import { supabase } from '../lib/supabaseClient'; // Ajusta ruta
import HistorialList from '../components/historial/HistorialList'; // Ajusta ruta
import { HistorialMovimiento } from '../types'; // Ajusta ruta
import toast from 'react-hot-toast';

const ROWS_PER_PAGE = 15; // O el número de filas que prefieras

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

  // Obtener acciones únicas para el Select
  const uniqueActions = useMemo(() => {
    if (!historial || historial.length === 0) return [];
    const actions = new Set(historial.map(item => item.accion).filter(Boolean));
    return Array.from(actions).sort();
  }, [historial]);

  // Función para cargar el historial
  const fetchHistorial = useCallback(async () => {
    setIsLoading(true);
    console.log("[Historial Fetch] Iniciando carga con filtros:", { filtroAccion, filtroFechaInicio, filtroFechaFin });
    try {
      let query = supabase
        .from('historial_movimientos')
        // *** CORRECCIÓN: Quitar comentarios SQL de aquí ***
        .select(`
            id,
            timestamp,
            accion,
            caja_id,
            ubicacion_id,
            referencia_id,
            usuario_id,
            detalles,
            usuarios!left( nombre_usuario ),
            cajas!left( ean_caja ),
            ubicaciones!left( codigo_visual ),
            referencias!left( ean_referencia )
        `);

      // Aplicar filtros en BD
      if (filtroAccion) { query = query.eq('accion', filtroAccion); }
      if (filtroFechaInicio) { query = query.gte('timestamp', `${filtroFechaInicio}T00:00:00`); }
      if (filtroFechaFin) { const endDate = new Date(filtroFechaFin); endDate.setHours(23, 59, 59, 999); query = query.lte('timestamp', endDate.toISOString()); }

      // Añadir ordenamiento inicial por si acaso (aunque se reordena en frontend)
      query = query.order('timestamp', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;

      // Mapear datos
      const mappedData = (data || []).map(item => ({
          ...item,
          nombre_usuario: item.usuarios?.nombre_usuario,
          ean_caja: item.cajas?.ean_caja,
          codigo_visual_ubicacion: item.ubicaciones?.codigo_visual,
          ean_referencia: item.referencias?.ean_referencia,
      })) as HistorialMovimiento[];

      setHistorial(mappedData);
      setCurrentPage(1);
      console.log("[Historial Fetch] Historial cargado/filtrado:", mappedData.length);

    } catch (err: any) {
      console.error("Error cargando historial:", err);
      toast.error(`Error al cargar historial: ${err.message || 'Desconocido'}`);
      setHistorial([]);
    } finally {
      setIsLoading(false);
    }
  }, [filtroAccion, filtroFechaInicio, filtroFechaFin]); // Depende de los filtros

  // Efecto para recargar cuando los filtros cambian
  useEffect(() => {
    fetchHistorial();
  }, [fetchHistorial]);

  // Lógica de Ordenamiento (Frontend)
  const sortedHistorial = useMemo(() => {
      return [...historial].sort((a, b) => {
          if (!a || !b) return 0; let first: any; let second: any; const col = sortDescriptor.column as keyof HistorialMovimiento | 'usuario';
          switch (col) { case 'timestamp': first = new Date(a.timestamp || 0).getTime(); second = new Date(b.timestamp || 0).getTime(); break; case 'usuario': first = a.nombre_usuario ?? a.usuario_id ?? ''; second = b.nombre_usuario ?? b.usuario_id ?? ''; break; default: first = a[col as keyof HistorialMovimiento] ?? ''; second = b[col as keyof HistorialMovimiento] ?? ''; break; }
          let cmp = 0; if (col === 'timestamp') { cmp = first - second; } else if (typeof first === 'string' && typeof second === 'string') { cmp = first.localeCompare(second, undefined, { numeric: true, sensitivity: 'base' }); } else if (first < second) { cmp = -1; } else if (first > second) { cmp = 1; }
          return sortDescriptor.direction === "descending" ? -cmp : cmp;
       });
  }, [historial, sortDescriptor]);

  // Paginación
  const totalPages = Math.ceil(sortedHistorial.length / ROWS_PER_PAGE);
  const itemsForCurrentPage = useMemo(() => { const start = (currentPage - 1) * ROWS_PER_PAGE; const end = start + ROWS_PER_PAGE; return sortedHistorial.slice(start, end); }, [currentPage, sortedHistorial]);
  useEffect(() => { if (currentPage > totalPages && totalPages > 0) { setCurrentPage(totalPages); } else if (totalPages === 0 && currentPage !== 1) { setCurrentPage(1); } }, [totalPages, currentPage]);

  // Manejadores
  const handleClearFilters = () => { setFiltroAccion(''); setFiltroFechaInicio(''); setFiltroFechaFin(''); };
  const handleSortChange = useCallback((descriptor: SortDescriptor) => { setSortDescriptor(descriptor); setCurrentPage(1); }, []);
  const handleActionFilterChange = useCallback((keys: Set<React.Key>) => { const selectedAction = Array.from(keys)[0]?.toString() || ''; setFiltroAccion(selectedAction); setCurrentPage(1); }, []);

  // --- JSX ---
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Historial de Movimientos</h1>
       {/* Filtros */}
       <Card className="dark:bg-gray-800 mb-6"><CardBody>
         <div className="flex flex-wrap gap-4 items-end">
           <Select label="Filtrar por Acción" placeholder="Todas" size="sm" variant="bordered" selectedKeys={filtroAccion ? new Set([filtroAccion]) : undefined} onSelectionChange={handleActionFilterChange} className="max-w-xs" aria-label="Filtrar Acción">
               <SelectItem key="" value="">Todas</SelectItem>
               {uniqueActions.map((action) => (<SelectItem key={action} value={action}>{action}</SelectItem>))}
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
export default HistorialPage; // Exportar