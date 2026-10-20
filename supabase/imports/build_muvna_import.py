"""Build a reviewed, retail-only MUVNA import; no database/network access.

Source PDF extraction: extract_muvna.py. Public Shopify catalogs are optional
research caches in /tmp/muvna-{au-1,au-2,au-3,global-1}.json; only SKU identities
and image candidates are retained, never their prices or stock.
"""
import json
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
source = json.loads((HERE / "20261012_muvna_source.json").read_text())
rows = {r["sku"]: r for r in source["rows"]}
groups = []
assigned = set()

def group(skus, slug, name, category, description, attributes=None, urls=None, note=""):
    skus = skus.split()
    assert not assigned.intersection(skus), skus
    assert len({rows[s]["retail"] for s in skus}) == 1, f"Mixed prices: {skus}"
    assigned.update(skus)
    groups.append(dict(skus=skus, slug="muvna-" + slug, name=name, category=category,
                       description=description, attributes=attributes or {},
                       urls=urls or [], note=note))

RU = "https://muvna.ru/"
group("MK2673", "mach-m8-set", "MUVNA Mach M8 — комплект ручной кофемашины", "coffee-makers",
      "Ручная кофемашина Mach M8 для приготовления эспрессо с механическим управлением давлением. В прайсе представлена комплектом.",
      note="Точный состав комплекта подтвердить у поставщика; не переносить комплектацию других версий MACH.")
group("G2888 G2899", "mammoth", "Кофемолка MUVNA Mammoth", "grinders",
      "Электрическая кофемолка Mammoth для помола кофейных зёрен перед приготовлением напитка.")
group("FP2349 FP2343", "mobius-58-18-titanium", "Корзина MUVNA Mobius 58 мм, 18 г — титановое покрытие", "baskets",
      "Фильтр-корзина для приготовления эспрессо. Диаметр 58 мм, номинальная дозировка 18 г; доступны два цвета титанового покрытия.", {"diameter_mm":58,"dose_g":18,"finish":"titanium coating"})
group("FB2298", "mobius-58-18-natural", "Корзина MUVNA Mobius 58 мм, 18 г — сталь", "baskets",
      "Фильтр-корзина для приготовления эспрессо, в исполнении без цветного титанового покрытия.", {"diameter_mm":58,"dose_g":18})
for sku,count,base in [("GC2398",6,"acrylic"),("GC2399",12,"acrylic"),("GC2598",6,"walnut"),("GC2599",12,"walnut")]:
    label = "акриловая" if base == "acrylic" else "ореховая"
    group(sku, f"angel-{count}-{base}", f"MUVNA Angel — {count} контейнеров, {label} подставка", "storage",
          "Набор контейнеров для хранения отдельных порций кофейного зерна на общей подставке.", {"tube_count":count,"base_material":base})
for sku,color in [("P2460","silver"),("P2464","purple")]:
    group(sku,f"ti-art-600-{color}","Питчер MUVNA Ti-Art 600 мл — " + ("серебристый" if color=="silver" else "фиолетовый"),"milk-tools",
          "Питчер Ti-Art для работы с молоком и выполнения латте-арта.",{"volume_ml":600},[RU+"espresso/pitcher"])
group("P2726", "dbw-600-natural", "Питчер MUVNA DBW 600 мл", "milk-tools",
      "Питчер DBW с носиком для направленного налива молока при выполнении латте-арта.",{"volume_ml":600})
for skus,size,finish in [("P2011",600,"natural"),("P2017 P2019",600,"coated"),("P2092",350,"natural"),("P2095",350,"black")]:
    group(skus,f"b-type-{size}-{finish}",f"Питчер MUVNA B-type {size} мл"+(" — натуральная сталь" if finish=="natural" else " — цветное исполнение"),"milk-tools",
          "Питчер для вспенивания и налива молока при приготовлении кофейных напитков.",{"volume_ml":size},[RU+"espresso/pitcher"])
group("CN2780","latte-art-pen","Перо MUVNA для латте-арта","milk-tools",
      "Инструмент для нанесения деталей рисунка на поверхности молочной пены.",note="Название и назначение однозначны в PDF; подробные характеристики CN2780 в открытых источниках не подтверждены.")
group("GB2081","angled-knock-box","Нок-бокс MUVNA Angled","tamping-stations",
      "Контейнер для выбивания отработанной кофейной таблетки из портафильтра. Модель со скошенным верхом.")
group("GB2083","knock-box","Нок-бокс MUVNA","tamping-stations",
      "Контейнер для сбора отработанных кофейных таблеток после приготовления эспрессо.")
group("T2361T","adjustable-tamper-5835","Темпер MUVNA Infinitely Adjustable 58,35 мм","tampers",
      "Темпер с регулируемой глубиной и рифлёным основанием для уплотнения молотого кофе.",{"diameter_mm":58.35,"base":"threaded"})
