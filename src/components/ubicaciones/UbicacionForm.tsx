// src/components/ubicaciones/UbicacionForm.tsx (FINAL v4 - Lógica Rol para Tipo Bodega Completa)
import React, { useState, useEffect } from 'react';
import {
    Input, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
    Textarea, Select, SelectItem, // Asegurar Select y SelectItem
    Spinner // Añadir Spinner para botón
} from "@heroui/react";
import { Ubicacion, UbicacionFormData, TipoBodega } from '../../types'; // Importar tipos necesarios

// Opciones para el Select de Tipo de Bodega
const tipoBodegaOptions = [
    { key: 'PT', label: 'Producto Terminado' },
    { key: 'INSUMOS', label: 'Insumos' },
];

// Props que recibe el componente
interface UbicacionFormProps {
  isOpen: boolean; // Controla si el modal está visible
  onClose: () => void; // Función para cerrar el modal
  // Función que se ejecuta al guardar, recibe los datos del formulario y opcionalmente el ID a editar
  onSubmit: (formData: UbicacionFormData, id?: string) => Promise<boolean>;
  initialData?: Ubicacion | null; // Datos para precargar en modo edición
  isEditMode: boolean; // Indica si es para editar o crear
  isAdmin: boolean; // Indica si el usuario actual es Administrador
  tipoBodegaUsuario: TipoBodega | null; // Tipo de bodega del usuario Operario (null si Admin)
}

