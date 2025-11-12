/**
 * Widget Corporativo - Tipos de Cambio BCV
 * @version 3.0
 * @description Widget con actualización programada
 */

class WidgetBCV {
    constructor() {
        this.widgetBody = document.getElementById('widgetBody');
        this.fechaTexto = document.getElementById('fechaTexto');
        this.widget = document.getElementById('widgetBCV');
        this.ultimaActualizacion = null;
        this.estaActualizando = false;
        
        this.init();
    }
    
    /**
     * Inicializa el widget
     */
    init() {
        this.actualizarDatos();
        this.programarActualizacionDiaria();
        
        console.log('✅ Widget BCV inicializado - Actualización programada');
    }
    
    /**
     * Actualiza los datos del BCV
     */
    async actualizarDatos() {
        if (this.estaActualizando) return;
        
        this.estaActualizando = true;
        
        try {
            const respuesta = await fetch('scraper_bcv.php');
            
            if (!respuesta.ok) {
                throw new Error(`Error HTTP: ${respuesta.status}`);
            }
            
            const datos = await respuesta.json();
            
            if (datos.error) {
                throw new Error(datos.error);
            }
            
            this.mostrarDatos(datos);
            this.ultimaActualizacion = new Date();
            
            console.log('📊 Datos actualizados:', datos.fecha);
            
        } catch (error) {
            console.error('❌ Error en Widget BCV:', error);
            this.mostrarError(this.obtenerMensajeError(error));
        } finally {
            this.estaActualizando = false;
        }
    }
    
    /**
     * Muestra los datos en el widget
     */
    mostrarDatos(datos) {
        let html = '';
        
        if (datos.usd) {
            html += `
                <div class="moneda-item">
                    <div class="moneda-info">
                        <div class="moneda-simbolo">$</div>
                        <div class="moneda-nombre">
                            <h3>DÓLAR (USD)</h3>
                        </div>
                    </div>
                    <div class="moneda-valor">
                        <div class="valor">${datos.usd.formateado} Bs</div>
                    </div>
                </div>
            `;
        }
        
        if (datos.eur) {
            html += `
                <div class="moneda-item">
                    <div class="moneda-info">
                        <div class="moneda-simbolo">€</div>
                        <div class="moneda-nombre">
                            <h3>EURO (EUR)</h3>
                        </div>
                    </div>
                    <div class="moneda-valor">
                        <div class="valor">${datos.eur.formateado} Bs</div>
                    </div>
                </div>
            `;
        }
        
        this.widgetBody.innerHTML = html;
        this.fechaTexto.textContent = datos.fecha || '--/--/----';
    }
    
    /**
     * Muestra mensajes de error
     */
    mostrarError(mensaje) {
        this.widgetBody.innerHTML = `
            <div class="error-widget">
                ⚠️ ${mensaje}
            </div>
        `;
        
        this.fechaTexto.textContent = '--/--/----';
    }
    
    /**
     * Traduce errores técnicos a mensajes amigables
     */
    obtenerMensajeError(error) {
        const mensajes = {
            'Failed to fetch': 'Error de conexión. Verifique su internet.',
            'Network Error': 'Error de red. Intente nuevamente.',
            'Timeout': 'Tiempo de espera agotado.',
        };
        
        return mensajes[error.message] || error.message || 'Error desconocido';
    }
    
    /**
     * Programa la actualización diaria a horarios específicos
     */
    programarActualizacionDiaria() {
        const horariosActualizacion = [
            '12:00', // Mediodía
            '16:05'  // 4:05 PM
        ];
        
        const programarProximaActualizacion = () => {
            const ahora = new Date();
            const ahoraCaracas = this.obtenerHoraCaracas();
            let proximaActualizacion = null;
            
            // Encontrar el próximo horario de actualización
            for (const horario of horariosActualizacion) {
                const [horas, minutos] = horario.split(':').map(Number);
                const horarioActualizacion = new Date(ahoraCaracas);
                horarioActualizacion.setHours(horas, minutos, 0, 0);
                
                // Si el horario ya pasó hoy, programar para mañana
                if (horarioActualizacion <= ahoraCaracas) {
                    horarioActualizacion.setDate(horarioActualizacion.getDate() + 1);
                }
                
                if (!proximaActualizacion || horarioActualizacion < proximaActualizacion) {
                    proximaActualizacion = horarioActualizacion;
                }
            }
            
            if (proximaActualizacion) {
                const tiempoEspera = proximaActualizacion - ahoraCaracas;
                
                console.log(`⏰ Próxima actualización programada: ${proximaActualizacion.toLocaleString()} (en ${Math.round(tiempoEspera/1000/60)} minutos)`);
                
                setTimeout(() => {
                    this.actualizarDatos();
                    programarProximaActualizacion(); // Programar la siguiente
                }, tiempoEspera);
            }
        };
        
        // Iniciar el ciclo de programación
        programarProximaActualizacion();
        
        // También actualizar si la página se vuelve visible después de las 12:00 o 16:05
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                const ahoraCaracas = this.obtenerHoraCaracas();
                const horaActual = ahoraCaracas.getHours();
                const minutoActual = ahoraCaracas.getMinutes();
                
                // Verificar si es después de los horarios de actualización
                const esDespuesDeActualizacion = 
                    (horaActual > 12 || (horaActual === 12 && minutoActual >= 0)) ||
                    (horaActual > 16 || (horaActual === 16 && minutoActual >= 5));
                
                if (esDespuesDeActualizacion) {
                    const ultimaActualizacionHoy = this.ultimaActualizacion && 
                        this.ultimaActualizacion.getDate() === ahoraCaracas.getDate();
                    
                    if (!ultimaActualizacionHoy) {
                        this.actualizarDatos();
                    }
                }
            }
        });
    }
    
    /**
     * Obtiene la hora actual en Caracas
     */
    obtenerHoraCaracas() {
        return new Date(new Date().toLocaleString("en-US", {timeZone: "America/Caracas"}));
    }
    
    /**
     * Método público para actualizar manualmente
     */
    actualizar() {
        this.actualizarDatos();
    }
    
    /**
     * Método público para obtener estado
     */
    getEstado() {
        return {
            actualizando: this.estaActualizando,
            ultimaActualizacion: this.ultimaActualizacion
        };
    }
}

// Inicialización automática cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.widgetBCV = new WidgetBCV();
});