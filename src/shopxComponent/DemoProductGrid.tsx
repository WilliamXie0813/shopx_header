interface Product {
  image: string
  title: string
  price: string
  badge?: string
}

interface ProductGridConfig {
  title: string
  products: Product[]
  style: { backgroundColor: string; textColor: string; cardBackground: string }
}

export default function DemoProductGrid({ config }: { config: ProductGridConfig }) {
  return (
    <section className="py-16 px-6" style={{ backgroundColor: config.style.backgroundColor }}>
      <h2 className="text-3xl font-bold text-center mb-10" style={{ color: config.style.textColor }}>
        {config.title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {config.products.map((product, i) => (
          <div
            key={i}
            className="rounded-xl overflow-hidden shadow-md transition-transform hover:scale-[1.02]"
            style={{ backgroundColor: config.style.cardBackground }}
          >
            <div className="relative">
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-48 object-cover"
              />
              {product.badge && (
                <span className="absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-bold bg-red-500 text-white">
                  {product.badge}
                </span>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-sm mb-1" style={{ color: config.style.textColor }}>
                {product.title}
              </h3>
              <p className="font-bold" style={{ color: '#3b82f6' }}>
                {product.price}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
