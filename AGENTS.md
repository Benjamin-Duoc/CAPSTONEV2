# Reglas de Desarrollo y Directrices de Agentes (CiPress)

Este documento contiene las reglas de diseño, experiencia de usuario y arquitectura que deben ser respetadas estrictamente por cualquier desarrollador o agente de Inteligencia Artificial que trabaje en el código del ecosistema **CiPress**.

---

## 🚫 Regla Estricta 1: Prohibición de Ventanas y Diálogos Nativos del Navegador

1. **Está TERMINANTEMENTE PROHIBIDO el uso de diálogos nativos del navegador:**
   * ❌ `alert(...)` o `window.alert(...)`
   * ❌ `confirm(...)` o `window.confirm(...)`
   * ❌ `prompt(...)` o `window.prompt(...)`

2. **Justificación:**
   Las alertas y confirmaciones nativas del navegador rompen completamente la estética institucional de CiPress, degradan la experiencia de usuario (UX), bloquean el hilo de ejecución de JavaScript y muestran textos genéricos del sistema operativo que no se alinean con la calidad profesional exigida en una plataforma editorial.

---

## 🛡️ Regla Estricta 2: Cero Diálogos Redundantes y Alertas Estrictamente Condicionales

1. **Prohibición de Doble Confirmación o Modales Encadenados:**
   * ❌ Jamás concatenar dos confirmaciones para una misma acción (ej: una vista secundaria preguntando *¿Deseas eliminar este registro?* y la función en `App.tsx` abriendo un segundo diálogo preguntando *¿Estás seguro?*).
   * Si la vista secundaria o componente hijo ya dispone de un `CiPressModal` para confirmar la acción, la función ejecutora en el componente padre (`App.tsx`) debe ser atómica y no debe volver a preguntar confirmación.

2. **Prohibición Absoluta de "Falso Éxito":**
   * ❌ **NUNCA** disparar una alerta de éxito (*"Guardado con éxito"*, *"Publicación eliminada"*, etc.) de manera sincrónica, optimista o antes de verificar que la persistencia en base de datos concluyó exitosamente.
   * Cualquier mutación de datos debe ejecutarse con `await` dentro de un bloque `try...catch` (o comprobando explícitamente `if (res.ok)`).
   * **Regla de oro:** Si la petición HTTP falla o el usuario cancela la confirmación, **ES IMPOSIBLE** que la alerta de éxito se renderice.
   * En caso de fallo en el servidor o corte de red, el flujo debe entrar obligatoriamente al bloque `catch`, desplegar un modal de error (`danger` o `warning`) y mantener los formularios abiertos con los datos del usuario intactos para evitar la pérdida de su trabajo.

3. **Prohibición de Botones "Cancelar" en Alertas Informativas o de Error:**
   * ❌ En avisos donde no hay nada que confirmar o cancelar (notificaciones de error, campos obligatorios incompletos, cuotas alcanzadas), **no debe mostrarse un botón secundario "Cancelar"**.
   * Mostrar `[ Cancelar ]` y `[ Entendido ]` a la vez en una alerta genera confusión porque ambos botones realizan exactamente la misma acción (cerrar el modal).
   * El botón secundario `Cancelar` queda estrictamente reservado para confirmaciones interactivas (`type: 'confirm'` o eliminaciones destructivas `type: 'danger'`).

---

## 🏗️ Arquitectura de Ejecutores Directos (`execute*` vs `handle*`)

Para prevenir diálogos duplicados y excepciones silenciadas (*error swallowing*), en `App.tsx` se debe seguir el patrón de separación de responsabilidades:

1. **Funciones Ejecutoras Directas (`execute<Accion><Entidad>`):**
   * Realizan la petición asíncrona a la API backend.
   * Actualizan el estado React global (`useState`).
   * **Lanzan el error (`throw`) si el backend falla**, sin mostrar modales propios.
   * Se pasan como props a los dashboards y vistas hijas (`UserDashboard`, `RedactarComunicadoView`, `UrgentCollaborationsView`, `ConfianEnCipressView`, etc.) que gestionan sus propios ciclos de modales institucionales.

