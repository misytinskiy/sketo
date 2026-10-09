-- Sketo: 20 уникальных позиций из 23 скриншотов, 06.10.2026.
-- Выполнить целиком в Supabase SQL Editor. Это импорт данных, не миграция схемы.
-- Новые позиции: черновики, RU/EN/KZ, заглушка фото.
-- Существующие совпадения: сохранить тексты, цены, фотографии и публикацию;
-- добавить отсутствующие языковые версии и изменить sort_order для группировки.
-- Повторный запуск не добавляет те же позиции и не затирает правки из кабинета.
-- Цена, бренд и вес, не видимые на скриншотах, не выдуманы.

BEGIN;
SET LOCAL lock_timeout = '10s';
SET LOCAL search_path = public, pg_temp;

CREATE TEMP TABLE sketo_coffee_import (
  position integer PRIMARY KEY,
  data jsonb NOT NULL,
  product_id uuid,
  result text
) ON COMMIT DROP;

INSERT INTO sketo_coffee_import (position, data)
SELECT ordinality::integer, value
FROM jsonb_array_elements($lots$
[
  {
    "slug":"serikov-kenya-chepsangor-hills",
    "aliases":["kenya-chepsangor-hills","keniya-chepsangor-hills"],
    "brand":"Serikov Coffee Company",
    "name":"Кения Чепсангор Хиллс",
    "price":5600,"size":null,"filter":"microlot",
    "notes":"Ягодный джем, нектарин, папайя, карамель, красное яблоко",
    "description":"Кофе из региона Нанди Хиллс анаэробной обработки, обжаренный под фильтр. С фруктово-ягодным букетом и карамельными нотами.",
    "details":[["Страна","Кения"],["Регион","Нанди Хиллс"],["Станция обработки","Чепсангор Хиллс"],["Разновидность","Батиан, Руиру 11"],["Обработка","Анаэробная"],["Процесс","Спальный мешок"],["Обжарка","Фильтр"]],
    "source":"IMG_1145.PNG","review":"Уточнить фасовку."
  },
  {
    "slug":"serikov-colombia-la-esmeralda-natural",
    "aliases":["colombia-la-esmeralda-natural","kolumbiya-la-esmiralda-naturalnaya","kolumbiya-la-esmiralda-naturalnaya-1"],
    "brand":"Serikov Coffee Company",
    "name":"Колумбия Ла Эсмиральда (натуральная)",
    "price":5600,"size":null,"filter":"microlot",
    "notes":"Шоколад, вишнёвый ликёр, красное вино, манго, красное яблоко",
    "description":"Кофе с фермы Ла Эсмиральда в регионе Уила, натуральной обработки и обжарки под фильтр. Шоколадный и фруктовый профиль с винными оттенками.",
    "details":[["Страна","Колумбия"],["Регион","Уила"],["Ферма","Ла Эсмиральда"],["Управляющий","Эдвин Нарваес"],["Разновидность","Кастильо Тамбо"],["Обработка","Натуральная"],["Процесс","Традиционный"],["Урожай","2025"],["Высота","1600 м"],["Обжарка","Фильтр"],["Оценка CVA","88"]],
    "source":"IMG_1146.PNG","review":"Уточнить фасовку."
  },
  {
    "slug":"serikov-ethiopia-hamsho-natural",
    "aliases":["ethiopia-hamsho-natural"],
    "brand":"Serikov Coffee Company",
    "name":"Эфиопия Хамшо (натуральная)",
    "price":7000,"size":null,"filter":"microlot",
    "notes":"Каркаде, манго, роза, мандарин, карамель",
    "description":"Кофе из Сидама Хамшо натуральной обработки, обжаренный под фильтр. Фруктово-цветочный профиль с нотами каркаде и карамели.",
    "details":[["Страна","Эфиопия"],["Регион","Сидама Хамшо"],["Станция обработки","Шантавене"],["Управляющий","Семья Дукамо"],["Разновидность","74110, 74158"],["Обработка","Натуральная"],["Процесс","Традиционный"],["Урожай","2025"],["Высота","2300–2400 м"],["Обжарка","Фильтр"],["Оценка CVA","87"]],
    "source":"IMG_1147.PNG","review":"Уточнить фасовку."
  },
  {
    "slug":"pro-barista-asian-profile-1kg","aliases":["asian-profile-1kg","asian-profile-1-kg"],
    "brand":"Pro Barista","name":"Asian Profile, 1 кг","names":["Asian Profile"],
    "price":17100,"size":"1 кг","filter":"profiles",
    "notes":"Курага, чернослив, тёмный шоколад, арахис",
    "description":"Бленд Бразилии и Эфиопии в пропорции 60/40, обжаренный под эспрессо. Во вкусе сухофрукты, тёмный шоколад и арахис.",
    "details":[["Бленд","Бразилия / Эфиопия, 60/40"],["Обжарка","Эспрессо"],["Сладость","4/5"],["Кислотность","3/5"],["Горечь","3/5"],["Тело","4/5"]],
    "source":"IMG_1151.PNG, IMG_1170.PNG"
  },
  {
    "slug":"pro-barista-brazilian-profile-1-0-1kg","aliases":["brazilian-profile-1-0-1kg","brazilian-profile-1-0-1-kg"],
    "brand":"Pro Barista","name":"Brazilian Profile 1.0, 1 кг","names":["Brazilian Profile 1.0"],
    "price":14700,"size":"1 кг","filter":"profiles",
    "notes":"Карамель, тёмный шоколад, грецкий орех",
    "description":"Кофе из бразильского региона Серрадо, обжаренный под эспрессо. Карамельный и шоколадно-ореховый профиль.",
    "details":[["Страна","Бразилия"],["Регион","Серрадо"],["Обработка","Натуральная"],["Разновидность","Жёлтый Бурбон"],["Обжарка","Эспрессо"],["Сладость","3/5"],["Кислотность","2/5"],["Горечь","3/5"],["Тело","4/5"]],
    "source":"IMG_1172.PNG","review":"Букет взят из описания: на этикетке вместо карамели указан чернослив."
  },
  {
    "slug":"pro-barista-brazilian-profile-2-0-1kg","aliases":["brazilian-profile-2-0-1kg","brazilian-profile-2-0-1-kg"],
    "brand":"Pro Barista","name":"Brazilian Profile 2.0, 1 кг","names":["Brazilian Profile 2.0"],
    "price":14950,"size":"1 кг","filter":"profiles",
    "notes":"Цитрусы, тёмный шоколад, грецкий орех",
    "description":"Бленд Бразилии и Эфиопии в пропорции 80/20, обжаренный под эспрессо. Шоколадно-ореховый вкус с цитрусовыми нотами.",
    "details":[["Бленд","Бразилия / Эфиопия, 80/20"],["Обжарка","Эспрессо"],["Сладость","3/5"],["Кислотность","2/5"],["Горечь","3/5"],["Тело","4/5"]],
    "source":"IMG_1153.PNG, IMG_1173.PNG"
  },
  {
    "slug":"pro-barista-italian-profile-medium-1kg","aliases":["italian-profile-medium-1kg","italian-profile-medium-1-kg"],
    "brand":"Pro Barista","name":"Italian Profile Medium, 1 кг","names":["Italian Profile Medium","Italian Profile (обжарка medium), 1 кг"],
    "price":14100,"size":"1 кг","filter":"profiles",
    "notes":"Тёмный шоколад, орехи",
    "description":"Бленд арабики из Бразилии и Уганды средней обжарки под эспрессо. Тёмный шоколад и орехи в букете.",
    "details":[["Бленд","Бразилия / Уганда"],["Состав","100% арабика"],["Степень обжарки","Средняя"],["Обжарка","Эспрессо"],["Сладость","4/5"],["Кислотность","2/5"],["Горечь","4/5"],["Тело","4/5"]],
    "source":"IMG_1152.PNG, IMG_1174.PNG"
  },
  {
    "slug":"pro-barista-drip-african-1-0","aliases":["drip-african-1-0"],
    "brand":"Pro Barista","name":"Дрип-кофе African 1.0",
    "price":800,"size":"1 фильтр-пакет","filter":"profiles",
    "notes":"Красная смородина, лайм, чёрный чай",
    "description":"Порционный дрип-кофе из Кении мытой обработки. В букете красная смородина, лайм и чёрный чай.",
    "details":[["Формат","Дрип-кофе"],["Страна","Кения"],["Лот","Muthaini"],["Обработка","Мытая"]],
    "source":"IMG_1175.PNG"
  },
  {
    "slug":"pro-barista-drip-brazilian-profile-1-0","aliases":["drip-brazilian-profile-1-0"],
    "brand":"Pro Barista","name":"Дрип-кофе Brazilian Profile 1.0",
    "price":800,"size":"1 фильтр-пакет","filter":"profiles",
    "notes":"Шоколад, орехи, сухофрукты",
    "description":"Порционный дрип-кофе из Бразилии натуральной обработки. Шоколадно-ореховый профиль с нотами сухофруктов.",
    "details":[["Формат","Дрип-кофе"],["Страна","Бразилия"],["Обработка","Натуральная"]],
    "source":"IMG_1176.PNG"
  },
  {
    "slug":"hypno-ethiopia-sama-honey","aliases":["ethiopia-sama-honey"],
    "brand":"Hypno","name":"Ethiopia Sama Honey",
    "price":14500,"size":"250 г","filter":"microlot",
    "notes":"Абрикос, персик, белые цветы",
    "description":"Кофе из Гуджи Анасора обработки хани, обжаренный под фильтр. Мягкий, сочный профиль с нотами абрикоса, персика и белых цветов.",
    "details":[["Страна","Эфиопия"],["Регион","Guji Anasora"],["Лот","Sama Honey"],["Разновидность","74158"],["Обработка","Хани"],["Обжарка","Фильтр"]],
    "source":"IMG_1154.PNG"
  },
  {
    "slug":"hypno-ethiopia-elto-sama","aliases":["ethiopia-elto-sama"],
    "brand":"Hypno","name":"Ethiopia Elto Sama",
    "price":16500,"size":null,"filter":"microlot",
    "notes":"Жасмин, лемонграсс, груша",
    "description":"Кофе из Гуджи Анасора мытой обработки, обжаренный под фильтр. Чистый цветочно-чайный профиль с нотами жасмина, лемонграсса и груши.",
    "details":[["Страна","Эфиопия"],["Регион","Guji Anasora"],["Лот","Elto Sama"],["Разновидность","74158"],["Обработка","Мытая"],["Обжарка","Фильтр"]],
    "source":"IMG_1155.PNG","review":"На фото другие лоты Hypno (Sama Honey / Mesele). Название и характеристики взяты из текста карточки. Проверить бренд и фасовку."
  },
  {
    "slug":"massimo-ethiopia-daannisa-natural","aliases":["ethiopia-daannisa-natural"],
    "brand":"Massimo","name":"Ethiopia Daannisa Natural",
    "price":12000,"size":"250 г","filter":"microlot",
    "notes":"Косточковые фрукты, хмель, цветочные ноты",
    "description":"Кофе из Гуджи натуральной обработки. Косточковые фрукты, хмель и цветочные ноты с деликатной ферментацией.",
    "details":[["Страна","Эфиопия"],["Регион","Гуджи"],["Станция обработки","Suke Quto Washing Station"],["Производитель","Sookoo Coffee"],["Разновидность","Ethiopian Landraces"],["Обработка","Натуральная"],["Урожай","2025/2026"],["Высота","2000–2178 м"],["Оценка Q-грейдера","88"]],
    "source":"IMG_1162.PNG","review":"Оценка 88 взята из текста; на упаковке указано 87+. Обжарка не указана."
  },
  {
    "slug":"massimo-ethiopia-shakisso-washed","aliases":["ethiopia-shakisso-washed"],
    "brand":"Massimo","name":"Ethiopia Shakisso Washed",
    "price":10500,"size":"250 г","filter":"microlot",
    "notes":"Жасмин, мандарин, цитрусы",
    "description":"Кофе из Гуджи мытой обработки. Лёгкий цветочный профиль с жасмином и цитрусовыми нотами.",
    "details":[["Страна","Эфиопия"],["Регион","Гуджи"],["Станция обработки","Guji Hadeso Washing Station"],["Производитель","Testi Coffee"],["Разновидность","Ethiopian Landraces"],["Обработка","Мытая"],["Урожай","2025/2026"],["Высота","1850–2100 м"],["Оценка Q-грейдера","88"]],
    "source":"IMG_1163.PNG","review":"Оценка 88 взята из текста; на упаковке указано 87+. Обжарка не указана."
  },
  {
    "slug":"massimo-kenya-gatina-aa","aliases":["kenya-gatina-aa"],
    "brand":"Massimo","name":"Kenya Gatina AA",
    "price":10500,"size":"250 г","filter":"microlot",
    "notes":"Чёрная смородина, ежевика, красное вино",
    "description":"Кофе из округа Ньери мытой обработки. Ягодный профиль с чёрной смородиной, ежевикой и оттенками красного вина.",
    "details":[["Страна","Кения"],["Регион","Ньери"],["Станция обработки","Gatina Washing Station"],["Производитель","Mugaga Farmers Cooperative Society"],["Разновидность","SL28, SL34, Batian, Ruiru 11"],["Обработка","Мытая"],["Урожай","2025/2026"],["Высота","1800–2050 м"],["Оценка Q-грейдера","88.25"]],
    "source":"IMG_1166.PNG","review":"Оценка взята из текста карточки. Обжарка не указана."
  },
  {
    "slug":"massimo-drip-ethiopia-chelichele","aliases":["drip-ethiopia-chelichele"],
    "brand":"Massimo","name":"Дрип-кофе Ethiopia Chelichele",
    "price":2400,"size":null,"filter":"microlot",
    "notes":"Цветочный чай, мёд, цитрусы",
    "description":"Дрип-кофе из Эфиопии мытой обработки. Цветочно-чайный профиль с медовыми и цитрусовыми нотами.",
    "details":[["Формат","Дрип-кофе"],["Страна","Эфиопия"],["Регион","Иргачеффе, Гедеб"],["Станция обработки","Chelichele Washing Station"],["Производитель","Testi Coffee"],["Разновидность","Ethiopian Landraces"],["Обработка","Мытая"],["Высота","1900–2200 м"]],
    "source":"IMG_1167.PNG","review":"Уточнить количество порций и вес упаковки."
  },
  {
    "slug":"massimo-drip-la-onda","aliases":["drip-la-onda"],
    "brand":"Massimo","name":"Дрип-кофе La Onda",
    "price":2400,"size":null,"filter":"microlot",
    "notes":"Красное яблоко, цветочные ноты, косточковые фрукты",
    "description":"Дрип-кофе с фермы La Onda в Колумбии, мытой обработки. Сладкий фруктово-цветочный профиль с нотами красного яблока.",
    "details":[["Формат","Дрип-кофе"],["Страна","Колумбия"],["Регион","Нариньо"],["Ферма","La Onda"],["Разновидность","Variedad Colombia"],["Обработка","Мытая"],["Высота","1800 м"]],
    "source":"IMG_1168.PNG","review":"Уточнить количество порций и вес упаковки."
  },
  {
    "slug":"massimo-drip-tumbaga-sugarcane-decaf","aliases":["drip-tumbaga-sugarcane-decaf"],
    "brand":"Massimo","name":"Дрип-кофе Tumbaga Sugarcane Decaf",
    "price":2400,"size":null,"filter":"decaf",
    "notes":"Сухофрукты, коричневый сахар, чёрный чай",
    "description":"Дрип-кофе из Колумбии с декофеинизацией Sugarcane (EA). Мягкий профиль с нотами сухофруктов, коричневого сахара и чёрного чая.",
    "details":[["Формат","Дрип-кофе"],["Страна","Колумбия"],["Регионы","Cauca, Tolima, Antioquia, Eje Cafetero"],["Производитель","Sucafina"],["Разновидность","Смесь разновидностей арабики"],["Обработка","Мытая"],["Декофеинизация","Sugarcane (EA)"]],
    "source":"IMG_1169.PNG","review":"Уточнить количество порций и вес упаковки."
  },
  {
    "slug":"massimo-drip-miriam-pink-bourbon","aliases":["drip-miriam-pink-bourbon"],
    "brand":"Massimo","name":"Дрип-кофе Miriam Pink Bourbon",
    "price":null,"size":null,"filter":"microlot",
    "notes":"Красные сухофрукты, косточковые фрукты, марципан",
    "description":"Дрип-кофе с фермы Finca El Guayacan в Колумбии, мытой обработки. Фруктовые ноты и марципановая сладость с мягкой кислотностью и шелковистым телом.",
    "details":[["Формат","Дрип-кофе"],["Страна","Колумбия"],["Регион","Уила"],["Ферма","Finca El Guayacan"],["Разновидность","Розовый Бурбон"],["Обработка","Мытая"],["Высота","1550 м"]],
    "source":"IMG_1177.PNG","review":"Цена не показана. Уточнить цену, количество порций и вес упаковки."
  },
  {
    "slug":"rwanda-kabue-250g","aliases":["rwanda-kabue","ruanda-kabue"],
    "brand":null,"name":"Руанда Кабуе",
    "price":8000,"size":"250 г","filter":"microlot",
    "notes":"Цитрусы, лемонграсс",
    "description":"Кофе из Руанды мытой обработки, обжаренный под фильтр. Лёгкий, чистый профиль с цитрусовыми нотами и лемонграссом.",
    "details":[["Страна","Руанда"],["Лот","Кабуе"],["Разновидность","Красный Бурбон"],["Обработка","Мытая"],["Обжарка","Фильтр"]],
    "source":"IMG_1156.PNG","review":"Бренд не виден на скриншоте."
  },
  {
    "slug":"colombia-jefferson-castano-250g","aliases":["colombia-jefferson-castano","kolumbiya-dzheferson-kastano"],
    "brand":null,"name":"Колумбия Джеферсон Кастаньо",
    "price":9000,"size":"250 г","filter":"microlot",
    "notes":"Лайм, красные ягоды",
    "description":"Кофе от фермера Джеферсона Кастаньо из Колумбии, мытой обработки и обжарки под фильтр. Свежий фруктовый профиль с лаймом и красными ягодами.",
    "details":[["Страна","Колумбия"],["Фермер","Джеферсон Кастаньо"],["Разновидность","Розовый Бурбон"],["Обработка","Мытая"],["Обжарка","Фильтр"]],
    "source":"IMG_1161.PNG","review":"Бренд не виден на скриншоте."
  }
]
$lots$::jsonb) WITH ORDINALITY;

