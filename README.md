# En alerta

Sitio estático: HTML, CSS, un archivo JavaScript y un JSON. Sin instalación, dependencias, compilación, backend ni Python.

## Abrir

Usá **Live Server** de tu editor o subí la carpeta a **GitHub Pages** o cualquier hosting estático. El navegador necesita que el JSON se sirva por HTTP; abrir el HTML con doble clic puede bloquear su lectura.

## Archivos

- `index.html`: única página, con consulta guiada, alertas recientes, fuentes, iniciativa y aviso legal.
- Las tarjetas se dan vuelta para mostrar recomendaciones, lotes y contactos, sin navegar a otra sección.
- `#aviso-legal`: sección legal dentro del mismo index.
- `assets/style.css`: diseño responsive en crema, salvia, celeste y marrón.
- `assets/cuidado.svg`, `assets/consulta.svg`, `assets/organic-icons.svg`: ilustraciones e íconos originales.
- `assets/nunito.ttf`: tipografía Nunito servida localmente, con licencia OFL incluida.
- `assets/app.js`: carga del JSON, validación, consulta guiada y tarjetas.
- `data/alerts.json`: todos los registros y la configuración institucional.
- `docs/CHECKLIST-FUENTES.md`: revisión previa a publicación.
- `docs/FUENTES.md`: fuentes consultadas y límites de verificación.

## Mantener las alertas

Editá `data/alerts.json` y guardá. No hay que generar páginas ni ejecutar comandos: inicio, resultados y fichas usan el mismo archivo.

Para actualizar una alerta, editá el registro correspondiente con la publicación oficial. `presentationLabel` es el nombre comprensible que se muestra al elegir una presentación; debe corresponder a la denominación oficial. La consulta actual tiene dos marcas: Nutrilon y SanCor. Si se amplía la cobertura, deben revisarse también los selectores y el alcance de la introducción. El `id` debe ser único y usar letras minúsculas, números y guiones. Conservá los identificadores como texto, con sus ceros iniciales y signos.

Usá `null` para datos opcionales no publicados. Si no hay lote publicado, dejá `lots: []` y `lotAvailability: "not_published"`. Si lo hay, usá `lotAvailability: "published"` y la lista de identificadores completos.

La URL oficial, el organismo, las fechas y los campos mínimos se validan al cargar. Un error de carga o validación se informa como tal, nunca como ausencia de alertas. La validación no sustituye la lectura de la fuente.

Actualizá `reviewedAt` solo después de revisar el documento. Para retirar una alerta, cambiá `status` a `"withdrawn"` o eliminá el registro. `"draft"` tampoco se muestra. El JSON es público, incluso los registros que conserves como borradores o retirados.

## Configuración

En el objeto `config` del mismo JSON:

- `institutionalUrl`: URL HTTPS real de Devecoop. Con `null`, el CTA queda sin enlace.

## Comprobar antes de publicar

Revisá el checklist de fuentes. Probá Nutrilon con ambas presentaciones: el resumen debe aparecer sin pedir lote. Probá SanCor Bebé con identificador completo, vacío, parcial y distinto; deben verse las irregularidades y advertencias correspondientes. Comprobá cambio de marca, cambio de presentación, reinicio, teclado y navegación móvil.

La consulta muestra un paso por vez: marca y presentación para Nutrilon, o marca y lote para SanCor Bebé. Las marcas se eligen con botones. Las dos presentaciones de Nutrilon funcionan como un acordeón: cada recomendación se abre debajo de su nombre y al abrir otra se cierra la anterior. «Cambiar marca» vuelve al inicio; en SanCor se puede corregir el lote desde el resultado. La ayuda «¿No sabés cuál tenés?» incluye los nombres completos y el RNPA. No hay buscador libre ni consultas por RNPA. Los lotes se comparan completos, ignorando mayúsculas, espacios y el prefijo `L:`; los guiones y demás signos se conservan. Un fragmento nunca constituye coincidencia. RNE y RNPA quedan disponibles en «Datos del producto». No se almacenan ni envían las consultas.

El footer incluye el logo de Devecoop en tamaño pequeño en su línea inferior, enlazado al sitio institucional y sin una franja adicional. El texto legal breve permanece centrado. En las tarjetas recientes, «Ver recomendaciones» y «Volver al resumen» ocupan el mismo lugar inferior.

## Publicar

Subí `index.html`, `assets/`, `data/` y `.nojekyll` al hosting estático. En GitHub Pages podés servir la carpeta directamente, sin herramientas de construcción. Todas las rutas son relativas.

La fuente de los tres registros actuales es la DIPA bonaerense. La sección de fuentes enlaza el listado de alertas alimentarias y los comunicados exactos de los registros publicados. No se muestran organismos sin registros en esta base. Revisá nuevamente las fuentes y la privacidad del alojamiento antes de publicar. No se configuraron dominio, URL canónica ni imagen social inventados.
# formula-en-alerta
