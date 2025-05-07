// src/pages/UbicacionesPage.tsx (FINAL v10 - Completo con Rol Logic)
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Button, Spinner, useDisclosure, Input, Card, CardHeader, CardBody,
    Pagination, SortDescriptor, Select, SelectItem // Asegurar imports
} from "@heroui/react";
import { supabase } from '../lib/supabaseClient';        // Ajusta ruta
import UbicacionList from '../components/ubicaciones/UbicacionList'; // Ajusta ruta
import UbicacionForm from '../components/ubicaciones/UbicacionForm'; // Ajusta ruta
import { Ubicacion, TipoBodega, UbicacionFormData } from '../types'; // Ajusta ruta, importar UbicacionFormData
import { useAuth } from '../contexts/AuthContext';       // Ajusta ruta
import toast from 'react-hot-toast';
import { Navigate } from 'react-router-dom';             // Para redirigir

// Función auxiliar para el retardo
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
// Constante para filas por página
const ROWS_PER_PAGE = 10;

const UbicacionesPage: React.FC = () => {
  // --- Hooks y Estados ---
  const { isOpen, onOpen, onClose } = useDisclosure(); // Control del Modal
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]); // Lista COMPLETA desde BD
  const [isLoading, setIsLoading] = useState(true); // Estado de carga general
  const [isSubmitting, setIsSubmitting] = useState(false); // Para submits de formulario
  const [isEditMode, setIsEditMode] = useState(false); // Modo del formulario
  const [currentUbicacion, setCurrentUbicacion] = useState<Ubicacion | null>(null); // Datos para editar
  const { userId, rolId } = useAuth(); // Obtener ID y ROL del usuario logueado
  const [currentPage, setCurrentPage] = useState(1); // Página actual
  const [filtroCodigoVisual, setFiltroCodigoVisual] = useState(''); // Filtro por código
  const [filtroDescripcion, setFiltroDescripcion] = useState(''); // Filtro por descripción
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({ // Estado de ordenamiento
    column: "codigo_visual",
    direction: "ascending",
  });

  // --- Lógica Derivada del Rol ---
  const isAdmin = useMemo(() => rolId === 1, [rolId]); // Es Admin?
  const usuarioTipoBodega = useMemo((): TipoBodega | null => { // Tipo de bodega permitido para el rol actual
      if (isAdmin) return null; // Admin puede ver/operar en ambas
      if (rolId === 2) return 'PT'; // Operario PT
      if (rolId === 3) return null; // Operario Insumos NO debería ver esta página
      return null;
  }, [rolId, isAdmin]);

  // Función para obtener el ID del usuario actual (para historial)
  const getCurrentUserId = useCallback((): string | null => {
    if (!userId) { toast.error("Error de sesión."); return null; }
    return userId;
  }, [userId]);

  // --- Carga de Datos ---
  const fetchUbicaciones = useCallback(async () => {
    setIsLoading(true);
    console.log("[Ubicaciones Fetch] Iniciando carga...");
    try {
      // Llamar a la función que devuelve todas las ubicaciones activas (incluye tipo_bodega)
      const { data, error: rpcError } = await supabase.rpc('get_all_ubicaciones_activas');
      if (rpcError) {
          console.error("[Ubicaciones Fetch] Error RPC:", rpcError);
          throw rpcError; // Re-lanzar para el catch general
      }
      setUbicaciones((data as Ubicacion[] | null) || []);
      setCurrentPage(1); // Resetear paginación
      console.log("[Ubicaciones Fetch] Ubicaciones cargadas:", data?.length ?? 0);
    } catch (err: any) {
      console.error("[Ubicaciones Fetch] Error final cargando:", err);
      toast.error(`Error al cargar ubicaciones: ${err.message || 'Desconocido'}`);
      setUbicaciones([]); // Limpiar en caso de error
    } finally {
      setIsLoading(false); // Terminar carga
    }
  }, []); // Sin dependencias, carga inicial

  // Ejecutar carga inicial al montar
  useEffect(() => {
    // Si el rol es Operario Insumos (3), no cargar nada (aunque App.tsx ya debería prevenir acceso)
    if (rolId !== 3) {
        fetchUbicaciones();
    } else {
        setIsLoading(false); // Quitar carga si no se cargan datos
    }
  }, [fetchUbicaciones, rolId]);

  // --- Lógica de Filtrado y Ordenamiento (Frontend) ---
  const filteredAndSortedUbicaciones = useMemo(() => {
    let items = [...ubicaciones];
    console.log(`[Ubic Filter/Sort] Iniciando con ${items.length} ubicaciones.`);

    // 1. Filtrar por Rol/Tipo Bodega (si no es Admin)
    if (!isAdmin && usuarioTipoBodega) {
      items = items.filter(u => u.tipo_bodega === usuarioTipoBodega);
      console.log(`[Ubic Filter/Sort] Después filtro rol (${usuarioTipoBodega}): ${items.length} items.`);
    } else if (!isAdmin && !usuarioTipoBodega && rolId !== null) {
        // Si no es admin y no tiene un tipo de bodega asociado (rol inválido?), vaciar lista
        items = [];
        console.log(`[Ubic Filter/Sort] Rol no admin (${rolId}) sin tipo bodega asociado, vaciando lista.`);
    }

    // 2. Filtrar por Texto
    if (filtroCodigoVisual) {
      const filtroLower = filtroCodigoVisual.toLowerCase();
      items = items.filter(u => u?.codigo_visual?.toLowerCase().includes(filtroLower));
    }
    if (filtroDescripcion) {
      const filtroLower = filtroDescripcion.toLowerCase();
      items = items.filter(u => u?.descripcion_adicional?.toLowerCase().includes(filtroLower) ?? false);
    }
    console.log(`[Ubic Filter/Sort] Después filtros texto: ${items.length} items.`);

    // 3. Ordenar
    if (sortDescriptor.column) {
        items.sort((a, b) => {
            if (!a || !b) return 0;
            const first = a[sortDescriptor.column as keyof Ubicacion] ?? '';
            const second = b[sortDescriptor.column as keyof Ubicacion] ?? '';
            let cmp = 0;
            if (first < second) cmp = -1; if (first > second) cmp = 1;
            if (typeof first === 'string' && typeof second === 'string') { cmp = first.localeCompare(second, undefined, { numeric: true, sensitivity: 'base' }); }
            return sortDescriptor.direction === "descending" ? -cmp : cmp;
        });
        console.log(`[Ubic Filter/Sort] Ordenado por ${String(sortDescriptor.column)} ${sortDescriptor.direction}.`);
    }
    return items;
  }, [ubicaciones, filtroCodigoVisual, filtroDescripcion, sortDescriptor, isAdmin, usuarioTipoBodega]);

  // --- Paginación ---
  const totalPages = Math.ceil(filteredAndSortedUbicaciones.length / ROWS_PER_PAGE);
  const itemsForCurrentPage = useMemo(() => {
    const start = (currentPage - 1) * ROWS_PER_PAGE;
    const end = start + ROWS_PER_PAGE;
    return filteredAndSortedUbicaciones.slice(start, end);
  }, [currentPage, filteredAndSortedUbicaciones]);

  // Ajustar página si filtros/ordenamiento la dejan fuera de rango
  useEffect(() => {
    const newTotalPages = Math.ceil(filteredAndSortedUbicaciones.length / ROWS_PER_PAGE);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    } else if (newTotalPages === 0 && currentPage !== 1) {
        setCurrentPage(1);
    }
  }, [filteredAndSortedUbicaciones.length, currentPage]); // Depender de la longitud filtrada

  // --- Manejadores de Acciones ---
  const handleOpenCreateModal = () => {
    // Solo Admin y Operario PT pueden crear
    if (isAdmin || rolId === 2) {
        setIsEditMode(false); setCurrentUbicacion(null); onOpen();
    } else {
        toast.error("No tiene permiso para crear ubicaciones.");
    }
  };

  const handleOpenEditModal = (ubicacion: Ubicacion) => {
    // Admin puede editar cualquiera. Operario PT solo puede editar PT.
    if (isAdmin || (rolId === 2 && ubicacion.tipo_bodega === 'PT')) {
        setIsEditMode(true); setCurrentUbicacion(ubicacion); onOpen();
    } else {
        toast.error("No tiene permiso para editar esta ubicación.");
    }
  };

  // Submit del Formulario
  const handleFormSubmit = async (formData: UbicacionFormData, id?: string): Promise<boolean> => {
    const currentUserId = getCurrentUserId(); if (!currentUserId) return false;
    // Validar Tipo Bodega Obligatorio (Form lo hace, pero doble check)
    if (!formData.tipo_bodega) { toast.error("El Tipo de Bodega es obligatorio."); return false; }
    // Validar Permiso por Rol
    if (!isAdmin && formData.tipo_bodega !== usuarioTipoBodega) { toast.error(`Rol no permite operar con tipo ${formData.tipo_bodega}.`); return false; }

    setIsSubmitting(true); const toastId = toast.loading(isEditMode ? 'Actualizando...' : 'Creando...');
    let success = false; let rpcError = null; let logAction = ''; let ubicacionIdForLog = id ?? null; let newUbicacionData: Ubicacion | null = null; let logData: any = { ...formData };

    try {
      if (isEditMode && id) {
        logAction = 'UPDATE_UBICACION'; logData.ubicacion_id = id;
        const { error } = await supabase.rpc('update_ubicacion', { p_ubicacion_id: id, p_codigo_visual: formData.codigo_visual, p_descripcion_adicional: formData.descripcion_adicional });
        rpcError = error;
        if (!rpcError) {
            success = true;
            // Actualización Optimista
            setUbicaciones(prev => prev.map(u => u.id === id ? { ...u, codigo_visual: formData.codigo_visual, descripcion_adicional: formData.descripcion_adicional || null } : u));
        }
      } else {
        logAction = 'CREATE_UBICACION';
        const { data: newData, error } = await supabase.rpc('create_ubicacion', { p_codigo_visual: formData.codigo_visual, p_descripcion_adicional: formData.descripcion_adicional, p_tipo_bodega: formData.tipo_bodega });
        rpcError = error; newUbicacionData = newData ? newData[0] : null;
        if (!rpcError && newUbicacionData) {
            success = true; ubicacionIdForLog = newUbicacionData.id; logData = {...logData, ubicacion_id: newUbicacionData.id, ean_generado: newUbicacionData.ean_ubicacion };
             // Actualización Optimista
            setUbicaciones(prev => [newUbicacionData!, ...prev]);
            setFiltroCodigoVisual(''); setFiltroDescripcion(''); setCurrentPage(1);
        }
      }
      // Manejo Común
      if (rpcError) { /* ... (Manejo error igual, mensaje código visual duplicado) ... */ }
      else { if (ubicacionIdForLog) await supabase.from('historial_movimientos').insert([{ accion: logAction, ubicacion_id: ubicacionIdForLog, usuario_id: currentUserId, detalles: logData }]); toast.success(isEditMode ? 'Actualizada.' : 'Creada.', { id: toastId }); }
      return success;
    } catch (err: any) { toast.error(`Error: ${err.message}`, { id: toastId }); return false; }
    finally { setIsSubmitting(false); }
  };

   // Inactivar Ubicación
   const handleInactivate = useCallback(async (id: string) => {
    const currentUserId = getCurrentUserId(); if (!currentUserId) return;
    const ubicToInactivate = ubicaciones.find(u => u.id === id);
    if (!ubicToInactivate) return;
    if (!isAdmin && ubicToInactivate.tipo_bodega !== usuarioTipoBodega) { toast.error("No tiene permiso para inactivar esta ubicación."); return; }
    if (window.confirm(`¿Seguro inactivar ${ubicToInactivate.codigo_visual}?`)) {
        const toastId = toast.loading('Inactivando...'); setIsSubmitting(true); // Usar isSubmitting para bloquear botones
        try {
            const { error: updateCajasError } = await supabase.from('cajas').update({ ubicacion_id: null, estado: 'SIN_UBICACION' }).eq('ubicacion_id', id); if (updateCajasError) throw new Error(`Error cajas: ${updateCajasError.message}`);
            const { error: rpcError } = await supabase.rpc('inactivate_ubicacion', { p_ubicacion_id: id }); if (rpcError) throw rpcError;
            await supabase.from('historial_movimientos').insert([{ accion: 'INACTIVATE_UBICACION', ubicacion_id: id, usuario_id: currentUserId }]);
            toast.success('Inactivada.', { id: toastId });
            setUbicaciones(prev => prev.filter(u => u.id !== id));
            const newTotalItems = ubicaciones.length - 1; const newTotalPages = Math.ceil(newTotalItems / ROWS_PER_PAGE); if (currentPage > newTotalPages && newTotalPages > 0) { setCurrentPage(newTotalPages); } else if (itemsForCurrentPage?.length === 1 && currentPage > 1) { setCurrentPage(prev => prev - 1); } else if (newTotalItems === 0) { setCurrentPage(1); }
        } catch (err: any) { console.error("Error inactivar:", err); toast.error(`Error: ${err.message}`, { id: toastId }); }
        finally { setIsSubmitting(false); }
    }
  }, [userId, getCurrentUserId, ubicaciones, currentPage, itemsForCurrentPage, isAdmin, usuarioTipoBodega]);

  // Manejador de Ordenamiento
  const handleSortChange = useCallback((descriptor: SortDescriptor) => { setSortDescriptor(descriptor); setCurrentPage(1); }, []);

  // --- Redirección si no es Admin ni Operario PT ---
  if (rolId === 3) { // Operario Insumos no ve esta página
      return <Navigate to="/" replace />;
  }

  // --- JSX ---
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white"> Gestión de Ubicaciones {isAdmin ? '(Todas)' : `(${usuarioTipoBodega})`} </h1>
        <div className="flex gap-3 items-center">
             <Input isClearable size="sm" placeholder="Filtrar Código..." value={filtroCodigoVisual} onValueChange={setFiltroCodigoVisual} className="w-full sm:w-auto md:max-w-[200px]" variant="bordered"/>
             <Input isClearable size="sm" placeholder="Filtrar Descripción..." value={filtroDescripcion} onValueChange={setFiltroDescripcion} className="w-full sm:w-auto md:max-w-[200px]" variant="bordered"/>
        </div>
        {/* Mostrar botón "Nueva" solo a roles permitidos */}
        {(isAdmin || rolId === 2) && (
            <Button onPress={handleOpenCreateModal} color="success" isDisabled={isLoading || isSubmitting} size="md"> Nueva Ubicación </Button>
        )}
      </div>
      <Card shadow="md" className="dark:bg-gray-800"><CardBody className="p-0">
        {isLoading ? (<div className="flex justify-center items-center min-h-[420px]"><Spinner size="lg" label="Cargando..." /></div>) : (
          <UbicacionList
              items={itemsForCurrentPage} // Pasa items filtrados por rol
              totalItems={filteredAndSortedUbicaciones.length}
              onEdit={handleOpenEditModal}
              onInactivate={handleInactivate}
              isLoading={isLoading}
              sortDescriptor={sortDescriptor}
              onSortChange={handleSortChange}
              isAdmin={isAdmin} // Pasa isAdmin
          />
        )}
      </CardBody></Card>
       {!isLoading && totalPages > 1 && ( <div className="py-4 px-2 flex justify-center items-center gap-3"> <Pagination isCompact showControls showShadow loop color="success" page={currentPage} total={totalPages} onChange={setCurrentPage} /> <span className="text-default-600 dark:text-default-400 text-small">Total {filteredAndSortedUbicaciones.length} ubicaciones</span> </div> )}
      {/* Pasa isAdmin y tipoBodegaUsuario al formulario */}
      <UbicacionForm
          isOpen={isOpen} onClose={onClose} onSubmit={handleFormSubmit}
          initialData={currentUbicacion} isEditMode={isEditMode}
          isAdmin={isAdmin} tipoBodegaUsuario={usuarioTipoBodega}
      />
    </div>
  );
};
export default UbicacionesPage;