import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as url from 'url';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://svkgxzasjudavtrxvtbu.supabase.co';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_QiAXJ7B_-MjecGD4f9pSyQ_VxmqSkh7';

const supabase = createClient(supabaseUrl, anonKey);

// We need the data. Let's just hardcode the data from pizzas.ts to avoid TS import issues
const LOCAL_PIZZAS = [
  {
    id: 1, name: 'Margherita', slug: 'margherita', category: 'Classic',
    description: 'A timeless Italian classic with a golden crust, rich tomato base, and creamy mozzarella. Finished with fresh basil leaves straight from the garden.',
    ingredients: ['Tomato Base', 'Mozzarella', 'Fresh Basil', 'Olive Oil'],
    tags: ['Vegetarian', 'Bestseller'], thumbnail_url: '/images/margherita.webp', model_path: '/models/margherita.glb',
    price_small: 750, price_medium: 1000, price_large: 2300
  },
  {
    id: 2, name: 'Diavola', slug: 'diavola', category: 'Spicy',
    description: 'A bold and fiery pizza loaded with spicy salami and chili flakes that pack serious heat. Balanced with creamy mozzarella and a robust tomato base.',
    ingredients: ['Tomato Base', 'Spicy Salami', 'Chili Flakes', 'Mozzarella'],
    tags: ['Spicy', 'Hot'], thumbnail_url: '/images/diavola.webp', model_path: '/models/diavola.glb',
    price_small: 800, price_medium: 1100, price_large: 2400
  },
  {
    id: 3, name: 'BBQ Beef', slug: 'bbq-beef', category: 'Meat Lovers',
    description: 'A hearty meat lovers dream topped with smoky BBQ sauce, tender beef strips, and caramelized red onion. Finished with melted cheddar for a rich, satisfying bite.',
    ingredients: ['BBQ Sauce', 'Beef Strips', 'Red Onion', 'Cheddar', 'Oregano'],
    tags: ['Bestseller', 'Meat Lovers'], thumbnail_url: '/images/bbq-beef.webp', model_path: '/models/bbq-beef.glb',
    price_small: 900, price_medium: 1300, price_large: 2500
  },
  {
    id: 4, name: 'Garden Fresh', slug: 'garden-fresh', category: 'Veggie',
    description: 'A vibrant celebration of garden vegetables with roasted peppers, zucchini, and Kalamata olives. Topped with crumbled Greek feta for a Mediterranean twist.',
    ingredients: ['Roasted Peppers', 'Zucchini', 'Olives', 'Feta Cheese', 'Tomato Base'],
    tags: ['Vegetarian', 'Healthy'], thumbnail_url: '/images/garden-fresh.webp', model_path: '/models/garden-fresh.glb',
    price_small: 750, price_medium: 1000, price_large: 2200
  },
  {
    id: 5, name: 'Pepperoni Feast', slug: 'pepperoni-feast', category: 'Meat Lovers',
    description: 'Double the pepperoni, double the flavor — a generously loaded pizza with two layers of crispy pepperoni slices. Seasoned with oregano and melted mozzarella throughout.',
    ingredients: ['Double Pepperoni', 'Mozzarella', 'Oregano', 'Tomato Base'],
    tags: ['Bestseller', 'Classic Favorite'], thumbnail_url: '/images/pepperoni-feast.webp', model_path: '/models/pepperoni-feast.glb',
    price_small: 850, price_medium: 1200, price_large: 2400
  },
  {
    id: 6, name: 'Truffle Mushroom', slug: 'truffle-mushroom', category: "Chef's Special",
    description: "Our chef's signature creation featuring fragrant truffle oil drizzled over a medley of wild forest mushrooms. Finished with shaved parmesan for an indulgent, earthy experience.",
    ingredients: ['Truffle Oil', 'Wild Mushrooms', 'Parmesan', 'Cream Base', 'Thyme'],
    tags: ['Chef Special', 'Premium'], thumbnail_url: '/images/truffle-mushroom.webp', model_path: '/models/truffle-mushroom.glb',
    price_small: 950, price_medium: 1400, price_large: 2500
  },
  {
    id: 7, name: 'Hot Chicken', slug: 'hot-chicken', category: 'Spicy',
    description: 'Tender grilled chicken slices glazed in fiery hot sauce with fresh jalapeños that bring the heat. Melted mozzarella cools every bite just enough to keep you coming back.',
    ingredients: ['Grilled Chicken', 'Jalapeños', 'Hot Sauce', 'Mozzarella', 'Red Onion'],
    tags: ['Spicy', 'Hot', 'Protein Rich'], thumbnail_url: '/images/hot-chicken.webp', model_path: '/models/hot-chicken.glb',
    price_small: 850, price_medium: 1200, price_large: 2400
  },
  {
    id: 8, name: 'Napolitana', slug: 'napolitana', category: 'Classic',
    description: 'A traditional Neapolitan style pizza with salty anchovies, briny capers, and plump Kalamata olives on a rustic tomato base. Bold Mediterranean flavors in every slice.',
    ingredients: ['Anchovies', 'Capers', 'Tomato Base', 'Kalamata Olives', 'Mozzarella'],
    tags: ['Classic', 'Traditional'], thumbnail_url: '/images/napolitana.webp', model_path: '/models/napolitana.glb',
    price_small: 750, price_medium: 1050, price_large: 2300
  }
];

