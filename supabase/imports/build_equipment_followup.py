"""Generate only the eight clarified models; never rewrites the earlier import."""
import json
import re
import build_equipment_import as b
from build_equipment_import import t, f, units as u, dimensions as dims
b.ITEMS.clear()
b.CATEGORIES['accessory'] = t('Аксессуар', 'Accessory', 'Керек-жарақ')
b.LABELS['versions'] = t('Варианты исполнения', 'Available configurations', 'Орындалу нұсқалары')
b.LABELS['heating'] = t('Система нагрева', 'Heating system', 'Жылыту жүйесі')
def feature(title, ru, en, kz):
    return f(t(title, title, title), t(ru, en, kz))
def add(slug,name,brand,overview,details,specs,features,sources,aliases=(),note='',kind='espresso-machine'):
    b.add(slug,name,brand,kind,overview,details,specs,features,sources,'Уточнения пользователя от 07.10.2026',aliases,note)
def variant(a,c,unit):
    av,cv=u(a,unit),u(c,unit)
    return t(f'2 группы: {av["ru"]}; 3 группы: {cv["ru"]}',f'2 groups: {av["en"]}; 3 groups: {cv["en"]}',f'2 топ: {av["kz"]}; 3 топ: {cv["kz"]}')
VERSIONS=t('2 или 3 группы','2 or 3 groups','2 немесе 3 топ')
PID=feature('PID','Электронная регулировка температуры заваривания.','Electronic brewing temperature control.','Демдеу температурасын электронды реттеу.')
NEO=feature('NEO','Нагревает необходимый для приготовления объём воды.','Heats the water needed for brewing.','Демдеуге қажетті су көлемін қыздырады.')
TERS=feature('TERS','Возвращает тепло отработанной воды для предварительного нагрева.','Recovers heat from waste water for preheating.','Алдын ала қыздыру үшін пайдаланылған судың жылуын қайта қолданады.')
KB='https://au.lamarzocco.com/wp-content/uploads/2024/02/data_sheet_KB90-EN.pdf'
add('la-marzocco-kb90','KB90','la-marzocco',
 t('Профессиональная серия с прямой установкой портафильтра и независимыми кофейными бойлерами. Для быстрого обслуживания в загруженном баре.','A commercial range with straight-in portafilters and independent coffee boilers for busy café service.','Портафильтрі тікелей орнатылатын, тәуелсіз кофе бойлерлері бар кәсіби серия. Қарқынды қызмет көрсетуге арналған.'),
 [('series','KB90'),('versions',VERSIONS),('use',b.ESPRESSO)],
 [('height',u(450,'mm')),('width',variant(810,1050,'mm')),('depth',u(620,'mm')),('weight',variant(77,101,'kg')),('power',t('2 группы: 5700 Вт; 3 группы: 7800 Вт (220/380 В)','2 groups: 5700 W; 3 groups: 7800 W (220/380 V)','2 топ: 5700 Вт; 3 топ: 7800 Вт (220/380 В)')),('coffee',variant('2 × 1.3','3 × 1.3','L')),('steam',variant(7,11,'L'))],
 [feature('Straight-In','Портафильтр устанавливается без поворота рукоятки.','Insert the portafilter without twisting the handle.','Портафильтр тұтқаны бұрамай орнатылады.'),feature('Steam Flush','Пар и вода промывают группу после приготовления.','Steam and water rinse the group after brewing.','Дайындаудан кейін бу мен су топты шаяды.'),PID,f(t('независимые бойлеры','independent boilers','тәуелсіз бойлерлер'),t('Отдельная температура для каждой группы.','Set each group temperature separately.','Әр топтың температурасы бөлек реттеледі.'))],
 [KB,'https://www.lamarzocco.com/fr/en/commercial-products/espresso-machines/kb90/'],aliases=['La Marzocco KB90'],note='Серия, не конкретная 2GR/3GR или AV/ABR. Ширина 3GR 1050 мм — по указанному официальному PDF. ABR не объявлен стандартом.')
