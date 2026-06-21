import Link from "next/link";
import { Button } from "./Button";
import { getOptimizedImageUrl } from "@/lib/cloudinary";

interface ProductCardProps {
    product: {
        _id: string;
        name: string;
        price: number;
        image: string;
        category: string;
        countInStock?: number;
    };
}

export const ProductCard = ({ product }: ProductCardProps) => {
    return (
        <div className="group flex flex-col h-full card-premium card-shimmer overflow-hidden">
            <Link href={`/product/${product._id}`} className="relative aspect-[4/5] overflow-hidden block">
                <img
                    src={getOptimizedImageUrl(product.image)}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                {/* Category badge */}
                <div className="absolute top-4 left-4 bg-cream/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-[10px] font-semibold text-gold uppercase tracking-[0.15em] shadow-sm border border-gold-light/30">
                    {product.category}
                </div>
                {/* Sold out badge */}
                {product.countInStock !== undefined && product.countInStock <= 0 && (
                    <div className="absolute bottom-4 left-4 bg-red-500/90 text-white backdrop-blur-sm px-3 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider shadow-sm border border-red-400/20 z-10">
                        Sold out
                    </div>
                )}
                {/* Quick view on hover */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-4 transition-all duration-500">
                    <span className="bg-white/90 backdrop-blur-sm text-foreground px-5 py-2 rounded-full text-xs font-medium tracking-wider uppercase shadow-md">
                        View Details
                    </span>
                </div>
            </Link>

            <div className="p-5 flex flex-col flex-grow text-center">
                <Link href={`/product/${product._id}`}>
                    <h3 className="font-serif text-lg text-foreground group-hover:text-gold transition-colors duration-300 mb-2">{product.name}</h3>
                </Link>
                <div className="mt-auto pt-3">
                    <p className="text-gold font-semibold text-lg">₹{product.price}</p>
                </div>
            </div>
        </div>
    );
};
