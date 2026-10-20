// Deterministic content-only supplement. Run: node supabase/imports/build_muvna_content.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('.', import.meta.url));
const catalog = JSON.parse(readFileSync(root + '20261012_muvna_catalog.json', 'utf8'));
const priorSources = JSON.parse(readFileSync(root + '20261012_muvna_sources.json', 'utf8'));
const tri = (ru, en, kz) => ({ ru, en, kz });
const steel = tri('Нержавеющая сталь', 'Stainless steel', 'Тот баспайтын болат');
const sus304 = tri('Нержавеющая сталь SUS304', 'SUS304 stainless steel', 'SUS304 тот баспайтын болат');
const silicone = tri('Силикон', 'Silicone', 'Силикон');
const ceramic = tri('Керамика', 'Ceramic', 'Керамика');
const manual = tri('Ручной', 'Manual', 'Қолмен');
const electric = tri('Электрический', 'Electric', 'Электрлік');
const pourOver = tri('Пуровер', 'Pour-over', 'Пуровер');
const espresso = tri('Эспрессо', 'Espresso', 'Эспрессо');
const official = handle => 'https://muvnacoffee.com/products/' + handle;
const ruSite = path => 'https://muvna.ru/' + path;
const families = [];
function family(match, en, kz, description, attributes = {}, sources = [], note = '') {
  families.push({ match: typeof match === 'string' ? p => p.slug.startsWith('muvna-' + match) : match,
    en, kz, description, attributes, sources, note });
}
family('mach-m8-set', 'MUVNA Mach M8 manual espresso machine set', 'MUVNA Mach M8 қол эспрессо кофемашинасының жиынтығы',
  tri('Ручная кофемашина для приготовления эспрессо с механическим управлением давлением. Вращение рукоятки позволяет управлять ходом экстракции.', 'A hand-operated espresso machine with mechanical pressure control. Turn the crank to control the extraction process.', 'Қысымы механикалық жолмен басқарылатын қол эспрессо кофемашинасы. Тұтқаны айналдыру арқылы экстракция барысын басқаруға болады.'),
  { operation: manual, brewing_method: espresso, diameter_mm: 58 }, [official('muvna-hand-crank-espresso-machine-mach')], 'Состав комплекта MK2673 и наличие нагрева не подтверждены; не переносить комплектацию другой версии MACH.');
family('mammoth', 'MUVNA Mammoth electric coffee grinder', 'MUVNA Mammoth электрлік кофеұнтақтағышы',
  tri('Электрическая кофемолка с бесщёточным двигателем и корпусом из алюминиевого сплава. Платформа Mammoth предусматривает сменные жерновые модули.', 'An electric coffee grinder with a brushless motor and an aluminium-alloy body. The Mammoth platform supports interchangeable burr modules.', 'Қылшақсыз қозғалтқышы және алюминий қорытпасынан жасалған корпусы бар электрлік кофеұнтақтағыш. Mammoth платформасында диірмен тастарының модульдерін ауыстыруға болады.'),
  { operation: electric, power_w: 750, dimensions_mm: '216 × 176 × 405', body_material: tri('Алюминиевый сплав', 'Aluminium alloy', 'Алюминий қорытпасы') }, [official('mvuna-mammoth-electric-coffee-grinder')], '98 мм плоские и 83 мм конические жернова описаны как разные модули. Тип установленного модуля в G2888/G2899 не указан.');
family('mobius-', 'MUVNA Mobius espresso basket', 'MUVNA Mobius эспрессо себеті',
  tri('Фильтр-корзина для эспрессо с лазерной перфорацией. Рассчитана на дозировку 18 г; диаметр указан для этой версии корзины.', 'An espresso filter basket with laser-cut perforations. This version has an 18 g nominal dose and a 58 mm diameter.', 'Лазермен жасалған тесіктері бар эспрессо сүзгі себеті. Бұл нұсқаның номиналды мөлшері — 18 г, диаметрі — 58 мм.'),
  { material: steel, brewing_method: espresso }, ['https://muvna.com.au/products/muvna-mobius-precision-basket-58mm-18g-stainless']);
family('angel-', 'MUVNA Angel coffee bean storage set', 'MUVNA Angel кофе дәндерін сақтау жиынтығы',
  tri('Набор отдельных контейнеров для заранее отмеренных порций кофейных зёрен. Подставка помогает держать порции рядом с кофемолкой.', 'Individual containers for pre-measured coffee bean doses. The stand keeps your prepared doses together beside the grinder.', 'Алдын ала өлшенген кофе дәндерін бөлек сақтауға арналған ыдыстар жиынтығы. Тұғыр дайын мөлшерлерді кофеұнтақтағыштың қасында ұстауға мүмкіндік береді.'),
  { container_volume_ml: 50 }, [official('muvna-coffee-bean-cellars-with-stand-hopper-6-tubes-and-12-tubes')], 'Число контейнеров и материал подставки — из прайса; 50 мл относится к одному контейнеру.');
family('ti-art-', 'MUVNA Ti-Art milk pitcher', 'MUVNA Ti-Art сүт питчері',
  tri('Титановый питчер для работы с молочной пеной и латте-арта. Объём этой модели — 600 мл.', 'A titanium milk pitcher for handling milk foam and pouring latte art. This model holds 600 ml.', 'Сүт көбігімен жұмыс істеуге және латте-арт құюға арналған титан питчер. Бұл модельдің көлемі — 600 мл.'),
  { material: tri('Титан', 'Titanium', 'Титан') }, [ruSite('espresso/pitcher')]);
family('dbw-', 'MUVNA DBW milk pitcher', 'MUVNA DBW сүт питчері',
  tri('Питчер для молока с заострённым носиком и широкой ручкой. Подходит для контролируемого вливания молочной пены при создании латте-арта.', 'A milk pitcher with a pointed spout and a wide handle. Designed for controlled milk-foam pouring when creating latte art.', 'Ұшы сүйір шүмегі және кең тұтқасы бар сүт питчері. Латте-арт жасағанда сүт көбігін бақылап құюға арналған.'),
  { material: sus304, spout: tri('Заострённый', 'Pointed', 'Сүйір') }, [official('muvna-dbw-latte-pitcher-600ml-sharp-spout-latteart-pitcher-milk-jug-barista-selection-ideal-for-home-camping-coffee-shops')]);
