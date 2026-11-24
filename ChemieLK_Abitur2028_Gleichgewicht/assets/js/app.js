const main = document.getElementById('main');
const esc = escapeText;
const nn = n => String(n).padStart(2, '0');
const link = (href, text, cls = 'btn') => '<a class="' + cls + '" href="' + href + '">' + text + '</a>';
const sectionTitle = (title, sub = '') => '<div class="heading-row"><h2>' + title + '</h2><span>' + sub + '</span></div>';
const chapterUrl = (c, tab = 'wiederholen', id = '') => '#kapitel/' + c.id + '/' + tab + (id ? '/' + id : '');
function taskUrl(t) {
    const c = chapters.find(c => c.tasks.includes(t));
    return chapterUrl(c, c.tasks.indexOf(t) < c.practiceCount ? 'ueben' : 'vertiefen', t.id);
}
function chapterPicker() {
    return '<div class="crumb"><a href="#start">← Modulübersicht</a><label><span class="visually-hidden">Kapitel wechseln</span><select id="jump"><option value="">Kapitel wechseln …</option>' + chapters.map((c, i) => '<option value="' + chapterUrl(c) + '">' + nn(i + 1) + ' · ' + c.short + '</option>').join('') + '<option value="#training">06 · Abiturtraining</option></select></label></div>';
}
function stat(n, label) {
    return '<div class="stat"><strong>' + n + '</strong><span>' + label + '</span></div>';
}
function home() {
    const s = stats(), last = chapters.find(c => c.id === progress.last) || chapters[0];
    const hero = '<section class="hero"><div class="hero-copy"><div class="eyeline">Themenmodul 01 · Leistungsfach</div><h1>Chemisches<br>Gleichgewicht</h1><p>Vom dynamischen Teilchenmodell zur begründeten Entscheidung im technischen Verfahren.</p>' + link(chapterUrl(last), progress.last ? 'Kapitel fortsetzen' : 'Mit Grundlagen starten', 'btn primary') + '</div><div class="hero-art">' + heroDiagram() + '</div></section>';
    const list = chapters.map((c, i) => chapterCard(i, c.title, c.topic, chapterUrl(c))).join('') + chapterCard(5, 'Kapitelübergreifendes Abiturtraining', 'Vier materialgestützte Aufgabenkomplexe', '#training');
    return hero + '<div class="home-grid"><section>' + sectionTitle('Kapitelübersicht', 'Freie Kapitelwahl') + '<div class="chapter-list">' + list + '</div></section><aside class="home-side"><section class="panel manual"><span class="kicker">Auf diesem Gerät</span><h2>Dein Lernstand</h2><div class="stats">' + stat(s.touched + ' / ' + s.total, 'Aufgaben bearbeitet') + stat(s.total - s.touched, 'noch offen') + stat(s.correct + ' / ' + s.checked, 'automatisch richtig / geprüft') + stat(s.self, 'selbst bewertet') + '</div><div class="meter"><i style="width:' + 100 * s.touched / s.total + '%"></i></div><p class="tiny">' + chapters.filter(c => c.tasks.some(t => isTouched(progress.records[t.id]))).length + ' von '+chapters.length+' Fachkapiteln bearbeitet · ' + progress.visited.length + ' geöffnet · ' + s.marked + ' markiert · ' + s.hints + ' Hilfestufen genutzt</p>' + link('#fortschritt', 'Lernübersicht öffnen →', 'text-link') + '</section><section class="panel"><h2>Wiedervorlage</h2><p class="tiny">' + (s.review ? s.review + ' Aufgaben sind für eine weitere Runde vorgemerkt.' : 'Hier findest du markierte Aufgaben und Aufgaben mit Übungsbedarf.') + '</p>' + link('#wiederholen', 'Wiederholung öffnen →', 'text-link') + '</section></aside></div>' + additionalModuleLinks();
}
function additionalModuleLinks() {
    if (!additionalModules.length)
        return '';
    return '<section class="panel chapter-progress">' + sectionTitle('Weitere Themenmodule') + additionalModules.map(m => '<div class="chapter-progress"><h3><a href="' + esc(m.href) + '">' + esc(m.title) + '</a></h3><p>' + esc(m.description) + '</p></div>').join('') + '</section>';
}
function chapterCard(i, title, desc, href) {
    return '<a href="' + href + '" class="chapter-link"><span class="cell-num">' + nn(i + 1) + '</span><span class="atlas-icon">' + icon(i) + '</span><span class="link-title"><b>' + title + '</b><small>' + desc + '</small></span><span class="link-end" aria-hidden="true">↗</span></a>';
}
function chapter(c, tab, id) {
    if (!progress.visited.includes(c.id))
        progress.visited.push(c.id);
    progress.last = c.id;
    persist();
    const i = chapters.indexOf(c);
    const head = chapterPicker() + '<div class="chapter-head"><span class="kicker">Chemisches Gleichgewicht · Kapitel ' + nn(i + 1) + '</span><h1>' + c.title + '</h1><p>' + c.intro + '</p></div><nav class="tabs" aria-label="Lernbereiche">' + [['wiederholen', 'Wiederholen'], ['ueben', 'Üben · ' + c.practiceCount], ['vertiefen', 'Vertiefen · ' + (c.tasks.length - c.practiceCount)]].map(([k, t]) => '<a href="' + chapterUrl(c, k) + '" ' + (tab === k ? 'aria-current="page"' : '') + '>' + t + '</a>').join('') + '</nav>';
    if (tab === 'wiederholen')
        return head + '<div class="learning-grid"><div class="reading-card">' + c.reading + '</div><aside class="lab">' + labMarkup(c.lab) + '</aside></div><div class="pager"><span></span>' + link(chapterUrl(c, 'ueben'), 'Zu den Übungen →') + '</div>';
    const slice = tab === 'ueben' ? c.tasks.slice(0, c.practiceCount) : c.tasks.slice(c.practiceCount), t = slice.find(x => x.id === id) || slice[0], idx = slice.indexOf(t);
    const menu = '<nav class="task-menu" aria-label="Aufgaben in diesem Bereich">' + slice.map(x => '<a href="' + taskUrl(x) + '" aria-label="Aufgabe ' + (c.tasks.indexOf(x) + 1) + ': ' + esc(x.title) + '" ' + (t.id === x.id ? 'aria-current="step"' : '') + '><span class="cell-num">' + nn(c.tasks.indexOf(x) + 1) + '</span> <span>' + x.title + '</span></a>').join('') + '</nav>';
    const next = idx < slice.length - 1 ? link(taskUrl(slice[idx + 1]), 'Nächste Aufgabe →') : tab === 'ueben' ? link(chapterUrl(c, 'vertiefen'), 'Zur Vertiefung →') : i + 1 < chapters.length ? link(chapterUrl(chapters[i + 1]), 'Zum nächsten Kapitel →') : link('#training', 'Zum Abiturtraining →');
    return head + '<div class="workspace">' + menu + '<div><article class="task" id="active-task" data-id="' + t.id + '"></article><div class="pager">' + (idx ? link(taskUrl(slice[idx - 1]), '← Zurück') : '<span></span>') + next + '</div></div></div>';
}
function taskForm(t) {
    const r = record(t);
    const renderedFields = t.fields.map((f, i) => {
        const fid = 'field-' + i;
        return '<div class="field"><label for="' + fid + '">' + f.label + (f.unit ? ' <span class="unit">' + f.unit + '</span>' : '') + '</label>' + (f.type === 'select' ? '<select data-field="' + i + '" id="' + fid + '"><option value="">Bitte wählen …</option>' + f.options.map((v, j) => '<option value="' + j + '" ' + (String(j) === r.values[i] ? 'selected' : '') + '>' + esc(v) + '</option>').join('') + '</select>' : '<input data-field="' + i + '" id="' + fid + '" type="text" autocomplete="off" spellcheck="false" value="' + esc(r.values[i]) + '">') + '</div>';
    });
    const fields = t.id === 'mwg-bilanz' ? table(['c / (mol/L)', 'Säure', 'Methanol', 'Ester', 'Wasser'], [['Start', '0,90', '0,60', '0', '0'], ['Änderung', 'wie bei Methanol', renderedFields[0], 'Betrag des Methanolverbrauchs', 'wie beim Ester'], ['Gleichgewicht', renderedFields[1], '0,24', renderedFields[2], 'wie Ester']], 'Bilanz des homogenen Gemischs') : renderedFields.join('');
    return '<div class="statusline"><span class="kicker">AFB ' + ['', 'I', 'II', 'III'][t.afb] + ' · ' + (t.fields.length ? 'Automatische Prüfung' : 'Selbstkontrolle') + '</span><button class="soft mark" id="mark-task" aria-pressed="' + r.marked + '">' + (r.marked ? '✓ Zur Wiederholung markiert' : '☆ Später wiederholen') + '</button></div><h2>' + t.title + '</h2><div class="prompt">' + t.prompt + '</div>' + (t.fields.length ? (t.id === 'mwg-bilanz' ? fields : '<div class="field-grid">' + fields + '</div>') + (t.fields.some(f => f.type === 'number') ? '<details class="working"><summary>Eigenen Rechenweg festhalten</summary><label for="working-notes">Ansatz, Rechnung und Einheit</label><textarea id="working-notes" maxlength="16000">' + esc(r.answer) + '</textarea></details>' : '') : '<label for="written">Deine Antwort</label><textarea id="written" maxlength="16000" placeholder="Formuliere deine Begründung …">' + esc(r.answer) + '</textarea>') + '<div class="button-row">' + (t.fields.length ? '<button class="primary" id="check-task">Antwort prüfen</button>' : '') + '<button id="hint-task" ' + (r.hints >= 3 ? 'disabled' : '') + '>Hinweis ' + (r.hints < 3 ? (r.hints + 1) + ' von 3' : '3 von 3 genutzt') + '</button><button id="show-task" aria-expanded="false">Musterlösung ansehen</button></div><div id="feedback" role="status"></div><div id="hint-box"></div><div id="solution-box"></div>';
}
function wireTask(t) {
    const el = document.getElementById('active-task'), r = record(t);
    el.innerHTML = taskForm(t);
    const $ = x => document.getElementById(x);
    const feedback = () => {
        const result = currentResult(r);
        if (result)
            showFeedback(evaluate(t.fields, r.values));
        else
            $('feedback').innerHTML = '';
    };
    function showFeedback(test) {
        const ok = test.status === 'right';
        $('feedback').innerHTML = '<div class="feedback ' + (ok ? '' : 'issue') + '">' + (ok ? '<b>Richtig.</b> ' + t.solution : '<b>' + (test.status === 'invalid' ? 'Prüfe die Eingabe.' : 'Prüfe deinen Ansatz.') + '</b><ul>' + test.items.map((v, i) => v === 'right' ? '' : '<li>' + t.fields[i].label + ' · ' + (v === 'invalid' ? (t.fields[i].type === 'select' ? 'Wähle eine Antwort.' : 'Gib nur den Zahlenwert ein, z. B. 0,025 oder 2,5e-2.') : t.fields[i].tip) + '</li>').join('') + '</ul>') + '</div>';
    }
    function hints() {
        const tags = ['Denkanstoß', 'Ansatz', 'Lösungsweg'];
        $('hint-box').innerHTML = r.hints ? '<section class="help"><h3>Hilfestellungen</h3><ol>' + t.hints.slice(0, r.hints).map((s, i) => '<li><strong>' + tags[i] + '</strong> · ' + s + '</li>').join('') + '</ol></section>' : '';
    }
    function solution(open) {
        $('show-task').setAttribute('aria-expanded', open);
        $('show-task').textContent = open ? 'Musterlösung schließen' : 'Musterlösung ansehen';
        $('solution-box').innerHTML = open ? '<section class="solution"><h3>Musterlösung</h3><p>' + t.solution + '</p>' + (t.criteria?.length ? '<h3>Kriterien für deine Antwort</h3><ul>' + t.criteria.map(x => '<li>' + x + '</li>').join('') + '</ul><label for="self">Meine Einschätzung</label><select id="self"><option value="">Bitte wählen …</option>' + [['offen', 'Noch unsicher'], ['teilweise', 'Teilweise erfüllt'], ['sicher', 'Alle Kriterien erfüllt']].map(([k, v]) => '<option value="' + k + '" ' + (r.self === k ? 'selected' : '') + '>' + v + '</option>').join('') + '</select><p class="tiny">Für eine Selbsteinschätzung ist eine eigene Antwort nötig.</p>' : '') + '</section>' : '';
        if ($('self')) {
            $('self').disabled = !r.answer.trim();
            $('self').onchange = e => {
                r.self = e.target.value || null;
                persist();
            };
        }
    }
    el.querySelectorAll('[data-field]').forEach(input => {
        const update = () => {
            r.values[Number(input.dataset.field)] = input.value;
            persist();
            feedback();
        };
        input.addEventListener(input.tagName === 'SELECT' ? 'change' : 'input', update);
    });
    if ($('working-notes'))
        $('working-notes').oninput = e => {
            r.answer = e.target.value;
            persist();
        };
    if ($('written'))
        $('written').oninput = e => {
            r.answer = e.target.value;
            r.self = null;
            if ($('self')) {
                $('self').value = '';
                $('self').disabled = !r.answer.trim();
            }
            persist();
        };
    if ($('check-task'))
        $('check-task').onclick = () => {
            const test = evaluate(t.fields, r.values);
            if (test.status !== 'invalid') {
                r.checked = t.fields.map((_, i) => r.values[i] ?? '');
                r.result = test.status;
                persist();
            }
            showFeedback(test);
        };
    $('hint-task').onclick = e => {
        r.hints = Math.min(3, r.hints + 1);
        persist();
        hints();
        e.target.disabled = r.hints === 3;
        e.target.textContent = r.hints === 3 ? '3 von 3 Hinweisen genutzt' : 'Hinweis ' + (r.hints + 1) + ' von 3';
    };
    $('show-task').onclick = () => {
        const open = $('show-task').getAttribute('aria-expanded') !== 'true';
        if (open) {
            r.revealed = true;
            persist();
        }
        solution(open);
    };
    $('mark-task').onclick = e => {
        r.marked = !r.marked;
        e.target.setAttribute('aria-pressed', r.marked);
        e.target.textContent = r.marked ? '✓ Zur Wiederholung markiert' : '☆ Später wiederholen';
        persist();
    };
    hints();
    feedback();
}
function review() {
    const list = taskList.filter(t => repeatDue(progress.records[t.id]));
    return '<section class="chapter-head"><span class="kicker">Persönlicher Lernstand</span><h1>Wiedervorlage</h1><p>Hier sammelst du markierte Aufgaben, zuletzt falsch geprüfte Antworten und offene Aufgaben mit weiterem Übungsbedarf.</p></section>' + (list.length ? '<div class="chapter-list">' + list.map((t, i) => {
        const r = progress.records[t.id], c = chapters.find(c => c.tasks.includes(t));
        return chapterCard(chapters.indexOf(c), t.title, c.short + ' · ' + [r.marked ? 'markiert' : '', r.result === 'wrong' ? 'zuletzt falsch' : '', r.self === 'teilweise' || r.self === 'offen' ? 'Selbsteinschätzung' : ''].filter(Boolean).join(' · '), taskUrl(t));
    }).join('') + '</div>' : '<div class="panel empty"><h2>Aktuell ist hier alles frei.</h2><p>Mit „Später wiederholen“ kannst du in jeder Aufgabe einen Eintrag anlegen.</p>' + link('#start', 'Zur Kapitelübersicht') + '</div>');
}
function dashboard() {
    const s = stats();
    return '<header class="chapter-head"><span class="kicker">Chemie LK · Abitur 2028</span><h1>Dein Lernstand</h1><p>Deine Antworten bleiben in diesem Browser. Sichere sie beim Gerätewechsel oder vor dem Löschen der Browserdaten über den Export.</p></header><div class="panel"><div class="stats wide">' + stat(s.touched + ' / ' + s.total, 'Fachaufgaben bearbeitet') + stat(s.total - s.touched, 'noch ohne eigene Antwort') + stat(s.correct + ' / ' + s.checked, 'aktuell richtig / automatisch geprüft') + stat(s.self, 'offene Aufgaben selbst bewertet') + stat(s.marked, 'zur Wiederholung markiert') + stat(s.hints, 'Hilfestufen genutzt') + stat(s.seen, 'Musterlösungen angefordert') + stat(Object.values(progress.exams).filter(e => e.done).length + ' / ' + cases.length, 'Abiturkomplexe abgegeben') + '</div><p class="tiny">„Bearbeitet“ zählt eigene Eingaben. Automatische Ergebnisse beziehen sich auf die zuletzt geprüfte, seither unveränderte Antwort. Hilfen und aufgerufene Lösungen werden gesondert gezählt.</p>' + link('#wiederholen', 'Wiedervorlage öffnen (' + s.review + ')') + '</div><section class="panel chapter-progress"><h2>Nach Kapiteln</h2>' + table(['Kapitel', 'Geöffnet', 'Bearbeitet', 'Richtig / geprüft', 'Selbst bewertet'], chapters.map(c => {
        const rr = c.tasks.map(t => progress.records[t.id]);
        return ['<a href="' + chapterUrl(c) + '">' + c.short + '</a>', progress.visited.includes(c.id) ? 'ja' : '–', rr.filter(isTouched).length + ' / ' + rr.length, rr.filter(r => currentResult(r) === 'right').length + ' / ' + rr.filter(r => currentResult(r)).length, rr.filter(r => r?.self).length];
    })) + '<h2>Abiturtraining</h2>' + table(['Komplex', 'Bearbeitung', 'Selbstbewertung'], cases.map(e => {
        const r = progress.exams[e.id], ss = scoreSummary(e, r);
        return ['<a href="#pruefung/' + e.id + '">' + e.title + '</a>', r?.done ? 'abgegeben' : r && Object.values(r.answers).some(a => a.trim()) ? 'begonnen' : 'offen', ss.complete ? ss.sum + ' / ' + examMax(e) + ' BE' : r?.done ? 'ausstehend / in Arbeit' : '–'];
    })) + '</section><section class="panel noprint"><h2>Lernstand verwalten</h2><div class="button-row"><button id="export">JSON exportieren</button><button id="import">JSON importieren</button><button id="print">Übersicht drucken</button><button id="reset">Daten zurücksetzen</button></div><input id="upload" type="file" accept=".json,application/json" hidden><p role="status" id="file-msg"></p></section>';
}
function wireDashboard() {
    const $ = x => document.getElementById(x);
    $('export').onclick = () => {
        const url = URL.createObjectURL(new Blob([JSON.stringify(progress, null, 2)], { type: 'application/json' }));
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ChemieLK28-Lernstand.json';
        document.body.append(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 3000);
    };
    $('import').onclick = () => $('upload').click();
    $('upload').onchange = async (e) => {
        const f = e.target.files[0];
        if (!f)
            return;
        try {
            if (f.size > 4e6)
                throw Error();
            const candidate = cleanProgress(JSON.parse(await f.text()));
            if (!confirm('Gesicherten Lernstand laden und die derzeitigen Antworten in diesem Browser ersetzen?'))
                return;
            progress = candidate;
            persist();
            render();
            $('file-msg').textContent = 'Lernstand geladen.';
        }
        catch {
            $('file-msg').textContent = 'Die Datei passt nicht zum Lernstandformat dieser Plattform. Dein bisheriger Lernstand bleibt erhalten.';
        }
        finally {
            if ($('upload'))
                $('upload').value = '';
        }
    };
    $('print').onclick = () => window.print();
    $('reset').onclick = () => {
        if (!confirm('Alle Antworten, Markierungen und Prüfungssitzungen auf diesem Gerät löschen?'))
            return;
        progress = newProgress();
        persist();
        render();
        $('file-msg').textContent = 'Der Lernstand wurde zurückgesetzt.';
    };
}
function training() {
    return chapterPicker() + '<div class="chapter-head"><span class="kicker">Chemisches Gleichgewicht · Kapitel 06</span><h1>Abiturtraining</h1><p>Wähle einen Aufgabenkomplex. Bearbeite die Materialien im Zusammenhang. Nach der Abgabe vergleichst du deine Antworten mit dem Erwartungshorizont und vergibst Teilpunkte.</p></div><div class="case-grid">' + cases.map((e, i) => '<section class="panel case-card"><span class="kicker">Komplex ' + nn(i + 1) + ' · ' + e.time + ' min · ' + examMax(e) + ' BE</span><h2>' + e.title + '</h2><strong class="tiny">' + e.focus + '</strong><p>' + e.intro + '</p>' + link('#pruefung/' + e.id, progress.exams[e.id]?.done ? 'Zur Auswertung →' : progress.exams[e.id] ? 'Komplex fortsetzen →' : 'Abiturmodus öffnen →') + '</section>').join('') + '</div>';
}
function scoreSummary(e, r) {
    const vals = e.parts.flatMap(p => p.rubric.map((_, i) => r?.scores?.[p.id]?.[i]));
    return { sum: vals.reduce((s, v) => s + (v ?? 0), 0), complete: !!r?.done && vals.every(Number.isInteger), count: vals.filter(Number.isInteger).length, total: vals.length };
}
function examView(e) {
    const r = currentExam(e), s = scoreSummary(e, r);
    return '<div class="crumb"><a href="#training">← Alle Aufgabenkomplexe</a><span>Abiturorientierte Eigenaufgabe</span></div><div class="chapter-head"><span class="kicker">Abiturmodus · ' + e.time + ' min empfohlen · ' + examMax(e) + ' BE</span><h1>' + e.title + '</h1><p>' + e.intro + '</p></div><div class="statusline"><b>' + (r.done ? 'Auswertung · Selbstbewertung' : 'In Bearbeitung') + '</b><span id="clock"></span>' + (!r.done ? '<button class="soft" id="timer">' + (r.timer ? 'Zeitmessung pausieren' : 'Zeitmessung starten') + '</button>' : '') + '</div>' +
        '<h2 class="section-h">Materialien</h2>' + e.materials.map(([id, title, html]) => '<section class="exam-material"><span class="kicker">Material ' + id + '</span><h3>' + title + '</h3>' + html + '</section>').join('') + '<h2 class="section-h">Arbeitsaufträge</h2>' +
        e.parts.map(p => '<section class="panel exam-part"><span class="kicker">' + maxPoints(p) + ' BE' + (r.done ? ' · AFB ' + ['', 'I', 'II', 'III'][p.afb] : '') + '</span><h3>' + p.title + '</h3><p>' + p.prompt + '</p>' + (r.done ? '<h4>Deine Antwort</h4><div class="exam-answer">' + (esc(r.answers[p.id]) || 'Ohne Antwort abgegeben.') + '</div><h4>Erwartungshorizont</h4><p>' + p.solution + '</p>' + p.rubric.map(([max, txt], i) => '<div class="score"><label for="' + p.id + '-' + i + '">' + txt + ' (' + max + ' BE)</label><select class="rubric" id="' + p.id + '-' + i + '" data-part="' + p.id + '" data-i="' + i + '"><option value="">Offen</option>' + Array.from({ length: max + 1 }, (_, j) => '<option value="' + j + '" ' + (r.scores[p.id]?.[i] === j ? 'selected' : '') + '>' + j + ' BE</option>').join('') + '</select></div>').join('') : '<label for="' + p.id + '">Deine Ausarbeitung</label><textarea maxlength="16000" data-part="' + p.id + '" id="' + p.id + '">' + esc(r.answers[p.id]) + '</textarea>') + '</section>').join('') +
        (r.done ? '<section class="panel"><h2>Deine Bewertung</h2><p>Vergib die BE je Kriterium. Gleichwertige, fachlich richtige Lösungswege zählen ebenfalls.</p><p id="exam-total" role="status">' + scoreLabel(e, s) + '</p><button class="soft" id="exam-restart">Komplex erneut bearbeiten</button></section>' : '<div class="button-row"><button class="primary" id="submit-exam">Abgeben und auswerten</button></div>') + '<p class="tiny">Die optionale Uhr zählt die Zeit im geöffneten, sichtbaren Komplex. Es gibt kein Zeitlimit.</p>';
}
function scoreLabel(e, s) {
    return s.complete ? 'Selbstbewertung abgeschlossen: ' + s.sum + ' von ' + examMax(e) + ' BE.' : s.count + ' von ' + s.total + ' Kriterien bewertet · bisher ' + s.sum + ' BE.';
}
let examCleanup = () => { };
function wireExam(e) {
    const r = currentExam(e), $ = x => document.getElementById(x);
    const chart = main.querySelector('.exam-plot');
    if (chart) {
        const pts = [[0, .2, .2], [2, .2, .2], [2, .4, .4], [3, .342, .429], [4, .318, .441], [5, .308, .446], [7, .30, .45]];
        chart.innerHTML = diagram([
            { name: 'A', xy: pts.map(a => [a[0], a[1]]) },
            { name: 'A₂', xy: pts.map(a => [a[0], a[2]]) }
        ], { xlabel: 'Zeit / Modelleinheiten', ylabel: 'c / (mol/L)', xmax: 8, ymax: .6, marker: 2 }) + '<p class="caption">Versuch I · ━ A, ┄ A₂. Schematische Verbindung der Modellwerte.</p>';
    }
    let prev = Date.now();
    const clock = () => {
        if (r.timer && !r.done && !document.hidden) {
            const now = Date.now();
            r.seconds += Math.max(0, now - prev) / 1000;
        }
        prev = Date.now();
        const n = Math.floor(r.seconds);
        $('clock').textContent = (r.timer || r.seconds > 0 ? 'Bearbeitungszeit ' + Math.floor(n / 60) + ':' + String(n % 60).padStart(2, '0') : '');
    };
    const checkpoint = () => {
        clock();
        if (r.timer)
            persist();
    };
    const interval = setInterval(checkpoint, 1000);
    const visibility = () => {
        prev = Date.now();
    };
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('pagehide', checkpoint);
    examCleanup = () => {
        checkpoint();
        clearInterval(interval);
        document.removeEventListener('visibilitychange', visibility);
        window.removeEventListener('pagehide', checkpoint);
    };
    clock();
    main.querySelectorAll('textarea[data-part]').forEach(ta => ta.oninput = () => {
        r.answers[ta.dataset.part] = ta.value;
        persist();
    });
    if ($('timer'))
        $('timer').onclick = () => {
            clock();
            r.timer = !r.timer;
            prev = Date.now();
            $('timer').textContent = r.timer ? 'Zeitmessung pausieren' : 'Zeitmessung fortsetzen';
            clock();
            persist();
        };
    if ($('submit-exam'))
        $('submit-exam').onclick = () => {
            const missing = e.parts.filter(p => !r.answers[p.id]?.trim()).length;
            if (!confirm((missing ? missing + ' Teilaufgabe(n) ohne Antwort. ' : '') + 'Jetzt abgeben und Erwartungshorizont öffnen?'))
                return;
            clock();
            r.timer = false;
            r.done = true;
            persist();
            render(true);
        };
    main.querySelectorAll('.rubric').forEach(sel => sel.onchange = () => {
        const pid = sel.dataset.part;
        r.scores[pid] ??= Array(e.parts.find(p => p.id === pid).rubric.length).fill(null);
        r.scores[pid][Number(sel.dataset.i)] = sel.value === '' ? null : Number(sel.value);
        $('exam-total').textContent = scoreLabel(e, scoreSummary(e, r));
        persist();
    });
    if ($('exam-restart'))
        $('exam-restart').onclick = () => {
            if (!confirm('Eigene Antworten und Teilpunkte dieses Komplexes für einen neuen Versuch löschen?'))
                return;
            delete progress.exams[e.id];
            persist();
            render(true);
        };
}
function render(move = false) {
    labCleanup();
    labCleanup = () => { };
    examCleanup();
    examCleanup = () => { };
    const [route = 'start', cid, area, id] = location.hash.slice(1).split('/');
    let c = chapters.find(x => x.id === cid), e = cases.find(x => x.id === cid);
    let active = 'start', tab = ['wiederholen', 'ueben', 'vertiefen'].includes(area) ? area : 'wiederholen';
    if (route === 'kapitel' && c)
        main.innerHTML = chapter(c, tab, id);
    else if (route === 'training') {
        active = 'training';
        main.innerHTML = training();
    }
    else if (route === 'pruefung' && e) {
        active = 'training';
        main.innerHTML = examView(e);
        wireExam(e);
    }
    else if (route === 'fortschritt') {
        active = 'fortschritt';
        main.innerHTML = dashboard();
        wireDashboard();
    }
    else if (route === 'wiederholen') {
        active = 'fortschritt';
        main.innerHTML = review();
    }
    else
        main.innerHTML = home();
    if (document.getElementById('jump'))
        document.getElementById('jump').onchange = ev => {
            if (ev.target.value)
                location.hash = ev.target.value;
        };
    if (route === 'kapitel' && c) {
        if (tab === 'wiederholen') {
            const flow = document.getElementById('flow-diagram');
            if (flow)
                flow.innerHTML = flowDiagram();
            initLab(c.lab);
        }
        else {
            const t = taskList.find(x => x.id === document.getElementById('active-task').dataset.id);
            wireTask(t);
        }
    }
    document.querySelectorAll('[data-nav]').forEach(a => {
        if (a.dataset.nav === active)
            a.setAttribute('aria-current', 'page');
        else
            a.removeAttribute('aria-current');
    });
    const title = main.querySelector('h1')?.textContent;
    document.title = active === 'start' && route !== 'kapitel' ? 'Chemie LK – Lernplattform | Abitur 2028' : title + ' | Chemie LK · Abitur 2028';
    storageNotice();
    if (move) {
        window.scrollTo(0, 0);
        main.focus({ preventScroll: true });
    }
}
window.addEventListener('hashchange', () => render(true));
render();
