// // // // src/components/cajas/CajaForm.tsx (FINAL v5 - Lógica Deshabilitar Post-Crear)
// // // import React, { useState, useEffect } from 'react';
// // // import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Spinner, Select, SelectItem } from "@heroui/react";
// // // import { TipoBodega } from '../../types'; // Ajusta ruta

// // // const tipoBodegaOptions = [
// // //     { key: 'PT', label: 'Producto Terminado' },
// // //     { key: 'INSUMOS', label: 'Insumos (Fija)' },
// // // ];

// // // interface CajaFormProps {
// // //   isOpen: boolean;
// // //   onClose: () => void;
// // //   onSubmit: (tipoBodega: TipoBodega | null) => Promise<{ id: string; ean_caja: string; tipo_bodega: TipoBodega | null } | null>; // Devuelve la caja creada o null
// // //   tipoBodegaUsuario: TipoBodega | null;
// // //   isAdmin: boolean;
// // // }

// // // const CajaForm: React.FC<CajaFormProps> = ({ isOpen, onClose, onSubmit, tipoBodegaUsuario, isAdmin }) => {
// // //   const [isSubmitting, setIsSubmitting] = useState(false);
// // //   const [newEan, setNewEan] = useState<string | null>(null); // Guarda el EAN generado para mostrarlo
// // //   const [error, setError] = useState<string | null>(null);
// // //   const [selectedTipoBodega, setSelectedTipoBodega] = useState<TipoBodega | null>(null);

// // //   // Resetear estado y pre-rellenar tipo cuando el modal se abre
// // //   useEffect(() => {
// // //     if (isOpen) {
// // //       setSelectedTipoBodega(isAdmin ? null : tipoBodegaUsuario); // Admin elige, Operario usa el suyo
// // //       setError(null);
// // //       setNewEan(null); // Limpiar EAN previo
// // //       setIsSubmitting(false);
// // //     }
// // //   }, [isOpen, isAdmin, tipoBodegaUsuario]);

// // //   // Manejador para el Select de Tipo Bodega
// // //   const handleSelectChange = (keys: Set<React.Key> | React.Key) => {
// // //     // No permitir cambio si ya se generó el EAN en este ciclo del modal
// // //     if (newEan) return;
// // //     let selectedKey: TipoBodega | null = null;
// // //     if (keys instanceof Set) { selectedKey = Array.from(keys)[0]?.toString() as TipoBodega || null; }
// // //     else if (keys){ selectedKey = keys.toString() as TipoBodega; }
// // //     setSelectedTipoBodega(selectedKey);
// // //     if (selectedKey) setError(null); // Limpiar error si selecciona algo
// // //   };

// // //   // Manejador para el botón "Generar y Crear Caja"
// // //   const handleSubmit = async () => {
// // //     setError(null);
// // //     setNewEan(null); // Limpiar EAN previo por si intenta de nuevo
// // //     if (!selectedTipoBodega) { setError("Debe seleccionar un Tipo de Bodega."); return; }

// // //     setIsSubmitting(true);
// // //     try {
// // //       const newCaja = await onSubmit(selectedTipoBodega); // Llama a la función de CajasPage
// // //       if (newCaja && newCaja.ean_caja) {
// // //         setNewEan(newCaja.ean_caja); // Muestra el EAN si la creación fue exitosa
// // //         console.log("[CajaForm] Caja creada, mostrando EAN:", newCaja.ean_caja);
// // //         // No cerramos automáticamente
// // //       } else {
// // //         // El toast de error se muestra en CajasPage, aquí mostramos un mensaje local
// // //         setError("Error al crear la caja. Revise la consola o intente de nuevo.");
// // //         console.error("[CajaForm] onSubmit no devolvió una caja válida.");
// // //       }
// // //     } catch (submitError) {
// // //       // Captura errores inesperados del onSubmit mismo
// // //       console.error("[CajaForm] Error inesperado en handleSubmit:", submitError);
// // //       setError("Error inesperado al procesar la solicitud.");
// // //     } finally {
// // //       setIsSubmitting(false);
// // //     }
// // //   };

// // //   // Cierra el modal y resetea estados
// // //   const handleModalClose = () => {
// // //     setError(null); setNewEan(null); setIsSubmitting(false); setSelectedTipoBodega(null);
// // //     onClose();
// // //   }