family('b-type-', 'MUVNA B-type milk pitcher', 'MUVNA B-type сүт питчері',
  tri('Питчер из нержавеющей стали для подготовки молока и латте-арта. Выберите объём, подходящий для вашей порции напитка.', 'A stainless-steel milk pitcher for milk preparation and latte art. Choose the capacity that suits your drink portion.', 'Сүт дайындауға және латте-артқа арналған тот баспайтын болат питчер. Сусын мөлшеріне сәйкес көлемді таңдаңыз.'),
  { material: sus304 }, [ruSite('espresso/pitcher')]);
family('latte-art-pen', 'MUVNA latte art pen', 'MUVNA латте-арт қаламы',
  tri('Ручной инструмент для прорисовки деталей на молочной пене. Тонкий металлический наконечник позволяет дополнить рисунок после вливания молока.', 'A manual tool for drawing details on milk foam. Its fine metal tip lets you finish a pattern after pouring the milk.', 'Сүт көбігіне ұсақ бөлшектер салуға арналған қол құралы. Жіңішке металл ұштық сүт құйылғаннан кейін өрнекті толықтыруға мүмкіндік береді.'),
  { material: steel, operation: manual }, ['https://kaif.co/en-qa/collections/new-arrivals/products/muvna-professional-stainless-steel-latte-art-needle-pen-%D9%82%D9%84%D9%85-%D8%A7%D9%84%D8%B1%D8%B3%D9%85-%D8%B9%D9%84%D9%89-%D8%A7%D9%84%D9%82%D9%87%D9%88%D8%A9-muvna-latte-art-needle-pen-%D8%B3%D8%AA%D8%A7%D9%86%D9%84%D8%B3-%D8%B3%D8%AA%D9%8A%D9%84']);
family('angled-knock-box', 'MUVNA Angled knock box', 'MUVNA Angled нок-боксы',
  tri('Нок-бокс с приподнятой задней стенкой для сброса отработанных кофейных таблеток. Перекладина с силиконовым покрытием смягчает контакт с портафильтром.', 'A high-back knock box for collecting spent coffee pucks. A silicone-covered knock bar cushions contact with the portafilter.', 'Пайдаланылған кофе таблеткаларын жинауға арналған артқы қабырғасы биік нок-бокс. Силиконмен қапталған көлденең тірек портафильтрмен жанасуды жұмсартады.'),
  { material: steel, knock_bar: tri('Силиконовое покрытие', 'Silicone covering', 'Силикон қаптама') }, ['https://www.coffeeparts.com.au/accessories/essentials/muvna-45-steel-knock-slag-bucket-black']);
family('knock-box', 'MUVNA knock box', 'MUVNA нок-боксы',
  tri('Металлический контейнер для отработанных кофейных таблеток. Помогает собирать кофейную гущу в одном месте после приготовления эспрессо.', 'A metal container for spent coffee pucks. Keeps used coffee grounds in one place after espresso preparation.', 'Пайдаланылған кофе таблеткаларына арналған металл ыдыс. Эспрессо дайындағаннан кейін кофе қалдығын бір жерде жинауға көмектеседі.'),
  { material: tri('Металл', 'Metal', 'Металл') }, ['https://muvna.com.au/products/muvna-metal-knock-tube-black']);
family(p => p.category === 'tampers', 'MUVNA espresso tamper', 'MUVNA эспрессо темпері',
  tri('Темпер для уплотнения молотого кофе в корзине перед приготовлением эспрессо. Диаметр и исполнение основания указаны в характеристиках выбранной модели.', 'A tamper for compressing ground coffee in the basket before brewing espresso. See this model’s specifications for its diameter and base design.', 'Эспрессо дайындау алдында себеттегі ұнтақталған кофені нығыздауға арналған темпер. Модельдің диаметрі мен табанының түрі сипаттамаларда көрсетілген.'),
  { brewing_method: espresso, operation: manual }, [], 'Не добавлены числовое усилие пружины и совместимость с кофемашинами: страницы объединяют несколько версий.');
family(p => ['muvna-mantis-58','muvna-teemo-58'].includes(p.slug), 'MUVNA rotary WDT distributor', 'MUVNA айналмалы WDT таратқышы',
  tri('Игольчатый инструмент для распределения молотого кофе и разрушения комков в корзине. Используется до темперовки при подготовке эспрессо.', 'A needle-based tool for distributing grounds and breaking up clumps in the basket. Use it before tamping during espresso preparation.', 'Себеттегі ұнтақталған кофені таратуға және түйіршіктерді ыдыратуға арналған инелі құрал. Эспрессо дайындауда темпермен нығыздаудан бұрын қолданылады.'),
  { brewing_method: espresso, operation: manual, tool_type: tri('Игольчатый WDT', 'Needle WDT', 'Инелі WDT') }, [], 'Диаметр оставлен 58 мм по подтверждению заказчика; число игл и другие размеры не перенесены между моделями.');
family(p => p.category === 'distributors', 'MUVNA coffee distributor', 'MUVNA кофе таратқышы',
  tri('Разравниватель для распределения молотого кофе в корзине перед темперовкой. Форма основания и диаметр зависят от выбранной модели.', 'A distributor for levelling ground coffee in the basket before tamping. Base design and diameter are specific to the selected model.', 'Темпермен нығыздау алдында себеттегі ұнтақталған кофені тегістеуге арналған таратқыш. Табан пішіні мен диаметрі таңдалған модельге байланысты.'),
  { brewing_method: espresso, operation: manual });
family('tivat-', 'MUVNA Tivat glass', 'MUVNA Tivat стақаны',
  tri('Стакан для подачи кофе и других напитков. Объём указан для этой версии Tivat.', 'A glass for serving coffee and other drinks. The capacity shown belongs to this Tivat version.', 'Кофе және басқа сусындарды ұсынуға арналған стақан. Көрсетілген көлем осы Tivat нұсқасына тиесілі.'),
  { material: tri('Стекло', 'Glass', 'Шыны') });
family('xingyu-', 'MUVNA Xingyu pouring cup', 'MUVNA Xingyu құю ыдысы',
  tri('Небольшой металлический молочник с одним носиком для порционной подачи и переливания. Объём — 100 мл.', 'A small metal pouring cup with a single spout for portioning and serving. Capacity: 100 ml.', 'Мөлшерлеуге және ұсынуға арналған бір шүмекті шағын металл ыдыс. Көлемі — 100 мл.'),
  { material: sus304, spout_count: 1 }, [ruSite('espresso/pitcher')]);
