---
title: Instalación
description: Cómo instalar Stat Pro en tu máquina.
sidebar:
  order: 2
---

## Requisitos

- Python 3.12 o superior.
- [uv](https://docs.astral.sh/uv/), el gestor de dependencias del proyecto.
- Git.

Funciona en Windows, Linux y macOS. No necesita conexión a internet una vez instalado.

## Pasos

```bash
git clone https://github.com/stack-dos/app_estadistica.git
cd app_estadistica
uv sync                              # instala las dependencias fijadas en uv.lock
uv tool install --editable .         # deja disponible el comando `stats` en la terminal
```

La base SQLite se crea sola en el primer uso.

## Verificar

```bash
stats --help
```

Tiene que listar los subcomandos (`club`, `jugador`, `competencia`, `partido`…). Siguiente paso: [uso de la CLI](/porfolio_stack-dos/apps/stat-pro/uso/).

:::note
Los binarios para instalar sin Python (Windows, Linux, macOS y un APK de Android) llegan con la v1.0.
:::