// // //   return (
// // //     <Modal isOpen={isOpen} onOpenChange={onClose} placement="top-center" backdrop="blur">
// // //       <ModalContent className="dark:bg-gray-800">
// // //         <>
// // //           <ModalHeader className="dark:text-white">Nueva Caja</ModalHeader>
// // //           <ModalBody>
// // //             <Select
// // //               isRequired label="Tipo de Bodega para esta Caja" placeholder={isAdmin ? "Seleccione tipo..." : (tipoBodegaUsuario ?? "No asignado")}
// // //               selectedKeys={selectedTipoBodega ? new Set([selectedTipoBodega]) : undefined}
// // //               onSelectionChange={handleSelectChange}
// // //               // Deshabilitar si se está enviando, O si NO es admin, O si YA se mostró un EAN
// // //               isDisabled={isSubmitting || !isAdmin || !!newEan}
// // //               variant="bordered" aria-label="Tipo Bodega Caja"
// // //               isInvalid={!!error && !selectedTipoBodega}
// // //               errorMessage={!selectedTipoBodega && error ? "Debe seleccionar un tipo" : undefined}
// // //               className="mb-4"
// // //             >
// // //               {tipoBodegaOptions.map((tipo) => (<SelectItem key={tipo.key} value={tipo.key}>{tipo.label}</SelectItem>))}
// // //             </Select>
// // //             <p className="text-sm text-gray-600 dark:text-gray-400 mt-2"> Se generará un EAN-13 único. Imprima y pegue la etiqueta en la caja. </p>
// // //             {newEan && ( <Input isReadOnly label="EAN-13 Generado:" value={newEan} variant="faded" className="mt-4" description="Anote este número."/> )}
// // //             {isSubmitting && <div className="flex justify-center mt-4"><Spinner size="sm" /></div>}
// // //             {error && !newEan && <p className="text-danger text-small mt-4">{error}</p>}
// // //           </ModalBody>
// // //           <ModalFooter>
// // //             <Button color="danger" variant="flat" onPress={handleModalClose} isDisabled={isSubmitting}> {newEan ? 'Cerrar' : 'Cancelar'} </Button>
// // //             {/* Ocultar Crear si ya se mostró EAN */}
// // //             {!newEan && ( <Button color="primary" onPress={handleSubmit} isLoading={isSubmitting} isDisabled={!selectedTipoBodega || (!isAdmin && !tipoBodegaUsuario)}> Generar y Crear </Button> )}
// // //           </ModalFooter>
// // //         </>
// // //       </ModalContent>
// // //     </Modal>
// // //   );
// // // };
// // // export default CajaForm;















// // // src/components/cajas/CajaForm.tsx (FINAL v6 - Añade Select Calidad + Completo)
// // import React, { useState, useEffect, useCallback } from 'react';
// // import {
// //     Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
// //     Input, Spinner, Select, SelectItem // Asegurar Select, SelectItem
// // } from "@heroui/react";
// // // Importar tipos necesarios, incluyendo ClasificacionCalidad
// // import { TipoBodega, CajaFormData, ClasificacionCalidad } from '../../types'; // Ajusta ruta

// // // Opciones para Select Tipo Bodega
// // const tipoBodegaOptions = [
// //     { key: 'PT', label: 'Producto Terminado' },
// //     { key: 'INSUMOS', label: 'Insumos' },
// // ];
// // // Opciones para Select Clasificación Calidad
// // const clasificacionOptions: { key: ClasificacionCalidad; label: string }[] = [
// //     { key: 'P', label: 'P - Primera' },
// //     { key: 'SS', label: 'SS - Saldos Segundas' },
// //     { key: 'SP', label: 'SP - Saldos Primeras' },
// // ];

// // // Props del componente
// // interface CajaFormProps {
// //   isOpen: boolean;
// //   onClose: () => void;
// //   // onSubmit ahora espera CajaFormData (que incluye calidad opcional)
// //   onSubmit: (formData: CajaFormData) => Promise<{ id: string; ean_caja: string; tipo_bodega: TipoBodega | null; estado: EstadoCaja; clasificacion_calidad: ClasificacionCalidad | null } | null>;
// //   tipoBodegaUsuario: TipoBodega | null; // Tipo del operario
// //   isAdmin: boolean; // Es Admin?
// // }