family('kare-', 'MUVNA Kare cup and saucer', 'MUVNA Kare кесе мен табақша жиынтығы',
  tri('Кофейная пара для подачи напитка: чашка и блюдце. Вместимость чашки — 280 мл.', 'A coffee-serving set consisting of a cup and saucer. The cup holds 280 ml.', 'Сусын ұсынуға арналған кесе мен табақша жиынтығы. Кесенің көлемі — 280 мл.'),
  { set_contents: tri('Чашка и блюдце', 'Cup and saucer', 'Кесе және табақша') });
family('tasting-bowl-', 'MUVNA tasting bowl', 'MUVNA дәм тату тостағаны',
  tri('Чаша для дегустации и подачи небольших порций кофе. Объём этой модели — 120 мл.', 'A bowl for tasting and serving small portions of coffee. This model holds 120 ml.', 'Кофенің шағын мөлшерін ұсынуға және дәмін татуға арналған тостаған. Бұл модельдің көлемі — 120 мл.'),
  { purpose: tri('Дегустация кофе', 'Coffee tasting', 'Кофенің дәмін тату') }, [ruSite('scale/cup')]);
family('tasting-cup', 'MUVNA tasting cup', 'MUVNA дәм тату кесесі',
  tri('Чашка для дегустации и подачи кофе. Цвет и исполнение поверхности зависят от выбранного варианта.', 'A cup for tasting and serving coffee. Colour and surface finish depend on the selected version.', 'Кофені ұсынуға және дәмін татуға арналған кесе. Түсі мен бетінің әрленуі таңдалған нұсқаға байланысты.'),
  { purpose: tri('Дегустация кофе', 'Coffee tasting', 'Кофенің дәмін тату') }, [], 'Не добавлены объём и материал без точного совпадения артикула.');
family('electric-kettle-', 'MUVNA temperature-controlled electric kettle', 'MUVNA температурасы реттелетін электр шәйнегі',
  tri('Электрический чайник с регулировкой температуры для приготовления кофе. Эта версия имеет объём 600 мл и вилку UK.', 'A temperature-controlled electric kettle for coffee preparation. This version has a 600 ml capacity and a UK plug.', 'Кофе дайындауға арналған температурасы реттелетін электр шәйнегі. Бұл нұсқаның көлемі — 600 мл, ашасы — UK.'),
  { operation: electric, temperature_control: true }, [], 'Не переносить диапазон YAOGUANG, мощность и напряжение без подтверждения модели BK2714/BK2779.');
family('filter-paper-', 'MUVNA V02 paper filters', 'MUVNA V02 қағаз сүзгілері',
  tri('Одноразовые бумажные фильтры формата V02 для приготовления фильтр-кофе. Перед использованием проверьте соответствие формату вашей воронки.', 'Disposable V02 paper filters for filter coffee. Check that the format matches your dripper before use.', 'Сүзгі кофесін дайындауға арналған бір реттік V02 қағаз сүзгілері. Қолданар алдында өлшемінің құйғышыңызға сәйкестігін тексеріңіз.'),
  { material: tri('Бумага', 'Paper', 'Қағаз'), brewing_method: pourOver });
family('cake-filter-paper', 'MUVNA Cake paper filters', 'MUVNA Cake қағаз сүзгілері',
  tri('Бумажные фильтры для заваривания кофе в формате Cake. В прайсе эта позиция рассчитана на 2–4 порции.', 'Paper filters for Cake-style coffee brewing. This catalogue version is specified for 2–4 servings.', 'Cake әдісімен кофе демдеуге арналған қағаз сүзгілер. Каталогтағы бұл нұсқа 2–4 порцияға арналған.'),
  { material: tri('Бумага', 'Paper', 'Қағаз'), brewing_method: pourOver }, [], 'Количество фильтров в упаковке не подтверждено.');
family(p => p.category === 'drippers' && !p.slug.includes('stand'), 'MUVNA coffee dripper', 'MUVNA кофе құйғышы',
  tri('Воронка для ручного заваривания фильтр-кофе. Позволяет управлять скоростью вливания воды и временем приготовления.', 'A dripper for manually brewing filter coffee. It lets you control the water pour and brewing time.', 'Сүзгі кофесін қолмен демдеуге арналған құйғыш. Суды құю жылдамдығы мен дайындау уақытын басқаруға мүмкіндік береді.'),
  { brewing_method: pourOver, operation: manual }, [ruSite('brew/dripper')]);
family('li-v60-stand-', 'MUVNA LI V60 walnut stand', 'MUVNA LI V60 жаңғақ ағашынан жасалған тұғыры',
  tri('Деревянная подставка для воронки серии LI V60. Это отдельный аксессуар, а не комплект с воронкой.', 'A wooden stand for the LI V60 dripper series. This is a separate accessory, not a dripper set.', 'LI V60 сериялы құйғышқа арналған ағаш тұғыр. Бұл — құйғышпен бірге сатылатын жиынтық емес, бөлек аксессуар.'),
  { purpose: tri('Подставка для воронки', 'Dripper stand', 'Құйғышқа арналған тұғыр') }, [ruSite('brew/dripper')]);
family('pour-over-gm1-set', 'MUVNA pour-over set with GM1 grinder', 'GM1 кофеұнтақтағышы бар MUVNA пуровер жиынтығы',
  tri('Набор для ручного приготовления фильтр-кофе с кофемолкой GM1. Объединяет инструменты для помола и заваривания.', 'A manual filter-coffee set with a GM1 grinder. Brings grinding and brewing tools together in one set.', 'GM1 кофеұнтақтағышы бар сүзгі кофесін қолмен дайындау жиынтығы. Ұнтақтау және демдеу құралдарын біріктіреді.'),
  { brewing_method: pourOver, included_grinder: 'GM1' }, ['https://tiendabarista.pe/producto/kit-barista-v60-8-piezas-molino-gm1-negro/'], 'Полный состав комплекта поставщика не подтверждён; не обещаем число предметов из другого магазина.');
family('pour-the-seasons-plan-a', 'MUVNA Pour the Seasons — Plan A', 'MUVNA Pour the Seasons — Plan A',
  tri('Набор аксессуаров для приготовления кофе методом пуровер. Версия Plan A — базовая комплектация серии Pour the Seasons.', 'An accessory set for pour-over coffee brewing. Plan A is the base configuration of the Pour the Seasons series.', 'Пуровер әдісімен кофе дайындауға арналған аксессуарлар жиынтығы. Plan A — Pour the Seasons сериясының негізгі нұсқасы.'),
  { brewing_method: pourOver, configuration: 'Plan A' }, ['https://tiendabarista.pe/producto/kit-barista-v60-13-piezas-maletin-portatil/'], 'Не фиксируем 13 предметов по зарубежному комплекту без сверки состава поставки.');