group("T2245T","constant-pressure-tamper-58","Темпер MUVNA Constant Pressure 58 мм","tampers",
      "Темпер для формирования кофейной таблетки. Версия с рифлёным основанием диаметром 58 мм.",{"diameter_mm":58,"base":"threaded"})
group("T2289L5","gravity-pentagonal-58","Разравниватель MUVNA Gravity 58 мм, пять лопастей","distributors",
      "Инструмент для распределения молотого кофе в корзине перед темперовкой. Основание с пятью лопастями.",{"diameter_mm":58,"paddles":5})
group("T2207L4","v2-distributor-58","Разравниватель MUVNA V2 58 мм","distributors",
      "Разравниватель кофейного слоя с четырёхлопастным основанием.",{"diameter_mm":58,"paddles":4})
group("T2064","gripped-distributor-58-white","Разравниватель MUVNA Gripped 58 мм","distributors",
      "Разравниватель молотого кофе с трёхлопастным основанием для подготовки корзины к темперовке.",{"diameter_mm":58,"paddles":3})
group("T2127L4","walnut-distributor-58","Разравниватель MUVNA Walnut 58 мм","distributors",
      "Разравниватель с деревянной верхней частью и четырёхлопастным основанием.",{"diameter_mm":58,"paddles":4})
group("T2654L4","titan-5835","Разравниватель MUVNA Titan 58,35 мм","distributors",
      "Гравитационный разравниватель для подготовки равномерного слоя молотого кофе.",{"diameter_mm":58.35})
group("T2653T","click-tamper-5835","Темпер MUVNA Click 58,35 мм","tampers",
      "Пружинный темпер с тактильным щелчком при завершении нажатия.",{"diameter_mm":58.35})
for sku,vol in [("BZ2282",160),("BZ2283",220),("BZ2284",320)]:
    group(sku,f"tivat-{vol}",f"Стакан MUVNA Tivat {vol} мл","drinkware",
          "Стеклянный стакан для подачи кофе и других напитков.",{"volume_ml":vol},[RU+"scale/cup"])
group("G2430 G2429 G2426","xingyu-100-coated","Молочник MUVNA Xingyu 100 мл — цветное исполнение","drinkware",
      "Небольшой стальной сосуд с носиком для подачи и аккуратного переливания напитка.",{"volume_ml":100},[RU+"espresso/pitcher"])
group("G2424","xingyu-100-natural","Молочник MUVNA Xingyu 100 мл — сталь","drinkware",
      "Небольшой сосуд с носиком для подачи эспрессо или молока.",{"volume_ml":100},[RU+"espresso/pitcher"])
group("BP2575 BP2573 BZ2764","kare-280","Кофейная пара MUVNA Kare 280 мл","drinkware",
      "Керамическая чашка с блюдцем для подачи кофейных напитков.",{"volume_ml":280},[RU+"scale/cup"])
group("G2655 G2656 G2657 G2658","tasting-bowl-120","Дегустационная чаша MUVNA 120 мл","drinkware",
      "Керамическая чаша без ручки для дегустации кофе.",{"volume_ml":120},[RU+"scale/cup"],
      "Цвета взяты из PDF. В зарубежных карточках цвета этих SKU перепутаны; фото требуют ручной проверки.")
group("G2765 G2766","tasting-cup-crystalline","Дегустационная чашка MUVNA — кристаллическая глазурь","drinkware",
      "Чашка для дегустации кофе с кристаллической отделкой поверхности.",{"finish":"crystalline"},
      ["https://www.coffeeparts.com.au/muvna-tasting-cup-green"],"Объём в прайсе не указан; не подставлять 120 мл от другой серии G265x.")
group("G2767 G2769 G2768","tasting-cup","Дегустационная чашка MUVNA","drinkware",
      "Чашка для подачи и дегустации кофе в трёх цветовых исполнениях.",urls=["https://www.coffeeparts.com.au/accessories/cups-and-glassware/dine-in-cups-and-glasses"],note="Объём не подтверждён.")
for sku,color in [("BK2714","white"),("BK2779","black")]:
    group(sku,f"electric-kettle-600-uk-{color}","Электрический чайник MUVNA 600 мл, UK — "+("белый" if color=="white" else "чёрный"),"kettles",
          "Чайник с регулировкой температуры для приготовления кофе. В прайсе указана британская вилка UK.",{"volume_ml":600,"plug":"UK"},
          ["https://tiendabarista.pe/producto/tetera-cuello-de-cisne-electrica-muvna-600ml/"],"Не утверждать комплектацию адаптером; проверить питание перед продажей.")
group("FP2371","filter-paper-v02","Бумажные фильтры MUVNA V02","filters",
      "Отбеленные бумажные фильтры для приготовления кофе в воронке формата V02.",{"size":"V02"})
