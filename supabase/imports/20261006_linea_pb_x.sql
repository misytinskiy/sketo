-- Sketo: импорт La Marzocco Linea PB X, 06.10.2026.
-- Выполнить целиком в Supabase SQL Editor.
-- Карточка создаётся как неопубликованный черновик со статусом «Под заказ».
-- Цена и фотографии отсутствуют в исходных материалах: цена остаётся пустой,
-- вместо фотографии устанавливается временная заглушка для последующей замены в staff-панели.
-- Тексты, особенности и характеристики добавляются на русском, английском и казахском языках.
-- Повторный запуск не создаёт дубликат и не перезаписывает уже отредактированные поля.

BEGIN;
SET LOCAL lock_timeout = '10s';
SET LOCAL search_path = public, pg_temp;

DO $preflight$
BEGIN
  IF to_regclass('public.products') IS NULL
     OR to_regclass('public.product_translations') IS NULL
     OR to_regclass('public.product_details') IS NULL
     OR to_regclass('public.product_features') IS NULL
     OR to_regclass('public.product_images') IS NULL THEN
    RAISE EXCEPTION 'Не найдены таблицы каталога. Сначала примените миграции Supabase.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'locale' AND e.enumlabel = 'kz'
  ) THEN
    RAISE EXCEPTION 'В enum locale отсутствует kz. Сначала примените казахскую миграцию каталога.';
  END IF;
END;
$preflight$;

CREATE TEMP TABLE sketo_linea_pb_x_context (
  product_id uuid PRIMARY KEY,
  was_created boolean NOT NULL
);

DO $product$
DECLARE
  matched_ids uuid[];
  matched_slugs text;
  target_id uuid;
  created boolean := false;
  image_placeholder text := 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"%3E%3Crect width="600" height="600" fill="%23f2f0eb"/%3E%3Cpath d="M300 220v160M220 300h160" stroke="%23ce1616" stroke-width="10"/%3E%3C/svg%3E';
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('sketo:import:la-marzocco-linea-pb-x'));

  SELECT array_agg(DISTINCT p.id), string_agg(DISTINCT p.slug, ', ' ORDER BY p.slug)
    INTO matched_ids, matched_slugs
  FROM public.products p
  LEFT JOIN public.product_translations tr ON tr.product_id = p.id
  WHERE p.type = 'equipment'
    AND (
      p.slug = 'la-marzocco-linea-pb-x'
      OR regexp_replace(lower(COALESCE(p.name, '')), '[^a-z0-9]+', '', 'g') = 'lineapbx'
      OR regexp_replace(lower(COALESCE(tr.name, '')), '[^a-z0-9]+', '', 'g') = 'lineapbx'
      OR regexp_replace(lower(COALESCE(tr.name, '')), '[^a-z0-9]+', '', 'g') = 'lamarzoccolineapbx'
    );

  IF COALESCE(array_length(matched_ids, 1), 0) > 1 THEN
    RAISE EXCEPTION 'Найдено несколько карточек Linea PB X: %. Объедините их вручную перед импортом.', matched_slugs;
  END IF;

  IF COALESCE(array_length(matched_ids, 1), 0) = 1 THEN
    target_id := matched_ids[1];
  ELSE
    INSERT INTO public.products (
      slug,
      type,
      status,
      editorial_state,
      name,
      price_display,
      price_amount,
      price_currency,
      image_url,
      brand,
      equipment_type,
      filters,
      sort_order,
      is_featured,
      is_published,
      published_at,
      archived_at
    )
    VALUES (
      'la-marzocco-linea-pb-x',
      'equipment',
      'preorder',
      'draft',
      'Linea PB X',
      NULL,
      NULL,
      'KZT',
      image_placeholder,
      'la-marzocco',
      'espresso-machine',
      ARRAY[]::text[],
      COALESCE((SELECT max(sort_order) + 1 FROM public.products WHERE type = 'equipment'), 0),
      false,
      false,
      NULL,
      NULL
    )
    RETURNING id INTO target_id;

    created := true;
  END IF;

  INSERT INTO sketo_linea_pb_x_context (product_id, was_created)
  VALUES (target_id, created);

  IF created THEN
    INSERT INTO public.product_images (product_id, url, sort_order, is_primary)
    VALUES (target_id, image_placeholder, 0, true);

    IF to_regclass('public.audit_logs') IS NOT NULL THEN
      INSERT INTO public.audit_logs (entity_type, entity_id, action, summary, diff)
      VALUES (
        'product',
        target_id,
        'create',
        'Импортирован черновик La Marzocco Linea PB X из материалов заказчика.',
        jsonb_build_object(
          'source', '20261006_linea_pb_x.sql',
          'status', 'preorder',
          'locales', jsonb_build_array('ru', 'en', 'kz')
        )
      );
    END IF;
  END IF;
