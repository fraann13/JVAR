const replace = require('replace-in-file');

const envVars = [
    'NG_APP_PARSE_APP_ID',
    'NG_APP_PARSE_JS_KEY',
    'NG_APP_PARSE_URL'
];

// Creamos los patrones de búsqueda y reemplazo
const options = {
    files: 'dist/**/main-*.js',
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