// // const CajaForm: React.FC<CajaFormProps> = ({
// //     isOpen,
// //     onClose,
// //     onSubmit,
// //     tipoBodegaUsuario,
// //     isAdmin
// // }) => {
// //   // Estados locales
// //   const [isSubmitting, setIsSubmitting] = useState(false);
// //   const [newEan, setNewEan] = useState<string | null>(null);
// //   const [error, setError] = useState<string | null>(null);
// //   // Estado para el formulario, usando la interfaz CajaFormData
// //   const [formData, setFormData] = useState<CajaFormData>({
// //       tipo_bodega: null,
// //       clasificacion_calidad: null // Inicializar calidad a null
// //   });

// //   // Efecto para resetear/inicializar al abrir
// //   useEffect(() => {
// //     if (isOpen) {
// //       // Pre-rellenar tipo si es operario, admin elige
// //       // Pre-rellenar calidad a 'P' si es Operario PT, Admin elige (empieza null)
// //       const initialTipo = isAdmin ? null : tipoBodegaUsuario;
// //       const initialCalidad = isAdmin ? null : (tipoBodegaUsuario === 'PT' ? 'P' : null); // Op PT crea calidad 'P'

// //       setFormData({
// //           tipo_bodega: initialTipo,
// //           clasificacion_calidad: initialCalidad
// //       });
// //       setError(null);
// //       setNewEan(null);
// //       setIsSubmitting(false);
// //       console.log("[CajaForm] Abierto. isAdmin:", isAdmin, "Tipo Def:", initialTipo, "Calidad Def:", initialCalidad);
// //     }
// //   }, [isOpen, isAdmin, tipoBodegaUsuario]); // Dependencias correctas

// //   // Manejador para Select Tipo Bodega
// //   const handleTipoChange = useCallback((keys: Set<React.Key> | React.Key) => {
// //     if (newEan) return; // No cambiar si ya se creó
// //     let selectedKey: TipoBodega | null = null;
// //     if (keys instanceof Set) { selectedKey = Array.from(keys)[0]?.toString() as TipoBodega || null; }
// //     else if (keys){ selectedKey = keys.toString() as TipoBodega; }
// //     setFormData(prev => ({ ...prev, tipo_bodega: selectedKey }));
// //     if (selectedKey) setError(null);
// //   }, [newEan]); // Depende de newEan

// //   // Manejador para Select Clasificación Calidad
// //   const handleCalidadChange = useCallback((keys: Set<React.Key> | React.Key) => {
// //     if (newEan) return; // No cambiar si ya se creó
// //     let selectedKey: ClasificacionCalidad | null = null;
// //     if (keys instanceof Set) { selectedKey = Array.from(keys)[0]?.toString() as ClasificacionCalidad || null; }
// //     else if (keys){ selectedKey = keys.toString() as ClasificacionCalidad; }
// //     setFormData(prev => ({ ...prev, clasificacion_calidad: selectedKey }));
// //     // No necesitamos limpiar error aquí necesariamente
// //   }, [newEan]); // Depende de newEan

// //   // Manejador para submit (Crear)
// //   const handleSubmit = async () => {
// //     setError(null); setNewEan(null);
// //     // Validar selección de Tipo Bodega
// //     if (!formData.tipo_bodega) { setError("Debe seleccionar un Tipo de Bodega."); return; }
// //     // Calidad es opcional, no necesita validación aquí (puede ser null)

// //     setIsSubmitting(true);
// //     try {
// //       // Llama a onSubmit pasando el objeto formData completo
// //       const newCaja = await onSubmit(formData);
// //       if (newCaja && newCaja.ean_caja) {
// //         setNewEan(newCaja.ean_caja); // Mostrar EAN
// //         console.log("[CajaForm] Caja creada OK, EAN:", newCaja.ean_caja);
// //       } else {
// //         setError("Error al crear la caja. Revise consola.");
// //         console.error("[CajaForm] onSubmit no devolvió caja válida.");
// //       }
// //     } catch (submitError) { console.error("[CajaForm] Error inesperado:", submitError); setError("Error inesperado."); }
// //     finally { setIsSubmitting(false); }
// //   };

