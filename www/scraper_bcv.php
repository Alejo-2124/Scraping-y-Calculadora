<?php
// scraper_bcv.php
/**
 * Widget Corporativo - API Tipos de Cambio BCV
 * @version 3.1
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
header('X-Widget-Version: 3.1');

/**
 * Formatea números con 2 decimales
 */
function formatearMoneda($numero) {
    return number_format($numero, 2, ',', '.');
}

/**
 * Obtiene el nombre del día y mes en español
 */
function obtenerFechaEspanol() {
    $zona_horaria = new DateTimeZone('America/Caracas');
    $fecha = new DateTime('now', $zona_horaria);
    
    $dias = [
        'Monday' => 'Lunes',
        'Tuesday' => 'Martes',
        'Wednesday' => 'Miércoles',
        'Thursday' => 'Jueves',
        'Friday' => 'Viernes',
        'Saturday' => 'Sábado',
        'Sunday' => 'Domingo'
    ];
    
    $meses = [
        'January' => 'Enero',
        'February' => 'Febrero',
        'March' => 'Marzo',
        'April' => 'Abril',
        'May' => 'Mayo',
        'June' => 'Junio',
        'July' => 'Julio',
        'August' => 'Agosto',
        'September' => 'Septiembre',
        'October' => 'Octubre',
        'November' => 'Noviembre',
        'December' => 'Diciembre'
    ];
    
    $dia_semana = $dias[$fecha->format('l')];
    $dia = $fecha->format('d');
    $mes = $meses[$fecha->format('F')];
    $anio = $fecha->format('Y');
    
    return "$dia_semana, $dia $mes $anio";
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
    
    // Fecha en formato completo español
    $resultado['fecha'] = obtenerFechaEspanol();
    $resultado['fecha_corta'] = date('d/m/Y');

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