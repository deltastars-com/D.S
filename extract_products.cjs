
const fs = require('fs');

const productsFile = fs.readFileSync('./components/lib/vip/products.ts', 'utf8');

// Use a regex to extract the rawJsonData array content
const match = productsFile.match(/const rawJsonData = (\[[\s\S]*?\]);/);
if (!match) {
  console.error("Could not find rawJsonData");
  process.exit(1);
}

const rawJsonData = eval(match[1]); // Safe enough in this controlled environment

const mapCategory = (catAr, nameAr) => {
  const name = (nameAr || '').toLowerCase();
  const cat = (catAr || '').toLowerCase();

  if (cat.includes('القصيم') || cat.includes('تمور') || cat.includes('منوعة')) {
      if (name.includes('تمر') || name.includes('سكري') || name.includes('مجدول') || name.includes('صقعي') || 
          name.includes('مبروم') || name.includes('صفاوي') || name.includes('عنبر') || name.includes('عجوة') || 
          name.includes('رطب') || name.includes('خلاص')) {
          return 'dates';
      }
      if (name.includes('سلة') || name.includes('صندوق') || name.includes('بيض') || name.includes('عبوة') || name.includes('مغلف')) {
          return 'packages';
      }
      if (name.includes('زهور') || name.includes('ورد')) return 'flowers';
      if (name.includes('توت') || name.includes('جوز الهند') || name.includes('قصب سكر') || name.includes('أناناس')) return 'fruits';
      if (name.includes('فطر')) return 'seasonal';
      return 'qassim';
  }

  if (cat.includes('تمور')) return 'dates';
  if (cat.includes('الورقيات') || cat.includes('أعشاب')) return 'herbs';
  if (cat.includes('الفواكه')) return 'fruits';
  if (cat.includes('المستوردة والخاصة')) return 'seasonal';
  if (cat.includes('الأساسية والمحلية')) return 'vegetables';
  if (cat.includes('مكسرات')) return 'nuts';
  if (cat.includes('زهور')) return 'flowers';
  return 'vegetables';
};

const mapUnitArToEn = (unitAr) => {
    if (unitAr.includes('كيلو')) return 'Kg';
    if (unitAr.includes('حبة')) return 'Pc';
    if (unitAr.includes('عبوة')) return 'PK';
    if (unitAr.includes('كرتون')) return 'Ctn';
    if (unitAr.includes('طبق')) return 'Box';
    if (unitAr.includes('سلة')) return 'Basket';
    return 'Unit';
};

const processed = rawJsonData.slice(0, 91).map(item => ({
  name_ar: item.name_ar,
  name_en: item.name_en,
  category: mapCategory(item.category, item.name_ar),
  price: item.price,
  image: item.image_url,
  unit_ar: item.price_unit,
  unit_en: mapUnitArToEn(item.price_unit),
  description_ar: item.description,
  description_en: item.name_en + " - Institutional Supply Grade.",
  features_ar: item.features,
  features_en: "Premium quality, farm fresh, and institutional grade.",
  benefits_ar: "غني بالفيتامينات والمعادن، طبيعي 100%، يدعم الصحة العامة.",
  benefits_en: "Rich in vitamins and minerals, 100% natural, supports overall health.",
  origin_ar: item.origin,
  origin_en: item.origin === "مستورد" ? "Imported" : "KSA Local",
  stock_quantity: 1000
}));

console.log(JSON.stringify(processed, null, 2));
