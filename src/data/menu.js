// Default menu data for Beirut Bites.
// Prices, availability, images and new dishes are managed in the admin panel (/admin.html)
// and saved in Firestore. These values are only the defaults.

export const CATEGORIES = [
  {
    "id": "chicken",
    "icon": "🍗",
    "name": {
      "sv": "Kyckling",
      "en": "Chicken",
      "ar": "دجاج"
    },
    "options": {
      "spice": true,
      "extra": true
    }
  },
  {
    "id": "kebab",
    "icon": "🥙",
    "name": {
      "sv": "Kebab",
      "en": "Kebab",
      "ar": "كباب"
    },
    "options": {
      "spice": true,
      "extra": true
    }
  },
  {
    "id": "manakish",
    "icon": "🫓",
    "name": {
      "sv": "Manakish",
      "en": "Manakish",
      "ar": "مناقيش"
    },
    "options": {
      "spice": false,
      "extra": true
    }
  },
  {
    "id": "burger",
    "icon": "🍔",
    "name": {
      "sv": "Burgare",
      "en": "Burgers",
      "ar": "برغر"
    },
    "options": {
      "spice": true,
      "extra": true
    }
  },
  {
    "id": "potato",
    "icon": "🥔",
    "name": {
      "sv": "Bakad potatis",
      "en": "Baked Potato",
      "ar": "بطاطا مشوية"
    },
    "options": {
      "spice": true,
      "extra": true
    }
  },
  {
    "id": "pizza",
    "icon": "🍕",
    "name": {
      "sv": "Pizza",
      "en": "Pizza",
      "ar": "بيتزا"
    },
    "options": {
      "spice": false,
      "extra": true
    }
  },
  {
    "id": "piroger",
    "icon": "🥟",
    "name": {
      "sv": "Piroger",
      "en": "Pastries",
      "ar": "فطائر"
    },
    "options": {
      "spice": false,
      "extra": false
    }
  }
];

