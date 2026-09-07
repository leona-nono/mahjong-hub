/**
 * Writes fr / de / pt-BR game locale JSON (es already written).
 * Run: node scripts/_write-eu-games-i18n.mjs
 * Delete after use (one-shot).
 */
import { readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '../data/games-i18n');
const zh = JSON.parse(readFileSync(join(outDir, 'zh.json'), 'utf8'));
const zhSlugs = Object.keys(zh);

/** @typedef {{ title: string, description: string, content?: object }} Entry */

/** @type {Record<string, Entry>} */
const fr = {
  'hong-kong-mahjong': {
    title: 'Mahjong de Hong Kong',
    description:
      'Jouez au vrai mahjong à quatre contre trois adversaires. Comptage style ancien de Hong Kong, gratuit, sans téléchargement.',
    content: {
      intro:
        'Le mahjong de Hong Kong sur Mahjong Hub est un règlement produit à quatre joueurs basé sur le style ancien de Hong Kong. Il utilise les tuiles de caractère, de point, de bambou, de vent et les trois dragons — rouge, vert et blanc ; fleurs et saisons sont volontairement exclues. Composez quatre combinaisons et une paire, puis choisissez le mode Casual pour des mains simples adaptées aux débutants, ou le mode Standard avec le minimum traditionnel de trois faan.',
      howToPlay: [
        'Le mur produit de 136 tuiles contient les tuiles de caractère, de point, de bambou, de vent et les dragons rouge, vert et blanc. Les fleurs et saisons ne sont pas utilisées.',
        'Chaque joueur commence avec 13 tuiles ; l’Est commence avec 14 et effectue le premier jet. Aux tours suivants, piochez une tuile puis jetez-en une, en gardant la main à 13.',
        'Une main gagnante compte quatre combinaisons plus une paire. Une combinaison est soit trois tuiles identiques, soit trois tuiles consécutives du même couleur.',
        'Lorsqu’un adversaire jette une tuile dont vous avez besoin, vous pouvez la réclamer : Pong pour un triplet, Chow pour une séquence (uniquement du joueur à votre gauche), ou Kong pour les quatre exemplaires.',
        'Réclamer une tuile ouvre votre main et vous fait perdre certains motifs de score. Ne le faites que lorsque cela fait vraiment avancer votre jeu.',
        'Déclarez la victoire par pioche ou sur un jet adverse. Le mode Casual accepte toute main complète de quatre combinaisons et une paire ; le mode Standard exige au moins trois faan.',
        'Après le règlement, l’Est conserve la place de donneur après une victoire du donneur ou une partie nulle ; sinon la donne passe au siège suivant.'
      ],
      tips: [
        'Jetez tôt les tuiles d’honneur isolées. Ce sont les plus difficiles à apparier et les moins flexibles de votre main.',
        'Suivez la distance jusqu’à la main en attente plutôt que de fixer des tuiles isolées. Deux d’écart est une position normale en milieu de partie ; à un, jouez avec prudence.',
        'Une main en couleur pure vaut bien plus que la somme de ses parties. Avec sept ou huit tuiles d’une même couleur en départ, s’engager tôt paie souvent.',
        'Observez les autres sièges. Si trois joueurs jettent la même couleur, les tuiles dont vous avez besoin sont probablement encore en jeu.',
        'En mode Standard, vérifiez le total de faan avant une réclamation : une forme complète sous trois faan n’est pas une victoire légale.'
      ],
      features: [
        'Règles authentiques du style ancien de Hong Kong avec 136 tuiles — tuiles de caractère, de point, de bambou, de vent et de dragon uniquement.',
        'Mode Casual pour apprendre les mains complètes sans seuil de faan ; mode Standard appliquant le minimum traditionnel de trois faan.',
        'Trois adversaires IA au discard raisonnable pour s’entraîner au rythme réel à quatre.',
        'Indice optionnel de main en attente et détail des faan après la main pour apprendre le score sans ouvrir le règlement.',
        'Jeu complet dans le navigateur sur ordinateur et mobile — touchez ou cliquez pour jeter, réclamer et déclarer la victoire.'
      ],
      supportedDevices:
        'Le mahjong de Hong Kong fonctionne dans tout navigateur moderne sur Windows, macOS, Linux, Android et iOS, sans téléchargement. Le mode paysage sur téléphone ou tablette offre la vue la plus large ; le portrait fonctionne aussi avec des mains défilables. Chrome, Safari, Firefox et Edge sont pris en charge — utilisez un navigateur à jour pour des animations fluides lors des réclamations et du règlement.',
      faq: [
        {
          question: 'Dois-je télécharger quelque chose ?',
          answer:
            'Non. Le jeu s’exécute entièrement dans votre navigateur sur ordinateur et mobile, sans installation.'
        },
        {
          question: 'S’agit-il du vrai mahjong ou du jeu d’appariement ?',
          answer:
            'C’est du vrai mahjong à quatre joueurs, avec pioche, jet, réclamations et score. Le jeu d’appariement que beaucoup de sites occidentaux appellent « mahjong » est le solitaire de mahjong, un jeu différent.'
        },
        {
          question: 'Quelle est la différence entre Casual et Standard ?',
          answer:
            'Le mode Casual permet de gagner avec toute main structurellement complète et attribue une main « chicken » d’un faan lorsqu’aucun autre motif ne marque. Le mode Standard de Hong Kong exige au moins trois faan : une main complète de moindre valeur doit continuer à jouer.'
        },
        {
          question: 'Y a-t-il des paris d’argent réel ?',
          answer:
            'Non. Aucune mise, aucune monnaie achetable ni aucun prix en espèces. Les scores ne suivent que votre propre progression.'
        }
      ]
    }
  },
  'riichi-mahjong': {
    title: 'Mahjong Riichi',
    description:
      'Mahjong Riichi japonais contre trois adversaires. Le règlement de la scène compétitive moderne.',
    content: {
      intro:
        'Cette table Riichi japonaise à quatre suit la base approuvée du World Riichi Championship 2025 : pas de cinq rouges, un seul vainqueur en cas de collision de têtes, et un départ à 30 000 points.',
      howToPlay: [
        'Chaque joueur commence avec 13 tuiles. Piochez-en une et jetez-en une, en visant quatre combinaisons et une paire ; Sept paires et Treize orphelins sont aussi des formes fermées valides.',
        'Une forme complète ne suffit pas : la main doit avoir au moins un yaku. Dora ajoute de la valeur mais n’est pas un yaku à elle seule.',
        'Le Chow n’est disponible que depuis le joueur à votre gauche. Pong, Kong et Ron peuvent être réclamés de tout adversaire, selon la priorité de réclamation.',
        'Gardez la main fermée et atteignez la main en attente pour déclarer Riichi. Choisissez un jet surligné et placez un bâton de 1 000 points.',
        'Gagnez par Tsumo sur votre propre pioche ou par Ron sur un jet adverse. Sous le head-bump WRC, seul le premier vainqueur dans l’ordre des tours reçoit le Ron.',
        'La partie parcourt les tours Est et Sud. Dans cette base produit, une victoire du donneur ou une partie nulle exhaustive conserve le donneur ; les parties nulles exhaustives utilisent un paiement noten de 3 000 points.',
        'Cette table utilise 136 tuiles, un mur mort de 14 tuiles, des indicateurs Dora et aucun cinq rouge.'
      ],
      tips: [
        'Sécurisez un yaku avant de chasser Dora : les tuiles bonus ne légalisent pas une main sans yaku.',
        'Comparez le shanten et les tuiles utiles avant chaque jet ; conservez les formes avec le plus de pioches améliorantes.',
        'Face à un Riichi, commencez par genbutsu, puis utilisez suji et le mur visible pour réduire le risque.',
        'Déclarez Riichi délibérément : comparez la qualité de l’attente, la valeur de la main, les tuiles restantes et le score de la partie.',
        'Ne forcez pas d’attaques à faible valeur en fin de main lorsqu’un fold plus sûr protège votre position.'
      ],
      features: [
        'Base World Riichi Championship 2025 — pas de cinq rouges, Ron en head-bump et départ à 30 000 points.',
        'Seuil yaku complet, indicateurs Dora et mur mort de 14 tuiles pour un flux compétitif authentique.',
        'Déclaration Riichi avec bâton de 1 000 points, victoires Tsumo et Ron avec priorité d’ordre de tour.',
        'L’indice de main en attente suit le shanten pour apprendre la main en attente sans compter les tuiles à l’aveugle.',
        'Tours Est et Sud avec maintien du donneur sur victoire du donneur et parties nulles exhaustives.'
      ],
      supportedDevices:
        'Le mahjong Riichi se joue dans le navigateur sur ordinateur, portable, tablette et téléphone, sans installer d’application. Le paysage mobile est recommandé pour lire ensemble les jets adverses et votre main. Navigateurs pris en charge : Chrome, Safari, Firefox et Edge actuels sur Windows, macOS, Linux, Android et iOS.',
      faq: [
        {
          question: 'En quoi le Riichi diffère-t-il du mahjong chinois ?',
          answer:
            'Le Riichi exige un motif de score avant de déclarer la victoire, valorise davantage les mains fermées et utilise une grille de score différente. Le cœur piocher-et-jeter est le même, aussi les deux se transfèrent facilement.'
        },
        {
          question: 'Est-ce un bon endroit pour apprendre le Riichi ?',
          answer:
            'C’est un bon endroit pour se familiariser avec le flux, les réclamations et les motifs courants. L’indice de main en attente montre à quelle distance vous êtes d’une main complète — l’information la plus utile pour un débutant.'
        }
      ]
    }
  },
  'chinese-official-mahjong': {
    title: 'Mahjong officiel chinois',
    description:
      'Table d’entraînement au mahjong officiel chinois (MCR) — 144 tuiles, remplacement des fleurs et seuil de victoire à huit points.',
    content: {
      intro:
        'Voici notre table d’entraînement au mahjong officiel chinois (MCR). Elle utilise déjà 144 tuiles, expose et remplace fleurs et saisons, et applique le seuil de victoire à huit points. Le marqueur complet des 81 éléments de compétition et ses règles d’exclusion sont encore en développement ; cette page ne doit pas servir d’arbitre de tournoi.',
      howToPlay: [
        'Mahjong standard à quatre : piochez, jetez et formez quatre combinaisons plus une paire.',
        'Révélez chaque fleur ou saison immédiatement dans la zone Fleurs, puis prenez un remplacement depuis l’arrière du mur.',
        'Une main doit valoir au moins huit points qualifiants avant d’être déclarée. Les points de fleur ne satisfont pas ce seuil à eux seuls.',
        'Le marqueur actuel ne couvre qu’un sous-ensemble d’entraînement ; utilisez le résultat pour apprendre le flux des tours, non pour certifier un score de compétition.'
      ],
      tips: [
        'Traitez cette version comme une table d’entraînement pendant l’ajout des 81 éléments officiels de score.',
        'Une main à une tuile de la complétion mais sous huit points qualifiants n’est pas une victoire légale ; continuez d’améliorer sa structure de score.',
        'Quand le marqueur complet arrivera, il expliquera les éléments inclus et exclus, plutôt que d’additionner simplement chaque motif visible.'
      ],
      features: [
        'Table d’entraînement MCR à 144 tuiles avec flux de remplacement fleurs et saisons.',
        'Seuil minimum de huit points pour enseigner tôt l’adjudication de compétition.',
        'Pioche et jet à quatre contre l’IA avec réclamations de combinaisons standard.',
        'Le marqueur d’entraînement couvre un sous-ensemble initial de motifs pendant la construction de la table complète à 81 éléments.',
        'Retour clair à l’écran lorsqu’une main complète est sous le seuil de huit points.'
      ],
      supportedDevices:
        'Le mahjong officiel chinois fonctionne entièrement dans le navigateur sur Windows, macOS, Linux, Android et iOS. Ordinateur et tablette facilitent la lecture du remplacement des fleurs et du retour de score ; les téléphones fonctionnent dans les deux orientations. Utilisez un Chrome, Safari, Firefox ou Edge à jour pour de meilleures performances pendant les tours multijoueurs.',
      faq: [
        {
          question: 'Pourquoi ne puis-je pas déclarer la victoire sur une main complète ?',
          answer:
            'Le officiel chinois exige un minimum de huit points. Si votre main complète marque moins, la victoire ne peut être déclarée et le jeu continue.'
        },
        {
          question: 'Le scoring ici est-il complet ?',
          answer:
            'Non. Cette version d’entraînement implémente le flux 144 tuiles et remplacement des fleurs plus un sous-ensemble initial de score. La table officielle complète des 81 éléments et ses exclusions sont encore en cours d’implémentation.'
        }
      ]
    }
  },
  'sichuan-mahjong': {
    title: 'Mahjong du Sichuan',
    description:
      'Mahjong Blood Battle du Sichuan avec Exchange Three, une couleur interdite et poursuite du jeu après la première victoire.',
    content: {
      intro:
        'Le mahjong du Sichuan sur Mahjong Hub suit la base Chengdu Blood Battle to the End : trois couleurs seulement, Exchange Three, une couleur interdite, pas de Chow, et le jeu continue après la première victoire.',
      howToPlay: [
        'Le mur de 108 tuiles n’utilise que les tuiles de caractère, de point et de bambou. Vents, dragons, fleurs et saisons ne sont pas utilisés.',
        'Avant le jeu normal, sélectionnez trois tuiles d’une même couleur pour Exchange Three ; la table les passe dans la direction choisie pour cette main.',
        'Choisissez une couleur interdite. Vous devez jeter toutes les tuiles de cette couleur avant de pouvoir déclarer la victoire.',
        'Piochez et jetez normalement. Le Chow n’est pas autorisé ; Pong et Kong le sont selon l’ordre de réclamation de la table.',
        'Formez quatre combinaisons et une paire, ou une main spéciale approuvée comme Sept paires, puis gagnez par victoire par pioche ou sur un jet légal.',
        'Un vainqueur cesse de piocher, mais la main continue pour les autres. Le règlement de fin de main inclut la vérification de main en attente, la pénalité flower-pig et le remboursement de Kong.'
      ],
      tips: [
        'Choisissez la couleur interdite selon celle que vous pouvez vider le plus vite, pas seulement celle au plus bas nombre de tuiles.',
        'Exchange Three doit retirer trois tuiles d’une couleur faible cohérente pour ne pas créer trois tuiles mortes sans lien.',
        'Sans Chow, les paires et formes connectées valent davantage que dans les variantes avec Chow.',
        'Après la victoire d’un autre joueur, réévaluez le risque : rester en main en attente compte pour le contrôle de fin de main, mais évitez de devenir flower pig.',
        'Suivez l’exposition des Kong et le règlement. Un Kong de haute valeur n’est pas automatiquement sûr s’il ouvre une pioche dangereuse.'
      ],
      features: [
        'Base Chengdu Blood Battle — 108 tuiles, Exchange Three et une couleur interdite personnelle.',
        'Pas de Chow : Pong et Kong seulement, au tempo rapide des tables sichuanaises contre trois sièges IA.',
        'Le flux Blood Battle continue après la première victoire, avec contrôle de main en attente et pénalités en fin de main.',
        'Exchange Three interactif et sélecteur de couleur interdite avant chaque main.',
        'Victoires par pioche et sur jet, avec Sept paires et formes standard à quatre combinaisons.'
      ],
      supportedDevices:
        'Le mahjong du Sichuan fonctionne dans les navigateurs modernes sur ordinateur, portable, tablette et téléphone, sans installation. La vue paysage mobile convient le mieux aux contrôles d’échange et de couleur interdite. Chrome, Safari, Firefox et Edge sur Windows, macOS, Linux, Android et iOS sont pris en charge.',
      faq: [
        {
          question: 'Pourquoi ne puis-je pas gagner tant que je détiens ma couleur interdite ?',
          answer:
            'La règle de la couleur interdite est une condition centrale du Blood Battle de Chengdu. Videz toutes les tuiles de la couleur choisie avant de déclarer la victoire.'
        },
        {
          question: 'Pourquoi le jeu continue-t-il après qu’un joueur a gagné ?',
          answer:
            'Blood Battle to the End permet aux joueurs restants de continuer. Plusieurs vainqueurs ou pénalités peuvent ainsi apparaître dans une même main.'
        }
      ]
    }
  },
  'taiwan-mahjong': {
    title: 'Mahjong de Taïwan',
    description:
      'Mahjong taïwanais à 16 tuiles avec remplacement des fleurs et score basé sur le Tai.',
    content: {
      intro:
        'Le mahjong de Taïwan sur Mahjong Hub est une version détendue à 16 tuiles : mur de 144 avec fleurs et saisons, cinq combinaisons plus une paire pour gagner, score Tai additif, et minimum de 0 Tai pour les débutants.',
      howToPlay: [
        'Utilisez les 144 tuiles. Chaque non-donneur commence avec 16 tuiles ; l’Est commence avec 17 et effectue le premier jet.',
        'Révélez chaque fleur ou saison immédiatement et piochez un remplacement. Elle reste hors de votre main de 16 tuiles et ajoute du Tai le cas échéant.',
        'À votre tour, piochez une tuile et jetez-en une. Vous pouvez faire Chow du joueur de gauche, ou Pong et Kong selon l’ordre de réclamation.',
        'Gagnez avec cinq combinaisons et une paire, soit une main de 17 tuiles. Victoire par pioche et sur jet sont toutes deux prises en charge.',
        'Les motifs Tai s’additionnent au règlement. Cette base débutant Mahjong Hub permet de gagner avec une main complète à 0 Tai.'
      ],
      tips: [
        'Avec 16 tuiles cachées, conservez plusieurs formes connectées tôt au lieu de figer une seule attente trop vite.',
        'Les fleurs ajoutent de la valeur mais ne réparent pas une main principale faible ; construisez d’abord la structure à cinq combinaisons.',
        'Les Kong sont plus fréquents au mahjong de Taïwan. Pesez à la fois la pioche de remplacement et l’information que vous révélez.',
        'Utilisez le mode 0 Tai pour apprendre le tempo ; une fois à l’aise, ne chasez le Tai que s’il ne réduit pas vos attentes vivantes.',
        'Vérifiez si votre fleur correspond à votre siège : les fleurs de siège peuvent ajouter un bonus de score.'
      ],
      features: [
        'Mains taïwanaises à 16 tuiles avec cinq combinaisons plus une paire et mur de 144 incluant les fleurs.',
        'Remplacement immédiat des fleurs avec bonus Tai et options de score fleur de siège.',
        'Réclamations Chow, Pong et Kong avec règlement Tai additif à chaque victoire.',
        'Minimum 0 Tai adapté aux débutants pour apprendre le tempo avant de chasser les motifs à haut Tai.',
        'Table à quatre contre l’IA avec victoires par pioche et sur jet.'
      ],
      supportedDevices:
        'Le mahjong de Taïwan se joue dans le navigateur sur Windows, macOS, Linux, Android et iOS. Tablettes et ordinateurs facilitent la lecture de la grande main à 16 tuiles ; les téléphones fonctionnent en portrait ou paysage. Utilisez Chrome, Safari, Firefox ou Edge actuels pour des taps réactifs et des animations fluides de remplacement des fleurs.',
      faq: [
        {
          question: 'Pourquoi ai-je 16 tuiles au lieu de 13 ?',
          answer:
            'Le mahjong de Taïwan utilise cinq combinaisons plus une paire. Les joueurs détiennent normalement 16 tuiles et gagnent après avoir pioché ou réclamé la 17e.'
        },
        {
          question: 'Une main à 0 Tai peut-elle gagner ici ?',
          answer:
            'Oui. Mahjong Hub utilise une base détendue à 0 Tai. D’autres tables taïwanaises peuvent exiger un Tai minimum ; cela est indiqué clairement dans les paramètres du jeu.'
        }
      ]
    }
  },
  'american-mahjong': {
    title: 'Mahjong américain',
    description:
      'Mahjong américain avec Charleston, jokers, fleurs et motifs de victoire basés sur une carte.',
    content: {
      intro:
        'Le mahjong américain de Mahjong Hub est un jeu original de carte d’entraînement inspiré du flux style NMJL : 152 tuiles, Charleston, fleurs, jokers, groupes exposés et victoires par motif exact de carte. Il ne reproduit pas une carte annuelle NMJL en vigueur.',
      howToPlay: [
        'Utilisez un set de 152 tuiles avec tuiles standard, huit fleurs et huit jokers. Chaque joueur prend 13 tuiles ; l’Est en prend 14 et jette en premier.',
        'Lisez la carte d’entraînement originale, puis complétez le Charleston : passez trois tuiles à droite, en face et à gauche. Un second Charleston et le passe de courtoisie sont des options de table.',
        'Piochez et jetez en visant une ligne exacte de la carte d’entraînement, non une forme générique de quatre combinaisons et une paire.',
        'Exposez des Pong, Kong ou groupes plus grands légaux lorsque la ligne de carte choisie le permet. Les lignes cachées de la carte ne peuvent pas être exposées avant la victoire finale.',
        'Utilisez un joker uniquement dans un groupe de trois ou plus ; jamais comme tuile seule ou paire. À votre tour, une tuile naturelle peut échanger un joker dans une exposition adverse.',
        'Déclarez Mah Jongg seulement lorsque les 14 tuiles correspondent exactement à une ligne légale de la carte d’entraînement originale.'
      ],
      tips: [
        'Avant le Charleston, gardez deux ou trois lignes de carte compatibles ouvertes plutôt que de vous engager sur une seule ligne rare.',
        'Passez les tuiles qui ne soutiennent aucune de vos catégories de carte probables, mais ne passez jamais un joker.',
        'N’exposez pas un groupe seulement parce que vous le pouvez : l’exposition signale votre cible et peut rendre impossible de pivoter la main.',
        'Traitez les jokers comme accélérateurs de groupe, non comme jokers universels ; vous avez toujours besoin de tuiles naturelles pour les singles et paires.',
        'Utilisez les expositions adverses pour décider quelles tuiles naturelles sont sûres à jeter et quand un échange de joker est utile.'
      ],
      features: [
        'Set style américain de 152 tuiles avec fleurs, jokers et passes Charleston inspirées du NMJL.',
        'Cartes d’entraînement originales Mahjong Hub — victoires par motif exact, pas de formes génériques de combinaison.',
        'Groupes légaux avec joker, échange de joker à votre tour et règles d’exposition liées à la ligne de carte.',
        'Second Charleston optionnel et passe de courtoisie pour des sessions d’entraînement style table.',
        'Table à quatre dans le navigateur avec Charleston guidé et validation du motif de carte.'
      ],
      supportedDevices:
        'Le mahjong américain fonctionne entièrement dans le navigateur sur ordinateur et mobile, sans télécharger d’application. Un écran large aide à lire ensemble la carte d’entraînement et les expositions ; les téléphones passent en paysage pour la disposition complète de la table. Compatible avec Chrome, Safari, Firefox et Edge sur Windows, macOS, Linux, Android et iOS.',
      faq: [
        {
          question: 'S’agit-il de la carte annuelle officielle NMJL ?',
          answer:
            'Non. Ce jeu utilise des cartes d’entraînement originales Mahjong Hub. Une intégration sous licence de carte NMJL serait un produit futur distinct.'
        },
        {
          question: 'Un joker peut-il être utilisé dans une paire ?',
          answer:
            'Non. Dans cette base de règles, les jokers ne sont légaux que dans des groupes de trois ou plus, jamais en singles ni en paires.'
        }
      ]
    }
  },
  'mahjong-connect-classic': {
    title: 'Mahjong Connect',
    description:
      'Reliez des paires de tuiles identiques par un chemin qui tourne au plus deux fois. Trois tailles de plateau, indices, et pas de minuteur en mode détendu.',
    content: {
      intro:
        'Mahjong Connect, aussi connu sous le nom d’Onet, est le puzzle de liaison construit avec des tuiles de mahjong. Videz tout le plateau en joignant des paires identiques par un chemin qui ne plie pas plus de deux fois. Le mode détendu n’a pas d’horloge si vous préférez prendre votre temps.',
      howToPlay: [
        'Touchez ou cliquez deux tuiles montrant la même face.',
        'La paire disparaît si elles peuvent être jointes par un chemin d’espace vide qui tourne au plus deux fois. Le chemin peut longer le bord extérieur du plateau.',
        'Videz toutes les tuiles pour gagner. Les correspondances consécutives construisent un bonus de série.',
        'S’il n’y a aucune paire jouable, le plateau se mélange automatiquement pour que vous ne soyez jamais bloqué.'
      ],
      tips: [
        'Travaillez d’abord les bords. Les tuiles extérieures ont le plus de routes et ouvrent le centre en disparaissant.',
        'Deux tuiles identiques côte à côte sont toujours jouables — mais les enlever peut être le seul moyen d’ouvrir un chemin ailleurs : regardez avant de prendre la correspondance gratuite.',
        'Le bouton d’indice coûte quelques points. Sur les plateaux chronométrés, cet échange en vaut presque toujours la peine.'
      ],
      features: [
        'Appariement classique style Onet avec faces authentiques de tuile de mahjong.',
        'Trois tailles de plateau, du compact aux défis en grille complète.',
        'Mode détendu sans minuteur et plateaux chronométrés avec score de série.',
        'Remélange automatique lorsqu’aucune paire n’est jouable — les plateaux ne mènent jamais à une impasse.',
        'Système d’indices et bonus de série pour des sessions plus longues.'
      ],
      supportedDevices:
        'Mahjong Connect fonctionne dans tout navigateur moderne sur ordinateur, tablette et téléphone, sans installation. Les taps tactiles sur mobile et le clic sur ordinateur fonctionnent sur le même plateau. Chrome, Safari, Firefox et Edge sur Windows, macOS, Linux, Android et iOS sont pris en charge ; un écran de téléphone moyen accueille confortablement le plateau par défaut en portrait.',
      faq: [
        {
          question: 'En quoi cela diffère-t-il du solitaire de mahjong ?',
          answer:
            'Le solitaire empile les tuiles en couches et vous appariez des tuiles libres d’un côté. Connect les dispose à plat et demande de joindre des paires par un chemin. Puzzle différent, mêmes tuiles.'
        },
        {
          question: 'Qu’est-ce qui compte comme un virage dans le chemin ?',
          answer:
            'Chaque changement de direction. Une ligne droite n’a aucun virage, un L en a un, et un Z ou U en a deux. Trois ou plus ne sont pas autorisés.'
        }
      ]
    }
  },
  'mahjong-solitaire-classic': {
    title: 'Mahjong Solitaire Classic',
    description:
      'Le classique puzzle d’appariement en couches. Dispositions tortue et pyramide, parties garanties résolubles, indices et annulation.',
    content: {
      intro:
        'Mahjong Solitaire est le classique puzzle solo d’appariement construit avec des tuiles de mahjong. Videz toute la disposition en appariant des tuiles identiques libres : rien au-dessus et au moins un côté ouvert. Chaque donne ici est générée résoluble, aussi une clairance complète existe toujours. Deux formes classiques sont incluses — la tortue et la pyramide — plus indices, annulation et remélange lorsque vous vous coinçez.',
      howToPlay: [
        'Touchez deux tuiles de même face pour les apparier. Une tuile ne peut être appariée que si elle est libre : rien au-dessus et ouverte d’au moins un côté à son propre niveau.',
        'Les tuiles couvrent celles directement en dessous : videz une pile du haut vers le bas. La couche supérieure est toujours disponible ; les couches inférieures s’ouvrent au fur et à mesure.',
        'Videz toutes les tuiles pour gagner. La tortue déploie une large carapace ; la pyramide empile cinq triangles centrés que l’on pèle des bords vers l’intérieur.',
        'Chaque donne est générée résoluble, aussi une solution existe toujours. Utilisez les indices si vous êtes bloqué, annulez un appariement précipité ou remélangez pour redistribuer les tuiles restantes.',
        'Il n’y a ni minuteur ni pression de score — prenez tout le temps voulu.'
      ],
      tips: [
        'Travaillez d’abord l’extérieur. Une tuile sur le bord extérieur d’une couche a un côté ouvert gratuitement ; vider le périmètre ouvre le centre.',
        'Avant de prendre une paire évidente, regardez ce qu’elle libère. Deux tuiles identiques adjacentes sont un appariement facile, mais les enlever peut être le seul moyen de débloquer une pile supérieure.',
        'Tirez parti des niveaux de la pyramide : ses tuiles de bord sont jouables dès le départ, et le sommet n’est atteignable qu’une fois sa couche atteinte.',
        'Si vous manquez d’appariements, remélangez plutôt que de recommencer — les tuiles restantes sont redistribuées dans un arrangement résoluble frais.'
      ],
      features: [
        'Solitaire de mahjong en couches avec dispositions tortue et pyramide.',
        'Chaque donne est générée à rebours et résoluble — une clairance complète est toujours possible.',
        'Règles d’appariement de tuiles libres avec surbrillance visuelle des paires jouables.',
        'Indices, annulation et remélange lorsque vous voulez un second regard sans recommencer.',
        'Défi quotidien, niveaux de campagne et mode détendu sans minuteur.'
      ],
      supportedDevices:
        'Mahjong Solitaire Classic fonctionne dans le navigateur sur Windows, macOS, Linux, Android et iOS, sans téléchargement. Ordinateur et tablette montrent la disposition complète en couches ; les téléphones défilent naturellement sur les piles hautes de la tortue. Chrome, Safari, Firefox et Edge sont pris en charge — la progression invité se sauvegarde localement sur votre appareil.',
      faq: [
        {
          question: 'En quoi cela diffère-t-il de Mahjong Connect ?',
          answer:
            'Connect dispose les tuiles à plat et demande de joindre des paires correspondantes par un chemin. Le solitaire les empile en couches et vous appariez des tuiles libres d’un côté et découvertes au-dessus. Puzzle différent, mêmes tuiles.'
        },
        {
          question: 'Que signifie « libre » ici ?',
          answer:
            'Une tuile est libre lorsque rien ne repose directement dessus et qu’au moins un de ses voisins gauche ou droit au même niveau est vide. Les tuiles du bord extérieur d’une couche sont toujours libres du côté extérieur.'
        },
        {
          question: 'Chaque partie est-elle garantie résoluble ?',
          answer:
            'Oui. Les donnes sont construites à rebours — le jeu choisit répétitivement deux tuiles libres, les retire et enregistre l’appariement — ainsi chaque disposition a un chemin de solution connu que vous pouvez trouver avec réflexion.'
        },
        {
          question: 'Y a-t-il des paris d’argent réel ?',
          answer:
            'Non. C’est un puzzle pur, sans mise, sans monnaie achetable ni prix en espèces d’aucune sorte.'
        }
      ]
    }
  },
  'mahjong-connect': {
    title: 'Mahjong Connect Lite',
    description:
      'Appariez des paires de tuiles de mahjong libres reliées par un chemin. Un jeu d’élimination relaxant style connect.'
  },
  'mahjong-classic': {
    title: 'Mahjong Classic',
    description:
      'Le solitaire de mahjong intemporel. Videz le plateau en appariant des paires de tuiles ouvertes.'
  },
  'mahjong-solitaire': {
    title: 'Mahjong Solitaire',
    description:
      'Une belle disposition solitaire de tuiles de mahjong. Appariez et videz la tour à votre rythme.'
  },
  'mahjong-3d': {
    title: 'Mahjong 3D',
    description:
      'Une approche tridimensionnelle de l’appariement mahjong, avec profondeur et une palette arc-en-ciel apaisante.'
  },
  'onet-connect-classic': {
    title: 'Onet Connect Classic',
    description:
      'Le classique jeu de liaison Onet. Reliez des tuiles identiques avec une ligne d’au plus deux virages.'
  },
  'bee-connect': {
    title: 'Bee Connect',
    description:
      'Un connect au thème abeille. Reliez les petites tuiles et videz le plateau en nid d’abeille.'
  },
  'aloha-mahjong': {
    title: 'Aloha Mahjong',
    description:
      'Une touche tropicale sur l’appariement mahjong, ambiance ensoleillée et détendue.'
  },
  '8x8-match-tiles': {
    title: '8x8 Match Tiles',
    description:
      'Un puzzle compact 8×8 d’appariement de tuiles. Reliez les identiques et visez le meilleur score.'
  },
  'tile-guru': {
    title: 'Tile Guru',
    description:
      'Un puzzle zen d’appariement de tuiles. Trouvez et reliez des tuiles assorties dans une disposition apaisante.'
  },
  'tile-journey': {
    title: 'Tile Journey',
    description:
      'Un voyage à travers des niveaux d’appariement. Planifiez vos liaisons et videz chaque plateau.'
  }
};

// Fix French typo: "du même couleur" -> "de la même couleur"
fr['hong-kong-mahjong'].content.howToPlay[2] =
  'Une main gagnante compte quatre combinaisons plus une paire. Une combinaison est soit trois tuiles identiques, soit trois tuiles consécutives de la même couleur.';

export { fr, zhSlugs, outDir };
