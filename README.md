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

La consulta muestra un paso por vez: marca y presentación para Nutrilon, o marca y lote para SanCor Bebé. Las marcas se eligen con botones. Las dos presentaciones de Nutrilon funcionan como un acordeón: cada recomendación se abre debajo de su nombre y al abrir otra se cierra la anterior. «Cambiar marca» vuelve al inicio; en SanCor se puede corregir el lote desde el resultado. La ayuda «¿No sabés cuál tenés?» incluye los nombres completos y el RNPA. No hay buscador libre ni consultas por RNPA. RNE y RNPA quedan disponibles en «Datos del producto». No se almacenan ni envían las consultas.

SanCor distingue coincidencia exacta (rojo suave), código similar (ámbar) y ausencia de coincidencia (azul grisáceo). Solo se compara con la inscripción completa publicada por DIPA en `lots`: `L:Y010 F-011207563`. No se utiliza la referencia abreviada `L F-011207563`, que no tiene respaldo oficial incorporado. La normalización solo ignora mayúsculas, espacios y separadores (`: . , / _ - – —`); conserva todas las letras y cifras, incluido `Y010`. No equipara O/0 ni I/1 ni corrige el texto ingresado.

La similitud usa distancia de edición OSA con inserciones, eliminaciones, sustituciones y transposiciones contiguas, con umbral de dos ediciones. Incluye códigos con uno o dos caracteres faltantes, incluso al final. No se aplica a códigos de longitud menor a la referencia oficial más corta menos dos caracteres (actualmente 13 caracteres normalizados); los prefijos que necesitan más de dos ediciones también piden la inscripción completa. La similitud es una advertencia, nunca una confirmación de falsificación. No se exige la longitud fija del ejemplo anterior.

Cada resultado SanCor mantiene visible la advertencia de seguridad, la inscripción oficial y las fechas de elaboración y vencimiento. Incluye una lista opcional con las diferencias publicadas del envase. Marcar una abre las recomendaciones DIPA y su comunicado; no marcar ninguna no genera una aprobación. En ausencia de coincidencia, las recomendaciones también pueden abrirse manualmente.

Cada resultado y reverso de tarjeta identifica la fuente mediante organismo, título textual del comunicado y fecha enlazados. El acceso al comunicado permanece visible en SanCor aunque las recomendaciones estén plegadas. La consulta y las recomendaciones incluyen un aviso médico breve, y los contactos DIPA usan únicamente los teléfonos y enlaces del JSON oficial. No se inventan disposiciones ni teléfonos de otras autoridades. El aviso legal explica el uso informativo de nombres de marcas, la no afiliación, las limitaciones y la privacidad, sin prometer una exención absoluta de responsabilidad o de obligaciones de protección de datos. El proveedor de alojamiento y su política deberán identificarse al definir el despliegue.

El footer incluye el logo de Devecoop en tamaño pequeño en su línea inferior, enlazado al sitio institucional y sin una franja adicional. El texto legal breve permanece centrado. En las tarjetas recientes, «Ver recomendaciones» y «Volver al resumen» ocupan el mismo lugar inferior.

La lectura usa Nunito con párrafos, advertencias y recomendaciones de `1rem` (16 px por defecto), datos secundarios de `.875rem` (14 px) e interlineado de 1,7, sin reducir el cuerpo en móvil. Las tarjetas usan dos columnas entre 761 y 1100 px y una en móvil. Sus controles forman parte del flujo para adaptarse al tamaño del texto y se apilan en pantallas de hasta 380 px. Revisar con texto ampliado al 200 %, espaciado personalizado y anchos desde 320 px.

## Publicar

Subí `index.html`, `assets/`, `data/` y `.nojekyll` al hosting estático. En GitHub Pages podés servir la carpeta directamente, sin herramientas de construcción. Todas las rutas son relativas.

La fuente de los tres registros actuales es la DIPA bonaerense. La sección de fuentes enlaza el listado de alertas alimentarias y los comunicados exactos de los registros publicados. No se muestran organismos sin registros en esta base. Revisá nuevamente las fuentes y la privacidad del alojamiento antes de publicar. No se configuraron dominio, URL canónica ni imagen social inventados.
# formula-en-alerta
