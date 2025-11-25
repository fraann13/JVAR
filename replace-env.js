const replace = require('replace-in-file');

// Nombres de las variables de entorno de Vercel (NG_APP_)
const envVars = [
    'NG_APP_PARSE_APP_ID',
    'NG_APP_PARSE_JS_KEY',
    'NG_APP_PARSE_URL'
];

// Creamos los patrones de búsqueda y reemplazo
const options = {
    files: 'dist/**/*.js', // Busca en todos los archivos JS compilados en dist
    from: envVars.map(name => new RegExp(`process\\.env\\.${name}`, 'g')),
    to: envVars.map(name => `'${process.env[name]}'`)
};

try
{
    const results = replace.sync(options);
    // console.log para ver qué fue reemplazado (opcional)
    // console.log('Environment variables replaced:', results); 
} catch (error)
{
    console.error('Error during environment variable replacement:', error);
    process.exit(1);
}