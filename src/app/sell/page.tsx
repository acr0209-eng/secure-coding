import { createProduct } from "@/app/actions";
import { requireUser } from "@/lib/auth";

const categories = ["디지털", "가구", "도서", "생활", "의류", "기타"];

type SellProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function SellPage({ searchParams }: SellProps) {
  const user = await requireUser();
  const params = await searchParams;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <section className="mb-6">
        <p className="text-sm font-black uppercase tracking-[0.16em] text-emerald-700">Sell</p>
        <h1 className="mt-2 text-3xl font-black text-neutral-950">상품 등록</h1>
      </section>

      {params?.error === "blocked" || user.blocked ? (
        <p className="notice mb-5">차단된 사용자는 상품을 등록할 수 없습니다.</p>
      ) : null}
      {params?.error === "invalid" ? (
        <p className="notice mb-5">상품명, 가격, 분류, 지역, 이미지 주소를 확인해주세요.</p>
      ) : null}

      <form action={createProduct} className="panel grid gap-5 p-5">
        <label>
          <span className="mb-1 block text-sm font-bold text-neutral-700">상품명</span>
          <input className="input" maxLength={80} name="title" required />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <span className="mb-1 block text-sm font-bold text-neutral-700">가격</span>
            <input className="input" min={0} name="price" required type="number" />
          </label>
          <label>
            <span className="mb-1 block text-sm font-bold text-neutral-700">분류</span>
            <select className="input" name="category" required>
              {categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </label>
        </div>
        <label>
          <span className="mb-1 block text-sm font-bold text-neutral-700">거래 지역</span>
          <input className="input" maxLength={60} name="location" required />
        </label>
        <label>
          <span className="mb-1 block text-sm font-bold text-neutral-700">이미지 URL</span>
          <input
            className="input"
            maxLength={300}
            name="imageUrl"
            placeholder="https://..."
            type="url"
          />
        </label>
        <label>
          <span className="mb-1 block text-sm font-bold text-neutral-700">설명</span>
          <textarea className="input min-h-40 resize-y" maxLength={1400} name="description" required />
        </label>
        <button className="button-primary justify-self-start" disabled={user.blocked} type="submit">
          등록하기
        </button>
      </form>
    </main>
  );
}
