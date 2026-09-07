/** @type {Record<string, { title: string, description: string, content?: object }>} */
export default {
  'hong-kong-mahjong': {
    title: 'Mahjong de Hong Kong',
    description:
      'Jouez au vrai mahjong à quatre contre trois adversaires. Score style ancien de Hong Kong, gratuit, sans téléchargement.',
    content: {
      intro:
        'Le mahjong de Hong Kong sur Mahjong Hub est un règlement produit à quatre joueurs basé sur le style ancien de Hong Kong. Il utilise les tuiles de caractère, tuiles de point, tuiles de bambou, tuiles de vent et les trois dragons — rouge, vert et blanc ; fleurs et saisons sont volontairement exclues. Constituez quatre combinaisons et une paire, puis choisissez le mode Casual pour des mains simples adaptées aux débutants, ou le mode Standard avec le minimum traditionnel de trois faan.',
      howToPlay: [
        'Le mur produit de 136 tuiles contient tuiles de caractère, tuiles de point, tuiles de bambou, tuiles de vent et les dragons rouge, vert et blanc. Fleurs et saisons ne sont pas utilisées.',
        'Chaque joueur commence avec 13 tuiles ; l’Est commence avec 14 et effectue le premier jet. Aux tours suivants, piochez une tuile puis jetez-en une, en gardant la main à 13.',
        'Une main gagnante comprend quatre combinaisons plus une paire. Une combinaison est soit trois tuiles identiques, soit trois tuiles consécutives de la même couleur.',
        'Lorsqu’un autre joueur jette une tuile dont vous avez besoin, vous pouvez la réclamer : Pong pour un triplet, Chow pour une séquence (uniquement du joueur à votre gauche), ou Kong pour les quatre exemplaires.',
        'Réclamer une tuile ouvre votre main et vous fait perdre certains motifs de score. Ne le faites que si cela fait vraiment avancer votre jeu.',
        'Déclarez la victoire par pioche ou victoire sur jet adverse. Le mode Casual accepte toute main complète de quatre combinaisons et une paire ; le mode Standard exige au moins trois faan.',
        'Après le décompte, l’Est conserve la place de donneur après une victoire du donneur ou une partie nulle ; sinon le donneur passe au siège suivant.'
      ],
      tips: [
        'Jetez tôt les tuiles d’honneur isolées. Ce sont les plus difficiles à apparier et le moins flexible de votre main.',
        'Suivez la distance à la main en attente plutôt que de fixer des tuiles isolées. À deux, c’est une position normale en milieu de partie ; à une, jouez avec prudence.',
        'Une main en couleur pure vaut bien plus que la somme de ses parties. Avec sept ou huit tuiles d’une même couleur en début, s’engager tôt est souvent payant.',
        'Observez les autres sièges. Si trois joueurs jettent la même couleur, les tuiles dont vous avez besoin sont probablement encore en jeu.',
        'En mode Standard, vérifiez le total de faan avant de réclamer : une forme complète sous trois faan n’est pas une victoire légale.'
      ],
      features: [
        'Règles authentiques du style ancien de Hong Kong avec 136 tuiles — tuiles de caractère, tuiles de point, tuiles de bambou, tuiles de vent et tuiles de dragon uniquement.',
        'Mode Casual pour apprendre les mains complètes sans seuil de faan ; mode Standard avec le minimum traditionnel de trois faan.',
        'Trois adversaires IA au jet raisonnable pour pratiquer le vrai tempo à quatre.',
        'Indice optionnel de main en attente et détail des faan après la main pour apprendre le score sans ouvrir le règlement.',
        'Jeu complet dans le navigateur sur ordinateur et mobile — touchez ou cliquez pour jeter, réclamer et déclarer la victoire.'
      ],
      supportedDevices:
        'Le mahjong de Hong Kong fonctionne dans tout navigateur moderne sur Windows, macOS, Linux, Android et iOS, sans téléchargement. L’orientation paysage sur téléphone ou tablette offre la vue de tuiles la plus large ; le portrait fonctionne aussi avec des mains défilables. Chrome, Safari, Firefox et Edge sont pris en charge — utilisez un navigateur à jour pour des animations fluides lors des réclamations et du décompte.',
      faq: [
        {
          question: 'Faut-il télécharger quelque chose ?',
          answer:
            'Non. Le jeu s’exécute entièrement dans votre navigateur sur ordinateur et mobile, sans rien installer.'
        },
        {
          question: 'Est-ce le vrai mahjong ou le jeu d’appariement de tuiles ?',
          answer:
            'C’est le vrai mahjong à quatre, avec pioche, jet, réclamations et score. Le jeu d’appariement que la plupart des sites occidentaux appellent « mahjong » est le solitaire de mahjong, un jeu différent.'
        },
        {
          question: 'Quelle est la différence entre le mode Casual et le mode Standard ?',
          answer:
            'Le mode Casual permet à toute main structurellement complète de gagner et attribue une main « chicken » d’un faan lorsqu’aucun autre motif ne marque. Le mode Standard de Hong Kong exige au moins trois faan : une main complète de score plus bas doit continuer à jouer.'
        },
        {
          question: 'Y a-t-il des paris avec de l’argent réel ?',
          answer:
            'Non. Aucun pari, aucune monnaie achetable, aucun prix en espèces. Les scores ne suivent que votre propre progression.'
        }
      ]
    }
  },
  'riichi-mahjong': {
    title: 'Mahjong Riichi',
    description:
      'Mahjong Riichi japonais contre trois adversaires. Le règlement derrière la scène compétitive moderne.',
    content: {
      intro:
        'Cette table japonaise Riichi à quatre suit la base approuvée du World Riichi Championship 2025 : pas de cinq rouges, un seul gagnant en cas de collision de tête, et départ à 30 000 points.',
      howToPlay: [
        'Chaque joueur commence avec 13 tuiles. Piochez-en une et jetez-en une, en visant quatre combinaisons et une paire ; Sept paires et Treize orphelins sont aussi des formes fermées valides.',
        'Une forme complète ne suffit pas : la main doit avoir au moins un yaku. Dora ajoute de la valeur mais n’est pas un yaku à elle seule.',
        'Chow n’est disponible que depuis le joueur à votre gauche. Pong, Kong et Ron peuvent être réclamés auprès de tout adversaire, selon la priorité de réclamation.',
        'Gardez la main fermée et atteignez la main en attente pour déclarer Riichi. Choisissez un jet mis en évidence et placez une barre de 1 000 points.',
        'Gagnez par Tsumo sur votre propre pioche ou par Ron sur un jet adverse. Sous la collision de tête WRC, seul le premier gagnant dans l’ordre de tour reçoit le Ron.',
        'Le match traverse les tours Est et Sud. Dans cette base produit, une victoire du donneur ou une partie nulle exhaustive conserve le donneur ; les parties nulles exhaustives utilisent un paiement noten de 3 000 points.',
        'Cette table utilise 136 tuiles, un mur mort de 14 tuiles, des indicateurs Dora et aucun cinq rouge.'
      ],
      tips: [
        'Sécurisez un yaku avant de chasser Dora : les tuiles bonus ne rendent pas légale une main sans yaku.',
        'Comparez le shanten et les tuiles utiles avant chaque jet ; gardez les formes avec plus de pioches améliorantes.',
        'Face à un Riichi, commencez par genbutsu, puis utilisez suji et le mur visible pour réduire le risque.',
        'Déclarez Riichi avec discernement : comparez la qualité de l’attente, la valeur de la main, les tuiles restantes et le score du match.',
        'Ne forcez pas des attaques de faible valeur en fin de main lorsqu’un fold plus sûr protège votre position.'
      ],
      features: [
        'Base World Riichi Championship 2025 — pas de cinq rouges, Ron par collision de tête et départ à 30 000 points.',
        'Seuil yaku complet, indicateurs Dora et mur mort de 14 tuiles pour un flux compétitif authentique.',
        'Déclaration Riichi avec barre de 1 000 points, victoires Tsumo et Ron avec priorité d’ordre de tour.',
        'L’indice de main en attente suit le shanten pour apprendre la main en attente sans deviner le nombre de tuiles.',
        'Tours Est et Sud avec continuation du donneur sur victoire du donneur et parties nulles exhaustives.'
      ],
      supportedDevices:
        'Le mahjong Riichi se joue dans le navigateur sur ordinateur, portable, tablette et téléphone sans installer d’application. Le mode paysage mobile est recommandé pour lire ensemble les jets adverses et votre main. Navigateurs pris en charge : Chrome, Safari, Firefox et Edge actuels sur Windows, macOS, Linux, Android et iOS.',
      faq: [
        {
          question: 'En quoi Riichi diffère-t-il du mahjong chinois ?',
          answer:
            'Riichi exige un motif de score avant de déclarer la victoire, valorise davantage les mains fermées et utilise une table de score différente. Le cœur pioche-et-jet est le même, donc le transfert est facile.'
        },
        {
          question: 'Est-ce un bon endroit pour apprendre Riichi ?',
          answer:
            'C’est un bon endroit pour se familiariser avec le flux, les réclamations et les motifs courants. L’indice de main en attente montre à quelle distance vous êtes d’une main complète, l’information la plus utile pour un débutant.'
        }
      ]
    }
  },
  'chinese-official-mahjong': {
    title: 'Mahjong officiel chinois',
    description:
      'Table d’entraînement de mahjong officiel chinois (MCR) — 144 tuiles, remplacement des fleurs et seuil de victoire de huit points.',
    content: {
      intro:
        'Voici notre table d’entraînement de mahjong officiel chinois (MCR). Elle utilise déjà 144 tuiles, expose et remplace fleurs et saisons, et applique le seuil de victoire de huit points. Le marqueur complet de 81 éléments de compétition et ses règles d’exclusion sont encore en développement ; cette page ne doit pas servir d’arbitre de tournoi.',
      howToPlay: [
        'Mahjong standard à quatre : piochez, jetez, et formez quatre combinaisons plus une paire.',
        'Révélez immédiatement chaque fleur ou saison dans la zone des fleurs, puis prenez un remplacement depuis l’arrière du mur.',
        'Une main doit valoir au moins huit points qualifiants avant d’être déclarée. Les points de fleur ne remplissent pas ce seuil à eux seuls.',
        'Le marqueur actuel ne couvre qu’un sous-ensemble d’entraînement ; utilisez-le pour apprendre le flux des tours, pas pour certifier un score de compétition.'
      ],
      tips: [
        'Traitez cette version comme une table d’entraînement pendant l’ajout des 81 éléments officiels de score.',
        'Une main à une tuile de la complétion mais sous huit points qualifiants n’est pas une victoire légale ; continuez d’améliorer sa structure de score.',
        'Quand le marqueur complet arrivera, il expliquera les éléments inclus et exclus, plutôt que d’additionner simplement chaque motif visible.'
      ],
      features: [
        'Table d’entraînement MCR de 144 tuiles avec flux de remplacement des fleurs et saisons.',
        'Seuil minimum de huit points pour enseigner tôt l’arbitrage de compétition.',
        'Pioche et jet à quatre contre l’IA avec appels de combinaisons standards.',
        'Le marqueur d’entraînement couvre un sous-ensemble initial de motifs pendant la construction de la table complète de 81 éléments.',
        'Retour clair à l’écran lorsqu’une main complète est sous le seuil de huit points.'
      ],
      supportedDevices:
        'Le mahjong officiel chinois fonctionne entièrement dans le navigateur sur Windows, macOS, Linux, Android et iOS. Ordinateur et tablette facilitent la lecture du remplacement des fleurs et du retour de score ; les téléphones fonctionnent dans les deux orientations. Utilisez Chrome, Safari, Firefox ou Edge à jour pour de meilleures performances lors des tours multijoueurs.',
      faq: [
        {
          question: 'Pourquoi ne puis-je pas déclarer la victoire sur une main complète ?',
          answer:
            'L’officiel chinois exige un minimum de huit points. Si votre main complète marque moins, la victoire ne peut pas être déclarée et le jeu continue.'
        },
        {
          question: 'Le score est-il complet ici ?',
          answer:
            'Non. Cette version d’entraînement implémente le flux 144 tuiles et remplacement des fleurs plus un sous-ensemble initial de score. La table officielle complète de 81 éléments et ses exclusions sont encore en cours d’implémentation.'
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
        'Le mur de 108 tuiles n’utilise que les tuiles de caractère, tuiles de point et tuiles de bambou. Tuiles de vent, tuiles de dragon, fleurs et saisons ne sont pas utilisées.',
        'Avant le jeu normal, sélectionnez trois tuiles d’une seule couleur pour Exchange Three ; la table les passe dans la direction choisie pour cette main.',
        'Choisissez une couleur interdite. Vous devez jeter toutes les tuiles de cette couleur avant de pouvoir déclarer la victoire.',
        'Piochez et jetez normalement. Chow n’est pas autorisé ; Pong et Kong le sont selon l’ordre de réclamation de la table.',
        'Formez quatre combinaisons et une paire, ou une main spéciale approuvée comme Sept paires, puis gagnez par victoire par pioche ou un jet légal.',
        'Un gagnant cesse de piocher, mais la main continue pour les autres. Le décompte de fin de main inclut le contrôle de main en attente, la pénalité flower-pig et le remboursement de Kong.'
      ],
      tips: [
        'Choisissez la couleur interdite selon celle que vous pouvez vider le plus vite, pas seulement celle avec le moins de tuiles.',
        'Exchange Three doit retirer trois tuiles d’une couleur faible cohérente afin de ne pas créer trois tuiles mortes sans lien.',
        'Comme Chow est indisponible, les paires et formes connectées valent plus que dans les variantes avec Chow.',
        'Après la victoire d’un autre joueur, réévaluez le risque : rester en main en attente compte pour le contrôle de fin, mais évitez de devenir flower pig.',
        'Suivez l’exposition des Kong et le décompte. Un Kong de grande valeur n’est pas automatiquement sûr s’il ouvre une pioche dangereuse.'
      ],
      features: [
        'Base Chengdu Blood Battle — 108 tuiles, Exchange Three et une couleur interdite personnelle.',
        'Pas de Chow : Pong et Kong uniquement, au tempo rapide des tables du Sichuan contre trois sièges IA.',
        'Le flux Blood Battle continue après la première victoire, avec contrôle de main en attente et pénalités en fin de main.',
        'Exchange Three interactif et sélecteur de couleur interdite avant chaque main.',
        'Victoires par pioche et sur jet, avec Sept paires et formes standard à quatre combinaisons.'
      ],
      supportedDevices:
        'Le mahjong du Sichuan fonctionne dans les navigateurs modernes sur ordinateur, portable, tablette et téléphone sans installation. La vue paysage mobile convient le mieux aux commandes d’échange et de couleur interdite. Chrome, Safari, Firefox et Edge sur Windows, macOS, Linux, Android et iOS sont tous pris en charge.',
      faq: [
        {
          question: 'Pourquoi ne puis-je pas gagner tant que je détiens ma couleur interdite ?',
          answer:
            'La règle de la couleur interdite est une condition centrale du Blood Battle de Chengdu. Videz toutes les tuiles de la couleur choisie avant de déclarer la victoire.'
        },
        {
          question: 'Pourquoi le jeu continue-t-il après qu’un joueur a gagné ?',
          answer:
            'Blood Battle to the End permet aux joueurs restants de continuer. Cela peut créer plusieurs gagnants ou pénalités dans une même main.'
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
        'Le mahjong de Taïwan de Mahjong Hub est une version détendue à 16 tuiles : mur de 144 avec fleurs et saisons, cinq combinaisons plus une paire pour gagner, score Tai additif, et un minimum de 0 Tai adapté aux débutants.',
      howToPlay: [
        'Utilisez les 144 tuiles. Chaque non-donneur commence avec 16 tuiles ; l’Est commence avec 17 et effectue le premier jet.',
        'Révélez immédiatement chaque fleur ou saison et piochez un remplacement. Elle reste hors de votre main de 16 tuiles et ajoute du Tai le cas échéant.',
        'À votre tour, piochez une tuile et jetez-en une. Vous pouvez faire Chow depuis le joueur de gauche, ou Pong et Kong selon l’ordre de réclamation.',
        'Gagnez avec cinq combinaisons et une paire, soit une main de 17 tuiles. Victoire par pioche et sur jet sont toutes deux prises en charge.',
        'Les motifs Tai s’additionnent au décompte. Cette base débutant Mahjong Hub permet à une main complète de 0 Tai de gagner.'
      ],
      tips: [
        'Avec 16 tuiles cachées, conservez plusieurs formes connectées tôt au lieu de vous engager trop vite sur une seule attente.',
        'Les fleurs ajoutent de la valeur mais ne réparent pas une main principale faible ; construisez d’abord la structure à cinq combinaisons.',
        'Les Kong sont plus fréquents au mahjong de Taïwan. Tenez compte de la pioche de remplacement et de l’information révélée.',
        'Utilisez le mode 0 Tai pour apprendre le tempo ; une fois à l’aise, poursuivez le Tai seulement s’il ne réduit pas vos attentes vivantes.',
        'Vérifiez si votre fleur correspond à votre siège : les fleurs de siège peuvent ajouter un bonus de score.'
      ],
      features: [
        'Mains taïwanaises à 16 tuiles avec cinq combinaisons plus une paire et mur de 144 incluant les fleurs.',
        'Remplacement immédiat des fleurs avec bonus Tai et options de score fleur de siège.',
        'Appels Chow, Pong et Kong avec décompte Tai additif à chaque victoire.',
        'Minimum de 0 Tai adapté aux débutants pour apprendre le tempo avant de viser des motifs à haut Tai.',
        'Table à quatre contre l’IA avec victoires par pioche et sur jet.'
      ],
      supportedDevices:
        'Le mahjong de Taïwan se joue dans le navigateur sur Windows, macOS, Linux, Android et iOS. Tablettes et ordinateurs facilitent la lecture de la grande main à 16 tuiles ; les téléphones fonctionnent en portrait ou paysage. Utilisez Chrome, Safari, Firefox ou Edge actuels pour des touches réactives et des animations fluides de remplacement des fleurs.',
      faq: [
        {
          question: 'Pourquoi ai-je 16 tuiles au lieu de 13 ?',
          answer:
            'Le mahjong de Taïwan utilise cinq combinaisons plus une paire. Les joueurs détiennent normalement 16 tuiles et gagnent après avoir pioché ou réclamé la 17e.'
        },
        {
          question: 'Une main de 0 Tai peut-elle gagner ici ?',
          answer:
            'Oui. Mahjong Hub utilise une base détendue de 0 Tai. D’autres tables taïwanaises peuvent exiger un Tai minimum, clairement indiqué dans les paramètres du jeu.'
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
        'Le mahjong américain de Mahjong Hub est un jeu original de carte d’entraînement inspiré du flux style NMJL : 152 tuiles, Charleston, fleurs, jokers, groupes exposés et victoires par motif exact de carte. Il ne reproduit pas une carte annuelle NMJL en cours.',
      howToPlay: [
        'Utilisez un set de 152 tuiles avec tuiles standard, huit fleurs et huit jokers. Chaque joueur prend 13 tuiles ; l’Est en prend 14 et jette en premier.',
        'Lisez la carte d’entraînement originale, puis complétez le Charleston : passez trois tuiles à droite, en face et à gauche. Un second Charleston et le passe de courtoisie sont des options de table.',
        'Piochez et jetez en visant une ligne exacte de la carte d’entraînement, pas une forme générique de quatre combinaisons et une paire.',
        'Exposez Pongs, Kongs ou groupes plus grands légaux lorsque la ligne de carte choisie le permet. Les lignes cachées de la carte ne peuvent pas être exposées avant la victoire finale.',
        'Utilisez un joker uniquement dans un groupe de trois ou plus ; jamais comme tuile seule ou paire. À votre tour, une tuile naturelle peut échanger un joker dans une exposition adverse.',
        'Déclarez Mah Jongg uniquement lorsque les 14 tuiles correspondent exactement à une ligne légale de la carte d’entraînement originale.'
      ],
      tips: [
        'Avant le Charleston, gardez deux ou trois lignes de carte compatibles ouvertes plutôt que de vous engager sur une seule ligne rare.',
        'Passez les tuiles qui ne soutiennent aucune de vos catégories de carte probables, mais ne passez jamais un joker.',
        'N’exposez pas un groupe simplement parce que vous le pouvez : l’exposition signale votre cible et peut rendre la main impossible à pivoter.',
        'Traitez les jokers comme accélérateurs de groupe, pas comme jokers universels ; vous avez toujours besoin de tuiles naturelles pour les singles et les paires.',
        'Utilisez les expositions adverses pour décider quelles tuiles naturelles sont sûres à jeter et quand un échange de joker est utile.'
      ],
      features: [
        'Set style américain de 152 tuiles avec fleurs, jokers et passes Charleston inspirées NMJL.',
        'Cartes d’entraînement originales Mahjong Hub — victoires par motif exact, pas formes génériques de combinaison.',
        'Groupes légaux avec joker, échange de joker à votre tour et règles d’exposition liées à la ligne de carte.',
        'Second Charleston optionnel et passe de courtoisie pour des sessions de pratique style table.',
        'Table à quatre dans le navigateur avec Charleston guidé et validation du motif de carte.'
      ],
      supportedDevices:
        'Le mahjong américain fonctionne entièrement dans le navigateur sur ordinateur et mobile sans télécharger d’application. Un écran large aide à lire ensemble la carte d’entraînement et les expositions ; les téléphones passent en paysage pour la disposition complète de la table. Pris en charge sur Chrome, Safari, Firefox et Edge sous Windows, macOS, Linux, Android et iOS.',
      faq: [
        {
          question: 'Est-ce la carte annuelle officielle NMJL ?',
          answer:
            'Non. Ce jeu utilise des cartes d’entraînement originales Mahjong Hub. Une intégration de carte NMJL sous licence serait un produit futur distinct.'
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
      'Reliez des paires de tuiles identiques par un chemin qui tourne au plus deux fois. Trois tailles de plateau, indices, et pas de chronomètre en mode détendu.',
    content: {
      intro:
        'Mahjong Connect, aussi connu sous le nom d’Onet, est le puzzle de liaison construit avec des tuiles de mahjong. Videz tout le plateau en reliant des paires identiques par un chemin qui ne plie pas plus de deux fois. Le mode détendu n’a pas d’horloge si vous préférez prendre votre temps.',
      howToPlay: [
        'Touchez ou cliquez deux tuiles montrant la même face.',
        'La paire disparaît si elles peuvent être jointes par un chemin d’espace vide qui tourne au plus deux fois. Le chemin peut longer le bord extérieur du plateau.',
        'Videz toutes les tuiles pour gagner. Les correspondances consécutives construisent un bonus de série.',
        'Si aucune paire n’est jouable, le plateau se mélange automatiquement pour que vous ne soyez jamais bloqué.'
      ],
      tips: [
        'Travaillez d’abord les bords. Les tuiles extérieures ont le plus de trajets disponibles et ouvrent le centre en se vidant.',
        'Deux tuiles identiques côte à côte sont toujours jouables — mais les enlever peut être le seul moyen d’ouvrir un chemin ailleurs, alors regardez avant de prendre la correspondance gratuite.',
        'Le bouton d’indice coûte quelques points. Sur les plateaux chronométrés, cet échange en vaut presque toujours la peine.'
      ],
      features: [
        'Appariement classique style Onet avec de vraies faces de tuile de mahjong.',
        'Trois tailles de plateau, du compact aux défis pleine grille.',
        'Mode détendu sans chronomètre et plateaux chronométrés pour le score de série.',
        'Mélange automatique quand aucune paire n’est jouable — les plateaux ne mènent jamais à une impasse.',
        'Système d’indices et bonus de série pour les sessions plus longues.'
      ],
      supportedDevices:
        'Mahjong Connect fonctionne dans tout navigateur moderne sur ordinateur, tablette et téléphone sans installation. Les touches sur mobile et le clic sur ordinateur fonctionnent sur le même plateau. Chrome, Safari, Firefox et Edge sur Windows, macOS, Linux, Android et iOS sont pris en charge ; un écran de téléphone moyen accueille confortablement le plateau par défaut en portrait.',
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
      'Le puzzle classique d’appariement de tuiles en couches. Dispositions tortue et pyramide, parties toujours solubles, indices et annulation.',
    content: {
      intro:
        'Mahjong Solitaire est le puzzle solo classique d’appariement construit avec des tuiles de mahjong. Videz toute la disposition en appariant des tuiles identiques libres : rien ne repose dessus et au moins un côté est ouvert. Chaque donne ici est générée soluble, donc une clairance complète existe toujours. Deux formes classiques sont incluses — la tortue et la pyramide — plus indices, annulation et mélange lorsque vous vous coincerez.',
      howToPlay: [
        'Touchez deux tuiles montrant la même face pour les apparier. Une tuile ne peut être appariée que lorsqu’elle est libre : rien ne repose dessus et elle est ouverte d’au moins un côté à sa propre couche.',
        'Les tuiles couvrent celles directement en dessous, donc videz une pile du haut vers le bas. La couche supérieure est toujours disponible ; les couches inférieures s’ouvrent à mesure que vous progressez.',
        'Videz toutes les tuiles pour gagner. La tortue déploie une large carapace ; la pyramide empile cinq triangles centrés que vous pelez des bords vers le centre.',
        'Chaque donne est générée soluble, donc une solution existe toujours. Utilisez les indices si vous êtes bloqué, annulez un appariement précipité, ou mélangez pour redistribuer les tuiles restantes.',
        'Il n’y a ni chronomètre ni pression de score — prenez tout le temps voulu.'
      ],
      tips: [
        'Travaillez d’abord l’extérieur. Une tuile au bord extérieur d’une couche a un côté ouvert gratuitement, donc vider le périmètre ouvre le centre.',
        'Avant de prendre une paire évidente, regardez ce qu’elle libère. Deux tuiles identiques adjacentes sont un appariement facile, mais les enlever peut être le seul moyen de débloquer une pile supérieure.',
        'Tirez parti des niveaux de la pyramide : ses tuiles de bord sont jouables dès le début, et la tuile du sommet n’est accessible qu’une fois sa couche atteinte.',
        'Si vous n’avez plus de correspondances, mélangez plutôt que de recommencer — les tuiles restantes sont redistribuées dans un nouvel arrangement soluble.'
      ],
      features: [
        'Solitaire de mahjong en couches avec dispositions tortue et pyramide.',
        'Chaque donne est générée à l’envers et soluble — une clairance complète est toujours possible.',
        'Règles d’appariement des tuiles libres avec surbrillance visuelle des paires jouables.',
        'Indices, annulation et mélange lorsque vous voulez un second regard sans recommencer.',
        'Défi quotidien, niveaux de campagne et mode détendu sans chronomètre.'
      ],
      supportedDevices:
        'Mahjong Solitaire Classic fonctionne dans le navigateur sur Windows, macOS, Linux, Android et iOS sans téléchargement. Ordinateur et tablette affichent la disposition complète en couches ; les téléphones défilent naturellement sur les piles hautes de la tortue. Chrome, Safari, Firefox et Edge sont pris en charge — la progression invité se sauvegarde localement sur votre appareil.',
      faq: [
        {
          question: 'En quoi cela diffère-t-il de Mahjong Connect ?',
          answer:
            'Connect dispose les tuiles à plat et demande de joindre des paires correspondantes par un chemin. Le solitaire empile les tuiles en couches et vous appariez des tuiles libres d’un côté et découvertes dessus. Puzzle différent, mêmes tuiles.'
        },
        {
          question: 'Que signifie « libre » ici ?',
          answer:
            'Une tuile est libre lorsque rien ne repose directement dessus et qu’au moins un de ses voisins gauche ou droit au même niveau est vide. Les tuiles du bord extérieur d’une couche sont toujours libres à l’extérieur.'
        },
        {
          question: 'Chaque partie est-elle garantie soluble ?',
          answer:
            'Oui. Les donnes sont construites à l’envers — le jeu choisit à plusieurs reprises deux tuiles libres, les retire et enregistre l’appariement — donc chaque disposition a un chemin de solution connu que vous pouvez trouver en réfléchissant.'
        },
        {
          question: 'Y a-t-il des paris avec de l’argent réel ?',
          answer:
            'Non. C’est un puzzle pur, sans pari, sans monnaie achetable et sans prix en espèces d’aucune sorte.'
        }
      ]
    }
  },
  'mahjong-connect': {
    title: 'Mahjong Connect Lite',
    description:
      'Appariez des paires de tuiles de mahjong libres reliées par un chemin. Un jeu d’élimination détendu style connect.'
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
      'Une version tridimensionnelle de l’appariement de mahjong, avec profondeur et une palette arc-en-ciel apaisante.'
  },
  'onet-connect-classic': {
    title: 'Onet Connect Classic',
    description:
      'Le jeu de liaison classique Onet. Reliez des tuiles identiques avec une ligne d’au plus deux virages.'
  },
  'bee-connect': {
    title: 'Bee Connect',
    description:
      'Un connect sur le thème des abeilles. Reliez les petites tuiles et videz le plateau en nid d’abeilles.'
  },
  'aloha-mahjong': {
    title: 'Aloha Mahjong',
    description:
      'Une touche tropicale à l’appariement de mahjong, ambiance ensoleillée et détendue.'
  },
  '8x8-match-tiles': {
    title: '8x8 Match Tiles',
    description:
      'Un puzzle compact 8×8 d’appariement de tuiles. Reliez les mêmes tuiles et visez le score élevé.'
  },
  'tile-guru': {
    title: 'Tile Guru',
    description:
      'Un puzzle zen d’appariement de tuiles. Trouvez et reliez des tuiles assorties dans une disposition apaisante.'
  },
  'tile-journey': {
    title: 'Tile Journey',
    description:
      'Un voyage à travers des niveaux d’appariement de tuiles. Planifiez vos connexions et videz chaque plateau.'
  }
};
