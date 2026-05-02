"use client";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body className="bg-[#FFF8F0] min-h-screen flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <h1 className="text-6xl font-serif text-[#D4AF37] mb-4">Oops!</h1>
                    <h2 className="text-xl text-gray-800 mb-4">Something went wrong</h2>
                    <p className="text-gray-600 mb-8">
                        We hit an unexpected error. Please try refreshing the page.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => reset()}
                            className="inline-block bg-[#D4AF37] text-white px-6 py-3 rounded-md text-sm uppercase tracking-widest hover:bg-[#B8961F] transition"
                        >
                            Try Again
                        </button>
                        <a
                            href="/"
                            className="inline-block border border-[#D4AF37] text-[#D4AF37] px-6 py-3 rounded-md text-sm uppercase tracking-widest hover:bg-[#D4AF37] hover:text-white transition"
                        >
                            Go Home
                        </a>
                    </div>
                </div>
            </body>
        </html>
    );
}