-- Переводы соответствуют позициям исходного списка. Собственные названия лотов
-- и брендов сохраняются; описания, ноты и характеристики локализованы.
UPDATE sketo_coffee_import i
SET data = i.data || jsonb_build_object('translations', translated.value)
FROM jsonb_array_elements($translations$
[
 {"en":{"name":"Kenya Chepsangor Hills","notes":"Berry jam, nectarine, papaya, caramel, red apple","description":"Anaerobically processed coffee from Nandi Hills, roasted for filter brewing. A fruity, berry-forward profile with caramel notes."},
  "kz":{"name":"Кения Чепсангор Хиллс","notes":"Жидек тосабы, нектарин, папайя, карамель, қызыл алма","description":"Нанди Хиллс өңірінен келген, анаэробты әдіспен өңделген және сүзгімен демдеуге қуырылған кофе. Жеміс-жидек дәмі карамель реңктерімен үйлеседі."}},
 {"en":{"name":"Colombia La Esmeralda (Natural)","notes":"Chocolate, cherry liqueur, red wine, mango, red apple","description":"Naturally processed coffee from La Esmeralda farm in Huila, roasted for filter brewing. A chocolate and fruit profile with wine-like notes."},
  "kz":{"name":"Колумбия Ла Эсмиральда (табиғи өңдеу)","notes":"Шоколад, шие ликері, қызыл шарап, манго, қызыл алма","description":"Уила өңіріндегі Ла Эсмиральда фермасынан келген, табиғи әдіспен өңделген және сүзгімен демдеуге қуырылған кофе. Шоколад пен жеміс дәмі шарап реңктерімен үйлеседі."}},
 {"en":{"name":"Ethiopia Hamsho (Natural)","notes":"Hibiscus tea, mango, rose, mandarin, caramel","description":"Naturally processed coffee from Sidama Hamsho, roasted for filter brewing. A fruity, floral profile with hibiscus and caramel notes."},
  "kz":{"name":"Эфиопия Хамшо (табиғи өңдеу)","notes":"Каркаде шайы, манго, раушан, мандарин, карамель","description":"Сидама Хамшодан келген, табиғи әдіспен өңделген және сүзгімен демдеуге қуырылған кофе. Жеміс пен гүл дәмдеріне каркаде мен карамель реңктері қосылады."}},
 {"en":{"name":"Asian Profile, 1 kg","notes":"Dried apricot, prune, dark chocolate, peanut","description":"A 60/40 blend of Brazilian and Ethiopian coffees, roasted for espresso. Notes of dried fruit, dark chocolate and peanut."},
  "kz":{"name":"Asian Profile, 1 кг","notes":"Кептірілген өрік, қара өрік, қара шоколад, жержаңғақ","description":"Эспрессоға қуырылған Бразилия мен Эфиопия кофелерінің 60/40 қоспасы. Дәмінде кептірілген жемістер, қара шоколад және жержаңғақ сезіледі."}},
 {"en":{"name":"Brazilian Profile 1.0, 1 kg","notes":"Caramel, dark chocolate, walnut","description":"Coffee from Brazil's Cerrado region, roasted for espresso. A caramel, chocolate and nut profile."},
  "kz":{"name":"Brazilian Profile 1.0, 1 кг","notes":"Карамель, қара шоколад, грек жаңғағы","description":"Бразилияның Серрадо өңірінен келген, эспрессоға қуырылған кофе. Дәмінде карамель, шоколад және жаңғақ реңктері бар."}},
 {"en":{"name":"Brazilian Profile 2.0, 1 kg","notes":"Citrus, dark chocolate, walnut","description":"An 80/20 blend of Brazilian and Ethiopian coffees, roasted for espresso. Chocolate and nut flavours with citrus notes."},
  "kz":{"name":"Brazilian Profile 2.0, 1 кг","notes":"Цитрус, қара шоколад, грек жаңғағы","description":"Эспрессоға қуырылған Бразилия мен Эфиопия кофелерінің 80/20 қоспасы. Шоколад пен жаңғақ дәмін цитрус реңктері толықтырады."}},
 {"en":{"name":"Italian Profile Medium, 1 kg","notes":"Dark chocolate, nuts","description":"A medium-roast blend of Brazilian and Ugandan Arabica coffees for espresso. Notes of dark chocolate and nuts."},
  "kz":{"name":"Italian Profile Medium, 1 кг","notes":"Қара шоколад, жаңғақтар","description":"Бразилия мен Уганда арабикасының эспрессоға арналған орташа қуырылған қоспасы. Дәмінде қара шоколад пен жаңғақ реңктері бар."}},
 {"en":{"name":"African 1.0 Drip Coffee","notes":"Redcurrant, lime, black tea","description":"Single-serve drip coffee from Kenya, washed processed. Notes of redcurrant, lime and black tea."},
  "kz":{"name":"African 1.0 дрип-кофесі","notes":"Қызыл қарақат, лайм, қара шай","description":"Кениядан келген, жуылған әдіспен өңделген бір порциялық дрип-кофе. Дәмінде қызыл қарақат, лайм және қара шай сезіледі."}},
 {"en":{"name":"Brazilian Profile 1.0 Drip Coffee","notes":"Chocolate, nuts, dried fruit","description":"Single-serve drip coffee from Brazil, naturally processed. A chocolate and nut profile with dried-fruit notes."},
  "kz":{"name":"Brazilian Profile 1.0 дрип-кофесі","notes":"Шоколад, жаңғақтар, кептірілген жемістер","description":"Бразилиядан келген, табиғи әдіспен өңделген бір порциялық дрип-кофе. Шоколад пен жаңғақ дәмі кептірілген жеміс реңктерімен үйлеседі."}},
 {"en":{"name":"Ethiopia Sama Honey","notes":"Apricot, peach, white flowers","description":"Honey-processed coffee from Guji Anasora, roasted for filter brewing. A soft, juicy profile with apricot, peach and white-flower notes."},
  "kz":{"name":"Ethiopia Sama Honey","notes":"Өрік, шабдалы, ақ гүлдер","description":"Гуджи Анасорадан келген, хани әдісімен өңделген және сүзгімен демдеуге қуырылған кофе. Өрік, шабдалы және ақ гүл реңктері бар жұмсақ, шырынды дәм."}},
 {"en":{"name":"Ethiopia Elto Sama","notes":"Jasmine, lemongrass, pear","description":"Washed coffee from Guji Anasora, roasted for filter brewing. A clean, floral and tea-like profile with jasmine, lemongrass and pear notes."},
  "kz":{"name":"Ethiopia Elto Sama","notes":"Жасмин, лемонграсс, алмұрт","description":"Гуджи Анасорадан келген, жуылған әдіспен өңделген және сүзгімен демдеуге қуырылған кофе. Жасмин, лемонграсс пен алмұрт реңктері бар таза, гүлді әрі шай тәрізді дәм."}},
 {"en":{"name":"Ethiopia Daannisa Natural","notes":"Stone fruit, hops, floral notes","description":"Naturally processed coffee from Guji. Stone fruit, hops and floral notes with delicate fermentation character."},
  "kz":{"name":"Ethiopia Daannisa Natural","notes":"Сүйекті жемістер, құлмақ, гүл реңктері","description":"Гуджиден келген, табиғи әдіспен өңделген кофе. Сүйекті жемістер, құлмақ және гүл реңктері нәзік ферментация сипатымен үйлеседі."}},
 {"en":{"name":"Ethiopia Shakisso Washed","notes":"Jasmine, mandarin, citrus","description":"Washed coffee from Guji. A light, floral profile with jasmine and citrus notes."},
  "kz":{"name":"Ethiopia Shakisso Washed","notes":"Жасмин, мандарин, цитрус","description":"Гуджиден келген, жуылған әдіспен өңделген кофе. Жасмин мен цитрус реңктері бар жеңіл, гүлді дәм."}},
 {"en":{"name":"Kenya Gatina AA","notes":"Blackcurrant, blackberry, red wine","description":"Washed coffee from Nyeri County. A berry profile with blackcurrant, blackberry and red-wine notes."},
  "kz":{"name":"Kenya Gatina AA","notes":"Қара қарақат, қара бүлдірген, қызыл шарап","description":"Ньери округінен келген, жуылған әдіспен өңделген кофе. Қара қарақат, қара бүлдірген және қызыл шарап реңктері бар жидекті дәм."}},
 {"en":{"name":"Ethiopia Chelichele Drip Coffee","notes":"Floral tea, honey, citrus","description":"Washed Ethiopian drip coffee. A floral, tea-like profile with honey and citrus notes."},
  "kz":{"name":"Ethiopia Chelichele дрип-кофесі","notes":"Гүл шайы, бал, цитрус","description":"Эфиопиядан келген, жуылған әдіспен өңделген дрип-кофе. Бал мен цитрус реңктері бар гүлді, шай тәрізді дәм."}},
 {"en":{"name":"La Onda Drip Coffee","notes":"Red apple, floral notes, stone fruit","description":"Washed drip coffee from La Onda farm in Colombia. A sweet, fruity and floral profile with red-apple notes."},
  "kz":{"name":"La Onda дрип-кофесі","notes":"Қызыл алма, гүл реңктері, сүйекті жемістер","description":"Колумбиядағы La Onda фермасынан келген, жуылған әдіспен өңделген дрип-кофе. Қызыл алма реңктері бар тәтті, жемісті әрі гүлді дәм."}},
 {"en":{"name":"Tumbaga Sugarcane Decaf Drip Coffee","notes":"Dried fruit, brown sugar, black tea","description":"Colombian drip coffee decaffeinated using the Sugarcane (EA) process. A soft profile with dried fruit, brown sugar and black tea."},
  "kz":{"name":"Tumbaga Sugarcane Decaf дрип-кофесі","notes":"Кептірілген жемістер, қоңыр қант, қара шай","description":"Sugarcane (EA) әдісімен кофеині алынған колумбиялық дрип-кофе. Кептірілген жемістер, қоңыр қант және қара шай реңктері бар жұмсақ дәм."}},
 {"en":{"name":"Miriam Pink Bourbon Drip Coffee","notes":"Red dried fruit, stone fruit, marzipan","description":"Washed drip coffee from Finca El Guayacan in Colombia. Fruity notes and marzipan sweetness with gentle acidity and a silky body."},
  "kz":{"name":"Miriam Pink Bourbon дрип-кофесі","notes":"Кептірілген қызыл жемістер, сүйекті жемістер, марципан","description":"Колумбиядағы Finca El Guayacan фермасынан келген, жуылған әдіспен өңделген дрип-кофе. Жеміс реңктері мен марципан тәттілігі жұмсақ қышқылдықпен және жібектей құрылыммен үйлеседі."}},
 {"en":{"name":"Rwanda Kabue","notes":"Citrus, lemongrass","description":"Washed coffee from Rwanda, roasted for filter brewing. A light, clean profile with citrus and lemongrass notes."},
  "kz":{"name":"Руанда Кабуе","notes":"Цитрус, лемонграсс","description":"Руандадан келген, жуылған әдіспен өңделген және сүзгімен демдеуге қуырылған кофе. Цитрус пен лемонграсс реңктері бар жеңіл, таза дәм."}},
 {"en":{"name":"Colombia Jefferson Castano","notes":"Lime, red berries","description":"Washed Colombian coffee from farmer Jefferson Castano, roasted for filter brewing. A fresh, fruity profile with lime and red berries."},
  "kz":{"name":"Колумбия Джеферсон Кастаньо","notes":"Лайм, қызыл жидектер","description":"Колумбиялық фермер Джеферсон Кастаньодан келген, жуылған әдіспен өңделген және сүзгімен демдеуге қуырылған кофе. Лайм мен қызыл жидек реңктері бар сергек, жемісті дәм."}}
]
$translations$::jsonb) WITH ORDINALITY AS translated(value, position)
WHERE i.position = translated.position;

