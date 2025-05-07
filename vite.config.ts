// vite.config.ts (FINAL - Permite Host Ngrok + Completo)
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // Usando el plugin estándar
import path from "path"
// Plugins para Wasm (aunque no usemos argon2-browser, no hacen daño)
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Plugins necesarios si alguna dependencia usa Wasm/Top-Level Await
    topLevelAwait(),
    wasm(),
  ],
  resolve: {
    // Alias para importar desde src usando '@/'
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // --- CONFIGURACIÓN DEL SERVIDOR DE DESARROLLO ---
  server: {
    // --- host: true ---
    // Hace que el servidor escuche en todas las interfaces de red locales (0.0.0.0)
    // en lugar de solo en localhost. Esto es NECESARIO para que herramientas
    // como ngrok (que se ejecutan en tu máquina) puedan acceder al servidor Vite.
    host: true,

    // --- allowedHosts ---
    // Lista de hosts (además de localhost) desde los cuales se permiten peticiones.
    // Necesario para evitar errores de seguridad de Vite cuando accedes
    // a través de un túnel como ngrok.
    allowedHosts: [
      // Añade aquí el hostname específico de tu túnel ngrok actual
      '5294-181-135-49-247.ngrok-free.app',

      // **Alternativa (Más conveniente si tu URL ngrok cambia a menudo):**
      // Permite CUALQUIER subdominio bajo ngrok-free.app.
      // ¡OJO! Ligeramente menos seguro que especificar el host exacto.
      // Si usas esto, comenta o elimina la línea específica de arriba.
      // '.ngrok-free.app',

      // **Advertencia:** Evita usar '*' a menos que entiendas completamente
      // las implicaciones de seguridad (permite acceso desde CUALQUIER host).
      // '*'
    ]
  },
  // optimizeDeps: {
  //   exclude: ['argon2-browser'] // Ya no es necesario si desinstalaste argon2-browser
  // }
})