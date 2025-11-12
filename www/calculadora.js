/**
 * calculadora.js
 * Lógica de la calculadora de divisas con control de visibilidad
 * @version 1.1
 */

class CalculadoraDivisas {
    constructor() {
        this.pantalla = document.getElementById('pantalla');
        this.monedaOrigen = document.getElementById('monedaOrigen');
        this.calculadora = document.getElementById('calculadora');
        this.btnCalculadora = document.getElementById('btnCalculadora');
        this.btnCerrar = document.getElementById('btnCerrarCalculadora');
        
        this.valorActual = '0';
        this.valorAnterior = '';
        this.operacion = null;
        this.esperandoNuevoValor = false;
        
        this.tasasCambio = {
            USD: 0,
            EUR: 0
        };
        
        this.inicializarEventos();
        this.obtenerTasasCambio();
        this.inicializarVisibilidad();
    }
    
    /**
     * Inicializa el control de visibilidad
     */
    inicializarVisibilidad() {
        // Evento para mostrar calculadora
        this.btnCalculadora.addEventListener('click', () => {
            this.mostrarCalculadora();
        });
        
        // Evento para ocultar calculadora
        this.btnCerrar.addEventListener('click', () => {
            this.ocultarCalculadora();
        });
        
        // Ocultar calculadora al hacer clic fuera de ella
        document.addEventListener('click', (event) => {
            if (!this.calculadora.contains(event.target) && 
                !this.btnCalculadora.contains(event.target) &&
                this.calculadora.classList.contains('mostrada')) {
                this.ocultarCalculadora();
            }
        });
    }
    
    /**
     * Muestra la calculadora con animación
     */
    mostrarCalculadora() {
        this.calculadora.classList.remove('oculta');
        setTimeout(() => {
            this.calculadora.classList.add('mostrada');
            this.btnCalculadora.classList.add('activo');
        }, 10);
    }
    
    /**
     * Oculta la calculadora con animación
     */
    ocultarCalculadora() {
        this.calculadora.classList.remove('mostrada');
        this.btnCalculadora.classList.remove('activo');
        setTimeout(() => {
            this.calculadora.classList.add('oculta');
        }, 300);
    }
    
    /**
     * Inicializa todos los event listeners de la calculadora
     */
    inicializarEventos() {
        // Botones numéricos
        document.querySelectorAll('.btn-numero').forEach(boton => {
            boton.addEventListener('click', () => {
                this.agregarNumero(boton.getAttribute('data-value'));
            });
        });
        
        // Botones de operación
        document.querySelectorAll('.btn-operador').forEach(boton => {
            boton.addEventListener('click', () => {
                this.seleccionarOperacion(boton.getAttribute('data-action'));
            });
        });
        
        // Botones especiales
        document.querySelectorAll('[data-action]').forEach(boton => {
            const action = boton.getAttribute('data-action');
            if (action !== 'sumar' && action !== 'restar' && 
                action !== 'multiplicar' && action !== 'dividir') {
                boton.addEventListener('click', () => {
                    this.ejecutarAccion(action);
                });
            }
        });
        
        // Evento para el selector de moneda
        this.monedaOrigen.addEventListener('change', () => {
            this.actualizarPantalla();
        });
    }
    
    /**
     * Obtiene las tasas de cambio del widget BCV
     */
    obtenerTasasCambio() {
        // Esperar a que el widget BCV esté disponible
        const verificarTasas = () => {
            if (window.widgetBCV && window.widgetBCV.ultimaActualizacion) {
                // Obtener tasas del widget BCV
                fetch('scraper_bcv.php')
                    .then(response => response.json())
                    .then(datos => {
                        if (datos.usd && datos.eur) {
                            this.tasasCambio.USD = datos.usd.valor;
                            this.tasasCambio.EUR = datos.eur.valor;
                            console.log('💱 Tasas de cambio cargadas:', this.tasasCambio);
                        }
                    })
                    .catch(error => {
                        console.error('Error al obtener tasas para calculadora:', error);
                    });
            } else {
                // Reintentar después de 1 segundo
                setTimeout(verificarTasas, 1000);
            }
        };
        
        verificarTasas();
    }
    
