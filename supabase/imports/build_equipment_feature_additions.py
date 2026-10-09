"""Build the additive 4→6 feature patch from the two equipment imports."""
import json
from pathlib import Path
ROOT = Path(__file__).resolve().parent
FEATURES = {}
def feature(key, ru, en, kz):
    FEATURES[key] = {locale: dict(zip(('title', 'description'), value.split('|'))) for locale, value in zip(('ru','en','kz'), (ru,en,kz))}
feature('steam_lever', 'рычаг подачи пара|Подача пара управляется удобным движением рычага.', 'steam lever|A convenient lever controls steam delivery.', 'бу беру тұтқасы|Бу беру ыңғайлы тұтқамен басқарылады.')
feature('mirror', 'зеркальная панель|Отражающая панель помогает следить за проливом из портафильтра.', 'mirror panel|The reflective panel helps monitor extraction from the portafilter.', 'айна панелі|Шағылыстыратын панель портафильтрден кофе ағуын бақылауға көмектеседі.')
feature('light', 'подсветка портафильтра|Подсветка рабочей зоны улучшает видимость при дозировании кофе.', 'portafilter lighting|Work area lighting improves visibility while dosing coffee.', 'портафильтр жарығы|Жұмыс аймағының жарығы кофе мөлшерлеу кезінде көрінуді жақсартады.')
feature('maintenance', 'напоминание об обслуживании|Напоминание о замене жерновов настраивается под установленный комплект.', 'maintenance reminder|The burr replacement reminder can be configured for the installed burr set.', 'қызмет көрсету еске салғышы|Диірмен тастарын ауыстыру еске салғышы орнатылған жинаққа сай реттеледі.')
feature('password', 'защита настроек|Защита паролем ограничивает доступ к изменению рецептов.', 'protected settings|Password protection restricts access to recipe changes.', 'баптауларды қорғау|Құпиясөз рецептілерді өзгертуге қолжетімділікті шектейді.')
feature('service', 'доступ для обслуживания|Удобный доступ к основным узлам упрощает сервисное обслуживание.', 'service access|Easy access to key components simplifies servicing.', 'қызмет көрсетуге қолжетімділік|Негізгі тораптарға ыңғайлы қолжетімділік қызмет көрсетуді жеңілдетеді.')
feature('doses', 'три программируемые дозы|Можно сохранить три дозы для разных рецептов приготовления.', 'three programmable doses|Three doses can be stored for different brewing recipes.', 'бағдарламаланатын үш мөлшер|Әртүрлі дайындау рецептілеріне арналған үш мөлшерді сақтауға болады.')
feature('counter', 'счётчик порций|Общий и промежуточный счётчики помогают контролировать количество приготовленных доз.', 'dose counters|Total and partial counters help track the number of doses prepared.', 'мөлшер санағыштары|Жалпы және аралық санағыштар дайындалған мөлшерлер санын бақылауға көмектеседі.')
feature('cooling', 'активное охлаждение|Вентиляция помогает ограничить нагрев кофемолки при интенсивной работе.', 'active cooling|Ventilation helps limit grinder heat during intensive use.', 'белсенді салқындату|Желдету қарқынды жұмыс кезінде кофе тартқыштың қызуын азайтуға көмектеседі.')
feature('burr64', 'стальные жернова 64 мм|Плоские стальные жернова диаметром 64 мм обеспечивают помол кофе.', '64 mm steel burrs|Flat 64 mm steel burrs grind the coffee.', '64 мм болат диірмен тастары|Диаметрі 64 мм жалпақ болат диірмен тастары кофені ұнтақтайды.')
feature('holder', 'держатель портафильтра|Регулируемая опора удерживает портафильтр во время помола.', 'portafilter holder|An adjustable support holds the portafilter during grinding.', 'портафильтр ұстағышы|Реттелетін тірек ұнтақтау кезінде портафильтрді ұстап тұрады.')
feature('clean_setting', 'очистка без потери настройки|Доступ к камере помола позволяет проводить очистку с сохранением установленного помола.', 'cleaning without losing settings|Access to the grinding chamber allows cleaning while preserving the grind setting.', 'баптауды сақтап тазалау|Ұнтақтау камерасына қолжетімділік ұнтақтау баптауын сақтай отырып тазалауға мүмкіндік береді.')
feature('pause', 'автоматическая пауза|При снятии портафильтра дозирование автоматически приостанавливается.', 'automatic pause|Dosing pauses automatically when the portafilter is removed.', 'автоматты кідіріс|Портафильтр алынғанда мөлшерлеу автоматты түрде тоқтайды.')
feature('vibration', 'подавление вибраций|Система демпфирования снижает вибрации во время работы кофемолки.', 'vibration damping|A damping system reduces vibration while the grinder is running.', 'дірілді бәсеңдету|Бәсеңдету жүйесі кофе тартқыш жұмыс істегенде дірілді азайтады.')
feature('timed', 'дозирование по времени|Время работы можно настроить для повторяемого дозирования.', 'timed dosing|Grinding time can be configured for repeatable dosing.', 'уақыт бойынша мөлшерлеу|Қайталанатын мөлшерлеу үшін ұнтақтау уақытын реттеуге болады.')
feature('safety', 'двойной защитный выключатель|В конструкции предусмотрен двойной защитный выключатель.', 'double safety switch|The grinder incorporates a double safety switch.', 'қос қауіпсіздік ажыратқышы|Кофе тартқышта қос қауіпсіздік ажыратқышы қарастырылған.')
feature('uniform', 'равномерность помола|Однородное распределение частиц помогает добиться равномерной экстракции.', 'grind uniformity|A uniform particle distribution supports even extraction.', 'біркелкі ұнтақтау|Бөлшектердің біркелкі таралуы біркелкі экстракцияға көмектеседі.')
feature('throughput', 'высокая производительность|Производительность около 19–21 г/с зависит от зерна и настройки помола.', 'high throughput|Throughput of approximately 19–21 g/s depends on the beans and grind setting.', 'жоғары өнімділік|Шамамен 19–21 г/с өнімділік дәнге және ұнтақтау баптауына байланысты.')
feature('spout', 'подсветка выхода кофе|Подсвеченный регулируемый носик помогает направить кофе в центр корзины.', 'illuminated spout|An illuminated adjustable spout helps direct coffee into the centre of the basket.', 'кофе шығатын түтіктің жарығы|Жарықтандырылған реттелетін түтік кофені себеттің ортасына бағыттауға көмектеседі.')
feature('quiet', 'тихая работа|Конструкция кофемолки рассчитана на снижение шума при помоле.', 'quiet operation|The grinder is designed to reduce grinding noise.', 'тыныш жұмыс|Кофе тартқыштың құрылымы ұнтақтау кезіндегі шуды азайтуға арналған.')
feature('ddd', 'контроль зазора DDD|Система Disc Distance Detection помогает точно контролировать расстояние между жерновами.', 'DDD burr gap control|Disc Distance Detection helps precisely monitor the distance between the burrs.', 'DDD саңылау бақылауы|Disc Distance Detection жүйесі диірмен тастары арасындағы қашықтықты дәл бақылауға көмектеседі.')
feature('detect', 'распознавание портафильтра|Встроенная система распознаёт установленный портафильтр для удобного дозирования.', 'portafilter detection|An integrated system detects the inserted portafilter for convenient dosing.', 'портафильтрді анықтау|Кіріктірілген жүйе ыңғайлы мөлшерлеу үшін орнатылған портафильтрді анықтайды.')
feature('burr75', 'жернова 75 мм|Плоские жернова диаметром 75 мм рассчитаны на профессиональную работу с эспрессо.', '75 mm burrs|Flat 75 mm burrs are designed for professional espresso grinding.', '75 мм диірмен тастары|Диаметрі 75 мм жалпақ диірмен тастары кәсіби эспрессо ұнтақтауына арналған.')
feature('placement', 'компактное размещение|Заднее расположение вентиляторов позволяет устанавливать кофемолки рядом друг с другом.', 'compact placement|Rear-mounted fans allow grinders to be positioned side by side.', 'ықшам орналастыру|Желдеткіштердің артта орналасуы кофе тартқыштарды қатар қоюға мүмкіндік береді.')
feature('sensor', 'бесконтактный запуск|Датчик определяет установленный портафильтр и автоматически запускает темперовку.', 'contactless activation|A sensor detects the inserted portafilter and starts tamping automatically.', 'жанасусыз іске қосу|Датчик орнатылған портафильтрді анықтап, тығыздауды автоматты түрде бастайды.')
feature('clean_mode', 'режим очистки|Кнопка переводит темпер в нижнее положение для ручной очистки рабочей поверхности.', 'cleaning mode|A button lowers the tamper for manual cleaning of its working surface.', 'тазалау режимі|Түйме жұмыс бетін қолмен тазалау үшін темперді төмен түсіреді.')
feature('ball', 'подвижная паровая трубка|Шарнирное крепление позволяет удобно менять положение паровой трубки.', 'articulating steam wand|A ball joint allows convenient adjustment of the steam wand position.', 'қозғалмалы бу түтігі|Шарнирлі бекітпе бу түтігінің қалпын ыңғайлы өзгертуге мүмкіндік береді.')
feature('water_level', 'контроль уровня воды|Смотровое стекло позволяет визуально контролировать уровень воды в бойлере.', 'water level sight glass|A sight glass allows visual monitoring of the boiler water level.', 'су деңгейін бақылау|Бақылау әйнегі бойлердегі су деңгейін көзбен бақылауға мүмкіндік береді.')
feature('pro_touch', 'Pro Touch|Теплоизолированные паровые трубки уменьшают нагрев наружной поверхности.', 'Pro Touch|Insulated steam wands reduce heating of the outer surface.', 'Pro Touch|Жылу оқшауланған бу түтіктері сыртқы беттің қызуын азайтады.')
feature('hot_water', 'настройка горячей воды|Экономайзер позволяет регулировать температуру горячей воды для чая.', 'hot water adjustment|The economiser allows adjustment of hot water temperature for tea.', 'ыстық суды реттеу|Экономайзер шайға арналған ыстық судың температурасын реттеуге мүмкіндік береді.')
feature('dry', 'сухой нагрев групп|Система сухого нагрева поддерживает рабочую температуру заварочных групп.', 'dry group heating|A dry heating system maintains the operating temperature of the brewing groups.', 'топтарды құрғақ қыздыру|Құрғақ қыздыру жүйесі қайнату топтарының жұмыс температурасын сақтайды.')
feature('tray', 'двухуровневый поддон|Два уровня поддона позволяют удобно работать с чашками разной высоты.', 'two-level drip tray|Two tray levels accommodate cups of different heights.', 'екі деңгейлі науа|Науаның екі деңгейі биіктігі әртүрлі шыныаяқтармен ыңғайлы жұмыс істеуге мүмкіндік береді.')
feature('ters', 'TERS|Тепло отработанной воды используется для предварительного нагрева поступающей воды.', 'TERS|Heat from discharged water is used to preheat incoming water.', 'TERS|Ағызылатын судың жылуы кіретін суды алдын ала қыздыруға пайдаланылады.')
feature('touch', 'сенсорное управление|Сенсорный интерфейс упрощает настройку параметров приготовления.', 'touchscreen control|A touchscreen interface simplifies adjustment of brewing parameters.', 'сенсорлық басқару|Сенсорлық интерфейс дайындау параметрлерін реттеуді жеңілдетеді.')
feature('steel_porta', 'стальные портафильтры|Портафильтры выполнены из нержавеющей стали.', 'stainless steel portafilters|The portafilters are made of stainless steel.', 'болат портафильтрлер|Портафильтрлер тот баспайтын болаттан жасалған.')
feature('under', 'монтаж под стойкой|Основной модуль размещается под столешницей, оставляя на виду компактную группу.', 'undercounter installation|The main module sits beneath the counter, leaving a compact group in view.', 'үстел астына орнату|Негізгі модуль үстелдің астына орналасып, көрінетін жерде ықшам топ қалады.')
feature('heated', 'подогреваемая группа|Подогрев группы помогает поддерживать стабильную температуру приготовления.', 'heated group|Group heating helps maintain a stable brewing temperature.', 'қыздырылатын топ|Топты қыздыру дайындау температурасының тұрақтылығын сақтауға көмектеседі.')

