/** @typedef {{ title: string, description: string, content?: object }} Entry */

/** @type {Record<string, Entry>} */
export const de = {
  'hong-kong-mahjong': {
    title: 'Hongkong-Mahjong',
    description:
      'Spielen Sie echtes Vier-Personen-Mahjong gegen drei Gegner. Hongkong Old Style-Wertung, kostenlos, ohne Download.',
    content: {
      intro:
        'Hongkong-Mahjong auf Mahjong Hub ist ein Vier-Personen-Produktregelwerk auf Basis von Hongkong Old Style. Es verwendet Zeichensteine, Punktsteine, Bambussteine, Windsteine und alle drei Drachen — Rot, Grün und Weiß; Blumen und Jahreszeiten sind bewusst ausgeschlossen. Bilden Sie vier Kombinationen und ein Paar, und wählen Sie den Casual-Modus für einsteigerfreundliche einfache Hände oder den Standard-Modus mit dem traditionellen Minimum von drei Faan.',
      howToPlay: [
        'Die 136-Steine-Produktmauer enthält Zeichensteine, Punktsteine, Bambussteine, Windsteine sowie die roten, grünen und weißen Drachen. Blumen und Jahreszeiten werden nicht verwendet.',
        'Jeder Spieler beginnt mit 13 Steinen; Ost beginnt mit 14 und macht den ersten Abwurf. In späteren Zügen ziehen Sie einen Stein und werfen einen ab, sodass die Hand bei 13 bleibt.',
        'Eine gewinnende Hand besteht aus vier Kombinationen plus einem Paar. Eine Kombination ist entweder drei identische Steine oder drei aufeinanderfolgende Steine derselben Farbe.',
        'Wenn ein anderer Spieler einen Stein abwirft, den Sie brauchen, können Sie ihn beanspruchen: Pong für einen Drilling, Chow für eine Folge (nur vom Spieler zu Ihrer Linken) oder Kong für alle vier Exemplare.',
        'Einen Stein zu beanspruchen öffnet Ihre Hand und kostet Sie einige Wertungsmuster. Nehmen Sie den Anspruch nur, wenn er Ihr Spiel wirklich voranbringt.',
        'Erklären Sie den Gewinn durch eigenen Zug oder durch fremden Abwurf. Der Casual-Modus akzeptiert jede vollständige Hand aus vier Kombinationen und einem Paar; der Standard-Modus verlangt mindestens drei Faan.',
        'Nach der Abrechnung behält Ost den Geberplatz nach einem Gebergewinn oder einem Unentschieden; andernfalls wandert der Geber zum nächsten Sitz.'
      ],
      tips: [
        'Werfen Sie isolierte Ehrensteine früh ab. Sie sind am schwersten zu paaren und das unflexibelste in Ihrer Hand.',
        'Verfolgen Sie die Distanz zur Wartehand statt einzelne Steine anzustarren. Zwei entfernt ist eine normale Mittelspielposition; bei einem entfernt spielen Sie vorsichtiger.',
        'Eine Hand in reiner Einzelfarbe ist weit mehr wert als die Summe ihrer Teile. Mit sieben oder acht Steinen einer Farbe im Start lohnt sich frühes Festlegen meist.',
        'Beobachten Sie die anderen Sitze. Werfen drei Spieler dieselbe Farbe ab, sind die Steine, die Sie brauchen, wahrscheinlich noch im Spiel.',
        'Im Standard-Modus prüfen Sie die Faan-Summe vor einem Anspruch: Eine vollständige Form unter drei Faan ist kein legaler Gewinn.'
      ],
      features: [
        'Authentische Hongkong-Old-Style-Regeln mit 136 Steinen — nur Zeichensteine, Punktsteine, Bambussteine, Windsteine und Drachensteine.',
        'Casual-Modus zum Lernen vollständiger Hände ohne Faan-Schwelle; Standard-Modus setzt das traditionelle Minimum von drei Faan durch.',
        'Drei KI-Gegner mit sinnvoller Abwurflogik zum Üben des echten Vier-Personen-Tempos.',
        'Optionaler Wartehand-Hinweis und Faan-Aufschlüsselung nach der Hand, um die Wertung ohne Regelbuch zu lernen.',
        'Vollständiges Browser-Spiel auf Desktop und Mobil — tippen oder klicken zum Abwerfen, Beanspruchen und Gewinnerklären.'
      ],
      supportedDevices:
        'Hongkong-Mahjong läuft in jedem modernen Browser unter Windows, macOS, Linux, Android und iOS ohne Download. Querformat auf Telefon oder Tablet bietet die breiteste Steinsicht; Hochformat funktioniert mit scrollbar Händen. Chrome, Safari, Firefox und Edge werden unterstützt — nutzen Sie einen aktuellen Browser für flüssige Animationen bei Ansprüchen und Abrechnung.',
      faq: [
        {
          question: 'Muss ich etwas herunterladen?',
          answer:
            'Nein. Das Spiel läuft vollständig im Browser auf Desktop und Mobil, ohne Installation.'
        },
        {
          question: 'Ist das echtes Mahjong oder das Paarungs-Puzzle?',
          answer:
            'Das ist echtes Vier-Personen-Mahjong mit Ziehen, Abwerfen, Beanspruchen und Wertung. Das Paarungs-Spiel, das viele westliche Seiten „Mahjong“ nennen, ist Mahjong-Solitär — ein anderes Spiel.'
        },
        {
          question: 'Was ist der Unterschied zwischen Casual und Standard?',
          answer:
            'Der Casual-Modus erlaubt den Gewinn mit jeder strukturell vollständigen Hand und vergibt eine Chicken-Hand mit einem Faan, wenn kein anderes Muster zählt. Der Standard-Modus von Hongkong verlangt mindestens drei Faan; eine vollständige Hand mit geringerer Wertung muss weitergespielt werden.'
        },
        {
          question: 'Gibt es Echtgeld-Glücksspiel?',
          answer:
            'Nein. Es gibt keine Einsätze, keine käufliche Währung und keinen Geldpreis. Punkte erfassen nur Ihren eigenen Fortschritt.'
        }
      ]
    }
  },
  'riichi-mahjong': {
    title: 'Riichi-Mahjong',
    description:
      'Japanisches Riichi-Mahjong gegen drei Gegner. Das Regelwerk hinter der modernen Wettkampf-Szene.',
    content: {
      intro:
        'Diese japanische Vier-Personen-Riichi-Tabelle folgt der genehmigten World-Riichi-Championship-2025-Basis: keine roten Fünfen, ein Sieger bei Head-Bump und 30.000 Punkte Start.',
      howToPlay: [
        'Jeder Spieler beginnt mit 13 Steinen. Ziehen Sie einen und werfen Sie einen ab, mit dem Ziel vier Kombinationen und ein Paar; Sieben Paare und Dreizehn Waisen sind ebenfalls gültige geschlossene Formen.',
        'Eine vollständige Form reicht nicht: Die Hand braucht mindestens ein Yaku. Dora erhöht den Wert, ist aber selbst kein Yaku.',
        'Chow ist nur vom Spieler zu Ihrer Linken möglich. Pong, Kong und Ron können von jedem Gegner beansprucht werden, vorbehaltlich der Anspruchspriorität.',
        'Halten Sie die Hand geschlossen und erreichen Sie die Wartehand, um Riichi zu erklären. Wählen Sie einen hervorgehobenen Abwurf und setzen Sie einen 1.000-Punkte-Stab.',
        'Gewinnen Sie durch Tsumo auf Ihren eigenen Zug oder Ron auf einen Gegnerabwurf. Unter WRC-Head-Bump erhält nur der erste Sieger in Zugreihenfolge den Ron.',
        'Das Match läuft durch Ost- und Süd-Runden. In dieser Produktbasis behält ein Gebergewinn oder ein erschöpfendes Unentschieden den Geber; erschöpfende Unentschieden nutzen eine 3.000-Punkte-Noten-Zahlung.',
        'Diese Tabelle verwendet 136 Steine, eine 14-Steine-Totmauer, Dora-Indikatoren und keine roten Fünfen.'
      ],
      tips: [
        'Sichern Sie ein Yaku, bevor Sie Dora jagen: Bonussteine machen eine yaku-lose Hand nicht legal.',
        'Vergleichen Sie Shanten und nützliche Steine vor jedem Abwurf; behalten Sie Formen mit mehr verbessernden Zügen.',
        'Gegen Riichi beginnen Sie mit Genbutsu, dann nutzen Sie Suji und sichtbare Steinmauern zur Risikominderung.',
        'Erklären Sie Riichi bewusst: Vergleichen Sie Wartequalität, Handwert, verbleibende Steine und den Matchstand.',
        'Erzwingen Sie spät in der Hand keine Angriffe mit geringem Wert, wenn ein sicheres Fold Ihre Position schützt.'
      ],
      features: [
        'World-Riichi-Championship-2025-Basis — keine roten Fünfen, Head-Bump-Ron und 30.000 Punkte Start.',
        'Vollständige Yaku-Schwelle, Dora-Indikatoren und 14-Steine-Totmauer für authentischen Wettkampffluss.',
        'Riichi-Erklärung mit 1.000-Punkte-Stab, Tsumo- und Ron-Gewinne mit Zugreihenfolge-Priorität.',
        'Der Wartehand-Hinweis verfolgt Shanten, damit Sie die Wartehand lernen, ohne Steinzahlen zu raten.',
        'Ost- und Süd-Runden mit Geberfortsetzung bei Gebergewinnen und erschöpfenden Unentschieden.'
      ],
      supportedDevices:
        'Riichi-Mahjong spielt im Browser auf Desktop, Laptop, Tablet und Telefon ohne App-Installation. Mobiles Querformat wird empfohlen, um Gegnerabwürfe und Ihre Hand gemeinsam zu lesen. Unterstützte Browser: aktuelle Chrome, Safari, Firefox und Edge unter Windows, macOS, Linux, Android und iOS.',
      faq: [
        {
          question: 'Worin unterscheidet sich Riichi von chinesischem Mahjong?',
          answer:
            'Riichi verlangt ein Wertungsmuster vor der Gewinnerklärung, bewertet geschlossene Hände höher und nutzt eine andere Wertungstabelle. Der Kern aus Ziehen und Abwerfen ist derselbe, daher lassen sich beide leicht übertragen.'
        },
        {
          question: 'Ist das ein guter Ort, um Riichi zu lernen?',
          answer:
            'Es ist ein guter Ort, um sich mit dem Fluss, den Ansprüchen und gängigen Mustern vertraut zu machen. Der Wartehand-Hinweis zeigt, wie weit Sie von einer vollständigen Hand entfernt sind — die nützlichste Information für Neueinsteiger.'
        }
      ]
    }
  },
  'chinese-official-mahjong': {
    title: 'Chinesisches Offizielles Mahjong',
    description:
      'Trainings-Tabelle für chinesisches Offizielles Mahjong (MCR) — 144 Steine, Blumenersatz und Acht-Punkte-Gewinnschwelle.',
    content: {
      intro:
        'Dies ist unsere Trainings-Tabelle für chinesisches Offizielles Mahjong (MCR). Sie verwendet bereits 144 Steine, legt Blumen und Jahreszeiten offen und ersetzt sie, und setzt die Acht-Punkte-Gewinnschwelle durch. Der vollständige 81-Elemente-Wettkampfscorer und seine Ausschlussregeln sind noch in Entwicklung; diese Seite darf nicht als Turnier-Schiedsrichter genutzt werden.',
      howToPlay: [
        'Standard-Vier-Personen-Mahjong: ziehen, abwerfen und vier Kombinationen plus ein Paar bilden.',
        'Legen Sie jede Blume oder Jahreszeit sofort im Blumenbereich offen und nehmen Sie einen Ersatz vom Ende der Mauer.',
        'Eine Hand muss mindestens acht qualifizierende Punkte wert sein, bevor sie erklärt werden darf. Blumenpunkte erfüllen diese Schwelle allein nicht.',
        'Der aktuelle Scorer deckt nur eine Trainings-Teilmenge ab; nutzen Sie das Ergebnis, um den Zugfluss zu lernen, nicht um einen Wettkampfscore zu zertifizieren.'
      ],
      tips: [
        'Behandeln Sie diesen Build als Übungstisch, während die offiziellen 81 Wertungselemente ergänzt werden.',
        'Eine Hand einen Stein vor der Vollendung, aber unter acht qualifizierenden Punkten, ist kein legaler Gewinn; verbessern Sie weiter ihre Wertungsstruktur.',
        'Wenn der vollständige Scorer kommt, erklärt er eingeschlossene und ausgeschlossene Elemente, statt einfach jedes sichtbare Muster zu addieren.'
      ],
      features: [
        '144-Steine-MCR-Trainingstabelle mit Ersatzfluss für Blumen und Jahreszeiten.',
        'Mindestgewinnschwelle von acht Punkten vermittelt früh wettkampftaugliche Entscheidung.',
        'Vier-Personen-Ziehen und -Abwerfen gegen KI mit Standard-Kombinationsansprüchen.',
        'Der Trainingsscorer deckt eine erste Mustermenge ab, während die volle 81-Elemente-Tabelle gebaut wird.',
        'Klares Bildschirm-Feedback, wenn eine vollständige Hand unter der Acht-Punkte-Schwelle liegt.'
      ],
      supportedDevices:
        'Chinesisches Offizielles Mahjong läuft vollständig im Browser unter Windows, macOS, Linux, Android und iOS. Desktop und Tablet machen Blumenersatz und Wertungsfeedback am leichtesten lesbar; Telefone funktionieren in beiden Ausrichtungen. Nutzen Sie aktuelles Chrome, Safari, Firefox oder Edge für beste Leistung in Mehrspielerzügen.',
      faq: [
        {
          question: 'Warum kann ich bei einer vollständigen Hand keinen Gewinn erklären?',
          answer:
            'Chinesisches Offizielles verlangt mindestens acht Punkte. Wenn Ihre vollendete Hand weniger wert ist, kann der Gewinn nicht erklärt werden und das Spiel geht weiter.'
        },
        {
          question: 'Ist die Wertung hier vollständig?',
          answer:
            'Nein. Diese Trainingsversion implementiert den 144-Steine- und Blumenersatz-Fluss plus eine erste Wertungs-Teilmenge. Die vollständige offizielle 81-Elemente-Tabelle und ihre Ausschlüsse werden noch implementiert.'
        }
      ]
    }
  },
  'sichuan-mahjong': {
    title: 'Sichuan-Mahjong',
    description:
      'Sichuan Blood Battle Mahjong mit Exchange Three, einer verbotenen Farbe und Fortsetzung nach dem ersten Gewinn.',
    content: {
      intro:
        'Sichuan-Mahjong auf Mahjong Hub folgt der Chengdu-Blood-Battle-to-the-End-Basis: nur drei Farben, Exchange Three, eine verbotene Farbe, kein Chow, und das Spiel läuft nach dem ersten Gewinn weiter.',
      howToPlay: [
        'Die 108-Steine-Mauer verwendet nur Zeichensteine, Punktsteine und Bambussteine. Windsteine, Drachensteine, Blumen und Jahreszeiten werden nicht verwendet.',
        'Vor dem normalen Spiel wählen Sie drei Steine einer Farbe für Exchange Three; die Tabelle gibt sie in der für diese Hand gewählten Richtung weiter.',
        'Wählen Sie eine verbotene Farbe. Sie müssen jeden Stein dieser Farbe abwerfen, bevor ein Gewinn erlaubt ist.',
        'Ziehen und abwerfen Sie normal. Chow ist nicht erlaubt; Pong und Kong sind gemäß der Anspruchsreihenfolge der Tabelle erlaubt.',
        'Bilden Sie vier Kombinationen und ein Paar oder eine zugelassene Spezialhand wie Sieben Paare, und gewinnen Sie durch eigenen Zug oder legalen Abwurf.',
        'Ein Sieger zieht nicht mehr, aber die Hand läuft für die übrigen weiter. Die Endabrechnung umfasst Wartehand-Prüfung, Flower-Pig-Strafe und Kong-Rückerstattung.'
      ],
      tips: [
        'Wählen Sie die verbotene Farbe nach der, die Sie am schnellsten räumen können — nicht nur nach der niedrigsten Steinzahl.',
        'Exchange Three sollte drei Steine einer zusammenhängenden schwachen Farbe entfernen, damit Sie nicht drei unzusammenhängende tote Steine erzeugen.',
        'Weil Chow fehlt, sind Paare und verbundene Formen wertvoller als in Varianten mit Chow.',
        'Nach dem Gewinn eines anderen Spielers bewerten Sie das Risiko neu: Wartehand bleiben zählt für die Endprüfung, aber vermeiden Sie Flower Pig.',
        'Verfolgen Sie Kong-Exposition und Abrechnung. Ein hochwertiger Kong ist nicht automatisch sicher, wenn er einen gefährlichen Zug öffnet.'
      ],
      features: [
        'Chengdu-Blood-Battle-Basis — 108 Steine, Exchange Three und persönliche verbotene Farbe.',
        'Kein Chow: nur Pong und Kong, im schnellen Sichuan-Tischtempo gegen drei KI-Sitze.',
        'Blood-Battle-Fluss setzt nach dem ersten Gewinn fort, mit End-Wartehand-Prüfung und Strafen.',
        'Interaktives Exchange Three und Auswahl der verbotenen Farbe vor jeder Hand.',
        'Gewinne durch eigenen Zug und Abwurf, mit Sieben Paaren und Standardformen aus vier Kombinationen.'
      ],
      supportedDevices:
        'Sichuan-Mahjong läuft in modernen Browsern auf Desktop, Laptop, Tablet und Telefon ohne Installation. Querformat mobil passt am besten zu Tausch- und Verbotsfarben-Steuerungen. Chrome, Safari, Firefox und Edge unter Windows, macOS, Linux, Android und iOS werden unterstützt.',
      faq: [
        {
          question: 'Warum kann ich nicht gewinnen, solange ich meine verbotene Farbe halte?',
          answer:
            'Die Verbotsfarben-Regel ist eine Kernbedingung des Chengdu Blood Battle. Räumen Sie jeden Stein der gewählten Farbe, bevor ein Gewinn erklärt werden darf.'
        },
        {
          question: 'Warum geht das Spiel nach einem Gewinn weiter?',
          answer:
            'Blood Battle to the End erlaubt den übrigen Spielern fortzusetzen. So können mehrere Sieger oder Strafen in einer Hand entstehen.'
        }
      ]
    }
  },
  'taiwan-mahjong': {
    title: 'Taiwan-Mahjong',
    description:
      'Taiwanesisches 16-Steine-Mahjong mit Blumenersatz und Tai-basierter Wertung.',
    content: {
      intro:
        'Taiwan-Mahjong auf Mahjong Hub ist eine entspannte 16-Steine-Version: 144-Steine-Mauer mit Blumen und Jahreszeiten, fünf Kombinationen plus ein Paar zum Gewinn, additive Tai-Wertung und 0-Tai-Minimum für Einsteiger.',
      howToPlay: [
        'Nutzen Sie alle 144 Steine. Jeder Nicht-Geber beginnt mit 16 Steinen; Ost beginnt mit 17 und macht den ersten Abwurf.',
        'Legen Sie jede Blume oder Jahreszeit sofort offen und ziehen Sie einen Ersatz. Sie bleibt außerhalb Ihrer 16-Steine-Hand und addiert Tai, sofern anwendbar.',
        'In Ihrem Zug ziehen Sie einen Stein und werfen einen ab. Sie dürfen Chow vom linken Spieler oder Pong und Kong gemäß Anspruchsreihenfolge.',
        'Gewinnen Sie mit fünf Kombinationen und einem Paar — einer 17-Steine-Hand. Gewinne durch eigenen Zug und Abwurf werden unterstützt.',
        'Tai-Muster addieren sich in der Abrechnung. Diese Mahjong-Hub-Einsteigerbasis erlaubt den Gewinn mit einer vollständigen 0-Tai-Hand.'
      ],
      tips: [
        'Mit 16 verdeckten Steinen behalten Sie früh mehrere verbundene Formen, statt zu schnell auf eine Warte zu setzen.',
        'Blumen erhöhen den Wert, reparieren aber keine schwache Haupthand; bauen Sie zuerst die Fünf-Kombinations-Struktur.',
        'Kong kommen in Taiwan-Mahjong häufiger vor. Wägen Sie Ersatzzug und die Information ab, die Sie preisgeben.',
        'Nutzen Sie den 0-Tai-Modus zum Lernen des Tempos; jagen Sie Tai erst, wenn es Ihre lebenden Warten nicht verringert.',
        'Prüfen Sie, ob Ihre Blume zu Ihrem Sitz passt — Sitzblumen können einen Extra-Bonus geben.'
      ],
      features: [
        'Taiwanesische 16-Steine-Hände mit fünf Kombinationen plus Paar und 144-Steine-Mauer inklusive Blumen.',
        'Sofortiger Blumenersatz mit Tai-Boni und Sitzblumen-Wertungsoptionen.',
        'Chow-, Pong- und Kong-Ansprüche mit additiver Tai-Abrechnung bei jedem Gewinn.',
        'Einsteigerfreundliches 0-Tai-Minimum, um Tempo zu lernen, bevor Sie hohe Tai-Muster jagen.',
        'Vier-Personen-Tisch gegen KI mit Gewinnen durch eigenen Zug und Abwurf.'
      ],
      supportedDevices:
        'Taiwan-Mahjong spielt im Browser unter Windows, macOS, Linux, Android und iOS. Tablets und Desktops machen die größere 16-Steine-Hand am leichtesten erfassbar; Telefone funktionieren im Hoch- oder Querformat. Nutzen Sie aktuelles Chrome, Safari, Firefox oder Edge für reaktionsschnelle Tipps und flüssige Blumenersatz-Animationen.',
      faq: [
        {
          question: 'Warum halte ich 16 Steine statt 13?',
          answer:
            'Taiwan-Mahjong verwendet fünf Kombinationen plus ein Paar. Spieler halten normalerweise 16 Steine und gewinnen nach dem Ziehen oder Beanspruchen des 17.'
        },
        {
          question: 'Kann eine 0-Tai-Hand hier gewinnen?',
          answer:
            'Ja. Mahjong Hub nutzt eine entspannte 0-Tai-Basis. Andere Taiwan-Tische können ein Tai-Minimum verlangen; das wird klar in den Spieleinstellungen gezeigt.'
        }
      ]
    }
  },
  'american-mahjong': {
    title: 'Amerikanisches Mahjong',
    description:
      'Amerikanisches Mahjong mit Charleston, Jokern, Blumen und kartenbasierten Gewinnmustern.',
    content: {
      intro:
        'Amerikanisches Mahjong auf Mahjong Hub ist ein originales Übungskarten-Spiel im NMJL-ähnlichen Fluss: 152 Steine, Charleston, Blumen, Joker, offen gelegte Gruppen und exakte Kartenmuster-Gewinne. Es reproduziert keine aktuelle NMJL-Jahreskarte.',
      howToPlay: [
        'Nutzen Sie ein 152-Steine-Set mit Standardsteinen, acht Blumen und acht Jokern. Jeder Spieler nimmt 13 Steine; Ost nimmt 14 und wirft zuerst ab.',
        'Lesen Sie die originale Übungskarte und führen Sie Charleston aus: drei Steine rechts, gegenüber und links weitergeben. Ein zweites Charleston und Courtesy Pass sind Tischoptionen.',
        'Ziehen und abwerfen Sie auf eine exakte Zeile der Übungskarte zu — nicht auf eine generische Form aus vier Kombinationen und einem Paar.',
        'Legen Sie legale Pongs, Kongs oder größere Gruppen offen, wenn die gewählte Kartenzeile es erlaubt. Verdeckte Kartenzeilen dürfen vor dem Endgewinn nicht offen gelegt werden.',
        'Nutzen Sie einen Joker nur in einer Gruppe von drei oder mehr; nie als Einzelstein oder Paar. In Ihrem Zug kann ein natürlicher Stein einen Joker in einer Gegnerexposition tauschen.',
        'Erklären Sie Mah Jongg nur, wenn alle 14 Steine exakt einer legalen Zeile der originalen Übungskarte entsprechen.'
      ],
      tips: [
        'Halten Sie vor Charleston zwei oder drei kompatible Kartenzeilen offen, statt sich auf eine seltene Zeile festzulegen.',
        'Geben Sie Steine weiter, die keine Ihrer wahrscheinlichen Kartenkategorien stützen — aber nie einen Joker.',
        'Legen Sie eine Gruppe nicht nur offen, weil Sie können: Die Exposition signalisiert Ihr Ziel und kann ein Umschwenken unmöglich machen.',
        'Behandeln Sie Joker als Gruppenbeschleuniger, nicht als universelle Wildcards; für Singles und Paare brauchen Sie weiterhin natürliche Steine.',
        'Nutzen Sie Gegnerexpositionen, um zu entscheiden, welche natürlichen Steine sicher abwerfbar sind und wann ein Joker-Tausch lohnt.'
      ],
      features: [
        '152-Steine-Set im amerikanischen Stil mit Blumen, Jokern und NMJL-inspirierten Charleston-Pässen.',
        'Originale Mahjong-Hub-Übungskarten — exakte Musterngewinne, keine generischen Kombinationsformen.',
        'Legale Joker-Gruppen, Joker-Tausch in Ihrem Zug und Expositionsregeln gekoppelt an die Kartenzeile.',
        'Optional zweites Charleston und Courtesy Pass für übungstischähnliche Sessions.',
        'Vier-Personen-Browser-Tisch mit geführtem Charleston und Kartenmuster-Validierung.'
      ],
      supportedDevices:
        'Amerikanisches Mahjong läuft vollständig im Browser auf Desktop und Mobil ohne App-Download. Ein breiter Bildschirm hilft, Übungskarte und Expositionen gemeinsam zu lesen; Telefone drehen ins Querformat für das volle Tischlayout. Unterstützt auf Chrome, Safari, Firefox und Edge unter Windows, macOS, Linux, Android und iOS.',
      faq: [
        {
          question: 'Ist das die offizielle NMJL-Jahreskarte?',
          answer:
            'Nein. Dieses Spiel verwendet originale Mahjong-Hub-Übungskarten. Eine lizenzierte NMJL-Kartenintegration wäre ein separates zukünftiges Produkt.'
        },
        {
          question: 'Kann ein Joker in einem Paar verwendet werden?',
          answer:
            'Nein. In dieser Regelbasis sind Joker nur in Gruppen von drei oder mehr legal, nie in Singles oder Paaren.'
        }
      ]
    }
  },
  'mahjong-connect-classic': {
    title: 'Mahjong Connect',
    description:
      'Verbinden Sie passende Steinpaare mit einem Pfad, der höchstens zweimal abbiegt. Drei Brettgrößen, Hinweise und kein Timer im Entspannungsmodus.',
    content: {
      intro:
        'Mahjong Connect, auch als Onet bekannt, ist das Verbindungs-Puzzle aus Mahjong-Steinen. Räumen Sie das ganze Brett, indem Sie identische Paare mit einem Pfad verbinden, der höchstens zweimal knickt. Der Entspannungsmodus hat keine Uhr, wenn Sie sich Zeit lassen möchten.',
      howToPlay: [
        'Tippen oder klicken Sie zwei Steine mit derselben Vorderseite.',
        'Das Paar verschwindet, wenn sie durch einen Pfad leeren Raums verbunden werden können, der höchstens zweimal abbiegt. Der Pfad darf am äußeren Brettrand entlanglaufen.',
        'Räumen Sie alle Steine zum Sieg. Aufeinanderfolgende Treffer bauen einen Serienbonus auf.',
        'Ist kein Paar spielbar, mischt das Brett automatisch neu, sodass Sie nie stecken bleiben.'
      ],
      tips: [
        'Arbeiten Sie zuerst die Ränder. Außensteine haben die meisten Routen und öffnen die Mitte beim Freimachen.',
        'Zwei identische Steine nebeneinander sind immer spielbar — aber sie zu nehmen kann der einzige Weg sein, einen Pfad woanders zu öffnen; schauen Sie vor dem freien Treffer.',
        'Der Hinweis-Button kostet einige Punkte. Auf zeitgesteuerten Brettern lohnt sich dieser Tausch fast immer.'
      ],
      features: [
        'Klassisches Onet-Verbindungsspiel mit authentischen Mahjong-Steinfronten.',
        'Drei Brettgrößen vom Kompakt- bis zum Vollgitter-Herausforderung.',
        'Entspannungsmodus ohne Timer plus zeitgesteuerte Bretter mit Serienwertung.',
        'Automatisches Neumischen, wenn kein Paar spielbar ist — Bretter enden nie in einer Sackgasse.',
        'Hinweis-System und Serienbonus für längere Sessions.'
      ],
      supportedDevices:
        'Mahjong Connect läuft in jedem modernen Browser auf Desktop, Tablet und Telefon ohne Installation. Touch-Tipps auf Mobil und Klick auf Desktop funktionieren auf demselben Brett. Chrome, Safari, Firefox und Edge unter Windows, macOS, Linux, Android und iOS werden unterstützt; ein mittelgroßes Telefonbildschirm passt das Standardbrett bequem im Hochformat.',
      faq: [
        {
          question: 'Worin unterscheidet sich das von Mahjong-Solitär?',
          answer:
            'Solitär stapelt Steine in Schichten und Sie paaren Steine, die an einer Seite frei sind. Connect legt sie flach und verlangt, Paare mit einem Pfad zu verbinden. Anderes Puzzle, gleiche Steine.'
        },
        {
          question: 'Was zählt als Abbiegung im Pfad?',
          answer:
            'Jeder Richtungswechsel. Eine Gerade hat keine Abbiegung, ein L eine, ein Z oder U zwei. Drei oder mehr sind nicht erlaubt.'
        }
      ]
    }
  },
  'mahjong-solitaire-classic': {
    title: 'Mahjong Solitaire Classic',
    description:
      'Das klassische Schicht-Paarungs-Puzzle. Schildkröten- und Pyramidenlayouts, garantiert lösbare Gaben, Hinweise und Rückgängig.',
    content: {
      intro:
        'Mahjong Solitaire ist das klassische Einzelspieler-Paarungs-Puzzle aus Mahjong-Steinen. Räumen Sie das ganze Layout, indem Sie identische freie Steine paaren: nichts liegt darauf und mindestens eine Seite ist offen. Jede Gabe hier ist lösbar generiert, sodass eine vollständige Räumung immer existiert. Zwei klassische Formen sind enthalten — Schildkröte und Pyramide — plus Hinweise, Rückgängig und Neumischen, wenn Sie sich festfahren.',
      howToPlay: [
        'Tippen Sie zwei Steine mit derselben Vorderseite zum Paaren. Ein Stein ist nur paarbar, wenn er frei ist: nichts darauf und an mindestens einer Seite seiner eigenen Schicht offen.',
        'Steine bedecken die direkt darunter; räumen Sie einen Stapel von oben nach unten. Die oberste Schicht ist immer verfügbar; untere Schichten öffnen sich, während Sie arbeiten.',
        'Räumen Sie alle Steine zum Sieg. Die Schildkröte spannt eine breite Schale; die Pyramide stapelt fünf zentrierte Dreiecke, die Sie von den Rändern nach innen schälen.',
        'Jede Gabe ist lösbar generiert, sodass eine Lösung immer existiert. Nutzen Sie Hinweise bei Stockung, machen Sie einen übereilten Treffer rückgängig oder mischen Sie um, um die restlichen Steine neu zu verteilen.',
        'Es gibt keinen Timer und keinen Punktedruck — nehmen Sie sich so viel Zeit wie Sie möchten.'
      ],
      tips: [
        'Arbeiten Sie zuerst außen. Ein Stein am äußeren Rand einer Schicht hat gratis eine offene Seite; das Räumen des Perimeters öffnet die Mitte.',
        'Bevor Sie ein offensichtliches Paar nehmen, prüfen Sie, was es freigibt. Zwei angrenzende identische Steine sind ein leichter Treffer, aber sie zu nehmen kann der einzige Weg sein, einen höheren Stapel zu lösen.',
        'Nutzen Sie die Pyramidenebenen: Randsteine sind von Anfang an spielbar, und der Spitzenstein ist erst erreichbar, wenn seine Schicht erreicht ist.',
        'Gehen die Paare aus, mischen Sie um statt neu zu starten — die restlichen Steine werden in einer frischen lösbaren Anordnung neu verteilt.'
      ],
      features: [
        'Geschichtetes Mahjong-Solitär mit Schildkröten- und Pyramidenlayouts.',
        'Jede Gabe ist rückwärts lösbar generiert — eine vollständige Räumung ist immer möglich.',
        'Frei-Stein-Paarungsregeln mit visueller Hervorhebung spielbarer Paare.',
        'Hinweise, Rückgängig und Neumischen, wenn Sie einen zweiten Blick ohne Neustart wollen.',
        'Tägliche Herausforderung, Kampagnenlevel und Entspannungsmodus ohne Timer.'
      ],
      supportedDevices:
        'Mahjong Solitaire Classic läuft im Browser unter Windows, macOS, Linux, Android und iOS ohne Download. Desktop und Tablet zeigen das volle Schichtlayout; Telefone scrollen natürlich über höhere Schildkrötenstapel. Chrome, Safari, Firefox und Edge werden unterstützt — Gastfortschritt speichert lokal auf Ihrem Gerät.',
      faq: [
        {
          question: 'Worin unterscheidet sich das von Mahjong Connect?',
          answer:
            'Connect legt Steine flach und verlangt, passende Paare mit einem Pfad zu verbinden. Solitär stapelt Steine in Schichten und Sie paaren Steine, die an einer Seite frei und oben unbedeckt sind. Anderes Puzzle, gleiche Steine.'
        },
        {
          question: 'Was bedeutet „frei“ hier?',
          answer:
            'Ein Stein ist frei, wenn nichts direkt darauf liegt und mindestens einer seiner linken oder rechten Nachbarn auf derselben Ebene leer ist. Die Außenrandsteine einer Schicht sind außen immer frei.'
        },
        {
          question: 'Ist jedes Spiel garantiert lösbar?',
          answer:
            'Ja. Gaben werden rückwärts gebaut — das Spiel wählt wiederholt zwei freie Steine, entfernt sie und speichert den Treffer —, sodass jedes Layout einen bekannten Lösungsweg hat, den Sie mit Überlegung finden können.'
        },
        {
          question: 'Gibt es Echtgeld-Glücksspiel?',
          answer:
            'Nein. Dies ist ein reines Puzzle ohne Einsätze, ohne käufliche Währung und ohne Geldpreis jeglicher Art.'
        }
      ]
    }
  },
  'mahjong-connect': {
    title: 'Mahjong Connect Lite',
    description:
      'Paaren Sie freie Mahjong-Steine, die durch einen Pfad verbunden sind. Ein entspannendes Connect-Eliminationsspiel.'
  },
  'mahjong-classic': {
    title: 'Mahjong Classic',
    description:
      'Das zeitlose Mahjong-Solitär. Räumen Sie das Brett, indem Sie offene Steinpaare paaren.'
  },
  'mahjong-solitaire': {
    title: 'Mahjong Solitaire',
    description:
      'Ein schönes Solitär-Layout aus Mahjong-Steinen. Paaren und räumen Sie den Turm in Ihrem Tempo.'
  },
  'mahjong-3d': {
    title: 'Mahjong 3D',
    description:
      'Eine dreidimensionale Variante des Mahjong-Paarens mit Tiefe und ruhiger Regenbogenpalette.'
  },
  'onet-connect-classic': {
    title: 'Onet Connect Classic',
    description:
      'Das klassische Onet-Verbindungsspiel. Verbinden Sie identische Steine mit einer Linie von höchstens zwei Abbiegungen.'
  },
  'bee-connect': {
    title: 'Bee Connect',
    description:
      'Ein niedliches bienenthemenbasiertes Connect-Spiel. Verbinden Sie die kleinen Steine und räumen Sie das Wabenbrett.'
  },
  'aloha-mahjong': {
    title: 'Aloha Mahjong',
    description:
      'Eine tropische Variante des Mahjong-Paarens mit sonniger, gelassener Stimmung.'
  },
  '8x8-match-tiles': {
    title: '8x8 Match Tiles',
    description:
      'Ein kompaktes 8×8-Steinpaarungs-Puzzle. Verbinden Sie gleiche Steine und jagen Sie den Highscore.'
  },
  'tile-guru': {
    title: 'Tile Guru',
    description:
      'Ein zenhaftes Steinpaarungs-Puzzle. Finden und verbinden Sie passende Steine in einem beruhigenden Layout.'
  },
  'tile-journey': {
    title: 'Tile Journey',
    description:
      'Eine Reise durch Steinpaarungs-Level. Planen Sie Ihre Verbindungen und räumen Sie jedes Brett.'
  }
};
