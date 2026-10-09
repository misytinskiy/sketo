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
 payload jsonb := $features$__PAYLOAD__$features$::jsonb;
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
