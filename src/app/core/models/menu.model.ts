export interface MenuItem {
  id: string;
  name: string;
  bengaliName?: string;
  category: 'Biryani Specials' | 'Mughlai Curries & Chaap' | 'Tandoor & Starters' | 'Breads & Accompaniments' | 'Desserts & Beverages';
  description: string;
  price: number;
  isVegetarian: boolean;
  isBestseller?: boolean;
  isChefSpecial?: boolean;
  imageUrl?: string;
  spicinessLevel?: 1 | 2 | 3;
}

export const DADA_BOUDI_MENU: MenuItem[] = [
  // Biryani Specials
  {
    id: 'menu-1',
    name: 'Special Mutton Biryani (2 Pcs)',
    bengaliName: 'দাদা বৌদি স্পেশাল মটন বিরিয়ানি',
    category: 'Biryani Specials',
    description: 'The legendary Barrackpore special! Long-grain fragrant Basmati rice dum-cooked with two large, melt-in-mouth tender mutton pieces, royal ghee, saffron and the signature soft golden spiced potato.',
    price: 490,
    isVegetarian: false,
    isBestseller: true,
    isChefSpecial: true,
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
    spicinessLevel: 2
  },
  {
    id: 'menu-2',
    name: 'Dada Boudi Royal Mutton Biryani (1 Pc)',
    bengaliName: 'দাদা বৌদি রয়্যাল মটন বিরিয়ানি',
    category: 'Biryani Specials',
    description: 'Fragrant saffron basmati rice layered with one hearty mutton piece, signature spiced potato, boiled egg, slow dum-cooked to aromatic perfection.',
    price: 340,
    isVegetarian: false,
    isBestseller: true,
    imageUrl: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=600&auto=format&fit=crop&q=80',
    spicinessLevel: 2
  },
  {
    id: 'menu-3',
    name: 'Special Chicken Biryani (2 Pcs)',
    bengaliName: 'স্পেশাল চিকেন বিরিয়ানি',
    category: 'Biryani Specials',
    description: 'Aromatic basmati rice slow cooked in dum with two juicy tender chicken drumsticks, golden fried potato, boiled egg and exotic whole spices.',
    price: 360,
    isVegetarian: false,
    isBestseller: true,
    imageUrl: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=600&auto=format&fit=crop&q=80',
    spicinessLevel: 2
  },
  {
    id: 'menu-4',
    name: 'Kolkata Chicken Biryani (1 Pc)',
    bengaliName: 'কলকাতা চিকেন বিরিয়ানি',
    category: 'Biryani Specials',
    description: 'Classic single-piece chicken biryani with spiced potato and aromatic ghee-infused grains.',
    price: 260,
    isVegetarian: false,
    imageUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&auto=format&fit=crop&q=80',
    spicinessLevel: 2
  },

  // Mughlai Curries & Chaap
  {
    id: 'menu-5',
    name: 'Special Mutton Chaap',
    bengaliName: 'দাদা বৌদি মটন চাপ',
    category: 'Mughlai Curries & Chaap',
    description: 'Succulent mutton rib slow-roasted on a flat tawa with rich cashew paste, poppy seeds, charmagaz, saffron and rose essence. The quintessential accompaniment to biryani.',
    price: 330,
    isVegetarian: false,
    isBestseller: true,
    isChefSpecial: true,
    imageUrl: 'https://images.unsplash.com/photo-1545247181-516773cae7be?w=600&auto=format&fit=crop&q=80',
    spicinessLevel: 3
  },
  {
    id: 'menu-6',
    name: 'Special Chicken Chaap',
    bengaliName: 'স্পেশাল চিকেন চাপ',
    category: 'Mughlai Curries & Chaap',
    description: 'Marinated tender chicken slow-braised in aromatic nut paste, mace, nutmeg, and desi ghee gravy.',
    price: 240,
    isVegetarian: false,
    isBestseller: true,
    imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&auto=format&fit=crop&q=80',
    spicinessLevel: 2
  },
  {
    id: 'menu-7',
    name: 'Mutton Rezala',
    bengaliName: 'মটন রেজালা',
    category: 'Mughlai Curries & Chaap',
    description: 'Royal white gravy infused with dried whole red chillies, kewra, curd, cashew nut paste and gentle aromatic spices.',
    price: 350,
    isVegetarian: false,
    imageUrl: 'https://images.unsplash.com/photo-1545247181-516773cae7be?w=600&auto=format&fit=crop&q=80',
    spicinessLevel: 1
  },
  {
    id: 'menu-8',
    name: 'Shahi Paneer Mughlai',
    bengaliName: 'শাহী পনির মুঘলাই',
    category: 'Mughlai Curries & Chaap',
    description: 'Fresh malai paneer cubes simmered in velvety tomato, melon seed and cashew gravy scented with cardamom and kasoori methi.',
    price: 260,
    isVegetarian: true,
    imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80',
    spicinessLevel: 1
  },

  // Tandoor & Starters
  {
    id: 'menu-9',
    name: 'Mutton Galouti Kebab (4 Pcs)',
    bengaliName: 'মটন গালৌটি কাবাব',
    category: 'Tandoor & Starters',
    description: 'Silky smooth smoked mutton patties blended with 32 secret spices that literally melt on your tongue.',
    price: 380,
    isVegetarian: false,
    isChefSpecial: true,
    imageUrl: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80',
    spicinessLevel: 2
  },
  {
    id: 'menu-10',
    name: 'Murgh Malai Tikka (6 Pcs)',
    bengaliName: 'মুর্গ মালাই টিক্কা',
    category: 'Tandoor & Starters',
    description: 'Boneless chicken cubes marinated with fresh cream, cream cheese, hung curd, cardamom and charred in clay tandoor.',
    price: 320,
    isVegetarian: false,
    imageUrl: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80',
    spicinessLevel: 1
  },
  {
    id: 'menu-11',
    name: 'Paneer Tikka Shashlik',
    bengaliName: 'পনির টিক্কা শাসলিক',
    category: 'Tandoor & Starters',
    description: 'Cottage cheese cubes skewered with bell peppers, onions and roasted in tandoor with ajwain marinade.',
    price: 260,
    isVegetarian: true,
    imageUrl: 'https://images.unsplash.com/photo-1567184109-7243c3d526e8?w=600&auto=format&fit=crop&q=80',
    spicinessLevel: 2
  },

  // Breads & Accompaniments
  {
    id: 'menu-12',
    name: 'Butter Garlic Naan',
    category: 'Breads & Accompaniments',
    description: 'Freshly baked leavened flatbread brushed with garlic butter and fresh coriander.',
    price: 85,
    isVegetarian: true
  },
  {
    id: 'menu-13',
    name: 'Kashmiri Naan (Dry Fruit Stuffed)',
    category: 'Breads & Accompaniments',
    description: 'Sweet and savory naan stuffed with crushed almonds, cashews, raisins, and cherries.',
    price: 130,
    isVegetarian: true
  },
  {
    id: 'menu-14',
    name: 'Boondi Raita / Mixed Raita',
    category: 'Breads & Accompaniments',
    description: 'Cooling churned yogurt spiced with roasted cumin, rock salt, and crisp boondi pearls.',
    price: 80,
    isVegetarian: true
  },

  // Desserts & Beverages
  {
    id: 'menu-15',
    name: 'Kolkata Shahi Firni (In Clay Matka)',
    bengaliName: 'কলকাতার শাহী ফিরনি',
    category: 'Desserts & Beverages',
    description: 'Traditional slow-reduced ground rice pudding in earthen pots, infused with green cardamom, saffron, kewra water and slivered pistachios.',
    price: 90,
    isVegetarian: true,
    isBestseller: true,
    imageUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'menu-16',
    name: 'Gondhoraj Lemon Mojito',
    bengaliName: 'গন্ধরাজ লেবু মোহিতো',
    category: 'Desserts & Beverages',
    description: 'Refreshing cooler made with Bengal’s prized aromatic Gondhoraj lime, mint sprigs, black salt, and sparkling soda.',
    price: 110,
    isVegetarian: true,
    isBestseller: true
  }
];
