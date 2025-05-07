// src/pages/ReferenciasPage.tsx (FINAL v9 - Completo y Corregido)
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button, Spinner, useDisclosure, Pagination, Card, CardBody, SortDescriptor, Input } from "@heroui/react";
import { supabase } from '../lib/supabaseClient';
import ReferenciaList from '../components/referencias/ReferenciaList';
import ReferenciaForm from '../components/referencias/ReferenciaForm';
import { Referencia, ReferenciaFormData } from '../types';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const ROWS_PER_PAGE = 10;

const ReferenciasPage: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [referencias, setReferencias] = useState<Referencia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentReferencia, setCurrentReferencia] = useState<Referencia | null>(null);
  const { userId } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({ column: "descripcion", direction: "ascending" });
  const [filtroEan, setFiltroEan] = useState('');
  const [filtroDescripcion, setFiltroDescripcion] = useState('');

  const getCurrentUserId = useCallback((): string | null => { if (!userId) { toast.error("Error sesión."); return null; } return userId; }, [userId]);

  const fetchReferencias = useCallback(async () => {
    setIsLoading(true); console.log("Fetching referencias...");
    try {
      const { data, error: rpcError } = await supabase.rpc('get_all_referencias_activas');
      if (rpcError) throw rpcError;
      setReferencias((data as Referencia[] | null) || []);
      setCurrentPage(1);
      console.log("Referencias cargadas:", data?.length ?? 0);
    } catch (err: any) { console.error("Error cargando refs:", err); toast.error(`Error: ${err.message}`); setReferencias([]); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchReferencias(); }, [fetchReferencias]);

  const filteredAndSortedReferencias = useMemo(() => {
    let itemsFiltrados = [...referencias];
    if (filtroEan) { itemsFiltrados = itemsFiltrados.filter(ref => ref.ean_referencia.toLowerCase().includes(filtroEan.toLowerCase())); }
    if (filtroDescripcion) { itemsFiltrados = itemsFiltrados.filter(ref => ref.descripcion.toLowerCase().includes(filtroDescripcion.toLowerCase())); }
    return itemsFiltrados.sort((a, b) => {
      const first = a[sortDescriptor.column as keyof Referencia] ?? '';
      const second = b[sortDescriptor.column as keyof Referencia] ?? '';
      let cmp = 0;
      if (first < second) cmp = -1; if (first > second) cmp = 1;
      if (typeof first === 'string' && typeof second === 'string') { cmp = first.localeCompare(second, undefined, { numeric: true, sensitivity: 'base' }); }
      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [referencias, filtroEan, filtroDescripcion, sortDescriptor]);

  const totalPages = Math.ceil(filteredAndSortedReferencias.length / ROWS_PER_PAGE);
  const itemsForCurrentPage = useMemo(() => {
    const start = (currentPage - 1) * ROWS_PER_PAGE; const end = start + ROWS_PER_PAGE;
    return filteredAndSortedReferencias.slice(start, end);
  }, [currentPage, filteredAndSortedReferencias]);

  useEffect(() => { if (currentPage > totalPages && totalPages > 0) { setCurrentPage(totalPages); } else if (totalPages === 0 && currentPage !== 1) { setCurrentPage(1); } }, [totalPages, currentPage]);

  const handleOpenCreateModal = () => { setIsEditMode(false); setCurrentReferencia(null); onOpen(); };
  const handleOpenEditModal = (referencia: Referencia) => { setIsEditMode(true); setCurrentReferencia(referencia); onOpen(); };

  const handleFormSubmit = async (formData: ReferenciaFormData, id?: string): Promise<boolean> => {
    const currentUserId = getCurrentUserId(); if (!currentUserId) return false;
    setIsSubmitting(true); const toastId = toast.loading(isEditMode ? 'Actualizando...' : 'Creando...');
    let success = false; let rpcError = null; let logAction = ''; let refIdForLog = id ?? null;
    try {
      let logData: any = { ...formData };
      if (isEditMode && id) {
        logAction = 'UPDATE_REFERENCIA'; logData.referencia_id = id;
        const { error } = await supabase.rpc('update_referencia', { p_ref_id: id, p_descripcion: formData.descripcion, p_talla: formData.talla || null, p_color: formData.color || null });
        rpcError = error;
        if (!rpcError) {
            success = true;
            setReferencias(prev => prev.map(ref => ref.id === id ? { ...ref, ...formData, talla: formData.talla || null, color: formData.color || null } : ref));
            await supabase.from('historial_movimientos').insert([{ accion: logAction, referencia_id: refIdForLog, usuario_id: currentUserId, detalles: logData }]);
        }
      } else {
        logAction = 'CREATE_REFERENCIA';
        const { data: newId, error } = await supabase.rpc('create_referencia', { p_ean_referencia: formData.ean_referencia, p_descripcion: formData.descripcion, p_talla: formData.talla || null, p_color: formData.color || null });
        rpcError = error; refIdForLog = newId ?? null;
        if (!rpcError && newId) {
            success = true; logData.referencia_id = newId;
            const nuevaReferencia: Referencia = { id: newId, ean_referencia: formData.ean_referencia, descripcion: formData.descripcion, talla: formData.talla || null, color: formData.color || null };
            setReferencias(prev => [nuevaReferencia, ...prev]);
            setFiltroEan(''); setFiltroDescripcion(''); setCurrentPage(1);
            await supabase.from('historial_movimientos').insert([{ accion: logAction, referencia_id: refIdForLog, usuario_id: currentUserId, detalles: logData }]);
        }
      }
      if (rpcError) { let userMessage = `Error: ${rpcError.message}`; if (rpcError.message.includes('referencias_ean_referencia_key')) { userMessage = 'Error: El EAN ya existe.'; } toast.error(userMessage, { id: toastId }); }
      else { toast.success(isEditMode ? 'Actualizada.' : 'Creada.', { id: toastId }); }
      return success;
    } catch (err: any) { toast.error(`Error: ${err.message}`, { id: toastId }); return false; }
    finally { setIsSubmitting(false); }
  };

  const handleInactivate = useCallback(async (id: string) => {
     const currentUserId = getCurrentUserId(); if (!currentUserId) return;
     if (window.confirm('¿Seguro inactivar?')) {
        const toastId = toast.loading('Inactivando...');
        try {
            const { error: rpcError } = await supabase.rpc('inactivate_referencia', { p_ref_id: id });
             if (rpcError) throw rpcError;
             await supabase.from('historial_movimientos').insert([{ accion: 'INACTIVATE_REFERENCIA', referencia_id: id, usuario_id: currentUserId }]);
            toast.success('Inactivada.', { id: toastId });
            setReferencias(prev => prev.filter(ref => ref.id !== id));
            const newTotalItems = referencias.length - 1; const newTotalPages = Math.ceil(newTotalItems / ROWS_PER_PAGE); if (currentPage > newTotalPages && newTotalPages > 0) { setCurrentPage(newTotalPages); } else if (itemsForCurrentPage?.length === 1 && currentPage > 1) { setCurrentPage(prev => prev - 1); } else if (newTotalItems === 0) { setCurrentPage(1); }
        } catch (err: any) { toast.error(`Error: ${err.message}`, { id: toastId }); }
     }
  }, [userId, getCurrentUserId, referencias.length, currentPage, itemsForCurrentPage?.length]);

   const handleSortChange = useCallback((descriptor: SortDescriptor) => { setSortDescriptor(descriptor); setCurrentPage(1); }, []);

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Gestión de Referencias</h1>
        <div className="flex gap-2 items-center">
             <Input isClearable size="sm" placeholder="Filtrar EAN..." value={filtroEan} onValueChange={setFiltroEan} className="max-w-[200px]" variant="bordered"/>
             <Input isClearable size="sm" placeholder="Filtrar Descripción..." value={filtroDescripcion} onValueChange={setFiltroDescripcion} className="max-w-[200px]" variant="bordered"/>
        </div>
        <Button onPress={handleOpenCreateModal} color="primary" isDisabled={isLoading || isSubmitting}> Nueva Referencia </Button>
      </div>
      <Card className="dark:bg-gray-800"><CardBody>
        {isLoading && referencias.length === 0 ? (<div className="flex justify-center items-center min-h-[420px]"><Spinner label="Cargando..." /></div>) : (
          <ReferenciaList items={itemsForCurrentPage} totalItems={filteredAndSortedReferencias.length} onEdit={handleOpenEditModal} onInactivate={handleInactivate} isLoading={isLoading} sortDescriptor={sortDescriptor} onSortChange={handleSortChange} />
        )}
      </CardBody></Card>
       {!isLoading && totalPages > 1 && ( <div className="py-2 px-2 flex justify-center items-center gap-2 mt-4"> <Pagination isCompact showControls showShadow color="primary" page={currentPage} total={totalPages} onChange={setCurrentPage} /> <span className="text-default-400 text-small">Página {currentPage} de {totalPages} ({filteredAndSortedReferencias.length} total filtrado)</span> </div> )}
      <ReferenciaForm isOpen={isOpen} onClose={onClose} onSubmit={handleFormSubmit} initialData={currentReferencia} isEditMode={isEditMode} />
    </div>
  );
};
export default ReferenciasPage;