import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto grid min-h-[calc(100vh-72px)] max-w-lg place-items-center px-4 py-10 text-center">
      <section className="panel p-8">
        <h1 className="text-2xl font-black text-neutral-950">페이지를 찾을 수 없습니다.</h1>
        <Link className="button-primary mt-5" href="/">
          상품 목록
        </Link>
      </section>
    </main>
  );
}