group("FP2683","cake-filter-paper","Бумажные фильтры MUVNA Cake, 2–4 порции","filters",
      "Бумажные фильтры для воронок Cake на 2–4 порции.",{"servings":"2–4"},note="Число фильтров в упаковке в PDF отсутствует; уточнить до публикации.")
group("FC2530 FC2439","xingchuan-v01","Воронка MUVNA XingChuan V01","drippers",
      "Керамическая воронка для ручного приготовления фильтр-кофе.",{"size":"V01"},[RU+"brew/dripper"])
group("FC2531 FC2521 FC2442 FC2441","xingwo-v01","Воронка MUVNA XingWo V01","drippers",
      "Керамическая воронка со спиральными рёбрами для ручного заваривания кофе.",{"size":"V01"},[RU+"brew/dripper"])
for skus,size,servings in [("FC2641 FC2643","01",2),("FC2642 FC2644","02",4)]:
    group(skus,f"cake-{size}",f"Воронка MUVNA Cake {size}","drippers",
          "Керамическая воронка для заваривания фильтр-кофе с бумажными фильтрами Cake.",{"servings":servings},[RU+"brew/dripper"])
for sku,color in [("FC2718","colorful"),("FC2717","transparent")]:
    group(sku,f"li-v60-{color}","Стеклянная воронка MUVNA LI V60 — "+("мультиколор" if color=="colorful" else "прозрачная"),"drippers",
          "Стеклянная воронка для ручного заваривания кофе.",{"size":"V60"},[RU+"brew/dripper"])
group("FC2720","li-v60-stand-walnut","Подставка MUVNA LI V60, орех","drippers",
      "Деревянная подставка для воронки MUVNA LI V60.",{"material":"walnut"},[RU+"brew/dripper"])
group("CS2636 CS2697","pour-over-gm1-set","Набор MUVNA для пуровера с кофемолкой GM1","sets",
      "Набор для ручного заваривания кофе с кофемолкой GM1 и принадлежностями для пуровера.",urls=[
      "https://tiendabarista.pe/producto/kit-barista-v60-8-piezas-molino-gm1-negro/",
      "https://tiendabarista.pe/producto/kit-barista-v60-8-piezas-molino-gm1-blanco/"],note="Точный состав поставки сверить перед публикацией.")
group("TC2750 TC2754","pour-the-seasons-plan-a","MUVNA Pour the Seasons — Plan A","sets",
      "Комплект для приготовления фильтр-кофе в переносном кейсе. Исполнение Plan A.",urls=["https://tiendabarista.pe/producto/kit-barista-v60-13-piezas-maletin-portatil/"],note="Plan B — отдельная комплектация с портативной электрической кофемолкой, по уточнению заказчика.")
group("G2627 G2629","gm1","Ручная кофемолка MUVNA GM1","grinders",
      "Ручная кофемолка для помола зёрен непосредственно перед приготовлением кофе.",urls=[RU+"brew/grinders"])
group("G2705","electric-grinder-plug-in","Электрическая кофемолка MUVNA G2705","grinders",
      "Электрическая кофемолка с сетевым питанием для помола кофейных зёрен.",{"power_supply":"mains"})
group("CT5063 CT5062","waffle-towel-30","Вафельное полотенце MUVNA 30 × 30 см","cleaning",
      "Вафельное полотенце для ухода за рабочим местом бариста.",{"size_cm":"30 × 30"},note="CT5062: PDF указывает белый, AU — серый. Цвет из PDF; фото не подтверждено.")
group("CT2291 CT2290","barista-towel","Полотенце бариста MUVNA","cleaning",
      "Полотенце для протирки рабочего места и принадлежностей кофейного бара.")
group("CW2186","rinser-large-round","Ринзер MUVNA Large — круглые отверстия","rinsers",
      "Промыватель для ополаскивания питчеров и посуды на баре. Большая версия с круглыми отверстиями панели.",{"version":"large","panel":"circular holes"})
group("CW2189","rinser-medium-slots","Ринзер MUVNA Medium — щелевая панель","rinsers",
      "Промыватель для ополаскивания питчеров и посуды. Средняя версия со щелевой панелью.",{"version":"medium","panel":"narrow slots"})
for skus,capacity in [("GC2299 GC2314",250),("GC2300 GC2315",500),("GC2301",750)]:
    group(skus,f"storage-{capacity}",f"Контейнер MUVNA для кофе, {capacity} г","storage",
          "Контейнер для хранения кофейного зерна. Вместимость указана производителем в граммах кофе.",{"capacity_g":capacity})
group("DR2606","gyro-drop-58-natural","Дозатор MUVNA Gyro Coffee Drop 58 мм — сталь","dosing",
      "Дозатор с поворотным механизмом для переноса молотого кофе в портафильтр.",{"diameter_mm":58})
group("DR2605 DR2604","gyro-drop-58-coated","Дозатор MUVNA Gyro Coffee Drop 58 мм","dosing",
      "Дозатор с поворотным механизмом для переноса молотого кофе в портафильтр.",{"diameter_mm":58})
