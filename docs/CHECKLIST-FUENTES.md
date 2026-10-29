# Checklist previo a publicación

Responsable de revisión: ____________________
Fecha: ____________________
Versión / commit: ____________________

Los casilleros se completan luego de la revisión humana del despliegue que se publicará. La existencia de pruebas automáticas no completa este checklist.

## Por cada alerta

- [ ] Abrir la URL exacta en un navegador y verificar que siga disponible, pertenezca al organismo indicado y corresponda al caso. Revisar especialmente SanCor, cuya apertura de investigación inicialmente falló.
- [ ] Confirmar fecha del comunicado, marca, nombre comercial y denominación oficial.
- [ ] Comparar carácter por carácter RNE, RNPA, lotes y fechas impresas. Conservar ceros y signos.
- [ ] Mantener `null` / `[]` y `not_published` cuando un dato no esté publicado. No interpretar imágenes ambiguas ni completar por deducción.
- [ ] Confirmar motivo e irregularidades; no ampliar el alcance del comunicado a todos los lotes o productos de una marca.
- [ ] Incluir todas las recomendaciones y contactos que se muestran, con alcance y atribución correctos.
- [ ] Confirmar que el identificador de SanCor se presenta junto a las características del envase y no como autenticación individual.
- [ ] Revisar la fecha editorial `reviewedAt`; no cambiarla sin leer nuevamente el documento.
- [ ] Comprobar que ningún resumen elimina una condición relevante del comunicado.

## Base e interfaz

- [ ] Abrir el sitio y confirmar que el JSON carga sin errores de validación.
- [ ] Verificar que inicio, consulta guiada y tarjetas lean correctamente los registros del JSON.
- [ ] Revisar en móvil y escritorio las dos marcas y sus ramas: Nutrilon con dos presentaciones sin pedir lote; SanCor únicamente con la inscripción DIPA completa como referencia.
- [ ] Probar coincidencia exacta, una y dos ediciones (incluidas transposiciones), O/0 e I/1, código distinto, vacío, fragmentos y separadores de formato. No deben aparecer aprobaciones de seguridad ni correcciones automáticas.
- [ ] Confirmar que uno o dos caracteres faltantes produzcan una advertencia de similitud; códigos demasiado cortos y prefijos a más de dos ediciones deben pedir la inscripción completa.
- [ ] Comparar visualmente elaboración 10/01/26 y vencimiento 10/01/27 con el comunicado; verificar checklist opcional, advertencia persistente y apertura de recomendaciones al marcar una diferencia del envase.
- [ ] Confirmar base parcial, fecha y organismo visibles, enlace original en cada ficha y tarjetas.
- [ ] Comprobar foco y teclado, lectura de los estados, contraste y zoom 200 %.
- [ ] Verificar todos los enlaces externos, los comunicados y canales DIPA; incluir únicamente fuentes que respalden registros cargados.

## Institucional, legal y privacidad

- [ ] Revisar el aviso legal y privacidad vigente y el texto breve del footer.
- [ ] Mantener `institutionalUrl: null` hasta disponer de la URL institucional real.
- [ ] Confirmar que el CTA institucional permanece fuera de los resultados y no condiciona el acceso.
- [ ] Revisar políticas y registros técnicos del alojamiento, cabeceras y cualquier tratamiento de datos que pueda agregar.
- [ ] Verificar ausencia de tracking, marketing, formularios de captación, envío o almacenamiento de consultas.
- [ ] Revisar cualquier cambio futuro de privacidad conforme al marco argentino vigente; un eventual consentimiento comercial debe ser separado.
- [ ] Incorporar URL canónica, `og:url`, imagen social y sitemap solo cuando exista un destino definitivo, si corresponde.
- [ ] Probar giro y regreso de las tarjetas con mouse, teclado y pantalla táctil; confirmar que no salte la página y que un registro retirado no aparezca.
- [ ] Verificar que el JSON no contenga datos de borradores o retirados que no deban ser públicos.

## Resultado

- [ ] Apto para publicar.
- [ ] Pendiente de correcciones; detallar: ____________________