END;
$product$;

INSERT INTO public.product_translations (
  product_id,
  locale,
  name,
  size,
  notes,
  description,
  category,
  status_label,
  seo_title,
  seo_description
)
SELECT
  context.product_id,
  source.locale::locale,
  source.name,
  NULL,
  NULL,
  source.description,
  source.category,
  source.status_label,
  source.seo_title,
  source.seo_description
FROM sketo_linea_pb_x_context context
CROSS JOIN (VALUES
  (
    'ru',
    'Linea PB X',
    'Профессиональная многобойлерная эспрессо-машина La Marzocco для кофеен с высокой нагрузкой. Независимое PID-управление кофейными и паровым бойлерами, экономичный режим, цифровой дисплей и светодиодная подсветка помогают поддерживать стабильный результат в течение смены.',
    'Профессиональная эспрессо-машина',
    'Под заказ',
    'La Marzocco Linea PB X — профессиональная эспрессо-машина',
    'Linea PB X на 2, 3 или 4 группы: независимый PID, изолированные бойлеры, eco mode, цифровой дисплей и профессиональные паровые краны.'
  ),
  (
    'en',
    'Linea PB X',
    'A professional multi-boiler La Marzocco espresso machine for high-volume coffee shops. Independent PID control of the coffee and steam boilers, eco mode, a digital display and LED barista lights help maintain consistent results throughout service.',
    'Professional espresso machine',
    'On request',
    'La Marzocco Linea PB X professional espresso machine',
    'Linea PB X in 2, 3 or 4 group configurations with independent PID control, insulated boilers, eco mode, digital display and professional steam wands.'
  ),
  (
    'kz',
    'Linea PB X',
    'Жүктемесі жоғары кофеханаларға арналған La Marzocco кәсіби көпбойлерлі эспрессо машинасы. Кофе және бу бойлерлерін тәуелсіз PID басқару, үнемді режим, цифрлық дисплей және жұмыс аймағының LED жарығы ауысым бойы тұрақты нәтиже алуға көмектеседі.',
    'Кәсіби эспрессо машинасы',
    'Тапсырыспен',
    'La Marzocco Linea PB X — кәсіби эспрессо машинасы',
    '2, 3 немесе 4 топты Linea PB X: тәуелсіз PID басқару, оқшауланған бойлерлер, эко режим, цифрлық дисплей және кәсіби бу түтіктері.'
  )
) AS source(locale, name, description, category, status_label, seo_title, seo_description)
ON CONFLICT (product_id, locale) DO NOTHING;

CREATE TEMP TABLE sketo_linea_pb_x_details (
  locale text NOT NULL,
  kind text NOT NULL,
  label text NOT NULL,
  value text NOT NULL,
  sort_order integer NOT NULL
);