group("ZQ2608","spray-10","Распылитель MUVNA Electro Spray 10 мл","dosing",
      "Компактный распылитель воды для увлажнения кофейного зерна перед помолом.",{"volume_ml":10})
for sku,shape,label in [("TP2602","long","прямоугольный"),("TP2601","square","квадратный"),("TP2600","round","круглый")]:
    group(sku,f"walnut-tray-{shape}",f"Поднос MUVNA Walnut — {label}","serving",
          "Деревянный поднос для подачи напитков и размещения кофейных принадлежностей.",{"shape":shape,"material":"walnut"})
group("PS2318 PS2317","silicone-tamping-mat","Силиконовый коврик MUVNA для темперовки","tamping-stations",
      "Коврик для размещения инструментов и защиты рабочей поверхности во время темперовки.",{"material":"silicone"})
group("MS2721","titanium-cupping-spoon","Титановая ложка MUVNA для каппинга","cupping",
      "Ложка для профессиональной и домашней дегустации кофе.",{"material":"titanium"},[RU+"scale/spoon"])
for skus,slug,label in [
    ("KC5317","portafilter","портафильтр"),("KC5316","bottomless-portafilter","бездонный портафильтр"),
    ("KC5314","tamper","темпер"),("KC5313","siphon","сифон"),("KC5310","kettle","чайник"),
    ("KC5309 KC5308","ek43","кофемолка EK43"),("KC5307","pitcher","питчер"),
    ("KC5306","moka","гейзерная кофеварка"),("KC5305","grinder","кофемолка")]:
    group(skus,"keyring-"+slug,"Брелок MUVNA — "+label,"gifts",
          "Декоративный брелок в форме кофейного инструмента: "+label+". Миниатюра, не предназначенная для приготовления кофе.")
group("ZQ2609 ZQ2610","dandelion-blower","Груша MUVNA Dandelion для очистки","cleaning",
      "Ручная воздушная груша для удаления частиц кофе с принадлежностей и труднодоступных поверхностей.")
group("B2630","group-head-steamer","Паровая щётка MUVNA для очистки группы","cleaning",
      "Приспособление со щёткой и шлангом для очистки кофейной группы с использованием пара кофемашины.",urls=["https://www.coffeeparts.com.au/muvna-group-head-cleaning-steamer"],note="Совместимость подключения уточнить; это насадка, не самостоятельный парогенератор.")
group("DR2271 DR2274 DC2397","magnetic-dosing-ring-58","Дозировочное кольцо MUVNA 58 мм","dosing",
      "Кольцо для портафильтра, помогающее удерживать молотый кофе внутри корзины при дозировании.",{"diameter_mm":58},[RU+"scale/dosing"])
group("DC2103 DC2104","diamond-dosing-cup-58","Дозировочный стакан MUVNA Diamond 58 мм","dosing",
      "Стакан для приёма молотого кофе и пересыпания в портафильтр.",{"diameter_mm":58})
group("CN2638 CN2639","espresso-ice-ball","Охлаждающий шар MUVNA Espresso Ice Ball","cupping",
      "Набор с металлическим шаром и держателем для контактного охлаждения кофе при проливе.",urls=["https://www.coffeeparts.com.au/muvna-espresso-ice-ball-set-gold"])
group("SP2680 SP2681 SP2679","powder-shaker","Диспенсер MUVNA для какао и корицы","milk-tools",
      "Диспенсер для посыпки напитков какао, корицей и другими сухими ингредиентами.",urls=[RU+"scale/frother"])
group("ZQ2640","thermometer","Термометр MUVNA","milk-tools",
      "Термометр для контроля температуры при приготовлении напитков.",urls=[RU+"scale/frother"])
group("G2788","espresso-creed-set","MUVNA Espresso Creed — переносной комплект","coffee-makers",
      "Переносной комплект для приготовления эспрессо.",note="Состав конкретного комплекта G2788 подтвердить перед публикацией.")
group("P2689 P2691","milk-frother-stick","Вспениватель молока MUVNA Milk Frother Stick","milk-tools",
      "Ручной электрический вспениватель для приготовления молочной пены.",urls=[RU+"scale/frother"])
group("ES2727","zero-g-mini-black","Кофейные весы MUVNA Zero-G Mini","scales",
      "Компактные кофейные весы с таймером для контроля рецепта по массе напитка и времени.",urls=[RU+"scale/smart"])
for sku,color in [("ES2421","black"),("ES2420","white")]:
    group(sku,f"psyche-mini-{color}","Кофейные весы MUVNA Psyche Mini — "+("чёрные" if color=="black" else "белые"),"scales",
          "Компактные электронные весы с таймером для дозирования кофе и контроля приготовления.",urls=[RU+"scale/smart"])