family('pour-the-seasons-plan-b', 'MUVNA Pour the Seasons — Plan B', 'MUVNA Pour the Seasons — Plan B',
  tri('Набор для пуровера на основе Plan A с портативной электрической кофемолкой. Отличие комплектации подтверждено поставщиком.', 'A pour-over set based on Plan A with a portable electric coffee grinder. This configuration adds electric grinding to the base set.', 'Портативті электр кофеұнтақтағышы қосылған Plan A негізіндегі пуровер жиынтығы. Бұл нұсқа негізгі жиынтықты электрлік ұнтақтау мүмкіндігімен толықтырады.'),
  { brewing_method: pourOver, configuration: 'Plan B' }, [], 'Наличие портативной электрической кофемолки подтверждено заказчиком; её модель и остальные предметы не уточнены.');
family('gm1', 'MUVNA GM1 manual coffee grinder', 'MUVNA GM1 қол кофеұнтақтағышы',
  tri('Ручная кофемолка с регулировкой помола и стальными жерновами. Компактный формат позволяет готовить свежемолотый кофе без подключения к сети.', 'A manual coffee grinder with adjustable grind size and steel burrs. Its compact format lets you grind fresh coffee without mains power.', 'Ұнтақтау дәрежесі реттелетін, болат диірмен тастары бар қол кофеұнтақтағыш. Шағын пішімі электр желісінсіз жаңа ұнтақталған кофе дайындауға мүмкіндік береді.'),
  { operation: manual, burr_diameter_mm: 38, adjustment_steps: 24, burr_material: steel }, ['https://kafusolutions.ae/shop/g2629-muvna-gm1-manual-grinder-black-854','https://tiendabarista.pe/producto/molino-manual-cafe-profesional-black-gm1-muvna/']);
family('gm2', 'MUVNA GM2 manual coffee grinder', 'MUVNA GM2 қол кофеұнтақтағышы',
  tri('Ручная кофемолка GM2 для свежего помола перед завариванием. В этой позиции предусмотрена складная ручка.', 'A GM2 manual coffee grinder for grinding beans just before brewing. This catalogue version has a folding handle.', 'Кофені демдер алдында ұнтақтауға арналған GM2 қол кофеұнтақтағышы. Каталогтағы бұл нұсқада жиналмалы тұтқа бар.'),
  { operation: manual }, ['https://www.stockroastery.com/en-ae/products/muvna-gm2-manual-coffee-grinder-black','https://www.bol.com/nl/nl/p/muvna-gm2-manual-grinder-bonenmaler-rvs-zwart/9300000228503355/'], 'Источники расходятся: 24/90 шагов, 38/44 мм, 710/1030 г. Эти числа не добавлены; версия G2489 требует сверки.');
family('electric-grinder-plug-in', 'MUVNA G2705 electric coffee grinder', 'MUVNA G2705 электрлік кофеұнтақтағышы',
  tri('Электрическая кофемолка для помола кофейных зёрен перед приготовлением напитка. В прайсе указано питание от сети.', 'An electric grinder for grinding coffee beans before brewing. The catalogue specifies mains-powered operation.', 'Сусын дайындау алдында кофе дәндерін ұнтақтауға арналған электрлік кофеұнтақтағыш. Прайста электр желісінен жұмыс істейтіні көрсетілген.'),
  { operation: electric }, [], 'Не доказано, что G2705 совпадает с LVCHEN с сайта MUVNA: не добавлены его 100 настроек и параметры двигателя.');
family('gt1-grinder', 'MUVNA GT1 portable electric grinder', 'MUVNA GT1 портативті электр кофеұнтақтағышы',
  tri('Портативная электрическая кофемолка с аккумулятором и регулировкой помола. Подходит для подготовки зёрен непосредственно перед завариванием.', 'A portable battery-powered electric grinder with grind adjustment. Designed to grind beans immediately before brewing.', 'Аккумуляторы және ұнтақтау реттегіші бар портативті электр кофеұнтақтағыш. Дәндерді демдеу алдында ұнтақтауға арналған.'),
  { operation: electric, power_supply: tri('Аккумулятор', 'Rechargeable battery', 'Аккумулятор') }, ['https://tiendabarista.pe/producto/molino-de-cafe-electrico-portatil-con-bateria-recargable-y-ajuste-de-molienda-muvna/']);
family(p => p.slug.includes('towel'), 'MUVNA barista towel', 'MUVNA бариста сүлгісі',
  tri('Полотенце для повседневного ухода за рабочим местом бариста. Для разных задач используйте отдельные полотенца.', 'A towel for everyday barista-station care. Use separate towels for different cleaning tasks.', 'Баристаның жұмыс орнын күнделікті күтуге арналған сүлгі. Әртүрлі тазалау жұмыстарына бөлек сүлгілерді қолданыңыз.'),
  { purpose: tri('Уход за рабочим местом', 'Workstation care', 'Жұмыс орнын күту') }, [], 'Состав ткани и размеры CT2290/CT2291 не подтверждены.');
family('rinser-', 'MUVNA jug rinser', 'MUVNA питчер шайғышы',
  tri('Ринзер для ополаскивания питчеров на рабочем месте бариста. Исполнение панели указано для выбранной версии.', 'A rinser for rinsing milk pitchers at the barista station. The panel design is specific to the selected version.', 'Баристаның жұмыс орнында питчерлерді шаюға арналған ринзер. Панель пішіні таңдалған нұсқаға сәйкес көрсетілген.'),
  { purpose: tri('Ополаскивание питчеров', 'Pitcher rinsing', 'Питчерлерді шаю') }, [], 'Монтажные размеры, подвод воды и комплект подключения не подтверждены.');
family('storage-', 'MUVNA coffee storage container', 'MUVNA кофе сақтау ыдысы',
  tri('Контейнер для хранения кофе и организации запасов. Вместимость в граммах указана в прайсе; фактический объём зёрен зависит от сорта и обжарки.', 'A container for storing coffee and organising supplies. The gram capacity is a catalogue rating; actual bean capacity varies with variety and roast.', 'Кофені сақтауға және қорды реттеуге арналған ыдыс. Граммен көрсетілген сыйымдылық прайстан алынған; дәннің нақты сыйымдылығы сорты мен қуырылуына байланысты.'),
  { purpose: tri('Хранение кофе', 'Coffee storage', 'Кофе сақтау') }, [], 'Не заявляем вакуум, материал, клапан или срок сохранения свежести без точной карточки.');
