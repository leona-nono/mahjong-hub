import type { GameConfig } from './games';

type LocalizedGameCopy = Pick<GameConfig, 'title' | 'description' | 'content'>;

const gardenCopies: Record<'es' | 'pt-BR' | 'fr' | 'de', LocalizedGameCopy> = {
  es: {
    title: 'Mahjong Connect Jardín',
    description: 'Un tranquilo tablero 2D de Mahjong Connect con esquinas abiertas y la regla clásica de dos giros. Gratis, sin tiempo y jugable en el navegador.',
    content: {
      intro: 'Mahjong Connect Jardín es una variante independiente de Mahjong Connect con tablero plano. Su marco con forma de jardín conserva la regla conocida —unir fichas idénticas con una ruta de no más de dos giros—, mientras que las esquinas abiertas crean un rompecabezas distinto al rectángulo clásico.',
      howToPlay: ['Selecciona dos fichas idénticas. Se eliminan si un camino vacío las une con un máximo de dos giros.', 'Las esquinas vacías del jardín forman parte del tablero, así que las rutas pueden pasar por ellas o por el borde exterior.', 'Elimina todas las fichas para terminar. Esta variante no tiene cronómetro, así que puedes estudiar las rutas con calma.'],
      tips: ['Usa las esquinas abiertas como carriles, pero no gastes todas las parejas fáciles del borde de inmediato.', 'Una ficha central suele ganar varias rutas cuando se elimina una pareja vecina; alterna entre el marco y el centro.', 'Las pistas muestran una conexión legal: úsalas para aprender la forma del tablero, no para apresurar la partida.'],
      faq: [{ question: '¿En qué se diferencia Jardín del Mahjong Connect clásico?', answer: 'Ambos usan la regla de conexión de dos giros. Jardín tiene un tablero 2D con forma y carriles de esquina abiertos, en lugar del rectángulo completo del clásico, por lo que las rutas evolucionan de otra forma.' }, { question: '¿Jardín sustituye al tablero clásico?', answer: 'No. Es una variante independiente con su propia página; el modo clásico sigue disponible con tamaños relajado, clásico y experto.' }]
    }
  },
  'pt-BR': {
    title: 'Mahjong Connect Jardim',
    description: 'Um tranquilo tabuleiro 2D de Mahjong Connect, com cantos abertos e a regra clássica de até duas curvas. Grátis, sem tempo e jogável no navegador.',
    content: {
      intro: 'Mahjong Connect Jardim é uma variação independente de Mahjong Connect com tabuleiro plano. Sua moldura em forma de jardim mantém a regra familiar — combinar peças iguais por um caminho de no máximo duas curvas —, enquanto os cantos abertos criam um quebra-cabeça diferente do retângulo clássico.',
      howToPlay: ['Selecione duas peças idênticas. Elas somem quando um caminho vazio as liga com no máximo duas curvas.', 'Os cantos vazios do jardim fazem parte do espaço do tabuleiro; os caminhos podem passar por eles ou pela borda externa.', 'Limpe todas as peças para terminar. Esta variação não tem cronômetro, então você pode observar as rotas com calma.'],
      tips: ['Use as aberturas dos cantos como corredores, mas não gaste todos os pares fáceis da borda de imediato.', 'Uma peça central costuma ganhar várias rotas depois que um par vizinho sai; alterne entre a moldura e o centro.', 'As dicas mostram uma conexão válida. Use-as para entender o formato do tabuleiro, não para apressar a limpeza.'],
      faq: [{ question: 'Qual é a diferença entre Jardim e Mahjong Connect Clássico?', answer: 'Os dois usam a regra de conexão com duas curvas. Jardim usa um tabuleiro 2D com formato e corredores de canto abertos, em vez do retângulo completo do Clássico; por isso as rotas mudam de modo diferente.' }, { question: 'Jardim substitui o tabuleiro clássico?', answer: 'Não. É uma variação separada, com página própria; o Clássico continua disponível nos tamanhos relaxado, clássico e especialista.' }]
    }
  },
  fr: {
    title: 'Mahjong Connect Jardin',
    description: 'Un plateau 2D apaisant de Mahjong Connect, avec des coins ouverts et la règle classique des deux virages. Gratuit, sans chrono et jouable dans le navigateur.',
    content: {
      intro: 'Mahjong Connect Jardin est une variation distincte de Mahjong Connect sur plateau plat. Son cadre en forme de jardin conserve la règle familière — relier des tuiles identiques par un chemin de deux virages maximum —, tandis que les coins ouverts créent une énigme différente du rectangle classique.',
      howToPlay: ['Sélectionnez deux tuiles identiques. Elles disparaissent lorsqu’un chemin vide les relie avec deux virages au maximum.', 'Les coins vides du jardin font partie de l’espace de jeu : les chemins peuvent les traverser ou contourner le bord extérieur.', 'Retirez toutes les tuiles pour finir. Cette variation est sans chrono, vous pouvez donc examiner les chemins tranquillement.'],
      tips: ['Utilisez les ouvertures des coins comme couloirs, sans dépenser immédiatement toutes les paires faciles du bord.', 'Une tuile centrale gagne souvent plusieurs chemins après la disparition d’une paire voisine : alternez entre le cadre et le centre.', 'Les indices montrent une liaison valide. Servez-vous-en pour comprendre la forme du plateau, pas pour vous précipiter.'],
      faq: [{ question: 'Quelle différence entre Jardin et Mahjong Connect classique ?', answer: 'Les deux emploient la règle de connexion à deux virages. Jardin utilise un plateau 2D façonné, avec des couloirs de coin ouverts, au lieu du rectangle plein du Classique ; les chemins possibles évoluent donc différemment.' }, { question: 'Jardin remplace-t-il le plateau classique ?', answer: 'Non. C’est une variation séparée avec sa propre page ; le Classique reste disponible avec les tailles détendue, classique et expert.' }]
    }
  },
  de: {
    title: 'Mahjong Connect Garten',
    description: 'Ein ruhiges 2D-Mahjong-Connect-Brett mit offenen Ecken und der klassischen Regel von höchstens zwei Wendungen. Kostenlos, ohne Zeitlimit und im Browser spielbar.',
    content: {
      intro: 'Mahjong Connect Garten ist eine eigenständige Flachbrett-Variante von Mahjong Connect. Der geformte Gartenrahmen behält die vertraute Regel bei — gleiche Steine mit einem Weg von höchstens zwei Wendungen verbinden —, während offene Ecken ein anderes Routenrätsel als das klassische Rechteck schaffen.',
      howToPlay: ['Wähle zwei gleiche Steine. Sie verschwinden, wenn ein leerer Weg sie mit höchstens zwei Wendungen verbindet.', 'Die leeren Gartenecken gehören zum Spielraum; Wege dürfen durch sie oder um den äußeren Rand führen.', 'Räume alle Steine ab, um zu gewinnen. Diese Variante hat kein Zeitlimit, sodass du die offenen Wege in Ruhe prüfen kannst.'],
      tips: ['Nutze die offenen Ecken als Routen, aber nimm nicht sofort jedes einfache Randpaar weg.', 'Ein Stein in der Mitte gewinnt nach dem Entfernen eines Nachbarpaars oft mehrere Wege. Wechsle zwischen Rahmen und Mitte.', 'Hinweise zeigen eine erlaubte Verbindung. Nutze sie, um die Brettform zu lernen, nicht um die Partie zu überstürzen.'],
      faq: [{ question: 'Wie unterscheidet sich Garten von klassischem Mahjong Connect?', answer: 'Beide verwenden die Zwei-Wendungen-Regel. Garten hat ein geformtes 2D-Brett mit offenen Eckrouten statt des vollständigen Rechtecks von Klassisch, daher entwickeln sich die möglichen Wege anders.' }, { question: 'Ersetzt Garten das klassische Brett?', answer: 'Nein. Es ist eine separate Variante mit eigener Seite; Klassisch bleibt mit den Brettgrößen Entspannt, Klassisch und Experte verfügbar.' }]
    }
  }
};

export function localizeGame(game: GameConfig, locale: string): GameConfig {
  if (game.slug !== 'mahjong-connect-garden') return game;
  const copy = gardenCopies[locale as keyof typeof gardenCopies];
  return copy ? { ...game, ...copy } : game;
}