group("ES2368 ES2369","psyche-m1","Кофейные весы MUVNA Psyche M-1","scales",
      "Электронные кофейные весы с таймером для взвешивания ингредиентов и контроля приготовления.",urls=[RU+"scale/smart"])
group("ES2498","mini-walnut-scale","Кофейные весы MUVNA Mini Walnut","scales",
      "Компактные кофейные весы в деревянном исполнении Walnut.",{"material":"walnut"})
group("ES2633","metal-scale-black","Кофейные весы MUVNA Metal","scales",
      "Кофейные весы с таймером в металлическом корпусе.",urls=[RU+"scale/smart"])
for sku,color in [("ES2686","black"),("ES2687","white")]:
    group(sku,f"bean-plate-{color}","Весы-дозатор MUVNA Bean Plate — "+("чёрные" if color=="black" else "белые"),"scales",
          "Весы в форме дозировочного совка для взвешивания и пересыпания кофейных зёрен.",{"material":"ABS"},[RU+"scale/dosing"])
group("ES2634","bean-tray-walnut","Весы-дозатор MUVNA Walnut","scales",
      "Деревянный дозировочный совок со встроенными электронными весами.",{"material":"walnut"})
group("G2747","gt1-grinder","Электрическая кофемолка MUVNA GT1","grinders",
      "Переносная электрическая кофемолка для помола зерна перед приготовлением кофе.",urls=["https://tiendabarista.pe/producto/molino-de-cafe-electrico-portatil-con-bateria-recargable-y-ajuste-de-molienda-muvna/"])
group("BZ2771 BZ2772","portable-pour-over-3-in-1","MUVNA Portable Pour Over 3 в 1","coffee-makers",
      "Переносное устройство, объединяющее электрическую кофемолку и принадлежности для приготовления фильтр-кофе.")

# User-confirmed additions. Keep the PDF's combined diameter label literally:
# it does not establish two independently selectable sizes or two separate SKUs.
group("BP2554 BP2555", "bottomless-portafilter-58", "Бездонный портафильтр MUVNA 58 мм", "baskets",
      "Бездонный портафильтр с двумя крепёжными выступами. Доступен в чёрном и белом исполнении.",
      {"diameter_mm":58})
group("T2458T", "threaded-base-58-5835", "Темпер MUVNA 58/58.35mm — рифлёное основание", "tampers",
      "Темпер с рифлёным основанием. Размер по прайсу: 58/58.35mm.",
      {"diameter_label":"58/58.35mm", "base":"threaded"})
group("T2467L3 T2464L3", "x-base-58-5835", "Разравниватель MUVNA 58/58.35mm — X-образное основание", "distributors",
      "Разравниватель молотого кофе с X-образным основанием. Размер по прайсу: 58/58.35mm.",
      {"diameter_label":"58/58.35mm", "base":"X-shaped dual paddle"})
group("T2274L4", "four-paddle-58-gray", "Разравниватель MUVNA 58 мм — серый", "distributors",
      "Разравниватель молотого кофе с четырёхлопастным основанием. Серое исполнение.",
      {"diameter_mm":58, "paddles":4})
for sku,model in [("T2489Z","Mantis"),("T2647Z","Teemo")]:
    group(sku, model.lower()+"-58", f"Игольчатый разравниватель MUVNA {model} 58 мм", "distributors",
          f"Игольчатый разравниватель {model} для распределения молотого кофе в корзине. Диаметр по прайсу — 58 мм.",
          {"diameter_mm":58})
group("KC2707", "keyring-xingchuan", "Брелок MUVNA — воронка XingChuan", "gifts",
      "Декоративный брелок в форме воронки XingChuan. Миниатюра, не предназначенная для приготовления кофе.")

group("BK2693 BK2694", "pour-over-kettle", "Чайник MUVNA Pour-Over Kettle", "kettles",
      "Чайник для ручного заваривания кофе методом пуровер. Чёрное и белое исполнение.",
      urls=["https://www.stockroastery.com/en-ae/products/muvna-pour-over-kettle-black-2"])
group("TC2751 TC2755", "pour-the-seasons-plan-b", "MUVNA Pour the Seasons — Plan B", "sets",
      "Комплект для приготовления фильтр-кофе в переносном кейсе. Включает набор Plan A и портативную электрическую кофемолку. Чёрное и белое исполнение.",
      {"base_set":"Plan A", "additional_item":"portable electric coffee grinder"})
group("G2489", "gm2", "Ручная кофемолка MUVNA GM2", "grinders",
      "Ручная кофемолка GM2 со складной ручкой для помола кофейных зёрен.", {"foldable_handle":True})
group("SP2676 SP2677", "silicone-mat", "Силиконовый коврик MUVNA", "tamping-stations",
      "Силиконовый коврик для рабочего места бариста. Серое и чёрное исполнение.", {"material":"silicone"})
