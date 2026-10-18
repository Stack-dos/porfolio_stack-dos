---
nombre: Monitoreo de UPS
descripcion: Monitoreo por SNMP de los UPS del data center de la UNC. Telegraf lo ejecuta cada minuto, consulta 26 equipos en paralelo y manda alertas por umbral a Google Chat, con un hilo por incidente. En producción.
stack: [Python, SNMP, Telegraf, Docker, GitHub Actions]
estado: publicado
repo: https://github.com/nicopinera/monitoreo-ups-py
autores: [nicolas-pinera]
---
