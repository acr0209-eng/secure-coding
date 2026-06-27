import Link from "next/link";
import { currentUser } from "@/lib/auth";
import { logoutUser } from "@/app/actions";

export async function Header() {
  const user = await currentUser();

  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link className="flex items-center gap-3" href="/">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-emerald-700 text-lg font-black text-white">
            S
          </span>
          <span>
            <strong className="block text-base text-neutral-950">Secure Market</strong>
            <small className="block text-xs text-neutral-500">safe secondhand trading</small>
          </span>
        </Link>

        <nav className="flex items-center gap-2 text-sm font-semibold">
          <Link className="nav-link" href="/">
            상품
          </Link>
          <Link className="nav-link" href="/sell">
            판매하기
          </Link>
          {user ? (
            <Link className="nav-link" href="/wallet">
              지갑
            </Link>
          ) : null}
          {user?.role === "ADMIN" ? (
            <Link className="nav-link" href="/admin">
              관리자
            </Link>
          ) : null}
          {user ? (
            <form action={logoutUser}>
              <button className="button-secondary" type="submit">
                로그아웃
              </button>
            </form>
          ) : (
            <Link className="button-primary" href="/auth/login">
              로그인
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