for skus,volume in [("BZ2618 BZ2622",615),("BZ2619 BZ2621 BZ2623",685)]:
    group(skus, f"thermos-{volume}", f"Термос MUVNA {volume} мл", "drinkware",
          f"Термос для напитков объёмом {volume} мл. Доступен в нескольких цветах.", {"volume_ml":volume})
group("ES2625", "inclined-scale-cherry", "Кофейные весы MUVNA — вишнёвое дерево", "scales",
      "Электронные кофейные весы в корпусе из вишнёвого дерева с наклонным дисплеем.", {"material":"cherry wood"},
      urls=["https://indo4ward.com/DE/product/tkp-15135224400-muvna-solid-wood-inclined-electronic-scale-arc-tilted-digital-display-smart-espresso-coffee-pocket-alat-kitchenware-walnut-wood"])
for skus,volume in [("BZ2612 BZ2614 BZ2616",260),("BZ2613 BZ2615 BZ2617",450)]:
    group(skus, f"travel-mug-{volume}", f"Термокружка MUVNA {volume} мл", "drinkware",
          f"Термокружка для кофе и других напитков объёмом {volume} мл. Градиентное, чёрное и белое исполнение.",
          {"volume_ml":volume}, urls=["https://market.yandex.ru/card/muvna-termos-dlya-kofe-iz-nerzhaveyushchey-stali-304-portativnyy-260-ml-gradiyentnyy-tsvet-izolirovannyy-stakan-dlya-otdykha/5691104335"])

confirmations = {
    "BP2554": "По уточнению заказчика: не указывать совместимость с кофемашинами.",
    "BP2555": "По уточнению заказчика: не указывать совместимость с кофемашинами.",
    "T2458T": "По уточнению заказчика: размер буквально 58/58.35mm из PDF.",
    "T2467L3": "По уточнению заказчика: размер буквально 58/58.35mm из PDF.",
    "T2464L3": "По уточнению заказчика: размер буквально 58/58.35mm из PDF.",
    "T2274L4": "Заказчик подтвердил серый цвет.",
    "T2489Z": "Заказчик подтвердил диаметр 58 мм по PDF.",
    "T2647Z": "Заказчик подтвердил диаметр 58 мм по PDF.",
    "KC2707": "Заказчик подтвердил: брелок, не настоящая воронка.",
    "DC2397": "Заказчик подтвердил: та же модель кольца, что DR2274/DR2271; цвет natural из PDF.",
    "SP2679": "Заказчик подтвердил: белый вариант SP2680/SP2681.",
}
for skus,confirmation in [
    ("BK2693 BK2694", "Заказчик подтвердил MUVNA Pour-Over Kettle, чёрный и белый. Ссылка заказчика не открылась при проверке; дополнительные характеристики не перенесены."),
    ("TC2751 TC2755", "Заказчик подтвердил: Plan A плюс портативная электрическая кофемолка. Модель кофемолки не уточнялась."),
    ("G2489", "Заказчик подтвердил GM2 Manual Coffee Grinder."),
    ("SP2676 SP2677", "Заказчик подтвердил силиконовый коврик MUVNA."),
    ("BZ2618 BZ2619 BZ2621 BZ2622 BZ2623", "Заказчик подтвердил термосы; объёмы, цвета и цены взяты из PDF."),
    ("ES2625", "Заказчик подтвердил весы из вишнёвого дерева и прислал ссылку на модель. Ссылка не открылась; walnut в URL не заменяет подтверждённую вишню."),
    ("BZ2612 BZ2613 BZ2614 BZ2615 BZ2616 BZ2617", "Заказчик подтвердил одну модель термокружки в объёмах 260/450 мл и разных цветах. Ссылка не открылась; марка стали и свойства крышки не добавлены."),
]:
    for sku in skus.split():
        confirmations[sku] = confirmation

excluded = {}
def exclude(skus, reason, question):
    for sku in skus.split():
        if sku in confirmations:
            assert sku in assigned
            continue
        assert sku not in assigned and sku not in excluded
        excluded[sku] = dict(reason=reason, question=question)

