import { transferMoney } from "@/app/actions";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDate, formatPrice } from "@/lib/format";

type WalletProps = {
  searchParams?: Promise<{
    sent?: string;
    error?: string;
  }>;
};

export default async function WalletPage({ searchParams }: WalletProps) {
  const user = await requireUser();
  const params = await searchParams;

  const [recipients, transfers] = await Promise.all([
    prisma.user.findMany({
      where: {
        id: { not: user.id },
        blocked: false,
      },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
      },
    }),
    prisma.transfer.findMany({
      where: {
        OR: [{ senderId: user.id }, { receiverId: user.id }],
      },
      include: {
        sender: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } },
        product: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <section className="mb-7 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-emerald-700">
            Safe Vault
          </p>
          <h1 className="mt-2 text-3xl font-black text-neutral-950">안전거래 금고</h1>
          <p className="mt-2 max-w-2xl text-neutral-600">
            플랫폼 안에서 사용자끼리 송금하고, 상품 대금을 보내면 거래 장부가 자동으로 남습니다.
          </p>
        </div>
        <div className="panel min-w-64 p-5">
          <p className="text-sm font-bold text-neutral-500">내 잔액</p>
          <p className="mt-2 text-3xl font-black text-neutral-950">
            {formatPrice(user.walletBalance)}
          </p>
        </div>
      </section>

      {params?.sent ? <p className="notice mb-5">송금이 완료되었습니다.</p> : null}
      {params?.error ? <p className="notice mb-5">{errorMessage(params.error)}</p> : null}
      {user.blocked ? (
        <p className="notice mb-5">차단된 사용자는 송금할 수 없습니다.</p>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <form action={transferMoney} className="panel grid gap-4 p-5">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.14em] text-emerald-700">
              Direct Transfer
            </p>
            <h2 className="mt-1 text-xl font-black text-neutral-950">사용자에게 송금</h2>
          </div>
          <label>
            <span className="mb-1 block text-sm font-bold text-neutral-700">받는 사람</span>
            <select className="input" name="receiverId" required>
              <option value="">선택</option>
              {recipients.map((recipient) => (
                <option key={recipient.id} value={recipient.id}>
                  {recipient.name} ({recipient.email})
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-1 block text-sm font-bold text-neutral-700">금액</span>
            <input className="input" min={1000} name="amount" required step={1000} type="number" />
          </label>
          <label>
            <span className="mb-1 block text-sm font-bold text-neutral-700">메모</span>
            <input className="input" maxLength={120} name="memo" placeholder="예: 키보드 예약금" />
          </label>
          <button className="button-primary justify-self-start" disabled={user.blocked} type="submit">
            송금하기
          </button>
        </form>

        <section className="panel p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.14em] text-emerald-700">
                Ledger
              </p>
              <h2 className="mt-1 text-xl font-black text-neutral-950">송금 장부</h2>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-black text-emerald-700">
              {transfers.length}건
            </span>
          </div>
          <div className="mt-5 space-y-3">
            {transfers.length ? (
              transfers.map((transfer) => {
                const outgoing = transfer.senderId === user.id;

                return (
                  <article
                    className="grid gap-3 rounded-md border border-neutral-200 bg-white p-4 sm:grid-cols-[1fr_auto]"
                    key={transfer.id}
                  >
                    <div>
                      <p className="font-black text-neutral-950">
                        {outgoing ? "보냄" : "받음"} ·{" "}
                        {outgoing ? transfer.receiver.name : transfer.sender.name}
                      </p>
                      <p className="mt-1 text-sm text-neutral-600">{transfer.memo}</p>
                      {transfer.product ? (
                        <p className="mt-1 text-xs font-bold text-neutral-500">
                          상품 {transfer.product.title}
                        </p>
                      ) : null}
                      <p className="mt-1 text-xs text-neutral-500">
                        {formatDate(transfer.createdAt)}
                      </p>
                    </div>
                    <p
                      className={
                        outgoing
                          ? "text-lg font-black text-rose-700"
                          : "text-lg font-black text-emerald-700"
                      }
                    >
                      {outgoing ? "-" : "+"}
                      {formatPrice(transfer.amount)}
                    </p>
                  </article>
                );
              })
            ) : (
              <p className="text-sm text-neutral-500">아직 송금 내역이 없습니다.</p>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}

function errorMessage(error: string) {
  if (error === "insufficient") {
    return "잔액이 부족합니다.";
  }

  return "송금 정보를 확인해주세요.";
}