for model,diam,h,w,d,weight,power,hopper in [('E65W',65,620,195,283,12.2,440,1200),('E80W',80,630,240,340,18,520,1800)]:
    add('mahlkonig-'+model.lower()+'-gbs',model+' GbS','mahlkonig',
     t('Эспрессо-кофемолка с дозированием по весу и электрической регулировкой помола. Система Sync связывает её с совместимым оборудованием.','An espresso grinder with weight-based dosing, electric grind adjustment and Sync connectivity for compatible equipment.','Салмақ бойынша мөлшерлейтін, ұнтақтауы электрмен реттелетін эспрессо тартқышы. Sync жүйесі үйлесімді жабдықпен байланыстырады.'),
     [('series',model+' GbS'),('burr_type',b.FLAT),('control',b.WEIGHED)],
     dims(h,w,d)+[('weight',u(weight,'kg')),('power50',u(power,'W')),('burrs',u(diam,'mm')),('hopper',u(hopper,'g')),('rpm50',u(1400,'rpm'))],
     ['gbw',feature('Grind-by-Sync','Синхронизация с совместимой машиной или Sync-устройством.','Synchronizes with a compatible machine or Sync device.','Үйлесімді машинамен немесе Sync құрылғысымен синхрондалады.'),f(t('электрическая регулировка','electric adjustment','электрлік реттеу'),t('Мотор изменяет расстояние между жерновами.','A motor adjusts the burr spacing.','Мотор диірмен тастарының арақашықтығын реттейді.')),f(t('калибровка нуля','zero calibration','нөлді калибрлеу'),t('Настройка с экрана без инструментов.','Calibrate from the display without tools.','Құралсыз экран арқылы калибрленеді.'))],
     ['https://www.mahlkoenig.com/products/'+model.lower()+'-grind-by-sync'],aliases=['Mahlkönig '+model[:3]+' GBS',model[:3]+' GBS'],kind='grinder',note='GbS подтверждено ссылкой пользователя. E80W GbS не является ранее добавленной E80S GbW. Электрические параметры для 220–240 В / 50 Гц.')
VA='https://victoriaarduino.com/en/products-machines/'
add('victoria-arduino-eagle-one-2-group','Eagle One 2 Group','victoria-arduino',
 t('Двухгрупповая кофемашина с системой нагрева NEO и сенсорным управлением. Компактный корпус подходит для открытой кофейной стойки.','A two-group machine with NEO heating and touch controls in a compact body for an open coffee bar.','NEO жылыту жүйесі және сенсорлық басқаруы бар екі топты кофемашина. Ықшам корпусы ашық кофе барына ыңғайлы.'),
 [('series','Eagle One'),('groups','2'),('use',b.ESPRESSO)],dims(437,758,576)+[('power',u(5000,'W')),('groups','2')],
 [NEO,TERS,'touch',feature('Cool Touch','Изолированные паровые трубки удобны при работе с молоком.','Insulated steam wands support milk preparation.','Оқшауланған бу түтіктері сүтпен жұмысқа ыңғайлы.')],
 [VA+'eagle-one/'],aliases=['Victoria Arduino Eagle One'],note='2 группы подтверждены пользователем. Данные текущей официальной страницы. EasyCream и VIS не включены без подтверждения комплектации; вес/бойлеры не выдуманы.')
add('victoria-arduino-eagle-tempo-neo-2-group','Eagle Tempo Neo 2 Group','victoria-arduino',
 t('Двухгрупповая Eagle Tempo Neo с многобойлерной системой нагрева и цифровым управлением. Для последовательного приготовления кофе и молочных напитков.','A two-group Eagle Tempo Neo with multi-boiler heating and digital controls for coffee and milk drinks.','Көп бойлерлі жылыту жүйесі және цифрлық басқаруы бар екі топты Eagle Tempo Neo. Кофе мен сүтті сусындарға арналған.'),
 [('series','Eagle Tempo Neo'),('groups','2'),('use',b.ESPRESSO)],dims(416,825,650)+[('weight',u(62,'kg')),('heating','NEO')],
 [NEO,'touch',f(t('автоматическая промывка','automatic purge','автоматты шаю'),t('Промывка помогает поддерживать рабочий цикл.','Automatic purging supports the service workflow.','Автоматты шаю жұмыс барысын жеңілдетеді.')),f(t('подсветка групп','group lighting','топтарды жарықтандыру'),t('Освещает рабочую область перед группами.','Illuminates the working area in front of the groups.','Топтардың алдындағы жұмыс аймағын жарықтандырады.'))],
 [VA+'eagle-tempo/'],aliases=['Victoria Arduino Eagle Tempo 2gr','Eagle Tempo 2gr'],note='Конфликт: пользователь сообщил 3200 Вт / 11 л; текущая официальная таблица Neo 2GR показывает 6000/7400 Вт / 8 л, а Digit 11–17 л. Мощность и ёмкость исключены до получения шильдика/паспорта конкретного исполнения.')
