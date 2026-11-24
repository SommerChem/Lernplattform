/* Aufgaben- und Kapitelmodell. Textfelder mit HTML stammen ausschließlich aus dieser Redaktion. */
const chapters = [];
const cases = [];
// Weitere veröffentlichte Module als {title, description, href} eintragen.
const additionalModules = [];
function table(headers, rows, caption = '') {
    return '<div class="table-wrap"><table>' + (caption ? '<caption>' + caption + '</caption>' : '') + '<thead><tr>' + headers.map(x => '<th scope="col">' + x + '</th>').join('') + '</tr></thead><tbody>' + rows.map(r => '<tr>' + r.map((x, i) => i === 0 ? '<th scope="row">' + x + '</th>' : '<td>' + x + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>';
}
function box(title, html) {
    return '<section class="reading"><h3>' + title + '</h3>' + html + '</section>';
}
function example(title, html) {
    return '<section class="example"><span class="kicker">Musterbeispiel</span><h3>' + title + '</h3>' + html + '</section>';
}
function note(html) {
    return '<aside class="note"><strong>Merke</strong><p>' + html + '</p></aside>';
}
function q(id, afb, title, prompt, fields, hints, solution, criteria = []) {
    return { id, afb, title, prompt, fields, hints, solution, criteria };
}
function num(label, value, unit, tip, tolerance = .015) {
    return { label, value, unit, tip, tolerance, type: 'number' };
}
function pick(label, options, answer, tip) {
    return { label, options, answer, tip, type: 'select' };
}
function addChapter(config) {
    chapters.push({ practiceCount: 6, ...config });
}
const mol = 'mol/L', kl2 = 'mol²/L²', kl3 = 'mol³/L³';
const esterEq = 'HCOOH + CH₃OH ⇌ HCOOCH₃ + H₂O';
const ammoniaEq = 'N₂(g) + 3 H₂(g) ⇌ 2 NH₃(g)';
const dimerEq = '2 NO₂(g) ⇌ N₂O₄(g)';
const frac = (a, b) => '<span class="frac"><span>' + a + '</span><span>' + b + '</span></span>';
const eqn = x => '<p class="equation">' + x + '</p>';
const esterMWG = 'K<sub>c</sub> = ' + frac('c(Ester) · c(Wasser)', 'c(Säure) · c(Alkohol)');
