import Link from "next/link";
import { Button } from "./Button";

interface ProductCardProps {
    product: {
        _id: string;
        name: string;
        price: number;
        image: string;
        category: string;
    };
}

export const ProductCard = ({ product }: ProductCardProps) => {
    return (
        <div className="group flex flex-col h-full bg-white border border-beige rounded-xl overflow-hidden hover:shadow-md transition duration-300">
            <Link href={`/product/${product._id}`} className="relative aspect-[4/5] overflow-hidden block">
                {/* Abstracting image to simple img tag for easy mocking */}
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                />
                <div className="absolute top-4 left-4 bg-cream px-3 py-1 bg-opacity-90 rounded-full text-xs font-semibold text-gold-dark uppercase tracking-widest hidden group-hover:block transition">
                    Quick View
                </div>
            </Link>

            <div className="p-5 flex flex-col flex-grow text-center">
                <p className="text-xs text-gold tracking-widest uppercase mb-2">{product.category}</p>
                <Link href={`/product/${product._id}`}>
                    <h3 className="font-serif text-lg text-foreground hover:text-gold transition mb-2">{product.name}</h3>
                </Link>
                <div className="mt-auto pt-4 flex items-center justify-between">
                    <p className="text-foreground font-medium">₹{product.price}</p>
                    <Link href={`/product/${product._id}`}>
                        <Button variant="outline" size="sm" className="text-xs tracking-wider">Details</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};