ASSIGN = {}
def assign(slugs, keys, *sources):
    for slug in slugs.split(): ASSIGN[slug] = (keys.split(), list(sources))
assign('appia-life-s-2-group appia-life-v-2-group','steam_lever mirror','https://nuovasimonelli.com/es/machine/appia-life-2/')
assign('aurelia-wave-v-2-group aurelia-wave-t3-2-group','steam_lever mirror','https://nuovasimonelli.com/en/machine/aurelia-wave/')
assign('eureka-firenze-75','light maintenance','https://www.eureka.co.it/it/products/eureka%2B1920/commercial%2Bgrinders/firenze%2Brange/104/')
assign('anfim-luna','password service','https://www.anfim-milano.com/en/product/luna')
assign('mazzer-super-jolly-v-up-electronic','doses counter','https://www.mazzer.com/wp-content/uploads/2021/10/depliant-Super-Jolly-V-Up-2022-ELECTRONIC-ENG-split-pages.pdf')
assign('mazzer-super-jolly-v-pro-electronic','cooling burr64','https://www.mazzer.com/wp-content/uploads/2021/07/depliant_Super_Jolly_V_2021_ELECTRONIC_ENG_split_pages_WEB.pdf')
assign('mazzer-major-v-electronic','holder clean_setting','https://www.mazzer.com/en/blocchi-prodotto/blocco-features-major-v-el/','https://www.mazzer.com/en/blocchi-prodotto/highlight-major-v-el/')
assign('mazzer-major-vp-electronic','holder clean_setting','https://www.mazzer.com/wp-content/uploads/2021/07/depliant-Major-VP-2023-ENG-split-pages-WEB-1.pdf')
assign('mazzer-kony-s-electronic','cooling holder','https://elmont.si/wp-content/uploads/2023/01/Mazzer-products-range.pdf')
assign('mazzer-kony-sg-electronic','pause holder','https://www.mazzer.com/wp-content/uploads/2023/10/depliant-Kony-Sg-ENG-ITA-web-2.pdf')
assign('mazzer-philos','vibration burr64','https://shop-au.mazzer.com/products/philos')
assign('mazzer-zm','timed safety','https://www.mazzer.com/en/blocchi-prodotto/caratteristiche-zm/')
assign('mahlkonig-ek43-s','uniform throughput','https://www.mahlkoenig.com/products/ek43-s')
assign('mahlkonig-e80s-gbw','spout quiet','https://downloads.mahlkoenig.de/Products/Mahlkoenig_E80S_GbW_Espresso_Grinder_Product_Sheet.pdf')
assign('victoria-arduino-mythos-my75-white','burr75 placement','https://victoriaarduino.com/en/products-machines/mythos/')
assign('puqpress-m3 puqpress-m5 puqpress-m6','sensor clean_mode','https://cdn.puq.coffee/media/brochures/user-manual-integrated-puq-press-2025.pdf','https://puq.coffee/set-up-maintenance')
assign('modbar-steam','ball water_level','https://lamarzoccousa.com/wp-content/uploads/2020/08/2020_USA_SalesBrochure_WebVersion.pdf')
assign('la-marzocco-kb90','pro_touch hot_water','https://au.lamarzocco.com/wp-content/uploads/2024/02/data_sheet_KB90-EN.pdf')
assign('mahlkonig-e65w-gbs','ddd detect','https://www.mahlkoenig.com/products/e65w-grind-by-sync')
assign('mahlkonig-e80w-gbs','ddd detect','https://www.mahlkoenig.com/products/e80w-grind-by-sync')
assign('victoria-arduino-eagle-one-2-group','dry tray','https://victoriaarduino.com/en/products-machines/eagle-one/')
assign('victoria-arduino-eagle-tempo-neo-2-group','ters steam_lever','https://victoriaarduino.com/en/products-machines/eagle-tempo/')
assign('victoria-arduino-black-eagle-maverick-gravitech','touch steel_porta','https://victoriaarduino.com/en/products-machines/black-eagle-maverick/')
assign('modbar-espresso-av-1-group','under heated','https://modbar.com/espresso-av/','https://lamarzoccousa.com/wp-content/uploads/2020/08/2020_USA_SalesBrochure_WebVersion.pdf')
products = sum([json.loads((ROOT / name).read_text().split('$equipment$')[1]) for name in ('20261007_equipment_catalog.sql','20261007_equipment_followup.sql')], [])
rows=[]
for p in products:
    if len(p['translations']['ru']['features']) != 4: continue
    keys,sources=ASSIGN[p['slug']]
    row={k:p[k] for k in ('slug','name','brand','equipment_type','aliases')}
    row['sources']=sources
    row['translations']={locale:{'expected_titles':[f['title'] for f in p['translations'][locale]['features']], 'additions':[FEATURES[k][locale] for k in keys]} for locale in ('ru','en','kz')}
    rows.append(row)
