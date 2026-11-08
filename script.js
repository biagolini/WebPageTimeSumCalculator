document.getElementById('addRowBtn').addEventListener('click', () => addEntry());
document.getElementById('addActivityBtn').addEventListener('click', () => addActivity());
document.getElementById('clearAllBtn').addEventListener('click', clearAll);
document.getElementById('copySummaryBtn').addEventListener('click', copySummary);
document.getElementById('langPt').addEventListener('click', () => setLanguage('pt'));
document.getElementById('langEn').addEventListener('click', () => setLanguage('en'));

window.onload = function () {
  currentLang = localStorage.getItem('lang') || 'en';
  applyLanguage();
  loadPreviousEntries();
};

let entryCounter = 0;
let currentLang = 'en';

// Looks up a translation key for the current language, falling back to English then the key itself.
function t(key) {
  const lang = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  return lang[key] || TRANSLATIONS.en[key] || key;
}

// Switches language, persists the choice, and re-renders every translatable element and card.
function setLanguage(lang) {
  if (!TRANSLATIONS[lang]) return;
  currentLang = lang;
  localStorage.setItem('lang', lang);
  applyLanguage();
}

// Applies the current language to static elements, card labels, and the summary.
function applyLanguage() {
  document.documentElement.lang = currentLang;

  // Static elements tagged with data-i18n (text content).
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });

  // Active state on the language buttons.
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === currentLang);
  });

  // Re-label every existing card (type title, field labels, placeholders).
  document.querySelectorAll('.entry-card').forEach(relabelCard);

  updateSums();
}

// Updates the translatable labels inside a single card without touching its values.
function relabelCard(card) {
  const type = card.dataset.type;
  const numberEl = card.querySelector('.entry-number');
  if (numberEl) {
    const label = type === 'activity' ? t('card.activity') : t('card.run');
    numberEl.textContent = `${label} ${numberEl.dataset.index}`;
  }

  card.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  card.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
}

// Attaches input listeners that validate, recalculate and persist on every change.
function attachListeners(card) {
  const inputs = card.querySelectorAll('input, textarea');
  inputs.forEach(input => {
    input.addEventListener('input', () => {
      if (input.tagName === 'INPUT') {
        validateInput(input);
      }
      updateSums();
      saveEntries();
    });
  });
}

// Shared comment field markup used by both run and activity cards.
function commentFieldHtml(comment) {
  return `
    <div class="input-field input-field-text">
      <label data-i18n="field.comment">Comment (optional)</label>
      <textarea data-field="comment" rows="1" data-i18n-placeholder="placeholder.comment"
        placeholder="e.g. on an incline">${escapeHtml(comment)}</textarea>
    </div>
  `;
}

// Creates a run card (distance + time + optional comment).
function addEntry(distance = 0, hour = 0, minute = 0, second = 0, comment = '') {
  entryCounter++;
  const container = document.getElementById('entriesContainer');

  const entryCard = document.createElement('div');
  entryCard.className = 'entry-card';
  entryCard.dataset.entryId = entryCounter;
  entryCard.dataset.type = 'run';

  entryCard.innerHTML = `
    <div class="entry-header">
      <span class="entry-number" data-index="${entryCounter}">${t('card.run')} ${entryCounter}</span>
      <button class="delete-btn" onclick="deleteEntry(${entryCounter})">×</button>
    </div>

    <div class="input-group">
      <div class="input-field">
        <label data-i18n="field.distance">Distance</label>
        <input type="number" step="0.1" min="0" value="${distance}" data-field="distance">
      </div>
      <div class="input-field">
        <label data-i18n="field.hours">Hours</label>
        <input type="number" min="0" max="23" value="${hour}" data-field="hour">
      </div>
      <div class="input-field">
        <label data-i18n="field.minutes">Minutes</label>
        <input type="number" min="0" max="59" value="${minute}" data-field="minute">
      </div>
      <div class="input-field">
        <label data-i18n="field.seconds">Seconds</label>
        <input type="number" min="0" max="59" value="${second}" data-field="second">
      </div>
    </div>

    ${commentFieldHtml(comment)}

    <div class="sum-display">
      <span data-i18n="card.cumulative">${t('card.cumulative')}</span> <span class="sum-time">00:00:00</span>
    </div>
  `;

  container.appendChild(entryCard);
  attachListeners(entryCard);
  updateSums();
}