// //   // Cierre del modal
// //   const handleModalClose = () => { setError(null); setNewEan(null); setIsSubmitting(false); setFormData({ tipo_bodega: null, clasificacion_calidad: null }); onClose(); }

// //   return (
// //     <Modal isOpen={isOpen} onOpenChange={onClose} placement="top-center" backdrop="blur" onClose={handleModalClose}> {/* Usar onClose en onOpenChange */}
// //       <ModalContent className="dark:bg-gray-800">
// //         {(modalCloseInternal) => ( // Acceder a la función de cierre interna
// //           <>
// //             <ModalHeader className="flex flex-col gap-1 dark:text-white">Nueva Caja</ModalHeader>
// //             <ModalBody>
// //               {/* Select Tipo Bodega */}
// //               <Select
// //                 isRequired label="Tipo de Bodega *" placeholder={isAdmin ? "Seleccione tipo..." : (tipoBodegaUsuario === 'PT' ? 'Producto Terminado' : 'Insumos')}
// //                 selectedKeys={formData.tipo_bodega ? new Set([formData.tipo_bodega]) : undefined}
// //                 onSelectionChange={handleTipoChange}
// //                 isDisabled={isSubmitting || !isAdmin || !!newEan} // Deshabilitar si no admin O si ya se generó EAN
// //                 variant="bordered" aria-label="Tipo Bodega Caja"
// //                 isInvalid={!!error && !formData.tipo_bodega}
// //                 errorMessage={!formData.tipo_bodega && error ? "Seleccione un tipo" : undefined}
// //                 className="mb-4"
// //               >
// //                 {tipoBodegaOptions.map((tipo) => (<SelectItem key={tipo.key} value={tipo.key}>{tipo.label}</SelectItem>))}
// //               </Select>

// //               {/* Select Clasificación Calidad */}
// //               <Select
// //                 label="Clasificación Calidad (Opcional)"
// //                 placeholder="Seleccione calidad..."
// //                 selectedKeys={formData.clasificacion_calidad ? new Set([formData.clasificacion_calidad]) : undefined}
// //                 onSelectionChange={handleCalidadChange}
// //                 // Deshabilitar si se envía, O si es Op. PT (fijado a P), O si ya se generó EAN
// //                 isDisabled={isSubmitting || !isAdmin || !!newEan}
// //                 variant="bordered" aria-label="Clasificación Calidad Caja"
// //                 className="mb-4"
// //               >
// //                  {/* Opción para NINGUNA */}
// //                  <SelectItem key="" value={null}>Ninguna</SelectItem>
// //                  {/* Opciones P, SS, SP */}
// //                  {clasificacionOptions.map((calidad) => (<SelectItem key={calidad.key} value={calidad.key}>{calidad.label}</SelectItem>))}
// //               </Select>

// //               <p className="text-sm text-gray-600 dark:text-gray-400 mt-2"> Se generará un EAN-13 único. Imprima y pegue la etiqueta.</p>
// //               {newEan && ( <Input isReadOnly label="EAN-13 Generado:" value={newEan} variant="faded" className="mt-4" description="Anote este número."/> )}
// //               {isSubmitting && <div className="flex justify-center mt-4"><Spinner size="sm" /></div>}
// //               {error && !newEan && <p className="text-danger text-small mt-4">{error}</p>}
// //             </ModalBody>
// //             <ModalFooter>
// //               <Button color="danger" variant="flat" onPress={handleModalClose} isDisabled={isSubmitting}> {newEan ? 'Cerrar' : 'Cancelar'} </Button>
// //               {!newEan && ( <Button color="primary" onPress={handleSubmit} isLoading={isSubmitting} isDisabled={!formData.tipo_bodega}> Generar y Crear </Button> )}
// //             </ModalFooter>
// //           </>
// //         )}
// //       </ModalContent>
// //     </Modal>
// //   );
// // };
// // export default CajaForm;