export const PRODUCTS = [
  {
    "id": "kyckling-rulle",
    "category": "chicken",
    "price": 70,
    "image": "images/kyckling-rulle.webp",
    "name": {
      "sv": "Kyckling Rulle",
      "en": "Chicken Wrap",
      "ar": "رول دجاج"
    },
    "description": {
      "sv": "Marinerad kyckling, vitlökssås, pickles & grönsaker",
      "en": "Marinated chicken, garlic sauce, pickles & veggies",
      "ar": "دجاج متبل، صلصة ثوم، مخللات وخضار"
    },
    "popular": true
  },
  {
    "id": "kyckling-baguette",
    "category": "chicken",
    "price": 80,
    "image": "images/kyckling-baguette.webp",
    "name": {
      "sv": "Kyckling Baguette",
      "en": "Chicken Baguette",
      "ar": "باغيت دجاج"
    },
    "description": {
      "sv": "Krispig baguette med kyckling, sallad & sås",
      "en": "Crispy baguette with chicken, salad & sauce",
      "ar": "باغيت مقرمش مع دجاج، سلطة وصلصة"
    }
  },
  {
    "id": "kyckling-irakiskt-brod",
    "category": "chicken",
    "price": 80,
    "image": "images/kyckling-irakiskt-brod.webp",
    "name": {
      "sv": "Kyckling Irakiskt Bröd",
      "en": "Chicken in Iraqi Bread",
      "ar": "دجاج بالخبز العراقي"
    },
    "description": {
      "sv": "Kyckling i traditionellt irakiskt bröd med grönsaker",
      "en": "Chicken in traditional Iraqi bread with veggies",
      "ar": "دجاج بالخبز العراقي التقليدي مع خضار"
    }
  },
  {
    "id": "kyckling-tallrik",
    "category": "chicken",
    "price": 100,
    "image": "images/kyckling-tallrik.webp",
    "name": {
      "sv": "Kyckling Tallrik",
      "en": "Chicken Plate",
      "ar": "صحن دجاج"
    },
    "description": {
      "sv": "Kycklingplatå med ris, sallad, hummus & bröd",
      "en": "Chicken plate with rice, salad, hummus & bread",
      "ar": "صحن دجاج مع أرز، سلطة، حمص وخبز"
    }
  },
  {
    "id": "kebab-rulle",
    "category": "kebab",
    "price": 100,
    "image": "images/kebab-rulle.webp",
    "name": {
      "sv": "Kebab Rulle",
      "en": "Kebab Wrap",
      "ar": "رول كباب"
    },
    "description": {
      "sv": "Saftig kebab i rulle med vitlökssås & grönsaker",
      "en": "Juicy kebab wrap with garlic sauce & veggies",
      "ar": "كباب طري بالرول مع صلصة ثوم وخضار"
    },
    "popular": true
  },
  {
    "id": "kebab-baguette",
    "category": "kebab",
    "price": 70,
    "image": "images/kebab-baguette.webp",
    "name": {
      "sv": "Kebab Baguette",
      "en": "Kebab Baguette",
      "ar": "باغيت كباب"
    },
    "description": {
      "sv": "Kebab i krispig baguette med sallad & sås",
      "en": "Kebab in crispy baguette with salad & sauce",
      "ar": "كباب بالباغيت المقرمش مع سلطة وصلصة"
    }
  },
  {
    "id": "kebab-irakiskt-brod",
    "category": "kebab",
    "price": 80,
    "image": "images/kebab-irakiskt-brod.webp",
    "name": {
      "sv": "Kebab Irakiskt Bröd",
      "en": "Kebab in Iraqi Bread",
      "ar": "كباب بالخبز العراقي"
    },
    "description": {
      "sv": "Kebab i irakiskt bröd med grönsaker & sås",
      "en": "Kebab in Iraqi bread with veggies & sauce",
      "ar": "كباب بالخبز العراقي مع خضار وصلصة"
    }
  },
  {
    "id": "kebab-tallrik",
    "category": "kebab",
    "price": 100,
    "image": "images/kebab-tallrik.webp",
    "name": {
      "sv": "Kebab Tallrik",
      "en": "Kebab Plate",
      "ar": "صحن كباب"
    },
    "description": {
      "sv": "Kebabplatå med ris, sallad, hummus & bröd",
      "en": "Kebab plate with rice, salad, hummus & bread",
      "ar": "صحن كباب مع أرز، سلطة، حمص وخبز"
    }
  },
  {
    "id": "manakish-ost",
    "category": "manakish",
    "price": 40,
    "image": "images/ost.webp",
    "name": {
      "sv": "Ost",
      "en": "Cheese",
      "ar": "جبنة"
    },
    "description": {
      "sv": "Klassisk manakish med smält ost",
      "en": "Classic manakish with melted cheese",
      "ar": "مناقيش كلاسيكية بالجبنة الذائبة"
    }
  },
  {
    "id": "manakish-zaatar",
    "category": "manakish",
    "price": 40,
    "image": "images/zaatar.webp",
    "name": {
      "sv": "Zaatar",
      "en": "Zaatar",
      "ar": "زعتر"
    },
    "description": {
      "sv": "Traditionell manakish med zaatar & olivolja",
      "en": "Traditional manakish with zaatar & olive oil",
      "ar": "مناقيش تقليدية بالزعتر وزيت الزيتون"
    },
    "popular": true
  },
  {
    "id": "manakish-kott",
    "category": "manakish",
    "price": 50,
    "image": "images/kott.webp",
    "name": {
      "sv": "Kött",
      "en": "Meat",
      "ar": "لحمة"
    },
    "description": {
      "sv": "Manakish med kryddat kött",
      "en": "Manakish with seasoned meat",
      "ar": "مناقيش باللحمة المتبلة"
    }
  },
  {
    "id": "manakish-muhammara",
    "category": "manakish",
    "price": 40,
    "image": "images/muhammara.webp",
    "name": {
      "sv": "Muhammara",
      "en": "Muhammara",
      "ar": "محمرة"
    },
    "description": {
      "sv": "Manakish med krämig muhammara av paprika & valnötter",
      "en": "Manakish with creamy pepper & walnut muhammara",
      "ar": "مناقيش بالمحمرة الكريمية من الفلفل والجوز"
    }
  },
  {
    "id": "manakish-mix-ost-kott",
    "category": "manakish",
    "price": 40,
    "image": "images/mix-ost-och-kott.webp",
    "name": {
      "sv": "Mix Ost & Kött",
      "en": "Cheese & Meat",
      "ar": "مكس جبنة ولحمة"
    },
    "description": {
      "sv": "Ost och kryddat kött i perfekt kombination",
      "en": "Cheese and seasoned meat in perfect combo",
      "ar": "جبنة ولحمة متبلة بتناغم مثالي"
    }
  },
  {
    "id": "manakish-mix-ost-zaatar",
    "category": "manakish",
    "price": 40,
    "image": "images/mix-ost-och-zaatar.webp",
    "name": {
      "sv": "Mix Ost & Zaatar",
      "en": "Cheese & Zaatar",
      "ar": "مكس جبنة وزعتر"
    },
    "description": {
      "sv": "Smält ost kombinerat med zaatar & olivolja",
      "en": "Melted cheese combined with zaatar & olive oil",
      "ar": "جبنة ذائبة مع زعتر وزيت زيتون"
    }
  },
  {
    "id": "manakish-mix-muhammara-ost",
    "category": "manakish",
    "price": 40,
    "image": "images/mix-muhammara-och-ost.webp",
    "name": {
      "sv": "Mix Muhammara & Ost",
      "en": "Muhammara & Cheese",
      "ar": "مكس محمرة وجبنة"
    },
    "description": {
      "sv": "Muhammara och smält ost tillsammans",
      "en": "Muhammara and melted cheese together",
      "ar": "محمرة مع جبنة ذائبة"
    }
  },
  {
    "id": "manakish-kushik",
    "category": "manakish",
    "price": 60,
    "image": "images/kushik.webp",
    "name": {
      "sv": "Kushik",
      "en": "Kishk",
      "ar": "كشك"
    },
    "description": {
      "sv": "Libanesisk kushik med ost & kryddor",
      "en": "Lebanese kushik with cheese & spices",
      "ar": "كشك لبناني مع جبنة وبهارات"
    }
  },
  {
    "id": "manakish-tomat-ost",
    "category": "manakish",
    "price": 40,
    "image": "images/tomat-och-ost.webp",
    "name": {
      "sv": "Tomat & Ost",
      "en": "Tomato & Cheese",
      "ar": "بندورة وجبنة"
    },
    "description": {
      "sv": "Färska tomater och smält ost",
      "en": "Fresh tomatoes and melted cheese",
      "ar": "بندورة طازجة مع جبنة ذائبة"
    }
  },
  {
    "id": "manakish-sujuk",
    "category": "manakish",
    "price": 50,
    "image": "images/sujuk.webp",
    "name": {
      "sv": "Sujuk",
      "en": "Sujuk",
      "ar": "سجق"
    },
    "description": {
      "sv": "Kryddig sujukkorv på manakish",
      "en": "Spicy sujuk sausage on manakish",
      "ar": "سجق حار على المناقيش"
    }
  },
  {
    "id": "manakish-sujuk-ost",
    "category": "manakish",
    "price": 60,
    "image": "images/sujuk-och-ost.webp",
    "name": {
      "sv": "Sujuk & Ost",
      "en": "Sujuk & Cheese",
      "ar": "سجق وجبنة"
    },
    "description": {
      "sv": "Sujuk med smält ost på manakish",
      "en": "Sujuk with melted cheese on manakish",
      "ar": "سجق مع جبنة ذائبة على المناقيش"
    }
  },
  {
    "id": "manakish-nutella",
    "category": "manakish",
    "price": 50,
    "image": "images/nutella.webp",
    "name": {
      "sv": "Nutella",
      "en": "Nutella",
      "ar": "نوتيلا"
    },
    "description": {
      "sv": "Söt manakish med varm Nutella",
      "en": "Sweet manakish with warm Nutella",
      "ar": "مناقيش حلوة بالنوتيلا الدافئة"
    }
  },
  {
    "id": "manakish-zaatar-labneh",
    "category": "manakish",
    "price": 50,
    "image": "images/zaatar-och-labneh.webp",
    "name": {
      "sv": "Zaatar & Labneh",
      "en": "Zaatar & Labneh",
      "ar": "زعتر ولبنة"
    },
    "description": {
      "sv": "Zaatar med krämig labneh",
      "en": "Zaatar with creamy labneh",
      "ar": "زعتر مع لبنة كريمية"
    }
  },
  {
    "id": "burger-libanesisk",
    "category": "burger",
    "price": 70,
    "image": "images/libanesisk-burgare.webp",
    "name": {
      "sv": "Libanesisk Burgare",
      "en": "Lebanese Burger",
      "ar": "برغر لبناني"
    },
    "description": {
      "sv": "Libanesiska kryddor, sallad & vitlökssås",
      "en": "Lebanese spices, salad & garlic sauce",
      "ar": "بهارات لبنانية، سلطة وصلصة ثوم"
    },
    "popular": true
  },
  {
    "id": "burger-mushroom",
    "category": "burger",
    "price": 70,
    "image": "images/mushroom-burgare.webp",
    "name": {
      "sv": "Mushroom Burgare",
      "en": "Mushroom Burger",
      "ar": "برغر فطر"
    },
    "description": {
      "sv": "Svamp, smält ost & tryffelaioli",
      "en": "Mushroom, melted cheese & truffle aioli",
      "ar": "فطر، جبنة ذائبة وأيولي الكمأة"
    }
  },
  {
    "id": "burger-barn",
    "category": "burger",
    "price": 50,
    "image": "images/barn-burgare.webp",
    "name": {
      "sv": "Barn Burgare",
      "en": "Kids Burger",
      "ar": "برغر أطفال"
    },
    "description": {
      "sv": "Mindre burgare perfekt för barn",
      "en": "Smaller burger perfect for kids",
      "ar": "برغر صغير مثالي للأطفال"
    }
  },
  {
    "id": "burger-menu",
    "category": "burger",
    "price": 100,
    "image": "images/hamburgare-meny.webp",
    "name": {
      "sv": "Hamburgare meny (pommes + dricka)",
      "en": "Burger Meal (fries + drink)",
      "ar": "وجبة برغر (بطاطا + مشروب)"
    },
    "description": {
      "sv": "Burgare med pommes frites & valfri dricka",
      "en": "Burger with fries & drink of choice",
      "ar": "برغر مع بطاطا مقلية ومشروب"
    }
  },
  {
    "id": "potato-korv",
    "category": "potato",
    "price": 80,
    "image": "images/potato-med-korv.webp",
    "name": {
      "sv": "Potato med Korv",
      "en": "Baked Potato with Sausage",
      "ar": "بطاطا مع نقانق"
    },
    "description": {
      "sv": "Bakad potatis med grillad korv & garneringar",
      "en": "Baked potato with grilled sausage & toppings",
      "ar": "بطاطا مشوية مع نقانق مشوية وإضافات"
    }
  },
  {
    "id": "potato-kyckling",
    "category": "potato",
    "price": 90,
    "image": "images/potato-med-kyckling.webp",
    "name": {
      "sv": "Potato med Kyckling",
      "en": "Baked Potato with Chicken",
      "ar": "بطاطا مع دجاج"
    },
    "description": {
      "sv": "Bakad potatis fylld med marinerad kyckling",
      "en": "Baked potato stuffed with marinated chicken",
      "ar": "بطاطا مشوية محشوة بدجاج متبل"
    }
  },
  {
    "id": "potato-kebab",
    "category": "potato",
    "price": 90,
    "image": "images/potato-med-kebab.webp",
    "name": {
      "sv": "Potato med Kebab",
      "en": "Baked Potato with Kebab",
      "ar": "بطاطا مع كباب"
    },
    "description": {
      "sv": "Bakad potatis med saftig kebab & sås",
      "en": "Baked potato with juicy kebab & sauce",
      "ar": "بطاطا مشوية مع كباب طري وصلصة"
    }
  },
  {
    "id": "potato-rakor",
    "category": "potato",
    "price": 90,
    "image": "images/potato-med-rakor.webp",
    "name": {
      "sv": "Potato med Räkor",
      "en": "Baked Potato with Shrimp",
      "ar": "بطاطا مع قريدس"
    },
    "description": {
      "sv": "Bakad potatis med räkor & citronaioli",
      "en": "Baked potato with shrimp & lemon aioli",
      "ar": "بطاطا مشوية مع قريدس وأيولي الليمون"
    }
  },
  {
    "id": "pizza-kyckling",
    "category": "pizza",
    "price": 100,
    "image": "images/kyckling-pizza.webp",
    "name": {
      "sv": "Kyckling Pizza",
      "en": "Chicken Pizza",
      "ar": "بيتزا دجاج"
    },
    "description": {
      "sv": "Pizza med marinerad kyckling & grönsaker",
      "en": "Pizza with marinated chicken & vegetables",
      "ar": "بيتزا مع دجاج متبل وخضار"
    }
  },
  {
    "id": "pizza-kebab",
    "category": "pizza",
    "price": 100,
    "image": "images/kebab-pizza.webp",
    "name": {
      "sv": "Kebab Pizza",
      "en": "Kebab Pizza",
      "ar": "بيتزا كباب"
    },
    "description": {
      "sv": "Pizza med saftig kebab, lök & sås",
      "en": "Pizza with juicy kebab, onion & sauce",
      "ar": "بيتزا مع كباب طري، بصل وصلصة"
    }
  },
  {
    "id": "pizza-roma",
    "category": "pizza",
    "price": 120,
    "image": "images/salami-pizza.webp",
    "name": {
      "sv": "Roma Pizza",
      "en": "Roma Pizza",
      "ar": "بيتزا روما"
    },
    "description": {
      "sv": "Italiensk-libanesisk fusion med premium toppings",
      "en": "Italian-Lebanese fusion with premium toppings",
      "ar": "مزيج إيطالي-لبناني مع إضافات فاخرة"
    }
  },
  {
    "id": "pizza-salami",
    "category": "pizza",
    "price": 100,
    "image": "images/salami-pizza.webp",
    "name": {
      "sv": "Salami Pizza",
      "en": "Salami Pizza",
      "ar": "بيتزا سلامي"
    },
    "description": {
      "sv": "Klassisk pizza med kryddig salami",
      "en": "Classic pizza with spicy salami",
      "ar": "بيتزا كلاسيكية بالسلامي الحار"
    }
  },
  {
    "id": "pizza-vegetariana",
    "category": "pizza",
    "price": 80,
    "image": "images/vegetariana-pizza.webp",
    "name": {
      "sv": "Vegetariana Pizza",
      "en": "Vegetarian Pizza",
      "ar": "بيتزا خضار"
    },
    "description": {
      "sv": "Färska grönsaker, oliver & mozzarella",
      "en": "Fresh vegetables, olives & mozzarella",
      "ar": "خضار طازجة، زيتون وموزاريلا"
    }
  },
  {
    "id": "pizza-margherita",
    "category": "pizza",
    "price": 80,
    "image": "images/margherita-pizza.webp",
    "name": {
      "sv": "Margherita Pizza",
      "en": "Margherita Pizza",
      "ar": "بيتزا مارغريتا"
    },
    "description": {
      "sv": "Tomatsås, mozzarella & färsk basilika",
      "en": "Tomato sauce, mozzarella & fresh basil",
      "ar": "صلصة بندورة، موزاريلا وريحان طازج"
    }
  },
  {
    "id": "pizza-sujuk",
    "category": "pizza",
    "price": 120,
    "image": "images/pizza-sujuk.webp",
    "name": {
      "sv": "Pizza Sujuk",
      "en": "Sujuk Pizza",
      "ar": "بيتزا سجق"
    },
    "description": {
      "sv": "Pizza med kryddig sujuk & smält ost",
      "en": "Pizza with spicy sujuk & melted cheese",
      "ar": "بيتزا بالسجق الحار والجبنة الذائبة"
    }
  },
  {
    "id": "piroger-nutella",
    "category": "piroger",
    "price": 8,
    "image": "images/nutella-piroger.webp",
    "name": {
      "sv": "Nutella-pirog",
      "en": "Nutella Pastry",
      "ar": "نوتيلا"
    },
    "description": {
      "sv": "Krispig pirog fylld med varm Nutella",
      "en": "Crispy pastry filled with warm Nutella",
      "ar": "فطيرة مقرمشة محشوة بنوتيلا دافئة"
    }
  },
  {
    "id": "piroger-kott-ost",
    "category": "piroger",
    "price": 8,
    "image": "images/kott-ost.webp",
    "name": {
      "sv": "Kött & Ost",
      "en": "Meat & Cheese Pastry",
      "ar": "لحمة وجبنة"
    },
    "description": {
      "sv": "Pirog med kryddat kött & smält ost",
      "en": "Pastry with seasoned meat & melted cheese",
      "ar": "فطيرة باللحمة المتبلة والجبنة الذائبة"
    }
  },
  {
    "id": "piroger-spenat-pizza",
    "category": "piroger",
    "price": 8,
    "image": "images/spenat.webp",
    "name": {
      "sv": "Spenat / Pizza",
      "en": "Spinach / Pizza Pastry",
      "ar": "سبانخ - بيتزا"
    },
    "description": {
      "sv": "Pirog med spenat & pizzafyllning",
      "en": "Pastry with spinach & pizza filling",
      "ar": "فطيرة بالسبانخ وحشوة البيتزا"
    }
  },
  {
    "id": "pirog-r2a2at-kebbe",
    "category": "piroger",
    "price": 15,
    "image": "images/r2a2at.webp",
    "name": {
      "sv": "Rkakat & Kibbeh",
      "en": "Rkakat & Kibbeh",
      "ar": "رقاقات كبة"
    },
    "description": {
      "sv": "Krispiga rkakat och kibbeh med kryddig köttfyllning",
      "en": "Crispy rkakat and kibbeh with spiced meat filling",
      "ar": "رقاقات وكبة مقرمشة بحشوة لحمة متبلة"
    }
  }
];