// Creates an activity card (time + free text + optional comment, e.g. strength training).
function addActivity(hour = 0, minute = 0, second = 0, text = '', comment = '') {
  entryCounter++;
  const container = document.getElementById('entriesContainer');

  const activityCard = document.createElement('div');
  activityCard.className = 'entry-card activity-card';
  activityCard.dataset.entryId = entryCounter;
  activityCard.dataset.type = 'activity';

  activityCard.innerHTML = `
    <div class="entry-header">
      <span class="entry-number" data-index="${entryCounter}">${t('card.activity')} ${entryCounter}</span>
      <button class="delete-btn" onclick="deleteEntry(${entryCounter})">×</button>
    </div>

    <div class="input-group input-group-activity">
      <div class="input-field">
        <label data-i18n="field.hours">Hours</label>
        <input type="number" min="0" max="23" value="${hour}" data-field="hour">
      </div>
      <div class="input-field">
        <label data-i18n="field.minutes">Minutes</label>
        <input type="number" min="0" max="59" value="${minute}" data-field="minute">
      </div>
      <div class="input-field">
        <label data-i18n="field.seconds">Seconds</label>
        <input type="number" min="0" max="59" value="${second}" data-field="second">
      </div>
    </div>

    <div class="input-field input-field-text">
      <label data-i18n="field.activity">Activity</label>
      <textarea data-field="text" rows="1" data-i18n-placeholder="placeholder.activity"
        placeholder="e.g. leg training">${escapeHtml(text)}</textarea>
    </div>

    ${commentFieldHtml(comment)}

    <div class="sum-display">
      <span data-i18n="card.cumulative">${t('card.cumulative')}</span> <span class="sum-time">00:00:00</span>
    </div>
  `;

  container.appendChild(activityCard);
  attachListeners(activityCard);
  updateSums();
}

function deleteEntry(entryId) {
  const entryCard = document.querySelector(`[data-entry-id="${entryId}"]`);
  if (entryCard) {
    entryCard.remove();
    updateSums();
    saveEntries();
  }
}

function validateInput(input) {
  const field = input.dataset.field;
  let value = parseInt(input.value) || 0;

  if (field === 'hour' && value > 23) {
    input.value = 23;
  } else if ((field === 'minute' || field === 'second') && value > 59) {
    input.value = 59;
  } else if (value < 0) {
    input.value = 0;
  }
}

// Returns the time inputs (hour, minute, second) of a card regardless of its type.
function getTimeInputs(card) {
  return {
    hour: parseInt(card.querySelector('[data-field="hour"]').value) || 0,
    minute: parseInt(card.querySelector('[data-field="minute"]').value) || 0,
    second: parseInt(card.querySelector('[data-field="second"]').value) || 0
  };
}

function updateSums() {
  const entries = document.querySelectorAll('.entry-card');
  let totalDistance = 0;
  let cumulativeSeconds = 0;
  let totalSeconds = 0;

  entries.forEach(entry => {
    const { hour, minute, second } = getTimeInputs(entry);
    const entrySeconds = hour * 3600 + minute * 60 + second;

    // The cumulative time counts every card, runs and activities alike.
    cumulativeSeconds += entrySeconds;
    totalSeconds += entrySeconds;

    // Only runs contribute distance (and therefore pace).
    if (entry.dataset.type === 'run') {
      const distance = parseFloat(entry.querySelector('[data-field="distance"]').value) || 0;
      totalDistance += distance;
    }

    const sumDisplay = entry.querySelector('.sum-time');
    sumDisplay.textContent = formatTime(cumulativeSeconds);
  });

  updateSummary(totalDistance, totalSeconds);
  updateCopySummary();
}