// // src/components/cajas/CajaForm.tsx (FINAL v8 - Obtiene rolId de useAuth + 100% Completo)
// import React, { useState, useEffect, useCallback, useMemo } from 'react'; // Asegurar useMemo y useCallback
// import {
//     Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
//     Input, Spinner, Select, SelectItem // Asegurar imports
// } from "@heroui/react";
// import { TipoBodega, CajaFormData, ClasificacionCalidad, EstadoCaja } from '../../types'; // Importar tipos necesarios
// import { useAuth } from '../../contexts/AuthContext'; // <-- IMPORTAR useAuth

// // Opciones para Select Tipo Bodega
// const tipoBodegaOptions: { key: TipoBodega; label: string }[] = [
//     { key: 'PT', label: 'Producto Terminado' },
//     { key: 'INSUMOS', label: 'Insumos' }, // El estado final será manejado en CajasPage
// ];
// // Opciones para Select Clasificación Calidad
// const clasificacionOptions: { key: ClasificacionCalidad; label: string }[] = [
//     { key: 'P', label: 'P - Primera' },
//     { key: 'SS', label: 'SS - Segunda Selección' },
//     { key: 'SP', label: 'SP - Subproducto' },
// ];

// // Props del componente
// interface CajaFormProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onSubmit: (formData: CajaFormData) => Promise<{ id: string; ean_caja: string; tipo_bodega: TipoBodega | null; estado: EstadoCaja; clasificacion_calidad: ClasificacionCalidad | null } | null>;
//   tipoBodegaUsuario: TipoBodega | null; // Tipo del operario (null si Admin)
//   isAdmin: boolean; // Indica si el usuario es Admin (pasado como prop)
// }