INSERT INTO sketo_linea_pb_x_details (locale, kind, label, value, sort_order) VALUES
  ('ru', 'detail', 'Серия', 'Linea PB X', 0),
  ('ru', 'detail', 'Конфигурации', '2, 3 или 4 группы', 1),
  ('ru', 'detail', 'Управление', 'Независимый PID для кофейных и парового бойлеров', 2),
  ('ru', 'detail', 'Дополнительные опции', 'Встроенные весы ABR, подогрев чашек, высокие ножки и цвета RAL', 3),
  ('en', 'detail', 'Series', 'Linea PB X', 0),
  ('en', 'detail', 'Configurations', '2, 3 or 4 groups', 1),
  ('en', 'detail', 'Control', 'Independent PID control for coffee and steam boilers', 2),
  ('en', 'detail', 'Optional equipment', 'ABR integrated scales, cup warmer, high legs and RAL colours', 3),
  ('kz', 'detail', 'Сериясы', 'Linea PB X', 0),
  ('kz', 'detail', 'Конфигурациялар', '2, 3 немесе 4 топ', 1),
  ('kz', 'detail', 'Басқару', 'Кофе және бу бойлерлерін тәуелсіз PID басқару', 2),
  ('kz', 'detail', 'Қосымша опциялар', 'ABR кіріктірілген таразылары, кесе жылытқыш, биік аяқтар және RAL түстері', 3),

  ('ru', 'specification', 'Количество групп', '2 / 3 / 4', 0),
  ('ru', 'specification', 'Высота', '53,3 см (21″) — все версии', 1),
  ('ru', 'specification', 'Ширина', '2 группы — 71 см (28″); 3 группы — 95 см (38″); 4 группы — 119 см (47″)', 2),
  ('ru', 'specification', 'Глубина', '59 см (23″) — все версии', 3),
  ('ru', 'specification', 'Вес', '2 группы — 61 кг (135 lb); 3 группы — 77 кг (170 lb); 4 группы — 117 кг (258 lb)', 4),
  ('ru', 'specification', 'Напряжение', '200 В, 1 фаза; 220 В, 1 или 3 фазы; 380 В, 3 фазы', 5),
  ('ru', 'specification', 'Мощность (мин.)', '2 группы — 3350 Вт; 3 группы — 5830 Вт; 4 группы — 6930 Вт', 6),
  ('ru', 'specification', 'Мощность (макс.)', '2 группы — 5670 Вт; 3 группы — 7790 Вт; 4 группы — 9470 Вт', 7),
  ('ru', 'specification', 'Объём кофейных бойлеров', '2 группы — 2 × 1,3 л; 3 группы — 3 × 1,3 л; 4 группы — 2 × 3,4 л', 8),
  ('ru', 'specification', 'Объём парового бойлера', '2 группы — 7 л; 3 группы — 11 л; 4 группы — 15 л', 9),

  ('en', 'specification', 'Groups', '2 / 3 / 4', 0),
  ('en', 'specification', 'Height', '53.3 cm (21 in) — all versions', 1),
  ('en', 'specification', 'Width', '2 groups — 71 cm (28 in); 3 groups — 95 cm (38 in); 4 groups — 119 cm (47 in)', 2),
  ('en', 'specification', 'Depth', '59 cm (23 in) — all versions', 3),
  ('en', 'specification', 'Weight', '2 groups — 61 kg (135 lb); 3 groups — 77 kg (170 lb); 4 groups — 117 kg (258 lb)', 4),
  ('en', 'specification', 'Voltage', '200 V single phase; 220 V single or 3 phase; 380 V 3 phase', 5),
  ('en', 'specification', 'Wattage (min.)', '2 groups — 3350 W; 3 groups — 5830 W; 4 groups — 6930 W', 6),
  ('en', 'specification', 'Wattage (max.)', '2 groups — 5670 W; 3 groups — 7790 W; 4 groups — 9470 W', 7),
  ('en', 'specification', 'Coffee boiler capacity', '2 groups — 2 × 1.3 L; 3 groups — 3 × 1.3 L; 4 groups — 2 × 3.4 L', 8),
  ('en', 'specification', 'Steam boiler capacity', '2 groups — 7 L; 3 groups — 11 L; 4 groups — 15 L', 9),

  ('kz', 'specification', 'Топ саны', '2 / 3 / 4', 0),
  ('kz', 'specification', 'Биіктігі', '53,3 см (21″) — барлық нұсқа', 1),
  ('kz', 'specification', 'Ені', '2 топ — 71 см (28″); 3 топ — 95 см (38″); 4 топ — 119 см (47″)', 2),
  ('kz', 'specification', 'Тереңдігі', '59 см (23″) — барлық нұсқа', 3),
  ('kz', 'specification', 'Салмағы', '2 топ — 61 кг (135 lb); 3 топ — 77 кг (170 lb); 4 топ — 117 кг (258 lb)', 4),
  ('kz', 'specification', 'Кернеуі', '200 В, 1 фаза; 220 В, 1 немесе 3 фаза; 380 В, 3 фаза', 5),
  ('kz', 'specification', 'Қуаты (мин.)', '2 топ — 3350 Вт; 3 топ — 5830 Вт; 4 топ — 6930 Вт', 6),
  ('kz', 'specification', 'Қуаты (макс.)', '2 топ — 5670 Вт; 3 топ — 7790 Вт; 4 топ — 9470 Вт', 7),
  ('kz', 'specification', 'Кофе бойлерлерінің көлемі', '2 топ — 2 × 1,3 л; 3 топ — 3 × 1,3 л; 4 топ — 2 × 3,4 л', 8),
  ('kz', 'specification', 'Бу бойлерінің көлемі', '2 топ — 7 л; 3 топ — 11 л; 4 топ — 15 л', 9);

