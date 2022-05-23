
const DEFAULTS = {
    isApp: true,
    'root-redirect': '/api',
    cors: 'http://localhost:1234',
    ARANGO_HOST: '',
    ARANGO_USER: '',
    ARANGO_PASSWORD: '',
    ARANGO_DATABASE: '',
    ADMIN_USER: '',
    ADMIN_PASSWORD: '',
    JWT_EXPIRATION_SECONDS: '60s',
    USE_BUNDLED_NODERED: true,
    NODERED_HOME_DIR: '',
    NODERED_WS_CONNECTION: 'ws://localhost:8080',
    NODERED_HTTP_CONNECTION: 'http://localhost:1880',
    NODERED_ENABLE_PROJECTS: true,
    NODERED_FLOW_FILE: 'flows.json',
    TRACK_LIFETIME_MONTHS: 13
}

export {
    DEFAULTS
};