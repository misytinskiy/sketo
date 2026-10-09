# Дополнение особенностей оборудования: 4 → 6

Файл: `20261008_equipment_feature_additions.sql`. Выполнить целиком в SQL Editor после обоих импортов от 07.10.2026. Это самостоятельный SQL: Python для запуска не нужен.

28 позиций × 3 языка (ru/en/kz) × 2 дополнения = максимум 168 новых строк. Цены, фото, описания, характеристики, публикация и существующие особенности не изменяются. Linea PB X (уже 6 особенностей) и Modbar single drip tray (2) не включены.

Скрипт сверяет модель, бренд, тип и четыре исходных заголовка отдельно для каждого языка. Отличающиеся карточки пропускаются и выводятся в итоговом отчёте. Отсутствующие товары или переводы не создаются. При неоднозначном совпадении модели вся транзакция отменяется. Повторный запуск не создаёт дубли. `added` — дополнено; `already_complete` — уже 6 или больше; остальные статусы требуют проверки вручную. Никакие изменения в рабочей базе при подготовке файла не выполнялись.

После импорта кэш каталога может обновляться до 5 минут. Названия и объём текста сохранены в стиле существующего каталога; добавления переведены на все три языка. Источники проверены 08.10.2026. Для Kony S используется фирменная брошюра Mazzer на сайте дистрибьютора; остальные ссылки ведут на сайты производителей. Режим очистки PUQ — положение для ручной очистки, а не автоматическая мойка.

## Дополнения и источники

| Модель | Новые особенности | Источники |
| --- | --- | --- |
| Appia Life S 2 Group | рычаг подачи пара; зеркальная панель | [источник 1](https://nuovasimonelli.com/es/machine/appia-life-2/) |
| Appia Life V 2 Group | рычаг подачи пара; зеркальная панель | [источник 1](https://nuovasimonelli.com/es/machine/appia-life-2/) |
| Aurelia Wave V 2 Group | рычаг подачи пара; зеркальная панель | [источник 1](https://nuovasimonelli.com/en/machine/aurelia-wave/) |
| Aurelia Wave T3 2 Group | рычаг подачи пара; зеркальная панель | [источник 1](https://nuovasimonelli.com/en/machine/aurelia-wave/) |
| Firenze 75 | подсветка портафильтра; напоминание об обслуживании | [источник 1](https://www.eureka.co.it/it/products/eureka%2B1920/commercial%2Bgrinders/firenze%2Brange/104/) |
| Luna | защита настроек; доступ для обслуживания | [источник 1](https://www.anfim-milano.com/en/product/luna) |
| Super Jolly V Up Electronic | три программируемые дозы; счётчик порций | [источник 1](https://www.mazzer.com/wp-content/uploads/2021/10/depliant-Super-Jolly-V-Up-2022-ELECTRONIC-ENG-split-pages.pdf) |
| Super Jolly V Pro Electronic | активное охлаждение; стальные жернова 64 мм | [источник 1](https://www.mazzer.com/wp-content/uploads/2021/07/depliant_Super_Jolly_V_2021_ELECTRONIC_ENG_split_pages_WEB.pdf) |
| Major V Electronic | держатель портафильтра; очистка без потери настройки | [источник 1](https://www.mazzer.com/en/blocchi-prodotto/blocco-features-major-v-el/); [источник 2](https://www.mazzer.com/en/blocchi-prodotto/highlight-major-v-el/) |
| Major VP Electronic | держатель портафильтра; очистка без потери настройки | [источник 1](https://www.mazzer.com/wp-content/uploads/2021/07/depliant-Major-VP-2023-ENG-split-pages-WEB-1.pdf) |
| Kony S Electronic | активное охлаждение; держатель портафильтра | [источник 1](https://elmont.si/wp-content/uploads/2023/01/Mazzer-products-range.pdf) |
| Kony Sg Electronic | автоматическая пауза; держатель портафильтра | [источник 1](https://www.mazzer.com/wp-content/uploads/2023/10/depliant-Kony-Sg-ENG-ITA-web-2.pdf) |
| Philos | подавление вибраций; стальные жернова 64 мм | [источник 1](https://shop-au.mazzer.com/products/philos) |
| ZM | дозирование по времени; двойной защитный выключатель | [источник 1](https://www.mazzer.com/en/blocchi-prodotto/caratteristiche-zm/) |
| EK43 S | равномерность помола; высокая производительность | [источник 1](https://www.mahlkoenig.com/products/ek43-s) |
| E80S GbW | подсветка выхода кофе; тихая работа | [источник 1](https://downloads.mahlkoenig.de/Products/Mahlkoenig_E80S_GbW_Espresso_Grinder_Product_Sheet.pdf) |
| Mythos MY75 White | жернова 75 мм; компактное размещение | [источник 1](https://victoriaarduino.com/en/products-machines/mythos/) |
| PUQpress M3 | бесконтактный запуск; режим очистки | [источник 1](https://cdn.puq.coffee/media/brochures/user-manual-integrated-puq-press-2025.pdf); [источник 2](https://puq.coffee/set-up-maintenance) |
| PUQpress M5 | бесконтактный запуск; режим очистки | [источник 1](https://cdn.puq.coffee/media/brochures/user-manual-integrated-puq-press-2025.pdf); [источник 2](https://puq.coffee/set-up-maintenance) |
| PUQpress M6 | бесконтактный запуск; режим очистки | [источник 1](https://cdn.puq.coffee/media/brochures/user-manual-integrated-puq-press-2025.pdf); [источник 2](https://puq.coffee/set-up-maintenance) |
| Modbar Steam | подвижная паровая трубка; контроль уровня воды | [источник 1](https://lamarzoccousa.com/wp-content/uploads/2020/08/2020_USA_SalesBrochure_WebVersion.pdf) |
| KB90 | Pro Touch; настройка горячей воды | [источник 1](https://au.lamarzocco.com/wp-content/uploads/2024/02/data_sheet_KB90-EN.pdf) |
| E65W GbS | контроль зазора DDD; распознавание портафильтра | [источник 1](https://www.mahlkoenig.com/products/e65w-grind-by-sync) |
| E80W GbS | контроль зазора DDD; распознавание портафильтра | [источник 1](https://www.mahlkoenig.com/products/e80w-grind-by-sync) |
| Eagle One 2 Group | сухой нагрев групп; двухуровневый поддон | [источник 1](https://victoriaarduino.com/en/products-machines/eagle-one/) |
| Eagle Tempo Neo 2 Group | TERS; рычаг подачи пара | [источник 1](https://victoriaarduino.com/en/products-machines/eagle-tempo/) |
| Black Eagle Maverick Gravitech | сенсорное управление; стальные портафильтры | [источник 1](https://victoriaarduino.com/en/products-machines/black-eagle-maverick/) |
| Modbar Espresso AV 1 Group | монтаж под стойкой; подогреваемая группа | [источник 1](https://modbar.com/espresso-av/); [источник 2](https://lamarzoccousa.com/wp-content/uploads/2020/08/2020_USA_SalesBrochure_WebVersion.pdf) |

## Проверка

Локальный интеграционный тест: `node supabase/imports/validate_equipment_feature_additions.mjs /absolute/path/to/stopped/disposable/pgdata`. Используется только отдельная временная база PostgreSQL, без чтения реквизитов проекта.
