import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-24 bg-background">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex flex-col gap-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-6xl mb-4 font-serif uppercase tracking-[8px]">
            CAMA Portal
          </h1>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">
            Hệ thống quản lý Studio Cưới chuyên nghiệp.
          </p>
        </div>
        
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href="/login"
            className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors"
          >
            Đăng nhập hệ thống
          </Link>
        </div>
      </div>
    </main>
  );
}
