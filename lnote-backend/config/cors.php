<?php

return [
    /*
    |
    | Cross-Origin Resource Sharing (CORS) Settings
    |
    | For development we'll allow local origins so the Expo dev server
    | on different ports can reach the API. In production this should be
    | locked down to specific origins.
    */
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => explode(',', env('CORS_ALLOWED_ORIGINS', 'http://localhost:19006,http://localhost:19000,http://localhost:8000,http://127.0.0.1:8000')),
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
];
