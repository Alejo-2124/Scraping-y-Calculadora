<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tipos de Cambio BCV</title>
    <link rel="stylesheet" href="estilos.css">
    <link rel="stylesheet" href="calculadora.css">
</head>
<body>
    <div class="contenedor-principal">
        <!-- Widget de Tipos de Cambio -->
        <div class="widget-bcv" id="widgetBCV">
            <div class="widget-header">
                <h1>Tipos de Cambio</h1>
                <p>Banco Central de Venezuela</p>
            </div>
            
            <div class="widget-body" id="widgetBody">
                <!-- Esqueleto de carga -->
                <div class="moneda-item loading-skeleton">
                    <div class="moneda-info">
                        <div class="moneda-simbolo">$</div>
                        <div class="moneda-nombre">
                            <h3 class="skeleton-text" style="width: 120px; height: 16px;">&nbsp;</h3>
                        </div>
                    </div>
                    <div class="moneda-valor">
                        <div class="valor skeleton-text" style="width: 100px; height: 20px;">&nbsp;</div>
                    </div>
                </div>
                <div class="moneda-item loading-skeleton">
                    <div class="moneda-info">
                        <div class="moneda-simbolo">€</div>
                        <div class="moneda-nombre">
                            <h3 class="skeleton-text" style="width: 120px; height: 16px;">&nbsp;</h3>
                        </div>
                    </div>
                    <div class="moneda-valor">
                        <div class="valor skeleton-text" style="width: 100px; height: 20px;">&nbsp;</div>
                    </div>
                </div>
            </div>
            
            <div class="widget-footer">
                <div class="fecha-actualizacion">
                    <span id="fechaTexto">--/--/----</span>
                </div>
                <button class="btn-calculadora" id="btnCalculadora">
                    <span class="btn-texto">Calculadora</span>
                    <span class="btn-icono">▶</span>
                </button>
            </div>
        </div>

        <!-- Calculadora (oculta inicialmente) -->
        <div class="calculadora oculta" id="calculadora">
            <div class="calculadora-header">
                <h2>Calculadora de Divisas</h2>
                <button class="btn-cerrar" id="btnCerrarCalculadora">×</button>
            </div>
            
            <div class="calculadora-body">
                <!-- Pantalla de la calculadora -->
                <div class="pantalla-calculadora">
                    <input type="text" id="pantalla" readonly value="0">
                </div>
                
                <!-- Resultados de conversión automática -->
                <div class="resultados-conversion" id="resultadosConversion">
                    <div class="resultado-item">
                        <span class="resultado-label">USD → Bs:</span>
                        <span class="resultado-valor" id="resultadoUsd">0,00 Bs</span>
                    </div>
                    <div class="resultado-item">
                        <span class="resultado-label">EUR → Bs:</span>
                        <span class="resultado-valor" id="resultadoEur">0,00 Bs</span>
                    </div>
                    <div class="resultado-item">
                        <span class="resultado-label">Bs → USD:</span>
                        <span class="resultado-valor" id="resultadoBsUsd">0,00 USD</span>
                    </div>
                    <div class="resultado-item">
                        <span class="resultado-label">Bs → EUR:</span>
                        <span class="resultado-valor" id="resultadoBsEur">0,00 EUR</span>
                    </div>
                </div>
                
                <!-- Botones de la calculadora (SIN BOTÓN DE CONVERSIÓN) -->
                <div class="botones-calculadora">
                    <button class="btn-calc btn-limpiar" data-action="limpiar">C</button>
                    <button class="btn-calc btn-operador" data-action="borrar">⌫</button>
                    <button class="btn-calc btn-operador" data-action="dividir">/</button>
                    <button class="btn-calc btn-operador" data-action="multiplicar">×</button>
                    
                    <button class="btn-calc btn-numero" data-value="7">7</button>
                    <button class="btn-calc btn-numero" data-value="8">8</button>
                    <button class="btn-calc btn-numero" data-value="9">9</button>
                    <button class="btn-calc btn-operador" data-action="restar">-</button>
                    
                    <button class="btn-calc btn-numero" data-value="4">4</button>
                    <button class="btn-calc btn-numero" data-value="5">5</button>
                    <button class="btn-calc btn-numero" data-value="6">6</button>
                    <button class="btn-calc btn-operador" data-action="sumar">+</button>
                    
                    <button class="btn-calc btn-numero" data-value="1">1</button>
                    <button class="btn-calc btn-numero" data-value="2">2</button>
                    <button class="btn-calc btn-numero" data-value="3">3</button>
                    <button class="btn-calc btn-igual" data-action="calcular">=</button>
                    
                    <button class="btn-calc btn-numero btn-cero" data-value="0">0</button>
                    <button class="btn-calc btn-numero" data-value=".">.</button>
                </div>
            </div>
        </div>
    </div>

    <script src="script.js"></script>
    <script src="calculadora.js"></script>
</body>
</html>