exclude("BP2555 BP2554", "Не подтверждена совместимость двухушкового портафильтра: источники относят эти коды к разным группам, PDF сообщает только 58 мм.", "Для каких кофемашин/групп предназначены BP2554 и BP2555? Нужны размеры креплений или паспорт.")
exclude("T2458T T2467L3 T2464L3", "В PDF диаметр 58/58,35 мм, на сайте производителя для этой линейки 58,5 мм; форма основания L3 также описана по-разному.", "Уточнить фактический диаметр и основание каждого артикула, прислать этикетку/каталог производителя.")
exclude("T2489Z T2647Z", "Модели Mantis/Teemo определены, но диаметр в PDF 58 мм, на страницах производителя/продавцов 58,35 или 58,5 мм.", "Подтвердить фактический диаметр версии SKU и совместимость с корзинами.")
exclude("T2274L4", "В прайсе цвет gray, точное совпадение SKU в австралийском каталоге названо Silver.", "Подтвердить исполнение и фотографию T2274L4.")
exclude("BK2693 BK2694", "BK2693 найден как чайник, но PDF не содержит модели/объёма, а соответствие белого BK2694 не подтверждено.", "Название серии, объём, материал и подтверждение, что это одна модель в двух цветах.")
exclude("TC2751 TC2755", "Plan B — отдельный набор, подтверждённого состава не найдено; переносить состав Plan A нельзя.", "Предоставить комплектацию Plan B и тип вилки электрических приборов в наборе.")
exclude("G2489", "В PDF только Black (Foldable Handle); видна ручная кофемолка, но её модель не идентифицирована по артикулу.", "Как называется модель и каковы её основные характеристики? Нужна карточка производителя.")
exclude("KC2707", "По коду KC и картинке вероятен брелок-воронка XingChuan, однако подтверждения этого SKU не найдено.", "Подтвердить, что это брелок, а не воронка; прислать крупное фото.")
exclude("DC2397", "Прайс показывает стакан, региональный сайт по тому же коду описывает дозирующее кольцо; тип изделия противоречив.", "Это дозировочный стакан или кольцо? Нужна фотография с артикулом.")
exclude("SP2676 SP2677", "В PDF только gray/black и изображение плоского предмета; точный тип изделия и размеры не установлены.", "Что это за изделие, его материал, размеры и назначение?")
exclude("SP2679", "Вероятно белый диспенсер для посыпки, но точного совпадения артикула и модели не найдено.", "Подтвердить, что SP2679 — белая версия диспенсеров SP2680/SP2681.")
exclude("BZ2612 BZ2613 BZ2614 BZ2615 BZ2616 BZ2617", "Похоже на термостаканы, но для всей серии и обоих объёмов не установлены модель/конструкция крышки; PDF содержит только цвет и объём.", "Указать название серии, конструкцию крышки, материал, фото каждой расцветки 260/450 мл.")
exclude("BZ2623 BZ2622 BZ2621 BZ2619 BZ2618", "В PDF только цвет/объём 615 или 685 мл; тип и модель термопосуды достоверно не установлены.", "Это термос, термокружка или иная посуда? Нужны название серии и описание крышки/комплектации.")
exclude("ES2625", "PDF указывает cherry, найденная карточка ES2625 — walnut; точная деревянная версия противоречива.", "Подтвердить породу дерева, название модели и фото весов ES2625.")

assert assigned | excluded.keys() == rows.keys(), f"Unaccounted: {rows.keys() - assigned - excluded.keys()}"

# Only literal SKU token matches. Product names alone never prove a match.
catalogs = []
for cache,domain in [("global-1","muvnacoffee.com"),("au-1","muvna.com.au"),("au-2","muvna.com.au"),("au-3","muvna.com.au")]:
    path = Path("/tmp") / f"muvna-{cache}.json"
    if path.exists():
        catalogs.extend((p,domain) for p in json.loads(path.read_text())["products"])

def matches(sku):
    result = []
    for p,domain in catalogs:
        for v in p["variants"]:
            if sku not in re.split(r"[^A-Z0-9]+", (v.get("sku") or "").upper()):
                continue
            images = [i for i in p["images"] if v["id"] in i.get("variant_ids", [])]
            # A single-colour AU card can offer product-level photos. A multi-colour
            # global card needs an explicit variant_id; otherwise retain no candidate.
            if not images and len(p["variants"]) == 1:
                images = p["images"][:1]
            result.append({"url": f"https://{domain}/products/{p['handle']}",
                           "title": p["title"], "variant_title": v["title"],
                           "images": [{"url":i["src"],"width":i["width"],"height":i["height"]} for i in images[:2]]})
    return result

colors = {"black":"Чёрный","white":"Белый","gray":"Серый","silver":"Серебристый","natural":"Натуральный",
          "gold":"Золотистый","pink":"Розовый","blue":"Голубой","purple":"Фиолетовый","green":"Зелёный",
          "yellow":"Жёлтый","orange":"Оранжевый","colorful":"Мультиколор","transparent":"Прозрачный",
          "walnut":"Орех","deep":"Тёмный","light":"Светлый"}
def color(row):
    name=row["source_name"].lower().replace("balck","black").replace("grey","gray").replace("sliver","silver").replace("丨", " ")
    if "titanium black" in name: return "titanium-black", "Титановый чёрный"
    if "titanium gold" in name: return "titanium-gold", "Титановый золотистый"
    if "soft pink" in name: return "soft-pink", "Нежно-розовый"
    if "light yellow" in name: return "light-yellow", "Светло-жёлтый"
    if "gradient ramp" in name: return "gradient", "Градиентный"
    if "specular color" in name: return "mirror", "Зеркальный"
    if "cherry" in name: return "cherry", "Вишнёвое дерево"
    for key,label in colors.items():
        if re.search(r"\b"+key+r"\b",name): return key,label
    return "default","Стандартный"