2. **Funciones Manejadoras Globales (`handle<Accion><Entidad>`):**
   * Envuelven a `execute*` dentro de `showAppConfirm` y `showAppAlert`.
   * Se reservan exclusivamente para vistas que **NO** poseen un estado de modal interno (como `AdminPanel.tsx` o accesos globales en `Header`).

---

## 🎨 Estándar Requerido para Avisos, Alertas y Confirmaciones

Cualquier acción que requiera confirmar una decisión del usuario, advertir sobre pérdida de datos o notificar el éxito o fracaso de una operación debe realizarse a través de **cuadros de diálogo (modales) personalizados y apegados a la identidad visual de CiPress**:

### 1. Componente Estándar: `CiPressModal`
Se encuentra disponible en:
`project/components/common/CiPressModal.tsx`

Permite configurar fácilmente:
* **`type`:**
  * `'warning'`: Para advertencias de campos incompletos o límites alcanzados (ícono ámbar/naranja).
  * `'confirm'`: Para confirmar descartes de cambios, salidas no guardadas o transiciones de vista (muestra botón primario y botón `Cancelar`).
  * `'danger'`: Para operaciones destructivas como eliminar fotografías, publicaciones o cuentas (ícono rojo y botón de acción en `bg-red-600`), o para notificar errores críticos de servidor (sin botón de cancelación).
  * `'success'`: Para confirmar guardados exitosos, subidas completadas o suscripciones (ícono verde esmeralda).
  * `'info'`: Para mensajes informativos y orientaciones del sistema.
* **`title`:** Título claro en tipografía serif institucional.
* **`message`:** Explicación amigable y detallada.
* **`confirmText` / `cancelText`:** Textos claros en los botones (ej: "Descartar y Cambiar", "Eliminar Foto", "Entendido", "Cancelar").

### 2. Lineamientos Visuales para Modales en CiPress:
* **Fondo (Backdrop):** Oscuro semitransparente con desenfoque elegante (`fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex justify-center items-center p-4`).
* **Tarjeta:** Fondo blanco puro, esquinas redondeadas generosas (`rounded-3xl`), sombra profunda (`shadow-2xl`), borde sutil (`border border-gray-100`).
* **Tipografía:** Títulos con `font-serif font-bold text-gray-900`, textos con `text-sm text-gray-600`.
* **Botón de acción principal:** Naranja institucional CiPress (`bg-primary hover:bg-orange-600 text-white font-bold rounded-xl`) o rojo para eliminaciones (`bg-red-600`).
* **Botón secundario:** Gris suave accesible (`bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl`).
* **Accesibilidad:** Soporte para cerrar con la tecla `Escape` y haciendo clic en el backdrop.

---

## 🧩 Guías Rápidas de Uso en Componentes React

### Caso A: Diálogo de Alerta Simple (Éxito o Error - Sin botón Cancelar)
```tsx
const showAlert = (title: string, message: string, type: CiPressModalType = 'info') => {
    setModalConfig({
        isOpen: true,
        type,
        title,
        message,
        confirmText: 'Entendido',
        onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
    });
};

const handleSave = async (formData: any) => {
    try {
        await onSaveItem(formData);
        showAlert('Guardado Exitoso', 'Tu publicación ha sido guardada en CiPress.', 'success');
    } catch (error) {
        showAlert('Error al Guardar', 'Hubo un problema al conectar con el servidor.', 'danger');
    }
};
```

### Caso B: Diálogo de Confirmación Destructiva (Eliminar con Cancelar)
```tsx
const handleDelete = (id: number) => {
    setModalConfig({
        isOpen: true,
        type: 'danger',
        title: '¿Eliminar Comunicado?',
        message: '¿Estás seguro de que deseas eliminar este comunicado? Esta acción no se puede deshacer.',
        confirmText: 'Eliminar Definitivamente',
        cancelText: 'Cancelar',
        onConfirm: async () => {
            setModalConfig(prev => ({ ...prev, isOpen: false }));
            try {
                await onDeleteItem(id);
                showAlert('Eliminado', 'El comunicado ha sido eliminado con éxito.', 'success');
            } catch (error) {
                showAlert('Error al Eliminar', 'No se pudo completar la eliminación en el servidor.', 'danger');
            }
        }
    });
};
```

Cualquier nuevo desarrollo, refactorización o corrección de bugs debe consultar y adherir obligatoriamente a estas directrices.

