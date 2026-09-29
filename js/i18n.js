// Words and UI text for every supported language.
// Voices come from the device's text-to-speech engine, so adding a language only needs text here.
(function () {
  const COLOR_KEYS = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'white', 'black'];
  const SHAPE_KEYS = ['circle', 'square', 'triangle', 'star', 'heart', 'diamond', 'rectangle', 'oval'];

  const LATIN = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const CYRILLIC = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'.split('');
  const ARABIC = 'ا ب ت ث ج ح خ د ذ ر ز س ش ص ض ط ظ ع غ ف ق ك ل م ن ه و ي'.split(' ');

  // speech: BCP-47 tag handed to the speech engine
  const LANGS = {
    en: {
      name: 'English', speech: 'en-US',
      colors: ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'white', 'black'],
      shapes: ['circle', 'square', 'triangle', 'star', 'heart', 'diamond', 'rectangle', 'oval'],
      praise: ['Great job!', 'Well done!', 'Awesome!', 'Yes!'],
      ui: {
        tagline: 'Pop, play and learn!', freeplay: 'Free Play', colors: 'Colors', shapes: 'Shapes', numbers: 'Numbers', letters: 'Letters',
        freeplayDesc: '150 points in 3 minutes. Avoid the evil balloons!', colorsDesc: 'Find the color I say', shapesDesc: 'Find the shape I say',
        numbersDesc: 'Find the number I say', lettersDesc: 'Find the letter I say',
        explore: 'Explore', exploreDesc: 'Pop anything and hear its name', level: 'Level', chooseLevel: 'Choose a level', find: 'Find',
        levelComplete: 'Level complete!', next: 'Next level', retry: 'Play again', levels: 'Levels', home: 'Home', settings: 'Settings',
        language: 'Language', sound: 'Sound effects', voice: 'Voice', speed: 'Balloon speed', slow: 'Slow', normal: 'Normal', fast: 'Fast',
        score: 'Score', time: 'Time', youWin: 'You win!', timeUp: "Time's up!", tooLow: 'Oops, too many evil balloons!', paused: 'Paused',
        resume: 'Resume', popped: 'Popped', back: 'Back', start: 'Start', tapToHear: 'Tap to hear it again', noVoice: 'No voice for this language on this device.',
        mistakes: 'Misses', close: 'Close', bestScore: 'Best'
      }
    },
    es: {
      name: 'Español', speech: 'es-ES',
      colors: ['rojo', 'naranja', 'amarillo', 'verde', 'azul', 'morado', 'rosa', 'blanco', 'negro'],
      shapes: ['círculo', 'cuadrado', 'triángulo', 'estrella', 'corazón', 'rombo', 'rectángulo', 'óvalo'],
      praise: ['¡Muy bien!', '¡Genial!', '¡Excelente!', '¡Sí!'],
      ui: {
        tagline: '¡Explota, juega y aprende!', freeplay: 'Juego libre', colors: 'Colores', shapes: 'Formas', numbers: 'Números', letters: 'Letras',
        freeplayDesc: '150 puntos en 3 minutos. ¡Evita los globos malos!', colorsDesc: 'Encuentra el color que digo', shapesDesc: 'Encuentra la forma que digo',
        numbersDesc: 'Encuentra el número que digo', lettersDesc: 'Encuentra la letra que digo',
        explore: 'Explorar', exploreDesc: 'Explota lo que quieras y oye su nombre', level: 'Nivel', chooseLevel: 'Elige un nivel', find: 'Busca',
        levelComplete: '¡Nivel completado!', next: 'Siguiente nivel', retry: 'Jugar otra vez', levels: 'Niveles', home: 'Inicio', settings: 'Ajustes',
        language: 'Idioma', sound: 'Efectos de sonido', voice: 'Voz', speed: 'Velocidad de los globos', slow: 'Lenta', normal: 'Normal', fast: 'Rápida',
        score: 'Puntos', time: 'Tiempo', youWin: '¡Ganaste!', timeUp: '¡Se acabó el tiempo!', tooLow: '¡Ups, demasiados globos malos!', paused: 'En pausa',
        resume: 'Continuar', popped: 'Explotados', back: 'Atrás', start: 'Empezar', tapToHear: 'Toca para oírlo otra vez', noVoice: 'No hay voz para este idioma en este dispositivo.',
        mistakes: 'Fallos', close: 'Cerrar', bestScore: 'Récord'
      }
    },
    fr: {
      name: 'Français', speech: 'fr-FR',
      colors: ['rouge', 'orange', 'jaune', 'vert', 'bleu', 'violet', 'rose', 'blanc', 'noir'],
      shapes: ['cercle', 'carré', 'triangle', 'étoile', 'cœur', 'losange', 'rectangle', 'ovale'],
      praise: ['Bravo !', 'Super !', 'Génial !', 'Oui !'],
      ui: {
        tagline: 'Éclate, joue et apprends !', freeplay: 'Jeu libre', colors: 'Couleurs', shapes: 'Formes', numbers: 'Nombres', letters: 'Lettres',
        freeplayDesc: '150 points en 3 minutes. Évite les méchants ballons !', colorsDesc: 'Trouve la couleur que je dis', shapesDesc: 'Trouve la forme que je dis',
        numbersDesc: 'Trouve le nombre que je dis', lettersDesc: 'Trouve la lettre que je dis',
        explore: 'Explorer', exploreDesc: 'Éclate ce que tu veux et écoute son nom', level: 'Niveau', chooseLevel: 'Choisis un niveau', find: 'Trouve',
        levelComplete: 'Niveau terminé !', next: 'Niveau suivant', retry: 'Rejouer', levels: 'Niveaux', home: 'Accueil', settings: 'Réglages',
        language: 'Langue', sound: 'Effets sonores', voice: 'Voix', speed: 'Vitesse des ballons', slow: 'Lente', normal: 'Normale', fast: 'Rapide',
        score: 'Score', time: 'Temps', youWin: 'Gagné !', timeUp: 'Temps écoulé !', tooLow: 'Oups, trop de méchants ballons !', paused: 'Pause',
        resume: 'Reprendre', popped: 'Éclatés', back: 'Retour', start: 'Jouer', tapToHear: 'Touche pour réécouter', noVoice: 'Pas de voix pour cette langue sur cet appareil.',
        mistakes: 'Erreurs', close: 'Fermer', bestScore: 'Record'
      }
    },
    de: {
      name: 'Deutsch', speech: 'de-DE',
      colors: ['rot', 'orange', 'gelb', 'grün', 'blau', 'lila', 'rosa', 'weiß', 'schwarz'],
      shapes: ['Kreis', 'Quadrat', 'Dreieck', 'Stern', 'Herz', 'Raute', 'Rechteck', 'Oval'],
      praise: ['Super!', 'Gut gemacht!', 'Toll!', 'Ja!'],
      ui: {
        tagline: 'Platzen, spielen, lernen!', freeplay: 'Freies Spiel', colors: 'Farben', shapes: 'Formen', numbers: 'Zahlen', letters: 'Buchstaben',
        freeplayDesc: '150 Punkte in 3 Minuten. Meide die bösen Ballons!', colorsDesc: 'Finde die Farbe, die ich sage', shapesDesc: 'Finde die Form, die ich sage',
        numbersDesc: 'Finde die Zahl, die ich sage', lettersDesc: 'Finde den Buchstaben, den ich sage',
        explore: 'Entdecken', exploreDesc: 'Lass alles platzen und hör den Namen', level: 'Level', chooseLevel: 'Wähle ein Level', find: 'Finde',
        levelComplete: 'Level geschafft!', next: 'Nächstes Level', retry: 'Nochmal spielen', levels: 'Level', home: 'Start', settings: 'Einstellungen',
        language: 'Sprache', sound: 'Soundeffekte', voice: 'Stimme', speed: 'Ballon-Tempo', slow: 'Langsam', normal: 'Normal', fast: 'Schnell',
        score: 'Punkte', time: 'Zeit', youWin: 'Gewonnen!', timeUp: 'Zeit ist um!', tooLow: 'Hoppla, zu viele böse Ballons!', paused: 'Pause',
        resume: 'Weiter', popped: 'Geplatzt', back: 'Zurück', start: 'Los', tapToHear: 'Tippen zum Wiederholen', noVoice: 'Keine Stimme für diese Sprache auf diesem Gerät.',
        mistakes: 'Fehler', close: 'Schließen', bestScore: 'Rekord'
      }
    },
    it: {
      name: 'Italiano', speech: 'it-IT',
      colors: ['rosso', 'arancione', 'giallo', 'verde', 'blu', 'viola', 'rosa', 'bianco', 'nero'],
      shapes: ['cerchio', 'quadrato', 'triangolo', 'stella', 'cuore', 'rombo', 'rettangolo', 'ovale'],
      praise: ['Bravo!', 'Ottimo!', 'Fantastico!', 'Sì!'],
      ui: {
        tagline: 'Scoppia, gioca e impara!', freeplay: 'Gioco libero', colors: 'Colori', shapes: 'Forme', numbers: 'Numeri', letters: 'Lettere',
        freeplayDesc: '150 punti in 3 minuti. Evita i palloncini cattivi!', colorsDesc: 'Trova il colore che dico', shapesDesc: 'Trova la forma che dico',
        numbersDesc: 'Trova il numero che dico', lettersDesc: 'Trova la lettera che dico',
        explore: 'Esplora', exploreDesc: 'Scoppia quello che vuoi e ascolta il nome', level: 'Livello', chooseLevel: 'Scegli un livello', find: 'Trova',
        levelComplete: 'Livello completato!', next: 'Livello successivo', retry: 'Gioca ancora', levels: 'Livelli', home: 'Home', settings: 'Impostazioni',
        language: 'Lingua', sound: 'Effetti sonori', voice: 'Voce', speed: 'Velocità palloncini', slow: 'Lenta', normal: 'Normale', fast: 'Veloce',
        score: 'Punti', time: 'Tempo', youWin: 'Hai vinto!', timeUp: 'Tempo scaduto!', tooLow: 'Ops, troppi palloncini cattivi!', paused: 'In pausa',
        resume: 'Riprendi', popped: 'Scoppiati', back: 'Indietro', start: 'Inizia', tapToHear: 'Tocca per riascoltare', noVoice: 'Nessuna voce per questa lingua su questo dispositivo.',
        mistakes: 'Errori', close: 'Chiudi', bestScore: 'Record'
      }
    },
    pt: {
      name: 'Português', speech: 'pt-BR',
      colors: ['vermelho', 'laranja', 'amarelo', 'verde', 'azul', 'roxo', 'rosa', 'branco', 'preto'],
      shapes: ['círculo', 'quadrado', 'triângulo', 'estrela', 'coração', 'losango', 'retângulo', 'oval'],
      praise: ['Muito bem!', 'Ótimo!', 'Incrível!', 'Sim!'],
      ui: {
        tagline: 'Estoure, brinque e aprenda!', freeplay: 'Jogo livre', colors: 'Cores', shapes: 'Formas', numbers: 'Números', letters: 'Letras',
        freeplayDesc: '150 pontos em 3 minutos. Evite os balões malvados!', colorsDesc: 'Encontre a cor que eu disser', shapesDesc: 'Encontre a forma que eu disser',
        numbersDesc: 'Encontre o número que eu disser', lettersDesc: 'Encontre a letra que eu disser',
        explore: 'Explorar', exploreDesc: 'Estoure o que quiser e ouça o nome', level: 'Nível', chooseLevel: 'Escolha um nível', find: 'Encontre',
        levelComplete: 'Nível concluído!', next: 'Próximo nível', retry: 'Jogar de novo', levels: 'Níveis', home: 'Início', settings: 'Configurações',
        language: 'Idioma', sound: 'Efeitos sonoros', voice: 'Voz', speed: 'Velocidade dos balões', slow: 'Lenta', normal: 'Normal', fast: 'Rápida',
        score: 'Pontos', time: 'Tempo', youWin: 'Você venceu!', timeUp: 'O tempo acabou!', tooLow: 'Ops, balões malvados demais!', paused: 'Pausado',
        resume: 'Continuar', popped: 'Estourados', back: 'Voltar', start: 'Começar', tapToHear: 'Toque para ouvir de novo', noVoice: 'Não há voz para este idioma neste aparelho.',
        mistakes: 'Erros', close: 'Fechar', bestScore: 'Recorde'
      }
    },
    nl: {
      name: 'Nederlands', speech: 'nl-NL',
      colors: ['rood', 'oranje', 'geel', 'groen', 'blauw', 'paars', 'roze', 'wit', 'zwart'],
      shapes: ['cirkel', 'vierkant', 'driehoek', 'ster', 'hart', 'ruit', 'rechthoek', 'ovaal'],
      praise: ['Goed zo!', 'Super!', 'Geweldig!', 'Ja!'],
      ui: {
        tagline: 'Knallen, spelen en leren!', freeplay: 'Vrij spel', colors: 'Kleuren', shapes: 'Vormen', numbers: 'Getallen', letters: 'Letters',
        freeplayDesc: '150 punten in 3 minuten. Ontwijk de boze ballonnen!', colorsDesc: 'Zoek de kleur die ik zeg', shapesDesc: 'Zoek de vorm die ik zeg',
        numbersDesc: 'Zoek het getal dat ik zeg', lettersDesc: 'Zoek de letter die ik zeg',
        explore: 'Ontdekken', exploreDesc: 'Knal alles en hoor de naam', level: 'Level', chooseLevel: 'Kies een level', find: 'Zoek',
        levelComplete: 'Level gehaald!', next: 'Volgend level', retry: 'Opnieuw spelen', levels: 'Levels', home: 'Start', settings: 'Instellingen',
        language: 'Taal', sound: 'Geluidseffecten', voice: 'Stem', speed: 'Ballonsnelheid', slow: 'Langzaam', normal: 'Normaal', fast: 'Snel',
        score: 'Punten', time: 'Tijd', youWin: 'Gewonnen!', timeUp: 'De tijd is om!', tooLow: 'Oeps, te veel boze ballonnen!', paused: 'Gepauzeerd',
        resume: 'Verder', popped: 'Geknald', back: 'Terug', start: 'Start', tapToHear: 'Tik om het opnieuw te horen', noVoice: 'Geen stem voor deze taal op dit apparaat.',
        mistakes: 'Missers', close: 'Sluiten', bestScore: 'Record'
      }
    },
    sv: {
      name: 'Svenska', speech: 'sv-SE',
      colors: ['röd', 'orange', 'gul', 'grön', 'blå', 'lila', 'rosa', 'vit', 'svart'],
      shapes: ['cirkel', 'kvadrat', 'triangel', 'stjärna', 'hjärta', 'romb', 'rektangel', 'oval'],
      praise: ['Bra jobbat!', 'Toppen!', 'Jättebra!', 'Ja!'],
      ui: {
        tagline: 'Smäll, lek och lär!', freeplay: 'Fri lek', colors: 'Färger', shapes: 'Former', numbers: 'Siffror', letters: 'Bokstäver',
        freeplayDesc: '150 poäng på 3 minuter. Undvik de elaka ballongerna!', colorsDesc: 'Hitta färgen jag säger', shapesDesc: 'Hitta formen jag säger',
        numbersDesc: 'Hitta siffran jag säger', lettersDesc: 'Hitta bokstaven jag säger',
        explore: 'Utforska', exploreDesc: 'Smäll vad du vill och hör namnet', level: 'Nivå', chooseLevel: 'Välj en nivå', find: 'Hitta',
        levelComplete: 'Nivån klar!', next: 'Nästa nivå', retry: 'Spela igen', levels: 'Nivåer', home: 'Hem', settings: 'Inställningar',
        language: 'Språk', sound: 'Ljudeffekter', voice: 'Röst', speed: 'Ballongfart', slow: 'Långsam', normal: 'Normal', fast: 'Snabb',
        score: 'Poäng', time: 'Tid', youWin: 'Du vann!', timeUp: 'Tiden är ute!', tooLow: 'Hoppsan, för många elaka ballonger!', paused: 'Pausad',
        resume: 'Fortsätt', popped: 'Smällda', back: 'Tillbaka', start: 'Starta', tapToHear: 'Tryck för att höra igen', noVoice: 'Ingen röst för det här språket på enheten.',
        mistakes: 'Missar', close: 'Stäng', bestScore: 'Rekord'
      }
    },
    ru: {
      name: 'Русский', speech: 'ru-RU', alphabet: CYRILLIC,
      colors: ['красный', 'оранжевый', 'жёлтый', 'зелёный', 'синий', 'фиолетовый', 'розовый', 'белый', 'чёрный'],
      shapes: ['круг', 'квадрат', 'треугольник', 'звезда', 'сердце', 'ромб', 'прямоугольник', 'овал'],
      praise: ['Молодец!', 'Отлично!', 'Супер!', 'Да!'],
      ui: {
        tagline: 'Лопай, играй и учись!', freeplay: 'Свободная игра', colors: 'Цвета', shapes: 'Фигуры', numbers: 'Числа', letters: 'Буквы',
        freeplayDesc: '150 очков за 3 минуты. Избегай злых шариков!', colorsDesc: 'Найди цвет, который я назову', shapesDesc: 'Найди фигуру, которую я назову',
        numbersDesc: 'Найди число, которое я назову', lettersDesc: 'Найди букву, которую я назову',
        explore: 'Исследовать', exploreDesc: 'Лопай что хочешь и слушай названия', level: 'Уровень', chooseLevel: 'Выбери уровень', find: 'Найди',
        levelComplete: 'Уровень пройден!', next: 'Следующий уровень', retry: 'Играть снова', levels: 'Уровни', home: 'Домой', settings: 'Настройки',
        language: 'Язык', sound: 'Звуковые эффекты', voice: 'Голос', speed: 'Скорость шариков', slow: 'Медленно', normal: 'Обычно', fast: 'Быстро',
        score: 'Очки', time: 'Время', youWin: 'Победа!', timeUp: 'Время вышло!', tooLow: 'Ой, слишком много злых шариков!', paused: 'Пауза',
        resume: 'Продолжить', popped: 'Лопнуто', back: 'Назад', start: 'Начать', tapToHear: 'Нажми, чтобы услышать снова', noVoice: 'На этом устройстве нет голоса для этого языка.',
        mistakes: 'Ошибки', close: 'Закрыть', bestScore: 'Рекорд'
      }
    },
    id: {
      name: 'Bahasa Indonesia', speech: 'id-ID',
      colors: ['merah', 'oranye', 'kuning', 'hijau', 'biru', 'ungu', 'merah muda', 'putih', 'hitam'],
      shapes: ['lingkaran', 'persegi', 'segitiga', 'bintang', 'hati', 'belah ketupat', 'persegi panjang', 'oval'],
      praise: ['Hebat!', 'Bagus!', 'Luar biasa!', 'Ya!'],
      ui: {
        tagline: 'Letuskan, bermain, dan belajar!', freeplay: 'Main bebas', colors: 'Warna', shapes: 'Bentuk', numbers: 'Angka', letters: 'Huruf',
        freeplayDesc: '150 poin dalam 3 menit. Hindari balon jahat!', colorsDesc: 'Cari warna yang aku sebut', shapesDesc: 'Cari bentuk yang aku sebut',
        numbersDesc: 'Cari angka yang aku sebut', lettersDesc: 'Cari huruf yang aku sebut',
        explore: 'Jelajah', exploreDesc: 'Letuskan apa saja dan dengar namanya', level: 'Level', chooseLevel: 'Pilih level', find: 'Cari',
        levelComplete: 'Level selesai!', next: 'Level berikutnya', retry: 'Main lagi', levels: 'Level', home: 'Beranda', settings: 'Pengaturan',
        language: 'Bahasa', sound: 'Efek suara', voice: 'Suara', speed: 'Kecepatan balon', slow: 'Lambat', normal: 'Normal', fast: 'Cepat',
        score: 'Skor', time: 'Waktu', youWin: 'Kamu menang!', timeUp: 'Waktu habis!', tooLow: 'Ups, terlalu banyak balon jahat!', paused: 'Jeda',
        resume: 'Lanjut', popped: 'Meletus', back: 'Kembali', start: 'Mulai', tapToHear: 'Ketuk untuk mendengar lagi', noVoice: 'Tidak ada suara untuk bahasa ini di perangkat ini.',
        mistakes: 'Salah', close: 'Tutup', bestScore: 'Rekor'
      }
    },
    ar: {
      name: 'العربية', speech: 'ar-SA', dir: 'rtl', alphabet: ARABIC,
      colors: ['أحمر', 'برتقالي', 'أصفر', 'أخضر', 'أزرق', 'بنفسجي', 'وردي', 'أبيض', 'أسود'],
      shapes: ['دائرة', 'مربع', 'مثلث', 'نجمة', 'قلب', 'معين', 'مستطيل', 'بيضاوي'],
      praise: ['أحسنت!', 'رائع!', 'ممتاز!', 'نعم!'],
      ui: {
        tagline: 'فرقع، العب وتعلّم!', freeplay: 'لعب حر', colors: 'الألوان', shapes: 'الأشكال', numbers: 'الأرقام', letters: 'الحروف',
        freeplayDesc: '150 نقطة في 3 دقائق. تجنّب البالونات الشريرة!', colorsDesc: 'ابحث عن اللون الذي أقوله', shapesDesc: 'ابحث عن الشكل الذي أقوله',
        numbersDesc: 'ابحث عن الرقم الذي أقوله', lettersDesc: 'ابحث عن الحرف الذي أقوله',
        explore: 'استكشف', exploreDesc: 'فرقع ما تشاء واسمع اسمه', level: 'المستوى', chooseLevel: 'اختر مستوى', find: 'ابحث عن',
        levelComplete: 'أكملت المستوى!', next: 'المستوى التالي', retry: 'العب مجددًا', levels: 'المستويات', home: 'الرئيسية', settings: 'الإعدادات',
        language: 'اللغة', sound: 'المؤثرات الصوتية', voice: 'الصوت', speed: 'سرعة البالونات', slow: 'بطيئة', normal: 'عادية', fast: 'سريعة',
        score: 'النقاط', time: 'الوقت', youWin: 'فزت!', timeUp: 'انتهى الوقت!', tooLow: 'أوه، بالونات شريرة كثيرة!', paused: 'متوقف',
        resume: 'متابعة', popped: 'فُرقعت', back: 'رجوع', start: 'ابدأ', tapToHear: 'اضغط لتسمعه مرة أخرى', noVoice: 'لا يوجد صوت لهذه اللغة على هذا الجهاز.',
        mistakes: 'أخطاء', close: 'إغلاق', bestScore: 'الأفضل'
      }
    }
  };

  // "Learn" mode: pop numbers / letters in order.
  const LEARN = {
    en: ['Learn', 'Count along: pop the numbers in order', 'Pop the letters in alphabet order'],
    es: ['Aprender', 'Cuenta conmigo: explota los números en orden', 'Explota las letras en orden alfabético'],
    fr: ['Apprendre', "Compte avec moi : éclate les nombres dans l'ordre", "Éclate les lettres dans l'ordre de l'alphabet"],
    de: ['Lernen', 'Zähl mit: Lass die Zahlen der Reihe nach platzen', 'Lass die Buchstaben in ABC-Reihenfolge platzen'],
    it: ['Impara', 'Conta con me: scoppia i numeri in ordine', 'Scoppia le lettere in ordine alfabetico'],
    pt: ['Aprender', 'Conte comigo: estoure os números em ordem', 'Estoure as letras em ordem alfabética'],
    nl: ['Leren', 'Tel mee: knal de getallen op volgorde', 'Knal de letters in alfabetische volgorde'],
    sv: ['Lär dig', 'Räkna med: smäll siffrorna i ordning', 'Smäll bokstäverna i alfabetisk ordning'],
    ru: ['Учить', 'Считай со мной: лопай числа по порядку', 'Лопай буквы по алфавиту'],
    id: ['Belajar', 'Berhitung: letuskan angka secara berurutan', 'Letuskan huruf sesuai urutan abjad'],
    ar: ['تعلّم', 'عُدّ معي: فرقع الأرقام بالترتيب', 'فرقع الحروف بترتيب الحروف الهجائية']
  };
  Object.keys(LEARN).forEach(function (k) {
    LANGS[k].ui.learn = LEARN[k][0];
    LANGS[k].ui.learnNumbersDesc = LEARN[k][1];
    LANGS[k].ui.learnLettersDesc = LEARN[k][2];
  });

  // Installing to the home screen. iOS step labels follow Apple's own wording in each language.
  const INSTALL = {
    en: ['Install app', 'Add Balloon Pop to your home screen and play full screen, even offline.', 'Tap the Share button', 'Choose “Add to Home Screen”', 'Tap “Add”'],
    es: ['Instalar app', 'Añade Balloon Pop a tu pantalla de inicio y juega a pantalla completa, incluso sin conexión.', 'Toca el botón Compartir', 'Elige «Añadir a pantalla de inicio»', 'Toca «Añadir»'],
    fr: ["Installer l'appli", "Ajoute Balloon Pop à ton écran d'accueil et joue en plein écran, même hors ligne.", 'Touche le bouton Partager', "Choisis « Sur l'écran d'accueil »", 'Touche « Ajouter »'],
    de: ['App installieren', 'Füge Balloon Pop zum Home-Bildschirm hinzu und spiele im Vollbild, sogar offline.', 'Tippe auf „Teilen“', 'Wähle „Zum Home-Bildschirm“', 'Tippe auf „Hinzufügen“'],
    it: ['Installa app', 'Aggiungi Balloon Pop alla schermata Home e gioca a schermo intero, anche offline.', 'Tocca il pulsante Condividi', 'Scegli «Aggiungi alla schermata Home»', 'Tocca «Aggiungi»'],
    pt: ['Instalar app', 'Adicione o Balloon Pop à Tela de Início e jogue em tela cheia, até offline.', 'Toque no botão Compartilhar', 'Escolha “Adicionar à Tela de Início”', 'Toque em “Adicionar”'],
    nl: ['App installeren', 'Zet Balloon Pop op je beginscherm en speel schermvullend, zelfs offline.', 'Tik op de deelknop', 'Kies „Zet op beginscherm”', 'Tik op „Voeg toe”'],
    sv: ['Installera appen', 'Lägg till Balloon Pop på hemskärmen och spela i helskärm, även offline.', 'Tryck på Dela-knappen', 'Välj ”Lägg till på hemskärmen”', 'Tryck på ”Lägg till”'],
    ru: ['Установить', 'Добавь Balloon Pop на экран «Домой» и играй на весь экран, даже без интернета.', 'Нажми кнопку «Поделиться»', 'Выбери «На экран „Домой“»', 'Нажми «Добавить»'],
    id: ['Pasang aplikasi', 'Tambahkan Balloon Pop ke layar utama dan main layar penuh, bahkan tanpa internet.', 'Ketuk tombol Bagikan', 'Pilih “Tambah ke Layar Utama”', 'Ketuk “Tambah”'],
    ar: ['تثبيت التطبيق', 'أضف Balloon Pop إلى الشاشة الرئيسية والعب بملء الشاشة حتى دون اتصال.', 'اضغط زر المشاركة', 'اختر «إضافة إلى الشاشة الرئيسية»', 'اضغط «إضافة»']
  };
  Object.keys(INSTALL).forEach(function (k) {
    const v = INSTALL[k];
    Object.assign(LANGS[k].ui, { install: v[0], installIntro: v[1], iosStep1: v[2], iosStep2: v[3], iosStep3: v[4] });
  });

  // Install popup: title, install, later, no thanks
  const ASK = {
    en: ['Install Balloon Pop?', 'Install', 'Later', 'No thanks'],
    es: ['¿Instalar Balloon Pop?', 'Instalar', 'Más tarde', 'No, gracias'],
    fr: ['Installer Balloon Pop ?', 'Installer', 'Plus tard', 'Non merci'],
    de: ['Balloon Pop installieren?', 'Installieren', 'Später', 'Nein danke'],
    it: ['Installare Balloon Pop?', 'Installa', 'Più tardi', 'No, grazie'],
    pt: ['Instalar o Balloon Pop?', 'Instalar', 'Mais tarde', 'Não, obrigado'],
    nl: ['Balloon Pop installeren?', 'Installeren', 'Later', 'Nee, bedankt'],
    sv: ['Installera Balloon Pop?', 'Installera', 'Senare', 'Nej tack'],
    ru: ['Установить Balloon Pop?', 'Установить', 'Позже', 'Нет, спасибо'],
    id: ['Pasang Balloon Pop?', 'Pasang', 'Nanti', 'Tidak, terima kasih'],
    ar: ['تثبيت Balloon Pop؟', 'تثبيت', 'لاحقًا', 'لا، شكرًا']
  };
  Object.keys(ASK).forEach(function (k) {
    Object.assign(LANGS[k].ui, { installAsk: ASK[k][0], installNow: ASK[k][1], later: ASK[k][2], noThanks: ASK[k][3] });
  });

  const POWERED_BY = { en: 'Powered by', es: 'Desarrollado por', fr: 'Propulsé par', de: 'Bereitgestellt von', it: 'Realizzato da',
    pt: 'Desenvolvido por', nl: 'Mogelijk gemaakt door', sv: 'Drivs av', ru: 'Работает на', id: 'Didukung oleh', ar: 'مدعوم من' };
  Object.keys(POWERED_BY).forEach(function (k) { LANGS[k].ui.poweredBy = POWERED_BY[k]; });

  window.I18N = {
    LANGS: LANGS,
    COLOR_KEYS: COLOR_KEYS,
    SHAPE_KEYS: SHAPE_KEYS,
    alphabet: function (lang) { return LANGS[lang].alphabet || LATIN; },
    bestMatch: function (tag) {
      const code = String(tag || '').slice(0, 2).toLowerCase();
      return LANGS[code] ? code : 'en';
    }
  };
})();
