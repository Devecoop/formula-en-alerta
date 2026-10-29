// Solo se ignoran mayúsculas, espacios y separadores; nunca se sustituyen letras o números.
const normalizeLot = value => String(value).toUpperCase().replace(/[\s:.,/_\-–—]/g, '');

// Distancia de edición con transposiciones de caracteres contiguos (OSA).
function identifierDistance(left, right) {
	const rows = Array.from({length: left.length + 1}, (_, i) => [i]);
	for (let j = 0; j <= right.length; j++) rows[0][j] = j;
	for (let i = 1; i <= left.length; i++) {
		for (let j = 1; j <= right.length; j++) {
			rows[i][j] = Math.min(rows[i - 1][j] + 1, rows[i][j - 1] + 1,
				rows[i - 1][j - 1] + (left[i - 1] === right[j - 1] ? 0 : 1));
			if (i > 1 && j > 1 && left[i - 1] === right[j - 2] && left[i - 2] === right[j - 1]) {
				rows[i][j] = Math.min(rows[i][j], rows[i - 2][j - 2] + 1);
			}
		}
	}
	return rows[left.length][right.length];
}

function compareIdentifier(value, alert) {
	const code = normalizeLot(value);
	const references = alert.lots.map(normalizeLot);
	if (!code || code.length > 120 || !/^[A-Z0-9]+$/.test(code)) return 'invalid';
	if (references.includes(code)) return 'identifier-match';
	// Se admiten hasta dos caracteres faltantes; fragmentos más cortos requieren la inscripción completa.
	if (code.length < Math.min(...references.map(ref => ref.length)) - 2) return 'incomplete';
	if (references.some(ref => identifierDistance(code, ref) <= 2)) return 'identifier-similar';
	return references.some(ref => ref.startsWith(code)) ? 'incomplete' : 'identifier-unmatched';
}
const dateValid = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0,10) === value;
const nonempty = value => typeof value === 'string' && value.trim().length > 0;
const strings = value => Array.isArray(value) && value.every(nonempty);
function officialUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password && !url.port && ['gba.gob.ar','www.gba.gob.ar','argentina.gob.ar','www.argentina.gob.ar','anmat.gob.ar','www.anmat.gob.ar','inal.sifega.anmat.gob.ar'].includes(url.hostname) && url.pathname !== '/';
  } catch { return false; }
}
function validateDatabase(db) {
  const errors = [];
  if (db?.schemaVersion !== 1 || !nonempty(db?.coverage) || !Array.isArray(db?.alerts)) return ['Estructura de base inválida.'];
  const ids = new Set();
  for (const a of db.alerts) {
    if (!a || typeof a !== 'object') { errors.push('Registro inválido.'); continue; }
    const id = a.id || '(sin ID)';
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(a.id || '') || ids.has(a.id)) errors.push(`${id}: ID inválido o duplicado.`);
    ids.add(a.id);
    for (const field of ['brand','name','officialName','agency','type','reason','lotNote','sourceTitle']) if (!nonempty(a[field])) errors.push(`${id}: falta ${field}.`);
    if (!['published','withdrawn','draft'].includes(a.status)) errors.push(`${id}: estado inválido.`);
    if (!officialUrl(a.sourceUrl)) errors.push(`${id}: fuente oficial HTTPS obligatoria.`);
    if (!dateValid(a.publishedAt) || !dateValid(a.reviewedAt) || a.reviewedAt < a.publishedAt) errors.push(`${id}: fechas inválidas.`);
    for (const field of ['rne','rnpa','manufactured','expires']) if (a[field] !== null && !nonempty(a[field])) errors.push(`${id}: ${field} debe ser texto o null.`);
    for (const field of ['aliases','lots','irregularities','recommendations']) if (!strings(a[field])) errors.push(`${id}: ${field} debe ser una lista de textos.`);
    if (!a.recommendations?.length) errors.push(`${id}: recomendaciones obligatorias.`);
    if (!['published','not_published'].includes(a.lotAvailability) || (a.lotAvailability === 'published') !== (a.lots?.length > 0)) errors.push(`${id}: disponibilidad de lote inconsistente.`);
    if (!Array.isArray(a.contacts) || a.contacts.some(c => !c || !nonempty(c.label) || !nonempty(c.value) || !/^(https:\/\/wa\.me\/\d+|mailto:[^\s]+@[^\s]+|tel:[+\d]+)$/.test(c.url))) errors.push(`${id}: contacto inválido.`);
  }
  return errors;
}
const publishedAlerts = db => db.alerts.filter(a => a.status === 'published').sort((a,b) => b.publishedAt.localeCompare(a.publishedAt));
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const formatDate = date => new Intl.DateTimeFormat('es-AR',{day:'2-digit',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(date+'T12:00:00Z'));
const icon = (name, base='./') => `<svg class="icon" aria-hidden="true"><use href="${base}assets/icons.svg#${name}"></use></svg>`;
const sourceLink = (a,base='./', label='Comunicado oficial') => `<a class="source-link" href="${escapeHtml(a.sourceUrl)}" target="_blank" rel="noopener noreferrer">${label} ${icon('external',base)}<span class="sr-only"> (abre una pestaña nueva)</span></a>`;
const sourceCitation = (a, base = './') => `<p class="source-citation">Fuente: ${sourceLink(a, base, `${escapeHtml(a.agency.split(' · ')[0])} · «${escapeHtml(a.sourceTitle)}» · ${formatDate(a.publishedAt)}`)}</p>`;
const medicalNotice = '<p class="medical-notice"><strong>Importante: información orientativa.</strong> No reemplaza la consulta pediátrica ni las indicaciones de las autoridades sanitarias. Ante síntomas o sospecha sobre el producto, consultá al pediatra y seguí las recomendaciones oficiales.</p>';
let cardSequence = 0;
function card(a, base = './', state = null) {
	const backId = `card-back-${++cardSequence}`;
	const product = escapeHtml(`${a.brand} ${a.name}`);
	const badge = state === 'insufficient'
		? 'El lote consultado no coincide'
		: a.lotAvailability === 'published' ? 'Identificador publicado' : 'Lote no publicado';
	const matchNote = !state ? '' : state === 'insufficient'
		? 'Esta alerta aporta contexto del producto; no establece una coincidencia con tu lote.'
		: state === 'lot_unpublished'
			? 'No podemos comparar un lote individual con este comunicado.'
			: 'La coincidencia no certifica el estado de un envase individual.';
	const list = items => items.map(item => `<li>${escapeHtml(item)}</li>`).join('');

	return `
		<article class="alert-card" aria-label="${product}">
			<div class="flip-card-inner">
				<div class="card-face card-front">
					<div class="card-top">
						<span class="eyebrow">${escapeHtml(a.agency.split(' · ')[0])} · BUENOS AIRES</span>
						<time datetime="${a.publishedAt}">${formatDate(a.publishedAt)}</time>
					</div>
					<div class="card-mark" aria-hidden="true">${icon('document', base)}</div>
					<p class="brand-name">${escapeHtml(a.brand)}</p>
					<h3><button type="button" class="card-title-button" data-flip aria-expanded="false" aria-controls="${backId}">${escapeHtml(a.name)}</button></h3>
					<span class="badge ${a.lotAvailability === 'published' ? 'published' : ''}">${badge}</span>
					<p class="card-reason">${escapeHtml(a.reason)}</p>
					${matchNote ? `<p class="match-note">${matchNote}</p>` : ''}
					<p class="card-lot">${a.lots.length ? `Identificador: <strong>${escapeHtml(a.lots[0])}</strong>` : 'La autoridad no publicó un número de lote.'}</p>
					<div class="card-links">
						<button type="button" class="detail-link" data-flip aria-expanded="false" aria-controls="${backId}">Ver recomendaciones ${icon('arrow', base)}</button>
						${sourceLink(a, base, 'Fuente oficial')}
					</div>
					<p class="review-date">Revisión: ${formatDate(a.reviewedAt)}</p>
				</div>
				<div class="card-face card-back" id="${backId}" aria-hidden="true" inert>
					<p class="eyebrow">${escapeHtml(a.agency.split(' · ')[0])} · ${formatDate(a.publishedAt)}</p>
					<h3 class="card-back-heading" id="${backId}-title">${product}</h3>
					<div class="card-back-content" tabindex="0" aria-label="Recomendaciones y datos de ${product}">
						${sourceCitation(a, base)}
						${matchNote ? `<p class="match-note">${matchNote}</p>` : ''}
						<h4>Qué recomienda el organismo</h4>
						<ul>${list(a.recommendations)}</ul>
						${medicalNotice}
						<h4>Sobre el lote</h4>
						<p>${escapeHtml(a.lotNote)}</p>
						${a.lots.length ? `<p><strong>${a.lots.map(escapeHtml).join(' · ')}</strong>${a.manufactured ? `<br>Elaboración: ${escapeHtml(a.manufactured)} · Vencimiento: ${escapeHtml(a.expires)}` : ''}</p>` : ''}
						<h4>Características publicadas</h4>
						<ul>${list(a.irregularities) || '<li>Sin características adicionales publicadas.</li>'}</ul>
						<p class="card-identifiers">RNPA: ${escapeHtml(a.rnpa || 'No publicado')}<br>RNE: ${escapeHtml(a.rne || 'No publicado')}</p>
						${a.contacts.length ? `<h4>Canales publicados</h4>${a.contacts.map(c => `<p><a href="${escapeHtml(c.url)}">${escapeHtml(c.label)}: ${escapeHtml(c.value)}</a></p>`).join('')}` : ''}
						<p class="card-back-agency">${escapeHtml(a.agency)}</p>
					</div>
					<div class="card-links">
						<button type="button" class="detail-link card-back-close" data-flip aria-describedby="${backId}-title">Volver al resumen ${icon('arrow', base)}</button>
						${sourceLink(a, base, 'Fuente oficial')}
					</div>
					<p class="review-date">Revisión: ${formatDate(a.reviewedAt)}</p>
				</div>
			</div>
		</article>`;
}

function flipCard(element) {
	const flipped = !element.classList.contains('is-flipped');
	const front = element.querySelector('.card-front');
	const back = element.querySelector('.card-back');
	element.classList.toggle('is-flipped', flipped);
	front.inert = flipped;
	back.inert = !flipped;
	front.setAttribute('aria-hidden', String(flipped));
	back.setAttribute('aria-hidden', String(!flipped));
	front.querySelectorAll('[data-flip]').forEach(button => button.setAttribute('aria-expanded', String(flipped)));
	const focusTarget = flipped ? element.querySelector('.card-back-close') : element.querySelector('.card-front .detail-link');
	focusTarget.focus({preventScroll: true});
}

document.addEventListener('click', event => {
	const button = event.target.closest('[data-flip]');
	const front = event.target.closest('.card-front');
	if (!button && (!front || event.target.closest('a') || window.getSelection()?.toString())) return;
	const element = (button || front).closest('.alert-card');
	if (element) flipCard(element);
});

document.addEventListener('keydown', event => {
	if (event.key !== 'Escape') return;
	const element = event.target.closest('.alert-card.is-flipped');
	if (element) {
		event.preventDefault();
		flipCard(element);
	}
});

// El JSON es la única fuente de datos. No se envían ni guardan las búsquedas.
let databasePromise;
function loadDatabase() {
  if (!databasePromise) {
    databasePromise = fetch('data/alerts.json', {cache: 'no-cache'})
      .then(response => {
        if (!response.ok) throw new Error('No se pudo cargar la base.');
        return response.json();
      })
      .then(db => {
        if (validateDatabase(db).length) throw new Error('Datos inválidos.');
        return db;
      })
      .catch(error => { databasePromise = null; throw error; });
  }
  return databasePromise;
}
const e = escapeHtml;

// Consulta guiada: una marca y una presentación o identificador, sin registrar consultas.
let availableAlerts = [];
let selectedAlert = null;
let selectedBrand = null;
const brandOptions = document.querySelector('#brand-options');
const selectionSummary = document.querySelector('#selection-summary');
const nextStep = document.querySelector('#guided-next');
const resultPanel = document.querySelector('#guided-result');
const lotForm = document.querySelector('#lot-form');
const lotInput = document.querySelector('#lot');
const guideStatus = document.querySelector('#guide-status');
const formatNumericDate = value => new Intl.DateTimeFormat('es-AR', {
	day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC'
}).format(new Date(value + 'T12:00:00Z'));

function clearGuidedResult() {
	resultPanel.hidden = true;
	resultPanel.replaceChildren();
	delete resultPanel.dataset.state;
	document.querySelector('#lot-feedback').textContent = '';
	lotInput.removeAttribute('aria-invalid');
}

function selectBrand(brand) {
	selectedBrand = brand;
	selectedAlert = null;
	clearGuidedResult();
	lotForm.reset();
	const products = availableAlerts.filter(a => a.brand === brand);
	const presentations = document.querySelector('#presentation-options');
	presentations.replaceChildren();
	nextStep.hidden = !products.length;
	if (!products.length) {
		guideStatus.textContent = 'No hay registros publicados para esta marca en la base cargada. Esto no garantiza la autenticidad ni seguridad del producto.';
		return;
	}
	const isNutrilon = brand === 'Nutrilon';
	document.querySelector('#presentation-step').hidden = !isNutrilon;
	lotForm.hidden = isNutrilon;
	brandOptions.hidden = true;
	selectionSummary.hidden = false;
	document.querySelector('#selected-brand').textContent = isNutrilon ? 'Nutrilon' : 'SanCor Bebé';
	document.querySelector('#next-heading').textContent = isNutrilon ? '¿Cuál de estos nombres aparece en tu envase?' : 'SanCor Bebé 1 Advanced';
	guideStatus.textContent = isNutrilon
		? 'Elegí el nombre que ves en tu envase. No te pediremos el lote porque la DIPA no lo publicó.'
		: 'Escribí el lote de tu envase para compararlo con el que publicó la DIPA.';
	if (isNutrilon) {
		presentations.innerHTML = products.map(a => `
			<details class="presentation-accordion">
				<summary class="presentation-option" data-alert-id="${e(a.id)}">
					<span class="presentation-option-content">
						<strong id="presentation-title-${e(a.id)}">${e(a.presentationLabel || a.brand + ' ' + a.name)}</strong>
						<span class="option-action accordion-open-label">Ver recomendación</span>
						<span class="option-action accordion-close-label">Cerrar recomendación</span>
						<span class="option-arrow accordion-indicator" aria-hidden="true"></span>
					</span>
				</summary>
				<div class="presentation-panel" role="region" aria-labelledby="presentation-title-${e(a.id)}" hidden></div>
			</details>`).join('');
		document.querySelector('#presentation-reference').innerHTML = products.map(a => `
			<p><strong>${e(a.presentationLabel || a.name)}</strong><br>RNPA: ${e(a.rnpa || 'No publicado')}<br><span>${e(a.officialName)}</span></p>`).join('');
		document.querySelector('#presentation-help').open = false;
	} else {
		selectedAlert = products[0];
		const canCompare = selectedAlert.lotAvailability === 'published' && selectedAlert.lots.length > 0;
		lotForm.hidden = !canCompare;
		document.querySelector('#selected-sancor').textContent = selectedAlert.officialName;
		if (!canCompare) showGuidedResult(selectedAlert);
	}
	if (!nextStep.hidden) {
		document.querySelector('#next-heading').focus({preventScroll: true});
		selectionSummary.scrollIntoView({block: 'nearest', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
	}
}

function showGuidedResult(a, identifierState = null, target = resultPanel) {
	const inline = target !== resultPanel;
	const numericDate = formatNumericDate(a.publishedAt);
	const isPublished = a.lotAvailability === 'published';
	const isSanCor = a.brand === 'SanCor';
	const dipaContacts = a.contacts.filter(contact => contact.label.startsWith('DIPA') && /^(tel:|https:\/\/wa\.me\/)/.test(contact.url));
	const list = items => items.map(item => `<li>${e(item)}</li>`).join('');
	let identifierMessage = '';
	if (identifierState !== null) {
		const messages = {
			'identifier-match': ['El código coincide con el publicado en una alerta oficial', 'Esto no confirma, por sí solo, que el producto sea falsificado. Revisá también las características del envase y las fechas publicadas por la DIPA.'],
			'identifier-similar': ['El código es similar', 'Hay una o dos diferencias de caracteres: pueden faltar, sobrar, ser distintos o estar en otro orden. Puede haber un error de escritura: revisá la inscripción completa. No podemos afirmar que sea el código publicado ni que el producto sea falsificado.'],
			'identifier-unmatched': ['No encontramos coincidencias en nuestra base actual de alertas oficiales', 'Esto no garantiza que el producto sea auténtico o seguro. La base es parcial. Revisá las diferencias del envase descriptas por DIPA y consultá las fuentes oficiales o al fabricante.']
		};
		const [title, description] = messages[identifierState];
		identifierMessage = `<div class="identifier-message"><p><strong>${title}</strong></p><p>${description}</p><p>Ingresaste: <strong>${e(lotInput.value)}</strong></p></div>`;
	}
	const recommendations = a.recommendations.map(item => {
		let text = e(item);
		for (const contact of a.contacts.filter(c => c.url.startsWith('tel:'))) {
			text = text.replaceAll(e(contact.value), `<a href="${e(contact.url)}">${e(contact.value)}</a>`);
		}
		return `<li>${text}</li>`;
	}).join('');
	target.dataset.state = identifierState || 'lot-unpublished';
	target.innerHTML = `
		<article class="consultation-result">
			${inline ? '' : `<p class="eyebrow">LA INFORMACIÓN DE TU PRODUCTO</p><h3 id="result-title" tabindex="-1">${e(a.brand + ' ' + a.name)}</h3>`}
			<p class="result-meta">Alerta del <time datetime="${a.publishedAt}">${numericDate}</time> · Revisión: <time datetime="${a.reviewedAt}">${formatNumericDate(a.reviewedAt)}</time></p>
			<p class="result-agency">${e(a.agency)}</p>
			${sourceCitation(a)}
			${inline ? '' : `<button type="button" id="change-selection" class="change-selection">${a.brand === 'Nutrilon' ? 'Elegir otra presentación' : 'Cambiar el lote'}</button>`}
			<section class="result-section">
				<h4>Qué pasó</h4>
				${identifierMessage}
				${isSanCor ? `<a class="button primary result-source" href="${e(a.sourceUrl)}" target="_blank" rel="noopener noreferrer">Leer el comunicado oficial ${icon('external')}<span class="sr-only"> (abre una pestaña nueva)</span></a>` : ''}
				${isSanCor ? '<p class="identifier-safety"><strong>La ausencia de coincidencias no garantiza que el producto sea auténtico o seguro.</strong> Esta consulta no certifica productos.</p>' : ''}
				<p>${e(a.reason)}</p>
			</section>
			<section class="result-section">
				<h4>Qué mirar en el envase</h4>
				<p${isPublished ? '' : ' class="unpublished-note"'}>${isPublished ? '' : '<strong>Lote no publicado.</strong> '}${e(a.lotNote)}</p>
				${isPublished ? `<div class="published-identifier"><p>Inscripción completa publicada por DIPA: <strong>${a.lots.map(e).join(' · ')}</strong></p>${a.manufactured ? `<div class="date-comparison"><p>Fechas publicadas por DIPA. Comparalas con las de tu envase:</p><p>Elaboración: <strong>${e(a.manufactured.replace(/20(\d{2})$/, '$1'))}</strong></p><p>Vencimiento: <strong>${e(a.expires.replace(/20(\d{2})$/, '$1'))}</strong></p></div>` : ''}</div>` : ''}
				${isSanCor ? `<details class="package-checklist"><summary>Revisar características del envase (opcional)</summary><p>Marcá solo las diferencias que reconocés en tu envase, según lo descripto por DIPA. Si no podés compararlas, podés dejar la lista sin marcar. No marcar ninguna tampoco garantiza seguridad.</p><fieldset><legend>Diferencias que informó la DIPA</legend>${a.irregularities.map(item => `<label><input type="checkbox" name="package-concern"><span>${e(item)}</span></label>`).join('')}</fieldset><p class="package-concern-message" role="status" hidden>Marcaste una característica sospechosa. Esto no confirma una falsificación. Revisá las recomendaciones de DIPA debajo y consultá el comunicado oficial.</p></details>` : a.irregularities.length ? `<div class="product-warning"><h5>Diferencias que informó la DIPA</h5><ul>${list(a.irregularities)}</ul></div>` : ''}
			</section>
			${isSanCor ? `<details class="result-advice"${identifierState !== 'identifier-unmatched' ? ' open' : ''}><summary>Ver recomendaciones y contactos de DIPA</summary>` : ''}
			<section class="result-recommendations">
				<h4>Qué recomienda la DIPA</h4>
				<ul>${recommendations}</ul>
				${medicalNotice}
				${dipaContacts.length ? `<div class="dipa-contact-actions" aria-label="Contactos oficiales de DIPA">${dipaContacts.map(contact => `<a class="button secondary" href="${e(contact.url)}"${contact.url.startsWith('https:') ? ' target="_blank" rel="noopener noreferrer"' : ''}>${contact.url.startsWith('tel:') ? 'Llamar a DIPA' : 'Consultar a DIPA por WhatsApp'}</a>`).join('')}</div>` : ''}
			</section>
			${isSanCor ? '' : `<a class="button primary result-source" href="${e(a.sourceUrl)}" target="_blank" rel="noopener noreferrer">Leer el comunicado oficial ${icon('external')}<span class="sr-only"> (abre una pestaña nueva)</span></a>`}
			${isSanCor ? '</details>' : ''}
			<details class="product-data">
				<summary>Datos del producto</summary>
				<dl><div><dt>Denominación publicada</dt><dd>${e(a.officialName)}</dd></div><div><dt>RNPA</dt><dd>${e(a.rnpa || 'No publicado')}</dd></div><div><dt>RNE</dt><dd>${e(a.rne || 'No publicado')}</dd></div></dl>
				${a.contacts.length ? `<p class="product-contacts">Canales publicados: ${a.contacts.map(c => `<a href="${e(c.url)}">${e(c.label)}: ${e(c.value)}</a>`).join(' · ')}</p>` : ''}
			</details>
			${inline ? '' : '<button type="button" id="restart-consultation" class="restart-consultation">Comenzar otra consulta</button>'}
		</article>`;
	if (!inline) nextStep.hidden = true;
	target.hidden = false;
	guideStatus.textContent = 'Ya podés leer la alerta de ' + a.brand + ' ' + a.name + ' y sus recomendaciones.';
	if (!inline) {
		document.querySelector('#result-title').focus({preventScroll: true});
		resultPanel.scrollIntoView({behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start'});
	}
}

brandOptions.addEventListener('click', event => {
	const button = event.target.closest('[data-brand]');
	if (button && !brandOptions.disabled && !button.disabled) selectBrand(button.dataset.brand);
});

document.querySelector('#presentation-options').addEventListener('click', event => {
	const summary = event.target.closest('summary[data-alert-id]');
	if (!summary) return;
	event.preventDefault();
	const accordion = summary.closest('.presentation-accordion');
	const opening = !accordion.open;
	document.querySelectorAll('.presentation-accordion').forEach(item => {
		item.open = false;
		item.querySelector('.presentation-panel').hidden = true;
	});
	summary.focus({preventScroll: true});
	if (!opening) {
		selectedAlert = null;
		guideStatus.textContent = 'Podés abrir cualquiera de las dos recomendaciones.';
		return;
	}
	selectedAlert = availableAlerts.find(a => a.id === summary.dataset.alertId && a.brand === 'Nutrilon');
	if (selectedAlert) {
		accordion.open = true;
		showGuidedResult(selectedAlert, null, accordion.querySelector('.presentation-panel'));
	}
});

lotForm.addEventListener('submit', event => {
	event.preventDefault();
	if (!selectedAlert || lotForm.hidden) return;
	const state = compareIdentifier(lotInput.value, selectedAlert);
	if (state === 'invalid' || state === 'incomplete') {
		clearGuidedResult();
		document.querySelector('#lot-feedback').textContent = state === 'incomplete'
			? 'El código parece incompleto. Copiá toda la inscripción del lote, con sus letras y números. No podemos comparar un fragmento.'
			: 'El formato no es válido. Copiá la inscripción completa del lote, con sus letras, números y separadores.';
		lotInput.setAttribute('aria-invalid', 'true');
		lotInput.focus();
		return;
	}
	document.querySelector('#lot-feedback').textContent = '';
	lotInput.removeAttribute('aria-invalid');
	showGuidedResult(selectedAlert, state);
});

resultPanel.addEventListener('change', event => {
	if (!event.target.matches('[name="package-concern"]')) return;
	const hasConcern = [...resultPanel.querySelectorAll('[name="package-concern"]')].some(input => input.checked);
	resultPanel.querySelector('.package-concern-message').hidden = !hasConcern;
	const advice = resultPanel.querySelector('.result-advice');
	advice.classList.toggle('has-concern', hasConcern);
	if (hasConcern) advice.open = true;
});

lotInput.addEventListener('input', () => {
	const hadResult = !resultPanel.hidden;
	clearGuidedResult();
	if (hadResult) guideStatus.textContent = 'Cambiaste el lote. Consultalo de nuevo para compararlo con el que publicó la DIPA.';
});

function restartConsultation() {
	clearGuidedResult();
	brandOptions.hidden = false;
	selectionSummary.hidden = true;
	nextStep.hidden = true;
	selectedAlert = null;
	selectedBrand = null;
	lotForm.reset();
	document.querySelector('#presentation-options').replaceChildren();
	document.querySelector('#presentation-reference').replaceChildren();
	document.querySelector('#presentation-help').open = false;
	guideStatus.textContent = 'Elegí la marca que aparece en tu envase.';
	brandOptions.querySelector('button:not(:disabled)')?.focus({preventScroll: true});
	brandOptions.scrollIntoView({block: 'nearest', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
}

document.querySelector('#change-brand').addEventListener('click', restartConsultation);

resultPanel.addEventListener('click', event => {
	if (event.target.closest('#restart-consultation')) {
		restartConsultation();
		return;
	}
	if (!event.target.closest('#change-selection')) return;
	clearGuidedResult();
	nextStep.hidden = false;
	guideStatus.textContent = selectedBrand === 'Nutrilon'
		? 'Elegí el nombre que ves en tu envase.'
		: 'Podés corregir el lote o escribir otro.';
	const focusTarget = selectedBrand === 'Nutrilon' ? document.querySelector('#next-heading') : lotInput;
	focusTarget.focus({preventScroll: true});
	nextStep.scrollIntoView({block: 'nearest', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
});

document.querySelector('#retry-guide').addEventListener('click', showContent);


// Listado y ficha se actualizan directamente al editar el JSON, sin generar páginas.
async function showContent() {
  brandOptions.disabled = true;
  document.querySelector('#retry-guide').hidden = true;
  guideStatus.textContent = 'Cargando los registros oficiales disponibles…';
  try {
    const db = await loadDatabase();
    const alerts = publishedAlerts(db);
    availableAlerts = alerts;
    brandOptions.disabled = false;
    brandOptions.querySelectorAll('[data-brand]').forEach(button => {
      button.disabled = !alerts.some(a => a.brand === button.dataset.brand);
    });
    guideStatus.textContent = 'Elegí la marca que aparece en tu envase.';
    const recent = document.querySelector('#recent-cards');
    if (recent) recent.innerHTML = alerts.slice(0, 3).map(a => card(a)).join('') || '<p>No hay alertas publicadas en esta base.</p>';
    document.querySelectorAll('[data-alert-count]').forEach(el => el.textContent = alerts.length + ' alertas en esta base');
    document.querySelectorAll('[data-coverage]').forEach(el => el.textContent = db.coverage);
    const latest = alerts.map(a => a.reviewedAt).sort().pop();
    document.querySelectorAll('[data-review-date]').forEach(el => el.textContent = latest ? formatDate(latest) : 'Sin registros publicados');
    const config = db.config || {};
    const cta = document.querySelector('.institutional-cta .muted');
    if (cta && config.institutionalUrl) {
      const url = new URL(config.institutionalUrl);
      if (url.protocol === 'https:') {
        const a = document.createElement('a'); a.href = url.href; a.textContent = cta.textContent;
        a.target = '_blank'; a.rel = 'noopener noreferrer'; cta.replaceWith(a);
      }
    }
    const sources = document.querySelector('#source-documents');
    if (sources) sources.innerHTML = alerts.map(a => '<li>' + sourceLink(a, './', escapeHtml(a.brand + ' ' + a.name)) + ' <span>' + formatDate(a.publishedAt) + '</span></li>').join('');
    const agencies = [...new Set(alerts.map(a => a.agency))];
    const scope = document.querySelector('#source-scope');
    if (scope) scope.textContent = agencies.length === 1
      ? 'La única fuente de las alertas cargadas es ' + agencies[0] + '.'
      : agencies.length ? 'Fuentes de las alertas cargadas: ' + agencies.join('; ') + '.' : 'No hay alertas publicadas ni fuentes cargadas.';
  } catch {
    availableAlerts = [];
    selectedAlert = null;
	selectedBrand = null;
	brandOptions.hidden = false;
	selectionSummary.hidden = true;
    brandOptions.disabled = true;
    nextStep.hidden = true;
    clearGuidedResult();
    guideStatus.textContent = 'No pudimos cargar o validar los registros. Esto no significa que no existan alertas. Reintentá o consultá los comunicados oficiales enlazados.';
    document.querySelector('#retry-guide').hidden = false;
    for (const selector of ['#recent-cards', '#source-documents']) {
      const el = document.querySelector(selector);
      if (el) el.innerHTML = '<p class="notice">No se pudo cargar la información. Esto no significa que no existan alertas. Intentá recargar o consultá las fuentes oficiales.</p>';
    }
  }
}

showContent();
