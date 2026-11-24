# Chemie LK – Lernplattform | Abitur 2028

## Starten

Entpacke das ZIP vollständig und öffne **index.html** im Browser. Über „Mit Grundlagen starten“ beginnt das erste Fachkapitel. Alle Kapitel, Simulationen und Aufgaben sind auch einzeln erreichbar. Die Schüleroberfläche lädt alle Ressourcen aus dem Projektordner.

Die **[Lehrerübersicht](lehrkraft/index.html)** enthält die Kapitel- und Aufgabenzuordnung, Kriterien für die Abiturvorbereitung, Modellannahmen, Quellen und das Prüfprotokoll. Sie lässt sich direkt im Browser lesen oder drucken.

## Über GitHub Pages veröffentlichen

1. Lege ein GitHub-Repository für die Schülerseite an oder öffne das dafür vorgesehene Repository.
2. Lade den **entpackten Inhalt** hoch. Im Hauptverzeichnis müssen `index.html`, `assets/` und `labor/` nebeneinander liegen. Bewahre die Unterordner innerhalb von `assets/` vollständig. Die Lehrerübersicht und diese README können separat auf deinem Gerät bleiben oder mit hochgeladen werden.
3. Speichere die Dateien im gewünschten Branch, beispielsweise `main`.
4. Öffne **Settings → Pages**. Wähle unter **Build and deployment → Source** die Option **Deploy from a branch**. Wähle deinen Branch und den Ordner **/(root)**. Speichere.
5. Sobald GitHub die Bereitstellung meldet, öffne **Visit site**. Gib diese Adresse an den Kurs weiter. Links auf einzelne Kapitel kannst du direkt aus der Adresszeile kopieren.

Alle Links sind relativ. Ein Kapitellink sieht beispielsweise so aus: `https://BENUTZERNAME.github.io/REPOSITORY/#kapitel/loeslichkeit/ueben/salz-mischen`. GitHub liefert auch beim Neuladen eines solchen Links die Startdatei aus. Für kleine Korrekturen kannst du eine Datei im Repository bearbeiten und den Commit speichern. Die nächste Bereitstellung aktualisiert die Schülerseite.