function updateSummary(totalDistance, totalSeconds) {
  const averagePaceSeconds = totalDistance > 0 ? totalSeconds / totalDistance : 0;
  const paceMinutes = Math.floor(averagePaceSeconds / 60);
  const paceSeconds = Math.round(averagePaceSeconds % 60);

  document.getElementById('totalDistance').textContent = totalDistance.toFixed(1);
  document.getElementById('totalTime').textContent = formatTime(totalSeconds);
  document.getElementById('averagePace').textContent =
    totalDistance > 0 ? `${paceMinutes}:${paceSeconds.toString().padStart(2, '0')}` : '0:00';
}

// Builds the copyable summary, one line per card in display order and in the current language.
function updateCopySummary() {
  const entries = document.querySelectorAll('.entry-card');
  const lines = [];

  entries.forEach(entry => {
    const { hour, minute, second } = getTimeInputs(entry);
    const entrySeconds = hour * 3600 + minute * 60 + second;
    const timeStr = formatSummaryTime(entrySeconds);
    const comment = entry.querySelector('[data-field="comment"]').value.trim();
    const suffix = comment ? ` - ${comment}` : '';

    let line;
    if (entry.dataset.type === 'run') {
      const distance = parseFloat(entry.querySelector('[data-field="distance"]').value) || 0;
      line = `${formatDistance(distance)} km ${t('summaryText.in')} ${timeStr}`;
    } else {
      const text = entry.querySelector('[data-field="text"]').value.trim();
      line = `${timeStr} ${t('summaryText.of')} ${text || t('summaryText.activityFallback')}`;
    }
    lines.push(line + suffix);
  });

  document.getElementById('summaryText').value = lines.join('\n');
}

// Formats a distance as entered, letting whole numbers show without a decimal (2, 2.5).
function formatDistance(distance) {
  return distance.toString();
}

// H:MM:SS, with the hours part omitted when the duration is under one hour (MM:SS).
function formatSummaryTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function formatTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Escapes user text so it is safe to drop into the card's innerHTML on load.
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function copySummary() {
  const summaryText = document.getElementById('summaryText');
  const text = summaryText.value;
  if (!text) return;

  const btn = document.getElementById('copySummaryBtn');
  const done = () => {
    btn.textContent = t('copy.copied');
    setTimeout(() => { btn.textContent = t('copy.button'); }, 1500);
  };

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(summaryText, done));
  } else {
    fallbackCopy(summaryText, done);
  }
}

function fallbackCopy(textarea, done) {
  textarea.removeAttribute('readonly');
  textarea.select();
  document.execCommand('copy');
  textarea.setAttribute('readonly', '');
  window.getSelection().removeAllRanges();
  done();
}

function saveEntries() {
  const entries = [];
  document.querySelectorAll('.entry-card').forEach(entry => {
    const { hour, minute, second } = getTimeInputs(entry);
    const comment = entry.querySelector('[data-field="comment"]').value;
    if (entry.dataset.type === 'run') {
      const distance = entry.querySelector('[data-field="distance"]').value;
      entries.push({ type: 'run', distance, hour, minute, second, comment });
    } else {
      const text = entry.querySelector('[data-field="text"]').value;
      entries.push({ type: 'activity', hour, minute, second, text, comment });
    }
  });
  localStorage.setItem('entries', JSON.stringify(entries));
}

function loadPreviousEntries() {
  const entries = JSON.parse(localStorage.getItem('entries'));
  if (entries && entries.length > 0) {
    entries.forEach(entry => {
      if (entry.type === 'activity') {
        addActivity(entry.hour, entry.minute, entry.second, entry.text, entry.comment || '');
      } else {
        addEntry(entry.distance, entry.hour, entry.minute, entry.second, entry.comment || '');
      }
    });
  } else {
    addEntry();
  }
}

function clearAll() {
  document.getElementById('entriesContainer').innerHTML = '';
  entryCounter = 0;
  localStorage.removeItem('entries');
  addEntry();
}
