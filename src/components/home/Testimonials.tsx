import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

interface Testimonial {
  name: string;
  role: string;
  avatar?: string;
  content: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    name: 'Twinkle',
    role: 'Verified Customer',
    content: 'I had a very good and smooth experience with placing an order and getting it customised. It was a gift and I was very particular about how I wanted it, thank you for taking everything into consideration and making it happen so quickly! Within 3 days I had the order in my hand. Will definitely love to engage with more of your products. The quality is also very good and economical.',
    rating: 5,
  },
  {
    name: 'karmesh',
    role: 'Verified Customer',
    content: "Didn't expect 30 printed parts to look this clean. The finish is smooth, the edges are sharp, and the whole thing just feels solid-not that cheap, flimsy type at all. The red and black combo looks sick in real life, proper standout piece. Lowkey impressed. Wouldn't mind getting more stuff like this.",
    rating: 5,
  },
  {
    name: 'Neha rai',
    role: 'Verified Customer',
    content: 'Got these beautiful custom-made coasters from Printforge',
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-glow opacity-20 blur-3xl pointer-events-none" />
      
      <div className="container mx-auto px-4 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-primary font-medium uppercase tracking-widest text-sm"
          >
            Testimonials
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-display font-bold text-foreground mt-4"
          >
            What Our Customers Say
          </motion.h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative p-8 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors"
            >
              {/* Quote icon */}
              <Quote className="absolute top-6 right-6 w-8 h-8 text-primary/20" />

              {/* Rating */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                ))}
              </div>

              {/* Content */}
              <p className="text-foreground leading-relaxed mb-6">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                {testimonial.avatar ? (
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-border"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/10 border-2 border-border flex items-center justify-center text-primary font-semibold">
                    {testimonial.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-foreground">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
