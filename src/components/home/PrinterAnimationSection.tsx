import { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';
import heroPrinter from '@/assets/hero-printer.jpg';

const printLayers = Array.from({ length: 20 }, (_, i) => i);

export default function PrinterAnimationSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const printerY = useTransform(scrollYProgress, [0, 0.3], [100, 0]);
  const printerOpacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);
  
  return (
    <section
      ref={containerRef}
      className="relative min-h-[200vh] bg-background"
    >
      {/* Sticky container */}
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text content */}
            <motion.div 
              style={{ opacity: printerOpacity }}
              className="space-y-8"
            >
              <motion.span
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="text-primary font-medium uppercase tracking-widest text-sm"
              >
                How It Works
              </motion.span>
              
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="text-3xl md:text-5xl font-display font-bold text-foreground"
              >
                Layer by Layer
                <br />
                <span className="text-gradient-primary">Precision Printing</span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-muted-foreground text-lg leading-relaxed max-w-lg"
              >
                Watch your designs come to life as our advanced printers build your 
                creations one precise layer at a time. Each layer is carefully 
                calibrated for optimal strength and detail.
              </motion.p>

              {/* Features */}
              <div className="space-y-4">
                {[
                  { title: '0.05mm Layer Height', desc: 'Ultra-fine resolution for smooth surfaces' },
                  { title: 'Multi-Material Support', desc: 'PLA, ABS, PETG, Resin, and more' },
                  { title: 'Real-time Monitoring', desc: 'Track your print progress live' },
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="flex items-start gap-4"
                  >
                    <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                    <div>
                      <h4 className="font-semibold text-foreground">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground">{feature.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right: Printer animation */}
            <motion.div
              style={{ y: printerY, opacity: printerOpacity }}
              className="relative"
            >
              <div className="relative aspect-square max-w-lg mx-auto">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-glow opacity-50 blur-3xl" />
                
                {/* Printer frame */}
                <div className="relative rounded-2xl overflow-hidden border border-border/50 glass">
                  <img
                    src={heroPrinter}
                    alt="3D Printer"
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Animated layers overlay */}
                  <div className="absolute inset-0 flex items-end justify-center pb-20">
                    <div className="relative w-32 h-40">
                      {printLayers.map((layer) => (
                        <PrintLayer 
                          key={layer} 
                          index={layer} 
                          scrollProgress={scrollYProgress}
                          total={printLayers.length}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Scanning line effect */}
                  <motion.div
                    className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"
                    style={{
                      top: useTransform(scrollYProgress, [0.2, 0.8], ['80%', '20%']),
                      opacity: useTransform(scrollYProgress, [0.2, 0.3, 0.7, 0.8], [0, 1, 1, 0]),
                    }}
                  />
                </div>

                {/* Floating particles */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full bg-primary/50"
                    style={{
                      left: `${20 + i * 12}%`,
                      top: `${30 + (i % 3) * 20}%`,
                    }}
                    animate={{
                      y: [0, -20, 0],
                      opacity: [0.3, 1, 0.3],
                    }}
                    transition={{
                      duration: 2 + i * 0.3,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PrintLayer({ 
  index, 
  scrollProgress, 
  total 
}: { 
  index: number; 
  scrollProgress: MotionValue<number>; 
  total: number;
}) {
  const layerProgress = (index + 1) / total;
  const opacity = useTransform(
    scrollProgress, 
    [0.2 + layerProgress * 0.4, 0.25 + layerProgress * 0.4], 
    [0, 1]
  );
  const scaleX = useTransform(
    scrollProgress,
    [0.2 + layerProgress * 0.4, 0.25 + layerProgress * 0.4],
    [0.8, 1]
  );

  return (
    <motion.div
      style={{ opacity, scaleX }}
      className="absolute left-0 right-0 h-2 bg-gradient-to-r from-primary/80 via-primary to-primary/80 rounded-sm"
      initial={{ opacity: 0 }}
      transition={{ duration: 0.1 }}
      animate={{}}
      whileInView={{}}
      viewport={{ once: false }}
      custom={index}
      layoutId={`layer-${index}`}
    >
      <style>{`
        .layer-${index} {
          bottom: ${index * 8}px;
        }
      `}</style>
    </motion.div>
  );
}