INSERT INTO public.product_details (product_id, locale, kind, label, value, sort_order)
SELECT
  context.product_id,
  source.locale::locale,
  source.kind::detail_kind,
  source.label,
  source.value,
  source.sort_order
FROM sketo_linea_pb_x_context context
CROSS JOIN sketo_linea_pb_x_details source
WHERE NOT EXISTS (
  SELECT 1
  FROM public.product_details existing
  WHERE existing.product_id = context.product_id
    AND existing.locale::text = source.locale
    AND existing.kind::text = source.kind
    AND lower(existing.label) = lower(source.label)
);

CREATE TEMP TABLE sketo_linea_pb_x_features (
  locale text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  sort_order integer NOT NULL
);

INSERT INTO sketo_linea_pb_x_features (locale, title, description, sort_order) VALUES
  ('ru', 'двойной PID (кофе и пар)', 'Позволяет независимо контролировать температуру кофейных бойлеров и парового бойлера.', 0),
  ('ru', 'эко-режим', 'Программируемый режим ожидания помогает снизить энергопотребление.', 1),
  ('ru', 'крышки групп Piero', 'Переработанные внутренние водяные каналы и расположение расходомера повышают температурную стабильность.', 2),
  ('ru', 'экономайзер горячей воды', 'Позволяет точно настроить температуру воды из крана для приготовления чая.', 3),
  ('ru', 'подсветка бариста', 'Светодиодная подсветка помогает контролировать экстракцию и чашку.', 4),
  ('ru', 'встроенные весы — только ABR', 'Точные весы в поддоне помогают повысить повторяемость приготовления.', 5),
  ('ru', 'индивидуальные цвета — специальный заказ', 'По запросу машину можно заказать в цвете по системе RAL.', 6),
  ('ru', 'изолированные бойлеры', 'Теплоизоляция снижает энергопотребление и помогает поддерживать стабильную температуру.', 7),
  ('ru', 'USB', 'USB-подключение позволяет обновлять прошивку машины.', 8),
  ('ru', 'паровые краны Pro Touch', 'Производительные паровые краны остаются прохладными снаружи во время работы.', 9),
  ('ru', 'цифровой дисплей', 'Интуитивное управление упрощает настройку параметров машины.', 10),
  ('ru', 'подогрев чашек — специальный заказ', 'Поддерживает равномерную температуру чашек для эспрессо и капучино.', 11),
  ('ru', 'высокие ножки — специальный заказ', 'Облегчают доступ к пространству под машиной.', 12),

  ('en', 'dual PID (coffee and steam)', 'Allows independent electronic control of coffee and steam boiler temperatures.', 0),
  ('en', 'eco mode', 'A programmable standby mode helps reduce energy consumption.', 1),
  ('en', 'Piero group caps', 'Re-engineered internal water paths and flow-meter positioning improve temperature stability.', 2),
  ('en', 'hot water economizer', 'Allows precise adjustment of tap-water temperature for tea.', 3),
  ('en', 'barista lights', 'LED lighting helps the barista focus on extraction and the cup.', 4),
  ('en', 'integrated scales — ABR only', 'Precision scales integrated in the drip tray improve consistency.', 5),
  ('en', 'personalized colours — special order', 'Custom RAL colours are available on request.', 6),
  ('en', 'insulated boilers', 'Insulation reduces energy consumption and contributes to temperature stability.', 7),
  ('en', 'USB', 'USB connectivity makes it possible to update the machine firmware.', 8),
  ('en', 'Pro Touch steam wands', 'High-performance steam wands remain cool to the touch during use.', 9),
  ('en', 'digital display', 'Intuitive controls make machine parameters easy to adjust.', 10),
  ('en', 'cup warmer — special order', 'Keeps espresso and cappuccino cups evenly heated.', 11),
  ('en', 'high legs — special order', 'Provide easier access underneath the machine.', 12),

  ('kz', 'қос PID (кофе және бу)', 'Кофе және бу бойлерлерінің температурасын тәуелсіз электронды басқаруға мүмкіндік береді.', 0),
  ('kz', 'эко режим', 'Бағдарламаланатын күту режимі энергия шығынын азайтуға көмектеседі.', 1),
  ('kz', 'Piero топ қақпақтары', 'Қайта жобаланған ішкі су арналары мен шығын өлшегішінің орналасуы температура тұрақтылығын арттырады.', 2),
  ('kz', 'ыстық су экономайзері', 'Шайға арналған кран суының температурасын дәл реттеуге мүмкіндік береді.', 3),
  ('kz', 'бариста жарығы', 'LED жарығы экстракцияны және кесені бақылауға көмектеседі.', 4),
  ('kz', 'кіріктірілген таразылар — тек ABR', 'Тамшы науасына кіріктірілген дәл таразылар нәтижелердің тұрақтылығын арттырады.', 5),
  ('kz', 'жеке түстер — арнайы тапсырыс', 'Сұрау бойынша машинаны RAL жүйесіндегі түспен тапсырыс беруге болады.', 6),
  ('kz', 'оқшауланған бойлерлер', 'Жылу оқшаулауы энергия шығынын азайтып, температура тұрақтылығын сақтауға көмектеседі.', 7),
  ('kz', 'USB', 'USB қосылымы машина бағдарламасын жаңартуға мүмкіндік береді.', 8),
  ('kz', 'Pro Touch бу түтіктері', 'Өнімділігі жоғары бу түтіктерінің сыртқы беті жұмыс кезінде салқын күйде қалады.', 9),
  ('kz', 'цифрлық дисплей', 'Түсінікті басқару машина параметрлерін оңай реттеуге мүмкіндік береді.', 10),
  ('kz', 'кесе жылытқыш — арнайы тапсырыс', 'Эспрессо мен капучино кеселерін біркелкі жылы ұстайды.', 11),
  ('kz', 'биік аяқтар — арнайы тапсырыс', 'Машинаның астындағы кеңістікке қол жеткізуді жеңілдетеді.', 12);