[GitHub-Dokumentation zur Veröffentlichung aus einem Branch](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

## Unterrichten und wiederholen

- In **Wiederholen** stehen Texte, Beispiele und das jeweilige Modelllabor. Das Esterlabor öffnet eine eigene Seite mit Rücklink. **Üben** umfasst je sechs Aufgaben, **Vertiefen** je drei.
- Zahlen lassen sich mit Punkt oder Komma und mit Zehnerpotenzen eingeben. Die Einheit steht am Feld. Bei Rechnungen gibt es zusätzlich ein Feld für den eigenen Rechenweg.
- In offenen Aufgaben schreiben die Lernenden zuerst eine Antwort. Nach dem Öffnen der Lösung vergleichen sie ihre Argumentation mit den Kriterien und schätzen sie selbst ein.
- Im **Abiturtraining** kann jeder der vier Komplexe einzeln begonnen, verlassen und fortgesetzt werden. Die Zeitmessung ist freiwillig. Bei der Abgabe wird auf leere Teilaufgaben hingewiesen. Die anschließende Punktevergabe erfolgt durch die Lernenden. Ein neuer Versuch ersetzt nach Bestätigung die Antworten dieses Komplexes.
- Über **Lernstand** können Lernende ihren Stand drucken, als JSON-Datei exportieren, wieder importieren oder nach Bestätigung löschen. Der Export enthält auch Freitexte und Teilpunkte. Für den Gerätewechsel zuerst exportieren, dann am Ziel importieren.
- Der Lernstand gehört zum Browserprofil und zur Projektadresse. Eine lokale Vorschau und die veröffentlichte Version sind unterschiedliche Speicherorte. Manche Browser beschränken die Speicherung bei lokal geöffneten Dateien. Die Seite zeigt bei einem erkannten Speicherfehler einen Hinweis. In privaten Browserfenstern kann der Stand mit dem Schließen verloren gehen.

## Architektur

| Pfad | Aufgabe |
| --- | --- |
| `index.html` | Einstieg, Hauptnavigation, Ladereihenfolge |
| `assets/css/atlas.css` | Layout, Formulare, Diagramme, mobile Darstellung, Druckansicht |
| `assets/zeichen.svg` | Lokales Plattformzeichen |
| `assets/data/catalog.js` | Kapitelregister, Materialtabellen, Beispiele, Aufgaben- und Felddefinitionen, Register für weitere Module |
| `assets/data/grundlagen.js`, `mwg.js`, `chatelier.js`, `haber.js`, `salze.js` | Fachtexte, Aufgaben, Hilfen und Lösungen je Kapitel |
| `assets/data/training.js` | Materialien, Arbeitsaufträge, Erwartungshorizonte und BE-Kriterien der vier Komplexe |
| `assets/js/progress.js` | Validierung der Zahlen und des Importformats, lokaler Lernstand, Kennzahlen |
| `assets/js/models.js` | Diagramme, MWG-Werkstatt, Kurvenlabor, Ammoniaksynthese, Kristallmodell |
| `assets/js/app.js` | Hash-Navigation, Lernbereiche, Aufgabenoberfläche, Prüfungssitzungen, lokale Dateiaktionen |
| `labor/ester.html` | Eigenständige Simulation mit Teilchenbewegung und Zeitdiagrammen |
| `lehrkraft/index.html` | Fachliche und technische Begleitunterlagen |

Die Seiten verwenden klassische Skripte mit `defer` in definierter Reihenfolge. Es gibt keine Laufzeit-Abfragen anderer Dateien mittels Fetch. Damit funktioniert der Start auch per Doppelklick. Gespeicherte Freitexte werden bei der Ausgabe HTML-escaped. Das Datenformat verwendet Version 1 und Aufgaben-IDs. Ein Import übernimmt nur die aktuell bekannten IDs und berechnet automatisch geprüfte Ergebnisse aus den gespeicherten Eingaben neu.

### Fachinhalte bearbeiten

1. Öffne die Datendatei des Fachkapitels. Die Reihenfolge der Einträge in `tasks` bestimmt deren Anzeige. Die aktuelle Einteilung nutzt die ersten sechs zum Üben und die drei folgenden zum Vertiefen. Mit der optionalen Kapiteleigenschaft `practiceCount` lässt sich die Zahl der Übungsaufgaben ändern. Die nachfolgenden Aufgaben erscheinen in der Vertiefung.
2. Jede Aufgabe erhält eine stabile ID, AFB, Titel, einen Arbeitsauftrag, Felder, drei Hilfen und eine Musterlösung. Über `num(label, wert, einheit, fehlerhinweis, toleranz)` wird ein Zahlenfeld angelegt. `pick(label, antworten, index, fehlerhinweis)` legt eine Auswahl an. Der erste Eintrag hat Index null. Mehrere Felder können kombiniert werden.
3. Eine offene Aufgabe verwendet ein leeres Feld-Array und eine Liste fachlicher Kriterien nach der Musterlösung. Für Abiturteile definiert `part` eigenständige Kriterien mit maximalen BE. Die Anzeige summiert diese automatisch.
4. Behalte die ID bei redaktionellen Änderungen bei. Ändert sich der Lösungsgegenstand grundlegend, vergib eine neue ID. Prüfe nach jeder inhaltlichen Änderung richtige, falsche und gerundete Antworten sowie den Import eines bestehenden Testlernstands.
5. Für ein neues interaktives Modell erhält das Kapitel einen neuen `lab`-Wert. In `models.js` liefern `labMarkup` das Bedienfeld und `initLab` die Ereignisbehandlung. Laufende Zeitgeber beim Kapitelwechsel über `labCleanup` stoppen.

### Ein neues Themenmodul anschließen

1. Lege einen eigenen Unterordner an, etwa `module/saeure-base/`, und stelle dort die vollständig ausgearbeitete statische Einheit mit eigener `index.html` bereit. Gemeinsames CSS kannst du mit `../../assets/css/atlas.css` einbinden. Ein Rücklink `../../index.html#start` führt zur Zentrale.
2. Trage das fertige Modul im Array `additionalModules` in `assets/data/catalog.js` ein. Jeder Eintrag benötigt `title`, `description` und `href`, etwa `{ title: 'Säure-Base-Gleichgewichte', description: 'Protolyse und pH-Wert', href: 'module/saeure-base/index.html' }`.
3. Die Startseite erzeugt daraus den Abschnitt **Weitere Themenmodule**. Ein neues Modul kann die Feldtypen und Darstellungshilfen übernehmen. Die Lernstandsübersicht der vorliegenden Fassung zählt die Aufgaben des Gleichgewichtsmoduls. Bei getrennten Modul-Einstiegsseiten sind die lokalen Fortschrittsdaten nach URL-Pfad getrennt. Eine modulübergreifende Gesamtstatistik würde ein gemeinsames, modulbasiertes Register erfordern.
4. Prüfe Kapitelwechsel, Rücklink, Dateipfade und Lernstandsverhalten. Schalte nur Module frei, deren Lerninhalte verfügbar sind.

## Einsatzgrenzen

Die Plattform ist zur Wiederholung nach der Unterrichtseinheit gedacht. Die Simulationen verwenden klar beschriebene Modelle. Offene Lösungen und Rechenwege erfordern fachliche Selbst- oder Lehrkraftkontrolle. Im statischen Quelltext sind die Musterlösungen einsehbar. Der Abiturmodus eignet sich für die persönliche Prüfungsvorbereitung. Eine zentrale Bewertung oder Übermittlung von Schülerantworten findet nicht statt. Das Prüfprotokoll und die Grenzen der tatsächlich durchgeführten Tests stehen in der Lehrerübersicht.

