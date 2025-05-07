// src/components/referencias/ReferenciaForm.tsx
import React, { useState, useEffect } from 'react';
import { Input, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";
import { Referencia, ReferenciaFormData } from '../../types'; // Importa los tipos (ahora actualizados)

interface ReferenciaFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: ReferenciaFormData, id?: string) => Promise<boolean>; // onSubmit ahora es async y devuelve boolean
  initialData?: Referencia | null; // Datos iniciales para editar
  isEditMode: boolean;
}

const ReferenciaForm: React.FC<ReferenciaFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditMode
}) => {
  const [formData, setFormData] = useState<ReferenciaFormData>({
    ean_referencia: '',
    descripcion: '',
    talla: '', // Inicializar como string vacío está bien
    color: '', // Inicializar como string vacío está bien
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos iniciales cuando el modal se abre en modo edición
  useEffect(() => {
    if (isOpen && isEditMode && initialData) {
      setFormData({
        ean_referencia: initialData.ean_referencia,
        descripcion: initialData.descripcion,
        talla: initialData.talla ?? '', // Carga '' si es null
        color: initialData.color ?? '', // Carga '' si es null
      });
      setError(null); // Limpiar error al abrir
    } else if (isOpen && !isEditMode) {
      // Limpiar formulario al abrir en modo creación
      setFormData({ ean_referencia: '', descripcion: '', talla: '', color: '' });
      setError(null);
    }
  }, [isOpen, isEditMode, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setError(null);
    // Validación básica
    if (!formData.ean_referencia || !formData.descripcion) {
      setError("El EAN y la Descripción son obligatorios.");
      return;
    }
    if (!isEditMode && !formData.ean_referencia) {
         setError("El EAN de referencia es obligatorio al crear.");
         return;
    }

    setIsSubmitting(true);
    // Prepara los datos a enviar, asegurando null para campos vacíos
    const dataToSend: ReferenciaFormData = {
        ean_referencia: formData.ean_referencia,
        descripcion: formData.descripcion,
        // Este ternario ahora es compatible con el tipo ReferenciaFormData modificado
        talla: formData.talla === '' ? null : formData.talla,
        color: formData.color === '' ? null : formData.color,
    };

    const success = await onSubmit(
        dataToSend,
        isEditMode ? initialData?.id : undefined
    );
    setIsSubmitting(false);

    if (success) {
      onClose(); // Cierra el modal solo si la operación fue exitosa
    } else {
      // Muestra un error genérico si onSubmit devuelve false
      setError("Error al guardar la referencia. Verifique los datos o la consola.");
    }
  };

  // Limpiar estado al cerrar
  const handleModalClose = () => {
    setError(null);
    setIsSubmitting(false);
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onOpenChange={handleModalClose} placement="top-center"> {/* Usar handleModalClose */}
      <ModalContent>
        <> {/* No se necesita la función si no usamos el `onClose` del modal interno */}
          <ModalHeader className="flex flex-col gap-1">
            {isEditMode ? 'Editar Referencia' : 'Nueva Referencia'}
          </ModalHeader>
          <ModalBody>
            <Input
              isRequired
              autoFocus={!isEditMode}
              label="EAN Referencia (JOKER)"
              placeholder="Ingrese el EAN proporcionado"
              variant="bordered"
              name="ean_referencia"
              value={formData.ean_referencia}
              onChange={handleChange}
              isDisabled={isEditMode || isSubmitting} // No editable en modo edición
              isInvalid={!!error && !formData.ean_referencia} // Marca inválido si hay error y este campo está vacío
              errorMessage={!formData.ean_referencia && error ? "El EAN de referencia es obligatorio" : undefined}
            />
            <Input
              isRequired
              label="Descripción"
              placeholder="Ingrese la descripción"
              variant="bordered"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              isDisabled={isSubmitting}
              isInvalid={!!error && !formData.descripcion}
              errorMessage={!formData.descripcion && error ? "La descripción es obligatoria" : undefined}
            />
            <Input
              label="Talla (Opcional)"
              placeholder="Ingrese la talla"
              variant="bordered"
              name="talla"
              value={formData.talla ?? ''} // Mostrar '' si es null o undefined
              onChange={handleChange}
              isDisabled={isSubmitting}
            />
            <Input
              label="Color (Opcional)"
              placeholder="Ingrese el color"
              variant="bordered"
              name="color"
              value={formData.color ?? ''} // Mostrar '' si es null o undefined
              onChange={handleChange}
              isDisabled={isSubmitting}
            />
            {/* Mostrar error general si los campos obligatorios están llenos pero hubo otro error */}
            {error && formData.ean_referencia && formData.descripcion && <p className="text-danger text-small">{error}</p>}
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="flat" onPress={handleModalClose} isDisabled={isSubmitting}>
              Cancelar
            </Button>
            <Button color="primary" onPress={handleSubmit} isLoading={isSubmitting}>
              {isEditMode ? 'Guardar Cambios' : 'Crear Referencia'}
            </Button>
          </ModalFooter>
        </>
      </ModalContent>
    </Modal>
  );
};

export default ReferenciaForm;