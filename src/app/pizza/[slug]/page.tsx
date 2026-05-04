import PizzaDetailClient from './PizzaDetailClient';

export default async function PizzaDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <PizzaDetailClient slug={slug} />;
}