export const IMAGES = ["barn-burgare.webp","hamburgare-meny.webp","kebab-baguette.webp","kebab-irakiskt-brod.webp","kebab-pizza.webp","kebab-rulle.webp","kebab-tallrik.webp","kott-ost.webp","kott.webp","kushik.webp","kyckling-baguette.webp","kyckling-irakiskt-brod.webp","kyckling-pizza.webp","kyckling-rulle.webp","kyckling-tallrik.webp","libanesisk-burgare.webp","margherita-pizza.webp","mix-muhammara-och-ost.webp","mix-ost-och-kott.webp","mix-ost-och-zaatar.webp","muhammara.webp","mushroom-burgare.webp","nutella-piroger.webp","nutella.webp","ost.webp","pizza-sujuk.webp","potato-med-kebab.webp","potato-med-korv.webp","potato-med-kyckling.webp","potato-med-rakor.webp","r2a2at.webp","salami-pizza.webp","spenat.webp","sujuk-och-ost.webp","sujuk.webp","tomat-och-ost.webp","vegetariana-pizza.webp","zaatar-och-labneh.webp","zaatar.webp"];

export const DEFAULT_SETTINGS = {
  "truckOpen": true,
  "closedMessage": "",
  "hours": [
    {
      "open": "11:00",
      "close": "21:00"
    },
    {
      "open": "10:30",
      "close": "20:30"
    },
    {
      "open": "10:30",
      "close": "20:30"
    },
    {
      "open": "10:30",
      "close": "20:30"
    },
    {
      "open": "10:30",
      "close": "20:30"
    },
    {
      "open": "10:30",
      "close": "20:30"
    },
    {
      "open": "11:00",
      "close": "21:00"
    }
  ],
  "prepTime": "10–15",
  "special": {
    "enabled": true,
    "title": {
      "sv": "Dagens erbjudande",
      "en": "Today’s deal",
      "ar": "عرض اليوم"
    },
    "text": {
      "sv": "2x Manakish Zaatar för 60 kr — gäller hela dagen!",
      "en": "2x Manakish Zaatar for 60 kr — all day!",
      "ar": "2× مناقيش زعتر بـ 60 كرون — طوال اليوم!"
    }
  },
  "deal": {
    "enabled": true,
    "productId": "manakish-zaatar",
    "qty": 2,
    "price": 60
  },
  "extraPrice": 10,
  "stripePaymentLink": "",
  "products": null
};

