const taskList = chapters.flatMap(c => c.tasks);
const storageKey = 'chemie-lk-2028:' + location.pathname.replace(/index\.html$/, '') + 'v1';
const newProgress = () => ({ version: 1, records: {}, exams: {}, visited: [], last: '' });
let storageAvailable = true;
function escapeText(input) {
    return String(input ?? '').replace(/[&<>"']/g, x => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[x]));
}
function parseDecimal(raw) {
    const supers = { '⁻': '-', '⁺': '+', '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9' };
    let t = String(raw ?? '').trim().replace(/−/g, '-').replace(/,/g, '.').replace(/\s*[·×*x]\s*10\s*\^?\s*([⁺⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g, (_, x) => 'e' + Array.from(x, k => supers[k]).join('')).replace(/\s*[·×*x]\s*10\s*\^\s*([+-]?\d+)/gi, 'e$1');
    if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(t))
        return null;
    const n = Number(t);
    return Number.isFinite(n) ? n : null;
}
function evaluate(fields, values) {
    const items = fields.map((f, i) => {
        const raw = values[i] ?? '';
        if (f.type === 'select') {
            if (!/^\d+$/.test(raw) || Number(raw) >= f.options.length)
                return 'invalid';
            return Number(raw) === f.answer ? 'right' : 'wrong';
        }
        const n = parseDecimal(raw);
        if (n === null)
            return 'invalid';
        const tol = f.value === 0 ? 1e-12 : Math.max(Number.EPSILON * Math.abs(f.value) * 4, Math.abs(f.value) * f.tolerance);
        return Math.abs(n - f.value) <= tol ? 'right' : 'wrong';
    });
    return { items, status: items.includes('invalid') ? 'invalid' : items.includes('wrong') ? 'wrong' : 'right' };
}
function cleanProgress(raw) {
    if (!raw || raw.version !== 1 || !raw.records || Array.isArray(raw.records) || typeof raw.records !== 'object' || !raw.exams || Array.isArray(raw.exams) || typeof raw.exams !== 'object')
        throw Error('Unbekanntes Dateiformat.');
    const clean = newProgress(), str = (x, max = 16000) => typeof x === 'string' ? x.slice(0, max) : '';
    clean.visited = chapters.filter(c => Array.isArray(raw.visited) && raw.visited.includes(c.id)).map(c => c.id);
    clean.last = chapters.some(c => c.id === raw.last) ? raw.last : '';
    for (const t of taskList) {
        const r = raw.records[t.id];
        if (!r || typeof r !== 'object')
            continue;
        const values = t.fields.map((f, i) => str(r.values?.[i], 140));
        const answer = str(r.answer);
        const checked = Array.isArray(r.checked) && t.fields.length && r.checked.length === t.fields.length ? r.checked.map(x => str(x, 140)) : null;
        const grade = checked ? evaluate(t.fields, checked).status : null;
        clean.records[t.id] = { values, answer, checked: grade === 'invalid' ? null : checked, result: grade === 'invalid' ? null : grade, marked: r.marked === true, hints: Math.max(0, Math.min(3, Number.isInteger(r.hints) ? r.hints : 0)), revealed: r.revealed === true, self: !t.fields.length && answer.trim() && ['teilweise', 'sicher', 'offen'].includes(r.self) ? r.self : null };
    }
    for (const exam of cases) {
        let r = raw.exams[exam.id];
        if (!r || typeof r !== 'object')
            continue;
        const answers = {}, scores = {};
        for (const p of exam.parts) {
            answers[p.id] = str(r.answers?.[p.id]);
            scores[p.id] = p.rubric.map(([max], i) => {
                const n = r.scores?.[p.id]?.[i];
                return r.done === true && Number.isInteger(n) && n >= 0 && n <= max ? n : null;
            });
        }
        clean.exams[exam.id] = { answers, scores, done: r.done === true, timer: r.timer === true, seconds: Number.isFinite(r.seconds) ? Math.max(0, Math.min(31536000, r.seconds)) : 0 };
    }
    return clean;
}
let progress = loadProgress();
function loadProgress() {
    try {
        const v = localStorage.getItem(storageKey);
        return v ? cleanProgress(JSON.parse(v)) : newProgress();
    }
    catch {
        storageAvailable = false;
        return newProgress();
    }
}
function storageNotice() {
    const b = document.getElementById('storage-warning');
    if (b) {
        b.hidden = storageAvailable;
        b.textContent = storageAvailable ? '' : 'Lokale Speicherung ist hier eingeschränkt. Sichere deinen Lernstand unter „Lernstand“ als JSON-Datei.';
    }
}
function persist() {
    try {
        localStorage.setItem(storageKey, JSON.stringify(progress));
        storageAvailable = true;
    }
    catch {
        storageAvailable = false;
    }
    storageNotice();
}
function record(t) {
    return progress.records[t.id] ??= { values: [], answer: '', checked: null, result: null, marked: false, hints: 0, revealed: false, self: null };
}
const isTouched = r => !!(r && (r.answer?.trim() || r.values?.some(x => String(x).trim()) || r.result || r.self));
const currentResult = r => r?.checked && r.checked.every((v, i) => v === (r.values[i] ?? '')) ? r.result : null;
const repeatDue = r => !!(r && (r.marked || r.result === 'wrong' || r.self === 'teilweise' || r.self === 'offen'));
function stats() {
    const all = taskList.map(t => progress.records[t.id]);
    return { total: all.length, touched: all.filter(isTouched).length, correct: all.filter(r => currentResult(r) === 'right').length, checked: all.filter(r => !!currentResult(r)).length, review: all.filter(repeatDue).length, self: all.filter(r => r?.self).length, marked: all.filter(r => r?.marked).length, hints: all.reduce((s, r) => s + (r?.hints || 0), 0), seen: all.filter(r => r?.revealed).length };
}
function currentExam(e) {
    return progress.exams[e.id] ??= { answers: {}, scores: {}, done: false, timer: false, seconds: 0 };
}
const maxPoints = p => p.rubric.reduce((n, [v]) => n + v, 0);
const examMax = e => e.parts.reduce((n, p) => n + maxPoints(p), 0);
