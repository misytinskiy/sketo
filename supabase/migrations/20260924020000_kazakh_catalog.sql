-- Run AFTER 20260924010000_kazakh_locale.sql has committed (a separate Run in SQL Editor).
-- Adds Kazakh copy for 14 local products matched by slug AND type.
-- Existing KZ translations and all RU/EN content remain untouched.
-- Products created only in Supabase can be translated in Staff > KZ.
BEGIN;
DO $migration$
DECLARE
  item jsonb;
  product_record record;
  translation_id uuid;
BEGIN
  FOR item IN SELECT value FROM jsonb_array_elements($kazakh$
[
  {
    "slug": "african-profile-1-0",
    "type": "coffee",
    "name": "African Profile 1.0",
    "size": "250 г",
    "notes": "Гүлдер, грейпфрут, шабдалы, ананас",
    "description": "Хош иісі айқын, шырынды жеміс дәмі ашылатын, таза кесеге арналған жарқын африкалық профиль.",
    "details": [
      {
        "label": "Ел",
        "value": "Эфиопия"
      },
      {
        "label": "Аймақ",
        "value": "Йиргачеффе, Гедео аймағы"
      },
      {
        "label": "Өңдеу",
        "value": "Хани"
      },
      {
        "label": "Биіктік",
        "value": "1800 м"
      },
      {
        "label": "Q-score",
        "value": "86"
      },
      {
        "label": "Дәм шоғыры",
        "value": "Гүлдер, грейпфрут, шабдалы, ананас"
      }
    ]
  },
  {
    "slug": "latino-profile-2-0",
    "type": "coffee",
    "name": "Latino Profile 2.0",
    "size": "250 г",
    "notes": "Құрақ қанты, сүйекті жемістер, карамель",
    "description": "Жұмсақ тәттілігі және жағымды эспрессо дәмі бар теңгерімді латынамерикалық профиль.",
    "details": [
      {
        "label": "Ел",
        "value": "Бразилия"
      },
      {
        "label": "Лот",
        "value": "Engheno Farm, лот 32#"
      },
      {
        "label": "Өңдеу",
        "value": "Палпд-натурал"
      },
      {
        "label": "Сұрып",
        "value": "Сары бурбон"
      },
      {
        "label": "Қуыру профилі",
        "value": "Эспрессо | Сүзгі"
      },
      {
        "label": "Дәм шоғыры",
        "value": "Құрақ қанты, сүйекті жемістер, карамель"
      }
    ]
  },
  {
    "slug": "decaf",
    "type": "coffee",
    "name": "Декаф",
    "size": "250 г",
    "notes": "Карамель, сүтті шоколад, алма, лимон",
    "description": "Тәттілігі мен дәм тазалығын сақтайтын, қою әрі үйреншікті кофе сипаты бар декаф.",
    "details": [
      {
        "label": "Ел",
        "value": "Колумбия, Нариньо"
      },
      {
        "label": "Процесс",
        "value": "Sugar Cane EA Decaf"
      },
      {
        "label": "Түрі",
        "value": "Кофеині аз кофе"
      },
      {
        "label": "Қуыру",
        "value": "Эспрессо"
      },
      {
        "label": "Дәм шоғыры",
        "value": "Карамель, сүтті шоколад, алма, лимон"
      }
    ]
  },
  {
    "slug": "asian-profile",
    "type": "coffee",
    "name": "Asian Profile",
    "size": "250 г",
    "notes": "Кептірілген өрік, қара өрік, қара шоколад, жержаңғақ",
    "description": "Қышқылдығы төмен, дәмнен кейін шоколад пен жаңғақ реңкі қалатын қою әрі күңгірт профиль.",
    "details": [
      {
        "label": "Қоспа",
        "value": "Бразилия \\ Эфиопия, 60 \\ 40"
      },
      {
        "label": "Тәттілік",
        "value": "4/5"
      },
      {
        "label": "Қышқылдық",
        "value": "3/5"
      },
      {
        "label": "Ащылық",
        "value": "3/5"
      },
      {
        "label": "Қоюлық",
        "value": "4/5"
      },
      {
        "label": "Дәм шоғыры",
        "value": "Кептірілген өрік, қара өрік, қара шоколад, жержаңғақ"
      }
    ]
  },
  {
    "slug": "italian-profile-medium",
    "type": "coffee",
    "name": "Italian Profile Medium",
    "size": "250 г",
    "notes": "Қара шоколад, жаңғақтар",
    "description": "Шоколадты дәм мен тұрақты нәтижеге бағытталған, эспрессоға арналған қою италиялық профиль.",
    "details": [
      {
        "label": "Қоспа",
        "value": "Бразилия / Уганда"
      },
      {
        "label": "Құрамы",
        "value": "100% арабика"
      },
      {
        "label": "Тәттілік",
        "value": "4/5"
      },
      {
        "label": "Қышқылдық",
        "value": "2/5"
      },
      {
        "label": "Ащылық",
        "value": "4/5"
      },
      {
        "label": "Дәм шоғыры",
        "value": "Қара шоколад, жаңғақтар"
      }
    ]
  },
  {
    "slug": "brazilian-profile-1-0",
    "type": "coffee",
    "name": "Brazilian Profile 1.0",
    "size": "250 г",
    "notes": "Карамель, қара шоколад, грек жаңғағы",
    "description": "Күнделікті эспрессоға арналған, жаңғақ дәмі мен ұстамды тәттілігі бар жұмсақ бразилиялық профиль.",
    "details": [
      {
        "label": "Аймақ",
        "value": "Бразилия Серрадо"
      },
      {
        "label": "Тәттілік",
        "value": "3/5"
      },
      {
        "label": "Қышқылдық",
        "value": "2/5"
      },
      {
        "label": "Ащылық",
        "value": "3/5"
      },
      {
        "label": "Қоюлық",
        "value": "4/5"
      },
      {
        "label": "Дәм шоғыры",
        "value": "Карамель, қара шоколад, грек жаңғағы"
      }
    ]
  },
  {
    "slug": "brazilian-profile-2-0",
    "type": "coffee",
    "name": "Brazilian Profile 2.0",
    "size": "250 г",
    "notes": "Цитрус, қара шоколад, грек жаңғағы",
    "description": "Жеңіл цитрус реңкі мен қою негізі бар бразилиялық профильдің жарқын нұсқасы.",
    "details": [
      {
        "label": "Қоспа",
        "value": "Бразилия \\ Эфиопия, 80 \\ 20"
      },
      {
        "label": "Тәттілік",
        "value": "3/5"
      },
      {
        "label": "Қышқылдық",
        "value": "2/5"
      },
      {
        "label": "Ащылық",
        "value": "3/5"
      },
      {
        "label": "Қоюлық",
        "value": "4/5"
      },
      {
        "label": "Дәм шоғыры",
        "value": "Цитрус, қара шоколад, грек жаңғағы"
      }
    ]
  },
  {
    "slug": "microlot-2-0",
    "type": "coffee",
    "name": "Микролот 2.0",
    "size": "250 г",
    "notes": "Сары жемістер, сүтті шоколад, мүкжидек, бадам",
    "description": "Мәнерлі дәмге бағытталған, күрделі хош иісі мен нәзік ферментациясы бар микролот.",
    "details": [
      {
        "label": "Ел",
        "value": "Бразилия, Санта-Катарина"
      },
      {
        "label": "Сұрып",
        "value": "Сары катуаи"
      },
      {
        "label": "Өңдеу",
        "value": "Табиғи ферментация"
      },
      {
        "label": "Қуыру",
        "value": "Сүзгі"
      },
      {
        "label": "Дәм шоғыры",
        "value": "Сары жемістер, сүтті шоколад, мүкжидек, бадам"
      }
    ]
  },
  {
    "slug": "la-marzocco-micra",
    "type": "equipment",
    "name": "La Marzocco Micra",
    "category": "Үйге арналған кофемашина",
    "status": "Тапсырыспен",
    "description": "Ықшам форматта кәсіби сипат қажет үй асүйлеріне, студиялық барларға және шағын қонақ кеңістіктеріне арналған La Marzocco платформасы.",
    "details": [
      {
        "label": "Бренд",
        "value": "La Marzocco"
      },
      {
        "label": "Серия",
        "value": "Micra"
      },
      {
        "label": "Формат",
        "value": "Үй / ықшам"
      },
      {
        "label": "Мақсаты",
        "value": "Эспрессо"
      }
    ],
    "features": [
      {
        "title": "түрленетін портафильтр",
        "description": "3-і 1-де портафильтр бір шүмекті, қос шүмекті және түбі ашық конфигурациялар арасында жылдам ауысады."
      },
      {
        "title": "су жіберу тұтқасы",
        "description": "Механикалық paddle тұтқасының сезімі электр қосқышының сенімділігімен үйлеседі."
      },
      {
        "title": "жылу оқшауланған бу түтігі",
        "description": "Cool-touch бу түтігі жұмыста ыңғайлы әрі қуатты бу беруді сақтайды."
      },
      {
        "title": "ыңғайлы су ыдысы",
        "description": "2 литрлік автономды су ыдысына қол жеткізу оңай, қажет болса машинаны су құбырына қосуға болады."
      },
      {
        "title": "қосымшаға қосылу",
        "description": "La Marzocco Home App арқылы температураны, параметрлерді, кестелерді өзгертіп, автоматты кері шаюды іске қосуға болады."
      },
      {
        "title": "баристаға арналған жарық",
        "description": "LED жарығы жұмыс аймағын жарықтандырып, топ маңындағы көріністі жақсартады."
      }
    ],
    "specifications": [
      {
        "label": "Биіктік",
        "value": "13.3 in / 33.8 cm"
      },
      {
        "label": "Ені",
        "value": "11.4 in / 29 cm"
      },
      {
        "label": "Тереңдігі",
        "value": "18.6 in / 47.2 cm"
      },
      {
        "label": "Салмағы",
        "value": "42 lb / 19 kg"
      },
      {
        "label": "Ең төменгі қуат",
        "value": "1600 W (110V)"
      },
      {
        "label": "Ең жоғары қуат",
        "value": "1850 W (220V)"
      },
      {
        "label": "Кофе бойлері",
        "value": "0.25 L"
      },
      {
        "label": "Бу бойлері",
        "value": "1.6 L"
      },
      {
        "label": "Су ыдысы",
        "value": "2 L"
      }
    ]
  },
  {
    "slug": "linea-mini-r",
    "type": "equipment",
    "name": "Linea Mini R",
    "category": "Просьюмер кофемашинасы",
    "status": "Тапсырыспен",
    "description": "Премиум үй жабдықтарына, каппинг аймақтарына және дизайнға мән беретін кофе нүктелеріне арналған, айқын пішінді әрі кәсіби келбеті бар Linea просьюмер платформасы.",
    "details": [
      {
        "label": "Бренд",
        "value": "La Marzocco"
      },
      {
        "label": "Серия",
        "value": "Linea Mini R"
      },
      {
        "label": "Формат",
        "value": "Просьюмер"
      },
      {
        "label": "Мақсаты",
        "value": "Эспрессо"
      }
    ],
    "features": [
      {
        "title": "қос бойлер + PID",
        "description": "PID температура бақылауы бар қос бойлер эспрессо экстракциясының тұрақты әрі болжамды болуын қамтамасыз етеді."
      },
      {
        "title": "кірістірілген шот таймері",
        "description": "Кірістірілген таймер әр шотта су өту уақытын көзбен бақылауға мүмкіндік береді."
      },
      {
        "title": "қысымды жылдам баптау",
        "description": "Сорғы қысымын нақты кофе мен рецептке сай жылдам реттеуге болады."
      },
      {
        "title": "алдын ала сулау жүйесі",
        "description": "Екі клапанды алдын ала сулау жүйесі кофе таблеткасын жұмсақ қанықтырады және өздігінен тазаланатын ағын шектегішін қамтиды."
      },
      {
        "title": "жартылай автоматты paddle",
        "description": "Paddle интерфейсі қолмен басқару сезімін алдын ала сулауды электрондық бақылаумен біріктіреді."
      },
      {
        "title": "Home App интеграциясы",
        "description": "La Marzocco Home App қосымшасына қосылу баптау, қызмет көрсету және пайдалану мүмкіндіктерін кеңейтеді."
      }
    ],
    "specifications": [
      {
        "label": "Биіктік",
        "value": "15 in / 38 cm"
      },
      {
        "label": "Ені",
        "value": "14.2 in / 36 cm"
      },
      {
        "label": "Тереңдігі",
        "value": "21.3 in / 54 cm"
      },
      {
        "label": "Салмағы",
        "value": "66.2 lb / 30 kg"
      },
      {
        "label": "Кернеу",
        "value": "120V немесе 220–240V, бір фаза"
      },
      {
        "label": "Ең жоғары қуат",
        "value": "1800 W (120V) / 1770-2100 W (220-240V)"
      },
      {
        "label": "Бу бойлері",
        "value": "3-3.5 L"
      },
      {
        "label": "Су ыдысы",
        "value": "2.5 L"
      }
    ]
  },
  {
    "slug": "linea-pb-av-2-group",
    "type": "equipment",
    "name": "Linea PB AV 2 Group",
    "category": "Кәсіби кофемашина",
    "status": "Тапсырыспен",
    "description": "Кофеханадағы тұрақты ағынға арналған екі топты көлемдік мөлшерлеу конфигурациясы: таныс PB пішіні, тот баспайтын болат әрлеуі және сервиске ыңғайлы эргономика.",
    "details": [
      {
        "label": "Бренд",
        "value": "La Marzocco"
      },
      {
        "label": "Серия",
        "value": "Linea PB AV"
      },
      {
        "label": "Топтар",
        "value": "2 топ"
      },
      {
        "label": "Басқару",
        "value": "Автоматты көлемдік"
      }
    ],
    "features": [
      {
        "title": "сатурацияланған топтар",
        "description": "Дайындау кезінде су кофе бойлерінен шықпайды, сондықтан әр шотта температура тұрақты сақталады."
      },
      {
        "title": "қос PID",
        "description": "Дәлірек баптау үшін кофе және бу бойлерлерінің температурасын тәуелсіз электрондық бақылау."
      },
      {
        "title": "цифрлық дисплей",
        "description": "Температураны көрсету, шот таймерлері, су ағыны импульстерінің есептегіші және түсінікті бағдарламалау параметрлерді өзгертуді жеңілдетеді."
      },
      {
        "title": "Piero топ қақпақтары",
        "description": "Топқа біріктірілген шығын өлшегіштер көлемдік мөлшерлеу дәлдігін және күнделікті нәтиженің тұрақтылығын жақсартады."
      },
      {
        "title": "алдын ала қыздыру жүйесі",
        "description": "Су кофе бойлеріне түспес бұрын қызады, бұл ең қарбалас уақытта өнімділікті арттырады."
      },
      {
        "title": "баристаға арналған жарық",
        "description": "LED жарығы экстракция кезінде топ пен кесені жақсырақ көруге көмектеседі."
      }
    ],
    "specifications": [
      {
        "label": "Биіктік",
        "value": "21 in / 53.3 cm"
      },
      {
        "label": "Ені",
        "value": "28 in / 71 cm"
      },
      {
        "label": "Тереңдігі",
        "value": "23 in / 59 cm"
      },
      {
        "label": "Салмағы",
        "value": "134.5 lb / 61 kg"
      },
      {
        "label": "Қуаты",
        "value": "4600 W"
      },
      {
        "label": "Кофе бойлері",
        "value": "3.4 L"
      },
      {
        "label": "Бу бойлері",
        "value": "7 L"
      }
    ]
  },
  {
    "slug": "linea-classic-s-av-2-group",
    "type": "equipment",
    "name": "Linea Classic S AV 2 Group",
    "category": "Кәсіби кофемашина",
    "status": "Тапсырыспен",
    "description": "Сенімді жұмыс тәртібі мен уақыт сынынан өткен сыртқы келбет қажет қарбалас барларға арналған AV конфигурациясындағы ең танымал Linea пішіні.",
    "details": [
      {
        "label": "Бренд",
        "value": "La Marzocco"
      },
      {
        "label": "Серия",
        "value": "Linea Classic S AV"
      },
      {
        "label": "Топтар",
        "value": "2 топ"
      },
      {
        "label": "Басқару",
        "value": "Автоматты көлемдік"
      }
    ],
    "features": [
      {
        "title": "қос бойлер",
        "description": "Бөлек кофе және бу бойлерлері бір уақытта тұрақты эспрессо дайындауға және сүт көпіртуге мүмкіндік береді."
      },
      {
        "title": "қос PID",
        "description": "Екі бойлердің температурасын электрондық бақылау баптауды дәлірек әрі тұрақты етеді."
      },
      {
        "title": "сатурацияланған топтар",
        "description": "Топ құрылымы үздіксіз жұмыс кезінде дайындау температурасын тұрақты сақтауға арналған."
      },
      {
        "title": "3 батырмалы интерфейс",
        "description": "AV нұсқасындағы сол жақ топ батырмалары немесе EE нұсқасындағы электрондық панель бағдарламалау мен басқаруға қолданылады."
      },
      {
        "title": "Pro App қолдауы",
        "description": "Электрондық тақта машинаны басқару және бақылау үшін La Marzocco Pro App қосымшасына қосылуды қолдайды."
      },
      {
        "title": "су датчигі",
        "description": "Кіріс судың өткізгіштігі мен қаттылығын бақылау қызмет көрсетуді дәлірек жоспарлауға көмектеседі."
      }
    ],
    "specifications": [
      {
        "label": "Биіктік",
        "value": "20.5 in / 44.5 cm"
      },
      {
        "label": "Ені",
        "value": "27.3 in / 69.3 cm"
      },
      {
        "label": "Тереңдігі",
        "value": "23 in / 58.5 cm"
      },
      {
        "label": "Салмағы",
        "value": "130 lb / 59 kg"
      },
      {
        "label": "Ең төменгі қуат",
        "value": "3350 W"
      },
      {
        "label": "Ең жоғары қуат",
        "value": "5670 W"
      },
      {
        "label": "Кофе бойлері",
        "value": "3.4 L"
      },
      {
        "label": "Бу бойлері",
        "value": "7 L"
      }
    ]
  },
  {
    "slug": "gb5-s-av-2-group",
    "type": "equipment",
    "name": "GB5 S AV 2 Group",
    "category": "Кәсіби кофемашина",
    "status": "Тапсырыспен",
    "description": "Иілген корпусы, AV басқаруы және айқын алдыңғы бөлшегі бар GB5 — бардың классикалық көрнекі орталығын іздейтін мекемелерге арналған.",
    "details": [
      {
        "label": "Бренд",
        "value": "La Marzocco"
      },
      {
        "label": "Серия",
        "value": "GB5 S AV"
      },
      {
        "label": "Топтар",
        "value": "2 топ"
      },
      {
        "label": "Басқару",
        "value": "Автоматты көлемдік"
      }
    ],
    "features": [
      {
        "title": "қос бойлер",
        "description": "Эспрессо мен буға арналған бөлек бойлерлер үздіксіз жұмыс кезінде машинаның тұрақтылығын сақтайды."
      },
      {
        "title": "қос PID",
        "description": "Дәлірек калибрлеу үшін кофе мен бу температуралары электронды реттеледі."
      },
      {
        "title": "Piero топ қақпақтары",
        "description": "Жаңартылған ішкі су жолы мен шығын өлшегіштің орналасуы температура тұрақтылығын жақсартады."
      },
      {
        "title": "цифрлық дисплей",
        "description": "Түсінікті цифрлық интерфейс машина параметрлерін баптауды және жұмысын бақылауды жеңілдетеді."
      },
      {
        "title": "жарықтығы реттелетін шам",
        "description": "Үш режимді LED жарығы топты жақсы көру үшін eco, on және brewing режимдерін қолдайды."
      },
      {
        "title": "жылдам қызмет көрсетілетін бу клапаны",
        "description": "Бу клапаны бүкіл торапты шешпей, алдыңғы жағынан қызмет көрсетуге лайықталған."
      }
    ],
    "specifications": [
      {
        "label": "Биіктік",
        "value": "21.4 in / 54.4 cm"
      },
      {
        "label": "Ені",
        "value": "30 in / 77 cm"
      },
      {
        "label": "Тереңдігі",
        "value": "25 in / 64 cm"
      },
      {
        "label": "Салмағы",
        "value": "154 lb / 70 kg"
      },
      {
        "label": "Ең төменгі қуат",
        "value": "3730 W"
      },
      {
        "label": "Ең жоғары қуат",
        "value": "5445 W"
      },
      {
        "label": "Кофе бойлері",
        "value": "3.4 L"
      },
      {
        "label": "Бу бойлері",
        "value": "7 L"
      }
    ]
  },
  {
    "slug": "gb5-s-ee-2-group",
    "type": "equipment",
    "name": "GB5 S EE 2 Group",
    "category": "Кәсіби кофемашина",
    "status": "Тапсырыспен",
    "description": "Экстракцияны қолмен көбірек бақылауды және танымал классикалық келбетті қалайтындарға арналған, айқын корпусы сақталған GB5 қолмен басқарылатын нұсқасы.",
    "details": [
      {
        "label": "Бренд",
        "value": "La Marzocco"
      },
      {
        "label": "Серия",
        "value": "GB5 S EE"
      },
      {
        "label": "Топтар",
        "value": "2 топ"
      },
      {
        "label": "Басқару",
        "value": "Жартылай автоматты"
      }
    ],
    "features": [
      {
        "title": "қос бойлер",
        "description": "Эспрессо мен буға арналған бөлек бойлерлер үздіксіз жұмыс кезінде машинаның тұрақтылығын сақтайды."
      },
      {
        "title": "қос PID",
        "description": "Дәлірек калибрлеу үшін кофе мен бу температуралары электронды реттеледі."
      },
      {
        "title": "Piero топ қақпақтары",
        "description": "Жаңартылған ішкі су жолы мен шығын өлшегіштің орналасуы температура тұрақтылығын жақсартады."
      },
      {
        "title": "цифрлық дисплей",
        "description": "Түсінікті цифрлық интерфейс машина параметрлерін баптауды және жұмысын бақылауды жеңілдетеді."
      },
      {
        "title": "жарықтығы реттелетін шам",
        "description": "Үш режимді LED жарығы топты жақсы көру үшін eco, on және brewing режимдерін қолдайды."
      },
      {
        "title": "жылдам қызмет көрсетілетін бу клапаны",
        "description": "Бу клапаны бүкіл торапты шешпей, алдыңғы жағынан қызмет көрсетуге лайықталған."
      }
    ],
    "specifications": [
      {
        "label": "Биіктік",
        "value": "21.4 in / 54.4 cm"
      },
      {
        "label": "Ені",
        "value": "30 in / 77 cm"
      },
      {
        "label": "Тереңдігі",
        "value": "25 in / 64 cm"
      },
      {
        "label": "Салмағы",
        "value": "154 lb / 70 kg"
      },
      {
        "label": "Ең төменгі қуат",
        "value": "3730 W"
      },
      {
        "label": "Ең жоғары қуат",
        "value": "5445 W"
      },
      {
        "label": "Кофе бойлері",
        "value": "3.4 L"
      },
      {
        "label": "Бу бойлері",
        "value": "7 L"
      }
    ]
  }
]
$kazakh$::jsonb)
  LOOP
    SELECT id, status INTO product_record FROM public.products
      WHERE slug = item->>'slug' AND type::text = item->>'type' FOR UPDATE;
    IF NOT FOUND THEN CONTINUE; END IF;

    INSERT INTO public.product_translations
      (product_id, locale, name, size, notes, description, category, status_label)
    VALUES (
      product_record.id, 'kz', item->>'name', item->>'size', item->>'notes',
      COALESCE(item->>'description', ''), item->>'category',
      CASE WHEN item->>'type' = 'equipment' THEN CASE product_record.status::text
        WHEN 'in_stock' THEN 'Қолда бар'
        WHEN 'out_of_stock' THEN 'Қолда жоқ'
        ELSE 'Тапсырыспен' END ELSE NULL END
    )
    ON CONFLICT (product_id, locale) DO NOTHING
    RETURNING id INTO translation_id;

    IF translation_id IS NOT NULL THEN
      INSERT INTO public.product_details (product_id, locale, kind, label, value, sort_order)
      SELECT product_record.id, 'kz', 'detail', entry->>'label', entry->>'value', (position - 1)::integer
      FROM jsonb_array_elements(COALESCE(item->'details', '[]'::jsonb)) WITH ORDINALITY AS entries(entry, position);

      INSERT INTO public.product_details (product_id, locale, kind, label, value, sort_order)
      SELECT product_record.id, 'kz', 'specification', entry->>'label', entry->>'value', (position - 1)::integer
      FROM jsonb_array_elements(COALESCE(item->'specifications', '[]'::jsonb)) WITH ORDINALITY AS entries(entry, position);

      INSERT INTO public.product_features (product_id, locale, title, description, sort_order)
      SELECT product_record.id, 'kz', entry->>'title', entry->>'description', (position - 1)::integer
      FROM jsonb_array_elements(COALESCE(item->'features', '[]'::jsonb)) WITH ORDINALITY AS entries(entry, position);

      UPDATE public.products SET updated_at = now() WHERE id = product_record.id;
    END IF;
  END LOOP;
END;
$migration$;
COMMIT;
