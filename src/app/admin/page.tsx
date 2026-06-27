import {
  resolveReport,
  toggleUserBlock,
  updateProductStatus,
} from "@/app/actions";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDate, formatPrice } from "@/lib/format";

export default async function AdminPage() {
  await requireAdmin();

  const [users, products, reports, transfers] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        blocked: true,
        walletBalance: true,
        createdAt: true,
      },
    }),
    prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: { seller: { select: { name: true } } },
    }),
    prisma.report.findMany({
      where: { status: "OPEN" },
      orderBy: { createdAt: "desc" },
      include: {
        product: { select: { title: true } },
        reporter: { select: { name: true } },
        reportedUser: { select: { name: true } },
      },
    }),
    prisma.transfer.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        sender: { select: { name: true } },
        receiver: { select: { name: true } },
        product: { select: { title: true } },
      },
      take: 20,
    }),
  ]);

  const transferVolume = transfers.reduce((total, transfer) => total + transfer.amount, 0);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <section className="mb-7">
        <p className="text-sm font-black uppercase tracking-[0.16em] text-emerald-700">Admin</p>
        <h1 className="mt-2 text-3xl font-black text-neutral-950">관리자 대시보드</h1>
      </section>

      <section className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="사용자" value={users.length} />
        <StatCard label="상품" value={products.length} />
        <StatCard label="열린 신고" value={reports.length} />
        <StatCard label="송금 장부" value={transfers.length} />
        <StatCard label="총 송금액" value={formatPrice(transferVolume)} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="panel p-5">
          <h2 className="text-xl font-black text-neutral-950">사용자 관리</h2>
          <div className="mt-4 table-grid">
            {users.map((user) => (
              <article className="rounded-md border border-neutral-200 bg-white p-4" key={user.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-black text-neutral-950">{user.name}</h3>
                    <p className="text-sm text-neutral-500">{user.email}</p>
                    <p className="mt-1 text-xs font-bold text-neutral-500">
                      {user.role} · {formatDate(user.createdAt)}
                    </p>
                    <p className="mt-1 text-xs font-bold text-emerald-700">
                      잔액 {formatPrice(user.walletBalance)}
                    </p>
                  </div>
                  <form action={toggleUserBlock}>
                    <input name="userId" type="hidden" value={user.id} />
                    <input name="blocked" type="hidden" value={String(!user.blocked)} />
                    <button className={user.blocked ? "button-primary" : "button-danger"} type="submit">
                      {user.blocked ? "차단 해제" : "차단"}
                    </button>
                  </form>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="panel p-5">
          <h2 className="text-xl font-black text-neutral-950">신고 관리</h2>
          <div className="mt-4 table-grid">
            {reports.length ? (
              reports.map((report) => (
                <article className="rounded-md border border-neutral-200 bg-white p-4" key={report.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-black text-neutral-950">{reasonLabel(report.reason)}</h3>
                      <p className="mt-1 text-sm text-neutral-600">{report.details}</p>
                      <p className="mt-2 text-xs font-bold text-neutral-500">
                        신고자 {report.reporter.name}
                        {report.reportedUser ? ` · 대상 ${report.reportedUser.name}` : ""}
                      </p>
                      <p className="mt-1 text-xs text-neutral-500">
                        상품 {report.product?.title ?? "삭제된 상품"}
                      </p>
                    </div>
                    <form action={resolveReport}>
                      <input name="reportId" type="hidden" value={report.id} />
                      <button className="button-secondary" type="submit">
                        처리 완료
                      </button>
                    </form>
                  </div>
                </article>
              ))
            ) : (
              <p className="text-sm text-neutral-500">열린 신고가 없습니다.</p>
            )}
          </div>
        </div>
      </section>

      <section className="panel mt-6 p-5">
        <h2 className="text-xl font-black text-neutral-950">송금 장부</h2>
        <div className="mt-4 table-grid">
          {transfers.length ? (
            transfers.map((transfer) => (
              <article
                className="grid gap-4 rounded-md border border-neutral-200 bg-white p-4 md:grid-cols-[1fr_auto] md:items-center"
                key={transfer.id}
              >
                <div>
                  <h3 className="font-black text-neutral-950">
                    {transfer.sender.name} → {transfer.receiver.name}
                  </h3>
                  <p className="mt-1 text-sm text-neutral-600">{transfer.memo}</p>
                  <p className="mt-1 text-xs font-bold text-neutral-500">
                    {transfer.product ? `상품 ${transfer.product.title} · ` : ""}
                    {formatDate(transfer.createdAt)}
                  </p>
                </div>
                <p className="text-lg font-black text-emerald-700">
                  {formatPrice(transfer.amount)}
                </p>
              </article>
            ))
          ) : (
            <p className="text-sm text-neutral-500">송금 내역이 없습니다.</p>
          )}
        </div>
      </section>

      <section className="panel mt-6 p-5">
        <h2 className="text-xl font-black text-neutral-950">상품 관리</h2>
        <div className="mt-4 table-grid">
          {products.map((product) => (
            <article className="grid gap-4 rounded-md border border-neutral-200 bg-white p-4 md:grid-cols-[1fr_auto] md:items-center" key={product.id}>
              <div>
                <h3 className="font-black text-neutral-950">{product.title}</h3>
                <p className="mt-1 text-sm text-neutral-600">
                  {formatPrice(product.price)} · {product.category} · 판매자 {product.seller.name}
                </p>
                <p className="mt-1 text-xs font-bold text-neutral-500">
                  상태 {statusLabel(product.status)}
                </p>
              </div>
              <form action={updateProductStatus} className="flex flex-wrap gap-2">
                <input name="productId" type="hidden" value={product.id} />
                <select className="input min-w-32" defaultValue={product.status} name="status">
                  <option value="ACTIVE">판매중</option>
                  <option value="SOLD">거래완료</option>
                  <option value="BLOCKED">차단</option>
                </select>
                <button className="button-secondary" type="submit">
                  변경
                </button>
              </form>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="panel p-5">
      <p className="text-sm font-bold text-neutral-500">{label}</p>
      <p className="mt-2 text-3xl font-black text-neutral-950">{value}</p>
    </div>
  );
}

function reasonLabel(reason: string) {
  if (reason === "SCAM") {
    return "사기 의심";
  }

  if (reason === "ABUSE") {
    return "비매너/욕설";
  }

  if (reason === "PROHIBITED") {
    return "금지 상품";
  }

  return "기타";
}

function statusLabel(status: string) {
  if (status === "SOLD") {
    return "거래완료";
  }

  if (status === "BLOCKED") {
    return "차단";
  }

  return "판매중";
}
