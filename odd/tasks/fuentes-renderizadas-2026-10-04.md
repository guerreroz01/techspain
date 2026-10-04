# Fuentes renderizadas (sin RSS) vía navegador headless

## Objetivo

Permitir que `scripts/daily-news.mjs` lea las fuentes sin RSS que hoy quedan en
"seguimiento manual" (p. ej. Wareable, detrás de Cloudflare), usando el binario
`obscura` como navegador headless, sin romper el camino RSS existente ni agregar
dependencias npm.

## Problema

`sources.json` tiene 24 fuentes con `rss: null`. Algunas publican noticias
valiosas pero no ofrecen feed y/o están detrás de Cloudflare, así que el detector
las ignora y el informe las lista como manuales. El hueco es de **formato**, no de
tema.

## Alcance

- `scripts/daily-news.mjs`: nuevo camino `--render` para fuentes con bloque `render`.
- `src/data/sources.json`: bloque `render` en `wareable` (primera fuente migrada).
- `package.json`: script `news:render`.
- `AGENTS.md` §16: corregir la nota de Wareable.

Fuera de alcance: paralelizar el render, añadir más fuentes sin RSS, cambiar el
clasificador de verticales.

## Tareas

- [x] Añadir helper `obscura` + extractor genérico de enlaces en daily-news.mjs.
- [x] Integrar `--render` en `main()` con degradación a aviso si falta `obscura`.
- [x] Declarar `render` en la fuente `wareable` de sources.json.
- [x] Añadir `news:render` a package.json.
- [x] Actualizar §16 de AGENTS.md.
- [x] Verificar: `npm run news -- --render` produce candidatos de Wareable (36).

## Restricciones

- El camino RSS no cambia y sigue sin dependencias.
- Sin `obscura` o sin `--render`, el script se comporta como antes.
- Respetar términos de uso: no se habilita VideoCardz (prohíbe scraping).

## Criterios de aceptación

- `npm run news` (sin flag) idéntico al comportamiento previo.
- `npm run news -- --render` lista los artículos de Wareable como candidatos.
- `.seen.json` deduplica las corridas sucesivas.

## Progreso

- 2026-10-04: integración implementada y verificada con Wareable.
