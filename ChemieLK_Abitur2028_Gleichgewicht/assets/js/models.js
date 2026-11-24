const format = (v, d = 2) => Number(v).toLocaleString('de-DE', { maximumFractionDigits: d });
function diagram(series, { xlabel, ylabel, xmax, ymax, ticks = 4, marker = null, xmin = 0, marks = [], dark = false }) {
    const W = 480, H = 274, L = 60, R = 454, T = 36, B = 220;
    const x = v => L + (v - xmin) / (xmax - xmin) * (R - L), y = v => B - v / ymax * (B - T);
    const fg = dark ? '#d8ece3' : '#435e55', grid = dark ? '#46636a' : '#d9e2da', colors = dark ? ['#b9ebcc', '#f3c287', '#b5bded'] : ['#19705d', '#a54b20', '#4e5894'];
    const label = (a, b, t, align = 'middle', size = 12) => '<text x="' + a + '" y="' + b + '" text-anchor="' + align + '" font-size="' + size + '" fill="' + fg + '">' + escapeText(t) + '</text>';
    let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + escapeText(ylabel + ' über ' + xlabel + '. ' + series.map(a => a.name).join(', ')) + '" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif">';
    for (let j = 0; j <= ticks; j++) {
        const yy = y(ymax * j / ticks), xx = x(xmin + (xmax - xmin) * j / ticks);
        s += '<path stroke="' + grid + '" stroke-width=".8" d="M' + L + ' ' + yy + 'H' + R + ' M' + xx + ' ' + T + 'V' + B + '"/>' + label(L - 7, yy + 4, format(ymax * j / ticks, 3), 'end') + label(xx, B + 19, format(xmin + (xmax - xmin) * j / ticks, 1));
    }
    s += label(L, T - 12, ylabel, 'start', 13) + label(R, B + 41, xlabel, 'end', 13);
    if (marker !== null)
        s += '<path d="M' + x(marker) + ' ' + T + 'V' + B + '" stroke="' + fg + '" stroke-dasharray="2 5"/>';
    series.forEach((a, i) => {
        const points = a.xy.map(([xx, yy]) => x(xx).toFixed(2) + ',' + y(yy).toFixed(2)).join(' ');
        s += '<polyline points="' + points + '" stroke="' + colors[i % 3] + '" fill="none" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="' + (['none', '9 5', '2 4'][i % 3]) + '"/>';
    });
    marks.forEach(([xx, yy]) => s += '<circle cx="' + x(xx) + '" cy="' + y(yy) + '" r="5" fill="' + fg + '" stroke="#fff" stroke-width="2"/>');
    return s + '</svg>';
}
function heroDiagram() {
    const pts = Array.from({ length: 81 }, (_, i) => {
        const t = i / 8, b = .7 * (1 - Math.exp(-t * .66));
        return [t, b];
    });
    return '<div class="hero-figure"><div class="figure-meta"><span>MODELL · A ⇌ B</span><span>Konzentrationsverlauf</span></div>' + diagram([
        { name: 'B', xy: pts },
        { name: 'A', xy: pts.map(([x, v]) => [x, 1 - v]) }
    ], { xlabel: 'Zeit / Modelleinheiten', ylabel: 'c / (mol/L)', xmax: 10, ymax: 1, ticks: 4, dark: true }) + '<div class="figure-key"><span>━ B · Produkt</span><span>┄ A · Edukt</span></div></div>';
}
const names = ['Gleichgewicht', 'MWG', 'Eingriff', 'Kreislauf', 'Ionengitter', 'Abiturtraining'];
function icon(i) {
    const d = ['<path d="M4 12h23l-6-5M28 20H5l6 5"/>', '<path d="M4 16h24M9 8h6m5 0h3M8 24h6m4 0h6"/>', '<path d="M4 5v22h25M6 21h7v-12c4 8 9 9 15 9"/>', '<path d="M5 12h19l-5-5m8 13H8l5 5M5 12v5m22 3v-5"/>', '<g fill="currentColor"><circle cx="8" cy="8" r="2"/><circle cx="24" cy="8" r="2"/><circle cx="16" cy="16" r="2"/><circle cx="8" cy="24" r="2"/><circle cx="24" cy="24" r="2"/></g><path d="M14 8h4M6 16h4m12 0h4m-12 8h4"/>', '<path d="M8 4h12l5 6v18H8zM18 4v7h7M12 16h9m-9 5h7"/>'];
    return '<svg viewBox="0 0 32 32" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + d[i] + '</svg>';
}
function flowDiagram() {
    return '<svg class="flow-svg" viewBox="0 0 460 184" role="img" aria-label="Frischgas und Rückgas zum Verdichter, dann Reaktor, Kühler und Abscheider. Flüssiges Ammoniak wird abgezogen."><defs><marker id="fl-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#397263"/></marker></defs><g fill="none" stroke="#397263" stroke-width="2.5" marker-end="url(#fl-arrow)"><path d="M40 24V62"/><path d="M112 84H152"/><path d="M271 84h34"/><path d="M382 105v43H43v-39"/><path d="M421 65V28"/></g><g fill="#e3eee4" stroke="#6c9480"><rect x="4" y="66" width="108" height="38" rx="5"/><rect x="156" y="66" width="116" height="38" rx="5"/><rect x="310" y="66" width="145" height="38" rx="5"/></g><g font-family="system-ui,sans-serif" font-size="14" text-anchor="middle" fill="#183d36"><text x="55" y="18">N₂ + 3 H₂</text><text x="57" y="90">Verdichter</text><text x="214" y="90">Reaktor · Fe</text><text x="382" y="90">Kühler / Abscheider</text><text x="410" y="18">NH₃ flüssig</text><text x="224" y="173">Rückgas · nicht umgesetztes N₂ und H₂</text></g></svg>';
}
const shiftOptions = [
    ['NO₂ zugeben', .2, 0, 1, 5, 'Nur c(NO₂) springt nach oben. Anschließend wird netto Dimer gebildet.'],
    ['N₂O₄ zugeben', 0, .15, 1, 5, 'Nur c(N₂O₄) springt nach oben. Anschließend zerfällt ein Teil des Dimers.'],
    ['NO₂ entnehmen', -.12, 0, 1, 5, 'c(NO₂) sinkt schlagartig. Ein Teil des Dimers zerfällt und liefert neues NO₂.'],
    ['N₂O₄ entnehmen', 0, -.12, 1, 5, 'c(N₂O₄) sinkt schlagartig. Danach wird Dimer nachgebildet.'],
    ['Volumen halbieren', 0, 0, 2, 5, 'Bei gleicher Stoffmenge verdoppeln sich beide Konzentrationen sofort. Danach begünstigt die Kompression die Dimerbildung.'],
    ['Volumen verdoppeln', 0, 0, .5, 5, 'Beide Konzentrationen halbieren sich sofort. Danach wird durch Dimerzerfall die Seite mit mehr Gasteilchen begünstigt.'],
    ['Temperatur erhöhen', 0, 0, 1, 2, 'Bei festem Volumen gibt es keinen Konzentrationssprung. Die endotherme Rückreaktion wird begünstigt. Kc sinkt.'],
    ['Temperatur senken', 0, 0, 1, 9, 'Bei festem Volumen gibt es keinen Konzentrationssprung. Die exotherme Dimerbildung wird begünstigt. Kc steigt.'],
    ['Katalysator zugeben', 0, 0, 1, 5, 'Beide Richtungen beschleunigen sich gleich stark. Die Konzentrationen bleiben auf dem ursprünglichen Plateau.']
];
function shiftCurve(i) {
    const [, da, db, f, K] = shiftOptions[i];
    let a = .2 * f + da, b = .2 * f + db;
    const curves = [
        { name: 'NO₂ · durchgezogen', xy: [[0, .2], [2, .2], [2, a]] },
        { name: 'N₂O₄ · gestrichelt', xy: [[0, .2], [2, .2], [2, b]] }
    ];
    const kh = i === 6 ? 3 : i === 7 ? .8 : i === 8 ? 4 : 1.5, kr = kh / K;
    for (let step = 1; step <= 2400; step++) {
        const d = (kh * a * a - kr * b) * .005;
        a -= 2 * d;
        b += d;
        if (step % 30 === 0) {
            curves[0].xy.push([2 + step * .005, a]);
            curves[1].xy.push([2 + step * .005, b]);
        }
    }
    return { curves, a, b, K, forward: kh * a * a, reverse: kr * b };
}
const temperatures = [400, 425, 450, 475, 500], pressures = [100, 150, 200];
const yields = [[36, 30, 24, 19, 15], [46, 39, 33, 27, 22], [53, 46, 39, 33, 27]];
function labMarkup(id) {
    const head = (title, body) => '<span class="kicker">Modelllabor</span><h3>' + title + '</h3>' + body;
    if (id === 'ester')
        return head('Das Gleichgewicht von beiden Seiten erreichen', '<p>Starte mit den Edukten und danach mit den Produkten. Vergleiche Konzentrationsverläufe und Raten. Beobachte am Plateau, welche Teilchen weiter reagieren.</p>' + eqn(esterEq) + '<a class="btn primary" href="labor/ester.html">Teilchenlabor öffnen →</a><p class="caption">Zwei Startansätze · Teilchenanimation · zwei Zeitdiagramme</p>');
    if (id === 'mwg')
        return head('Koeffizienten einsetzen', '<p>Stelle für ' + dimerEq + ' das MWG zusammen. Beobachte, wie sich dein Ausdruck ändert.</p><label for="m-num">Stoff im Zähler</label><select id="m-num"><option>NO₂</option><option>N₂O₄</option></select><label for="m-pow">Exponent des anderen Stoffs im Nenner</label><select id="m-pow"><option>1</option><option>2</option><option>3</option></select><div id="m-expr" class="equation"></div><button class="action" id="m-check">Ausdruck prüfen</button> <button class="soft" id="m-reset">Zurücksetzen</button><p id="m-feed" role="status"></p>');
    if (id === 'shift')
        return head('Einen Eingriff untersuchen', '<p>' + dimerEq + ' · Dimerbildung exotherm. Wähle einen Eingriff und trenne Sprung und Neueinstellung.</p><label for="s-input">Eingriff bei t = 2</label><select id="s-input"><option value="-1">Ohne Eingriff</option>' + shiftOptions.map((a, i) => '<option value="' + i + '">' + a[0] + '</option>').join('') + '</select><div class="lab-plot" id="s-plot"></div><p class="caption">━ NO₂ &nbsp; ┄ N₂O₄ · Modellkurven</p><p id="s-caption" role="status"></p><div id="s-data"></div><button class="soft" id="s-reset">Ausgangszustand zeigen</button>');
    if (id === 'haber')
        return head('Ausbeute und Anfangsrate', '<p>Vergleiche zwei Drücke bei gleicher Temperatur. Verändere dann nur die Temperatur. Wie ändern sich die beiden Ergebnisgrößen?</p><label for="h-temp">Temperatur</label><select id="h-temp">' + temperatures.map(t => '<option>' + t + ' °C</option>').join('') + '</select><label for="h-press">Druck</label><select id="h-press">' + pressures.map(p => '<option>' + p + ' bar</option>').join('') + '</select><div class="lab-plot" id="h-plot"></div><p class="caption">━ 100 bar &nbsp; ┄ 150 bar &nbsp; ··· 200 bar</p><p id="h-out" role="status"></p><button class="soft" id="h-reset">Zurücksetzen</button><p class="caption">Didaktische Modelldaten für stöchiometrisches Frischgas. Die Anfangsrate ist ein relativer Modellindex für die gleiche anfängliche Eduktzusammensetzung. Der Referenzwert 1,00 gilt bei 450 °C und 150 bar.</p>');
    return head('Austausch am Kristall', '<p>Verfolge Ag⁺ und Cl⁻ im gesättigten Modell. Gib Chlorid hinzu und vergleiche die Zahl gelöster Silber-Ionen vor und nach dem Eingriff.</p><div class="lab-plot" id="salt-scene"></div><div class="button-row"><button id="salt-step">Ein Ereignis</button><button id="salt-play" aria-pressed="false">Start</button><button id="salt-add">Chlorid zugeben</button><button id="salt-reset">Zurücksetzen</button></div><p id="salt-label" aria-live="off"></p><p class="caption">Vereinfachte Teilchenstichprobe. Jedes Ereignis löst oder bindet ein Ionenpaar. Gegenionen des zugesetzten Chlorids sind ausgeblendet. Die kleinen Teilchenzahlen schwanken. Das bewegte Symbol am Rand markiert den zuletzt erfolgten Paartransfer.</p>');
}
let labCleanup = () => { };
function initLab(id) {
    const $ = x => document.getElementById(x);
    if (id === 'ester')
        return;
    if (id === 'mwg') {
        const draw = () => {
            const mon = $('m-num').selectedIndex === 0;
            const exp = $('m-pow').selectedIndex + 1;
            $('m-expr').innerHTML = 'K<sub>c</sub> = ' + frac(mon ? 'c(NO₂)' : 'c(N₂O₄)', (mon ? 'c(N₂O₄)' : 'c(NO₂)') + (exp === 1 ? '' : '<sup>' + exp + '</sup>'));
            $('m-feed').textContent = '';
        };
        $('m-num').onchange = $('m-pow').onchange = draw;
        $('m-check').onclick = () => {
            $('m-feed').textContent = $('m-num').selectedIndex !== 1 ? 'Der Zähler enthält das Produkt der geschriebenen Reaktion.' : $('m-pow').selectedIndex !== 1 ? 'Der Koeffizient vor NO₂ bestimmt seinen Exponenten.' : 'Der Ausdruck stimmt. Die Einheit ergibt sich zu L/mol.';
        };
        $('m-reset').onclick = () => {
            $('m-num').selectedIndex = $('m-pow').selectedIndex = 0;
            draw();
        };
        draw();
        return;
    }
    if (id === 'shift') {
        const draw = () => {
            let i = Number($('s-input').value);
            let r = i < 0 ? null : shiftCurve(i);
            $('s-plot').innerHTML = diagram(r?.curves ?? [{ name: 'beide Stoffe', xy: [[0, .2], [14, .2]] }], { xlabel: 'Zeit / Modelleinheiten', ylabel: 'c / (mol/L)', xmax: 14, ymax: .6, marker: r ? 2 : null });
            $('s-caption').textContent = r ? shiftOptions[i][5] + ' Neuer Modellwert Kc = ' + format(r.K) + ' L/mol.' : 'Beide Konzentrationen liegen bei 0,20 mol/L. Kc = 5,0 L/mol.';
            $('s-data').innerHTML = r ? '<details><summary>Werte zum Diagramm</summary>' + table(['Zustand', 'NO₂', 'N₂O₄'], [['vorher', '0,200', '0,200'], [
                    'direkt danach',
                    format(r.curves[0].xy[2][1], 3),
                    format(r.curves[1].xy[2][1], 3)
                ], [
                    'bei t = 14',
                    format(r.a, 3),
                    format(r.b, 3)
                ]], 'Konzentrationen in mol/L') + (i === 8 ? '<p>Je Richtung steigt die Modellrate von 0,060 auf 0,160 mol/(L · Modellzeiteinheit). Beide Konzentrationen bleiben zeitlich konstant.</p>' : '') + '</details>' : '';
        };
        $('s-input').onchange = draw;
        $('s-reset').onclick = () => {
            $('s-input').value = '-1';
            draw();
        };
        $('s-input').value = '0';
        draw();
        return;
    }
    if (id === 'haber') {
        const draw = () => {
            const i = $('h-temp').selectedIndex, j = $('h-press').selectedIndex, t = temperatures[i], p = pressures[j], yy = yields[j][i];
            $('h-plot').innerHTML = diagram(yields.map((row, j) => ({ name: pressures[j] + ' bar', xy: row.map((v, i) => [temperatures[i], v]) })), { xlabel: 'Temperatur / °C', ylabel: 'Gleichgewichtsausbeute / %', xmin: 400, xmax: 500, ymax: 60, marks: [[t, yy]] });
            const index = 2 ** ((t - 450) / 50) * (p / 150);
            $('h-out').innerHTML = '<b>' + yy + ' %</b> Gleichgewichtsausbeute · <b>' + format(index, 2) + '</b> relative Anfangsrate.';
        };
        $('h-temp').onchange = $('h-press').onchange = draw;
        $('h-reset').onclick = () => {
            $('h-temp').selectedIndex = 2;
            $('h-press').selectedIndex = 1;
            draw();
        };
        $('h-reset').onclick();
        return;
    }
    let silver = 8, extra = 0, solid = 24, events = 0, last = '', timer = 0;
    function draw() {
        const chloride = silver + extra;
        let svg = '<svg viewBox="0 0 400 224" role="img" aria-label="Teilchenmodell mit ' + silver + ' gelösten Silber-Ionen, ' + chloride + ' Chlorid-Ionen und ' + solid + ' festen Paaren"><rect x="0" y="0" width="400" height="224" fill="#f7faf3"/><path d="M114 5v214" stroke="#aabbac" stroke-dasharray="4 4"/><g font-family="system-ui" font-size="12" fill="#27483e"><text x="9" y="19">Bodenkörper</text><text x="123" y="19">Lösung · ● Ag⁺ · □ Cl⁻</text></g>';
        for (let k = 0; k < solid; k++) {
            const x = 12 + (k % 5) * 19, y = 203 - Math.floor(k / 5) * 18;
            svg += '<circle cx="' + x + '" cy="' + y + '" r="4.5" fill="#267765"/><rect x="' + (x + 5) + '" y="' + (y - 4) + '" width="8" height="8" fill="#bd7946"/>';
        }
        for (let k = 0; k < silver + chloride; k++) {
            const col = (k * 13) % 29, row = (k * 11) % 19, x = 125 + col * 8.7, y = 37 + row * 9;
            svg += k < silver ? '<circle cx="' + x + '" cy="' + y + '" r="5" fill="#267765"/>' : '<rect x="' + (x - 4) + '" y="' + (y - 4) + '" width="8" height="8" fill="#bd7946"/>';
        }
        if (last === 'Lösen' || last === 'Anlagern') {
            const backwards = last === 'Anlagern', x1 = backwards ? 157 : 87, x2 = backwards ? 87 : 157;
            svg += '<g><circle cx="0" cy="0" r="5" fill="#267765"/><rect x="7" y="-4" width="8" height="8" fill="#bd7946"/><animateTransform attributeName="transform" type="translate" from="' + x1 + ' 102" to="' + x2 + ' 102" dur=".46s" fill="freeze"/></g>';
        }
        $('salt-scene').innerHTML = svg + '</svg>';
        $('salt-label').textContent = 'Gelöst: ' + silver + ' Ag⁺ und ' + chloride + ' Cl⁻. Kristall: ' + solid + ' Paare. Ereignisse: ' + events + '. ' + (last ? 'Zuletzt: ' + last + '.' : '');
    }
    function step() {
        const dissolve = solid ? 1 : 0, attach = silver * (silver + extra) / 64;
        if (Math.random() * (dissolve + attach) < dissolve) {
            silver++;
            solid--;
            last = 'Lösen';
        }
        else if (silver) {
            silver--;
            solid++;
            last = 'Anlagern';
        }
        events++;
        draw();
    }
    function stop() {
        clearInterval(timer);
        timer = 0;
        $('salt-play').textContent = 'Start';
        $('salt-play').setAttribute('aria-pressed', 'false');
    }
    $('salt-step').onclick = step;
    $('salt-play').onclick = () => {
        if (timer)
            stop();
        else {
            timer = setInterval(() => {
                if (!document.hidden)
                    step();
            }, 650);
            $('salt-play').textContent = 'Pause';
            $('salt-play').setAttribute('aria-pressed', 'true');
        }
    };
    $('salt-add').onclick = () => {
        extra += 8;
        last = 'Zugabe von 8 Cl⁻';
        $('salt-add').disabled = extra >= 24;
        draw();
    };
    $('salt-reset').onclick = () => {
        stop();
        silver = 8;
        solid = 24;
        extra = 0;
        events = 0;
        last = '';
        $('salt-add').disabled = false;
        draw();
    };
    labCleanup = () => clearInterval(timer);
    draw();
}
