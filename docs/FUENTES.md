# Fuentes de los registros actuales

Revisión documental: **29/10/2026**.

Los tres registros cargados proceden de una única autoridad: **DIPA, Dirección de Industrias y Productos Alimenticios de la Provincia de Buenos Aires**, dependiente del Ministerio de Desarrollo Agrario.

Listado específico de alertas alimentarias:
https://www.gba.gob.ar/desarrollo_agrario/alertas_alimentarias

| Registro | Comunicado oficial | Fecha |
| --- | --- | --- |
| SanCor Bebé 1 Advanced | https://gba.gob.ar/desarrollo_agrario/alertas_alimentarias/sancor-bebe | 28/10/2026 |
| Nutrilon AR1 | https://gba.gob.ar/desarrollo_agrario/alertas_alimentarias/nutrilon1 | 27/10/2026 |
| Nutrilon, fórmula láctea | https://www.gba.gob.ar/desarrollo_agrario/alertas_alimentarias/nutrilon | 01/10/2026 |

La ubicación de los comunicados bajo `/desarrollo_agrario/` responde al organismo del que depende la DIPA; los enlaces apuntan al listado alimentario y a los comunicados concretos, no a una portada general.

La sección de fuentes se limita a los documentos de registros publicados en el JSON. No se presentan otras entidades como fuentes sin una alerta cargada atribuida a ellas. Esto describe la cobertura de esta base y no afirma que otros organismos no hayan publicado información.

Los datos sobre productos, identificadores, recomendaciones y contactos se toman de esos documentos. La coincidencia con un lote no autentica un envase individual. Los dos registros Nutrilon no publican número de lote en el texto consultado; el identificador de SanCor debe leerse junto con las diferencias materiales descriptas.

La búsqueda del comunicado SanCor se volvió a revisar para la comparación de identificadores: publica `L:Y010 F-011207563`, elaboración `10/01/26` y vencimiento `10/01/27`. Se conserva la inscripción completa en `lots`. Se retiró la referencia abreviada `L F-011207563` por no contar con una fuente oficial incorporada que la publique. `Y010` no se elimina por normalización. La distancia de edición es una ayuda de consulta y no una regla de identificación publicada por DIPA.

El campo `sourceTitle` conserva el título textual de cada comunicado: «ALERTA ALIMENTARIA - PRODUCTO FALSIFICADO». Los resultados y reversos citan ese título, el organismo y la fecha, con enlace directo al documento. Los textos explicativos son resúmenes editoriales, no citas textuales del cuerpo del comunicado. Los contactos de acción se obtienen de los canales publicados por DIPA, sin atribuir disposiciones a otros organismos.

La apertura directa del comunicado SanCor falló en la herramienta de investigación; se pudo consultar el texto de la misma URL oficial mediante búsqueda y se comprobó su presencia en el listado alimentario provincial. La disponibilidad puede cambiar: revisar los enlaces antes de publicar. No se usaron medios, blogs o redes sociales para completar los registros.