// // --- Componente Funcional ---
// const CajaForm: React.FC<CajaFormProps> = ({
//     isOpen,
//     onClose,
//     onSubmit,
//     tipoBodegaUsuario,
//     isAdmin // Prop recibida de CajasPage
// }) => {
//   // --- Estados Locales ---
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [newEan, setNewEan] = useState<string | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [formData, setFormData] = useState<CajaFormData>({
//       tipo_bodega: null,
//       clasificacion_calidad: null
//   });

//   // *** OBTENER rolId DEL CONTEXTO Auth ***
//   const { rolId } = useAuth();
//   // isAdmin ya se recibe como prop, pero si lo necesitáramos localmente desde el contexto:
//   // const esAdminLocal = useMemo(() => rolId === 1, [rolId]);

//   // --- Efecto para Inicializar/Resetear Formulario ---
//   useEffect(() => {
//     if (isOpen) {
//       const initialTipo = isAdmin ? null : tipoBodegaUsuario;
//       const initialCalidad = (!isAdmin && initialTipo === 'PT') ? 'P' : null; // Op PT crea calidad 'P'
//       setFormData({ tipo_bodega: initialTipo, clasificacion_calidad: initialCalidad });
//       setError(null);
//       setNewEan(null);
//       setIsSubmitting(false);
//       console.log("[CajaForm] Modal abierto. isAdmin:", isAdmin, "Tipo Def:", initialTipo, "Calidad Def:", initialCalidad);
//     }
//   }, [isOpen, isAdmin, tipoBodegaUsuario]); // Dependencias correctas

//   // --- Manejadores de Cambio ---
//   const handleTipoChange = useCallback((keys: Set<React.Key> | React.Key) => {
//     if (newEan) return; // No permitir cambio si ya se generó EAN
//     let selectedKey: TipoBodega | null = null;
//     if (keys instanceof Set) { selectedKey = Array.from(keys)[0]?.toString() as TipoBodega || null; }
//     else if (keys){ selectedKey = keys.toString() as TipoBodega; }
//     setFormData(prev => ({ ...prev, tipo_bodega: selectedKey }));
//     if (selectedKey) setError(null);
//   }, [newEan]); // Depende de newEan

//   const handleCalidadChange = useCallback((keys: Set<React.Key> | React.Key) => {
//     if (newEan) return;
//     let selectedKey: ClasificacionCalidad | null = null;
//     if (keys instanceof Set) { selectedKey = Array.from(keys)[0]?.toString() as ClasificacionCalidad || null; }
//     else if (keys){ selectedKey = keys.toString() as ClasificacionCalidad; }
//     setFormData(prev => ({ ...prev, clasificacion_calidad: selectedKey }));
//   }, [newEan]);

//   // --- Manejador de Submit (Crear Caja) ---
//   const handleSubmit = async () => {
//     setError(null); setNewEan(null);
//     if (!formData.tipo_bodega) { setError("Debe seleccionar un Tipo de Bodega."); return; }
//     // Validar que Operario Insumos (rol 3) no pueda crear si NO es también Admin
//     if (rolId === 3 && !isAdmin) { setError("Operarios de Insumos no pueden crear cajas."); return; }

//     setIsSubmitting(true);
//     try {
//       const newCaja = await onSubmit(formData); // Llama a handleCreateCajaSubmit de CajasPage
//       if (newCaja && newCaja.ean_caja) {
//         setNewEan(newCaja.ean_caja);
//         console.log("[CajaForm] Caja creada, EAN:", newCaja.ean_caja);
//       } else { setError("Error al crear la caja. Revise consola."); }
//     } catch (submitError) { console.error("[CajaForm] Error inesperado:", submitError); setError("Error inesperado."); }
//     finally { setIsSubmitting(false); }
//   };

//   // --- Manejador para Cierre del Modal ---
//   const handleModalClose = () => { setError(null); setNewEan(null); setIsSubmitting(false); setFormData({ tipo_bodega: null, clasificacion_calidad: null }); onClose(); }

//   // --- JSX del Modal ---
//   return (
//     <Modal isOpen={isOpen} onOpenChange={onClose} placement="top-center" backdrop="blur" onClose={handleModalClose}>
//       <ModalContent className="dark:bg-gray-800">
//         {(modalCloseInternal) => (
//           <>
//             <ModalHeader className="flex flex-col gap-1 dark:text-white">Nueva Caja</ModalHeader>
//             <ModalBody>
//               {/* Select Tipo Bodega */}
//               <Select
//                 isRequired label="Tipo de Bodega *" placeholder={isAdmin ? "Seleccione tipo..." : (tipoBodegaUsuario === 'PT' ? 'Producto Terminado' : 'Insumos')}
//                 selectedKeys={formData.tipo_bodega ? new Set([formData.tipo_bodega]) : undefined}
//                 onSelectionChange={handleTipoChange}
//                 isDisabled={isSubmitting || !isAdmin || !!newEan}
//                 variant="bordered" aria-label="Tipo Bodega Caja"
//                 isInvalid={!!error && !formData.tipo_bodega}
//                 errorMessage={!formData.tipo_bodega && error ? "Seleccione un tipo" : undefined}
//                 className="w-full mb-4"
//               >
//                 {tipoBodegaOptions.map((tipo) => (<SelectItem key={tipo.key} value={tipo.key} textValue={tipo.label}>{tipo.label}</SelectItem>))}
//               </Select>

//               {/* Select Clasificación Calidad */}
//               <Select
//                 label="Clasificación Calidad (Opcional)" placeholder="Seleccione calidad..."
//                 selectedKeys={formData.clasificacion_calidad ? new Set([formData.clasificacion_calidad]) : undefined}
//                 onSelectionChange={handleCalidadChange}
//                 isDisabled={isSubmitting || !isAdmin || !!newEan}
//                 variant="bordered" aria-label="Clasificación Calidad Caja"
//                 className="w-full mb-4"
//               >
//                  <SelectItem key="" value={null} textValue="Ninguna">Ninguna</SelectItem>
//                  {clasificacionOptions.map((calidad) => (<SelectItem key={calidad.key} value={calidad.key} textValue={calidad.label}>{calidad.label}</SelectItem>))}
//               </Select>

//               <p className="text-sm text-gray-600 dark:text-gray-400 mt-2"> Se generará un EAN-13 único. Imprima y pegue la etiqueta.</p>
//               {newEan && ( <Input isReadOnly label="EAN-13 Generado:" value={newEan} variant="faded" className="mt-4" description="Anote este número."/> )}
//               {isSubmitting && <div className="flex justify-center mt-4"><Spinner size="sm" /></div>}
//               {error && !newEan && <p className="text-danger text-small mt-4">{error}</p>}
//             </ModalBody>
//             <ModalFooter>
//               <Button color="danger" variant="flat" onPress={handleModalClose} isDisabled={isSubmitting}> {newEan ? 'Cerrar' : 'Cancelar'} </Button>
//               {!newEan && (
//                  <Button
//                    color="primary"
//                    onPress={handleSubmit}
//                    isLoading={isSubmitting}
//                    // CORRECCIÓN FINAL: Operario Insumos (rol 3) no puede crear, A MENOS que sea Admin
//                    isDisabled={!formData.tipo_bodega || (rolId === 3 && !isAdmin)}
//                  >
//                    Generar y Crear Caja
//                  </Button>
//               )}
//             </ModalFooter>
//           </>
//         )}
//       </ModalContent>
//     </Modal>
//   );
// };
// export default CajaForm; // Exportar

// src/components/cajas/CajaForm.tsx (FINAL v9 - Fix SelectItem/Unused + Completo)
import React, { useState, useEffect, useCallback } from 'react'; // Quitado useMemo si no se usa
import {
    Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
    Input, Spinner, Select, SelectItem // Asegurar imports
} from "@heroui/react";
// Importar tipos necesarios
import { TipoBodega, CajaFormData, ClasificacionCalidad, EstadoCaja } from '../../types'; // Ajusta ruta
import { useAuth } from '../../contexts/AuthContext'; // Importar useAuth

// Opciones para Select Tipo Bodega
const tipoBodegaOptions: { key: TipoBodega; label: string }[] = [
    { key: 'PT', label: 'Producto Terminado' },
    { key: 'INSUMOS', label: 'Insumos' },
];
// Opciones para Select Clasificación Calidad
const clasificacionOptions: { key: ClasificacionCalidad; label: string }[] = [
    { key: 'P', label: 'P - Primera' },
    { key: 'SS', label: 'SS - Segunda Selección' },
    { key: 'SP', label: 'SP - Subproducto' },
];

// Props del componente
interface CajaFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: CajaFormData) => Promise<{ id: string; ean_caja: string; tipo_bodega: TipoBodega | null; estado: EstadoCaja; clasificacion_calidad: ClasificacionCalidad | null } | null>;
  tipoBodegaUsuario: TipoBodega | null; // Tipo del operario (null si Admin)
  isAdmin: boolean; // Indica si el usuario es Admin (pasado como prop)
}

