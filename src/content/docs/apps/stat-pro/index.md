---
title: Stat Pro
description: App de estadísticas de básquet para entrenadores, offline y multiplataforma.
sidebar:
  order: 1
---

:::caution[En desarrollo — Hito 1 (v0.1)]
Stat Pro está en desarrollo. Hoy funciona como CLI: gestión de clubes, jugadores, competencias, inscripciones y listas de buena fe. Estamos implementando la autenticación de usuarios (US-104). Esta wiki se actualiza al cerrar cada versión.
:::

## Qué es

Stat Pro es una aplicación de **estadísticas de básquet para entrenadores (DT)** y analistas, pensada para todo el espectro: categorías formativas (Mini, U13, U15, U17), desarrollo, primera amateur y profesional.

Centraliza el historial de partidos y jugadores en un motor estadístico que funciona **sin internet**, y automatiza la carga a partir de las planillas Excel de **Ges Deportivo**.

## El problema

Encuestamos a entrenadores reales. Estos son los problemas que más se repiten:

| Problema                 | Impacto                                                      | Hoy                   |
| ------------------------ | ------------------------------------------------------------ | --------------------- |
| Carga manual ineficiente | Distrae al DT o requiere una persona dedicada                | Más de 20 min/partido |
| Ceguera estadística      | Decisiones por intuición, sin métricas avanzadas (PPP, EFF)  | 0 % automatizado      |
| Datos fragmentados       | No hay seguimiento histórico ni comparación de rivales       | Papel o Excel         |
| Sin conexión en canchas  | Las apps web fallan en estadios sin señal                    | 100 % online          |
| Plataformas rígidas      | Los datos de Ges Deportivo no se integran sin trabajo manual | Ingesta manual        |

La mayoría de los DTs analiza de forma diferida, en su casa, y está dispuesta a dedicar **menos de 10 a 20 minutos por partido**. Por eso la app prioriza ser **simple y rápida** antes que completa y compleja.

## Qué hace (v1.0)

- **Ingesta multimodal:** importa planillas Excel de Ges Deportivo y permite cargar partidos a mano, jugador por jugador.
- **Persistencia local:** una base SQLite por instalación, 100 % offline.
- **Motor estadístico:** métricas avanzadas (eFG%, EFF, PPP, posesiones, % de rebotes) y tendencias con Pandas.
- **Visualización y reportes:** líderes, gráficos de evolución, comparativas jugador vs. jugador y equipo vs. rival, scouting del rival y exportación a PDF.
- **Multiplataforma:** Windows, Linux, macOS y Android.

**Fuera de alcance de v1.0:** carga en vivo durante el partido, sincronización en la nube y conexión directa con los servidores de Ges Deportivo.

## Métricas de éxito

- Del archivo cargado al informe completo en **menos de 2 minutos**.
- **Más del 95 %** de las estadísticas de un partido generadas sin intervención manual.
- **100 %** de las funciones críticas disponibles sin conexión.

## Roadmap

| Versión  | Hito                     | Contenido                                                                                        | Estado      |
| -------- | ------------------------ | ------------------------------------------------------------------------------------------------ | ----------- |
| **v0.1** | Núcleo de datos y CLI    | Esquema SQLite, repositorios, casos de uso, autenticación, sesión, carga atómica de partidos, CI | 🚧 En curso |
| v0.2     | Ingesta y análisis       | Importación de Excel de Ges Deportivo, métricas avanzadas, migraciones de esquema                | Planificado |
| v0.3     | Visualización y reportes | Dashboards en consola, gráficos de tendencia, PDF, scouting de rivales                           | Planificado |
| v1.0     | Interfaz multiplataforma | GUI con Flet (desktop y mobile), backup, seguridad, binarios distribuibles                       | Planificado |

Más adelante (visión, no compromiso): sincronización en la nube, recomendaciones con IA, carga en vivo con mapa de tiro y una plataforma para federaciones.

## Links

- Repositorio: <https://github.com/stack-dos/app_estadistica>
- [Instalación](/porfolio_stack-dos/apps/stat-pro/instalacion/)
- [Arquitectura](/porfolio_stack-dos/apps/stat-pro/arquitectura/)
- [Uso de la CLI](/porfolio_stack-dos/apps/stat-pro/uso/)
