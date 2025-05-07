// src/pages/CajasPage.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Button, Spinner, useDisclosure, Modal, ModalContent, ModalHeader, ModalBody,
    Input, ModalFooter, Card, CardBody, Pagination, SortDescriptor,
    Select, SelectItem
} from "@heroui/react";
import { supabase } from '../lib/supabaseClient';
import CajaList from '../components/cajas/CajaList';
import CajaForm from '../components/cajas/CajaForm';
import ContenidoCajaModal from '../components/cajas/ContenidoCajaModal';
// Quitamos NombreRol
import { Caja, Referencia, UbicacionCajaInfo, TipoBodega, EstadoCaja, ClasificacionCalidad, CajaFormData } from '../types';
import { useAuth } from '../contexts/AuthContext';
// CORREGIDO: Quitado useNavigate no usado
import toast from 'react-hot-toast';

const ROWS_PER_PAGE = 10;
const ALL_ESTADOS_CAJA: { key: EstadoCaja | ""; label: string }[] = [
    { key: '', label: 'Todos' },
    { key: 'EN_BODEGA', label: 'En Bodega' },
    { key: 'SIN_UBICACION', label: 'Sin Ubicación' },
    { key: 'DESPACHADA', label: 'Despachada' },
];

const CajasPage: React.FC = () => {
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isContentOpen, onOpen: onContentOpen, onClose: onContentClose } = useDisclosure();
  const { isOpen: isUbicarOpen, onOpen: onUbicarOpen, onClose: onUbicarClose } = useDisclosure();
  const [cajas, setCajas] = useState<(Caja & { ubicacion_info?: UbicacionCajaInfo | undefined })[]>([]);
  const [referenciasActivas, setReferenciasActivas] = useState<Referencia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentCaja, setCurrentCaja] = useState<Caja | null>(null);
  const [eanUbicacionScan, setEanUbicacionScan] = useState('');
  const [isUbicando, setIsUbicando] = useState(false);
  const [ubicarError, setUbicarError] = useState<string|null>(null);
  const [filtroEanCaja, setFiltroEanCaja] = useState('');
  const [filtroUbicacion, setFiltroUbicacion] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({ column: "created_at", direction: "descending" });
  const { userId, rolId } = useAuth();

  const isAdmin = useMemo(() => rolId === 1, [rolId]);
  const isOperarioPT = useMemo(() => rolId === 2, [rolId]);
  const isOperarioInsumos = useMemo(() => rolId === 3, [rolId]);
  const usuarioTipoBodega = useMemo((): TipoBodega | null => { if (isAdmin) return null; if (isOperarioPT) return 'PT'; if (isOperarioInsumos) return 'INSUMOS'; return null; }, [rolId, isAdmin, isOperarioPT, isOperarioInsumos]);
  const getCurrentUserId = useCallback((): string | null => { if (!userId) { toast.error("Error sesión."); return null; } return userId; }, [userId]);

  const fetchCajasConUbicacion = useCallback(async () => { setIsLoading(true); try { const { data, error: selectError } = await supabase .from('cajas') .select(` id, ean_caja, estado, activo, created_at, updated_at, ubicacion_id, tipo_bodega, clasificacion_calidad, ubicaciones ( id, codigo_visual, ean_ubicacion, activo ) `) .eq('activo', true); if (selectError) throw selectError; const mappedData = (data || []).map(c => { let ui: UbicacionCajaInfo | undefined = undefined; const ubicacionData = c.ubicaciones && !Array.isArray(c.ubicaciones) ? c.ubicaciones : (Array.isArray(c.ubicaciones) && c.ubicaciones.length > 0 ? c.ubicaciones[0] : null); if (ubicacionData) { if (ubicacionData.activo) { ui = { codigo_visual_ubicacion: ubicacionData.codigo_visual, ean_ubicacion: ubicacionData.ean_ubicacion }; } else { ui = { codigo_visual_ubicacion: `(${ubicacionData.codigo_visual} - INACTIVA)`, ean_ubicacion: ubicacionData.ean_ubicacion }; } } else if (c.estado === 'DESPACHADA') { ui = { codigo_visual_ubicacion: 'Despachada', ean_ubicacion: null }; } return { ...c, ubicacion_info: ui }; }); setCajas(mappedData as (Caja & { ubicacion_info?: UbicacionCajaInfo | undefined })[]); setCurrentPage(1); } catch (err: any) { toast.error(`Error cargando cajas: ${err.message}`); setCajas([]); } finally { setIsLoading(false); } }, []);
  const fetchReferenciasActivas = useCallback(async () => { try { const { data, error } = await supabase.rpc('get_all_referencias_activas'); if (error) throw error; setReferenciasActivas((data as Referencia[] | null) || []); } catch (err: any) { console.error("Error fetch refs:", err); } }, []);
  useEffect(() => { fetchCajasConUbicacion(); fetchReferenciasActivas(); }, [fetchCajasConUbicacion, fetchReferenciasActivas]);

  const filteredAndSortedCajas = useMemo(() => { if (isLoading || !cajas) return []; let items = [...cajas]; try { if (!isAdmin) { if (isOperarioPT) { items = items.filter(c => c.tipo_bodega === 'PT'); } else if (isOperarioInsumos) { items = items.filter(c => c.tipo_bodega === 'INSUMOS'); } else { items = []; } } if (filtroEanCaja) { items = items.filter(c => c?.ean_caja?.toLowerCase().includes(filtroEanCaja.toLowerCase())); } if (filtroUbicacion && !isOperarioInsumos) { const fl = filtroUbicacion.toLowerCase(); items = items.filter(c => c?.ubicacion_info?.codigo_visual_ubicacion?.toLowerCase().includes(fl) ?? (fl.includes("sin ubicacion") && !c?.ubicacion_info?.codigo_visual_ubicacion && c?.estado !== 'DESPACHADA')); } if (filtroEstado) { items = items.filter(c => c?.estado === filtroEstado); } return items.sort((a, b) => { if (!a || !b) return 0; let f: any; let s: any; const col = sortDescriptor.column as keyof Caja | 'ubicacion_actual' | 'clasificacion_calidad'; if (col === 'ubicacion_actual') { f = a.ubicacion_info?.codigo_visual_ubicacion ?? 'zzz'; s = b.ubicacion_info?.codigo_visual_ubicacion ?? 'zzz'; } else { f = a[col as keyof Caja] ?? ''; s = b[col as keyof Caja] ?? ''; } let cmp = 0; if (f < s) cmp = -1; if (f > s) cmp = 1; if (col === 'clasificacion_calidad') { const order = { 'P': 1, 'SS': 2, 'SP': 3 }; cmp = (order[f as ClasificacionCalidad] ?? 4) - (order[s as ClasificacionCalidad] ?? 4); } else if (typeof f === 'string' && typeof s === 'string') { cmp = f.localeCompare(s, undefined, { numeric: true, sensitivity: 'base' }); } else if ((col === 'created_at' || col === 'updated_at') && a[col] && b[col]) { cmp = new Date(b[col]!).getTime() - new Date(a[col]!).getTime();} return sortDescriptor.direction === "descending" ? cmp : -cmp; }); } catch (filterSortError) { console.error("Error filtro/sort cajas:", filterSortError); return []; } }, [cajas, filtroEanCaja, filtroUbicacion, filtroEstado, sortDescriptor, isAdmin, isOperarioPT, isOperarioInsumos, isLoading]);

  const totalPages = Math.ceil(filteredAndSortedCajas.length / ROWS_PER_PAGE);
  const itemsForCurrentPage = useMemo(() => { const start = (currentPage - 1) * ROWS_PER_PAGE; const end = start + ROWS_PER_PAGE; return filteredAndSortedCajas.slice(start, end); }, [currentPage, filteredAndSortedCajas]);
  useEffect(() => { if (currentPage > totalPages && totalPages > 0) { setCurrentPage(totalPages); } else if (totalPages === 0 && currentPage !== 1) { setCurrentPage(1); } }, [totalPages, currentPage]);

  const handleCreateCajaSubmit = async (formData: CajaFormData): Promise<{ id: string; ean_caja: string; tipo_bodega: TipoBodega | null; estado: EstadoCaja; clasificacion_calidad: ClasificacionCalidad | null } | null> => { const currentUserId = getCurrentUserId(); if (!currentUserId || !formData.tipo_bodega || (!isAdmin && !isOperarioPT) || (isOperarioPT && formData.tipo_bodega !== 'PT')) { toast.error("Error o permiso denegado."); return null;} const toastId = toast.loading('Creando...'); let newCajaData: any = null; try { const { data, error } = await supabase.rpc('create_caja', { p_tipo_bodega: formData.tipo_bodega, p_clasificacion_calidad: formData.clasificacion_calidad }); if (error) throw error; newCajaData = data ? data[0] : null; if (newCajaData?.id && newCajaData?.ean_caja && newCajaData?.estado) { await supabase.from('historial_movimientos').insert([{ accion: 'CREATE_CAJA', caja_id: newCajaData.id, usuario_id: currentUserId, detalles: {ean: newCajaData.ean_caja, tipo: newCajaData.tipo_bodega, estado: newCajaData.estado, calidad: newCajaData.clasificacion_calidad} }]); toast.success('Caja creada.', { id: toastId }); const cajaToAdd: Caja & { ubicacion_info?: UbicacionCajaInfo | undefined } = { id: newCajaData.id, ean_caja: newCajaData.ean_caja, estado: newCajaData.estado, tipo_bodega: newCajaData.tipo_bodega, clasificacion_calidad: newCajaData.clasificacion_calidad, activo: true, created_at: new Date().toISOString(), ubicacion_id: null, ubicacion_info: undefined }; setCajas((prev: (Caja & { ubicacion_info?: UbicacionCajaInfo | undefined })[]) => [cajaToAdd, ...prev]); setCurrentPage(1); setFiltroEanCaja(''); setFiltroEstado(''); setFiltroUbicacion(''); onCreateClose(); } else { toast.error('Respuesta inválida al crear.', { id: toastId }); newCajaData = null; } } catch (err: any) { toast.error(`Error: ${err.message}`, { id: toastId }); newCajaData = null; } return newCajaData ? { id: newCajaData.id, ean_caja: newCajaData.ean_caja, tipo_bodega: newCajaData.tipo_bodega, estado: newCajaData.estado, clasificacion_calidad: newCajaData.clasificacion_calidad } : null; };
  const handleOpenEditContentModal = (caja: Caja) => { const puede = !caja.estado.startsWith('DESPACHADA') && (isAdmin || (isOperarioPT && caja.tipo_bodega === 'PT') || (isOperarioInsumos && caja.tipo_bodega === 'INSUMOS')); if (puede) { setCurrentCaja(caja); onContentOpen(); } else { toast.error("Permiso denegado."); } };
  const handleOpenViewContentModal = (caja: Caja) => { setCurrentCaja(caja); onContentOpen(); };
  const handleOpenUbicarModal = (caja: Caja) => { if (caja.estado === 'DESPACHADA') { toast.error("Caja despachada no se puede ubicar."); return; } if (isAdmin || (isOperarioPT && caja.tipo_bodega === 'PT')) { setCurrentCaja(caja); setEanUbicacionScan(''); setUbicarError(null); onUbicarOpen(); } else { toast.error("Permiso denegado para ubicar esta caja."); } };
  const handleUbicarSubmit = async () => { const cId = getCurrentUserId(); if (!currentCaja || !eanUbicacionScan || !cId) { setUbicarError("Falta info."); return; } setUbicarError(null); setIsUbicando(true); const tId = toast.loading('Ubicando...'); try { const { data: rT, error: rE } = await supabase.rpc('ubicar_caja_por_ean', { p_ean_caja_scan: currentCaja.ean_caja, p_ean_ubicacion_scan: eanUbicacionScan, p_usuario_id: cId }); if (rE || (rT && typeof rT === 'string' && rT.startsWith('Error'))) { throw rE || new Error(rT || 'Err'); } toast.success(rT || 'OK', { id: tId }); await fetchCajasConUbicacion(); onUbicarClose(); } catch (e: any) { toast.error(`Error: ${e.message}`, { id: tId }); setUbicarError(`Error: ${e.message}`); } finally { setIsUbicando(false); } };
  const handleDespachar = useCallback(async (caja: Caja) => { const cId = getCurrentUserId(); if (!cId || (!isAdmin && !isOperarioPT) || caja.tipo_bodega !== 'PT' || caja.estado === 'DESPACHADA') { toast.error("Acción no permitida."); return; } if (window.confirm(`Marcar ${caja.ean_caja} DESPACHADA?`)) { const tId = toast.loading('...'); setIsSubmitting(true); try { const { data: rT, error: rE } = await supabase.rpc('marcar_caja_despachada', { p_ean_caja: caja.ean_caja, p_usuario_id: cId }); if (rE || (rT && typeof rT === 'string' && rT.startsWith('Error'))) { throw rE || new Error(rT || 'Err'); } toast.success(rT || 'OK', { id: tId }); setCajas((p: (Caja & { ubicacion_info?: UbicacionCajaInfo | undefined })[]) => p.map(c => c.id === caja.id ? {...c, estado: 'DESPACHADA', ubicacion_id: null, ubicacion_info: undefined } : c)); } catch (e: any) { toast.error(`Error: ${e.message}`, { id: tId }); } finally { setIsSubmitting(false); } } }, [userId, getCurrentUserId, cajas, isAdmin, isOperarioPT]);
  const handleInactivateCaja = useCallback(async (caja: Caja) => { const cId = getCurrentUserId(); if (!cId || !isAdmin) { toast.error("Permiso denegado."); return; } if (caja.estado === 'DESPACHADA') { toast.error("No se puede inactivar caja despachada."); return; } if (window.confirm(`¿Inactivar caja ${caja.ean_caja}?`)) { const tId = toast.loading('...'); setIsSubmitting(true); try { const { error } = await supabase.from('cajas').update({ activo: false }).eq('id', caja.id); if (error) throw error; await supabase.from('historial_movimientos').insert([{ accion: 'INACTIVATE_CAJA', caja_id: caja.id, usuario_id: cId }]); toast.success('Inactivada.', { id: tId }); setCajas(p => p.filter(c => c.id !== caja.id)); } catch (err: any) { toast.error(`Error: ${err.message}`, { id: tId }); } finally { setIsSubmitting(false); } } }, [userId, getCurrentUserId, isAdmin, cajas]);

  const handleSortChange = useCallback((d: SortDescriptor) => { setSortDescriptor(d); setCurrentPage(1); }, []);
  const handleEstadoFilterChange = useCallback((keys: Set<React.Key> | React.Key) => { let selectedKeyString = ''; if (keys instanceof Set) { selectedKeyString = Array.from(keys)[0]?.toString() || ''; } else if (keys){ selectedKeyString = keys.toString(); } setFiltroEstado(selectedKeyString); setCurrentPage(1); }, []);
  const isContentReadOnly = useMemo(() => { if (!currentCaja) return false; if (currentCaja.estado === 'DESPACHADA') return true; if (isOperarioPT && currentCaja.tipo_bodega !== 'PT') return true; if (isOperarioInsumos && currentCaja.tipo_bodega !== 'INSUMOS') return true; return false; }, [currentCaja, isOperarioPT, isOperarioInsumos]);
  const availableEstadoOptionsData = useMemo(() => { if (isAdmin || isOperarioPT) return ALL_ESTADOS_CAJA; if (isOperarioInsumos) return [ { key: '', label: 'Todos (Insumos)' }, { key: 'EN_BODEGA', label: 'En Bodega' }, { key: 'SIN_UBICACION', label: 'Sin Ubicación' } ]; return [{ key: '', label: 'Todos' }]; }, [isAdmin, isOperarioPT, isOperarioInsumos]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white"> Gestión de Cajas {isAdmin ? '(Todas)' : usuarioTipoBodega === 'PT' ? '(Prod. Terminado)' : '(Insumos)'} </h1>
        <div className="flex flex-wrap gap-3 items-center">
             <Input isClearable size="sm" placeholder="Filtrar EAN Caja..." value={filtroEanCaja} onValueChange={setFiltroEanCaja} className="w-full sm:w-auto md:min-w-[180px]" variant="bordered"/>
             {!isOperarioInsumos && (<Input isClearable size="sm" placeholder="Filtrar Ubicación..." value={filtroUbicacion} onValueChange={setFiltroUbicacion} className="w-full sm:w-auto md:min-w-[180px]" variant="bordered"/>)}
             <Select items={availableEstadoOptionsData} label="Estado" placeholder="Todos" size="sm" variant="bordered" selectedKeys={filtroEstado ? new Set([filtroEstado]) : new Set([''])} onSelectionChange={handleEstadoFilterChange} className="w-full sm:w-auto md:min-w-[200px]">
                 {(item) => ( <SelectItem key={item.key} textValue={item.label}> {item.label} </SelectItem> )}
            </Select>
        </div>
        {(isAdmin || isOperarioPT) && (<Button onPress={onCreateOpen} color="warning" isDisabled={isLoading || isSubmitting} size="md"> Nueva Caja </Button>)}
      </div>
      <Card shadow="md" className="dark:bg-gray-800"><CardBody className="p-0">
          {isLoading ? (<div className="flex justify-center items-center min-h-[420px]"><Spinner size="lg" label="Cargando..." /></div>) : (
              <CajaList items={itemsForCurrentPage} totalItems={filteredAndSortedCajas.length} onEditContenido={handleOpenEditContentModal} onViewContenido={handleOpenViewContentModal} onUbicar={handleOpenUbicarModal} onDespachar={handleDespachar} onInactivateCaja={handleInactivateCaja} isLoading={isLoading} sortDescriptor={sortDescriptor} onSortChange={handleSortChange} isAdmin={isAdmin} isOperarioPT={isOperarioPT} isOperarioInsumos={isOperarioInsumos} />
          )}
      </CardBody></Card>
       {!isLoading && totalPages > 1 && ( <div className="py-4 px-2 flex justify-center items-center gap-3"> <Pagination isCompact showControls showShadow loop color="warning" page={currentPage} total={totalPages} onChange={setCurrentPage} /> <span className="text-default-600 dark:text-default-400 text-small">Total {filteredAndSortedCajas.length} cajas</span> </div> )}
      <CajaForm isOpen={isCreateOpen} onClose={onCreateClose} onSubmit={handleCreateCajaSubmit} tipoBodegaUsuario={usuarioTipoBodega} isAdmin={isAdmin} />
      <ContenidoCajaModal isOpen={isContentOpen} onClose={onContentClose} caja={currentCaja} referenciasActivas={referenciasActivas} readOnly={isContentReadOnly} />
      <Modal isOpen={isUbicarOpen} onOpenChange={onUbicarClose} placement="top-center">
        <ModalContent className="dark:bg-gray-800">
            {(modalClose) => (<>
              <ModalHeader className="dark:text-white">Ubicar Caja: {currentCaja?.ean_caja}</ModalHeader>
              <ModalBody>
                <p className="dark:text-gray-300">Escanee EAN-13 ubicación destino.</p>
                <Input autoFocus label="EAN Ubicación Destino" value={eanUbicacionScan} onValueChange={setEanUbicacionScan} isDisabled={isUbicando} variant='bordered'/>
                {ubicarError && <p className="text-danger text-small mt-2">{ubicarError}</p>}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onPress={modalClose} isDisabled={isUbicando}> Cancelar </Button>
                <Button color="primary" onPress={handleUbicarSubmit} isLoading={isUbicando}> Ubicar Caja </Button>
              </ModalFooter>
            </>)}
        </ModalContent>
      </Modal>
    </div>
  );
};
export default CajasPage;