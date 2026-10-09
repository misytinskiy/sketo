-- Add two verified features to equipment with the original four features.
-- Locales: ru/en/kz. Run the entire file. Safe to rerun; no existing rows updated.
BEGIN;
LOCK TABLE public.product_features IN SHARE ROW EXCLUSIVE MODE;
CREATE TEMP TABLE feature_addition_report (
 requested_slug text, actual_slug text, locale text,
 before_count integer, after_count integer, added integer, status text
) ON COMMIT DROP;
DO $patch$
DECLARE
 payload jsonb := $features$[
  {
    "slug": "appia-life-s-2-group",
    "name": "Appia Life S 2 Group",
    "brand": "nuova-simonelli",
    "equipment_type": "espresso-machine",
    "aliases": [
      "appialifes2group",
      "nuovasimonelliappialife2grs",
      "nuovasimonelliappialifes2group"
    ],
    "sources": [
      "https://nuovasimonelli.com/es/machine/appia-life-2/"
    ],
    "translations": {
      "ru": {
        "expected_titles": [
          "контроль пролива",
          "мягкая предынфузия",
          "теплоизоляция бойлера",
          "горячая вода"
        ],
        "additions": [
          {
            "title": "рычаг подачи пара",
            "description": "Подача пара управляется удобным движением рычага."
          },
          {
            "title": "зеркальная панель",
            "description": "Отражающая панель помогает следить за проливом из портафильтра."
          }
        ]
      },
      "en": {
        "expected_titles": [
          "extraction control",
          "soft infusion",
          "boiler insulation",
          "hot water"
        ],
        "additions": [
          {
            "title": "steam lever",
            "description": "A convenient lever controls steam delivery."
          },
          {
            "title": "mirror panel",
            "description": "The reflective panel helps monitor extraction from the portafilter."
          }
        ]
      },
      "kz": {
        "expected_titles": [
          "су беруді басқару",
          "жұмсақ алдын ала сулау",
          "бойлердің жылу оқшаулауы",
          "ыстық су"
        ],
        "additions": [
          {
            "title": "бу беру тұтқасы",
            "description": "Бу беру ыңғайлы тұтқамен басқарылады."
          },
          {
            "title": "айна панелі",
            "description": "Шағылыстыратын панель портафильтрден кофе ағуын бақылауға көмектеседі."
          }
        ]
      }
    }
  },
  {
    "slug": "appia-life-v-2-group",
    "name": "Appia Life V 2 Group",
    "brand": "nuova-simonelli",
    "equipment_type": "espresso-machine",
    "aliases": [
      "appialifev2group",
      "nuovasimonelliappialife2grv",
      "nuovasimonelliappialifev2group"
    ],
    "sources": [
      "https://nuovasimonelli.com/es/machine/appia-life-2/"
    ],
    "translations": {
      "ru": {
        "expected_titles": [
          "объёмное дозирование",
          "мягкая предынфузия",
          "теплоизоляция бойлера",
          "горячая вода"
        ],
        "additions": [
          {
            "title": "рычаг подачи пара",
            "description": "Подача пара управляется удобным движением рычага."
          },
          {
            "title": "зеркальная панель",
            "description": "Отражающая панель помогает следить за проливом из портафильтра."
          }
        ]
      },
      "en": {
        "expected_titles": [
          "volumetric dosing",
          "soft infusion",
          "boiler insulation",
          "hot water"
        ],
        "additions": [
          {
            "title": "steam lever",
            "description": "A convenient lever controls steam delivery."
          },
          {
            "title": "mirror panel",
            "description": "The reflective panel helps monitor extraction from the portafilter."
          }
        ]
      },
      "kz": {
        "expected_titles": [
          "көлемдік мөлшерлеу",
          "жұмсақ алдын ала сулау",
          "бойлердің жылу оқшаулауы",
          "ыстық су"
        ],
        "additions": [
          {
            "title": "бу беру тұтқасы",
            "description": "Бу беру ыңғайлы тұтқамен басқарылады."
          },
          {
            "title": "айна панелі",
            "description": "Шағылыстыратын панель портафильтрден кофе ағуын бақылауға көмектеседі."
          }
        ]
      }
    }
  },
  {
    "slug": "aurelia-wave-v-2-group",
    "name": "Aurelia Wave V 2 Group",
    "brand": "nuova-simonelli",
    "equipment_type": "espresso-machine",
    "aliases": [
      "aureliawavev2gr",
      "aureliawavev2group",
      "nuovasimonelliaureliawavev2group"
    ],
    "sources": [
      "https://nuovasimonelli.com/en/machine/aurelia-wave/"
    ],
    "translations": {
      "ru": {
        "expected_titles": [
          "объёмное дозирование",
          "теплоизоляция бойлера",
          "горячая вода",
          "автоматическая промывка"
        ],
        "additions": [
          {
            "title": "рычаг подачи пара",
            "description": "Подача пара управляется удобным движением рычага."
          },
          {
            "title": "зеркальная панель",
            "description": "Отражающая панель помогает следить за проливом из портафильтра."
          }
        ]
      },
      "en": {
        "expected_titles": [
          "volumetric dosing",
          "boiler insulation",
          "hot water",
          "automatic cleaning"
        ],
        "additions": [
          {
            "title": "steam lever",
            "description": "A convenient lever controls steam delivery."
          },
          {
            "title": "mirror panel",
            "description": "The reflective panel helps monitor extraction from the portafilter."
          }
        ]
      },
      "kz": {
        "expected_titles": [
          "көлемдік мөлшерлеу",
          "бойлердің жылу оқшаулауы",
          "ыстық су",
          "автоматты шаю"
        ],
        "additions": [
          {
            "title": "бу беру тұтқасы",
            "description": "Бу беру ыңғайлы тұтқамен басқарылады."
          },
          {
            "title": "айна панелі",
            "description": "Шағылыстыратын панель портафильтрден кофе ағуын бақылауға көмектеседі."
          }
        ]
      }
    }
  },
  {
    "slug": "aurelia-wave-t3-2-group",
    "name": "Aurelia Wave T3 2 Group",
    "brand": "nuova-simonelli",
    "equipment_type": "espresso-machine",
    "aliases": [
      "aureliawavet32gr",
      "aureliawavet32group",
      "nuovasimonelliaureliawavet32group"
    ],
    "sources": [
      "https://nuovasimonelli.com/en/machine/aurelia-wave/"
    ],
    "translations": {
      "ru": {
        "expected_titles": [
          "система T3",
          "сенсорное управление",
          "объёмное дозирование",
          "горячая вода"
        ],
        "additions": [
          {
            "title": "рычаг подачи пара",
            "description": "Подача пара управляется удобным движением рычага."
          },
          {
            "title": "зеркальная панель",
            "description": "Отражающая панель помогает следить за проливом из портафильтра."
          }
        ]
      },
      "en": {
        "expected_titles": [
          "T3 system",
          "touch controls",
          "volumetric dosing",
          "hot water"
        ],
        "additions": [
          {
            "title": "steam lever",
            "description": "A convenient lever controls steam delivery."
          },
          {
            "title": "mirror panel",
            "description": "The reflective panel helps monitor extraction from the portafilter."
          }
        ]
      },
      "kz": {
        "expected_titles": [
          "T3 жүйесі",
          "сенсорлық басқару",
          "көлемдік мөлшерлеу",
          "ыстық су"
        ],
        "additions": [
          {
            "title": "бу беру тұтқасы",
            "description": "Бу беру ыңғайлы тұтқамен басқарылады."
          },
          {
            "title": "айна панелі",
            "description": "Шағылыстыратын панель портафильтрден кофе ағуын бақылауға көмектеседі."
          }
        ]
      }
    }
  },
  {
    "slug": "eureka-firenze-75",
    "name": "Firenze 75",
    "brand": "eureka",
    "equipment_type": "grinder",
    "aliases": [
      "eurekafirenze75",
      "firenze75"
    ],
    "sources": [
      "https://www.eureka.co.it/it/products/eureka%2B1920/commercial%2Bgrinders/firenze%2Brange/104/"
    ],
    "translations": {
      "ru": {
        "expected_titles": [
          "плавная регулировка",
          "сенсорное управление",
          "держатель портафильтра",
          "система ACE"
        ],
        "additions": [
          {
            "title": "подсветка портафильтра",
            "description": "Подсветка рабочей зоны улучшает видимость при дозировании кофе."
          },
          {
            "title": "напоминание об обслуживании",
            "description": "Напоминание о замене жерновов настраивается под установленный комплект."
          }
        ]
      },
      "en": {
        "expected_titles": [
          "stepless adjustment",
          "touch controls",
          "portafilter holder",
          "ACE system"
        ],
        "additions": [
          {
            "title": "portafilter lighting",
            "description": "Work area lighting improves visibility while dosing coffee."
          },
          {
            "title": "maintenance reminder",
            "description": "The burr replacement reminder can be configured for the installed burr set."
          }
        ]
      },
      "kz": {
        "expected_titles": [
          "бірқалыпты реттеу",
          "сенсорлық басқару",
          "портафильтр ұстағышы",
          "ACE жүйесі"
        ],
        "additions": [
          {
            "title": "портафильтр жарығы",
            "description": "Жұмыс аймағының жарығы кофе мөлшерлеу кезінде көрінуді жақсартады."
          },
          {
            "title": "қызмет көрсету еске салғышы",
            "description": "Диірмен тастарын ауыстыру еске салғышы орнатылған жинаққа сай реттеледі."
          }
        ]
      }
    }
  },
  {
    "slug": "anfim-luna",
    "name": "Luna",
    "brand": "anfim",
    "equipment_type": "grinder",
    "aliases": [
      "anfimluna",
      "luna"
    ],
    "sources": [
      "https://www.anfim-milano.com/en/product/luna"
    ],
    "translations": {
      "ru": {
        "expected_titles": [
          "сенсорное управление",
          "плавная регулировка",
          "программируемые дозы",
          "съёмный носик"
        ],
        "additions": [
          {
            "title": "защита настроек",
            "description": "Защита паролем ограничивает доступ к изменению рецептов."
          },
          {
            "title": "доступ для обслуживания",
            "description": "Удобный доступ к основным узлам упрощает сервисное обслуживание."
          }
        ]
      },
      "en": {
        "expected_titles": [
          "touch controls",
          "stepless adjustment",
          "programmable doses",
          "removable spout"
        ],
        "additions": [
          {
            "title": "protected settings",
            "description": "Password protection restricts access to recipe changes."
          },
          {
            "title": "service access",
            "description": "Easy access to key components simplifies servicing."
          }
        ]
      },
      "kz": {
        "expected_titles": [
          "сенсорлық басқару",
          "бірқалыпты реттеу",
          "бағдарламаланатын мөлшерлер",
          "алынбалы шүмек"
        ],
        "additions": [
          {
            "title": "баптауларды қорғау",
            "description": "Құпиясөз рецептілерді өзгертуге қолжетімділікті шектейді."
          },
          {
            "title": "қызмет көрсетуге қолжетімділік",
            "description": "Негізгі тораптарға ыңғайлы қолжетімділік қызмет көрсетуді жеңілдетеді."
          }
        ]
      }
    }
  },
  {
    "slug": "mazzer-super-jolly-v-up-electronic",
    "name": "Super Jolly V Up Electronic",
    "brand": "mazzer",
    "equipment_type": "grinder",
    "aliases": [
      "mazzersuperjollyvupelectronic",
      "superjollyvupelectronic"
    ],
    "sources": [
      "https://www.mazzer.com/wp-content/uploads/2021/10/depliant-Super-Jolly-V-Up-2022-ELECTRONIC-ENG-split-pages.pdf"
    ],
    "translations": {
      "ru": {
        "expected_titles": [
          "сенсорное управление",
          "плавная регулировка",
          "система GFC",
          "держатель портафильтра"
        ],
        "additions": [
          {
            "title": "три программируемые дозы",
            "description": "Можно сохранить три дозы для разных рецептов приготовления."
          },
          {
            "title": "счётчик порций",
            "description": "Общий и промежуточный счётчики помогают контролировать количество приготовленных доз."
          }
        ]
      },
      "en": {
        "expected_titles": [
          "touch controls",
          "stepless adjustment",
          "GFC system",
          "portafilter holder"
        ],
        "additions": [
          {
            "title": "three programmable doses",
            "description": "Three doses can be stored for different brewing recipes."
          },
          {
            "title": "dose counters",
            "description": "Total and partial counters help track the number of doses prepared."
          }
        ]
      },
      "kz": {
        "expected_titles": [
          "сенсорлық басқару",
          "бірқалыпты реттеу",
          "GFC жүйесі",
          "портафильтр ұстағышы"
        ],
        "additions": [
          {
            "title": "бағдарламаланатын үш мөлшер",
            "description": "Әртүрлі дайындау рецептілеріне арналған үш мөлшерді сақтауға болады."
          },
          {
            "title": "мөлшер санағыштары",
            "description": "Жалпы және аралық санағыштар дайындалған мөлшерлер санын бақылауға көмектеседі."
          }
        ]
      }
    }
  },
  {
    "slug": "mazzer-super-jolly-v-pro-electronic",
    "name": "Super Jolly V Pro Electronic",
    "brand": "mazzer",
    "equipment_type": "grinder",
    "aliases": [
      "mazzersuperjollyvproelectronic",
      "superjollyvproelectronic"
    ],
    "sources": [
      "https://www.mazzer.com/wp-content/uploads/2021/07/depliant_Super_Jolly_V_2021_ELECTRONIC_ENG_split_pages_WEB.pdf"
    ],
    "translations": {
      "ru": {
        "expected_titles": [
          "программируемые дозы",
          "плавная регулировка",
          "система GFC",
          "удобная очистка"
        ],
        "additions": [
          {
            "title": "активное охлаждение",
            "description": "Вентиляция помогает ограничить нагрев кофемолки при интенсивной работе."
          },
          {
            "title": "стальные жернова 64 мм",
            "description": "Плоские стальные жернова диаметром 64 мм обеспечивают помол кофе."
          }
        ]
      },
      "en": {
        "expected_titles": [
          "programmable doses",
          "stepless adjustment",
          "GFC system",
          "easy cleaning"
        ],
        "additions": [
          {
            "title": "active cooling",
            "description": "Ventilation helps limit grinder heat during intensive use."
          },
          {
            "title": "64 mm steel burrs",
            "description": "Flat 64 mm steel burrs grind the coffee."
          }
        ]
      },
      "kz": {
        "expected_titles": [
          "бағдарламаланатын мөлшерлер",
          "бірқалыпты реттеу",
          "GFC жүйесі",
          "ыңғайлы тазалау"
        ],
        "additions": [
          {
            "title": "белсенді салқындату",
            "description": "Желдету қарқынды жұмыс кезінде кофе тартқыштың қызуын азайтуға көмектеседі."
          },
          {
            "title": "64 мм болат диірмен тастары",
            "description": "Диаметрі 64 мм жалпақ болат диірмен тастары кофені ұнтақтайды."
          }
        ]
      }
    }
  },
  {
    "slug": "mazzer-major-v-electronic",
    "name": "Major V Electronic",
    "brand": "mazzer",
    "equipment_type": "grinder",
    "aliases": [
      "majorvelectronic",
      "mazzermajorvelectronic"
    ],
    "sources": [
      "https://www.mazzer.com/en/blocchi-prodotto/blocco-features-major-v-el/",
      "https://www.mazzer.com/en/blocchi-prodotto/highlight-major-v-el/"
    ],
    "translations": {
      "ru": {
        "expected_titles": [
          "плавная регулировка",
          "программируемые дозы",
          "система GFC",
          "активное охлаждение"
        ],
        "additions": [
          {
            "title": "держатель портафильтра",
            "description": "Регулируемая опора удерживает портафильтр во время помола."
          },
          {
            "title": "очистка без потери настройки",
            "description": "Доступ к камере помола позволяет проводить очистку с сохранением установленного помола."
          }
        ]
      },
      "en": {
        "expected_titles": [
          "stepless adjustment",
          "programmable doses",
          "GFC system",
          "active cooling"
        ],
        "additions": [
          {
            "title": "portafilter holder",
            "description": "An adjustable support holds the portafilter during grinding."
          },
          {
            "title": "cleaning without losing settings",
            "description": "Access to the grinding chamber allows cleaning while preserving the grind setting."
          }
        ]
      },
      "kz": {
        "expected_titles": [
          "бірқалыпты реттеу",
          "бағдарламаланатын мөлшерлер",
          "GFC жүйесі",
          "белсенді салқындату"
        ],
        "additions": [
          {
            "title": "портафильтр ұстағышы",
            "description": "Реттелетін тірек ұнтақтау кезінде портафильтрді ұстап тұрады."
          },
          {
            "title": "баптауды сақтап тазалау",
            "description": "Ұнтақтау камерасына қолжетімділік ұнтақтау баптауын сақтай отырып тазалауға мүмкіндік береді."
          }
        ]
      }
    }
  },
  {
    "slug": "mazzer-major-vp-electronic",
    "name": "Major VP Electronic",
    "brand": "mazzer",
    "equipment_type": "grinder",
    "aliases": [
      "majorvpelectronic",
      "mazzermajorvpelectronic"
    ],
    "sources": [
      "https://www.mazzer.com/wp-content/uploads/2021/07/depliant-Major-VP-2023-ENG-split-pages-WEB-1.pdf"
    ],
    "translations": {
      "ru": {
        "expected_titles": [
          "плавная регулировка",
          "программируемые дозы",
          "система GFC",
          "активное охлаждение"
        ],
        "additions": [
          {
            "title": "держатель портафильтра",
            "description": "Регулируемая опора удерживает портафильтр во время помола."
          },
          {
            "title": "очистка без потери настройки",
            "description": "Доступ к камере помола позволяет проводить очистку с сохранением установленного помола."
          }
        ]
      },
      "en": {
        "expected_titles": [
          "stepless adjustment",
          "programmable doses",
          "GFC system",
          "active cooling"
        ],
        "additions": [
          {
            "title": "portafilter holder",
            "description": "An adjustable support holds the portafilter during grinding."
          },
          {
            "title": "cleaning without losing settings",
            "description": "Access to the grinding chamber allows cleaning while preserving the grind setting."
          }
        ]
      },
      "kz": {
        "expected_titles": [
          "бірқалыпты реттеу",
          "бағдарламаланатын мөлшерлер",
          "GFC жүйесі",
          "белсенді салқындату"
        ],
        "additions": [
          {
            "title": "портафильтр ұстағышы",
            "description": "Реттелетін тірек ұнтақтау кезінде портафильтрді ұстап тұрады."
          },
          {
            "title": "баптауды сақтап тазалау",
            "description": "Ұнтақтау камерасына қолжетімділік ұнтақтау баптауын сақтай отырып тазалауға мүмкіндік береді."
          }
        ]
      }
    }
  },
  {
    "slug": "mazzer-kony-s-electronic",
    "name": "Kony S Electronic",
    "brand": "mazzer",
    "equipment_type": "grinder",
    "aliases": [
      "konyselectronic",
      "mazzerkonyselectronic"
    ],
    "sources": [
      "https://elmont.si/wp-content/uploads/2023/01/Mazzer-products-range.pdf"
    ],
    "translations": {
      "ru": {
        "expected_titles": [
          "плавная регулировка",
          "программируемые дозы",
          "система GFC",
          "удобная очистка"
        ],
        "additions": [
          {
            "title": "активное охлаждение",
            "description": "Вентиляция помогает ограничить нагрев кофемолки при интенсивной работе."
          },
          {
            "title": "держатель портафильтра",
            "description": "Регулируемая опора удерживает портафильтр во время помола."
          }
        ]
      },
      "en": {
        "expected_titles": [
          "stepless adjustment",
          "programmable doses",
          "GFC system",
          "easy cleaning"
        ],
        "additions": [
          {
            "title": "active cooling",
            "description": "Ventilation helps limit grinder heat during intensive use."
          },
          {
            "title": "portafilter holder",
            "description": "An adjustable support holds the portafilter during grinding."
          }
        ]
      },
      "kz": {
        "expected_titles": [
          "бірқалыпты реттеу",
          "бағдарламаланатын мөлшерлер",
          "GFC жүйесі",
          "ыңғайлы тазалау"
        ],
        "additions": [
          {
            "title": "белсенді салқындату",
            "description": "Желдету қарқынды жұмыс кезінде кофе тартқыштың қызуын азайтуға көмектеседі."
          },
          {
            "title": "портафильтр ұстағышы",
            "description": "Реттелетін тірек ұнтақтау кезінде портафильтрді ұстап тұрады."
          }
        ]
      }
    }
  },
  {
    "slug": "mazzer-kony-sg-electronic",
    "name": "Kony Sg Electronic",
    "brand": "mazzer",
    "equipment_type": "grinder",
    "aliases": [
      "konysgelectronic",
      "mazzerkonysgelectronic"
    ],
    "sources": [
      "https://www.mazzer.com/wp-content/uploads/2023/10/depliant-Kony-Sg-ENG-ITA-web-2.pdf"
    ],
    "translations": {
      "ru": {
        "expected_titles": [
          "дозирование по весу",
          "плавная регулировка",
          "система GFC",
          "активное охлаждение"
        ],
        "additions": [
          {
            "title": "автоматическая пауза",
            "description": "При снятии портафильтра дозирование автоматически приостанавливается."
          },
          {
            "title": "держатель портафильтра",
            "description": "Регулируемая опора удерживает портафильтр во время помола."
          }
        ]
      },
      "en": {
        "expected_titles": [
          "grind by weight",
          "stepless adjustment",
          "GFC system",
          "active cooling"
        ],
        "additions": [
          {
            "title": "automatic pause",
            "description": "Dosing pauses automatically when the portafilter is removed."
          },
          {
            "title": "portafilter holder",
            "description": "An adjustable support holds the portafilter during grinding."
          }
        ]
      },
      "kz": {
        "expected_titles": [
          "салмақ бойынша мөлшерлеу",
          "бірқалыпты реттеу",
          "GFC жүйесі",
          "белсенді салқындату"
        ],
        "additions": [
          {
            "title": "автоматты кідіріс",
            "description": "Портафильтр алынғанда мөлшерлеу автоматты түрде тоқтайды."
          },
          {
            "title": "портафильтр ұстағышы",
            "description": "Реттелетін тірек ұнтақтау кезінде портафильтрді ұстап тұрады."
          }
        ]
      }
    }
  },
  {
    "slug": "mazzer-philos",
    "name": "Philos",
    "brand": "mazzer",
    "equipment_type": "grinder",
    "aliases": [
      "mazzerphilos",
      "philos"
    ],
    "sources": [
      "https://shop-au.mazzer.com/products/philos"
    ],
    "translations": {
      "ru": {
        "expected_titles": [
          "удобная очистка",
          "два режима регулировки",
          "разовая загрузка",
          "очистка выходного канала"
        ],
        "additions": [
          {
            "title": "подавление вибраций",
            "description": "Система демпфирования снижает вибрации во время работы кофемолки."
          },
          {
            "title": "стальные жернова 64 мм",
            "description": "Плоские стальные жернова диаметром 64 мм обеспечивают помол кофе."
          }
        ]
      },
      "en": {
        "expected_titles": [
          "easy cleaning",
          "two adjustment modes",
          "single dosing",
          "chute cleaning"
        ],
        "additions": [
          {
            "title": "vibration damping",
            "description": "A damping system reduces vibration while the grinder is running."
          },
          {
            "title": "64 mm steel burrs",
            "description": "Flat 64 mm steel burrs grind the coffee."
          }
        ]
      },
      "kz": {
        "expected_titles": [
          "ыңғайлы тазалау",
          "екі реттеу режимі",
          "бір порциялық жүктеу",
          "шығару арнасын тазалау"
        ],
        "additions": [
          {
            "title": "дірілді бәсеңдету",
            "description": "Бәсеңдету жүйесі кофе тартқыш жұмыс істегенде дірілді азайтады."
          },
          {
            "title": "64 мм болат диірмен тастары",
            "description": "Диаметрі 64 мм жалпақ болат диірмен тастары кофені ұнтақтайды."
          }
        ]
      }
    }
  },
  {
    "slug": "mazzer-zm",
    "name": "ZM",
    "brand": "mazzer",
    "equipment_type": "grinder",
    "aliases": [
      "mazzerzm",
      "zm"
    ],
    "sources": [
      "https://www.mazzer.com/en/blocchi-prodotto/caratteristiche-zm/"
    ],
    "translations": {
      "ru": {
        "expected_titles": [
          "активное охлаждение",
          "цифровая регулировка",
          "съёмный контейнер",
          "доступ к камере"
        ],
        "additions": [
          {
            "title": "дозирование по времени",
            "description": "Время работы можно настроить для повторяемого дозирования."
          },
          {
            "title": "двойной защитный выключатель",
            "description": "В конструкции предусмотрен двойной защитный выключатель."
          }
        ]
      },
      "en": {
        "expected_titles": [
          "active cooling",
          "digital adjustment",
          "removable container",
          "chamber access"
        ],
        "additions": [
          {
            "title": "timed dosing",
            "description": "Grinding time can be configured for repeatable dosing."
          },
          {
            "title": "double safety switch",
            "description": "The grinder incorporates a double safety switch."
          }
        ]
      },
      "kz": {
        "expected_titles": [
          "белсенді салқындату",
          "цифрлық реттеу",
          "алынбалы ыдыс",
          "камераға қолжетімділік"
        ],
        "additions": [
          {
            "title": "уақыт бойынша мөлшерлеу",
            "description": "Қайталанатын мөлшерлеу үшін ұнтақтау уақытын реттеуге болады."
          },
          {
            "title": "қос қауіпсіздік ажыратқышы",
            "description": "Кофе тартқышта қос қауіпсіздік ажыратқышы қарастырылған."
          }
        ]
      }
    }
  },
  {
    "slug": "mahlkonig-ek43-s",
    "name": "EK43 S",
    "brand": "mahlkonig",
    "equipment_type": "grinder",
    "aliases": [
      "ek43s",
      "mahlkonigek43s"
    ],
    "sources": [
      "https://www.mahlkoenig.com/products/ek43-s"
    ],
    "translations": {
      "ru": {
        "expected_titles": [
          "универсальный помол",
          "держатель пакета",
          "компактная высота",
          "жернова 98 мм"
        ],
        "additions": [
          {
            "title": "равномерность помола",
            "description": "Однородное распределение частиц помогает добиться равномерной экстракции."
          },
          {
            "title": "высокая производительность",
            "description": "Производительность около 19–21 г/с зависит от зерна и настройки помола."
          }
        ]
      },
      "en": {
        "expected_titles": [
          "versatile grinding",
          "bag holder",
          "reduced height",
          "98 mm burrs"
        ],
        "additions": [
          {
            "title": "grind uniformity",
            "description": "A uniform particle distribution supports even extraction."
          },
          {
            "title": "high throughput",
            "description": "Throughput of approximately 19–21 g/s depends on the beans and grind setting."
          }
        ]
      },
      "kz": {
        "expected_titles": [
          "әмбебап ұнтақтау",
          "пакет ұстағышы",
          "аласа корпус",
          "98 мм диірмен тастары"
        ],
        "additions": [
          {
            "title": "біркелкі ұнтақтау",
            "description": "Бөлшектердің біркелкі таралуы біркелкі экстракцияға көмектеседі."
          },
          {
            "title": "жоғары өнімділік",
            "description": "Шамамен 19–21 г/с өнімділік дәнге және ұнтақтау баптауына байланысты."
          }
        ]
      }
    }
  },
  {
    "slug": "mahlkonig-e80s-gbw",
    "name": "E80S GbW",
    "brand": "mahlkonig",
    "equipment_type": "grinder",
    "aliases": [
      "e80sgbw",
      "mahlkonige80gbw",
      "mahlkonige80sgbw"
    ],
    "sources": [
      "https://downloads.mahlkoenig.de/Products/Mahlkoenig_E80S_GbW_Espresso_Grinder_Product_Sheet.pdf"
    ],
    "translations": {
      "ru": {
        "expected_titles": [
          "дозирование по весу",
          "активное охлаждение",
          "контроль зазора DDD",
          "распознавание портафильтра"
        ],
        "additions": [
          {
            "title": "подсветка выхода кофе",
            "description": "Подсвеченный регулируемый носик помогает направить кофе в центр корзины."
          },
          {
            "title": "тихая работа",
            "description": "Конструкция кофемолки рассчитана на снижение шума при помоле."
          }
        ]
      },
      "en": {
        "expected_titles": [
          "grind by weight",
          "active cooling",
          "DDD gap detection",
          "portafilter detection"
        ],
        "additions": [
          {
            "title": "illuminated spout",
            "description": "An illuminated adjustable spout helps direct coffee into the centre of the basket."
          },
          {
            "title": "quiet operation",
            "description": "The grinder is designed to reduce grinding noise."
          }
        ]
      },
      "kz": {
        "expected_titles": [
          "салмақ бойынша мөлшерлеу",
          "белсенді салқындату",
          "DDD саңылауды бақылау",
          "портафильтрді тану"
        ],
        "additions": [
          {
            "title": "кофе шығатын түтіктің жарығы",
            "description": "Жарықтандырылған реттелетін түтік кофені себеттің ортасына бағыттауға көмектеседі."
          },
          {
            "title": "тыныш жұмыс",
            "description": "Кофе тартқыштың құрылымы ұнтақтау кезіндегі шуды азайтуға арналған."
          }
        ]
      }
    }
  },
  {
    "slug": "victoria-arduino-mythos-my75-white",
    "name": "Mythos MY75 White",
    "brand": "victoria-arduino",
    "equipment_type": "grinder",
    "aliases": [
      "mythosmy75",
      "mythosmy75white",
      "victoriaarduinomythosmy75white"
    ],
    "sources": [
      "https://victoriaarduino.com/en/products-machines/mythos/"
    ],
    "translations": {
      "ru": {
        "expected_titles": [
          "сенсорное управление",
          "программируемые дозы",
          "активное охлаждение",
          "Clump Crusher"
        ],
        "additions": [
          {
            "title": "жернова 75 мм",
            "description": "Плоские жернова диаметром 75 мм рассчитаны на профессиональную работу с эспрессо."
          },
          {
            "title": "компактное размещение",
            "description": "Заднее расположение вентиляторов позволяет устанавливать кофемолки рядом друг с другом."
          }
        ]
      },
      "en": {
        "expected_titles": [
          "touch controls",
          "programmable doses",
          "active cooling",
          "Clump Crusher"
        ],
        "additions": [
          {
            "title": "75 mm burrs",
            "description": "Flat 75 mm burrs are designed for professional espresso grinding."
          },
          {
            "title": "compact placement",
            "description": "Rear-mounted fans allow grinders to be positioned side by side."
          }
        ]
      },
      "kz": {
        "expected_titles": [
          "сенсорлық басқару",
          "бағдарламаланатын мөлшерлер",
          "белсенді салқындату",
          "Clump Crusher"
        ],
        "additions": [
          {
            "title": "75 мм диірмен тастары",
            "description": "Диаметрі 75 мм жалпақ диірмен тастары кәсіби эспрессо ұнтақтауына арналған."
          },
          {
            "title": "ықшам орналастыру",
            "description": "Желдеткіштердің артта орналасуы кофе тартқыштарды қатар қоюға мүмкіндік береді."
          }
        ]
      }
    }
  },
  {
    "slug": "puqpress-m3",
    "name": "PUQpress M3",
    "brand": "puqpress",
    "equipment_type": "tamper",
    "aliases": [
      "puqpressm3",
      "puqpresspuqpressm3",
      "puqressm3"
    ],
    "sources": [
      "https://cdn.puq.coffee/media/brochures/user-manual-integrated-puq-press-2025.pdf",
      "https://puq.coffee/set-up-maintenance"
    ],
    "translations": {
      "ru": {
        "expected_titles": [
          "настройка усилия",
          "профили темперовки",
          "установка под кофемолку",
          "регулируемая опора"
        ],
        "additions": [
          {
            "title": "бесконтактный запуск",
            "description": "Датчик определяет установленный портафильтр и автоматически запускает темперовку."
          },
          {
            "title": "режим очистки",
            "description": "Кнопка переводит темпер в нижнее положение для ручной очистки рабочей поверхности."
          }
        ]
      },
      "en": {
        "expected_titles": [
          "force adjustment",
          "tamping profiles",
          "under-grinder installation",
          "adjustable support"
        ],
        "additions": [
          {
            "title": "contactless activation",
            "description": "A sensor detects the inserted portafilter and starts tamping automatically."
          },
          {
            "title": "cleaning mode",
            "description": "A button lowers the tamper for manual cleaning of its working surface."
          }
        ]
      },
      "kz": {
        "expected_titles": [
          "күшті реттеу",
          "тығыздау профильдері",
          "тартқыш астына орнату",
          "реттелетін тірек"
        ],
        "additions": [
          {
            "title": "жанасусыз іске қосу",
            "description": "Датчик орнатылған портафильтрді анықтап, тығыздауды автоматты түрде бастайды."
          },
          {
            "title": "тазалау режимі",
            "description": "Түйме жұмыс бетін қолмен тазалау үшін темперді төмен түсіреді."
          }
        ]
      }
    }
  },
  {
    "slug": "puqpress-m5",
    "name": "PUQpress M5",
    "brand": "puqpress",
    "equipment_type": "tamper",
    "aliases": [
      "puqpressm5",
      "puqpresspuqpressm5",
      "puqressm5"
    ],
    "sources": [
      "https://cdn.puq.coffee/media/brochures/user-manual-integrated-puq-press-2025.pdf",
      "https://puq.coffee/set-up-maintenance"
    ],
    "translations": {
      "ru": {
        "expected_titles": [
          "настройка усилия",
          "профили темперовки",
          "установка под кофемолку",
          "регулируемая опора"
        ],
        "additions": [
          {
            "title": "бесконтактный запуск",
            "description": "Датчик определяет установленный портафильтр и автоматически запускает темперовку."
          },
          {
            "title": "режим очистки",
            "description": "Кнопка переводит темпер в нижнее положение для ручной очистки рабочей поверхности."
          }
        ]
      },
      "en": {
        "expected_titles": [
          "force adjustment",
          "tamping profiles",
          "under-grinder installation",
          "adjustable support"
        ],
        "additions": [
          {
            "title": "contactless activation",
            "description": "A sensor detects the inserted portafilter and starts tamping automatically."
          },
          {
            "title": "cleaning mode",
            "description": "A button lowers the tamper for manual cleaning of its working surface."
          }
        ]
      },
      "kz": {
        "expected_titles": [
          "күшті реттеу",
          "тығыздау профильдері",
          "тартқыш астына орнату",
          "реттелетін тірек"
        ],
        "additions": [
          {
            "title": "жанасусыз іске қосу",
            "description": "Датчик орнатылған портафильтрді анықтап, тығыздауды автоматты түрде бастайды."
          },
          {
            "title": "тазалау режимі",
            "description": "Түйме жұмыс бетін қолмен тазалау үшін темперді төмен түсіреді."
          }
        ]
      }
    }
  },
  {
    "slug": "puqpress-m6",
    "name": "PUQpress M6",
    "brand": "puqpress",
    "equipment_type": "tamper",
    "aliases": [
      "puqpressm6",
      "puqpresspuqpressm6",
      "puqressm6"
    ],
    "sources": [
      "https://cdn.puq.coffee/media/brochures/user-manual-integrated-puq-press-2025.pdf",
      "https://puq.coffee/set-up-maintenance"
    ],
    "translations": {
      "ru": {
        "expected_titles": [
          "настройка усилия",
          "профили темперовки",
          "установка под кофемолку",
          "регулируемая опора"
        ],
        "additions": [
          {
            "title": "бесконтактный запуск",
            "description": "Датчик определяет установленный портафильтр и автоматически запускает темперовку."
          },
          {
            "title": "режим очистки",
            "description": "Кнопка переводит темпер в нижнее положение для ручной очистки рабочей поверхности."
          }
        ]
      },
      "en": {
        "expected_titles": [
          "force adjustment",
          "tamping profiles",
          "under-grinder installation",
          "adjustable support"
        ],
        "additions": [
          {
            "title": "contactless activation",
            "description": "A sensor detects the inserted portafilter and starts tamping automatically."
          },
          {
            "title": "cleaning mode",
            "description": "A button lowers the tamper for manual cleaning of its working surface."
          }
        ]
      },
      "kz": {
        "expected_titles": [
          "күшті реттеу",
          "тығыздау профильдері",
          "тартқыш астына орнату",
          "реттелетін тірек"
        ],
        "additions": [
          {
            "title": "жанасусыз іске қосу",
            "description": "Датчик орнатылған портафильтрді анықтап, тығыздауды автоматты түрде бастайды."
          },
          {
            "title": "тазалау режимі",
            "description": "Түйме жұмыс бетін қолмен тазалау үшін темперді төмен түсіреді."
          }
        ]
      }
    }
  },
  {
    "slug": "modbar-steam",
    "name": "Modbar Steam",
    "brand": "modbar",
    "equipment_type": "steam-module",
    "aliases": [
      "modbarmodbarsteam",
      "modbarsteam"
    ],
    "sources": [
      "https://lamarzoccousa.com/wp-content/uploads/2020/08/2020_USA_SalesBrochure_WebVersion.pdf"
    ],
    "translations": {
      "ru": {
        "expected_titles": [
          "модульная установка",
          "Pro Touch",
          "отдельный бойлер",
          "циркуляция воды"
        ],
        "additions": [
          {
            "title": "подвижная паровая трубка",
            "description": "Шарнирное крепление позволяет удобно менять положение паровой трубки."
          },
          {
            "title": "контроль уровня воды",
            "description": "Смотровое стекло позволяет визуально контролировать уровень воды в бойлере."
          }
        ]
      },
      "en": {
        "expected_titles": [
          "modular installation",
          "Pro Touch",
          "dedicated boiler",
          "water circulation"
        ],
        "additions": [
          {
            "title": "articulating steam wand",
            "description": "A ball joint allows convenient adjustment of the steam wand position."
          },
          {
            "title": "water level sight glass",
            "description": "A sight glass allows visual monitoring of the boiler water level."
          }
        ]
      },
      "kz": {
        "expected_titles": [
          "модульдік орнату",
          "Pro Touch",
          "бөлек бойлер",
          "су айналымы"
        ],
        "additions": [
          {
            "title": "қозғалмалы бу түтігі",
            "description": "Шарнирлі бекітпе бу түтігінің қалпын ыңғайлы өзгертуге мүмкіндік береді."
          },
          {
            "title": "су деңгейін бақылау",
            "description": "Бақылау әйнегі бойлердегі су деңгейін көзбен бақылауға мүмкіндік береді."
          }
        ]
      }
    }
  },
  {
    "slug": "la-marzocco-kb90",
    "name": "KB90",
    "brand": "la-marzocco",
    "equipment_type": "espresso-machine",
    "aliases": [
      "kb90",
      "lamarzoccokb90"
    ],
    "sources": [
      "https://au.lamarzocco.com/wp-content/uploads/2024/02/data_sheet_KB90-EN.pdf"
    ],
    "translations": {
      "ru": {
        "expected_titles": [
          "Straight-In",
          "Steam Flush",
          "PID",
          "независимые бойлеры"
        ],
        "additions": [
          {
            "title": "Pro Touch",
            "description": "Теплоизолированные паровые трубки уменьшают нагрев наружной поверхности."
          },
          {
            "title": "настройка горячей воды",
            "description": "Экономайзер позволяет регулировать температуру горячей воды для чая."
          }
        ]
      },
      "en": {
        "expected_titles": [
          "Straight-In",
          "Steam Flush",
          "PID",
          "independent boilers"
        ],
        "additions": [
          {
            "title": "Pro Touch",
            "description": "Insulated steam wands reduce heating of the outer surface."
          },
          {
            "title": "hot water adjustment",
            "description": "The economiser allows adjustment of hot water temperature for tea."
          }
        ]
      },
      "kz": {
        "expected_titles": [
          "Straight-In",
          "Steam Flush",
          "PID",
          "тәуелсіз бойлерлер"
        ],
        "additions": [
          {
            "title": "Pro Touch",
            "description": "Жылу оқшауланған бу түтіктері сыртқы беттің қызуын азайтады."
          },
          {
            "title": "ыстық суды реттеу",
            "description": "Экономайзер шайға арналған ыстық судың температурасын реттеуге мүмкіндік береді."
          }
        ]
      }
    }
  },
  {
    "slug": "mahlkonig-e65w-gbs",
    "name": "E65W GbS",
    "brand": "mahlkonig",
    "equipment_type": "grinder",
    "aliases": [
      "e65gbs",
      "e65wgbs",
      "mahlkonige65gbs",
      "mahlkonige65wgbs"
    ],
    "sources": [
      "https://www.mahlkoenig.com/products/e65w-grind-by-sync"
    ],
    "translations": {
      "ru": {
        "expected_titles": [
          "дозирование по весу",
          "Grind-by-Sync",
          "электрическая регулировка",
          "калибровка нуля"
        ],
        "additions": [
          {
            "title": "контроль зазора DDD",
            "description": "Система Disc Distance Detection помогает точно контролировать расстояние между жерновами."
          },
          {
            "title": "распознавание портафильтра",
            "description": "Встроенная система распознаёт установленный портафильтр для удобного дозирования."
          }
        ]
      },
      "en": {
        "expected_titles": [
          "grind by weight",
          "Grind-by-Sync",
          "electric adjustment",
          "zero calibration"
        ],
        "additions": [
          {
            "title": "DDD burr gap control",
            "description": "Disc Distance Detection helps precisely monitor the distance between the burrs."
          },
          {
            "title": "portafilter detection",
            "description": "An integrated system detects the inserted portafilter for convenient dosing."
          }
        ]
      },
      "kz": {
        "expected_titles": [
          "салмақ бойынша мөлшерлеу",
          "Grind-by-Sync",
          "электрлік реттеу",
          "нөлді калибрлеу"
        ],
        "additions": [
          {
            "title": "DDD саңылау бақылауы",
            "description": "Disc Distance Detection жүйесі диірмен тастары арасындағы қашықтықты дәл бақылауға көмектеседі."
          },
          {
            "title": "портафильтрді анықтау",
            "description": "Кіріктірілген жүйе ыңғайлы мөлшерлеу үшін орнатылған портафильтрді анықтайды."
          }
        ]
      }
    }
  },
  {
    "slug": "mahlkonig-e80w-gbs",
    "name": "E80W GbS",
    "brand": "mahlkonig",
    "equipment_type": "grinder",
    "aliases": [
      "e80gbs",
      "e80wgbs",
      "mahlkonige80gbs",
      "mahlkonige80wgbs"
    ],
    "sources": [
      "https://www.mahlkoenig.com/products/e80w-grind-by-sync"
    ],
    "translations": {
      "ru": {
        "expected_titles": [
          "дозирование по весу",
          "Grind-by-Sync",
          "электрическая регулировка",
          "калибровка нуля"
        ],
        "additions": [
          {
            "title": "контроль зазора DDD",
            "description": "Система Disc Distance Detection помогает точно контролировать расстояние между жерновами."
          },
          {
            "title": "распознавание портафильтра",
            "description": "Встроенная система распознаёт установленный портафильтр для удобного дозирования."
          }
        ]
      },
      "en": {
        "expected_titles": [
          "grind by weight",
          "Grind-by-Sync",
          "electric adjustment",
          "zero calibration"
        ],
        "additions": [
          {
            "title": "DDD burr gap control",
            "description": "Disc Distance Detection helps precisely monitor the distance between the burrs."
          },
          {
            "title": "portafilter detection",
            "description": "An integrated system detects the inserted portafilter for convenient dosing."
          }
        ]
      },
      "kz": {
        "expected_titles": [
          "салмақ бойынша мөлшерлеу",
          "Grind-by-Sync",
          "электрлік реттеу",
          "нөлді калибрлеу"
        ],
        "additions": [
          {
            "title": "DDD саңылау бақылауы",
            "description": "Disc Distance Detection жүйесі диірмен тастары арасындағы қашықтықты дәл бақылауға көмектеседі."
          },
          {
            "title": "портафильтрді анықтау",
            "description": "Кіріктірілген жүйе ыңғайлы мөлшерлеу үшін орнатылған портафильтрді анықтайды."
          }
        ]
      }
    }
  },
  {
    "slug": "victoria-arduino-eagle-one-2-group",
    "name": "Eagle One 2 Group",
    "brand": "victoria-arduino",
    "equipment_type": "espresso-machine",
    "aliases": [
      "eagleone2group",
      "victoriaarduinoeagleone",
      "victoriaarduinoeagleone2group"
    ],
    "sources": [
      "https://victoriaarduino.com/en/products-machines/eagle-one/"
    ],
    "translations": {
      "ru": {
        "expected_titles": [
          "NEO",
          "TERS",
          "сенсорное управление",
          "Cool Touch"
        ],
        "additions": [
          {
            "title": "сухой нагрев групп",
            "description": "Система сухого нагрева поддерживает рабочую температуру заварочных групп."
          },
          {
            "title": "двухуровневый поддон",
            "description": "Два уровня поддона позволяют удобно работать с чашками разной высоты."
          }
        ]
      },
      "en": {
        "expected_titles": [
          "NEO",
          "TERS",
          "touch controls",
          "Cool Touch"
        ],
        "additions": [
          {
            "title": "dry group heating",
            "description": "A dry heating system maintains the operating temperature of the brewing groups."
          },
          {
            "title": "two-level drip tray",
            "description": "Two tray levels accommodate cups of different heights."
          }
        ]
      },
      "kz": {
        "expected_titles": [
          "NEO",
          "TERS",
          "сенсорлық басқару",
          "Cool Touch"
        ],
        "additions": [
          {
            "title": "топтарды құрғақ қыздыру",
            "description": "Құрғақ қыздыру жүйесі қайнату топтарының жұмыс температурасын сақтайды."
          },
          {
            "title": "екі деңгейлі науа",
            "description": "Науаның екі деңгейі биіктігі әртүрлі шыныаяқтармен ыңғайлы жұмыс істеуге мүмкіндік береді."
          }
        ]
      }
    }
  },
  {
    "slug": "victoria-arduino-eagle-tempo-neo-2-group",
    "name": "Eagle Tempo Neo 2 Group",
    "brand": "victoria-arduino",
    "equipment_type": "espresso-machine",
    "aliases": [
      "eagletempo2gr",
      "eagletemponeo2group",
      "victoriaarduinoeagletempo2gr",
      "victoriaarduinoeagletemponeo2group"
    ],
    "sources": [
      "https://victoriaarduino.com/en/products-machines/eagle-tempo/"
    ],
    "translations": {
      "ru": {
        "expected_titles": [
          "NEO",
          "сенсорное управление",
          "автоматическая промывка",
          "подсветка групп"
        ],
        "additions": [
          {
            "title": "TERS",
            "description": "Тепло отработанной воды используется для предварительного нагрева поступающей воды."
          },
          {
            "title": "рычаг подачи пара",
            "description": "Подача пара управляется удобным движением рычага."
          }
        ]
      },
      "en": {
        "expected_titles": [
          "NEO",
          "touch controls",
          "automatic purge",
          "group lighting"
        ],
        "additions": [
          {
            "title": "TERS",
            "description": "Heat from discharged water is used to preheat incoming water."
          },
          {
            "title": "steam lever",
            "description": "A convenient lever controls steam delivery."
          }
        ]
      },
      "kz": {
        "expected_titles": [
          "NEO",
          "сенсорлық басқару",
          "автоматты шаю",
          "топтарды жарықтандыру"
        ],
        "additions": [
          {
            "title": "TERS",
            "description": "Ағызылатын судың жылуы кіретін суды алдын ала қыздыруға пайдаланылады."
          },
          {
            "title": "бу беру тұтқасы",
            "description": "Бу беру ыңғайлы тұтқамен басқарылады."
          }
        ]
      }
    }
  },
  {
    "slug": "victoria-arduino-black-eagle-maverick-gravitech",
    "name": "Black Eagle Maverick Gravitech",
    "brand": "victoria-arduino",
    "equipment_type": "espresso-machine",
    "aliases": [
      "blackeaglemaverickgravitech",
      "victoriaarduinoblackeaglemaverick",
      "victoriaarduinoblackeaglemaverickgravitech",
      "victoriaarduinomaverick"
    ],
    "sources": [
      "https://victoriaarduino.com/en/products-machines/black-eagle-maverick/"
    ],
    "translations": {
      "ru": {
        "expected_titles": [
          "Gravitech",
          "T3 Genius",
          "TERS",
          "PureBrew"
        ],
        "additions": [
          {
            "title": "сенсорное управление",
            "description": "Сенсорный интерфейс упрощает настройку параметров приготовления."
          },
          {
            "title": "стальные портафильтры",
            "description": "Портафильтры выполнены из нержавеющей стали."
          }
        ]
      },
      "en": {
        "expected_titles": [
          "Gravitech",
          "T3 Genius",
          "TERS",
          "PureBrew"
        ],
        "additions": [
          {
            "title": "touchscreen control",
            "description": "A touchscreen interface simplifies adjustment of brewing parameters."
          },
          {
            "title": "stainless steel portafilters",
            "description": "The portafilters are made of stainless steel."
          }
        ]
      },
      "kz": {
        "expected_titles": [
          "Gravitech",
          "T3 Genius",
          "TERS",
          "PureBrew"
        ],
        "additions": [
          {
            "title": "сенсорлық басқару",
            "description": "Сенсорлық интерфейс дайындау параметрлерін реттеуді жеңілдетеді."
          },
          {
            "title": "болат портафильтрлер",
            "description": "Портафильтрлер тот баспайтын болаттан жасалған."
          }
        ]
      }
    }
  },
  {
    "slug": "modbar-espresso-av-1-group",
    "name": "Modbar Espresso AV 1 Group",
    "brand": "modbar",
    "equipment_type": "espresso-machine",
    "aliases": [
      "modbarespressoav",
      "modbarespressoav1group",
      "modbarmodbarespressoav1group"
    ],
    "sources": [
      "https://modbar.com/espresso-av/",
      "https://lamarzoccousa.com/wp-content/uploads/2020/08/2020_USA_SalesBrochure_WebVersion.pdf"
    ],
    "translations": {
      "ru": {
        "expected_titles": [
          "объёмное дозирование",
          "PID",
          "программируемый рычаг",
          "таймер пролива"
        ],
        "additions": [
          {
            "title": "монтаж под стойкой",
            "description": "Основной модуль размещается под столешницей, оставляя на виду компактную группу."
          },
          {
            "title": "подогреваемая группа",
            "description": "Подогрев группы помогает поддерживать стабильную температуру приготовления."
          }
        ]
      },
      "en": {
        "expected_titles": [
          "volumetric dosing",
          "PID",
          "programmable lever",
          "shot timer"
        ],
        "additions": [
          {
            "title": "undercounter installation",
            "description": "The main module sits beneath the counter, leaving a compact group in view."
          },
          {
            "title": "heated group",
            "description": "Group heating helps maintain a stable brewing temperature."
          }
        ]
      },
      "kz": {
        "expected_titles": [
          "көлемдік мөлшерлеу",
          "PID",
          "бағдарламаланатын тұтқа",
          "су беру таймері"
        ],
        "additions": [
          {
            "title": "үстел астына орнату",
            "description": "Негізгі модуль үстелдің астына орналасып, көрінетін жерде ықшам топ қалады."
          },
          {
            "title": "қыздырылатын топ",
            "description": "Топты қыздыру дайындау температурасының тұрақтылығын сақтауға көмектеседі."
          }
        ]
      }
    }
  }
]$features$::jsonb;
 item jsonb; translated jsonb; addition jsonb; lang text;
 matches uuid[]; target public.products%ROWTYPE;
 current_count integer; last_order integer; current_titles jsonb; expected_titles jsonb;