add('victoria-arduino-black-eagle-maverick-gravitech','Black Eagle Maverick Gravitech','victoria-arduino',
 t('Black Eagle Maverick с гравиметрическим дозированием и контролем температуры T3 Genius. Для точной работы с рецептами эспрессо.','Black Eagle Maverick with gravimetric dosing and T3 Genius temperature control for precise espresso recipes.','Гравиметриялық мөлшерлеуі және T3 Genius температура бақылауы бар Black Eagle Maverick. Дәл эспрессо рецепттеріне арналған.'),
 [('series','Black Eagle Maverick'),('versions',VERSIONS),('control',b.WEIGHED)],
 [('height',u(426,'mm')),('width',variant(806,1056,'mm')),('depth',u(682,'mm')),('weight',variant(90,115,'kg')),('power',variant(6800,8600,'W'))],
 [feature('Gravitech','Вес напитка отображается на дисплее группы.','The group display shows beverage weight.','Топ дисплейі сусын салмағын көрсетеді.'),feature('T3 Genius','Точная настройка температуры заваривания.','Precise brewing temperature settings.','Демдеу температурасын дәл баптау.'),TERS,feature('PureBrew','Дополнительный способ приготовления кофе и настоев.','An additional brewing method for coffee and infusions.','Кофе мен тұнбаларды дайындаудың қосымша тәсілі.')],
 [VA+'black-eagle-maverick/'],aliases=['Victoria Arduino Maverick','Victoria Arduino Black Eagle Maverick'],note='Gravitech подтверждено пользователем; группы не выбраны. Текущая страница: 426×682 мм высота/глубина, 6800/8600 Вт. Более ранние 433×745 мм и 6900/8700 Вт не смешивались с текущей версией. Не Maverick Core.')
add('modbar-espresso-av-1-group','Modbar Espresso AV 1 Group','modbar',
 t('Одногрупповая эспрессо-система с подстольным модулем и объёмным дозированием. Открытая компоновка оставляет больше пространства над стойкой.','A single-group espresso system with an under-counter module and volumetric dosing for an open counter layout.','Үстел асты модулі және көлемдік мөлшерлеуі бар бір топты эспрессо жүйесі. Ашық құрылымы үстел үстіндегі орынды босатады.'),
 [('series','Espresso AV'),('groups','1'),('control',b.VOLUMETRIC)],
 [('module_dims',u('430 × 380 × 220','mm')),('tap_dims',u('140 × 320 × 360','mm')),('module_weight',u(16.5,'kg')),('tap_weight',u(10.5,'kg')),('boiler',u(1.4,'L')),('power',t('1545 Вт (208–240 В)','1545 W (208–240 V)','1545 Вт (208–240 В)'))],
 ['volumetric',PID,f(t('программируемый рычаг','programmable lever','бағдарламаланатын тұтқа'),t('Четыре положения для управления приготовлением.','Four positions control brewing.','Төрт қалып дайындауды басқарады.')),f(t('таймер пролива','shot timer','су беру таймері'),t('Дисплей показывает время приготовления.','The display shows brewing time.','Дисплей дайындау уақытын көрсетеді.'))],
 ['https://modbar.com/wp-content/uploads/free/ESPRESSO-AV-SYSTEM/Brochure-Modbar-Espresso-AV.pdf'],aliases=['Modbar Espresso AV'],note='MOD 1 GR, не двухгрупповой модуль с одним подключённым краном. Размеры/масса модуля и крана разделены. Состав поставки и ABR не заявлены.')
