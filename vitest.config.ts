import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
    test: {
        // Utilise Node.js comme environnement de test
        environment: 'node',
        
        // Chemin des fichiers de test
        include: ['test/**/*.test.ts', 'test/**/*.spec.ts'],
        
        // Couverture de code
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            include: ['src/**/*.ts'],
            exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts', 'node_modules', 'test/**']
        },
        
        // Options pour Node.js
        env: {
            NODE_ENV: 'test'
        },
        
        // Cache directory
        cache: {
            dir: '.vitest'
        },
        
        // Configuration pour les modules ES
        isolate: false,
        globals: true,
        // Support pour les imports .js dans les fichiers .ts
        alias: {
            '^(.+)\.js$': '<leaf>.$1.ts'
        }
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@test': path.resolve(__dirname, './test')
        },
        extensions: ['.js', '.ts']
    }
});
