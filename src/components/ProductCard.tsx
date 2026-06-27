import Link from "next/link";
import { formatDate, formatPrice } from "@/lib/format";

type ProductCardProps = {
  product: {
    id: string;
    title: string;
    price: number;
    category: string;
    location: string;
    imageUrl: string;
    status: string;
    createdAt: Date;
    seller: {
      name: string;
    };
  };
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link className="product-card" href={`/items/${product.id}`}>
      <div className="product-image-wrap">
        <img alt="" className="product-image" src={product.imageUrl} />
        <span className="status-badge">{labelStatus(product.status)}</span>
      </div>
      <div className="space-y-3 p-4">
        <div>
          <p className="text-xs font-bold text-emerald-700">{product.category}</p>
          <h3 className="mt-1 line-clamp-2 text-lg font-bold text-neutral-950">{product.title}</h3>
        </div>
        <p className="text-xl font-black text-neutral-950">{formatPrice(product.price)}</p>
        <div className="flex items-center justify-between gap-3 text-xs text-neutral-500">
          <span>{product.location}</span>
          <span>{formatDate(product.createdAt)}</span>
        </div>
        <p className="text-sm text-neutral-600">판매자 {product.seller.name}</p>
      </div>
    </Link>
  );
}

function labelStatus(status: string) {
  if (status === "SOLD") {
    return "거래완료";
  }

  if (status === "BLOCKED") {
    return "차단됨";
  }

  return "판매중";
}