INSERT INTO public.product_features (product_id, locale, title, description, sort_order)
SELECT
  context.product_id,
  source.locale::locale,
  source.title,
  source.description,
  source.sort_order
FROM sketo_linea_pb_x_context context
CROSS JOIN sketo_linea_pb_x_features source
WHERE NOT EXISTS (
  SELECT 1
  FROM public.product_features existing
  WHERE existing.product_id = context.product_id
    AND existing.locale::text = source.locale
    AND lower(existing.title) = lower(source.title)
);

DO $validate$
DECLARE
  target_id uuid;
  translation_count integer;
  detail_count integer;
  specification_count integer;
  feature_count integer;
BEGIN
  SELECT product_id INTO target_id FROM sketo_linea_pb_x_context;

  SELECT count(*) INTO translation_count
  FROM public.product_translations
  WHERE product_id = target_id AND locale IN ('ru', 'en', 'kz');

  SELECT count(*) INTO detail_count
  FROM public.product_details
  WHERE product_id = target_id AND kind = 'detail' AND locale IN ('ru', 'en', 'kz');

  SELECT count(*) INTO specification_count
  FROM public.product_details
  WHERE product_id = target_id AND kind = 'specification' AND locale IN ('ru', 'en', 'kz');

  SELECT count(*) INTO feature_count
  FROM public.product_features
  WHERE product_id = target_id AND locale IN ('ru', 'en', 'kz');

  IF translation_count <> 3 THEN
    RAISE EXCEPTION 'Импорт неполный: ожидалось 3 перевода, найдено %.', translation_count;
  END IF;

  IF detail_count < 12 OR specification_count < 30 OR feature_count < 39 THEN
    RAISE EXCEPTION 'Импорт неполный: детали %, характеристики %, особенности %.', detail_count, specification_count, feature_count;
  END IF;
END;
$validate$;

COMMIT;

SELECT
  p.id,
  p.slug,
  p.name,
  p.status,
  p.editorial_state,
  p.is_published,
  context.was_created,
  (SELECT count(*) FROM public.product_translations tr WHERE tr.product_id = p.id) AS translations,
  (SELECT count(*) FROM public.product_details d WHERE d.product_id = p.id AND d.kind = 'detail') AS details,
  (SELECT count(*) FROM public.product_details d WHERE d.product_id = p.id AND d.kind = 'specification') AS specifications,
  (SELECT count(*) FROM public.product_features f WHERE f.product_id = p.id) AS features
FROM sketo_linea_pb_x_context context
JOIN public.products p ON p.id = context.product_id;
