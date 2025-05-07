// src/components/cajas/ContenidoCajaModal.tsx
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button,
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  Input, Autocomplete, AutocompleteItem, Spinner, Tooltip, Chip,
  Switch, Select, SelectItem
} from "@heroui/react";
import { supabase } from '../../lib/supabaseClient'; // Ajusta ruta
import {
    Referencia, ContenidoCajaDetallado, Caja, // Quitados TipoBodega, EstadoCaja
    ClasificacionCalidad, AgregarContarResult, RestarItemResult
} from '../../types'; // Ajusta ruta
import { DeleteIcon } from '../icons/DeleteIcon';   // Ajusta ruta
import { BarcodeIcon } from '../icons/BarcodeIcon'; // Ajusta ruta
import { ManualIcon } from '../icons/ManualIcon';   // Ajusta ruta
import { MinusCircleIcon } from '../icons/MinusCircleIcon'; // Ajusta ruta
import { useAuth } from '../../contexts/AuthContext'; // Ajusta ruta
// Quitados imports no usados de react-hot-toast
import toast from 'react-hot-toast';

// Helper delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Props del componente
interface ContenidoCajaModalProps {
  isOpen: boolean;
  onClose: () => void;
  caja: Caja | null;
  referenciasActivas: Referencia[];
  readOnly?: boolean;
}

// Columnas para la tabla de contenido
const columns = [
    { key: "ean_referencia", label: "EAN REF" },
    { key: "descripcion", label: "DESCRIPCIÓN" },
    { key: "talla", label: "TALLA" },
    { key: "color", label: "COLOR" },
    { key: "cantidad", label: "CANT" },
    { key: "actions", label: "QUITAR" },
];

// Opciones Select Calidad (datos para la prop 'items')
const clasificacionOptionsData: { key: ClasificacionCalidad | ""; label: string }[] = [
    { key: "", label: 'Ninguna' },
    { key: 'P', label: 'P - Primera' },
    { key: 'SS', label: 'SS - Segunda' }, // Corregido nombre
    { key: 'SP', label: 'SP - Subproducto' },
];


