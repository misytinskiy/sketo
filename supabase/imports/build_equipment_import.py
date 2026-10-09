"""Build the reviewed RU/EN/KZ equipment import. No network or DB access.

Run from any directory: python3 supabase/imports/build_equipment_import.py
DOCX files supplied model names only. Sources below supply all product facts.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
LOCALES = ("ru", "en", "kz")


def t(ru, en, kz):
    return dict(zip(LOCALES, (ru, en, kz)))


LABELS = {
    "brand": t("Бренд", "Brand", "Бренд"),
    "series": t("Серия", "Series", "Сериясы"),
    "control": t("Управление", "Control", "Басқару"),
    "use": t("Назначение", "Application", "Мақсаты"),
    "groups": t("Группы", "Groups", "Топ саны"),
    "burr_type": t("Тип жерновов", "Burr type", "Диірмен тастарының түрі"),
    "burrs": t("Диаметр жерновов", "Burr diameter", "Диірмен тастарының диаметрі"),
    "height": t("Высота", "Height", "Биіктігі"),
    "width": t("Ширина", "Width", "Ені"),
    "depth": t("Глубина", "Depth", "Тереңдігі"),
    "weight": t("Вес", "Weight", "Салмағы"),
    "power": t("Мощность", "Power", "Қуаты"),
    "power50": t("Мощность (220–240 В, 50 Гц)", "Power (220–240 V, 50 Hz)", "Қуаты (220–240 В, 50 Гц)"),
    "minpower": t("Мощность мин.", "Minimum power", "Ең төменгі қуаты"),
    "maxpower": t("Мощность макс.", "Maximum power", "Ең жоғары қуаты"),
    "rpm50": t("Обороты (50 Гц)", "Speed (50 Hz)", "Айналымы (50 Гц)"),
    "rpm60": t("Обороты (60 Гц)", "Speed (60 Hz)", "Айналымы (60 Гц)"),
    "hopper": t("Бункер зерна", "Bean hopper", "Дән бункері"),
    "boiler": t("Бойлер", "Boiler", "Бойлер"),
    "steam": t("Паровой бойлер", "Steam boiler", "Бу бойлері"),
    "coffee": t("Кофейные бойлеры", "Coffee boilers", "Кофе бойлерлері"),
    "material": t("Корпус", "Body", "Корпус"),
    "voltage": t("Питание", "Power supply", "Қуат көзі"),
    "compatibility": t("Совместимость", "Compatibility", "Үйлесімділік"),
    "format": t("Формат", "Format", "Пішімі"),
    "force": t("Усилие темперовки", "Tamping force", "Тығыздау күші"),
    "diameter": t("Диаметр темпера (на выбор)", "Tamper diameter (selectable)", "Темпер диаметрі (таңдау бойынша)"),
    "module_dims": t("Модуль: Ш × Г × В", "Module: W × D × H", "Модуль: Е × Т × Б"),
    "tap_dims": t("Кран: Ш × Г × В", "Tap: W × D × H", "Кран: Е × Т × Б"),
    "module_weight": t("Вес модуля", "Module weight", "Модуль салмағы"),
    "tap_weight": t("Вес крана", "Tap weight", "Кран салмағы"),
}
FLAT = t("Плоские", "Flat", "Жалпақ")
CONICAL = t("Конические", "Conical", "Конустық")
TIMED = t("Дозирование по времени", "Timed dosing", "Уақыт бойынша мөлшерлеу")
WEIGHED = t("Дозирование по весу", "Weight-based dosing", "Салмақ бойынша мөлшерлеу")
VOLUMETRIC = t("Автоматическое объёмное", "Automatic volumetric", "Автоматты көлемдік")
SEMI = t("Полуавтоматическое", "Semi-automatic", "Жартылай автоматты")
ESPRESSO = t("Эспрессо", "Espresso", "Эспрессо")
ALUMINIUM = t("Литой алюминий", "Die-cast aluminium", "Құйылған алюминий")
STATUS = t("Под заказ", "On request", "Тапсырыспен")
CATEGORIES = {
    "grinder": t("Кофемолка", "Coffee grinder", "Кофе тартқыш"),
    "espresso-machine": t("Коммерческая кофемашина", "Commercial espresso machine", "Кәсіби кофемашина"),
    "tamper": t("Автоматический темпер", "Automatic tamper", "Автоматты темпер"),
    "steam-module": t("Паровой модуль", "Steam module", "Бу модулі"),
}
BRANDS = {"mazzer": "Mazzer", "mahlkonig": "Mahlkönig", "anfim": "Anfim", "eureka": "Eureka", "la-marzocco": "La Marzocco", "nuova-simonelli": "Nuova Simonelli", "victoria-arduino": "Victoria Arduino", "puqpress": "PUQpress", "modbar": "Modbar"}


def f(title, description):
    return {l: {"title": title[l], "description": description[l]} for l in LOCALES}


FEATURES = {
    "stepless": f(t("плавная регулировка", "stepless adjustment", "бірқалыпты реттеу"), t("Помол настраивается без фиксированных шагов.", "Adjust fineness without fixed steps.", "Ұнтақтау дәрежесі бекітілген қадамсыз реттеледі.")),
    "gfc": f(t("система GFC", "GFC system", "GFC жүйесі"), t("Регулятор потока уменьшает комки и статику.", "The flow damper reduces clumping and static.", "Ағын реттегіші түйіршіктену мен статиканы азайтады.")),
    "recipes": f(t("программируемые дозы", "programmable doses", "бағдарламаланатын мөлшерлер"), t("Сохранённые настройки ускоряют повторное приготовление.", "Saved settings speed up repeat preparation.", "Сақталған баптаулар қайталап дайындауды жылдамдатады.")),
    "fork": f(t("держатель портафильтра", "portafilter holder", "портафильтр ұстағышы"), t("Регулируемая опора освобождает руки бариста.", "An adjustable support frees the barista’s hands.", "Реттелетін тірек баристаның қолын босатады.")),
    "clean": f(t("удобная очистка", "easy cleaning", "ыңғайлы тазалау"), t("Доступ к жерновам сохраняет настройку помола.", "Access the burrs without losing the grind setting.", "Диірмен тастарын тазалағанда ұнтақтау баптауы сақталады.")),
    "cool": f(t("активное охлаждение", "active cooling", "белсенді салқындату"), t("Вентиляция ограничивает нагрев при работе.", "Ventilation limits heat during operation.", "Желдету жұмыс кезіндегі қызуды азайтады.")),
    "touch": f(t("сенсорное управление", "touch controls", "сенсорлық басқару"), t("Экран упрощает выбор рецепта и настройку.", "The screen simplifies recipe selection and setup.", "Экран рецепт таңдауды және баптауды жеңілдетеді.")),
    "gbw": f(t("дозирование по весу", "grind by weight", "салмақ бойынша мөлшерлеу"), t("Встроенные весы контролируют массу порции при помоле.", "Integrated scales monitor the dose during grinding.", "Кіріктірілген таразы ұнтақтау кезінде мөлшер салмағын бақылайды.")),
    "sis": f(t("мягкая предынфузия", "soft infusion", "жұмсақ алдын ала сулау"), t("Система SIS равномерно смачивает кофейную таблетку.", "SIS gently wets the coffee puck.", "SIS кофе қабатын жұмсақ сулайды.")),
    "insulation": f(t("теплоизоляция бойлера", "boiler insulation", "бойлердің жылу оқшаулауы"), t("Изоляция уменьшает потери тепла.", "Insulation reduces heat loss.", "Оқшаулау жылу жоғалуын азайтады.")),
    "volumetric": f(t("объёмное дозирование", "volumetric dosing", "көлемдік мөлшерлеу"), t("Пролив останавливается после заданного объёма.", "Extraction stops at the programmed volume.", "Белгіленген көлемге жеткенде су беру тоқтайды.")),
    "semi": f(t("контроль пролива", "extraction control", "су беруді басқару"), t("Бариста вручную запускает и завершает пролив.", "The barista starts and stops extraction manually.", "Бариста су беруді қолмен бастайды және тоқтатады.")),
    "water": f(t("горячая вода", "hot water", "ыстық су"), t("Отдельный кран для чая и других напитков.", "A separate tap serves tea and other drinks.", "Шай мен басқа сусындарға арналған бөлек кран.")),
}
ITEMS = []


def units(value, unit):
    symbols = {"mm": ("мм", "mm", "мм"), "kg": ("кг", "kg", "кг"), "g": ("г", "g", "г"), "W": ("Вт", "W", "Вт"), "L": ("л", "L", "л"), "rpm": ("об/мин", "rpm", "айн/мин")}[unit]
    return t(*(f"{value} {symbol}" for symbol in symbols))


def add(slug, name, brand, kind, overview, details, specs, features, sources, document, aliases=(), note=""):
    translations = {}
    for l in LOCALES:
        def rows(values):
            return [{"label": LABELS[k][l], "value": v[l] if isinstance(v, dict) else str(v)} for k, v in values]
        translations[l] = {
            "name": name, "description": overview[l], "category": CATEGORIES[kind][l],
            "status_label": STATUS[l], "seo_title": f"{name} | Sketo", "seo_description": overview[l],
            "details": rows([("brand", BRANDS[brand])] + details),
            "specifications": rows(specs),
            "features": [(FEATURES[x] if isinstance(x, str) else x)[l] for x in features],
        }
    names = [name, f"{BRANDS[brand]} {name}", *aliases]
    norm = lambda x: re.sub("[^a-z0-9]", "", x.lower().replace("ö", "o"))
    ITEMS.append(dict(slug=slug, name=name, brand=brand, equipment_type=kind,
                      aliases=sorted(set(norm(x) for x in names)), translations=translations,
                      sources=sources, document=document, note=note))


def grinder(slug, name, brand, overview, specs, features, sources, control=TIMED, burr_type=FLAT, note="", aliases=()):
    add(slug, name, brand, "grinder", overview,
        [("series", name), ("burr_type", burr_type), ("control", control)],
        specs, features, sources, "Sketo 1609Gr.docx", aliases, note)


def dimensions(h, w, d):
    return [("height", units(h, "mm")), ("width", units(w, "mm")), ("depth", units(d, "mm"))]


MAZZER_GFC = "https://www.mazzer.com/en/how-to-change-gfc/"
MAZZER_RANGE = "https://elmont.si/wp-content/uploads/2023/01/Mazzer-products-range.pdf"
APP = "https://www.nuovasimonelli.it/wp-content/uploads/2021/04/AL-1.pdf"
APP_FEATURES = "https://www.nuovasimonelli.it/appialife/"

for suffix, control, feature, overview in [
    ("S", SEMI, "semi", t("Двухгрупповая машина с ручным контролем пролива. Простая рабочая станция для ежедневного приготовления эспрессо и молочных напитков.", "A two-group machine with manual extraction control for daily espresso and milk drinks.", "Су беруді қолмен басқаратын екі топты машина. Күнделікті эспрессо мен сүтті сусындарға арналған.")),
    ("V", VOLUMETRIC, "volumetric", t("Двухгрупповая машина с программируемым объёмом порции. Помогает повторять рецепт эспрессо в течение смены.", "A two-group machine with programmable shot volumes for repeatable espresso throughout service.", "Мөлшер көлемі бағдарламаланатын екі топты машина. Ауысым бойы эспрессо рецептін қайталауға көмектеседі.")),
]:
    add(f"appia-life-{suffix.lower()}-2-group", f"Appia Life {suffix} 2 Group", "nuova-simonelli", "espresso-machine", overview,
        [("series", f"Appia Life {suffix}"), ("groups", "2"), ("control", control)],
        dimensions(500, 784, 544) + [("weight", units(54, "kg")), ("power", units(3150, "W")), ("boiler", units(11, "L")), ("voltage", "220–240 V / 380–415 V 3N")],
        [feature, "sis", "insulation", "water"], [APP, APP_FEATURES], "Sketo 1303.docx",
        aliases=[f"Nuova Simonelli Appia Life 2 Gr {suffix}"], note="Standard, не Compact/XT/Timer. Размеры и мощность — AL-1.pdf; Easycream и Cool Touch не заявлены как стандарт.")

add("aurelia-wave-v-2-group", "Aurelia Wave V 2 Group", "nuova-simonelli", "espresso-machine",
    t("Двухгрупповая Aurelia Wave с объёмным дозированием и кнопочным выбором порции. Рассчитана на последовательную работу за кофейной стойкой.", "A two-group Aurelia Wave with volumetric dosing and button-based portion selection for continuous café service.", "Көлемдік мөлшерлеуі және батырмамен порция таңдауы бар екі топты Aurelia Wave. Кофеханадағы үздіксіз жұмысқа арналған."),
    [("series", "Aurelia Wave V"), ("groups", "2"), ("control", VOLUMETRIC)],
    dimensions(537, 802, 605) + [("weight", units(78, "kg")), ("maxpower", units(5100, "W")), ("boiler", units(14, "L")), ("voltage", "220–240 V, 50–60 Hz")],
    ["volumetric", "insulation", "water", f(t("автоматическая промывка", "automatic cleaning", "автоматты шаю"), t("Программа помогает выполнять ежедневную очистку групп.", "A cleaning program supports daily group maintenance.", "Бағдарлама топтарды күнделікті тазалауға көмектеседі."))],
    ["https://nuovasimonelli.it/aureliawaveux/", "https://test.simonelliusa.com/Aurelia-Wave"], "Sketo 1303.docx", aliases=["Aurelia Wave V 2Gr"],
    note="Использована таблица VOL, а не UX. 5100 W — максимальная мощность европейской таблицы; американские 4700 W не смешаны с ней.")

add("aurelia-wave-t3-2-group", "Aurelia Wave T3 2 Group", "nuova-simonelli", "espresso-machine",
    t("Двухгрупповая машина с системой T3 для отдельной настройки температур. Сенсорная панель помогает управлять рецептами и работой групп.", "A two-group machine with T3 temperature control and a touchscreen for recipes and group settings.", "Температураларды бөлек реттейтін T3 жүйесі бар екі топты машина. Сенсорлық панель рецепттер мен топтарды басқаруға көмектеседі."),
    [("series", "Aurelia Wave T3"), ("groups", "2"), ("control", VOLUMETRIC)],
    dimensions(537, 802, 605) + [("weight", units(80, "kg")), ("power", t("6600 Вт / 7000 Вт с подогревом чашек", "6600 W / 7000 W with cup warmer", "6600 Вт / кесе жылытқышымен 7000 Вт")), ("coffee", units("2 × 0.8", "L")), ("steam", units(14, "L")), ("voltage", "230 / 380 V")],
    [f(t("система T3", "T3 system", "T3 жүйесі"), t("Раздельная настройка температуры кофе, групп и пара.", "Separate temperature settings for coffee, groups and steam.", "Кофе, топтар және бу температурасы бөлек реттеледі.")), "touch", "volumetric", "water"],
    ["https://www.simonelliusa.com/PDFs/Aurelia%20Wave/LI%20AURELIA%20WAVE%20DIGIT-T3%20IT-EN-FR.pdf", "https://www.simonelliusa.com/PDFs/Aurelia%20Wave/Aurelia%20Wave%20T3%202%20Group%20Spec%20Sheet.pdf"],
    "Sketo 1303.docx", aliases=["Aurelia Wave T3 2GR"], note="Руководство, стр.25: T3 2 группы; мощность отдельно с подогревом чашек и без него. Pulse Jet не включён без подтверждения опции.")

add("linea-pb-x-av-2-group", "Linea PB X AV 2 Group", "la-marzocco", "espresso-machine",
    t("Двухгрупповая Linea PB X с независимыми кофейными бойлерами и объёмным дозированием. Для точной настройки эспрессо при интенсивной работе.", "A two-group Linea PB X with independent coffee boilers and volumetric dosing for precise espresso setup during busy service.", "Тәуелсіз кофе бойлерлері және көлемдік мөлшерлеуі бар екі топты Linea PB X. Қарқынды жұмыста эспрессоны дәл баптауға арналған."),
    [("series", "Linea PB X AV"), ("groups", "2"), ("control", VOLUMETRIC)],
    dimensions(533, 710, 590) + [("weight", units(61, "kg")), ("minpower", units(3350, "W")), ("maxpower", units(5670, "W")), ("coffee", units("2 × 1.3", "L")), ("steam", units(7, "L"))],
    ["volumetric", f(t("независимые бойлеры", "independent boilers", "тәуелсіз бойлерлер"), t("Температуру кофе можно настраивать отдельно для каждой группы.", "Set coffee temperature independently for each group.", "Әр топтың кофе температурасын бөлек реттеуге болады.")),
     f(t("динамический преднагрев", "dynamic preheating", "динамикалық алдын ала жылыту"), t("Входящая вода подогревается до поступления в кофейный бойлер.", "Incoming water is preheated before reaching the coffee boiler.", "Кіретін су кофе бойлеріне жетпей алдын ала жылытылады.")),
     f(t("Pro Touch", "Pro Touch", "Pro Touch"), t("Изолированные паровые трубки удобны при работе с молоком.", "Insulated steam wands support milk preparation.", "Оқшауланған бу түтіктері сүтпен жұмыс істеуге ыңғайлы.")),
     f(t("подсветка бариста", "barista lights", "бариста жарығы"), t("LED-подсветка освещает рабочую зону.", "LED lighting illuminates the working area.", "LED жарығы жұмыс аймағын жарықтандырады.")),
     f(t("эко-режим", "eco mode", "эко режим"), t("Режим ожидания сокращает потребление энергии.", "Standby mode reduces energy consumption.", "Күту режимі энергия тұтынуды азайтады."))],
    ["https://nz.lamarzocco.com/commercial-products/espresso-machines/linea-pb-x/", "https://nz.lamarzocco.com/wp-content/uploads/2023/12/Brochure_NZ_LineaPBx.pdf"],
    "Sketo 1303 LM.docx", aliases=["Linea PB X", "La Marzocco Linea PB X", "Linea PB X AV 2Gr", "la-marzocco-linea-pb-x"],
    note="AV, не ABR: встроенные весы не заявлены. Если ранее добавлена общая карточка Linea PB X, импорт пропускает её целиком.")

grinder("eureka-firenze-75", "Firenze 75", "eureka",
    t("Кофемолка с жерновами 75 мм и сенсорным выбором дозы. Для помола эспрессо непосредственно в портафильтр.", "A 75 mm grinder with touch dose selection for grinding espresso directly into the portafilter.", "75 мм диірмен тастары және сенсорлық мөлшер таңдауы бар кофе тартқыш. Эспрессоны тікелей портафильтрге ұнтақтайды."),
    dimensions(700, 218, 258) + [("weight", units(13, "kg")), ("power", units(340, "W")), ("burrs", units(75, "mm")), ("hopper", units(2, "kg")), ("rpm50", units(1350, "rpm"))],
    ["stepless", "touch", "fork", f(t("система ACE", "ACE system", "ACE жүйесі"), t("Уменьшает комки и статический заряд.", "Reduces clumping and static charge.", "Түйіршіктену мен статикалық зарядты азайтады."))],
    ["https://www.eureka.co.it/it/products/eureka%2B1920/commercial%2Bgrinders/firenze%2Brange/104/"])

grinder("anfim-luna", "Luna", "anfim",
    t("Кофемолка с плоскими жерновами 65 мм и сенсорным экраном. Сохранённые рецепты помогают быстро переключаться между порциями.", "A flat-burr 65 mm grinder with a touchscreen and saved recipes for quick dose selection.", "65 мм жалпақ диірмен тастары мен сенсорлық экраны бар кофе тартқыш. Сақталған рецепттер мөлшерлерді жылдам таңдауға көмектеседі."),
    dimensions(580, 195, 371) + [("weight", units(11.2, "kg")), ("power50", units(440, "W")), ("burrs", units(65, "mm")), ("hopper", units(2, "kg")), ("rpm50", units(1500, "rpm"))],
    ["touch", "stepless", "recipes", f(t("съёмный носик", "removable spout", "алынбалы шүмек"), t("Выходной канал снимается для регулярной очистки.", "Remove the outlet for routine cleaning.", "Шығару арнасы күнделікті тазалау үшін алынады."))],
    ["https://www.anfim-milano.com/en/product/luna"])

for key, model, weight, overview, features, source in [
    ("up", "Up", 14, t("Кофемолка для эспрессо с сенсорным управлением и тремя программируемыми дозами. Плавная регулировка помогает подобрать помол под рецепт.", "An espresso grinder with touch controls, three programmable doses and stepless adjustment for recipe setup.", "Сенсорлық басқаруы және үш бағдарламаланатын мөлшері бар эспрессо тартқыш. Бірқалыпты реттеу рецептке сай ұнтақтауды таңдауға көмектеседі."), ["touch", "stepless", "gfc", "fork"], "https://www.mazzer.com/wp-content/uploads/2021/10/depliant-Super-Jolly-V-Up-2022-ELECTRONIC-ENG-split-pages.pdf"),
    ("pro", "Pro", 15, t("Эспрессо-кофемолка с жерновами 64 мм и электронным дозированием. Настройка помола сохраняется при очистке рабочей камеры.", "A 64 mm espresso grinder with electronic dosing and chamber access that preserves the grind setting.", "64 мм диірмен тастары және электрондық мөлшерлеуі бар эспрессо тартқыш. Жұмыс камерасын тазалағанда ұнтақтау баптауы сақталады."), ["recipes", "stepless", "gfc", "clean"], "https://www.mazzer.com/wp-content/uploads/2021/07/depliant_Super_Jolly_V_2021_ELECTRONIC_ENG_split_pages_WEB.pdf"),
]:
    grinder(f"mazzer-super-jolly-v-{key}-electronic", f"Super Jolly V {model} Electronic", "mazzer", overview,
        dimensions(595, 240, 410) + [("weight", units(weight, "kg")), ("power", units(350, "W")), ("burrs", units(64, "mm")), ("hopper", units(1.1, "kg")), ("rpm50", units(1400, "rpm"))],
        features, [source, MAZZER_GFC], note="Именно V Up / V Pro 350 W. Габариты с поддоном по чертежу B × D × H; не новая Super Jolly 550 W.")

for key, rpm, source, overview in [
    ("v", 1400, "https://importaliashop.co.za/wp-content/uploads/2020/09/Mazzer-Major-V-electronic-brochure.pdf", t("Кофемолка с плоскими жерновами 83 мм для интенсивной работы с эспрессо. Электронное дозирование упрощает повторение порций.", "An 83 mm flat-burr grinder for busy espresso service, with electronic dosing for repeatable portions.", "Қарқынды эспрессо жұмысына арналған 83 мм жалпақ диірмен тасты тартқыш. Электрондық мөлшерлеу порцияларды қайталауды жеңілдетеді.")),
    ("vp", 900, "https://www.mazzer.com/wp-content/uploads/2021/07/depliant-Major-VP-2023-ENG-split-pages-WEB-1.pdf", t("Производительная эспрессо-кофемолка с жерновами 83 мм и пониженными оборотами. Электронное управление поддерживает ежедневную работу кофейни.", "A high-output espresso grinder combining 83 mm burrs with reduced rotation speed and electronic controls.", "83 мм диірмен тастары және төмен айналымы бар өнімді эспрессо тартқыш. Электрондық басқару кофехананың күнделікті жұмысына көмектеседі.")),
]:
    grinder(f"mazzer-major-{key}-electronic", f"Major {key.upper()} Electronic", "mazzer", overview,
        [("burrs", units(83, "mm")), ("power", units(650, "W")), ("rpm50", units(rpm, "rpm")), ("hopper", units(1.6, "kg")), ("weight", units(20.5, "kg")), ("material", ALUMINIUM)],
        ["stepless", "recipes", "gfc", "cool"], [source, MAZZER_GFC], note="Брошюра производителя. Для VP подтверждены 900 об/мин при 50 Гц; V — 1400. Не смешивать модификации.")

grinder("mazzer-kony-s-electronic", "Kony S Electronic", "mazzer",
    t("Эспрессо-кофемолка с коническими жерновами 63 мм и низкими оборотами. Электронные настройки помогают повторять дозу в течение смены.", "A low-speed espresso grinder with 63 mm conical burrs and electronic dose settings for daily service.", "63 мм конустық диірмен тастары және төмен айналымы бар эспрессо тартқыш. Электрондық баптаулар мөлшерді қайталауға көмектеседі."),
    dimensions(651, 240, 413) + [("weight", units(20, "kg")), ("power", units(450, "W")), ("burrs", units(63, "mm")), ("hopper", units(1.3, "kg")), ("rpm50", units(420, "rpm"))],
    ["stepless", "recipes", "gfc", "clean"], [MAZZER_RANGE, MAZZER_GFC], burr_type=CONICAL,
    note="Презентация производителя на сайте дистрибьютора, стр.34–37: Kony S Electronic, не новый Kony 69 mm.")

grinder("mazzer-kony-sg-electronic", "Kony Sg Electronic", "mazzer",
    t("Кофемолка с коническими жерновами и встроенным взвешиванием порции. Подходит для рецептов эспрессо, где доза задаётся в граммах.", "A conical-burr grinder with integrated weighing for espresso recipes defined in grams.", "Конустық диірмен тастары және кіріктірілген таразысы бар тартқыш. Мөлшері граммен белгіленетін эспрессо рецепттеріне арналған."),
    [("burrs", units(63, "mm")), ("weight", units(22, "kg")), ("power", units(450, "W")), ("hopper", units(1.3, "kg")), ("rpm50", units(420, "rpm")), ("rpm60", units(500, "rpm")), ("material", ALUMINIUM)],
    ["gbw", "stepless", "gfc", "cool"], ["https://www.mazzer.com/wp-content/uploads/2023/10/depliant-Kony-Sg-ENG-ITA-web-2.pdf", "https://www.mazzer.com/en/kony-sg/"], control=WEIGHED, burr_type=CONICAL)

grinder("mazzer-philos", "Philos", "mazzer",
    t("Компактная кофемолка для разовой загрузки зерна. Поддерживает эспрессо и фильтр, а доступ спереди упрощает смену кофе и очистку.", "A compact single-dose grinder for espresso and filter, with front access for straightforward cleaning.", "Дәнді бір порциямен салуға арналған ықшам тартқыш. Эспрессо мен фильтрге жарайды, ал алдыңғы қолжетімділік тазалауды жеңілдетеді."),
    dimensions(361, 153, 351) + [("weight", units(12.5, "kg")), ("power", units(400, "W")), ("burrs", units(64, "mm")), ("hopper", units(60, "g")), ("rpm50", units(1400, "rpm"))],
    ["clean", f(t("два режима регулировки", "two adjustment modes", "екі реттеу режимі"), t("Выбор ступенчатой или плавной настройки помола.", "Choose stepped or stepless grind adjustment.", "Қадамды немесе бірқалыпты реттеуді таңдауға болады.")),
     f(t("разовая загрузка", "single dosing", "бір порциялық жүктеу"), t("Зёрна отмеряются отдельно для каждого приготовления.", "Measure beans separately for each brew.", "Әр дайындауға дән бөлек өлшенеді.")),
     f(t("очистка выходного канала", "chute cleaning", "шығару арнасын тазалау"), t("Dose Finisher помогает удалить оставшиеся частицы кофе.", "Dose Finisher helps remove remaining coffee particles.", "Dose Finisher қалған кофе бөлшектерін кетіруге көмектеседі."))],
    ["https://shop-au.mazzer.com/products/philos"], control=t("Разовая загрузка", "Single dose", "Бір порциялық жүктеу"), note="Жернова I200D/I189D — варианты на выбор; конкретный комплект не назначен.")

grinder("mazzer-zm", "ZM", "mazzer",
    t("Кофемолка с цифровой регулировкой для работы с фильтр-кофе. Съёмный контейнер и доступ к камере удобны при смене зерна.", "A digitally adjustable grinder for filter coffee, with a removable grounds container and accessible grinding chamber.", "Фильтр-кофеге арналған цифрлық реттелетін тартқыш. Алынбалы ыдысы мен камераға қолжетімділігі дән ауыстыруға ыңғайлы."),
    [("burrs", units(83, "mm")), ("power", units(800, "W")), ("weight", units(35, "kg")), ("hopper", units(320, "g")), ("rpm50", units(900, "rpm")), ("rpm60", units(1050, "rpm")), ("material", ALUMINIUM)],
    ["cool", f(t("цифровая регулировка", "digital adjustment", "цифрлық реттеу"), t("Степень помола задаётся через электронное управление.", "Set fineness through electronic controls.", "Ұнтақтау дәрежесі электрондық басқарумен белгіленеді.")),
     f(t("съёмный контейнер", "removable container", "алынбалы ыдыс"), t("Фиксируемая ёмкость собирает молотый кофе.", "A locking container collects ground coffee.", "Бекітілетін ыдыс ұнтақталған кофені жинайды.")),
     f(t("доступ к камере", "chamber access", "камераға қолжетімділік"), t("Панель отводится в сторону для обслуживания жерновов.", "The display swings aside for burr maintenance.", "Диірмен тастарын күту үшін панель шетке жылжиды."))],
    ["https://www.caterkwik.co.uk/shop/downloads/MAZZERZM_mazzer-zm-tech-spec-zm-est1.pdf", "https://www.mazzer.com/en/blocchi-prodotto/caratteristiche-zm/", "https://www.mazzer.com/en/product/burrs-k151f/"], control=t("Цифровое", "Digital", "Цифрлық"),
    note="ZM, не ZM Plus. Стандартная фильтр-комплектация из техлиста Mazzer: 800 W, 320 g; американские 900 W / 1.3 kg не перенесены.")

grinder("mahlkonig-ek43-s", "EK43 S", "mahlkonig",
    t("Универсальная кофемолка с жерновами 98 мм в укороченном корпусе. Подходит для разных способов заваривания при соответствующей настройке и комплекте жерновов.", "A shorter all-round grinder with 98 mm burrs for different brewing methods, using the appropriate burr set and settings.", "98 мм диірмен тастары бар аласа корпусты әмбебап тартқыш. Тиісті тастар мен баптаулар арқылы әртүрлі дайындау әдістеріне жарайды."),
    dimensions(680, 230, 410) + [("weight", units(24.5, "kg")), ("power", units(1300, "W")), ("burrs", units(98, "mm")), ("hopper", units(250, "g")), ("rpm50", units(1450, "rpm"))],
    [f(t("универсальный помол", "versatile grinding", "әмбебап ұнтақтау"), t("Широкий диапазон настройки для разных рецептов.", "A broad adjustment range supports different recipes.", "Кең реттеу ауқымы әртүрлі рецепттерге сай келеді.")),
     f(t("держатель пакета", "bag holder", "пакет ұстағышы"), t("Удерживает пакет под выходом молотого кофе.", "Keeps a bag beneath the grounds outlet.", "Пакетті ұнтақталған кофе шығатын арна астында ұстайды.")),
     f(t("компактная высота", "reduced height", "аласа корпус"), t("Укороченный корпус удобен для размещения на стойке.", "The shorter body fits conveniently on the counter.", "Аласа корпус үстелге орналастыруға ыңғайлы.")),
     f(t("жернова 98 мм", "98 mm burrs", "98 мм диірмен тастары"), t("Крупные плоские жернова из литой стали.", "Large flat burrs made from cast steel.", "Құйма болаттан жасалған ірі жалпақ диірмен тастары."))],
    ["https://www.mahlkoenig.com/products/ek43-s"], control=t("Ручное включение", "Manual activation", "Қолмен қосу"), note="Актуальная официальная страница: бункер 250 g, 24.5 kg; старые варианты бункера не подставлены.")

grinder("mahlkonig-e80s-gbw", "E80S GbW", "mahlkonig",
    t("Эспрессо-кофемолка с жерновами 80 мм и дозированием по весу. Распознавание портафильтра помогает быстро выбрать нужную порцию.", "An 80 mm espresso grinder with weight-based dosing and portafilter recognition for fast dose selection.", "80 мм диірмен тастары және салмақ бойынша мөлшерлеуі бар эспрессо тартқыш. Портафильтрді тану қажетті мөлшерді жылдам таңдауға көмектеседі."),
    dimensions(630, 240, 340) + [("weight", units(18, "kg")), ("power50", units(520, "W")), ("burrs", units(80, "mm")), ("hopper", units(1.8, "kg")), ("rpm50", units(1400, "rpm"))],
    ["gbw", "cool", f(t("контроль зазора DDD", "DDD gap detection", "DDD саңылауды бақылау"), t("Отображает расстояние между жерновами для точной настройки.", "Displays burr distance to support precise adjustment.", "Дәл баптау үшін диірмен тастарының арақашықтығын көрсетеді.")),
     f(t("распознавание портафильтра", "portafilter detection", "портафильтрді тану"), t("Выбирает дозу по установленному портафильтру.", "Selects the dose for the inserted portafilter.", "Орнатылған портафильтрге сай мөлшерді таңдайды."))],
    ["https://downloads.mahlkoenig.de/Products/Mahlkoenig_E80S_GbW_Espresso_Grinder_Product_Sheet.pdf"], control=WEIGHED, aliases=["Mahlkonig E80 GBW", "Mahlkönig E80 GBW"], note="E80 GBW нормализовано до официального E80S GbW. Это не E80W GbS; автоматическая синхронизация не заявлена.")
ITEMS[-1]["document"] = "КП  Modbar.docx"

grinder("victoria-arduino-mythos-my75-white", "Mythos MY75 White", "victoria-arduino",
    t("Эспрессо-кофемолка MY75 с сенсорной панелью и дозированием по времени. Два вентилятора помогают поддерживать условия помола при работе.", "A MY75 espresso grinder with touch controls, timed dosing and dual-fan ventilation during service.", "Сенсорлық панелі және уақыт бойынша мөлшерлеуі бар MY75 эспрессо тартқышы. Екі желдеткіш жұмыс кезіндегі ұнтақтау жағдайын сақтауға көмектеседі."),
    dimensions(479, 195, 395) + [("weight", units(23.8, "kg")), ("power", t("600 Вт (220 В)", "600 W (220 V)", "600 Вт (220 В)")), ("burrs", units(75, "mm")), ("hopper", units(1.5, "kg"))],
    ["touch", "recipes", "cool", f(t("Clump Crusher", "Clump Crusher", "Clump Crusher"), t("Выходной узел уменьшает образование комков.", "The outlet insert reduces clumping.", "Шығару торабы түйіршіктердің пайда болуын азайтады."))],
    ["https://victoriaarduino.com/en/products-machines/mythos/"], aliases=["Victoria Arduino Mythos MY 75 white", "Mythos MY75"], note="MY75 — по времени, не MYG75 с весами. White сохранено как часть названия из документа; цвет поставки проверить при добавлении фото.")

for model, h, w, d, weight, compatible, url in [
    ("M3", 147, 194, 283, 4.6, "Mahlkönig E65S / E65S GbW", "https://puq.coffee/products/puqpress-integrated-m3-mahlkonig-grinder"),
    ("M5", 140, 233, 338, 5.5, "Mahlkönig E80S / E80S GbW", "https://puq.coffee/products/puqpress-integrated-m5-e80-grinder"),
    ("M6", 138, 195, 375, 5.2, "Victoria Arduino Mythos MY75 / MY85 / MYG75 / MYG85", "https://puq.coffee/products/puqpress-integrated-m6-victoria-arduino-grinder"),
]:
    add(f"puqpress-{model.lower()}", f"PUQpress {model}", "puqpress", "tamper",
        t("Автоматический темпер для установки под совместимой кофемолкой. Помогает повторять усилие прессования и экономит место на стойке.", "An automatic tamper installed beneath a compatible grinder to repeat tamping force and save counter space.", "Үйлесімді кофе тартқыштың астына орнатылатын автоматты темпер. Тығыздау күшін қайталайды және үстелдегі орынды үнемдейді."),
        [("series", model), ("compatibility", compatible), ("format", t("Под кофемолку", "Under-grinder", "Тартқыш астына"))],
        dimensions(h, w, d) + [("weight", units(weight, "kg")), ("power", units(76, "W")), ("force", units("5–30", "kg")), ("diameter", units("53–58.3", "mm")), ("voltage", "110–240 V, 50–60 Hz")],
        [f(t("настройка усилия", "force adjustment", "күшті реттеу"), t("Усилие меняется с шагом 1 кг.", "Adjust force in 1 kg increments.", "Күш 1 кг қадаммен реттеледі.")),
         f(t("профили темперовки", "tamping profiles", "тығыздау профильдері"), t("Режимы позволяют подобрать цикл под рабочий процесс.", "Select a cycle to suit the workflow.", "Жұмысқа сай циклді таңдауға болады.")),
         f(t("установка под кофемолку", "under-grinder installation", "тартқыш астына орнату"), t("Использует пространство под совместимой моделью.", "Uses the space beneath a compatible model.", "Үйлесімді модель астындағы орынды пайдаланады.")),
         f(t("регулируемая опора", "adjustable support", "реттелетін тірек"), t("Высота держателя настраивается под портафильтр.", "Adjust the holder height to the portafilter.", "Ұстағыш биіктігі портафильтрге сай реттеледі."))],
        [url, "https://cdn.puq.coffee/media/brochures/user-manual-integrated-puq-press-2025.pdf"],
        "Sketo 1609Gr.docx" + ("; КП  Modbar.docx" if model == "M5" else ""),
        aliases=[f"Puqress {model}"], note="Повтор M5 объединён. Диаметр диска выбирается при заказе; диапазон не означает регулируемый диаметр одного диска.")

add("modbar-steam", "Modbar Steam", "modbar", "steam-module",
    t("Отдельная паровая станция с модулем под столешницей. Освобождает рабочую поверхность и позволяет разместить взбивание молока в удобной точке бара.", "A separate steam station with an under-counter module, allowing milk preparation wherever the bar layout needs it.", "Модулі үстел астында орналасатын бөлек бу станциясы. Сүт көпіршіту орнын бардың ыңғайлы жеріне орналастыруға мүмкіндік береді."),
    [("series", "Steam"), ("format", t("Подстольный модуль и кран", "Under-counter module and tap", "Үстел асты модулі және кран")), ("use", t("Взбивание молока", "Milk steaming", "Сүт көпіршіту"))],
    [("module_dims", units("430 × 380 × 220", "mm")), ("tap_dims", units("90 × 270 × 320", "mm")), ("module_weight", units(18, "kg")), ("tap_weight", units(3.5, "kg")), ("boiler", units(4.6, "L")), ("power", t("3306 Вт (CE)", "3306 W (CE)", "3306 Вт (CE)")), ("voltage", "208–240 V, 50–60 Hz")],
    [f(t("модульная установка", "modular installation", "модульдік орнату"), t("Бойлер размещается под стойкой, кран — сверху.", "The boiler sits below the counter, the tap above.", "Бойлер үстел астында, кран үстінде орналасады.")),
     f(t("Pro Touch", "Pro Touch", "Pro Touch"), t("Изолированная трубка облегчает работу с паром.", "An insulated wand supports steam handling.", "Оқшауланған түтік бумен жұмысты жеңілдетеді.")),
     f(t("отдельный бойлер", "dedicated boiler", "бөлек бойлер"), t("Паровая станция работает независимо от эспрессо-модуля.", "The steam station operates independently of the espresso module.", "Бу станциясы эспрессо модулінен тәуелсіз жұмыс істейді.")),
     f(t("циркуляция воды", "water circulation", "су айналымы"), t("Система обновляет воду в паровом бойлере.", "The system refreshes water in the steam boiler.", "Жүйе бу бойлеріндегі суды жаңартады."))],
    ["https://modbar.com/wp-content/uploads/prodotti/Modbar-Steam-brochure.pdf"], "КП  Modbar.docx", note="Размеры крана и подстольного модуля разделены. Мощность CE, не ETL.")


def validate():
    assert len(ITEMS) == 22
    assert len({p['slug'] for p in ITEMS}) == len(ITEMS)
    for p in ITEMS:
        assert p['sources'] and p['document']
        for l, tr in p['translations'].items():
            assert len(tr['details']) == 4 and 4 <= len(tr['features']) <= 6
            assert 6 <= len(tr['specifications']) <= 9
            assert len(tr['seo_title']) <= 100 and len(tr['seo_description']) <= 180, (p['slug'], l, 'SEO length')
            assert len(tr['description']) <= 230
            if l == 'en':
                assert not re.search('[а-яА-ЯёЁ]', json.dumps(tr, ensure_ascii=False)), p['slug']


if __name__ == '__main__':
    validate()
    payload = json.dumps(ITEMS, ensure_ascii=False, indent=2)
    template = (ROOT / 'equipment_import.template.sql').read_text()
    (ROOT / '20261007_equipment_catalog.sql').write_text(template.replace('__EQUIPMENT_JSON__', payload))
    sources = ['# Источники оборудования — 07.10.2026', '', 'Из четырёх DOCX взяты только названия. Тексты написаны заново на RU / EN / KZ по интернет-источникам ниже. Цены и наличие не исследовались. Ссылки не добавляются в карточки.', '']
    for p in ITEMS:
        sources += [f"## {p['name']} ({BRANDS[p['brand']]})", '', f"Документ с названием: {p['document']}", '']
        sources += [f'- [Источник {i+1}]({url})' for i, url in enumerate(p['sources'])]
        if p['note']:
            sources += ['', p['note']]
        sources += ['']
    (ROOT / '20261007_equipment_sources.md').write_text('\n'.join(sources))
    print(f'Generated {len(ITEMS)} products × 3 locales.')
