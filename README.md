# InsightBoard

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-6366f1?style=for-the-badge)](https://joakiorlandoprados-sudo.github.io/insightboard/)
[![Angular](https://img.shields.io/badge/Angular-21.2-dd0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Chart.js](https://img.shields.io/badge/Chart.js-4.5-ff6384?style=for-the-badge&logo=chartdotjs&logoColor=white)](https://www.chartjs.org/)
[![Status](https://img.shields.io/badge/Status-Portfolio%20Ready-10b981?style=for-the-badge)](https://joakiorlandoprados-sudo.github.io/insightboard/)

> A fully functional business analytics dashboard built with Angular 17+, featuring real-time KPI tracking, dynamic charts, advanced filtering, and CSV export — designed to reflect production-grade frontend standards.

---

## Live Demo

🔗 [joakiorlandoprados-sudo.github.io/insightboard](https://joakiorlandoprados-sudo.github.io/insightboard/)

---

## Overview

InsightBoard is an enterprise-grade analytics dashboard that demonstrates professional frontend architecture and UX patterns commonly found in SaaS and business intelligence tools.

The UI features a dark executive theme with:
- Fixed sidebar on desktop, collapsible on tablet, bottom navigation on mobile
- Animated KPI cards with trend indicators and skeleton loaders
- Dynamic charts for revenue, product categories, and acquisition channels
- Persistent date filters with quick-select presets
- Advanced transactions table with search, sorting, pagination, and CSV export
- Loading states, refresh overlays, and visual error handling

---

## Tech Stack

| Technology | Version | Role |
|------------|---------|------|
| Angular | 21.2.x | Core framework — standalone components, routing, signals |
| TypeScript | 5.9.x | Strict typing across models, services, and components |
| RxJS | 7.8.x | Reactive streams — retry, timeout, debounce, delay |
| Chart.js | 4.5.x | Revenue, category, and channel data visualizations |
| ng2-charts | 10.0.x | Angular wrapper for Chart.js |
| SCSS | Native | Dark theme, responsive layout, visual states |

---

## Features

- **Modern Angular architecture** — standalone components throughout, no NgModules, `inject()` pattern
- **Centralized HTTP layer** — `ApiService` with mock interceptor, auth headers, retry logic and 10s timeout
- **Realistic mock backend** — random latency between 600–1400ms, 10% simulated error rate
- **Animated KPI counters** — count-up effect implemented natively with `setInterval`
- **Dynamic charts** — period selector (7D / 30D / 90D / 1Y) updates all chart data reactively
- **Global date filters** — all widgets update simultaneously when the date range changes
- **CSV export** — available on charts and table, auto-named with timestamp
- **Advanced table** — real-time search with 300ms debounce, column sorting, pagination
- **Skeleton loaders** — per-widget loading states using pure CSS animations
- **Error handling** — slide-in toast banner with retry, empty states, and error illustrations
- **Online/offline indicator** — bound to `navigator.onLine`
- **Reactive state** — Angular signals for loading, filter, error, and data state

---

## Project Structure

```
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
│   ├── styles/
│   │   └── global.scss
│   └── index.html
├── angular.json
├── package.json
└── README.md
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm start
```

Open [http://localhost:4200](http://localhost:4200) in your browser.

```bash
# Production build
npm run build
```

---

## Technical Decisions

**1. Standalone components only**
NgModules were avoided entirely to keep the architecture lightweight and aligned with modern Angular conventions.

**2. ApiService + mock interceptor**
Rather than calling the mock service directly from the UI, the app simulates a real API flow through HttpClient with headers, retry logic, and timeout. This makes the project easier to connect to a real backend and more representative of production patterns.

**3. Deterministic mock data**
Chart and KPI data is generated using seeds derived from the selected date range and period, ensuring visual consistency when navigating between filters.

**4. Angular signals for UI state**
Loading, filter, error, and data states are modeled with signals, keeping templates reactive and reducing complexity compared to manual change detection.

**5. Zero UI frameworks**
All layout, skeleton loaders, overlays, and visual components were built from scratch with SCSS to demonstrate design judgment and CSS proficiency.

---

## What This Project Demonstrates

- Ability to build complete, presentable enterprise dashboards
- Modern Angular beyond basic scaffolding
- Data visualization integrated with real product UX patterns
- Attention to detail: error states, loading flows, CSV export, responsive layout, persistent filters
- Production-ready frontend suitable for portfolio, client demos, or as a SaaS foundation

---

## Roadmap

- [ ] Connect mock layer to a real backend with JWT authentication
- [ ] Add functional views for Clients, Transactions, and Settings
- [ ] Implement filter-level caching and response memoization
- [ ] Add unit and integration tests for key widgets
- [ ] Support PDF export and chart snapshots
- [ ] Persist period and layout preferences in `localStorage`

---

## License

MIT
