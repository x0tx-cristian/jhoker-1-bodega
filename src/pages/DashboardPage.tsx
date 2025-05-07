// src/pages/DashboardPage.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Spinner, Card, CardHeader, CardBody, Input, Button,
    Autocomplete, AutocompleteItem, Chip,
    Table, TableHeader, TableColumn, TableBody, TableRow, TableCell // Asegurar todos los imports de Table
} from "@heroui/react";
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import {
    AdminDashboardSummary, OperarioPTDashboardSummary, OperarioInsumosDashboardSummary,
    DashboardSummaryData, Referencia, // Quitado NombreRol
    InventarioPorReferenciaResult,
    UbicacionCajaInfo, ContenidoCajaDetallado // Quitado Caja, DesgloseCajaInventario (usados en DesgloseInventarioTable)
} from '../types';
import SummaryCard from '../components/dashboard/SummaryCard';
import DesgloseInventarioTable from '../components/dashboard/DesgloseInventarioTable';
import { BoxIcon } from '../components/icons/BoxIcon';
import { DocumentIcon } from '../components/icons/DocumentIcon';
import { LocationIcon } from '../components/icons/LocationIcon';
import { PackageIcon } from '../components/icons/PackageIcon';
import { SearchIcon } from '../components/icons/SearchIcon';
import { DeleteIcon } from '../components/icons/DeleteIcon';
import toast from 'react-hot-toast';

// Interfaz para consulta rápida de caja (sin cambios)
interface ResultadoConsultaCaja {
    ubicacion: UbicacionCajaInfo | null;
    contenido: ContenidoCajaDetallado[];
    error?: string | null;
    eanConsultado: string;
}

// --- COLUMNAS PARA TABLA DE CONTENIDO CONSULTADO ---
const consultaContenidoColumns = [
    { key: "descripcion", label: "DESCRIPCIÓN" },
    { key: "talla", label: "TALLA" },
    { key: "color", label: "COLOR" },
    { key: "cantidad", label: "CANT." },
];


