import { Link } from "react-router-dom";
import { ProductListItem } from "../../types/product.types";

export function ProductCard({ product }: { product: ProductListItem }) {
  return (
    <Link to={`/products/${product.slug}`} className="card group block overflow-hidden">
      <div className="aspect-square overflow-hidden bg-teal-light">
        {product.primary_image ? (
          <img
            src={product.primary_image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-display text-muted">
            No image
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-sans text-sm font-medium text-ink line-clamp-2">{product.name}</h3>
        <p className="price-tag mt-2 text-base">${product.base_price}</p>
      </div>
    </Link>
  );
}