assert len(rows)==len(ASSIGN)==28
for row in rows:
 for t in row['translations'].values():
    assert len(t['expected_titles'])==4 and len(t['additions'])==2
    assert len(set(t['expected_titles']+[a['title'] for a in t['additions']]))==6
sql=(ROOT/'equipment_feature_additions.template.sql').read_text().replace('__PAYLOAD__',json.dumps(rows,ensure_ascii=False,indent=2))
(ROOT/'20261008_equipment_feature_additions.sql').write_text(sql)
readme='''# Дополнение особенностей оборудования: 4 → 6

Файл: `20261008_equipment_feature_additions.sql`. Выполнить целиком в SQL Editor после обоих импортов от 07.10.2026. Это самостоятельный SQL: Python для запуска не нужен.

28 позиций × 3 языка (ru/en/kz) × 2 дополнения = максимум 168 новых строк. Цены, фото, описания, характеристики, публикация и существующие особенности не изменяются. Linea PB X (уже 6 особенностей) и Modbar single drip tray (2) не включены.

Скрипт сверяет модель, бренд, тип и четыре исходных заголовка отдельно для каждого языка. Отличающиеся карточки пропускаются и выводятся в итоговом отчёте. Отсутствующие товары или переводы не создаются. При неоднозначном совпадении модели вся транзакция отменяется. Повторный запуск не создаёт дубли. `added` — дополнено; `already_complete` — уже 6 или больше; остальные статусы требуют проверки вручную. Никакие изменения в рабочей базе при подготовке файла не выполнялись.

После импорта кэш каталога может обновляться до 5 минут. Названия и объём текста сохранены в стиле существующего каталога; добавления переведены на все три языка. Источники проверены 08.10.2026. Для Kony S используется фирменная брошюра Mazzer на сайте дистрибьютора; остальные ссылки ведут на сайты производителей. Режим очистки PUQ — положение для ручной очистки, а не автоматическая мойка.

## Дополнения и источники

| Модель | Новые особенности | Источники |
| --- | --- | --- |
'''
for r in rows:
 readme+='| '+r['name']+' | '+'; '.join(a['title'] for a in r['translations']['ru']['additions'])+' | '+'; '.join(f'[источник {i+1}]({url})' for i,url in enumerate(r['sources']))+' |\n'
readme+='\n## Проверка\n\nЛокальный интеграционный тест: `node supabase/imports/validate_equipment_feature_additions.mjs /absolute/path/to/stopped/disposable/pgdata`. Используется только отдельная временная база PostgreSQL, без чтения реквизитов проекта.\n'
(ROOT/'20261008_equipment_feature_additions_README.md').write_text(readme)
print('Built',len(rows),'products; 168 translated additions')