CREATE TEMP TABLE sketo_coffee_dictionary (ru text PRIMARY KEY, en text NOT NULL, kz text NOT NULL) ON COMMIT DROP;
INSERT INTO sketo_coffee_dictionary VALUES
 ('Обжарщик','Roaster','Қуырушы'),
 ('Страна','Country','Ел'),('Регион','Region','Өңір'),('Регионы','Regions','Өңірлер'),
 ('Станция обработки','Processing station','Өңдеу станциясы'),('Ферма','Farm','Ферма'),
 ('Фермер','Farmer','Фермер'),('Управляющий','Managed by','Басқарушы'),
 ('Производитель','Producer','Өндіруші'),('Разновидность','Variety','Сұрып'),
 ('Обработка','Processing','Өңдеу әдісі'),('Процесс','Process','Өңдеу үдерісі'),
 ('Урожай','Harvest','Өнім жылы'),('Высота','Altitude','Өсу биіктігі'),
 ('Обжарка','Roast for','Қуыру мақсаты'),('Оценка CVA','CVA score','CVA бағасы'),
 ('Оценка Q-грейдера','Q-grader score','Q-грейдер бағасы'),('Бленд','Blend','Қоспа'),
 ('Сладость','Sweetness','Тәттілік'),('Кислотность','Acidity','Қышқылдық'),
 ('Горечь','Bitterness','Ащылық'),('Тело','Body','Қоюлық'),('Состав','Composition','Құрамы'),
 ('Степень обжарки','Roast level','Қуыру дәрежесі'),('Формат','Format','Пішімі'),
 ('Лот','Lot','Лот'),('Декофеинизация','Decaffeination','Кофеинді алу әдісі'),
 ('Кения','Kenya','Кения'),('Колумбия','Colombia','Колумбия'),('Эфиопия','Ethiopia','Эфиопия'),
 ('Бразилия','Brazil','Бразилия'),('Руанда','Rwanda','Руанда'),
 ('Нанди Хиллс','Nandi Hills','Нанди Хиллс'),('Чепсангор Хиллс','Chepsangor Hills','Чепсангор Хиллс'),
 ('Батиан, Руиру 11','Batian, Ruiru 11','Батиан, Руиру 11'),
 ('Анаэробная','Anaerobic','Анаэробты'),('Спальный мешок','Sleeping bag','Ұйықтау қапшығы'),
 ('Фильтр','Filter','Сүзгімен демдеу'),('Уила','Huila','Уила'),
 ('Ла Эсмиральда','La Esmeralda','Ла Эсмиральда'),('Эдвин Нарваес','Edwin Narvaez','Эдвин Нарваес'),
 ('Кастильо Тамбо','Castillo Tambo','Кастильо Тамбо'),('Натуральная','Natural','Табиғи'),
 ('Традиционный','Traditional','Дәстүрлі'),('Сидама Хамшо','Sidama Hamsho','Сидама Хамшо'),
 ('Шантавене','Shantawene','Шантавене'),('Семья Дукамо','Dukamo family','Дукамо отбасы'),
 ('Бразилия / Эфиопия, 60/40','Brazil / Ethiopia, 60/40','Бразилия / Эфиопия, 60/40'),
 ('Бразилия / Эфиопия, 80/20','Brazil / Ethiopia, 80/20','Бразилия / Эфиопия, 80/20'),
 ('Бразилия / Уганда','Brazil / Uganda','Бразилия / Уганда'),
 ('Эспрессо','Espresso','Эспрессо'),('Серрадо','Cerrado','Серрадо'),
 ('Жёлтый Бурбон','Yellow Bourbon','Сары Бурбон'),('100% арабика','100% Arabica','100% арабика'),
 ('Средняя','Medium','Орташа'),('Дрип-кофе','Drip coffee','Дрип-кофе'),
 ('Мытая','Washed','Жуылған'),('Хани','Honey','Хани'),('Гуджи','Guji','Гуджи'),
 ('Ньери','Nyeri','Ньери'),('Иргачеффе, Гедеб','Yirgacheffe, Gedeb','Иргачеффе, Гедеб'),
 ('Нариньо','Narino','Нариньо'),
 ('Смесь разновидностей арабики','Mixed Arabica varieties','Арабика сұрыптарының қоспасы'),
 ('Розовый Бурбон','Pink Bourbon','Қызғылт Бурбон'),('Красный Бурбон','Red Bourbon','Қызыл Бурбон'),
 ('Кабуе','Kabue','Кабуе'),('Джеферсон Кастаньо','Jefferson Castano','Джеферсон Кастаньо'),
 ('1 кг','1 kg','1 кг'),('250 г','250 g','250 г'),('1 фильтр-пакет','1 drip bag','1 сүзгі-пакет'),
 ('1600 м','1600 m','1600 м'),('2300–2400 м','2300–2400 m','2300–2400 м'),
 ('2000–2178 м','2000–2178 m','2000–2178 м'),('1850–2100 м','1850–2100 m','1850–2100 м'),
 ('1800–2050 м','1800–2050 m','1800–2050 м'),('1900–2200 м','1900–2200 m','1900–2200 м'),
 ('1800 м','1800 m','1800 м'),('1550 м','1550 m','1550 м');