BEGIN
 FOR item IN SELECT value FROM jsonb_array_elements(payload) LOOP
  SELECT array_agg(DISTINCT p.id) INTO matches
  FROM public.products p LEFT JOIN public.product_translations t ON t.product_id=p.id
  WHERE p.slug=item->>'slug'
   OR (p.type='equipment' AND (
    item->'aliases' ? regexp_replace(translate(lower(coalesce(p.name,'')),'ö','o'),'[^a-z0-9]','','g')
    OR item->'aliases' ? regexp_replace(translate(lower(coalesce(p.slug,'')),'ö','o'),'[^a-z0-9]','','g')
    OR item->'aliases' ? regexp_replace(translate(lower(coalesce(t.name,'')),'ö','o'),'[^a-z0-9]','','g')
   ));
  IF coalesce(cardinality(matches),0)=0 THEN
   INSERT INTO feature_addition_report VALUES(item->>'slug',NULL,NULL,NULL,NULL,0,'missing_product');
   CONTINUE;
  END IF;
  IF cardinality(matches)>1 THEN RAISE EXCEPTION 'Several existing products match %',item->>'slug'; END IF;
  SELECT * INTO target FROM public.products WHERE id=matches[1] FOR UPDATE;
  IF target.type::text IS DISTINCT FROM 'equipment'
   OR target.brand::text IS DISTINCT FROM item->>'brand'
   OR target.equipment_type::text IS DISTINCT FROM item->>'equipment_type' THEN
   RAISE EXCEPTION 'Product identity mismatch for %',item->>'slug';
  END IF;
  FOREACH lang IN ARRAY ARRAY['ru','en','kz'] LOOP
   translated := item->'translations'->lang;
   SELECT count(*),coalesce(max(sort_order),-1),jsonb_agg(title ORDER BY title)
    INTO current_count,last_order,current_titles FROM public.product_features
    WHERE product_id=target.id AND locale=lang::public.locale;
   IF NOT EXISTS(SELECT 1 FROM public.product_translations WHERE product_id=target.id AND locale=lang::public.locale) THEN
    INSERT INTO feature_addition_report VALUES(item->>'slug',target.slug,lang,current_count,current_count,0,'missing_translation');
    CONTINUE;
   END IF;
   IF current_count>=6 THEN
    INSERT INTO feature_addition_report VALUES(item->>'slug',target.slug,lang,current_count,current_count,0,'already_complete');
    CONTINUE;
   END IF;
   IF current_count<>4 THEN
    INSERT INTO feature_addition_report VALUES(item->>'slug',target.slug,lang,current_count,current_count,0,'review_feature_count');
    CONTINUE;
   END IF;
   SELECT jsonb_agg(value ORDER BY value) INTO expected_titles FROM jsonb_array_elements_text(translated->'expected_titles');
   IF current_titles IS DISTINCT FROM expected_titles THEN
    INSERT INTO feature_addition_report VALUES(item->>'slug',target.slug,lang,current_count,current_count,0,'review_changed_titles');
    CONTINUE;
   END IF;
   IF jsonb_array_length(translated->'additions')<>2 THEN RAISE EXCEPTION 'Invalid additions for %',item->>'slug'; END IF;
   FOR addition IN SELECT value FROM jsonb_array_elements(translated->'additions') LOOP
    IF EXISTS(SELECT 1 FROM public.product_features WHERE product_id=target.id AND locale=lang::public.locale AND lower(title)=lower(addition->>'title')) THEN
     RAISE EXCEPTION 'Duplicate addition for % / %',item->>'slug',lang;
    END IF;
    last_order := last_order+1;
    INSERT INTO public.product_features(product_id,locale,title,description,sort_order)
    VALUES(target.id,lang::public.locale,addition->>'title',addition->>'description',last_order);
   END LOOP;
   INSERT INTO feature_addition_report VALUES(item->>'slug',target.slug,lang,4,6,2,'added');
  END LOOP;
 END LOOP;
END $patch$;
SELECT * FROM feature_addition_report ORDER BY requested_slug,locale;
SELECT status,count(*) AS entries,sum(added) AS added_features FROM feature_addition_report GROUP BY status ORDER BY status;
COMMIT;
