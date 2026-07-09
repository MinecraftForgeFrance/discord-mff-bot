// Mock pour le module 'fs' utilisant memfs
// Ce fichier est automatiquement utilisé par Vitest quand on fait vi.mock('fs')

import { Volume, fs } from 'memfs';

// Crée un volume par défaut à la racine
const vol = Volume.fromJSON({}, '/');

// Configure memfs pour utiliser notre volume
// @ts-expect-error - memfs permet de configurer le volume par défaut
fs.vol = vol;

// Exporte fs de memfs
export default fs;
export const existsSync = fs.existsSync;
export const readFileSync = fs.readFileSync;
export const writeFileSync = fs.writeFileSync;
export const mkdirSync = fs.mkdirSync;
export const rmSync = fs.rmSync;
export const readdirSync = fs.readdirSync;
export const unlinkSync = fs.unlinkSync;

// Exporte aussi vol pour être utilisé dans les tests
export { vol };