family('gyro-drop-', 'MUVNA Gyro Coffee Drop dosing tool', 'MUVNA Gyro Coffee Drop мөлшерлегіші',
  tri('Дозатор для переноса молотого кофе в корзину диаметром 58 мм. Поворотный механизм помогает распределять кофе при выгрузке.', 'A dosing tool for transferring grounds into a 58 mm basket. Its rotating mechanism helps distribute coffee as it is released.', 'Ұнтақталған кофені диаметрі 58 мм себетке салуға арналған мөлшерлегіш. Айналмалы механизм кофені төккен кезде таратуға көмектеседі.'),
  { operation: manual }, [official('muvna-coffee-blind-shark-espresso-dosing-cup')], 'Материал не добавлен: прайс использует обозначение «natural», а общий сайт описывает алюминиевый сплав.');
family('spray-', 'MUVNA Electro Spray atomiser', 'MUVNA Electro Spray бүріккіші',
  tri('Компактный распылитель объёмом 10 мл для кофейного рабочего места. Предназначен для дозированного распыления воды.', 'A compact 10 ml atomiser for a coffee workstation. Designed for controlled water misting.', 'Кофе дайындау орнына арналған көлемі 10 мл шағын бүріккіш. Суды мөлшерлеп бүркуге арналған.'),
  { operation: manual });
family('walnut-tray-', 'MUVNA walnut serving tray', 'MUVNA жаңғақ ағашынан жасалған науасы',
  tri('Поднос из орехового дерева для подачи напитков и размещения кофейных аксессуаров. Форма указана для выбранной модели.', 'A walnut-wood tray for serving drinks and arranging coffee accessories. The shape shown is specific to this model.', 'Сусын ұсынуға және кофе аксессуарларын орналастыруға арналған жаңғақ ағашынан жасалған науа. Пішіні осы модельге сәйкес көрсетілген.'),
  { purpose: tri('Подача и размещение аксессуаров', 'Serving and accessory organisation', 'Ұсыну және аксессуарларды орналастыру') });
family('silicone-tamping-mat', 'MUVNA silicone tamping mat', 'MUVNA силикон темперлеу кілемшесі',
  tri('Силиконовый коврик для темперовки и размещения инструментов. Создаёт защитную поверхность между аксессуарами и столешницей.', 'A silicone mat for tamping and arranging tools. Provides a protective surface between accessories and the countertop.', 'Темперлеуге және құралдарды орналастыруға арналған силикон кілемше. Аксессуарлар мен үстел бетінің арасына қорғаныш қабат жасайды.'),
  { purpose: tri('Темперовка и рабочее место', 'Tamping and workstation organisation', 'Темперлеу және жұмыс орнын реттеу') }, ['https://muvna.com.au/products/muvna-tamping-mat-station-black']);
family('silicone-mat', 'MUVNA silicone bar mat', 'MUVNA силикон бар кілемшесі',
  tri('Силиконовый коврик для размещения кофейных аксессуаров на столе. Помогает защитить рабочую поверхность при приготовлении и подаче напитков.', 'A silicone bar mat for arranging coffee accessories on the counter. Helps protect the work surface during drink preparation and serving.', 'Кофе аксессуарларын үстелге орналастыруға арналған силикон кілемше. Сусын дайындау және ұсыну кезінде жұмыс бетін қорғауға көмектеседі.'),
  { purpose: tri('Защита рабочей поверхности', 'Countertop protection', 'Жұмыс бетін қорғау') }, ['https://kaif.co/collections/specialty-coffee-tools1/products/muvna-coffee-bar-mat-500-300mm-gray-%D8%B1%D9%83%D9%86-%D8%A7%D9%84%D9%82%D9%87%D9%88%D8%A9-%D9%85%D9%88%D9%81%D9%86%D8%A7-50-30-%D8%B3%D9%85-%D8%B1%D9%85%D8%A7%D8%AF%D9%8A'], '500 × 300 мм найдено только для SP2676; не переносим размер на объединённый SP2677 без проверки.');
family('titanium-cupping-spoon', 'MUVNA titanium cupping spoon', 'MUVNA титан каппинг қасығы',
  tri('Титановая ложка для дегустации кофе. Используется при каппинге и сравнении приготовленных образцов.', 'A titanium spoon for tasting coffee. Suitable for cupping and comparing brewed samples.', 'Кофенің дәмін татуға арналған титан қасық. Каппингте және дайындалған үлгілерді салыстыруда қолданылады.'),
  { purpose: tri('Каппинг', 'Cupping', 'Каппинг') });
family('keyring-', 'MUVNA coffee-themed keyring', 'MUVNA кофе тақырыбындағы салпыншағы',
  tri('Декоративный брелок в форме кофейного инструмента. Это сувенир, а не принадлежность для приготовления кофе.', 'A decorative keyring shaped like a coffee tool. This is a souvenir, not a working coffee accessory.', 'Кофе құралы пішініндегі сәндік салпыншақ. Бұл — кофе дайындау құралы емес, кәдесый.'),
  { purpose: tri('Сувенирный брелок', 'Souvenir keyring', 'Кәдесый салпыншақ') });
family('dandelion-blower', 'MUVNA Dandelion air blower', 'MUVNA Dandelion ауа үрлегіші',
  tri('Ручная груша для удаления сухих частиц кофе направленным потоком воздуха. Подходит для ухода за кофейными инструментами.', 'A hand-operated air blower for removing dry coffee particles with a directed air stream. Intended for coffee-tool care.', 'Құрғақ кофе бөлшектерін бағытталған ауа ағынымен кетіруге арналған қол үрлегіші. Кофе құралдарын күтуге арналған.'),
  { operation: manual, cleaning_method: tri('Воздушная очистка', 'Air cleaning', 'Ауамен тазалау') }, ['https://muvna.com.au/products/muvna-dandelion-air-blower-black']);
family('group-head-steamer', 'MUVNA group-head cleaning steamer', 'MUVNA кофе тобын бумен тазалау құралы',
  tri('Паровой инструмент для очистки группы кофемашины. Подключение и совместимость необходимо проверить по инструкции к вашей машине.', 'A steam-cleaning tool for an espresso machine group head. Check the connection and compatibility against your machine’s instructions.', 'Кофемашинаның демдеу тобын бумен тазалауға арналған құрал. Қосылуы мен үйлесімділігін машинаңыздың нұсқаулығы бойынша тексеріңіз.'),
  { purpose: tri('Очистка группы кофемашины', 'Group-head cleaning', 'Кофемашина тобын тазалау') }, ['https://www.coffeeparts.com.au/muvna-group-head-cleaning-steamer'], 'Не обещаем универсальную совместимость паровых трубок и не указываем рабочее давление.');
