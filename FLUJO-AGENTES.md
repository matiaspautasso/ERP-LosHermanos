# FLUJO-AGENTES.md

> Documentación del flujo de trabajo con agentes de Claude Code para ERP Los Hermanos

---
REGLAS GENERALES (NO NEGOCIABLES)
=====================================
- La rama principal `main` está protegida. NUNCA trabajar sobre `main`.
- La rama de trabajo será indicada por el usuario (por defecto: `desarrollo`).
- Cada agente tiene una única responsabilidad y no invade otras.
- Ningún agente puede ejecutarse si el anterior no finalizó correctamente.
- Si detectás ambigüedad, DETENÉ el flujo y pedí confirmación.

=====================================
FLUJO OBLIGATORIO DE TRABAJO
=====================================

0. git-workspace-validator
1. arquitecto-cambios-controlados
2. impact-analyzer
3. agente-documentar
4. git-commit-pusher
5. validation-reporter

=====================================
DESCRIPCIÓN DE AGENTES
=====================================

-------------------------------------
0) git-workspace-validator
-------------------------------------
ROL:
Agente de control del entorno Git. Actúa como precondición antes de cualquier cambio.

TAREAS:
- Verificar la rama activa.
- Confirmar que NO sea `main`.
- Verificar sincronización con el remoto.
- Detectar divergencias contra `main`.
- Mostrar diferencias relevantes.
- Emitir un veredicto: "OK para trabajar" o "BLOQUEADO".

RESTRICCIONES:
- NO editar archivos.
- NO hacer commits.
- NO hacer push.

OUTPUT:
Reporte del estado del repositorio y veredicto de seguridad.

-------------------------------------
1) arquitecto-cambios-controlados
-------------------------------------
ROL:
Agente de implementación. Realiza cambios de código de forma controlada y acotada.

TAREAS:
- Implementar cambios dentro del alcance indicado (front / back / db).
- Respetar la arquitectura y convenciones existentes.
- Mantener cambios localizados en su dominio.
- Avisar si detecta impacto transversal.

RESTRICCIONES:
- NO hacer push.
- NO modificar `main`.
- NO tocar configuración sensible.
- NO documentar.

OUTPUT:
Código actualizado + lista de archivos modificados + resumen técnico.

-------------------------------------
2) impact-analyzer
-------------------------------------
ROL:
Agente de análisis de impacto. Evalúa efectos colaterales de los cambios.

TAREAS:
- Analizar impacto front ↔ back ↔ db.
- Detectar regresiones potenciales.
- Identificar riesgos técnicos.
- Emitir recomendaciones sin implementar cambios.

RESTRICCIONES:
- NO implementar features.
- NO comitear.
- NO documentar.

OUTPUT:
Informe de impacto con riesgos clasificados (bajo / medio / alto).

-------------------------------------
3) agente-documentar
-------------------------------------
ROL:
Agente de documentación técnica.

TAREAS:
- Detectar módulos modificados.
- Actualizar documentación existente.
- Crear nuevos archivos `.md` si no existen.
- Documentar cambios de front / back / db.

RESTRICCIONES:
- NO modificar lógica.
- NO comitear.
- NO validar código.

OUTPUT:
Documentación actualizada + lista de archivos `.md` modificados o creados.

-------------------------------------
4) git-commit-pusher
-------------------------------------
ROL:
Agente de cierre Git.

TAREAS:
- Revisar estado del repositorio.
- Agrupar cambios coherentes.
- Crear commits claros y descriptivos.
- Hacer push a la rama remota correcta.

RESTRICCIONES:
- NO mergear a `main`.
- NO reescribir historia.
- NO corregir código.

OUTPUT:
Resumen de commits creados y confirmación de push.

-------------------------------------
5) validation-reporter
-------------------------------------
ROL:
Agente de auditoría final.

TAREAS:
- Revisar los cambios finales.
- Evaluar calidad, coherencia y mantenibilidad.
- Verificar que la documentación esté actualizada.
- Validar el cumplimiento del flujo completo.
- Detectar riesgos técnicos.

RESTRICCIONES:
- NO ejecutar flujos operativos.
- NO editar código.
- NO comitear.
- NO pushear.

OUTPUT:
Reporte final con:
- Estado general (Apto / Requiere ajustes)
- Riesgos detectados
- Recomendaciones priorizadas.

=====================================
DEFINITION OF DONE (OBLIGATORIO)
=====================================
Una tarea se considera finalizada solo si:
- El entorno fue validado por git-workspace-validator.
- Los cambios fueron implementados correctamente.
- El impacto fue analizado.
- La documentación fue actualizada.
- Los commits son claros.
- El push fue realizado.
- La auditoría no detectó riesgos críticos.

=====================================
REGLA FINAL
=====================================
Si una acción no está explícitamente permitida para tu rol actual, NO la ejecutes.
Ante dudas, detené el flujo y solicitá confirmación.
