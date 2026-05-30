# InsightBoard

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-6366f1?style=for-the-badge)](https://joakiorlandoprados-sudo.github.io/insightboard/)

> Dashboard analítico empresarial construido con Angular 17+

![Angular](https://img.shields.io/badge/Angular-21.2-dd0031?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?style=for-the-badge&logo=typescript&logoColor=white)
![Chart.js](https://img.shields.io/badge/Chart.js-4.5-ff6384?style=for-the-badge&logo=chartdotjs&logoColor=white)
![Status](https://img.shields.io/badge/Status-Ready%20for%20Portfolio-10b981?style=for-the-badge)

## Vista previa

InsightBoard presenta una interfaz dark theme de aspecto ejecutivo con:

- Sidebar fijo en desktop, colapsable en tablet y bottom navigation en mobile
- KPI cards animadas con tendencia visual y skeleton loaders
- Gráficos dinámicos de ingresos, categorías y canales con selección de período
- Filtros persistentes por fecha con presets rápidos
- Tabla avanzada de transacciones con búsqueda, ordenación, paginación y exportación
- Estados de carga, overlay de refresco y manejo de errores visuales

## Características

- Arquitectura Angular moderna con standalone components y `inject()`
- TypeScript estricto para modelos, servicios y componentes
- `HttpClient` centralizado mediante `ApiService`
- Interceptor de autorización mock con `Bearer mock-token`
- Mock backend interceptado con latencia aleatoria y errores simulados
- Reintentos automáticos con RxJS `retry(2)` y timeout de 10 segundos
- KPI cards con contador animado usando `setInterval`
- Chart.js integrado mediante `ng2-charts`
- Exportación CSV en gráficos y tabla con timestamp automático
- Filtros globales que actualizan todos los widgets al mismo tiempo
- Tabla avanzada con debounce de búsqueda a 300 ms
- Skeleton loaders, spinner por widget y banner de error deslizante
- Indicador online/offline ligado a `navigator.onLine`

## Stack tecnológico

| Tecnología | Versión | Uso |
| --- | --- | --- |
| Angular | 21.2.x | Framework principal, routing standalone y renderizado UI |
| TypeScript | 5.9.x | Tipado estricto y contratos de datos |
| RxJS | 7.8.x | Retry, timeout, debounce, delay y flujos reactivos |
| Chart.js | 4.5.x | Visualización de ingresos, categorías y canales |
| ng2-charts | 10.0.x | Wrapper Angular para Chart.js |
| SCSS | Nativo | Tema dark, layout responsive y estados visuales |

## Instalación y uso

```bash
npm install
npm start
```

La aplicación quedará disponible en:

```bash
http://127.0.0.1:4200/
```

Build de producción:

```bash
npm run build
```

El artefacto generado se publica en:

```bash
dist/insightboard
```

## Arquitectura del proyecto

```text
insightboard/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── interceptors/
│   │   │   │   ├── auth.interceptor.ts
│   │   │   │   └── mock-api.interceptor.ts
│   │   │   ├── models/
│   │   │   │   └── dashboard.models.ts
│   │   │   ├── services/
│   │   │   │   ├── api.service.ts
│   │   │   │   └── data-mock.service.ts
│   │   │   └── utils/
│   │   │       └── date-range.util.ts
│   │   ├── shared/
│   │   │   ├── components/
│   │   │   │   ├── chart-widget/
│   │   │   │   ├── data-table/
│   │   │   │   ├── error-banner/
│   │   │   │   └── kpi-card/
│   │   │   ├── pipes/
│   │   │   │   └── currency-format.pipe.ts
│   │   │   └── utils/
│   │   │       └── csv-export.util.ts
│   │   ├── features/
│   │   │   └── dashboard/
│   │   │       ├── dashboard.component.ts
│   │   │       ├── dashboard.component.html
│   │   │       └── dashboard.component.scss
│   │   ├── app.component.ts
│   │   ├── app.component.html
│   │   ├── app.component.scss
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   ├── assets/
│   ├── styles/
│   │   └── global.scss
│   ├── index.html
│   ├── main.ts
│   └── styles.scss
├── angular.json
├── package.json
└── README.md
```

### Descripción de módulos

- `core/models`: contratos TypeScript reutilizados en toda la app
- `core/services`: capa de consumo HTTP y generación de datos mock
- `core/interceptors`: autorización mock y backend simulado sobre `HttpClient`
- `shared/components`: widgets reutilizables del dashboard
- `shared/pipes`: formateo de moneda en tablas y métricas
- `features/dashboard`: orquestación de filtros, estados y carga concurrente
- `styles/global.scss`: variables visuales, reset, tipografía y utilidades globales

## Decisiones técnicas

1. **Standalone components en toda la aplicación**
   Se evitó `NgModule` para mantener una arquitectura más ligera, moderna y alineada con Angular actual.

2. **`ApiService` + interceptores mock**
   En lugar de consumir el `DataMockService` directamente desde la UI, la app simula un flujo de API real con `HttpClient`, headers, retry y timeout. Esto hace el proyecto más creíble para portfolio y más fácil de conectar a un backend real.

3. **Datos mock deterministas por filtro/período**
   Los datos se generan con seeds derivadas del rango de fechas y del período seleccionado. Así se consigue consistencia visual al navegar sin perder realismo.

4. **Signals para estado local de UI**
   Los estados de carga, filtros, errores, exportación y datos están modelados con signals para reducir complejidad y mantener templates reactivos y fáciles de leer.

5. **SCSS propio sin frameworks UI**
   Todo el layout, los skeletons, overlays y componentes visuales se construyeron desde cero para demostrar criterio de diseño y dominio de CSS/SCSS.

## Qué demuestra este proyecto

- Capacidad para construir dashboards empresariales completos y presentables
- Dominio de Angular moderno más allá del scaffold básico
- Integración de visualización de datos con estados reales de producto
- Atención al detalle en UX: errores, loading, exportación, responsive y persistencia de filtros
- Enfoque listo para portfolio, demos comerciales o base de un producto SaaS

## Próximas mejoras

- Conectar la capa mock a un backend real con autenticación JWT
- Agregar vistas funcionales para Clientes, Transacciones y Configuración
- Incorporar cache por filtros y memoización de respuestas
- Añadir tests unitarios e integración para widgets clave
- Soportar exportación a PDF o snapshot de gráficos
- Guardar preferencias de período y layout en `localStorage`

## Licencia

MIT