// --- Componente Funcional ---
const ContenidoCajaModal: React.FC<ContenidoCajaModalProps> = ({
  isOpen,
  onClose,
  caja,
  referenciasActivas,
  readOnly = false
}) => {
  // --- Estados ---
  const [contenido, setContenido] = useState<ContenidoCajaDetallado[]>([]);
  const [isLoadingContenido, setIsLoadingContenido] = useState(false);
  // Modo Manual
  const [manualInputValue, setManualInputValue] = useState('');
  const [selectedReferenciaEan, setSelectedReferenciaEan] = useState<string | null>(null); // Mantenido como string | null
  const [newCantidad, setNewCantidad] = useState<string>('1');
  // Modo Escaneo
  const [scanInputValue, setScanInputValue] = useState('');
  const [lastScanResult, setLastScanResult] = useState<{ message: string, isError: boolean } | null>(null);
  const scanInputRef = useRef<HTMLInputElement>(null);
  // Modo General
  const [isManualMode, setIsManualMode] = useState(true);
  // Estados de Carga Específicos
  const [isAddingManual, setIsAddingManual] = useState(false);
  const [isProcessingScan, setIsProcessingScan] = useState(false);
  const [isProcessingRestar, setIsProcessingRestar] = useState(false);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const [isSavingQuality, setIsSavingQuality] = useState(false);
  // Calidad (Admin)
  const [selectedCalidad, setSelectedCalidad] = useState<string>(''); // Estado para el Select (string '' o key)
  // Auth
  const { userId, rolId } = useAuth();
  const isAdmin = useMemo(() => rolId === 1, [rolId]);

  // Determinar si alguna acción está en progreso general
  const isActionLoading = isAddingManual || isProcessingScan || isProcessingRestar || isSavingQuality || isRemoving !== null;

  // --- Helper Functions ---
  const getCurrentUserId = useCallback((): string | null => { if (!userId) { toast.error("Error sesión."); return null; } return userId; }, [userId]);

  // --- Carga de Datos ---
  const fetchContenido = useCallback(async () => { if (!caja?.ean_caja) { setContenido([]); return; }; setIsLoadingContenido(true); try { const { data, error } = await supabase.rpc('get_contenido_por_ean_caja', { p_ean_caja: caja.ean_caja }); if (error) throw error; setContenido((data as ContenidoCajaDetallado[] | null) || []); } catch (err: any) { toast.error(`Error cargando: ${err.message}`); setContenido([]); } finally { setIsLoadingContenido(false); } }, [caja]);
  useEffect(() => { if (isOpen && caja) { fetchContenido(); setSelectedReferenciaEan(null); setNewCantidad('1'); setScanInputValue(''); setLastScanResult(null); setIsAddingManual(false); setIsProcessingScan(false); setIsProcessingRestar(false); setIsRemoving(null); setIsSavingQuality(false); setSelectedCalidad(caja.clasificacion_calidad ?? ''); setManualInputValue(''); if (!isManualMode) { setTimeout(() => scanInputRef.current?.focus(), 100); } } }, [isOpen, caja, fetchContenido, isManualMode]);

  // --- Lógica Autocomplete Filtrado ---
  const filteredReferencias = useMemo(() => { if (!manualInputValue) return referenciasActivas; const lowerInput = manualInputValue.toLowerCase().trim(); if (lowerInput.length < 1) return referenciasActivas; return referenciasActivas.filter(ref => ref.ean_referencia.toLowerCase().includes(lowerInput) || ref.descripcion.toLowerCase().includes(lowerInput)); }, [referenciasActivas, manualInputValue]);

  // --- Manejadores de Eventos ---

  // Submit Modo Manual
  const handleAddOrUpdateItemManual = useCallback(async () => { if (readOnly) return; const currentUserId = getCurrentUserId(); if (!caja || !selectedReferenciaEan || !currentUserId) { toast.error("Seleccione referencia."); return; } const q = parseInt(newCantidad, 10); if (isNaN(q) || q <= 0) { toast.error("Cantidad inválida."); return; } setIsAddingManual(true); const tId = toast.loading('Guardando...'); try { const { data: success, error } = await supabase.rpc('add_update_contenido_caja', { p_ean_caja: caja.ean_caja, p_ean_referencia: selectedReferenciaEan, p_cantidad: q, p_usuario_id: currentUserId }); if (error || !success) { throw error || new Error('Falló.'); } toast.success('OK.', { id: tId }); await delay(100); await fetchContenido(); setSelectedReferenciaEan(null); setNewCantidad('1'); setManualInputValue(''); } catch (err: any) { toast.error(`Error: ${err.message}`, { id: tId }); } finally { setIsAddingManual(false); } }, [caja, selectedReferenciaEan, newCantidad, readOnly, getCurrentUserId, fetchContenido]);

  // Manejadores Autocomplete
  const handleManualInputChange = (value: string) => { setManualInputValue(value); };
  // Asegurar que la key se maneje como string o null
  const handleManualSelectionChange = (key: React.Key | null) => {
    const selectedEan = key !== null && key !== undefined ? String(key) : null; // Convertir a string o null
    setSelectedReferenciaEan(selectedEan);
    const selectedRef = referenciasActivas.find(ref => ref.ean_referencia === selectedEan);
    setManualInputValue(selectedRef ? `${selectedRef.descripcion} (${selectedRef.ean_referencia})` : selectedEan ?? '');
  };

  // Submit Modo Escaneo (+1)
  const handleScanSubmitAdd = useCallback(async () => { const currentUserId = getCurrentUserId(); if (readOnly || !caja || !scanInputValue || !currentUserId) return; setIsProcessingScan(true); setLastScanResult(null); const scannedEan = scanInputValue.trim(); setScanInputValue(''); if (!scannedEan) { setIsProcessingScan(false); return; } try { const { data, error } = await supabase.rpc('agregar_o_contar_item_en_caja', { p_ean_caja: caja.ean_caja, p_ean_referencia_scan: scannedEan, p_usuario_id: currentUserId }); if (error) throw error; const result = data?.[0] as AgregarContarResult; if (result?.mensaje?.startsWith('Error:')) { setLastScanResult({ message: result.mensaje, isError: true }); toast.error(result.mensaje); } else if (result?.mensaje) { setLastScanResult({ message: result.mensaje, isError: false }); toast.success(result.mensaje); await delay(50); await fetchContenido(); } else { throw new Error("Inv Rsp."); } } catch (err: any) { const eMsg = `Error: ${err.message||'?'}`; setLastScanResult({ message: eMsg, isError: true }); toast.error(eMsg); } finally { setIsProcessingScan(false); scanInputRef.current?.focus(); } }, [caja, scanInputValue, getCurrentUserId, fetchContenido, readOnly]);
  // Submit Modo Escaneo (-1)
  const handleScanSubmitRestar = useCallback(async () => { const currentUserId = getCurrentUserId(); if (readOnly || !caja || !scanInputValue || !currentUserId) return; setIsProcessingRestar(true); setLastScanResult(null); const scannedEan = scanInputValue.trim(); setScanInputValue(''); if (!scannedEan) { setIsProcessingRestar(false); return; } try { const { data, error } = await supabase.rpc('restar_item_en_caja', { p_ean_caja: caja.ean_caja, p_ean_referencia_scan: scannedEan, p_usuario_id: currentUserId }); if (error) throw error; const result = data?.[0] as RestarItemResult; if (result?.mensaje?.startsWith('Error:')) { setLastScanResult({ message: result.mensaje, isError: true }); toast.error(result.mensaje); } else if (result?.mensaje) { setLastScanResult({ message: result.mensaje, isError: false }); toast.success(result.mensaje); await delay(50); await fetchContenido(); } else { throw new Error("Inv Rsp."); } } catch (err: any) { const eMsg = `Error: ${err.message||'?'}`; setLastScanResult({ message: eMsg, isError: true }); toast.error(eMsg); } finally { setIsProcessingRestar(false); scanInputRef.current?.focus(); } }, [caja, scanInputValue, getCurrentUserId, fetchContenido, readOnly]);
  const handleScanKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') { e.preventDefault(); handleScanSubmitAdd(); } };

  // Quitar Item de la lista
  const handleRemoveItem = useCallback(async (eanReferencia: string) => { if (readOnly) return; const currentUserId = getCurrentUserId(); if (!caja || !currentUserId) return; if (window.confirm(`¿Quitar ${eanReferencia}?`)) { setIsRemoving(eanReferencia); const tId = toast.loading('Eliminando...'); try { const { data: success, error } = await supabase.rpc('remove_contenido_caja', { p_ean_caja: caja.ean_caja, p_ean_referencia: eanReferencia, p_usuario_id: currentUserId }); if (error || !success) { throw error || new Error('Falló.'); } toast.success('OK.', { id: tId }); await delay(100); await fetchContenido(); } catch (err: any) { toast.error(`Error: ${err.message}`, { id: tId }); } finally { setIsRemoving(null); } } }, [caja, getCurrentUserId, fetchContenido, readOnly]);

  // Guardar Calidad (Admin)
  const handleSaveCalidad = useCallback(async () => {
    const currentUserId = getCurrentUserId(); if (readOnly || !isAdmin || !caja || !currentUserId) return;
    // Convertir selectedCalidad (que es '' o 'P'/'SS'/'SP') a ClasificacionCalidad | null
    const calidadFinal = selectedCalidad === '' ? null : selectedCalidad as ClasificacionCalidad;
    if (calidadFinal !== caja.clasificacion_calidad) {
        setIsSavingQuality(true); const tId = toast.loading('Guardando...');
        try {
            const { data: success, error } = await supabase.rpc('update_caja_calidad', { p_caja_id: caja.id, p_clasificacion_calidad: calidadFinal, p_usuario_id: currentUserId });
            if (error || !success) throw error || new Error("Fallo.");
            toast.success('OK.', { id: tId });
            if (caja) caja.clasificacion_calidad = calidadFinal; // Actualización optimista local
            setSelectedCalidad(calidadFinal ?? ''); // Actualizar estado del select
        } catch (err: any) {
            toast.error(`Error: ${err.message}`, { id: tId });
        } finally {
            setIsSavingQuality(false);
        }
    } else {
        // CORREGIDO: Usar toast() normal
        toast("Calidad sin cambios.");
    }
  }, [caja, selectedCalidad, isAdmin, getCurrentUserId, readOnly]);

  // Cambiar Select Calidad
  const handleCalidadChange = useCallback((keys: Set<React.Key> | React.Key) => {
      let selectedKeyString = '';
       if (keys instanceof Set) {
          selectedKeyString = Array.from(keys)[0]?.toString() || '';
      } else if (keys){
          selectedKeyString = keys.toString();
      }
      setSelectedCalidad(selectedKeyString); // Actualiza el estado que controla las selectedKeys
  }, []);


  // --- Renderizado de Celdas ---
  const renderCell = useCallback((item: ContenidoCajaDetallado, columnKey: React.Key) => { const cellValue = item[columnKey as keyof ContenidoCajaDetallado]; switch (columnKey) { case "talla": return cellValue ?? 'N/A'; case "color": return cellValue ?? 'N/A'; case "cantidad": return <div className="text-right font-medium">{cellValue}</div>; case "actions": return ( <div className="relative flex justify-center items-center"> <Tooltip color="danger" content={readOnly ? "No permitido" : "Quitar"}><Button isIconOnly size="sm" variant="light" color="danger" onPress={() => handleRemoveItem(item.ean_referencia)} isDisabled={readOnly || isRemoving === item.ean_referencia} isLoading={isRemoving === item.ean_referencia}><DeleteIcon className={`text-lg ${readOnly ? 'text-gray-500 dark:text-gray-600' : 'text-red-500 dark:text-red-400'}`} /></Button></Tooltip> </div> ); default: return cellValue; } }, [handleRemoveItem, readOnly, isRemoving]);

  // --- JSX del Modal ---
  return (
     <Modal isOpen={isOpen} onOpenChange={onClose} size="4xl" scrollBehavior="inside" backdrop="blur">
       <ModalContent className="dark:bg-gray-800">
         <>
           <ModalHeader className="flex justify-between items-start">
                <div className="flex flex-col gap-1 dark:text-white"> Contenido Caja: {caja?.ean_caja ?? ''} <span className='text-sm text-default-500'>T: {caja?.tipo_bodega ?? 'N/A'} / E: {caja?.estado ?? 'N/A'} / Q: {caja?.clasificacion_calidad ?? '-'}</span> </div>
                {readOnly && <Chip color="danger" size='md' variant='flat'>SOLO LECTURA</Chip>}
           </ModalHeader>
           <ModalBody className="flex flex-col gap-6">
                {/* --- Controles Superiores: Modo y Calidad (Solo si NO es readOnly) --- */}
                {!readOnly && (
                    <div className="flex flex-wrap justify-between items-center gap-4 p-3 border-b border-default-200 dark:border-gray-700 pb-4">
                        <Switch isSelected={!isManualMode} onValueChange={(isSelected) => setIsManualMode(!isSelected)} isDisabled={isActionLoading} size="lg" color="success" startContent={<ManualIcon />} endContent={<BarcodeIcon />}> {isManualMode ? "Manual" : "Escaneo"} </Switch>
                        {isAdmin && (
                           <div className="flex items-center gap-2">
                               {/* CORREGIDO: Select de Calidad usando 'items' prop */}
                               <Select
                                   items={clasificacionOptionsData}
                                   label="Calidad"
                                   placeholder="-"
                                   size="sm"
                                   variant="bordered"
                                   // Usa el estado `selectedCalidad` (string)
                                   selectedKeys={selectedCalidad !== null && selectedCalidad !== undefined ? new Set([selectedCalidad]) : new Set([''])}
                                   onSelectionChange={handleCalidadChange}
                                   isDisabled={isActionLoading}
                                   className="w-48"
                                >
                                   {(item) => (
                                       <SelectItem key={item.key} textValue={item.label}>
                                           {item.label}
                                       </SelectItem>
                                   )}
                               </Select>
                               <Button size="sm" color="secondary" variant="flat" onPress={handleSaveCalidad} isLoading={isSavingQuality}
                                    // Compara estado string con valor (o string vacío si es null)
                                    isDisabled={isActionLoading || selectedCalidad === (caja?.clasificacion_calidad ?? '')}>
                                 Guardar
                               </Button>
                           </div>
                        )}
                    </div>
                )}
                {/* --- Sección de Entrada --- */}
                {!readOnly && ( isManualMode ? (
                        <div className="flex flex-wrap gap-2 items-end p-3 border border-default-200 dark:border-gray-700 rounded-md">
                            <Autocomplete
                                label="Referencia (EAN o Desc.)"
                                placeholder="Buscar..."
                                items={filteredReferencias}
                                selectedKey={selectedReferenciaEan} // Usa string | null
                                onSelectionChange={handleManualSelectionChange}
                                inputValue={manualInputValue}
                                onInputChange={handleManualInputChange}
                                className="flex-grow min-w-[300px]" size="sm" variant="bordered"
                                isDisabled={isActionLoading} allowsCustomValue={false}
                            >
                                {(item) => (
                                  // CORREGIDO: Forzar key a string
                                  <AutocompleteItem key={String(item.ean_referencia)} textValue={`${item.ean_referencia} ${item.descripcion}`}>
                                      <div className="flex gap-2 items-center">
                                          <div className="flex flex-col">
                                              <span className="text-small">{item.descripcion}</span>
                                              <span className="text-tiny text-default-400">{item.ean_referencia} (T:{item.talla ?? '-'},C:{item.color ?? '-'})</span>
                                          </div>
                                      </div>
                                  </AutocompleteItem>
                                )}
                            </Autocomplete>
                            <Input type="number" label="Cantidad" placeholder="Cant." size="sm" variant="bordered" value={newCantidad} onValueChange={setNewCantidad} min="1" className="w-24" isDisabled={isActionLoading}/>
                            <Button color="primary" onPress={handleAddOrUpdateItemManual} isLoading={isAddingManual} size="lg" className="self-end" isDisabled={!selectedReferenciaEan || isActionLoading}> Añadir/Actualizar </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2 p-3 border border-success-400 dark:border-success-600 rounded-md">
                             <div className="flex gap-2 items-end">
                                <Input ref={scanInputRef} label="Escanear EAN Ref (Enter = Suma 1)" placeholder="Esperando..." value={scanInputValue} onValueChange={setScanInputValue} onKeyDown={handleScanKeyDown} isDisabled={isActionLoading} variant="bordered" size="lg" startContent={<BarcodeIcon className="text-2xl text-success-500"/>} autoFocus className="flex-grow"/>
                                <Tooltip content="Restar 1 unidad del EAN ingresado"><Button color="danger" variant="flat" isIconOnly onPress={handleScanSubmitRestar} isLoading={isProcessingRestar} isDisabled={!scanInputValue || isActionLoading} aria-label="Restar 1"> <MinusCircleIcon className="text-xl" /> </Button></Tooltip>
                             </div>
                            {(isProcessingScan || isProcessingRestar) && <Spinner size="sm"/>}
                            {lastScanResult && !isProcessingScan && !isProcessingRestar && (<p className={`text-sm px-1 ${lastScanResult.isError ? 'text-danger' : 'text-success'}`}>{lastScanResult.message}</p>)}
                        </div>
                    )
                )}
             {/* --- Tabla Contenido Actual --- */}
             <h4 className="text-lg font-semibold mb-2 dark:text-white">Contenido Actual</h4>
             <div className='border border-default-200 dark:border-gray-700 rounded-md'>
               {isLoadingContenido ? (<div className="flex justify-center p-5"><Spinner/></div>) : (
                 <Table removeWrapper aria-label="Contenido" classNames={{ wrapper: "max-h-[300px]" }}>
                   <TableHeader columns={columns}>{(c) => <TableColumn key={c.key} align={c.key === "actions" || c.key === "cantidad" ? "center" : "start"}>{c.label}</TableColumn>}</TableHeader>
                   <TableBody items={contenido ?? []} emptyContent={"Caja vacía."}>{(item) => (<TableRow key={item.ean_referencia}>{(cK) => <TableCell className="dark:text-gray-300 text-sm">{renderCell(item, cK)}</TableCell>}</TableRow>)}</TableBody>
                 </Table>
               )}
             </div>
           </ModalBody>
           <ModalFooter> <Button color="primary" variant="light" onPress={onClose}> Cerrar </Button> </ModalFooter>
         </>
       </ModalContent>
     </Modal>
  );
};
export default ContenidoCajaModal;