// --- Componente Funcional ---
const CajaForm: React.FC<CajaFormProps> = ({
    isOpen,
    onClose, // Usar esta función para cerrar el modal
    onSubmit,
    tipoBodegaUsuario,
    isAdmin
}) => {
  // --- Estados Locales ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newEan, setNewEan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CajaFormData>({
      tipo_bodega: null,
      clasificacion_calidad: null
  });

  // Obtener rolId del contexto para lógica condicional
  const { rolId } = useAuth();

  // --- Efecto para Inicializar/Resetear Formulario ---
  useEffect(() => {
    if (isOpen) {
      const initialTipo = isAdmin ? null : tipoBodegaUsuario;
      const initialCalidad = (!isAdmin && initialTipo === 'PT') ? 'P' : null;
      setFormData({ tipo_bodega: initialTipo, clasificacion_calidad: initialCalidad });
      setError(null);
      setNewEan(null);
      setIsSubmitting(false);
    }
  }, [isOpen, isAdmin, tipoBodegaUsuario]); // Dependencias correctas

  // --- Manejadores de Cambio ---
  const handleTipoChange = useCallback((keys: Set<React.Key> | React.Key) => {
    if (newEan) return;
    let selectedKey: TipoBodega | null = null;
    if (keys instanceof Set) { selectedKey = Array.from(keys)[0]?.toString() as TipoBodega || null; }
    else if (keys){ selectedKey = keys.toString() as TipoBodega; }
    setFormData(prev => ({ ...prev, tipo_bodega: selectedKey }));
    if (selectedKey) setError(null);
  }, [newEan]);

  const handleCalidadChange = useCallback((keys: Set<React.Key> | React.Key) => {
    if (newEan) return;
    let selectedKey: ClasificacionCalidad | null = null;
    if (keys instanceof Set) { selectedKey = Array.from(keys)[0]?.toString() as ClasificacionCalidad || null; }
    else if (keys){ selectedKey = keys.toString() as ClasificacionCalidad; }
    setFormData(prev => ({ ...prev, clasificacion_calidad: selectedKey }));
  }, [newEan]);

  // --- Manejador de Submit (Crear Caja) ---
  const handleSubmit = async () => {
    setError(null); setNewEan(null);
    if (!formData.tipo_bodega) { setError("Debe seleccionar un Tipo de Bodega."); return; }
    if (rolId === 3 && !isAdmin) { setError("Operarios de Insumos no pueden crear cajas."); return; }

    setIsSubmitting(true);
    try {
      const newCaja = await onSubmit(formData);
      if (newCaja && newCaja.ean_caja) { setNewEan(newCaja.ean_caja); }
      else { setError("Error al crear la caja."); }
    } catch (submitError) { setError("Error inesperado."); }
    finally { setIsSubmitting(false); }
  };

  // --- Cierre del Modal ---
  // Se usa la prop 'onClose' directamente en onOpenChange del Modal

  // --- JSX del Modal ---
  return (
    // Usar onOpenChange con la prop onClose para manejar el cierre
    <Modal isOpen={isOpen} onOpenChange={onClose} placement="top-center" backdrop="blur">
      <ModalContent className="dark:bg-gray-800">
        {/* La función hija de ModalContent (modalCloseInternal) ya no es necesaria si usamos onClose de props */}
        <>
          <ModalHeader className="flex flex-col gap-1 dark:text-white">Nueva Caja</ModalHeader>
          <ModalBody>
            {/* Select Tipo Bodega */}
            <Select
              isRequired label="Tipo de Bodega *" placeholder={isAdmin ? "Seleccione tipo..." : (tipoBodegaUsuario === 'PT' ? 'Producto Terminado' : 'Insumos')}
              selectedKeys={formData.tipo_bodega ? new Set([formData.tipo_bodega]) : undefined}
              onSelectionChange={handleTipoChange}
              isDisabled={isSubmitting || !isAdmin || !!newEan}
              variant="bordered" aria-label="Tipo Bodega Caja"
              isInvalid={!!error && !formData.tipo_bodega}
              errorMessage={!formData.tipo_bodega && error ? "Seleccione un tipo" : undefined}
              className="w-full mb-4"
            >
              {/* CORRECCIÓN: Quitar prop 'value' de SelectItem */}
              {tipoBodegaOptions.map((tipo) => (<SelectItem key={tipo.key} textValue={tipo.label}>{tipo.label}</SelectItem>))}
            </Select>

            {/* Select Clasificación Calidad */}
            <Select
              label="Clasificación Calidad (Opcional)" placeholder="Seleccione calidad..."
              selectedKeys={formData.clasificacion_calidad ? new Set([formData.clasificacion_calidad]) : undefined}
              onSelectionChange={handleCalidadChange}
              isDisabled={isSubmitting || !isAdmin || !!newEan}
              variant="bordered" aria-label="Clasificación Calidad Caja"
              className="w-full mb-4"
            >
               {/* CORRECCIÓN: Quitar prop 'value' de SelectItem */}
               <SelectItem key="" textValue="Ninguna">Ninguna</SelectItem> {/* 'key' vacía para valor null/undefined */}
               {clasificacionOptions.map((calidad) => (<SelectItem key={calidad.key} textValue={calidad.label}>{calidad.label}</SelectItem>))}
            </Select>

            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2"> Se generará un EAN-13 único. Imprima y pegue la etiqueta.</p>
            {newEan && ( <Input isReadOnly label="EAN-13 Generado:" value={newEan} variant="faded" className="mt-4" description="Anote este número."/> )}
            {isSubmitting && <div className="flex justify-center mt-4"><Spinner size="sm" /></div>}
            {error && !newEan && <p className="text-danger text-small mt-4">{error}</p>}
          </ModalBody>
          <ModalFooter>
            {/* Usar onClose directamente para el botón Cancelar/Cerrar */}
            <Button color="danger" variant="flat" onPress={onClose} isDisabled={isSubmitting}> {newEan ? 'Cerrar' : 'Cancelar'} </Button>
            {!newEan && (
               <Button color="primary" onPress={handleSubmit} isLoading={isSubmitting} isDisabled={!formData.tipo_bodega || (rolId === 3 && !isAdmin)}> Generar y Crear Caja </Button>
            )}
          </ModalFooter>
        </>
      </ModalContent>
    </Modal>
  );
};
export default CajaForm; // Exportar