family('magnetic-dosing-ring-', 'MUVNA 58 mm dosing ring', 'MUVNA 58 мм мөлшерлеу сақинасы',
  tri('Кольцо для дозирования молотого кофе в корзину диаметром 58 мм. Помогает удерживать кофе внутри при наполнении и распределении.', 'A dosing ring for filling a 58 mm basket with ground coffee. Helps keep grounds inside during dosing and distribution.', 'Диаметрі 58 мм себетке ұнтақталған кофе салуға арналған сақина. Толтыру және тарату кезінде кофені ішінде ұстауға көмектеседі.'),
  { purpose: tri('Дозирование молотого кофе', 'Ground-coffee dosing', 'Ұнтақталған кофені мөлшерлеу') }, [], 'DC2397 подтверждён заказчиком как тот же тип товара. Магнитность всех трёх вариантов не подтверждена — не заявляем её на уровне общей карточки.');
family('diamond-dosing-cup-', 'MUVNA Diamond dosing cup', 'MUVNA Diamond мөлшерлеу стақаны',
  tri('Дозировочный стакан для сбора и переноса молотого кофе. Модель рассчитана на работу с корзиной диаметром 58 мм.', 'A dosing cup for collecting and transferring ground coffee. This model is designed around a 58 mm basket format.', 'Ұнтақталған кофені жинауға және ауыстырып салуға арналған мөлшерлеу стақаны. Бұл модель 58 мм себет пішіміне арналған.'),
  { purpose: tri('Сбор и перенос молотого кофе', 'Collecting and transferring grounds', 'Ұнтақталған кофені жинау және ауыстыру') });
family('espresso-ice-ball', 'MUVNA Espresso Ice Ball', 'MUVNA Espresso Ice Ball салқындатқыш шары',
  tri('Шар для контактного охлаждения эспрессо при подаче. Позволяет охладить напиток без добавления в него обычного льда.', 'A ball for contact-cooling espresso during serving. Cools the drink without adding ordinary ice to it.', 'Эспрессоны ұсынғанда жанасу арқылы салқындататын шар. Сусынға кәдімгі мұз қоспай салқындатуға мүмкіндік береді.'),
  { purpose: tri('Охлаждение эспрессо', 'Espresso cooling', 'Эспрессоны салқындату') }, ['https://www.coffeeparts.com.au/muvna-espresso-ice-ball-set-gold'], 'Не добавлены материал, диаметр и точный состав комплекта без подтверждения.');
family('powder-shaker', 'MUVNA cocoa and cinnamon shaker', 'MUVNA какао мен даршын сепкіші',
  tri('Диспенсер для посыпки напитков какао или корицей. Используется для завершающего оформления кофейных напитков.', 'A shaker for dusting drinks with cocoa or cinnamon. Adds a finishing touch to coffee drinks.', 'Сусындарға какао немесе даршын себуге арналған диспенсер. Кофе сусындарын соңғы рет безендіру үшін қолданылады.'),
  { purpose: tri('Какао и корица', 'Cocoa and cinnamon', 'Какао және даршын') }, [ruSite('scale/frother')]);
family('thermometer', 'MUVNA thermometer', 'MUVNA термометрі',
  tri('Термометр для контроля температуры при приготовлении напитков. Помогает отслеживать нагрев, а не оценивать его на ощупь.', 'A thermometer for monitoring temperature during drink preparation. Lets you track heating instead of estimating it by touch.', 'Сусын дайындау кезінде температураны бақылауға арналған термометр. Қызуды қолмен шамалаудың орнына өлшеуге мүмкіндік береді.'),
  { material: tri('Сталь и пластик', 'Steel and plastic', 'Болат және пластик') }, [ruSite('scale/frother')], 'Диапазон, погрешность и допустимое погружение ZQ2640 не подтверждены.');
family('espresso-creed-set', 'MUVNA Espresso Creed portable set', 'MUVNA Espresso Creed портативті жиынтығы',
  tri('Переносной комплект серии Espresso Creed для приготовления эспрессо. Точный состав набора уточняется для поставляемой версии.', 'A portable Espresso Creed set for espresso preparation. The exact contents depend on the supplied version and require confirmation.', 'Эспрессо дайындауға арналған Espresso Creed сериясының тасымалды жиынтығы. Нақты құрамы жеткізілетін нұсқаға байланысты нақтыланады.'),
  { brewing_method: espresso, format: tri('Переносной комплект', 'Portable set', 'Тасымалды жиынтық') }, [], 'G2788 не сопоставлен с текущим MUVNA Espresso Portable Coffee Machine: не добавлены батарея 7500 мА·ч, 9 бар, нагрев и вес.');
family('milk-frother-stick', 'MUVNA Milk Frother Stick', 'MUVNA Milk Frother Stick сүт көпірткіші',
  tri('Электрический вспениватель для подготовки молочной пены. Ручной формат удобен для работы с отдельной порцией напитка.', 'An electric frothing wand for preparing milk foam. Its handheld format is convenient for an individual drink portion.', 'Сүт көбігін дайындауға арналған электрлік көпірткіш. Қолға ұстайтын пішімі сусынның жеке порциясымен жұмыс істеуге ыңғайлы.'),
  { operation: electric }, [ruSite('scale/frother')], 'Характеристики BLAST с основного сайта не перенесены автоматически на P2689/P2691: версия не доказана.');
family(p => p.category === 'scales', 'MUVNA coffee scale', 'MUVNA кофе таразысы',
  tri('Электронные весы для контроля дозировки при приготовлении кофе. Модель и подтверждённые параметры указаны в характеристиках.', 'An electronic scale for controlling doses during coffee preparation. See the specifications for the model and verified parameters.', 'Кофе дайындау кезінде мөлшерді бақылауға арналған электрондық таразы. Моделі мен расталған параметрлері сипаттамаларда көрсетілген.'),
  { operation: tri('Электронные весы', 'Electronic weighing', 'Электрондық өлшеу') }, [], 'Точность, предел взвешивания, режимы и питание добавлены только для явно сопоставленных моделей.');
