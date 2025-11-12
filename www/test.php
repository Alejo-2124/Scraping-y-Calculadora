<?php
// test.php - Script de prueba
echo "✅ PHP está funcionando correctamente<br>";
echo "✅ Servidor web operativo<br>";

// Probar si simple_html_dom existe
if (file_exists('simple_html_dom.php')) {
    echo "✅ simple_html_dom.php encontrado<br>";
} else {
    echo "❌ simple_html_dom.php NO encontrado<br>";
}

// Probar cURL
if (function_exists('curl_version')) {
    echo "✅ cURL está habilitado<br>";
} else {
    echo "❌ cURL NO está habilitado<br>";
}

// Probar scraper
include_once('simple_html_dom.php');
$test_html = str_get_html('<div>Test</div>');
if ($test_html) {
    echo "✅ simple_html_dom funciona correctamente<br>";
} else {
    echo "❌ simple_html_dom NO funciona<br>";
}
?>