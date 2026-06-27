import Link from "next/link";
import { registerUser } from "@/app/actions";

type RegisterProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function RegisterPage({ searchParams }: RegisterProps) {
  const params = await searchParams;

  return (
    <main className="mx-auto grid min-h-[calc(100vh-72px)] max-w-md place-items-center px-4 py-10">
      <section className="panel w-full p-6">
        <p className="text-sm font-black uppercase tracking-[0.16em] text-emerald-700">Join</p>
        <h1 className="mt-2 text-2xl font-black text-neutral-950">회원가입</h1>
        {params?.error ? <p className="notice mt-4">{message(params.error)}</p> : null}
        <form action={registerUser} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-bold text-neutral-700">이름</span>
            <input className="input" maxLength={40} name="name" required />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-bold text-neutral-700">이메일</span>
            <input className="input" maxLength={120} name="email" required type="email" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-bold text-neutral-700">비밀번호</span>
            <input className="input" minLength={8} name="password" required type="password" />
          </label>
          <button className="button-primary w-full" type="submit">
            계정 만들기
          </button>
        </form>
        <Link className="mt-5 inline-block text-sm font-bold text-emerald-700" href="/auth/login">
          이미 계정이 있습니다
        </Link>
      </section>
    </main>
  );
}

function message(error: string) {
  if (error === "exists") {
    return "이미 가입된 이메일입니다.";
  }

  return "입력값을 확인해주세요. 비밀번호는 8자 이상이어야 합니다.";
}
