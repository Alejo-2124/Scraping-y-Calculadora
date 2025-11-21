<?php
// scraper_bcv.php
/**
 * Widget Corporativo - API Tipos de Cambio BCV
 * @version 3.4
 * @license MIT
 */

// Verificar si la librería existe
if (!file_exists('simple_html_dom.php')) {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Falta la librería simple_html_dom.php']);
    exit;
}

include_once('simple_html_dom.php');

// Configurar headers para API
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('X-Widget-Version: 3.4');

/**
 * Formatea números con 2 decimales
 */
function formatearMoneda($numero) {
    return number_format($numero, 2, ',', '.');
}

/**
 * Obtiene la fecha ajustada según las reglas del BCV
 * Los viernes muestran la tasa del siguiente lunes (fecha valor)
 */
function obtenerFechaAjustada() {
    $zona_horaria = new DateTimeZone('America/Caracas');
    $fecha = new DateTime('now', $zona_horaria);
    
    $dia_semana = $fecha->format('N'); // 1 (lunes) a 7 (domingo)
    $hora_actual = $fecha->format('H:i');
    
    // Si es viernes (5) después del mediodía, mostramos la fecha del lunes
    if ($dia_semana == 5 && $hora_actual >= '12:00') {
        $fecha->modify('next monday');
    }
    // Si es sábado (6) o domingo (7), mostramos la fecha del lunes
    elseif ($dia_semana >= 6) {
        $fecha->modify('next monday');
    }
    
    return $fecha;
}

/**
 * Obtiene el nombre del día y mes en español con formato BCV
 * Formato: "Fecha valor: jueves, 20 de noviembre de 2025"
 */
function obtenerFechaEspanolBCV($fecha = null) {
    if ($fecha === null) {
        $fecha = obtenerFechaAjustada();
    }
    
    $dias = [
        1 => 'lunes',
        2 => 'martes', 
        3 => 'miércoles',
        4 => 'jueves',
        5 => 'viernes',
        6 => 'sábado',
        7 => 'domingo'
    ];
    
    $meses = [
        1 => 'enero',
        2 => 'febrero',
        3 => 'marzo',
        4 => 'abril',
        5 => 'mayo',
        6 => 'junio',
        7 => 'julio',
        8 => 'agosto',
        9 => 'septiembre',
        10 => 'octubre',
        11 => 'noviembre',
        12 => 'diciembre'
    ];
    
    $dia_semana = $dias[$fecha->format('N')];
    $dia = $fecha->format('d');
    $mes = $meses[$fecha->format('n')];
    $anio = $fecha->format('Y');
    
    // Formato BCV: "Fecha valor: jueves, 20 de noviembre de 2025"
    return 'Fecha valor: ' . $dia_semana . ', ' . $dia . ' de ' . $mes . ' de ' . $anio;
}

/**
 * Función principal de scraping
 */
function obtenerTipoDeCambioBCV() {
    $url = "https://www.bcv.org.ve";
    $userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.64 Safari/537.36";

    // Configuración cURL
    $curl = curl_init();
    curl_setopt_array($curl, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_USERAGENT => $userAgent,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_TIMEOUT => 10,
        CURLOPT_HTTPHEADER => [
            'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language: es-ES,es;q=0.9,en;q=0.8',
        ]
    ]);

    $htmlContent = curl_exec($curl);
    $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    curl_close($curl);

    // Validaciones de conexión
    if ($httpCode !== 200) {
        return ['error' => "Error: No se pudo conectar al BCV (HTTP $httpCode)"];
    }
    
    if (!$htmlContent) {
        return ['error' => "Error: No se recibió respuesta del BCV"];
    }

    // Parsear HTML
    $html = str_get_html($htmlContent);
    if (!$html) {
        return ['error' => "Error: Falló el análisis del contenido"];
    }

    // Extracción de datos
    $dolar = $html->find('div#dolar strong', 0);
    $euro = $html->find('div#euro strong', 0);

    $resultado = [];
    
    // Obtener fecha ajustada según reglas BCV
    $fechaAjustada = obtenerFechaAjustada();
    
    // Fecha 
    $resultado['fecha'] = obtenerFechaEspanolBCV($fechaAjustada);
    $resultado['fecha_corta'] = $fechaAjustada->format('d/m/Y');
    $resultado['fecha_valor'] = $fechaAjustada->format('Y-m-d');
    
    // Información sobre el ajuste de fecha
    $hoy = new DateTime('now', new DateTimeZone('America/Caracas'));
    if ($hoy->format('Y-m-d') !== $fechaAjustada->format('Y-m-d')) {
        $resultado['fecha_ajustada'] = true;
        $resultado['fecha_original'] = $hoy->format('Y-m-d');
    } else {
        $resultado['fecha_ajustada'] = false;
    }

    // Procesar USD
    if ($dolar) {
        $valor = trim($dolar->plaintext);
        $valor_limpio = str_replace(',', '.', $valor);
        // Agregar redondeo a 2 decimales
        $valor_redondeado = round((float)$valor_limpio, 2);
        $resultado['usd'] = [
            'valor' => $valor_redondeado,
            'formateado' => formatearMoneda($valor_redondeado)
        ];
    }

    // Procesar EUR
    if ($euro) {
        $valor = trim($euro->plaintext);
        $valor_limpio = str_replace(',', '.', $valor);
        // Agregar redondeo a 2 decimales
        $valor_redondeado = round((float)$valor_limpio, 2);
        $resultado['eur'] = [
            'valor' => $valor_redondeado,
            'formateado' => formatearMoneda($valor_redondeado)
        ];
    }

    $html->clear();
    return $resultado;
}

// Manejo de errores global
try {
    $datos = obtenerTipoDeCambioBCV();
    echo json_encode($datos, JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error interno del servidor']);
}
?>