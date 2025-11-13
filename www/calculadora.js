/**
 * calculadora.js
 * Lógica de la calculadora de divisas con conversión automática
 * @version 1.2
 */

class CalculadoraDivisas {
    constructor() {
        this.pantalla = document.getElementById('pantalla');
        this.calculadora = document.getElementById('calculadora');
        this.btnCalculadora = document.getElementById('btnCalculadora');
        this.btnCerrar = document.getElementById('btnCerrarCalculadora');
        
        // Elementos de resultados
        this.resultadoUsd = document.getElementById('resultadoUsd');
        this.resultadoEur = document.getElementById('resultadoEur');
        this.resultadoBsUsd = document.getElementById('resultadoBsUsd');
        this.resultadoBsEur = document.getElementById('resultadoBsEur');
        this.resultadosConversion = document.getElementById('resultadosConversion');
        
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
        this.actualizarResultados(); // Inicializar resultados
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
                this.actualizarResultados(); // Actualizar resultados automáticamente
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
                            this.actualizarResultados(); // Actualizar resultados con nuevas tasas
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
     * Actualiza todos los resultados de conversión automáticamente
     */
    actualizarResultados() {
        // Convertir el valor de la pantalla a número
        let valorTexto = this.valorActual.replace(/\./g, '').replace(',', '.');
        const valor = parseFloat(valorTexto);
        
        if (isNaN(valor) || valor <= 0) {
            this.limpiarResultados();
            return;
        }
        
        // Obtener tasas
        const tasaUSD = this.tasasCambio.USD;
        const tasaEUR = this.tasasCambio.EUR;
        
        if (tasaUSD === 0 || tasaEUR === 0) {
            this.limpiarResultados();
            return;
        }
        
        // Conversión USD → Bs
        const usdToBs = valor * tasaUSD;
        this.resultadoUsd.textContent = this.formatearNumero(usdToBs) + ' Bs';
        
        // Conversión EUR → Bs
        const eurToBs = valor * tasaEUR;
        this.resultadoEur.textContent = this.formatearNumero(eurToBs) + ' Bs';
        
        // Conversión Bs → USD
        const bsToUsd = valor / tasaUSD;
        this.resultadoBsUsd.textContent = this.formatearNumero(bsToUsd) + ' USD';
        
        // Conversión Bs → EUR
        const bsToEur = valor / tasaEUR;
        this.resultadoBsEur.textContent = this.formatearNumero(bsToEur) + ' EUR';
        
        // Efecto visual de actualización
        this.mostrarEfectoActualizacion();
    }
    
    /**
     * Limpia los resultados
     */
    limpiarResultados() {
        this.resultadoUsd.textContent = '0,00 Bs';
        this.resultadoEur.textContent = '0,00 Bs';
        this.resultadoBsUsd.textContent = '0,00 USD';
        this.resultadoBsEur.textContent = '0,00 EUR';
    }
    
    /**
     * Muestra efecto visual en los resultados
     */
    mostrarEfectoActualizacion() {
        this.resultadosConversion.classList.add('resultado-actualizado');
        setTimeout(() => {
            this.resultadosConversion.classList.remove('resultado-actualizado');
        }, 600);
    }
    
    /**
     * Formatea números con separadores de miles
     */
    formatearNumero(numero) {
        if (isNaN(numero) || numero === 0) return '0,00';
        
        return numero.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
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
            // Se eliminó el caso 'convertir-auto'
        }
    }
    
    /**
     * Realiza el cálculo matemático
     */
    calcular() {
        if (this.operacion === null || this.esperandoNuevoValor) return;
        
        const anterior = parseFloat(this.valorAnterior.replace(/\./g, '').replace(',', '.'));
        const actual = parseFloat(this.valorActual.replace(/\./g, '').replace(',', '.'));
        
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
        this.actualizarResultados();
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
        this.limpiarResultados();
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
        this.actualizarResultados();
    }
    
    /**
     * Actualiza la pantalla de la calculadora
     */
    actualizarPantalla() {
        // Formatear número con separadores de miles
        const partes = this.valorActual.split('.');
        if (partes[0]) {
            partes[0] = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        }
        
        this.pantalla.value = partes.join(',');
    }
}

// Inicializar calculadora cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.calculadoraDivisas = new CalculadoraDivisas();
});