add('modbar-single-drip-tray','Modbar Single Drip Tray','modbar',
 t('Одинарный поддон для сбора капель в рабочей зоне Modbar. Дополняет открытую компоновку кофейной стойки.','A single drip tray for the Modbar work area, complementing an open coffee counter.','Modbar жұмыс аймағындағы тамшыларды жинайтын бірлік науа. Ашық кофе үстелін толықтырады.'),
 [('series','Single Drip Tray'),('format',t('Одинарный поддон','Single drip tray','Бірлік науа')),('use',t('Сбор капель','Drip collection','Тамшыларды жинау'))],
 [('compatibility','Modbar'),('format',t('Поддон для капель','Drip tray','Тамшы науасы'))],
 [f(t('рабочая зона Modbar','Modbar work area','Modbar жұмыс аймағы'),t('Поддон собирает капли под зоной приготовления.','Collects drips beneath the brewing area.','Дайындау аймағының астындағы тамшыларды жинайды.')),f(t('единый дизайн','coordinated design','үйлесімді дизайн'),t('Сочетается с открытой компоновкой Modbar.','Complements the open Modbar layout.','Modbar ашық құрылымымен үйлеседі.'))],
 ['https://modbar.com/complementary-products/'],kind='accessory',note='433×1056×745 не подтверждены для поддона и исключены. Точный артикул и чертёж нужны для габаритов; не назначены размеры поддона с ринзером, ABR, материал и комплектность.')

if __name__=='__main__':
    assert len(b.ITEMS)==8
    for p in b.ITEMS:
        for locale,tr in p['translations'].items():
            assert len(tr['details'])==4
            assert tr['features'] and tr['specifications']
            assert len(tr['seo_title'])<=100 and len(tr['seo_description'])<=180,(p['slug'],locale)
            if locale=='en': assert not re.search('[а-яА-ЯёЁ]',json.dumps(tr,ensure_ascii=False))
    template=(b.ROOT/'equipment_import.template.sql').read_text()
    template=template.replace('build_equipment_import.py','build_equipment_followup.py').replace('22 candidate','8 candidate').replace('<> 22','<> 8')
    template=template.replace('20261007_equipment_catalog.sql','20261007_equipment_followup.sql').replace('20261007_equipment_sources.md / 20261007_equipment_README.md','20261007_equipment_followup_README.md')
    template=template.replace('20261007010000_equipment_catalog_types.sql','20261007020000_equipment_accessory_type.sql')
    template=template.replace("('equipment_type','steam-module')","('equipment_type','steam-module'), ('equipment_type','accessory')")
    # Retain the shared advisory lock so the two imports cannot append ordering concurrently.
    (b.ROOT/'20261007_equipment_followup.sql').write_text(template.replace('__EQUIPMENT_JSON__',json.dumps(b.ITEMS,ensure_ascii=False,indent=2)))
    ledger=['# Дополнение оборудования — 07.10.2026','','8 новых карточек, русский / английский / казахский. Предыдущие 22 карточки не изменяются. Linea Classic AV 2GR исключена.','','## Применение','','1. Отдельным запуском выполнить и завершить `../migrations/20261007020000_equipment_accessory_type.sql`. Предыдущая миграция типов уже должна быть применена.','2. Выполнить целиком `20261007_equipment_followup.sql`. Старый импорт повторять не нужно.','3. Карточки появятся в админке как черновики, без цен, с временной заглушкой. Добавить фото, выбрать главное, удалить заглушку, проверить статус и опубликовать.','4. Обновлённый код поддерживает тип «Аксессуар». Перед редактированием поддона на опубликованном сайте нужно развернуть эти изменения.','','Повторный запуск пропускает совпадения целиком: тексты, фото, цены и состояние сохраняются. Неоднозначное совпадение отменяет весь импорт. SQL не исполнялся в рабочей базе.','Статус «Под заказ» — редакционное значение по умолчанию, не проверенное наличие.','','## Источники и решения','']
    for p in b.ITEMS:
        ledger += ['### '+p['name'],'',p['note'],'']+[f'- {url}' for url in p['sources']]+['']
    ledger += ['## Вопросы ответственным','','- Eagle Tempo Neo 2GR: пришлите шильдик или паспорт именно поставляемой версии. Какие мощность и объём парового бойлера верны: заявленные 3200 Вт / 11 л или данные текущей страницы Neo?','- Modbar Single Drip Tray: какой артикул и реальные габариты в мм (Ш × Г × В)? Есть ли чертёж? Значения 433×1056×745 пока не внесены.','- KB90 и Black Eagle Maverick: какие группы и исполнение поставляются? Пока это карточки серий с явно разделёнными параметрами вариантов. Для Maverick также подтвердите поколение: на текущем сайте характеристики отличаются от старых брошюр.','']
    (b.ROOT/'20261007_equipment_followup_README.md').write_text('\n'.join(ledger))
    print('Generated eight follow-up cards / 24 translations.')
