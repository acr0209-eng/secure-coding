import Link from "next/link";
import { notFound } from "next/navigation";
import { markProductSold, reportProduct, sendMessage } from "@/app/actions";
import { currentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDate, formatPrice } from "@/lib/format";

type ItemProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    sent?: string;
    reported?: string;
    error?: string;
  }>;
};

export default async function ItemPage({ params, searchParams }: ItemProps) {
  const { id } = await params;
  const flags = await searchParams;
  const user = await currentUser();
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      seller: { select: { id: true, name: true, blocked: true } },
      messages: {
        where: user ? { OR: [{ senderId: user.id }, { receiverId: user.id }] } : { id: "__none__" },
        include: { sender: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
      reports: { where: { status: "OPEN" }, select: { id: true } },
    },
  });

  if (!product) {
    notFound();
  }

  const isOwner = user?.id === product.sellerId;
  const canSeeBlocked = user?.role === "ADMIN" || isOwner;

  if (product.status === "BLOCKED" && !canSeeBlocked) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <Link className="mb-5 inline-block text-sm font-bold text-emerald-700" href="/">
        목록으로
      </Link>

      {flags?.sent ? <p className="notice mb-5">문의가 판매자에게 전달되었습니다.</p> : null}
      {flags?.reported ? <p className="notice mb-5">신고가 접수되었습니다.</p> : null}
      {flags?.error ? <p className="notice mb-5">요청을 처리하지 못했습니다.</p> : null}

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="panel overflow-hidden">
          <div className="aspect-[4/3] bg-neutral-200">
            <img alt="" className="h-full w-full object-cover" src={product.imageUrl} />
          </div>
          <div className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-black text-emerald-700">{product.category}</p>
                <h1 className="mt-2 text-3xl font-black text-neutral-950">{product.title}</h1>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-sm font-black text-emerald-700 ring-1 ring-emerald-200">
                {statusLabel(product.status)}
              </span>
            </div>
            <p className="mt-4 text-3xl font-black text-neutral-950">{formatPrice(product.price)}</p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold text-neutral-500">
              <span>{product.location}</span>
              <span>{formatDate(product.createdAt)}</span>
              <span>판매자 {product.seller.name}</span>
            </div>
            <p className="mt-6 whitespace-pre-line leading-7 text-neutral-700">{product.description}</p>
          </div>
        </div>

        <aside className="space-y-5">
          {product.seller.blocked ? (
            <p className="notice">이 판매자는 관리자에 의해 차단된 상태입니다.</p>
          ) : null}

          {isOwner ? (
            <form action={markProductSold} className="panel p-5">
              <h2 className="text-lg font-black text-neutral-950">판매자 메뉴</h2>
              <input name="productId" type="hidden" value={product.id} />
              <button className="button-primary mt-4" type="submit">
                거래완료 처리
              </button>
            </form>
          ) : null}

          <section className="panel p-5">
            <h2 className="text-lg font-black text-neutral-950">판매자에게 문의</h2>
            {user ? (
              <form action={sendMessage} className="mt-4 space-y-3">
                <input name="productId" type="hidden" value={product.id} />
                <textarea
                  className="input min-h-32 resize-y"
                  maxLength={700}
                  name="body"
                  placeholder="거래 가능 여부, 위치, 시간 등을 문의하세요."
                  required
                />
                <button className="button-primary" disabled={isOwner || user.blocked} type="submit">
                  문의 보내기
                </button>
              </form>
            ) : (
              <Link className="button-primary mt-4" href="/auth/login">
                로그인 후 문의
              </Link>
            )}
          </section>

          <section className="panel p-5">
            <h2 className="text-lg font-black text-neutral-950">신고</h2>
            {user ? (
              <form action={reportProduct} className="mt-4 space-y-3">
                <input name="productId" type="hidden" value={product.id} />
                <select className="input" name="reason" required>
                  <option value="SCAM">사기 의심</option>
                  <option value="ABUSE">비매너/욕설</option>
                  <option value="PROHIBITED">금지 상품</option>
                  <option value="OTHER">기타</option>
                </select>
                <textarea
                  className="input min-h-28 resize-y"
                  maxLength={700}
                  name="details"
                  placeholder="신고 사유를 입력하세요."
                  required
                />
                <button className="button-secondary" type="submit">
                  신고 접수
                </button>
              </form>
            ) : (
              <Link className="button-secondary mt-4" href="/auth/login">
                로그인 후 신고
              </Link>
            )}
          </section>

          {user ? (
            <section className="panel p-5">
              <h2 className="text-lg font-black text-neutral-950">내 문의 내역</h2>
              <div className="mt-4 space-y-3">
                {product.messages.length ? (
                  product.messages.map((message) => (
                    <article className="rounded-md bg-neutral-50 p-3" key={message.id}>
                      <p className="text-sm font-bold text-neutral-800">{message.sender.name}</p>
                      <p className="mt-1 text-sm text-neutral-700">{message.body}</p>
                    </article>
                  ))
                ) : (
                  <p className="text-sm text-neutral-500">표시할 문의가 없습니다.</p>
                )}
              </div>
            </section>
          ) : null}

          {user?.role === "ADMIN" ? (
            <p className="notice">열린 신고 {product.reports.length}건</p>
          ) : null}
        </aside>
      </section>
    </main>
  );
}

function statusLabel(status: string) {
  if (status === "SOLD") {
    return "거래완료";
  }

  if (status === "BLOCKED") {
    return "차단됨";
  }

  return "판매중";
}