payload = []
evidence = []
for order,g in enumerate(groups):
    variants=[]
    for pos,sku in enumerate(g["skus"]):
        r=rows[sku]; found=matches(sku); key,label=color(r)
        evidence.append({"sku":sku,"page":r["page"],"row":r["row"],"source_name":r["source_name"],
                         "matches":found,"additional_sources":g["urls"],"note":g["note"],
                         "user_confirmation":confirmations.get(sku)})
        variants.append({"sku":sku,"color_code":key,"color_label":label,"retail_price":r["retail"],
                         "stock_quantity":r["stock"],"sort_order":pos,
                         "source_page":r["page"],"source_row":r["row"],"source_name":r["source_name"]})
    assert len({v["color_code"] for v in variants}) == len(variants), g
    payload.append({k:g[k] for k in ("slug","name","category","description","attributes")} |
                   {"sort_order":order,"brand":"muvna","variants":variants})

def save(name,data):
    (HERE / name).write_text(json.dumps(data, ensure_ascii=False, indent=2)+"\n")

save("20261012_muvna_catalog.json",payload)
if catalogs:
    save("20261012_muvna_sources.json",evidence)
else:
    # Preserve prior web research when temporary downloads have expired, but
    # always update the SKU list, user confirmations and supplied source URLs.
    previous_path = HERE / "20261012_muvna_sources.json"
    previous = {e["sku"]:e for e in json.loads(previous_path.read_text())} if previous_path.exists() else {}
    for e in evidence:
        e["matches"] = previous.get(e["sku"], {}).get("matches", [])
    save("20261012_muvna_sources.json",evidence)
review = ["# MUVNA: позиции, не включённые в импорт", "", "Источник: Muvna.pdf. Нумерация на стр. 5 начинается заново, поэтому указан и номер страницы.",
          "Эти SKU отсутствуют в SQL-импорте. Ни одна неопознанная позиция не заменена похожим товаром.", "", "| Стр./№ | SKU | В PDF | Розница | Причина | Что уточнить |", "|---|---|---|---:|---|---|"]
if not excluded:
    review = ["# MUVNA: позиции, не включённые в импорт", "", "Не осталось: все 161 артикул включены после уточнений заказчика."]
for sku,r in rows.items():
    if sku in excluded:
        e=excluded[sku]
        review.append(f"| {r['page']}/{r['row']} | {sku} | {r['source_name'].replace('|','/')} | {r['retail']} | {e['reason']} | {e['question']} |")
review += ["", "## Уточнения для уже распознанных товаров", "", "Эти товары включены как черновики с ограниченным описанием; неподтверждённые характеристики не добавлены.", ""]
for g in groups:
    if g["note"]: review.append(f"- {', '.join(g['skus'])}: {g['note']}")
review += ["", "## Общие особенности прайса", "", "- 161 строка с уникальными SKU, 8 страниц; последние две пустые.",
           "- Пропуски №21 и №15 во втором блоке сохранены: отсутствующие позиции не выдумывались.",
           "- Остатки — снимок из PDF без даты актуальности, не подтверждённые текущие остатки склада.",
           "- Розничные цены перенесены буквально, включая округления; оптовые цены не импортируются.",
           "- Принято KZT по контексту магазина; валюта прямо не напечатана в PDF и требует подтверждения.",
           "- Разные размеры, материалы, комплектации и цены образуют разные карточки. Объединены только цвета одной модели с одинаковой ценой.",
           "- Совместимость, гарантия, влагозащита, пригодность для посудомойки не добавляются без подтверждения."]
(HERE/"20261012_muvna_unresolved.md").write_text("\n".join(review)+"\n")
catalog=["# MUVNA: карточки и варианты", "", "| Карточка | SKU | Цвета | Розница |", "|---|---|---|---:|"]
for g in payload:
    catalog.append(f"| {g['name']} | {', '.join(v['sku'] for v in g['variants'])} | {', '.join(v['color_label'] for v in g['variants'])} | {g['variants'][0]['retail_price']} |")
(HERE/"20261012_muvna_catalog.md").write_text("\n".join(catalog)+"\n")
template=(HERE/"muvna_import.template.sql").read_text()
sql=template.replace("__PAYLOAD__", json.dumps(payload,ensure_ascii=False,indent=2)).replace("__SHA256__",source["sha256"]).replace("__PRODUCT_COUNT__",str(len(payload))).replace("__VARIANT_COUNT__",str(len(assigned)))
(HERE/"20261012_muvna_catalog.sql").write_text(sql)
print(f"{len(rows)} source rows: {len(payload)} products, {len(assigned)} variants, {len(excluded)} excluded")