const DashboardPage: React.FC = () => {
  // --- Estados (sin cambios) ---
  const [summaryData, setSummaryData] = useState<DashboardSummaryData>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [searchInputValue, setSearchInputValue] = useState("");
  const [searchResults, setSearchResults] = useState<Referencia[]>([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [selectedReferenciaEan, setSelectedReferenciaEan] = useState<string | null>(null);
  const [inventarioDetalle, setInventarioDetalle] = useState<InventarioPorReferenciaResult | null>(null);
  const [isLoadingInventario, setIsLoadingInventario] = useState(false);
  const [eanCajaConsulta, setEanCajaConsulta] = useState("");
  const [resultadoConsulta, setResultadoConsulta] = useState<ResultadoConsultaCaja | null>(null);
  const [isLoadingConsulta, setIsLoadingConsulta] = useState(false);
  const { rolId, rolNombre } = useAuth();
  const isAdmin = useMemo(() => rolId === 1, [rolId]);

  // --- Funciones de Carga (sin cambios) ---
  const getSummaryRpcFunction = useCallback((): string | null => { switch (rolId) { case 1: return 'get_dashboard_summary_admin'; case 2: return 'get_dashboard_summary_operario_pt'; case 3: return 'get_dashboard_summary_operario_insumos'; default: return null; } }, [rolId]);
  const fetchSummaryData = useCallback(async () => { const rpcFunction = getSummaryRpcFunction(); if (!rpcFunction) { setIsLoadingSummary(false); setSummaryData(null); return; } setIsLoadingSummary(true); try { const { data, error } = await supabase.rpc(rpcFunction); if (error) throw error; if (data?.[0]) { setSummaryData(data[0]); } else { setSummaryData(null); } } catch (err: any) { console.error(`Err ${rpcFunction}:`, err); toast.error(`Error resumen: ${err.message}`); setSummaryData(null); } finally { setIsLoadingSummary(false); } }, [getSummaryRpcFunction]);
  const fetchAutocompleteSuggestions = useCallback(async (term: string) => { if (term.length < 2) { setSearchResults([]); return; } setIsLoadingSearch(true); try { const { data, error } = await supabase.rpc('buscar_referencias_autocomplete', { p_termino: term }); if (error) throw error; setSearchResults(data || []); } catch (err: any) { console.error("Err autocomplete:", err); setSearchResults([]); } finally { setIsLoadingSearch(false); } }, []);
  const fetchInventarioDetalle = useCallback(async (ean: string | null) => { if (!ean) { setInventarioDetalle(null); return; } setIsLoadingInventario(true); setInventarioDetalle(null); try { const { data, error } = await supabase.rpc('get_inventario_por_referencia', { p_ean_referencia_buscada: ean }); if (error) throw error; if (data?.error) { toast.error(data.error); setInventarioDetalle(null); } else { setInventarioDetalle(data as InventarioPorReferenciaResult); } } catch (err: any) { console.error("Err fetch detalle:", err); toast.error(`Error: ${err.message}`); setInventarioDetalle(null); } finally { setIsLoadingInventario(false); } }, []);
  useEffect(() => { fetchSummaryData(); }, [fetchSummaryData]);

  // --- Manejadores (sin cambios) ---
  const handleSearchInputChange = (value: string) => { setSearchInputValue(value); fetchAutocompleteSuggestions(value); };
  const handleSearchSelectionChange = (key: React.Key | null) => { const ean = key?.toString() ?? null; setSelectedReferenciaEan(ean); fetchInventarioDetalle(ean); };
  const handleClearSearch = () => { setSearchInputValue(''); setSearchResults([]); setSelectedReferenciaEan(null); setInventarioDetalle(null); };
  const handleConsultaCaja = useCallback(async () => { if (!eanCajaConsulta || eanCajaConsulta.length < 10) { toast.error("Ingrese EAN de Caja válido."); return; } setIsLoadingConsulta(true); setResultadoConsulta(null); let errorMsg: string | null = null; let ubicacionResult: UbicacionCajaInfo | null = null; let contenidoResult: ContenidoCajaDetallado[] = []; try { const [ubicRes, contRes] = await Promise.all([ supabase.rpc('get_ubicacion_por_ean_caja', { p_ean_caja: eanCajaConsulta }), supabase.rpc('get_contenido_por_ean_caja', { p_ean_caja: eanCajaConsulta }) ]); if (ubicRes.error) throw new Error(`Error ubicación: ${ubicRes.error.message}`); if (contRes.error) throw new Error(`Error contenido: ${contRes.error.message}`); if (ubicRes.data?.[0]) { ubicacionResult = ubicRes.data[0]; } contenidoResult = (contRes.data as ContenidoCajaDetallado[] | null) || []; if (!ubicacionResult && contenidoResult.length === 0) { errorMsg = "EAN no encontrado o caja vacía/sin ubicación."; } } catch (err: any) { errorMsg = err.message || "Error desconocido"; } finally { setResultadoConsulta({ ubicacion: ubicacionResult, contenido: contenidoResult, error: errorMsg, eanConsultado: eanCajaConsulta }); setIsLoadingConsulta(false); } }, [eanCajaConsulta]);

  // --- Renderizado Tarjetas Resumen (sin cambios) ---
  const renderAdminSummary = (data: AdminDashboardSummary) => ( <> <SummaryCard title="Refs Activas" value={data.total_referencias_activas} isLoading={isLoadingSummary} icon={<DocumentIcon />} /> <SummaryCard title="Ubic PT" value={data.total_ubicaciones_pt_activas} isLoading={isLoadingSummary} icon={<LocationIcon />} color="secondary" /> <SummaryCard title="Ubic Ins" value={data.total_ubicaciones_insumos_activas} isLoading={isLoadingSummary} icon={<LocationIcon />} color="warning" /> <SummaryCard title="Cajas PT" value={data.total_cajas_pt_activas} isLoading={isLoadingSummary} icon={<BoxIcon />} color="secondary" /> <SummaryCard title="Cajas Ins" value={data.total_cajas_insumos_activas} isLoading={isLoadingSummary} icon={<BoxIcon />} color="warning" /> <SummaryCard title="Despachadas" value={data.total_cajas_despachadas} isLoading={isLoadingSummary} icon={<BoxIcon />} color="danger" /> <SummaryCard title="Unidades PT" value={data.total_unidades_pt} isLoading={isLoadingSummary} icon={<PackageIcon />} color="secondary" /> <SummaryCard title="Unidades Ins" value={data.total_unidades_insumos} isLoading={isLoadingSummary} icon={<PackageIcon />} color="warning" /> </> );
  const renderOperarioPTSummary = (data: OperarioPTDashboardSummary) => ( <> <SummaryCard title="Cajas PT Activas" value={data.total_cajas_pt_activas} isLoading={isLoadingSummary} icon={<BoxIcon />} color="secondary" /> <SummaryCard title="Cajas PT Bodega" value={data.total_cajas_pt_en_bodega} isLoading={isLoadingSummary} icon={<BoxIcon />} color="success" /> <SummaryCard title="Cajas PT Sin Ubic" value={data.total_cajas_pt_sin_ubicacion} isLoading={isLoadingSummary} icon={<BoxIcon />} color="warning" /> <SummaryCard title="Ubicaciones PT" value={data.total_ubicaciones_pt_activas} isLoading={isLoadingSummary} icon={<LocationIcon />} color="secondary" /> <SummaryCard title="Unidades PT" value={data.total_unidades_pt} isLoading={isLoadingSummary} icon={<PackageIcon />} color="secondary" /> </> );
  const renderOperarioInsumosSummary = (data: OperarioInsumosDashboardSummary) => ( <> <SummaryCard title="Cajas Insumos" value={data.total_cajas_insumos_activas} isLoading={isLoadingSummary} icon={<BoxIcon />} color="warning" /> <SummaryCard title="Unidades Insumos" value={data.total_unidades_insumos} isLoading={isLoadingSummary} icon={<PackageIcon />} color="warning" /> </> );

  // --- Render Cell para Tabla Consulta Rápida ---
  const renderConsultaCell = useCallback((item: ContenidoCajaDetallado, columnKey: React.Key) => {
    const cellValue = item[columnKey as keyof ContenidoCajaDetallado];
    switch(columnKey) {
        case 'talla': return <div className="text-center">{cellValue ?? '-'}</div>;
        case 'color': return <div className="text-center">{cellValue ?? '-'}</div>;
        case 'cantidad': return <div className="text-right font-semibold">{cellValue}</div>;
        default: return cellValue; // descripcion
    }
  }, []);

  // --- JSX Principal ---
  return (
    <div className="container mx-auto px-4 py-8 flex flex-col gap-8">
        {/* --- Sección Resumen General --- */}
        <div>
            <h1 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white"> Dashboard {rolNombre ? `(${rolNombre})` : ''} </h1>
            {isLoadingSummary ? ( <div className="flex justify-center p-5"><Spinner size="md" /></div> )
             : !summaryData ? ( <p className="text-center text-gray-500 dark:text-gray-400">No hay datos de resumen.</p> )
             : ( <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                   {rolId === 1 && renderAdminSummary(summaryData as AdminDashboardSummary)}
                   {rolId === 2 && renderOperarioPTSummary(summaryData as OperarioPTDashboardSummary)}
                   {rolId === 3 && renderOperarioInsumosSummary(summaryData as OperarioInsumosDashboardSummary)}
                 </div>
               )}
        </div>

         {/* --- Sección Consulta Rápida Caja --- */}
         <Card shadow="md" className="dark:bg-gray-800">
            <CardHeader> <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Consulta Rápida por EAN de Caja</h2> </CardHeader>
            <CardBody className="flex flex-col gap-4">
                <div className="flex gap-2 items-end">
                    <Input label="Escanear o Ingresar EAN de Caja" placeholder="999..." variant="bordered" value={eanCajaConsulta} onValueChange={setEanCajaConsulta} onKeyDown={(e) => { if (e.key === 'Enter') handleConsultaCaja(); }} isDisabled={isLoadingConsulta} className="flex-grow" startContent={<BoxIcon className="text-default-400"/>} />
                    <Button color="primary" onPress={handleConsultaCaja} isLoading={isLoadingConsulta} isIconOnly aria-label="Buscar Caja"> <SearchIcon /> </Button>
                    <Button variant="light" onPress={() => { setEanCajaConsulta(''); setResultadoConsulta(null); }} aria-label="Limpiar" isIconOnly isDisabled={!eanCajaConsulta && !resultadoConsulta}> <DeleteIcon className="text-lg text-default-500" /> </Button>
                </div>
                {isLoadingConsulta && <div className="flex justify-center p-4"><Spinner size="sm" label="Consultando..." /></div>}
                {resultadoConsulta && !isLoadingConsulta && (
                    <div className="mt-4 p-4 border border-default-200 dark:border-gray-700 rounded-md flex flex-col gap-3">
                        <h3 className="text-lg font-semibold dark:text-white">Resultado EAN: <Chip variant='bordered'>{resultadoConsulta.eanConsultado}</Chip></h3>
                        {resultadoConsulta.error && ( <p className="text-danger">{resultadoConsulta.error}</p> )}
                        {!resultadoConsulta.error && (<>
                            <div className='flex items-center gap-2'> <p className="dark:text-gray-300 font-medium">Ubicación:</p> <Chip color={resultadoConsulta.ubicacion ? 'primary' : 'warning'} variant='flat'> {resultadoConsulta.ubicacion?.codigo_visual_ubicacion ?? 'Sin Ubicación'} </Chip> </div>
                            <div>
                                <h4 className="text-md font-semibold mb-1 dark:text-gray-200">Contenido:</h4>
                                {resultadoConsulta.contenido.length > 0 ? (
                                    // CORREGIDO: Usar la estructura correcta de Table/Header/Body/Column/Row/Cell
                                    <Table removeWrapper isCompact aria-label="Contenido consultado" classNames={{wrapper:"shadow-none p-0", table:"text-xs"}}>
                                        <TableHeader columns={consultaContenidoColumns}>
                                            {(column) => (
                                                <TableColumn key={column.key} align={column.key === 'cantidad' ? 'end' : (column.key === 'talla' || column.key === 'color' ? 'center' : 'start')}>
                                                    {column.label}
                                                </TableColumn>
                                            )}
                                        </TableHeader>
                                        <TableBody items={resultadoConsulta.contenido} emptyContent={" "}>
                                            {(item) => (
                                                <TableRow key={item.ean_referencia}>
                                                    {(columnKey) => <TableCell>{renderConsultaCell(item, columnKey)}</TableCell>}
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                ) : ( <p className="text-sm text-default-500 italic">Sin contenido.</p> )}
                            </div>
                        </>)}
                    </div>
                )}
            </CardBody>
         </Card>

        {/* --- Sección Búsqueda por Referencia (Admin) --- */}
        {isAdmin && (
             <Card shadow="md" className="dark:bg-gray-800">
                <CardHeader> <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Buscar Inventario por Referencia</h2> </CardHeader>
                <CardBody className="flex flex-col gap-4">
                    <div className="flex gap-2 items-center">
                        <Autocomplete label="Buscar Referencia (EAN o Descripción)" placeholder="Escriba 2+ caracteres..." variant="bordered" inputValue={searchInputValue} items={searchResults} isLoading={isLoadingSearch} onInputChange={handleSearchInputChange} onSelectionChange={handleSearchSelectionChange} allowsCustomValue={false} className="flex-grow" startContent={<SearchIcon className="text-default-400" />}>
                            {(item) => ( <AutocompleteItem key={item.ean_referencia} textValue={item.descripcion}> <div className="flex justify-between items-center"><span className="text-sm font-medium dark:text-gray-200">{item.descripcion}</span><span className="text-xs text-default-500 font-mono">{item.ean_referencia}</span></div> </AutocompleteItem> )}
                        </Autocomplete>
                        <Button isIconOnly variant="light" onPress={handleClearSearch} aria-label="Limpiar" isDisabled={!selectedReferenciaEan && !searchInputValue}><DeleteIcon className="text-lg text-default-500" /></Button>
                    </div>
                    {selectedReferenciaEan && (
                        isLoadingInventario ? (<div className="flex justify-center p-5"><Spinner label="Buscando..." /></div>)
                         : inventarioDetalle ? (
                            <div className="mt-4 p-4 border border-default-200 dark:border-gray-700 rounded-md">
                                <h3 className="text-lg font-semibold mb-2 dark:text-white"> {inventarioDetalle.descripcion ?? `Ref: ${inventarioDetalle.ean_referencia_buscada}`} </h3>
                                <p className="mb-3 dark:text-gray-300"> Stock Total (Activo): <Chip color="primary" variant="flat" size="lg">{inventarioDetalle.stock_total ?? 0}</Chip> </p>
                                <h4 className="text-md font-semibold mb-2 dark:text-gray-200">Desglose por Caja:</h4>
                                <DesgloseInventarioTable items={inventarioDetalle.desglose_cajas || []} isLoading={false} />
                            </div> )
                         : (<p className="text-center text-gray-500 dark:text-gray-400 mt-4">No se encontró inventario.</p>)
                    )}
                </CardBody>
            </Card>
        )}
    </div>
  );
};

export default DashboardPage;