const UbicacionForm: React.FC<UbicacionFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditMode,
  isAdmin, // Recibido para lógica condicional
  tipoBodegaUsuario // Recibido para pre-rellenar/deshabilitar
}) => {
  // Estado local para los datos del formulario
  const [formData, setFormData] = useState<UbicacionFormData>({
    codigo_visual: '',
    descripcion_adicional: '',
    tipo_bodega: null // Inicialmente null
  });
  // Estado para mostrar el EAN existente (solo informativo)
  const [eanGenerado, setEanGenerado] = useState<string | null>(null);
  // Estado para controlar el botón de submit
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Estado para mensajes de error del formulario
  const [error, setError] = useState<string | null>(null);

  // Efecto para inicializar/resetear el formulario cuando cambia el estado isOpen
  useEffect(() => {
    console.log("[UbicForm Effect] isOpen:", isOpen, "isEditMode:", isEditMode, "isAdmin:", isAdmin, "tipoUsuario:", tipoBodegaUsuario);
    if (isOpen) {
        if (isEditMode && initialData) {
            // Modo Editar: Cargar datos de la ubicación existente
            setFormData({
                codigo_visual: initialData.codigo_visual,
                descripcion_adicional: initialData.descripcion_adicional ?? '',
                // Cargar tipo existente. El Select se deshabilitará si no es admin
                tipo_bodega: initialData.tipo_bodega ?? null
            });
            setEanGenerado(initialData.ean_ubicacion); // Mostrar EAN
            console.log("[UbicForm Effect] Cargando datos para editar:", initialData);
        } else {
            // Modo Crear: Limpiar formulario y pre-rellenar tipo si es Operario
            setFormData({
                codigo_visual: '',
                descripcion_adicional: '',
                // Si es Admin, empieza en null para que elija.
                // Si es Operario, usa su tipo de bodega predefinido.
                tipo_bodega: isAdmin ? null : tipoBodegaUsuario
            });
            setEanGenerado(null); // No hay EAN aún
            console.log("[UbicForm Effect] Reseteando para crear. Tipo predefinido:", isAdmin ? 'Ninguno (Admin)' : tipoBodegaUsuario);
        }
        setError(null); // Limpiar errores al abrir
    }
  }, [isOpen, isEditMode, initialData, isAdmin, tipoBodegaUsuario]); // Dependencias correctas

  // Manejador genérico para cambios en Inputs y Textarea
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Manejador específico para el cambio en el Select de Tipo Bodega
  const handleSelectChange = (keys: Set<React.Key> | React.Key) => {
    let selectedKey: TipoBodega | null = null;
    // Extraer la clave seleccionada (puede ser Set o valor directo según NextUI/HeroUI)
    if (keys instanceof Set) {
        selectedKey = Array.from(keys)[0]?.toString() as TipoBodega || null;
    } else if (keys) {
        selectedKey = keys.toString() as TipoBodega;
    }
    setFormData(prev => ({ ...prev, tipo_bodega: selectedKey }));
  };

  // Manejador para el envío del formulario
  const handleSubmit = async () => {
    setError(null); // Limpiar errores previos
    // Validación básica de campos obligatorios
    if (!formData.codigo_visual) { setError("Código Visual obligatorio."); return; }
    if (!formData.tipo_bodega) { setError("Tipo de Bodega obligatorio."); return; } // Tipo siempre requerido

    setIsSubmitting(true); // Bloquear botón
    // Crear objeto de datos a enviar, asegurando null para descripción vacía
    const dataToSend: UbicacionFormData = {
        codigo_visual: formData.codigo_visual,
        descripcion_adicional: formData.descripcion_adicional || null, // Enviar null si está vacío
        tipo_bodega: formData.tipo_bodega // Ya es TipoBodega | null
    };

    // Llamar a la función onSubmit pasada desde la página padre
    const success = await onSubmit(dataToSend, isEditMode ? initialData?.id : undefined);
    setIsSubmitting(false); // Desbloquear botón

    if (success) {
      onClose(); // Cerrar el modal si la operación fue exitosa
    } else {
      // Si onSubmit devuelve false, mostrar error genérico (el toast se maneja en la página)
      setError("Error al guardar. Verifique el Código Visual (¿duplicado?) o consulte la consola.");
    }
  };

  // Manejador para el botón Cancelar o cierre del modal
  const handleModalClose = () => {
    // Resetear estados locales al cerrar
    setError(null);
    setIsSubmitting(false);
    setEanGenerado(null);
    // Resetear formData solo si no estaba en modo edición (para no perder datos si solo cierra)
    // if (!isEditMode) {
    //     setFormData({ codigo_visual: '', descripcion_adicional: '', tipo_bodega: null });
    // }
    onClose(); // Llama a la función onClose de las props
  }

  // --- JSX del Modal ---
  return (
    // Usar onOpenChange para manejar cierre con Esc o clic fuera
    <Modal isOpen={isOpen} onOpenChange={handleModalClose} placement="top-center" backdrop="blur">
      <ModalContent className="dark:bg-gray-800">
        <> {/* Fragmento raíz */}
          <ModalHeader className="flex flex-col gap-1 dark:text-white">
            {isEditMode ? `Editar Ubicación: ${initialData?.codigo_visual ?? ''}` : 'Nueva Ubicación'}
          </ModalHeader>
          <ModalBody>
            {/* Input para Código Visual */}
            <Input
              isReadOnly={isSubmitting} // Deshabilitar durante envío
              isRequired // Marcar como obligatorio
              autoFocus={!isEditMode} // Autofocus solo al crear
              label="Código Visual"
              placeholder="Ej: A1-N1, BODEGA-INS-02"
              value={formData.codigo_visual}
              // Actualizar estado directamente con onValueChange
              onValueChange={v => setFormData(p=>({...p, codigo_visual: v}))}
              variant="bordered"
              isInvalid={!!error && !formData.codigo_visual} // Marcar si hay error y está vacío
              errorMessage={!formData.codigo_visual && error ? "Código Visual es obligatorio" : undefined}
            />
            {/* Select para Tipo de Bodega */}
            <Select
              isRequired // Siempre requerido
              label="Tipo de Bodega"
              placeholder={isAdmin ? "Seleccione tipo..." : (tipoBodegaUsuario ?? "No asignado")} // Placeholder dinámico
              // Clave seleccionada (convertir null a undefined si Select lo requiere)
              selectedKeys={formData.tipo_bodega ? new Set([formData.tipo_bodega]) : undefined}
              onSelectionChange={handleSelectChange} // Manejador de cambio
              // Deshabilitado si: está enviando O NO es Admin Y (está editando O ya tiene un tipo predefinido al crear)
              isDisabled={isSubmitting || (!isAdmin && (isEditMode || !!tipoBodegaUsuario))}
              variant="bordered"
              aria-label="Tipo de Bodega"
              isInvalid={!!error && !formData.tipo_bodega} // Marcar si hay error y no hay tipo
              errorMessage={!formData.tipo_bodega && error ? "Debe seleccionar un tipo" : undefined}
              className="w-full" // Ocupar ancho completo
            >
              {/* Mapear opciones */}
              {tipoBodegaOptions.map((tipo) => (
                <SelectItem key={tipo.key} value={tipo.key} textValue={tipo.label}>
                  {tipo.label}
                </SelectItem>
              ))}
            </Select>
            {/* Textarea para Descripción Adicional */}
            <Textarea
              label="Descripción Adicional (Opcional)"
              placeholder="Información extra sobre la ubicación..."
              value={formData.descripcion_adicional ?? ''}
              onValueChange={v => setFormData(p=>({...p, descripcion_adicional: v}))}
              isDisabled={isSubmitting}
              variant="bordered"
              minRows={2} // Altura mínima
            />
            {/* Mostrar EAN solo si ya existe (modo edición o después de crear si se devolviera) */}
            {eanGenerado && (
                 <Input
                    isReadOnly
                    label="EAN-13 Generado (Solo Informativo)"
                    value={eanGenerado}
                    variant="bordered"
                    className="mt-2"
                 />
            )}
            {/* Mostrar error general si los campos obligatorios están llenos */}
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
export default UbicacionForm; // Exportar componente