family('portable-pour-over-3-in-1', 'MUVNA Portable Pour Over 3-in-1', 'MUVNA Portable Pour Over 3-і 1-де',
  tri('Портативное устройство для помола, заваривания и подачи кофе. Объединяет электрическую кофемолку, воронку и ёмкость для напитка.', 'A portable device for grinding, brewing and serving coffee. Combines an electric grinder, a dripper and a drink container.', 'Кофені ұнтақтауға, демдеуге және ұсынуға арналған портативті құрылғы. Электр кофеұнтақтағышын, құйғышты және сусын ыдысын біріктіреді.'),
  { brewing_method: pourOver, functions: tri('Помол, заваривание, ёмкость для напитка', 'Grinding, brewing, drink container', 'Ұнтақтау, демдеу, сусын ыдысы') }, [official('muvna-portable-pour-over-coffee-machine-for-outdoor-travel-home-3-in-1-pour-over-coffee-dripper-portable-electric-grinder')]);
family('bottomless-portafilter-', 'MUVNA 58 mm bottomless portafilter', 'MUVNA 58 мм түпсіз портафильтрі',
  tri('Бездонный портафильтр для наблюдения за экстракцией эспрессо снизу корзины. Диаметр указан в прайсе; совместимость с кофемашинами не заявляется.', 'A bottomless portafilter that exposes the underside of the basket during espresso extraction. The listed diameter is not a claim of machine compatibility.', 'Эспрессо экстракциясы кезінде себеттің астыңғы жағын бақылауға мүмкіндік беретін түпсіз портафильтр. Көрсетілген диаметр кофемашинамен үйлесімділікті білдірмейді.'),
  { brewing_method: espresso, construction: tri('Бездонная', 'Bottomless', 'Түпсіз') }, [], 'По указанию заказчика не перечисляем совместимые кофемашины.');
family('pour-over-kettle', 'MUVNA pour-over kettle', 'MUVNA пуровер шәйнегі',
  tri('Чайник для контролируемого вливания воды при ручном заваривании кофе. Узкий изогнутый носик помогает направлять струю.', 'A kettle for controlled water pouring when manually brewing coffee. The narrow curved spout helps direct the stream.', 'Кофені қолмен демдегенде суды бақылап құюға арналған шәйнек. Жіңішке иілген шүмегі ағынды бағыттауға көмектеседі.'),
  { brewing_method: pourOver, operation: manual }, [], 'Объём, материал, возможность нагрева на плите и совместимость с индукцией не подтверждены.');
family('thermos-', 'MUVNA insulated tumbler', 'MUVNA термостақаны',
  tri('Термос для переноски и подачи напитков. Объём и цвет относятся к выбранной версии товара.', 'An insulated tumbler for carrying and serving drinks. Capacity and colour are specific to the selected version.', 'Сусындарды тасымалдауға және ұсынуға арналған термостақан. Көлемі мен түсі таңдалған нұсқаға сәйкес келеді.'),
  { purpose: tri('Напитки с собой', 'Drinks to go', 'Өзіңізбен алып жүруге арналған сусындар') }, ['https://lastaforest.com/products/muvna-outdoor-coffee-mug-stainless-steel-portable-insulated-large-capacity-tumbler-brewing-tea-double-wall-water-cup'], 'Внешний источник не содержит BZ2618–BZ2623; марки стали, часы удержания температуры и герметичность не перенесены.');
family('travel-mug-', 'MUVNA travel mug', 'MUVNA жолға арналған термокружкасы',
  tri('Термокружка для кофе и других напитков с собой. Выпускается в разных объёмах и цветах, которые представлены отдельными вариантами каталога.', 'A travel mug for coffee and other drinks on the go. Available in the capacities and colours listed in the catalogue.', 'Кофе және басқа сусындарды өзіңізбен алып жүруге арналған термокружка. Каталогта көрсетілген көлемдер мен түстерде ұсынылады.'),
  { purpose: tri('Напитки с собой', 'Drinks to go', 'Өзіңізбен алып жүруге арналған сусындар') }, [], 'Не переносим характеристики 260 мл на 450 мл, не обещаем время термоизоляции или герметичность.');

