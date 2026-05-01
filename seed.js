/**
 * Pizza Inn Nairobi — Supabase Seed Script
 * Run: node seed.js
 */
import { createClient } from '@supabase/supabase-js';
import { PIZZA_DATA, CATEGORIES as LOCAL_CATEGORIES } from './src/data/pizzas.js';

const supabase = createClient(
  'https://svkgxzasjudavtrxvtbu.supabase.co',
  'sb_publishable_QiAXJ7B_-MjecGD4f9pSyQ_VxmqSkh7'
);

async function seed() {
  console.log('\n🍕 Pizza Inn Nairobi — Seeding Supabase from local data...\n');

  // 1. Prepare Categories
  const categoryRows = LOCAL_CATEGORIES.filter(c => c !== 'All').map((name, i) => ({
    name,
    sort_order: i + 1
  }));

  console.log('📂 Inserting categories...');
  const { error: catErr } = await supabase
    .from('categories')
    .upsert(categoryRows, { onConflict: 'name' });
  
  if (catErr) {
    console.error('❌ Categories failed:', catErr.message);
    process.exit(1);
  }
  console.log(`   ✅ ${categoryRows.length} categories seeded`);

  // 2. Prepare Pizzas
  const pizzaRows = PIZZA_DATA.map((p, i) => ({
    slug: p.slug,
    name: p.name,
    category: p.category,
    description: p.description,
    image_url: p.image,
    video_url: p.animatedOverlay,
    model3d_url: p.model3d,
    toppings: p.toppings,
    has_offer: p.hasOffer,
    offer_badge: p.offerBadge,
    original_price: p.originalPrice || null,
    offer_price: p.offerPrice || null,
    sort_order: i + 1,
    active: true
  }));

  console.log('🍕 Inserting pizzas...');
  const { data: insertedPizzas, error: pizzaErr } = await supabase
    .from('pizzas')
    .upsert(pizzaRows, { onConflict: 'slug' })
    .select('id, slug');
    
  if (pizzaErr) {
    console.error('❌ Pizzas failed:', pizzaErr.message);
    process.exit(1);
  }
  console.log(`   ✅ ${insertedPizzas.length} pizzas seeded`);

  // 3. Prepare Sizes
  console.log('📐 Inserting sizes (Small / Medium / Large)...');
  
  // First, delete existing sizes to avoid constraint errors, since they cascade from pizzas anyway
  // But just to be safe, we'll clear all sizes and re-insert them cleanly
  await supabase.from('pizza_sizes').delete().neq('id', 0);

  const sizeRows = [];
  for (const localPizza of PIZZA_DATA) {
    const dbPizza = insertedPizzas.find(p => p.slug === localPizza.slug);
    if (!dbPizza || !localPizza.sizes) continue;

    localPizza.sizes.forEach(size => {
      sizeRows.push({
        pizza_id: dbPizza.id,
        label: size.label,
        inches: size.inches,
        price: size.price,
        sort_order: size.sort_order
      });
    });
  }

  // Insert cleanly without ON CONFLICT to avoid the constraint error
  const { error: sizeErr } = await supabase
    .from('pizza_sizes')
    .insert(sizeRows);
    
  if (sizeErr) {
    console.error('❌ Sizes failed:', sizeErr.message);
    process.exit(1);
  }
  console.log(`   ✅ ${sizeRows.length} size rows seeded cleanly`);

  console.log('\n✅ ALL DONE! Your full 27-item Pizza Inn menu is live in Supabase.\n');
  console.log('   Refresh https://tukulepizza2.vercel.app/ and see the magic!\n');
}

seed().catch(err => {
  console.error('\n💥 Seed script crashed:', err.message);
  process.exit(1);
});