    /**
     * Agrega un número a la pantalla
     */
    agregarNumero(numero) {
        if (this.esperandoNuevoValor) {
            this.valorActual = numero;
            this.esperandoNuevoValor = false;
        } else {
            this.valorActual = this.valorActual === '0' ? numero : this.valorActual + numero;
        }
        this.actualizarPantalla();
    }
    
    /**
     * Selecciona una operación matemática
     */
    seleccionarOperacion(operacion) {
        if (this.valorActual === '0') return;
        
        if (this.valorAnterior !== '') {
            this.calcular();
        }
        
        this.operacion = operacion;
        this.valorAnterior = this.valorActual;
        this.esperandoNuevoValor = true;
    }
    
    /**
     * Ejecuta acciones especiales
     */
    ejecutarAccion(accion) {
        switch (accion) {
            case 'limpiar':
                this.limpiar();
                break;
            case 'borrar':
                this.borrarUltimo();
                break;
            case 'calcular':
                this.calcular();
                break;
            case 'convertir':
                this.convertirDivisa();
                break;
        }
    }
    
    /**
     * Realiza el cálculo matemático
     */
    calcular() {
        if (this.operacion === null || this.esperandoNuevoValor) return;
        
        const anterior = parseFloat(this.valorAnterior);
        const actual = parseFloat(this.valorActual);
        
        if (isNaN(anterior) || isNaN(actual)) return;
        
        let resultado;
        
        switch (this.operacion) {
            case 'sumar':
                resultado = anterior + actual;
                break;
            case 'restar':
                resultado = anterior - actual;
                break;
            case 'multiplicar':
                resultado = anterior * actual;
                break;
            case 'dividir':
                resultado = actual !== 0 ? anterior / actual : 'Error';
                break;
            default:
                return;
        }
        
        this.valorActual = resultado.toString();
        this.operacion = null;
        this.valorAnterior = '';
        this.esperandoNuevoValor = true;
        this.actualizarPantalla();
    }
    
    /**
     * Convierte entre divisas
     */
    convertirDivisa() {
        const valor = parseFloat(this.valorActual);
        if (isNaN(valor) || valor <= 0) return;
        
        const conversion = this.monedaOrigen.value;
        let resultado;
        let simbolo = '';
        
        this.calculadora.classList.add('calculadora-convertiendo');
        
        switch (conversion) {
            case 'USD':
                resultado = valor * this.tasasCambio.USD;
                simbolo = 'Bs';
                break;
            case 'EUR':
                resultado = valor * this.tasasCambio.EUR;
                simbolo = 'Bs';
                break;
            case 'BS':
                resultado = this.tasasCambio.USD > 0 ? valor / this.tasasCambio.USD : 0;
                simbolo = 'USD';
                break;
            case 'BS-EUR':
                resultado = this.tasasCambio.EUR > 0 ? valor / this.tasasCambio.EUR : 0;
                simbolo = 'EUR';
                break;
        }
        
        if (resultado > 0) {
            this.valorActual = resultado.toFixed(2);
            this.actualizarPantalla();
            
            // Efecto visual de conversión exitosa
            this.pantalla.classList.add('pantalla-resultado');
            setTimeout(() => {
                this.pantalla.classList.remove('pantalla-resultado');
            }, 1000);
        }
        
        setTimeout(() => {
            this.calculadora.classList.remove('calculadora-convertiendo');
        }, 500);
    }
    
    /**
     * Limpia la calculadora
     */
    limpiar() {
        this.valorActual = '0';
        this.valorAnterior = '';
        this.operacion = null;
        this.esperandoNuevoValor = false;
        this.actualizarPantalla();
    }
    
    /**
     * Borra el último carácter
     */
    borrarUltimo() {
        if (this.valorActual.length > 1) {
            this.valorActual = this.valorActual.slice(0, -1);
        } else {
            this.valorActual = '0';
        }
        this.actualizarPantalla();
    }
    
    /**
     * Actualiza la pantalla de la calculadora
     */
    actualizarPantalla() {
        // Formatear número con separadores de miles
        const partes = this.valorActual.split('.');
        partes[0] = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        
        this.pantalla.value = partes.join(',');
    }
}

// Inicializar calculadora cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.calculadoraDivisas = new CalculadoraDivisas();
});