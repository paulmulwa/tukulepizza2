// scripts/seed.ts
// Run with: npx ts-node scripts/seed.ts
// Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY in .env.local

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌  Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const PIZZAS = [
  {
    name: 'Margherita',
    slug: 'margherita',
    category: 'Classic',
    description:
      'A timeless Italian classic with a golden crust, rich tomato base, and creamy mozzarella. Finished with fresh basil leaves straight from the garden.',
    ingredients: ['Tomato Base', 'Mozzarella', 'Fresh Basil', 'Olive Oil'],
    tags: ['Vegetarian', 'Bestseller'],
    model_path: '/models/margherita.glb',
    price_small: 750,
    price_medium: 1000,
    price_large: 2300,
  },
  {
    name: 'Diavola',
    slug: 'diavola',
    category: 'Spicy',
    description:
      'A bold and fiery pizza loaded with spicy salami and chili flakes that pack serious heat. Balanced with creamy mozzarella and a robust tomato base.',
    ingredients: ['Tomato Base', 'Spicy Salami', 'Chili Flakes', 'Mozzarella'],
    tags: ['Spicy', 'Hot'],
    model_path: '/models/diavola.glb',
    price_small: 800,
    price_medium: 1100,
    price_large: 2400,
  },
  {
    name: 'BBQ Beef',
    slug: 'bbq-beef',
    category: 'Meat Lovers',
    description:
      'A hearty meat lovers dream topped with smoky BBQ sauce, tender beef strips, and caramelized red onion. Finished with melted cheddar for a rich, satisfying bite.',
    ingredients: ['BBQ Sauce', 'Beef Strips', 'Red Onion', 'Cheddar', 'Oregano'],
    tags: ['Bestseller', 'Meat Lovers'],
    model_path: '/models/bbq-beef.glb',
    price_small: 900,
    price_medium: 1300,
    price_large: 2500,
  },
  {
    name: 'Garden Fresh',
    slug: 'garden-fresh',
    category: 'Veggie',
    description:
      'A vibrant celebration of garden vegetables with roasted peppers, zucchini, and Kalamata olives. Topped with crumbled Greek feta for a Mediterranean twist.',
    ingredients: ['Roasted Peppers', 'Zucchini', 'Olives', 'Feta Cheese', 'Tomato Base'],
    tags: ['Vegetarian', 'Healthy'],
    model_path: '/models/garden-fresh.glb',
    price_small: 750,
    price_medium: 1000,
    price_large: 2200,
  },
  {
    name: 'Pepperoni Feast',
    slug: 'pepperoni-feast',
    category: 'Meat Lovers',
    description:
      'Double the pepperoni, double the flavor — a generously loaded pizza with two layers of crispy pepperoni slices. Seasoned with oregano and melted mozzarella throughout.',
    ingredients: ['Double Pepperoni', 'Mozzarella', 'Oregano', 'Tomato Base'],
    tags: ['Bestseller', 'Classic Favorite'],
    model_path: '/models/pepperoni-feast.glb',
    price_small: 850,
    price_medium: 1200,
    price_large: 2400,
  },
  {
    name: 'Truffle Mushroom',
    slug: 'truffle-mushroom',
    category: "Chef's Special",
    description:
      "Our chef's signature creation featuring fragrant truffle oil drizzled over a medley of wild forest mushrooms. Finished with shaved parmesan for an indulgent, earthy experience.",
    ingredients: ['Truffle Oil', 'Wild Mushrooms', 'Parmesan', 'Cream Base', 'Thyme'],
    tags: ['Chef Special', 'Premium'],
    model_path: '/models/truffle-mushroom.glb',
    price_small: 950,
    price_medium: 1400,
    price_large: 2500,
  },
  {
    name: 'Hot Chicken',
    slug: 'hot-chicken',
    category: 'Spicy',
    description:
      'Tender grilled chicken slices glazed in fiery hot sauce with fresh jalapeños that bring the heat. Melted mozzarella cools every bite just enough to keep you coming back.',
    ingredients: ['Grilled Chicken', 'Jalapeños', 'Hot Sauce', 'Mozzarella', 'Red Onion'],
    tags: ['Spicy', 'Hot', 'Protein Rich'],
    model_path: '/models/hot-chicken.glb',
    price_small: 850,
    price_medium: 1200,
    price_large: 2400,
  },
  {
    name: 'Napolitana',
    slug: 'napolitana',
    category: 'Classic',
    description:
      'A traditional Neapolitan style pizza with salty anchovies, briny capers, and plump Kalamata olives on a rustic tomato base. Bold Mediterranean flavors in every slice.',
    ingredients: ['Anchovies', 'Capers', 'Tomato Base', 'Kalamata Olives', 'Mozzarella'],
    tags: ['Classic', 'Traditional'],
    model_path: '/models/napolitana.glb',
    price_small: 750,
    price_medium: 1050,
    price_large: 2300,
  },
];

const IMAGES_DIR = path.resolve(process.cwd(), 'public/images');
const BUCKET = 'pizza-images';

async function uploadImage(slug: string): Promise<string | null> {
  const extensions = ['webp', 'jpg', 'jpeg', 'png'];
  for (const ext of extensions) {
    const filePath = path.join(IMAGES_DIR, `${slug}.${ext}`);
    if (fs.existsSync(filePath)) {
      const fileBuffer = fs.readFileSync(filePath);
      const contentType = ext === 'webp' ? 'image/webp' : ext === 'png' ? 'image/png' : 'image/jpeg';
      const fileName = `${slug}.${ext}`;

      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(fileName, fileBuffer, { contentType, upsert: true });

      if (error) {
        console.error(`  ⚠️  Upload failed for ${fileName}:`, error.message);
        return null;
      }

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
      return data.publicUrl;
    }
  }
  console.warn(`  ⚠️  No image found for slug: ${slug}`);
  return null;
}

async function seed() {
  console.log('🌱 Starting Pizza In seed script...\n');

  for (const pizza of PIZZAS) {
    console.log(`📦 Processing: ${pizza.name}`);

    // Upload image
    const thumbnailUrl = await uploadImage(pizza.slug);
    if (!thumbnailUrl) {
      console.warn(`  ⚠️  Skipping image upload for ${pizza.name} — using placeholder\n`);
    } else {
      console.log(`  ✅ Image uploaded: ${thumbnailUrl}`);
    }

    // Check if slug exists
    const { data: existing } = await supabase
      .from('pizzas')
      .select('id')
      .eq('slug', pizza.slug)
      .single();

    const payload = {
      name: pizza.name,
      slug: pizza.slug,
      category: pizza.category,
      description: pizza.description,
      ingredients: pizza.ingredients,
      tags: pizza.tags,
      thumbnail_url: thumbnailUrl || '',
      model_path: pizza.model_path,
      price_small: pizza.price_small,
      price_medium: pizza.price_medium,
      price_large: pizza.price_large,
    };

    if (existing) {
      const { error } = await supabase
        .from('pizzas')
        .update(payload)
        .eq('slug', pizza.slug);
      if (error) console.error(`  ❌ Update failed:`, error.message);
      else console.log(`  🔄 Updated: ${pizza.name}`);
    } else {
      const { error } = await supabase.from('pizzas').insert(payload);
      if (error) console.error(`  ❌ Insert failed:`, error.message);
      else console.log(`  ✅ Inserted: ${pizza.name}`);
    }

    console.log();
  }

  console.log('✅ Seed complete!');
}

seed().catch((err) => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});
