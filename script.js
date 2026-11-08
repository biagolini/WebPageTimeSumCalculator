document.getElementById('addRowBtn').addEventListener('click', () => addEntry());
document.getElementById('addActivityBtn').addEventListener('click', () => addActivity());
document.getElementById('clearAllBtn').addEventListener('click', clearAll);
document.getElementById('copySummaryBtn').addEventListener('click', copySummary);

window.onload = function () {
  loadPreviousEntries();
};

let entryCounter = 0;

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

// Creates a run card (distance + time).
function addEntry(distance = 0, hour = 0, minute = 0, second = 0) {
  entryCounter++;
  const container = document.getElementById('entriesContainer');

  const entryCard = document.createElement('div');
  entryCard.className = 'entry-card';
  entryCard.dataset.entryId = entryCounter;
  entryCard.dataset.type = 'run';

  entryCard.innerHTML = `
    <div class="entry-header">
      <span class="entry-number">Run ${entryCounter}</span>
      <button class="delete-btn" onclick="deleteEntry(${entryCounter})">×</button>
    </div>

    <div class="input-group">
      <div class="input-field">
        <label>Distance</label>
        <input type="number" step="0.1" min="0" value="${distance}" data-field="distance">
      </div>
      <div class="input-field">
        <label>Hours</label>
        <input type="number" min="0" max="23" value="${hour}" data-field="hour">
      </div>
      <div class="input-field">
        <label>Minutes</label>
        <input type="number" min="0" max="59" value="${minute}" data-field="minute">
      </div>
      <div class="input-field">
        <label>Seconds</label>
        <input type="number" min="0" max="59" value="${second}" data-field="second">
      </div>
    </div>

    <div class="sum-display">
      Cumulative: <span class="sum-time">00:00:00</span>
    </div>
  `;

  container.appendChild(entryCard);
  attachListeners(entryCard);
  updateSums();
}

// Creates an activity card (time + free text, e.g. strength training).
function addActivity(hour = 0, minute = 0, second = 0, text = '') {
  entryCounter++;
  const container = document.getElementById('entriesContainer');

  const activityCard = document.createElement('div');
  activityCard.className = 'entry-card activity-card';
  activityCard.dataset.entryId = entryCounter;
  activityCard.dataset.type = 'activity';

  activityCard.innerHTML = `
    <div class="entry-header">
      <span class="entry-number">Activity ${entryCounter}</span>
      <button class="delete-btn" onclick="deleteEntry(${entryCounter})">×</button>
    </div>

    <div class="input-group input-group-activity">
      <div class="input-field">
        <label>Hours</label>
        <input type="number" min="0" max="23" value="${hour}" data-field="hour">
      </div>
      <div class="input-field">
        <label>Minutes</label>
        <input type="number" min="0" max="59" value="${minute}" data-field="minute">
      </div>
      <div class="input-field">
        <label>Seconds</label>
        <input type="number" min="0" max="59" value="${second}" data-field="second">
      </div>
    </div>

    <div class="input-field input-field-text">
      <label>Activity</label>
      <textarea data-field="text" rows="1" placeholder="e.g. leg training">${text}</textarea>
    </div>

    <div class="sum-display">
      Cumulative: <span class="sum-time">00:00:00</span>
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

// Builds the copyable summary, one line per card in display order.
function updateCopySummary() {
  const entries = document.querySelectorAll('.entry-card');
  const lines = [];

  entries.forEach(entry => {
    const { hour, minute, second } = getTimeInputs(entry);
    const entrySeconds = hour * 3600 + minute * 60 + second;
    const timeStr = formatSummaryTime(entrySeconds);

    if (entry.dataset.type === 'run') {
      const distance = parseFloat(entry.querySelector('[data-field="distance"]').value) || 0;
      lines.push(`${formatDistance(distance)} km em ${timeStr}`);
    } else {
      const text = entry.querySelector('[data-field="text"]').value.trim();
      lines.push(`${timeStr} de ${text || 'activity'}`);
    }
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

function copySummary() {
  const summaryText = document.getElementById('summaryText');
  const text = summaryText.value;
  if (!text) return;

  const btn = document.getElementById('copySummaryBtn');
  const done = () => {
    const original = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => { btn.textContent = original; }, 1500);
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
    if (entry.dataset.type === 'run') {
      const distance = entry.querySelector('[data-field="distance"]').value;
      entries.push({ type: 'run', distance, hour, minute, second });
    } else {
      const text = entry.querySelector('[data-field="text"]').value;
      entries.push({ type: 'activity', hour, minute, second, text });
    }
  });
  localStorage.setItem('entries', JSON.stringify(entries));
}

function loadPreviousEntries() {
  const entries = JSON.parse(localStorage.getItem('entries'));
  if (entries && entries.length > 0) {
    entries.forEach(entry => {
      if (entry.type === 'activity') {
        addActivity(entry.hour, entry.minute, entry.second, entry.text);
      } else {
        addEntry(entry.distance, entry.hour, entry.minute, entry.second);
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
