import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] text-white font-sans selection:bg-gold-500/30">
      <main className="relative flex flex-col items-center gap-12 px-6 text-center">
        {/* Background gradient effect */}
        <div className="absolute -top-40 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-gold-600/10 blur-[120px]" />

        <div className="flex flex-col items-center gap-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1 px-4 text-sm font-medium text-gold-400 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-gold-500"></span>
            </span>
            Workspace Ready
          </div>
          <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">
            Travel <span className="bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">Guru</span>
          </h1>
          <p className="max-w-md text-balance text-lg text-zinc-400">
            A premium full-stack monorepo featuring <span className="text-white">Next.js</span> and <span className="text-white">NestJS</span>.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="group relative rounded-2xl border border-white/10 bg-white/5 p-8 transition-all hover:bg-white/10">
            <div className="mb-4 text-sm font-semibold tracking-widest text-zinc-500 uppercase">Frontend</div>
            <h3 className="text-xl font-bold mb-2">Next.js Client</h3>
            <p className="text-zinc-500 text-sm mb-6">Modern UI with App Router, Tailwind CSS, and TypeScript.</p>
            <div className="text-xs font-mono text-gold-500/50">Running on port 3000</div>
          </div>

          <div className="group relative rounded-2xl border border-white/10 bg-white/5 p-8 transition-all hover:bg-white/10">
            <div className="mb-4 text-sm font-semibold tracking-widest text-zinc-500 uppercase">Backend</div>
            <h3 className="text-xl font-bold mb-2">NestJS Server</h3>
            <p className="text-zinc-500 text-sm mb-6">Scalable Node.js architecture with TypeScript and Express.</p>
            <div className="text-xs font-mono text-gold-500/50">Running on port 3001</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
          <code className="rounded-lg bg-white/5 px-4 py-2 text-sm font-mono text-zinc-400 border border-white/10">
            pnpm dev
          </code>
          <span className="text-zinc-600">to start developing</span>
        </div>
      </main>

      <footer className="mt-24 text-sm text-zinc-600">
        Travel Guru &bull; 2026
      </footer>
    </div>
  );
}