async function sync() {
  console.log('🔄 Syncing local data to Supabase (supporting both schemas)...');

  // Insert categories first
  const categories = ['Classic', 'Spicy', 'Meat Lovers', 'Veggie', "Chef's Special"];
  for (const c of categories) {
    await supabase.from('categories').upsert({ name: c, sort_order: 1 }, { onConflict: 'name' });
  }

  for (const pizza of LOCAL_PIZZAS) {
    // We try to upsert into pizzas. We map new properties to old schema columns just in case.
    const payload = {
      slug: pizza.slug,
      name: pizza.name,
      category: pizza.category,
      description: pizza.description,
      toppings: pizza.ingredients,      // old schema
      ingredients: pizza.ingredients,   // new schema (if it exists, if not supabase might ignore or error, wait, if it errors we have to handle it)
      image_url: pizza.thumbnail_url,   // old schema
      thumbnail_url: pizza.thumbnail_url, // new schema
      model3d_url: pizza.model_path,    // old schema
      model_path: pizza.model_path,     // new schema
      offer_price: pizza.price_small,   // old schema fallback
      price_small: pizza.price_small,   // new schema
      price_medium: pizza.price_medium, // new schema
      price_large: pizza.price_large,   // new schema
      tags: pizza.tags,
      active: true
    };

    // To be safe against "column does not exist", we insert only fields that we KNOW exist.
    // Let's do a SELECT first to see what columns exist.
    const { data: cols } = await supabase.from('pizzas').select('*').limit(1);
    const existingPizzaKeys = cols && cols.length > 0 ? Object.keys(cols[0]) : [];
    
    // Filter payload based on existing columns in DB to prevent crashing
    const safePayload = {};
    if (existingPizzaKeys.length === 0) {
      // If table is completely empty, we can't know the schema easily from a select. We will assume the old schema for safety or try upserting with both.
      // Actually we can just do a test insert and catch the error.
    }

    // Let's just build safePayload manually based on old schema, if it fails we do new schema.
    try {
       const { error, data: insertedPizza } = await supabase.from('pizzas').upsert({
          slug: pizza.slug,
          name: pizza.name,
          category: pizza.category,
          description: pizza.description,
          toppings: pizza.ingredients,
          image_url: pizza.thumbnail_url,
          model3d_url: pizza.model_path,
          original_price: pizza.price_medium,
          offer_price: pizza.price_small,
          active: true
       }, { onConflict: 'slug' }).select('id').single();

       if (error) {
         // Maybe it's the new schema?
         const { error: newErr, data: insertedPizzaNew } = await supabase.from('pizzas').upsert({
            slug: pizza.slug,
            name: pizza.name,
            category: pizza.category,
            description: pizza.description,
            ingredients: pizza.ingredients,
            thumbnail_url: pizza.thumbnail_url,
            model_path: pizza.model_path,
            price_small: pizza.price_small,
            price_medium: pizza.price_medium,
            price_large: pizza.price_large,
            tags: pizza.tags,
         }, { onConflict: 'slug' }).select('id').single();

         if (newErr) {
             console.error(`❌ Failed to upsert ${pizza.name}:`, newErr);
             continue;
         } else {
             console.log(`✅ Upserted (New Schema): ${pizza.name}`);
         }
       } else {
         console.log(`✅ Upserted (Old Schema): ${pizza.name}`);
         const pizzaId = insertedPizza.id;
         // For old schema, insert into pizza_sizes
         await supabase.from('pizza_sizes').upsert([
            { pizza_id: pizzaId, label: 'Small', inches: 7, price: pizza.price_small, sort_order: 1 },
            { pizza_id: pizzaId, label: 'Medium', inches: 10, price: pizza.price_medium, sort_order: 2 },
            { pizza_id: pizzaId, label: 'Large', inches: 13, price: pizza.price_large, sort_order: 3 },
         ], { onConflict: 'id' });

         
         // Actually, to avoid duplicates in pizza_sizes, let's delete existing ones first
         await supabase.from('pizza_sizes').delete().eq('pizza_id', pizzaId);
         await supabase.from('pizza_sizes').insert([
            { pizza_id: pizzaId, label: 'Small', inches: 7, price: pizza.price_small, sort_order: 1 },
            { pizza_id: pizzaId, label: 'Medium', inches: 10, price: pizza.price_medium, sort_order: 2 },
            { pizza_id: pizzaId, label: 'Large', inches: 13, price: pizza.price_large, sort_order: 3 },
         ]);
       }
    } catch(err) {
       console.error("Error", err);
    }
  }

  console.log('🎉 DB Sync Complete!');
}

sync();
