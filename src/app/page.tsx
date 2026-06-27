import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { currentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

const categories = ["전체", "디지털", "가구", "도서", "생활", "의류", "기타"];

type HomeProps = {
  searchParams?: Promise<{
    q?: string;
    category?: string;
  }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const query = String(params?.q ?? "").trim();
  const category = String(params?.category ?? "전체").trim();
  const user = await currentUser();

  const products = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      ...(category && category !== "전체" ? { category } : {}),
      ...(query
        ? {
            OR: [
              { title: { contains: query } },
              { description: { contains: query } },
              { location: { contains: query } },
            ],
          }
        : {}),
    },
    include: { seller: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <section className="mb-7 grid gap-5 border-b border-neutral-200 pb-7 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-emerald-700">
            Marketplace
          </p>
          <h1 className="mt-2 text-3xl font-black text-neutral-950 sm:text-4xl">
            안전한 중고거래
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link className="button-primary" href="/sell">
            상품 등록
          </Link>
          {user ? null : (
            <Link className="button-secondary" href="/auth/register">
              회원가입
            </Link>
          )}
        </div>
      </section>

      <form className="panel mb-6 grid gap-3 p-4 md:grid-cols-[1fr_180px_auto]">
        <label>
          <span className="mb-1 block text-sm font-bold text-neutral-700">검색</span>
          <input
            className="input"
            defaultValue={query}
            name="q"
            placeholder="상품명, 지역, 설명"
            type="search"
          />
        </label>
        <label>
          <span className="mb-1 block text-sm font-bold text-neutral-700">분류</span>
          <select className="input" defaultValue={category} name="category">
            {categories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <button className="button-primary self-end" type="submit">
          찾기
        </button>
      </form>

      {products.length ? (
        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </section>
      ) : (
        <section className="panel p-8 text-center">
          <h2 className="text-xl font-black text-neutral-950">등록된 상품이 없습니다.</h2>
          <Link className="button-primary mt-5" href="/sell">
            첫 상품 등록
          </Link>
        </section>
      )}
    </main>
  );
}