// Additional facts only for identified models, never a category-wide inference.
const extras = {
  'muvna-psyche-mini-black': { max_weight_g: 2000, timer: true },
  'muvna-psyche-mini-white': { max_weight_g: 2000, timer: true },
  'muvna-psyche-m1': { max_weight_g: 2000, timer: true },
  'muvna-zero-g-mini-black': { max_weight_g: 2000, timer: true },
  'muvna-metal-scale-black': { max_weight_g: 2000, resolution_g: 0.1, charging: 'USB-C', timer: true },
  'muvna-mini-walnut-scale': { max_weight_g: 2000, resolution_g: 0.1, charging: 'USB-C' },
  'muvna-dbw-600-natural': { material: sus304 },
};
const extraSources = {
  'muvna-psyche-mini-black': [ruSite('scale/smart')], 'muvna-psyche-mini-white': [ruSite('scale/smart')],
  'muvna-psyche-m1': [ruSite('scale/smart')], 'muvna-zero-g-mini-black': [ruSite('scale/smart')],
  'muvna-metal-scale-black': [official('muvna-metal-coffee-smart-scale')],
  'muvna-mini-walnut-scale': [official('muvna-coffee-electronic-scale-walnutmini')],
};
const vocabulary = {
  acrylic: tri('Акрил', 'Acrylic', 'Акрил'), walnut: tri('Дерево грецкого ореха', 'Walnut wood', 'Жаңғақ ағашы'),
  titanium: tri('Титан', 'Titanium', 'Титан'), 'cherry wood': tri('Вишнёвое дерево', 'Cherry wood', 'Шие ағашы'),
  silicone, ABS: 'ABS', threaded: tri('Рифлёное', 'Ribbed', 'Бедерлі'),
  'X-shaped dual paddle': tri('X-образное', 'X-shaped', 'X тәрізді'),
  'titanium coating': tri('Титановое покрытие', 'Titanium coating', 'Титан қаптама'),
  crystalline: tri('Кристаллическая глазурь', 'Crystalline glaze', 'Кристалды глазурь'),
  mains: tri('От сети', 'Mains powered', 'Электр желісінен'),
  large: tri('Большой', 'Large', 'Үлкен'), medium: tri('Средний', 'Medium', 'Орташа'),
  'circular holes': tri('Круглые отверстия', 'Round holes', 'Дөңгелек тесіктер'),
  'narrow slots': tri('Щели', 'Slots', 'Саңылаулар'),
  long: tri('Прямоугольная', 'Rectangular', 'Тікбұрышты'), square: tri('Квадратная', 'Square', 'Шаршы'), round: tri('Круглая', 'Round', 'Дөңгелек'),
  'portable electric coffee grinder': tri('Портативная электрическая кофемолка', 'Portable electric coffee grinder', 'Портативті электр кофеұнтақтағышы'),
};
const modelNames = {
  'adjustable-tamper-5835': 'Infinitely Adjustable', 'constant-pressure-tamper-58': 'Constant Pressure', 'click-tamper-5835': 'Click',
  'threaded-base-58-5835': '58/58.35mm', 'x-base-58-5835': '58/58.35mm X',
  'gravity-pentagonal-58': 'Gravity', 'v2-distributor-58': 'V2', 'gripped-distributor-58-white': 'Gripped',
  'walnut-distributor-58': 'Walnut', 'titan-5835': 'Titan', 'four-paddle-58-gray': 'Four Paddle',
  'mantis-58': 'Mantis', 'teemo-58': 'Teemo', 'xingchuan-v01': 'XingChuan V01', 'xingwo-v01': 'XingWo V01',
  'cake-01': 'Cake 01', 'cake-02': 'Cake 02', 'li-v60-colorful': 'LI V60', 'li-v60-transparent': 'LI V60',
  'zero-g-mini-black': 'Zero-G Mini', 'psyche-mini-black': 'Psyche Mini', 'psyche-mini-white': 'Psyche Mini',
  'psyche-m1': 'Psyche M-1', 'mini-walnut-scale': 'Mini Walnut', 'metal-scale-black': 'Metal',
  'bean-plate-black': 'Bean Plate', 'bean-plate-white': 'Bean Plate', 'bean-tray-walnut': 'Walnut Bean Tray',
  'inclined-scale-cherry': 'Cherry',
};
const rows = catalog.map(product => {
  const f = families.find(f => f.match(product));
  if (!f) throw new Error('No authored content: ' + product.slug);
  const attributes = { ...product.attributes, ...f.attributes, ...(extras[product.slug] || {}) };
  for (const [key, value] of Object.entries(attributes)) if (typeof value === 'string' && vocabulary[value]) attributes[key] = vocabulary[value];
  if (product.category === 'drippers' && !product.slug.includes('stand')) attributes.material = product.slug.includes('li-v60') ? tri('Стекло', 'Glass', 'Шыны') : ceramic;
  if (product.slug.startsWith('muvna-keyring-')) {
    const shapes = {
      portafilter: tri('Портафильтр', 'Portafilter', 'Портафильтр'), 'bottomless-portafilter': tri('Бездонный портафильтр', 'Bottomless portafilter', 'Түпсіз портафильтр'),
      tamper: tri('Темпер', 'Tamper', 'Темпер'), siphon: tri('Сифон', 'Siphon', 'Сифон'), kettle: tri('Чайник', 'Kettle', 'Шәйнек'),
      ek43: tri('Кофемолка EK43', 'EK43 grinder', 'EK43 кофеұнтақтағышы'), pitcher: tri('Питчер', 'Milk pitcher', 'Сүт питчері'),
      moka: tri('Гейзерная кофеварка', 'Moka pot', 'Гейзерлі кофеқайнатқыш'), grinder: tri('Кофемолка', 'Grinder', 'Кофеұнтақтағыш'),
      xingchuan: tri('Воронка XingChuan', 'XingChuan dripper', 'XingChuan құйғышы'),
    };
    attributes.shape = shapes[product.slug.slice('muvna-keyring-'.length)];
  }
  const model = modelNames[product.slug.slice(6)];
  if (model) attributes.model = model;
  let suffix = '';
  if (product.attributes.volume_ml) suffix += ` — ${product.attributes.volume_ml} ml`;
  if (product.attributes.capacity_g) suffix += ` — ${product.attributes.capacity_g} g`;
  if (product.attributes.diameter_mm) suffix += ` — ${product.attributes.diameter_mm} mm`;
  if (product.attributes.tube_count) suffix += ` — ${product.attributes.tube_count}`;
  const sources = [...new Set([...f.sources, ...(extraSources[product.slug] || []), ...product.variants.flatMap(v => {
    const prior = priorSources.find(s => s.sku === v.sku);
    return [...(prior?.matches || []).map(m => m.url), ...(prior?.additional_sources || [])];
  })])];
  return { slug: product.slug, skus: product.variants.map(v => v.sku).sort(), attributes,
    translations: ['ru','en','kz'].map(locale => ({ locale, name: locale === 'ru' ? product.name : (locale === 'en' ? f.en : f.kz) + (model ? ` ${model}` : '') + suffix
      + (product.slug.startsWith('muvna-keyring-') ? ` — ${attributes.shape[locale]}` : ''),
      description: f.description[locale] })), sources, note: f.note,
    basis: 'Muvna.pdf + подтверждения заказчика; внешние источники — дополнительные подтверждённые факты, не полная спецификация' };
});
if (rows.length !== 110 || rows.reduce((n,p) => n + p.skus.length, 0) !== 161) throw new Error('Unexpected catalogue coverage');
for (const row of rows) for (const t of row.translations) if (!t.name || !t.description) throw new Error('Missing translation: ' + row.slug);
const prefix = root + '20261015_muvna_content';
const payload = JSON.stringify(rows, null, 2);
writeFileSync(prefix + '.json', payload + '\n');
const template = readFileSync(root + 'muvna_content.template.sql', 'utf8');
writeFileSync(prefix + '.sql', template.replace('__PAYLOAD__', payload));
writeFileSync(prefix + '_sources.md', '# Источники и ограничения MUVNA\n\nПроверено 15.10.2026. 110 карточек, 161 артикул. Для моделей без точной технической карточки сохранены только идентичность, назначение и сведения прайса/заказчика. Ссылки из прежнего импорта — для прослеживаемости, не утверждение, что каждый их параметр проверен или использован.\n\n' + rows.map(p => `## ${p.skus.join(', ')}\n\n${p.slug}\n\n${p.note || 'Не добавлены неподтверждённые дополнительные размеры, комплектация, совместимость или гарантийные обещания.'}\n\n${p.sources.length ? p.sources.map(url => `- ${url}`).join('\n') : '- Muvna.pdf и уточнения заказчика; точная внешняя спецификация не установлена.'}\n`).join('\n'));
writeFileSync(prefix + '_review.md', '# Что осталось проверить\n\nЭто не пропущенные товары: краткие описания и доступные характеристики подготовлены для всех 110 карточек. Ниже — параметры, которые намеренно не заполнены.\n\n' + rows.filter(p => p.note).map(p => `- **${p.skus.join(', ')}** — ${p.note}`).join('\n') + '\n');
console.log(JSON.stringify({ products: rows.length, variants: rows.reduce((n,p) => n+p.skus.length,0), translations: rows.length*3, output: prefix + '.sql' }));
