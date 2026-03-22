import { motion } from 'framer-motion';
import { materials } from '@/data/products';

const materialImages: Record<string, string> = {
  PLA: 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=300&h=300&fit=crop',
  ABS: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop',
  PETG: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=300&h=300&fit=crop',
  Resin: 'https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=300&h=300&fit=crop',
  Nylon: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=300&h=300&fit=crop',
};

export default function MaterialsShowcase() {
  return (
    <section className="py-24 bg-card">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-primary font-medium uppercase tracking-widest text-sm"
          >
            Premium Quality
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-display font-bold text-foreground mt-4"
          >
            Materials & Technologies
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground mt-4 max-w-2xl mx-auto"
          >
            We offer a wide range of materials to match your project requirements, 
            from biodegradable plastics to industrial-grade resins.
          </motion.p>
        </div>

        {/* Materials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
          {materials.map((material, index) => (
            <motion.div
              key={material.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 bg-secondary">
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-primary opacity-20 group-hover:opacity-40 transition-opacity blur-2xl" />
                </div>
                
                {/* Material visual */}
                <div className="absolute inset-4 rounded-xl bg-muted flex items-center justify-center">
                  <span className="text-4xl font-display font-bold text-primary/50 group-hover:text-primary transition-colors">
                    {material.name.slice(0, 2)}
                  </span>
                </div>

                {/* Price multiplier badge */}
                <div className="absolute bottom-4 right-4 px-2 py-1 rounded-full text-xs font-medium glass">
                  {material.priceMultiplier}x
                </div>
              </div>

              <h3 className="font-display font-semibold text-lg text-foreground mb-1">
                {material.name}
              </h3>
              <p className="text-muted-foreground text-sm">
                {material.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