-- Блокировка защищает от параллельного импорта/создания товара во время проверки дублей.
LOCK TABLE public.products IN SHARE ROW EXCLUSIVE MODE;

DO $import$
DECLARE
  item record;
  candidate_ids uuid[];
  target_id uuid;
  base_order integer;
  target_order integer;
  language text;
  localized jsonb;
  inserted_translation uuid;
  image_placeholder text := 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"%3E%3Crect width="600" height="600" fill="%23f2f0eb"/%3E%3Cpath d="M300 220v160M220 300h160" stroke="%23ce1616" stroke-width="10"/%3E%3C/svg%3E';
BEGIN
  IF (SELECT count(*) FROM sketo_coffee_import) <> 20 THEN
    RAISE EXCEPTION 'Ожидалось 20 уникальных лотов';
  END IF;
  IF EXISTS (SELECT 1 FROM sketo_coffee_import WHERE data->'translations'->'en' IS NULL OR data->'translations'->'kz' IS NULL) THEN
    RAISE EXCEPTION 'Переводы должны присутствовать для всех 20 лотов';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'public.locale'::regtype AND enumlabel = 'kz') THEN
    RAISE EXCEPTION 'Сначала отдельно выполните миграцию 20260924010000_kazakh_locale.sql';
  END IF;

  FOR item IN SELECT * FROM sketo_coffee_import ORDER BY position LOOP
    -- Проверяем slug и название вместе с фасовкой: 250 г и 1 кг не объединяем.
    SELECT array_agg(p.id ORDER BY p.id) INTO candidate_ids
    FROM public.products p
    WHERE p.type = 'coffee' AND (
      p.slug = item.data->>'slug'
      OR (
        (
          p.slug IN (SELECT jsonb_array_elements_text(item.data->'aliases'))
          OR EXISTS (
            SELECT 1
            FROM (
              SELECT p.name AS name
              UNION ALL SELECT t.name FROM public.product_translations t WHERE t.product_id = p.id
            ) existing_names
            CROSS JOIN (
              SELECT item.data->>'name' AS name
              UNION ALL SELECT jsonb_array_elements_text(coalesce(item.data->'names', '[]'::jsonb))
            ) import_names
            WHERE regexp_replace(lower(existing_names.name), '[^a-zA-Zа-яА-ЯёЁ0-9]', '', 'g')
                = regexp_replace(lower(import_names.name), '[^a-zA-Zа-яА-ЯёЁ0-9]', '', 'g')
          )
        )
        AND (
          item.data->>'size' IS NULL
          OR NOT EXISTS (SELECT 1 FROM public.product_translations t WHERE t.product_id = p.id AND nullif(btrim(t.size), '') IS NOT NULL)
          OR EXISTS (
            SELECT 1 FROM public.product_translations t WHERE t.product_id = p.id
            AND regexp_replace(lower(replace(replace(t.size, 'kg', 'кг'), 'g', 'г')), '[[:space:]]', '', 'g')
              = regexp_replace(lower(item.data->>'size'), '[[:space:]]', '', 'g')
          )
        )
      )
    );

    IF cardinality(candidate_ids) > 1 THEN
      RAISE EXCEPTION 'Несколько существующих карточек для %. Уточните совпадение перед импортом: %', item.data->>'name', candidate_ids;
    END IF;

    target_id := candidate_ids[1];
    IF target_id IS NOT NULL THEN
      UPDATE sketo_coffee_import SET product_id = target_id, result = 'Существующий: данные сохранены' WHERE position = item.position;
    ELSE
      -- Коллизия slug с другим типом товара должна остановить весь импорт.
      INSERT INTO public.products (
        slug, type, status, editorial_state, name, price_display, price_amount,
        price_currency, image_url, filters, sort_order, is_published
      ) VALUES (
        item.data->>'slug', 'coffee', 'in_stock', 'draft', item.data->>'name',
        CASE WHEN item.data->>'price' IS NULL THEN '' ELSE 'KZT ' || (item.data->>'price') END,
        (item.data->>'price')::integer, 'KZT', image_placeholder,
        ARRAY[item.data->>'filter'], 0, false
      ) RETURNING id INTO target_id;

      INSERT INTO public.product_images (product_id, url, sort_order, is_primary)
      VALUES (target_id, image_placeholder, 0, true);

      INSERT INTO public.audit_logs (entity_type, entity_id, action, summary, diff)
      VALUES ('product', target_id, 'create', 'Импорт лота из скриншотов 06.10.2026',
        jsonb_build_object('source', item.data->>'source', 'review', item.data->>'review',
          'import', '20261006_coffee_lots', 'editorial_state', 'draft'));

      UPDATE sketo_coffee_import SET product_id = target_id, result = 'Добавлен черновик' WHERE position = item.position;
    END IF;

    -- Отсутствующие локали добавляются также после прежнего RU-импорта.
    -- Уже существующие языковые версии (даже пустые) не перезаписываются.
    FOREACH language IN ARRAY ARRAY['ru', 'en', 'kz'] LOOP
      localized := CASE WHEN language = 'ru' THEN item.data ELSE item.data->'translations'->language END;
      inserted_translation := NULL;
      INSERT INTO public.product_translations (product_id, locale, name, size, notes, description)
      VALUES (target_id, language::public.locale, localized->>'name',
        CASE language WHEN 'en' THEN (SELECT en FROM sketo_coffee_dictionary WHERE ru = item.data->>'size')
          WHEN 'kz' THEN (SELECT kz FROM sketo_coffee_dictionary WHERE ru = item.data->>'size')
          ELSE item.data->>'size' END,
        localized->>'notes', localized->>'description')
      ON CONFLICT (product_id, locale) DO NOTHING
      RETURNING id INTO inserted_translation;

      IF inserted_translation IS NOT NULL THEN
        -- Отдельно сохранённые характеристики не дублируем и не заменяем.
        IF NOT EXISTS (SELECT 1 FROM public.product_details WHERE product_id = target_id AND locale = language::public.locale AND kind = 'detail') THEN
          IF item.data->>'brand' IS NOT NULL THEN
            INSERT INTO public.product_details (product_id, locale, kind, label, value, sort_order)
            VALUES (target_id, language::public.locale, 'detail',
              CASE language WHEN 'en' THEN 'Roaster' WHEN 'kz' THEN 'Қуырушы' ELSE 'Обжарщик' END,
              item.data->>'brand', 0);
          END IF;
          INSERT INTO public.product_details (product_id, locale, kind, label, value, sort_order)
          SELECT target_id, language::public.locale, 'detail',
            CASE language WHEN 'en' THEN labels.en WHEN 'kz' THEN labels.kz ELSE detail.value->>0 END,
            CASE language WHEN 'en' THEN coalesce(vals.en, detail.value->>1)
              WHEN 'kz' THEN coalesce(vals.kz, detail.value->>1) ELSE detail.value->>1 END,
            detail.ordinality::integer
          FROM jsonb_array_elements(item.data->'details') WITH ORDINALITY AS detail(value, ordinality)
          LEFT JOIN sketo_coffee_dictionary labels ON labels.ru = detail.value->>0
          LEFT JOIN sketo_coffee_dictionary vals ON vals.ru = detail.value->>1;
        END IF;
        INSERT INTO public.audit_logs (entity_type, entity_id, action, summary, diff)
        VALUES ('product', target_id, 'update', 'Добавлена языковая версия лота: ' || language,
          jsonb_build_object('import', '20261006_coffee_lots', 'locale', language));
        UPDATE public.products SET updated_at = now() WHERE id = target_id;
      END IF;
    END LOOP;
  END LOOP;

  IF (SELECT count(DISTINCT product_id) FROM sketo_coffee_import) <> 20 THEN
    RAISE EXCEPTION 'Разные лоты сопоставлены одной карточке; импорт отменён';
  END IF;

  -- Остальные товары сохраняют порядок. Выбранные 20 идут единым блоком по брендам.
  -- Исключение целевых карточек из MAX делает повторный запуск стабильным.
  SELECT coalesce(max(p.sort_order), -1) + 1 INTO base_order
  FROM public.products p
  WHERE p.type = 'coffee' AND NOT EXISTS (
    SELECT 1 FROM sketo_coffee_import i WHERE i.product_id = p.id
  );

  FOR item IN SELECT * FROM sketo_coffee_import ORDER BY position LOOP
    target_order := base_order + item.position - 1;
    UPDATE public.products SET sort_order = target_order
    WHERE id = item.product_id AND sort_order IS DISTINCT FROM target_order;
    IF FOUND AND item.result LIKE 'Существующий:%' THEN
      INSERT INTO public.audit_logs (entity_type, entity_id, action, summary, diff)
      VALUES ('product', item.product_id, 'update', 'Порядок лотов по обжарщикам',
        jsonb_build_object('import', '20261006_coffee_lots', 'sort_order', target_order));
    END IF;
  END LOOP;
END;
$import$;

-- Сохраните результат: здесь есть ссылки в кабинет и замечания по исходникам.
SELECT
  i.position AS "Порядок",
  coalesce(i.data->>'brand', 'Уточнить бренд') AS "Обжарщик",
  p.name AS "Название",
  p.price_display AS "Цена в базе",
  i.result AS "Результат",
  (SELECT string_agg(t.locale::text, ', ' ORDER BY t.locale::text)
   FROM public.product_translations t WHERE t.product_id = p.id) AS "Языки",
  '/staff/edit/coffee/' || p.slug AS "Редактировать",
  i.data->>'review' AS "Проверить"
FROM sketo_coffee_import i
JOIN public.products p ON p.id = i.product_id
ORDER BY i.position;

COMMIT;
