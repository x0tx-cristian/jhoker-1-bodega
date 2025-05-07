// src/components/cajas/CajaForm.tsx
import React, { useState, useEffect, useCallback } from 'react'; // Quitamos useMemo
import {
    Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
    Input, Spinner, Select, SelectItem
} from "@heroui/react";
import { TipoBodega, CajaFormData, ClasificacionCalidad, EstadoCaja } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

// Opciones para Tipo Bodega (sin cambios)
const tipoBodegaOptions: { key: TipoBodega; label: string }[] = [
    { key: 'PT', label: 'Producto Terminado' },
    { key: 'INSUMOS', label: 'Insumos' },
];

// Opciones para Clasificación Calidad (fuente de datos para la prop 'items')
const clasificacionOptionsData: { key: ClasificacionCalidad | ""; label: string }[] = [
    { key: "", label: 'Ninguna' },
    { key: 'P', label: 'P - Primera' },
    { key: 'SS', label: 'SS - Segunda Selección' },
    { key: 'SP', label: 'SP - Subproducto' },
];


interface CajaFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: CajaFormData) => Promise<{ id: string; ean_caja: string; tipo_bodega: TipoBodega | null; estado: EstadoCaja; clasificacion_calidad: ClasificacionCalidad | null } | null>;
  tipoBodegaUsuario: TipoBodega | null;
  isAdmin: boolean;
}

const CajaForm: React.FC<CajaFormProps> = ({ isOpen, onClose, onSubmit, tipoBodegaUsuario, isAdmin }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newEan, setNewEan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CajaFormData>({
      tipo_bodega: null,
      clasificacion_calidad: null
  });

  const { rolId } = useAuth();

  useEffect(() => {
    if (isOpen) {
      const initialTipo = isAdmin ? null : tipoBodegaUsuario;
      const initialCalidad = (!isAdmin && initialTipo === 'PT') ? 'P' : null;
      setFormData({ tipo_bodega: initialTipo, clasificacion_calidad: initialCalidad });
      setError(null);
      setNewEan(null);
      setIsSubmitting(false);
    }
  }, [isOpen, isAdmin, tipoBodegaUsuario]);

  const handleTipoChange = useCallback((keys: Set<React.Key> | React.Key) => {
    if (newEan) return;
    let selectedKey: TipoBodega | null = null;
    if (keys instanceof Set) {
        const firstKey = Array.from(keys)[0];
        selectedKey = firstKey?.toString() as TipoBodega || null;
    } else if (keys !== undefined && keys !== null){
        selectedKey = keys.toString() as TipoBodega;
    }
    setFormData(prev => ({ ...prev, tipo_bodega: selectedKey }));
    if (selectedKey) setError(null);
  }, [newEan]);

  const handleCalidadChange = useCallback((keys: Set<React.Key> | React.Key) => {
    if (newEan) return;
    let selectedKey: ClasificacionCalidad | null = null;
    let selectedKeyString = '';
     if (keys instanceof Set) {
        selectedKeyString = Array.from(keys)[0]?.toString() || '';
    } else if (keys !== undefined && keys !== null){
        selectedKeyString = keys.toString();
    }
    // Manejar el caso "" explícitamente para null
    if (selectedKeyString === '') {
        selectedKey = null;
    } else {
        selectedKey = selectedKeyString as ClasificacionCalidad;
    }
    setFormData(prev => ({ ...prev, clasificacion_calidad: selectedKey }));
  }, [newEan]);


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

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} placement="top-center" backdrop="blur">
      <ModalContent className="dark:bg-gray-800">
        <>
          <ModalHeader className="flex flex-col gap-1 dark:text-white">Nueva Caja</ModalHeader>
          <ModalBody>
            {/* Select Tipo Bodega (asumiendo que este ya estaba bien) */}
            <Select
              isRequired
              label="Tipo de Bodega *"
              placeholder={isAdmin ? "Seleccione tipo..." : (tipoBodegaUsuario === 'PT' ? 'Producto Terminado' : 'Insumos')}
              selectedKeys={formData.tipo_bodega ? new Set([formData.tipo_bodega]) : undefined}
              onSelectionChange={handleTipoChange}
              isDisabled={isSubmitting || !isAdmin || !!newEan}
              variant="bordered"
              aria-label="Tipo Bodega Caja"
              isInvalid={!!error && !formData.tipo_bodega}
              errorMessage={!formData.tipo_bodega && error ? "Seleccione un tipo" : undefined}
              className="w-full mb-4"
            >
              {tipoBodegaOptions.map((tipo) => (
                <SelectItem key={tipo.key} textValue={tipo.label}>
                  {tipo.label}
                </SelectItem>
              ))}
            </Select>

            {/* Select Clasificación Calidad (Refactorizado con prop 'items') */}
            <Select
              items={clasificacionOptionsData} // <-- PASAR DATOS AQUÍ
              label="Clasificación Calidad (Opcional)"
              placeholder="Seleccione calidad..."
              // selectedKeys necesita manejar '' como la representación de null/undefined
              selectedKeys={formData.clasificacion_calidad !== null && formData.clasificacion_calidad !== undefined ? new Set([formData.clasificacion_calidad]) : new Set([''])}
              onSelectionChange={handleCalidadChange}
              isDisabled={isSubmitting || !isAdmin || !!newEan}
              variant="bordered"
              aria-label="Clasificación Calidad Caja"
              className="w-full mb-4"
            >
              {/* Usar una función como hijo para renderizar cada item */}
              {(item) => (
                <SelectItem key={item.key} textValue={item.label}>
                  {item.label}
                </SelectItem>
              )}
            </Select>

            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2"> Se generará un EAN-13 único. Imprima y pegue la etiqueta.</p>
            {newEan && ( <Input isReadOnly label="EAN-13 Generado:" value={newEan} variant="faded" className="mt-4" description="Anote este número."/> )}
            {isSubmitting && <div className="flex justify-center mt-4"><Spinner size="sm" /></div>}
            {error && !newEan && <p className="text-danger text-small mt-4">{error}</p>}
          </ModalBody>
          <ModalFooter>
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
export default CajaForm;