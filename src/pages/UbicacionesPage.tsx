// src/pages/UbicacionesPage.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Button, Spinner, useDisclosure, Input, Card, CardBody, // Quitados CardHeader, Select, SelectItem
    Pagination, SortDescriptor
} from "@heroui/react";
import { supabase } from '../lib/supabaseClient';
import UbicacionList from '../components/ubicaciones/UbicacionList';
import UbicacionForm from '../components/ubicaciones/UbicacionForm';
import { Ubicacion, TipoBodega, UbicacionFormData } from '../types';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Navigate } from 'react-router-dom';

// Quitado delay no usado
const ROWS_PER_PAGE = 10;

const UbicacionesPage: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentUbicacion, setCurrentUbicacion] = useState<Ubicacion | null>(null);
  const { userId, rolId } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [filtroCodigoVisual, setFiltroCodigoVisual] = useState('');
  const [filtroDescripcion, setFiltroDescripcion] = useState('');
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
    column: "codigo_visual",
    direction: "ascending",
  });

  const isAdmin = useMemo(() => rolId === 1, [rolId]);
  const usuarioTipoBodega = useMemo((): TipoBodega | null => { if (isAdmin) return null; if (rolId === 2) return 'PT'; if (rolId === 3) return null; return null; }, [rolId, isAdmin]);

  const getCurrentUserId = useCallback((): string | null => { if (!userId) { toast.error("Error de sesión."); return null; } return userId; }, [userId]);

  const fetchUbicaciones = useCallback(async () => { setIsLoading(true); try { const { data, error: rpcError } = await supabase.rpc('get_all_ubicaciones_activas'); if (rpcError) { throw rpcError; } setUbicaciones((data as Ubicacion[] | null) || []); setCurrentPage(1); } catch (err: any) { toast.error(`Error al cargar ubicaciones: ${err.message || 'Desconocido'}`); setUbicaciones([]); } finally { setIsLoading(false); } }, []);

  useEffect(() => { if (rolId !== 3) { fetchUbicaciones(); } else { setIsLoading(false); } }, [fetchUbicaciones, rolId]);

  const filteredAndSortedUbicaciones = useMemo(() => { let items = [...ubicaciones]; if (!isAdmin && usuarioTipoBodega) { items = items.filter(u => u.tipo_bodega === usuarioTipoBodega); } else if (!isAdmin && !usuarioTipoBodega && rolId !== null) { items = []; } if (filtroCodigoVisual) { const filtroLower = filtroCodigoVisual.toLowerCase(); items = items.filter(u => u?.codigo_visual?.toLowerCase().includes(filtroLower)); } if (filtroDescripcion) { const filtroLower = filtroDescripcion.toLowerCase(); items = items.filter(u => u?.descripcion_adicional?.toLowerCase().includes(filtroLower) ?? false); } if (sortDescriptor.column) { items.sort((a, b) => { if (!a || !b) return 0; const first = a[sortDescriptor.column as keyof Ubicacion] ?? ''; const second = b[sortDescriptor.column as keyof Ubicacion] ?? ''; let cmp = 0; if (first < second) cmp = -1; if (first > second) cmp = 1; if (typeof first === 'string' && typeof second === 'string') { cmp = first.localeCompare(second, undefined, { numeric: true, sensitivity: 'base' }); } return sortDescriptor.direction === "descending" ? -cmp : cmp; }); } return items; }, [ubicaciones, filtroCodigoVisual, filtroDescripcion, sortDescriptor, isAdmin, usuarioTipoBodega, rolId]);

  const totalPages = Math.ceil(filteredAndSortedUbicaciones.length / ROWS_PER_PAGE);
  const itemsForCurrentPage = useMemo(() => { const start = (currentPage - 1) * ROWS_PER_PAGE; const end = start + ROWS_PER_PAGE; return filteredAndSortedUbicaciones.slice(start, end); }, [currentPage, filteredAndSortedUbicaciones]);

  useEffect(() => { const newTotalPages = Math.ceil(filteredAndSortedUbicaciones.length / ROWS_PER_PAGE); if (currentPage > newTotalPages && newTotalPages > 0) { setCurrentPage(newTotalPages); } else if (newTotalPages === 0 && currentPage !== 1) { setCurrentPage(1); } }, [filteredAndSortedUbicaciones.length, currentPage]);

  const handleOpenCreateModal = () => { if (isAdmin || rolId === 2) { setIsEditMode(false); setCurrentUbicacion(null); onOpen(); } else { toast.error("No tiene permiso para crear ubicaciones."); } };
  const handleOpenEditModal = (ubicacion: Ubicacion) => { if (isAdmin || (rolId === 2 && ubicacion.tipo_bodega === 'PT')) { setIsEditMode(true); setCurrentUbicacion(ubicacion); onOpen(); } else { toast.error("No tiene permiso para editar esta ubicación."); } };

  const handleFormSubmit = async (formData: UbicacionFormData, id?: string): Promise<boolean> => { const currentUserId = getCurrentUserId(); if (!currentUserId) return false; if (!formData.tipo_bodega) { toast.error("El Tipo de Bodega es obligatorio."); return false; } if (!isAdmin && formData.tipo_bodega !== usuarioTipoBodega) { toast.error(`Rol no permite operar con tipo ${formData.tipo_bodega}.`); return false; } setIsSubmitting(true); const toastId = toast.loading(isEditMode ? 'Actualizando...' : 'Creando...'); let success = false; let rpcError = null; let logAction = ''; let ubicacionIdForLog = id ?? null; let newUbicacionData: Ubicacion | null = null; let logData: any = { ...formData }; try { if (isEditMode && id) { logAction = 'UPDATE_UBICACION'; logData.ubicacion_id = id; const { error } = await supabase.rpc('update_ubicacion', { p_ubicacion_id: id, p_codigo_visual: formData.codigo_visual, p_descripcion_adicional: formData.descripcion_adicional }); rpcError = error; if (!rpcError) { success = true; setUbicaciones(prev => prev.map(u => u.id === id ? { ...u, codigo_visual: formData.codigo_visual, descripcion_adicional: formData.descripcion_adicional || null } : u)); } } else { logAction = 'CREATE_UBICACION'; const { data: newData, error } = await supabase.rpc('create_ubicacion', { p_codigo_visual: formData.codigo_visual, p_descripcion_adicional: formData.descripcion_adicional, p_tipo_bodega: formData.tipo_bodega }); rpcError = error; newUbicacionData = newData ? newData[0] : null; if (!rpcError && newUbicacionData) { success = true; ubicacionIdForLog = newUbicacionData.id; logData = {...logData, ubicacion_id: newUbicacionData.id, ean_generado: newUbicacionData.ean_ubicacion }; setUbicaciones(prev => [newUbicacionData!, ...prev]); setFiltroCodigoVisual(''); setFiltroDescripcion(''); setCurrentPage(1); } } if (rpcError) { let userMessage = `Error: ${rpcError.message}`; if (rpcError.message.includes('ubicaciones_codigo_visual_tipo_bodega_key') || rpcError.message.includes('ubicaciones_codigo_visual_key')) { userMessage = 'Error: Código Visual ya existe para este Tipo Bodega.'; } else if (rpcError.message.includes('ubicaciones_ean_ubicacion_key')) { userMessage = 'Error: EAN generado ya existe (Error interno).'; } toast.error(userMessage, { id: toastId }); } else { if (ubicacionIdForLog) await supabase.from('historial_movimientos').insert([{ accion: logAction, ubicacion_id: ubicacionIdForLog, usuario_id: currentUserId, detalles: logData }]); toast.success(isEditMode ? 'Actualizada.' : 'Creada.', { id: toastId }); } return success; } catch (err: any) { toast.error(`Error: ${err.message}`, { id: toastId }); return false; } finally { setIsSubmitting(false); } };

  const handleInactivate = useCallback(async (id: string) => { const currentUserId = getCurrentUserId(); if (!currentUserId) return; const ubicToInactivate = ubicaciones.find(u => u.id === id); if (!ubicToInactivate) return; if (!isAdmin && ubicToInactivate.tipo_bodega !== usuarioTipoBodega) { toast.error("No tiene permiso para inactivar esta ubicación."); return; } if (window.confirm(`¿Seguro inactivar ${ubicToInactivate.codigo_visual}?`)) { const toastId = toast.loading('Inactivando...'); setIsSubmitting(true); try { const { error: updateCajasError } = await supabase.from('cajas').update({ ubicacion_id: null, estado: 'SIN_UBICACION' }).eq('ubicacion_id', id); if (updateCajasError) throw new Error(`Error cajas: ${updateCajasError.message}`); const { error: rpcError } = await supabase.rpc('inactivate_ubicacion', { p_ubicacion_id: id }); if (rpcError) throw rpcError; await supabase.from('historial_movimientos').insert([{ accion: 'INACTIVATE_UBICACION', ubicacion_id: id, usuario_id: currentUserId }]); toast.success('Inactivada.', { id: toastId }); setUbicaciones(prev => prev.filter(u => u.id !== id)); const newTotalItems = ubicaciones.length - 1; const newTotalPages = Math.ceil(newTotalItems / ROWS_PER_PAGE); if (currentPage > newTotalPages && newTotalPages > 0) { setCurrentPage(newTotalPages); } else if (itemsForCurrentPage?.length === 1 && currentPage > 1) { setCurrentPage(prev => prev - 1); } else if (newTotalItems === 0) { setCurrentPage(1); } } catch (err: any) { console.error("Error inactivar:", err); toast.error(`Error: ${err.message}`, { id: toastId }); } finally { setIsSubmitting(false); } } }, [userId, getCurrentUserId, ubicaciones, currentPage, itemsForCurrentPage, isAdmin, usuarioTipoBodega]);

  const handleSortChange = useCallback((descriptor: SortDescriptor) => { setSortDescriptor(descriptor); setCurrentPage(1); }, []);

  if (rolId === 3) { return <Navigate to="/" replace />; }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white"> Gestión de Ubicaciones {isAdmin ? '(Todas)' : `(${usuarioTipoBodega})`} </h1>
        <div className="flex gap-3 items-center">
             <Input isClearable size="sm" placeholder="Filtrar Código..." value={filtroCodigoVisual} onValueChange={setFiltroCodigoVisual} className="w-full sm:w-auto md:max-w-[200px]" variant="bordered"/>
             <Input isClearable size="sm" placeholder="Filtrar Descripción..." value={filtroDescripcion} onValueChange={setFiltroDescripcion} className="w-full sm:w-auto md:max-w-[200px]" variant="bordered"/>
        </div>
        {(isAdmin || rolId === 2) && ( <Button onPress={handleOpenCreateModal} color="success" isDisabled={isLoading || isSubmitting} size="md"> Nueva Ubicación </Button> )}
      </div>
      <Card shadow="md" className="dark:bg-gray-800"><CardBody className="p-0">
        {isLoading ? (<div className="flex justify-center items-center min-h-[420px]"><Spinner size="lg" label="Cargando..." /></div>) : (
          <UbicacionList
              items={itemsForCurrentPage}
              totalItems={filteredAndSortedUbicaciones.length}
              onEdit={handleOpenEditModal}
              onInactivate={handleInactivate}
              isLoading={isLoading}
              sortDescriptor={sortDescriptor}
              onSortChange={handleSortChange}
              // CORREGIDO: Eliminada la prop isAdmin
          />
        )}
      </CardBody></Card>
       {!isLoading && totalPages > 1 && ( <div className="py-4 px-2 flex justify-center items-center gap-3"> <Pagination isCompact showControls showShadow loop color="success" page={currentPage} total={totalPages} onChange={setCurrentPage} /> <span className="text-default-600 dark:text-default-400 text-small">Total {filteredAndSortedUbicaciones.length} ubicaciones</span> </div> )}
      <UbicacionForm
          isOpen={isOpen} onClose={onClose} onSubmit={handleFormSubmit}
          initialData={currentUbicacion} isEditMode={isEditMode}
          isAdmin={isAdmin} tipoBodegaUsuario={usuarioTipoBodega}
      />
    </div>
  );
};
export default UbicacionesPage;