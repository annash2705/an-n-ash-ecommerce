"use client";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void; }) {
    return (
        <html>
            <body className="bg-[#FDF6EE] min-h-screen flex items-center justify-center px-4" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                <div className="text-center max-w-md">
                    <h1 className="text-6xl mb-4" style={{ fontFamily: "'Playfair Display', serif", background: 'linear-gradient(135deg, #C49A3C, #E8D5A3)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Oops!</h1>
                    <h2 className="text-xl text-[#3A2F28] mb-4">Something went wrong</h2>
                    <p className="text-[#3A2F28]/60 mb-8">We hit an unexpected error. Please try refreshing the page.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button onClick={() => reset()} className="inline-block bg-gradient-to-r from-[#C49A3C] to-[#A67C2E] text-white px-8 py-3 rounded-full text-sm uppercase tracking-[0.15em] hover:shadow-[0_4px_20px_rgba(196,154,60,0.3)] transition-all">Try Again</button>
                        <a href="/" className="inline-block border border-[#C49A3C]/50 text-[#C49A3C] px-8 py-3 rounded-full text-sm uppercase tracking-[0.15em] hover:bg-[#C49A3C] hover:text-white transition-all">Go Home</a>
                    </div>
                </div>
            </body>
        </html>
    );
}