const clone = (o) => JSON.parse(JSON.stringify(o));

export function slugify(s) {
    return String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

// Older settings point to images/Some Name.png — map them to the optimised .webp files.
export function resolveImage(path) {
    if (!path) return "";
    if (/^(https?:|data:)/.test(path)) return path;
    var m = String(path).match(/^images\/(.+)\.(png|jpe?g)$/i);
    if (m && !/^logo/.test(m[1])) return "images/" + slugify(m[1]) + ".webp";
    return path;
  }

// Accepts both the current settings format and the old settings.json format.
export function normalizeSettings(raw) {
    var d = clone(DEFAULT_SETTINGS);
    if (!raw || typeof raw !== "object") raw = {};
    var s = Object.assign(d, raw);

    if (!raw.special && ("specialEnabled" in raw || raw.specialTitle || raw.specialText)) {
      s.special = clone(DEFAULT_SETTINGS.special);
      if (raw.specialEnabled === false) s.special.enabled = false;
      if (raw.specialTitle) s.special.title = { sv: raw.specialTitle, en: raw.specialTitle, ar: raw.specialTitle };
      if (raw.specialText) s.special.text = { sv: raw.specialText, en: raw.specialText, ar: raw.specialText };
    }
    if ("deal" in raw) {
      if (!raw.deal) s.deal = Object.assign(clone(DEFAULT_SETTINGS.deal), { enabled: false });
      else if (raw.deal.enabled === undefined) s.deal = Object.assign({ enabled: true }, raw.deal);
    }
    if (!Array.isArray(s.hours) || s.hours.length !== 7) s.hours = clone(DEFAULT_SETTINGS.hours);

    var products = Array.isArray(raw.products) && raw.products.length ? clone(raw.products) : clone(PRODUCTS);
    if (raw.prices) products.forEach(function (p) { if (raw.prices[p.id] !== undefined) p.price = Number(raw.prices[p.id]); });
    if (raw.images) products.forEach(function (p) { if (raw.images[p.id]) p.image = raw.images[p.id]; });
    products.forEach(function (p) { p.image = resolveImage(p.image); });
    s.products = products;
    return s;
  }
