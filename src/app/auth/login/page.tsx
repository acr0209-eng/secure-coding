import Link from "next/link";
import { loginUser } from "@/app/actions";

type LoginProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginProps) {
  const params = await searchParams;

  return (
    <main className="mx-auto grid min-h-[calc(100vh-72px)] max-w-md place-items-center px-4 py-10">
      <section className="panel w-full p-6">
        <p className="text-sm font-black uppercase tracking-[0.16em] text-emerald-700">Login</p>
        <h1 className="mt-2 text-2xl font-black text-neutral-950">로그인</h1>
        {params?.error ? (
          <p className="notice mt-4">이메일 또는 비밀번호를 확인해주세요.</p>
        ) : null}
        <form action={loginUser} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-bold text-neutral-700">이메일</span>
            <input className="input" name="email" required type="email" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-bold text-neutral-700">비밀번호</span>
            <input className="input" name="password" required type="password" />
          </label>
          <button className="button-primary w-full" type="submit">
            로그인
          </button>
        </form>
        <div className="mt-5 flex items-center justify-between text-sm">
          <Link className="font-bold text-emerald-700" href="/auth/register">
            회원가입
          </Link>
          <span className="text-neutral-500">admin@example.com / Admin01!Aa</span>
        </div>
      </section>
    </main>
  );
}
