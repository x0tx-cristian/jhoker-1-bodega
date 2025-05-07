// src/components/ubicaciones/UbicacionForm.tsx
import React, { useState, useEffect } from 'react';
import {
    Input, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
    Textarea, Select, SelectItem // Asegurar Select y SelectItem
    // CORREGIDO: Quitado Spinner no usado
} from "@heroui/react";
import { Ubicacion, UbicacionFormData, TipoBodega } from '../../types'; // Importar tipos necesarios

// Opciones para el Select de Tipo de Bodega
const tipoBodegaOptions = [
    { key: 'PT', label: 'Producto Terminado' },
    { key: 'INSUMOS', label: 'Insumos' },
];

// Props que recibe el componente
interface UbicacionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: UbicacionFormData, id?: string) => Promise<boolean>;
  initialData?: Ubicacion | null;
  isEditMode: boolean;
  isAdmin: boolean;
  tipoBodegaUsuario: TipoBodega | null;
}

const UbicacionForm: React.FC<UbicacionFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditMode,
  isAdmin,
  tipoBodegaUsuario
}) => {
  // Estado local para los datos del formulario
  const [formData, setFormData] = useState<UbicacionFormData>({
    codigo_visual: '',
    descripcion_adicional: '',
    tipo_bodega: null
  });
  // Estado para mostrar el EAN existente (solo informativo)
  const [eanGenerado, setEanGenerado] = useState<string | null>(null);
  // Estado para controlar el botón de submit
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Estado para mensajes de error del formulario
  const [error, setError] = useState<string | null>(null);

  // Efecto para inicializar/resetear el formulario
  useEffect(() => {
    if (isOpen) {
        if (isEditMode && initialData) {
            setFormData({
                codigo_visual: initialData.codigo_visual,
                descripcion_adicional: initialData.descripcion_adicional ?? '',
                tipo_bodega: initialData.tipo_bodega ?? null
            });
            setEanGenerado(initialData.ean_ubicacion);
        } else {
            setFormData({
                codigo_visual: '',
                descripcion_adicional: '',
                tipo_bodega: isAdmin ? null : tipoBodegaUsuario
            });
            setEanGenerado(null);
        }
        setError(null);
    }
  }, [isOpen, isEditMode, initialData, isAdmin, tipoBodegaUsuario]);

  // CORREGIDO: Quitar función handleChange no usada
  /*
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  */

  // Manejador específico para el cambio en el Select de Tipo Bodega
  const handleSelectChange = (keys: Set<React.Key> | React.Key) => {
    let selectedKey: TipoBodega | null = null;
    if (keys instanceof Set) {
        selectedKey = Array.from(keys)[0]?.toString() as TipoBodega || null;
    } else if (keys) {
        selectedKey = keys.toString() as TipoBodega;
    }
    setFormData(prev => ({ ...prev, tipo_bodega: selectedKey }));
    if (selectedKey) setError(null); // Limpiar error si selecciona algo
  };

  // Manejador para el envío del formulario
  const handleSubmit = async () => {
    setError(null);
    if (!formData.codigo_visual) { setError("Código Visual obligatorio."); return; }
    if (!formData.tipo_bodega) { setError("Tipo de Bodega obligatorio."); return; }

    setIsSubmitting(true);
    const dataToSend: UbicacionFormData = {
        codigo_visual: formData.codigo_visual,
        descripcion_adicional: formData.descripcion_adicional || null,
        tipo_bodega: formData.tipo_bodega
    };

    const success = await onSubmit(dataToSend, isEditMode ? initialData?.id : undefined);
    setIsSubmitting(false);

    if (success) {
      onClose();
    } else {
      setError("Error al guardar. Verifique el Código Visual (¿duplicado?) o consulte la consola.");
    }
  };

  // Manejador para el botón Cancelar o cierre del modal
  const handleModalClose = () => {
    setError(null);
    setIsSubmitting(false);
    setEanGenerado(null);
    // No resetear formData aquí para que no se pierdan cambios si solo cierra y reabre
    onClose();
  }

  // --- JSX del Modal ---
  return (
    <Modal isOpen={isOpen} onOpenChange={handleModalClose} placement="top-center" backdrop="blur">
      <ModalContent className="dark:bg-gray-800">
        <>
          <ModalHeader className="flex flex-col gap-1 dark:text-white">
            {isEditMode ? `Editar Ubicación: ${initialData?.codigo_visual ?? ''}` : 'Nueva Ubicación'}
          </ModalHeader>
          <ModalBody>
            <Input
              isReadOnly={isSubmitting}
              isRequired
              autoFocus={!isEditMode}
              label="Código Visual"
              placeholder="Ej: A1-N1, BODEGA-INS-02"
              value={formData.codigo_visual}
              onValueChange={v => setFormData(p=>({...p, codigo_visual: v}))}
              variant="bordered"
              isInvalid={!!error && !formData.codigo_visual}
              errorMessage={!formData.codigo_visual && error ? "Código Visual es obligatorio" : undefined}
            />
            <Select
              isRequired
              label="Tipo de Bodega"
              placeholder={isAdmin ? "Seleccione tipo..." : (tipoBodegaUsuario ?? "No asignado")}
              selectedKeys={formData.tipo_bodega ? new Set([formData.tipo_bodega]) : undefined}
              onSelectionChange={handleSelectChange}
              isDisabled={isSubmitting || (!isAdmin && (isEditMode || !!tipoBodegaUsuario))}
              variant="bordered"
              aria-label="Tipo de Bodega"
              isInvalid={!!error && !formData.tipo_bodega}
              errorMessage={!formData.tipo_bodega && error ? "Debe seleccionar un tipo" : undefined}
              className="w-full"
            >
              {tipoBodegaOptions.map((tipo) => (
                // CORREGIDO: Quitar prop 'value'
                <SelectItem key={tipo.key} textValue={tipo.label}>
                  {tipo.label}
                </SelectItem>
              ))}
            </Select>
            <Textarea
              label="Descripción Adicional (Opcional)"
              placeholder="Información extra sobre la ubicación..."
              value={formData.descripcion_adicional ?? ''}
              onValueChange={v => setFormData(p=>({...p, descripcion_adicional: v}))}
              isDisabled={isSubmitting}
              variant="bordered"
              minRows={2}
            />
            {eanGenerado && (
                 <Input
                    isReadOnly
                    label="EAN-13 Generado (Solo Informativo)"
                    value={eanGenerado}
                    variant="bordered"
                    className="mt-2"
                 />
            )}
            {error && formData.codigo_visual && formData.tipo_bodega && <p className="text-danger text-small mt-2">{error}</p>}
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="flat" onPress={handleModalClose} isDisabled={isSubmitting}>
              Cancelar
            </Button>
            <Button color="primary" onPress={handleSubmit} isLoading={isSubmitting}>
              {isEditMode ? 'Guardar Cambios' : 'Crear Ubicación'}
            </Button>
          </ModalFooter>
        </>
      </ModalContent>
    </Modal>
  );
};
export default UbicacionForm;