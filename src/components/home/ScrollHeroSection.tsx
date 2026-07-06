import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence, MotionValue } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  { id: 1, text: 'High-Precision Printing', subtext: '0.05mm layer accuracy' },
  { id: 2, text: 'Premium Materials', subtext: 'PLA, ABS, PETG, Resin' },
  { id: 3, text: 'Custom Designs', subtext: 'Your vision, realized' },
  { id: 4, text: 'Professional Finish', subtext: 'Gallery-quality results' },
];

const SCROLL_SECTIONS = 5; // Number of "pages" worth of scrolling

export default function ScrollHeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentFeature, setCurrentFeature] = useState(0);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Track which feature to show based on scroll
  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (latest) => {
      const featureIndex = Math.min(
        Math.floor(latest * (features.length + 1)),
        features.length - 1
      );
      setCurrentFeature(featureIndex);
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  // Printer animation transforms
  const printerHeadX = useTransform(smoothProgress, [0, 0.3, 0.6, 1], [0, 50, -50, 0]);
  const printProgress = useTransform(smoothProgress, [0.1, 0.9], [0, 100]);
  const productOpacity = useTransform(smoothProgress, [0.15, 0.3], [0, 1]);
  const productScale = useTransform(smoothProgress, [0.1, 0.9], [0.3, 1]);
  const filamentGlow = useTransform(smoothProgress, [0.1, 0.5, 0.9], [0, 1, 0.3]);
  
  // Text transforms
  const initialTextOpacity = useTransform(smoothProgress, [0, 0.15], [1, 0]);
  const finalTextOpacity = useTransform(smoothProgress, [0.85, 1], [0, 1]);
  const featureOpacity = useTransform(smoothProgress, [0.15, 0.25, 0.85, 0.9], [0, 1, 1, 0]);

  return (
    <section
      ref={containerRef}
      className="relative bg-background"
      style={{ height: `${SCROLL_SECTIONS * 100}vh` }}
    >
      {/* Sticky container */}
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-subtle" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-muted/20 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[80vh]">
            
            {/* Left: Text Content */}
            <div className="relative order-2 lg:order-1">
              {/* Initial State Text */}
              <motion.div
                style={{ opacity: initialTextOpacity }}
                className="space-y-6"
              >
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="inline-block text-muted-foreground text-sm uppercase tracking-[0.2em] font-medium"
                >
                  Premium 3D Printing
                </motion.span>
                
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-4xl md:text-5xl lg:text-6xl font-display font-medium leading-tight text-foreground"
                >
                  Precision 3D Printing
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-lg md:text-xl text-muted-foreground max-w-md leading-relaxed"
                >
                  Built for quality. Designed for creators.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-col sm:flex-row gap-4 pt-4"
                >
                  <Link to="/products">
                    <Button size="lg" className="group w-full sm:w-auto">
                      Browse Prints
                      <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  <Link to="/custom-print">
                    <Button variant="outline" size="lg" className="group w-full sm:w-auto">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Your Design
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>

              {/* Feature Text (shows during scroll) */}
              <motion.div
                style={{ opacity: featureOpacity }}
                className="absolute inset-0 flex items-center"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentFeature}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-3"
                  >
                    <span className="text-accent text-sm uppercase tracking-[0.2em] font-medium">
                      Feature {currentFeature + 1} of {features.length}
                    </span>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-medium text-foreground">
                      {features[currentFeature]?.text}
                    </h2>
                    <p className="text-xl text-muted-foreground">
                      {features[currentFeature]?.subtext}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </motion.div>

              {/* Final State Text */}
              <motion.div
                style={{ opacity: finalTextOpacity }}
                className="absolute inset-0 flex items-center"
              >
                <div className="space-y-6">
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-medium text-foreground leading-tight">
                    Your Ideas.
                    <br />
                    <span className="text-gradient-accent">Printed to Perfection.</span>
                  </h2>
                  
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Link to="/products">
                      <Button size="lg" className="group w-full sm:w-auto">
                        Shop Collection
                        <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                    <Link to="/custom-print">
                      <Button variant="outline" size="lg" className="w-full sm:w-auto">
                        Start Custom Print
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right: Printer Animation */}
            <div className="relative order-1 lg:order-2 flex items-center justify-center">
              <div className="relative w-full max-w-lg aspect-square">
                {/* Printer Frame */}
                <motion.div 
                  className="relative w-full h-full rounded-3xl border border-border bg-card shadow-card overflow-hidden"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  {/* Printer Top Bar */}
                  <div className="absolute top-0 left-0 right-0 h-16 bg-secondary/50 border-b border-border flex items-center justify-between px-6">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-accent" />
                      <span className="text-sm font-medium text-foreground">PrintForge X1</span>
                    </div>
                    <motion.div 
                      className="text-sm text-muted-foreground font-mono"
                      style={{ opacity: productOpacity }}
                    >
                      <motion.span>
                        {useTransform(printProgress, (v) => `${Math.round(v)}%`)}
                      </motion.span>
                    </motion.div>
                  </div>

                  {/* Print Area */}
                  <div className="absolute top-16 left-0 right-0 bottom-0 flex items-end justify-center p-8">
                    {/* Print Bed */}
                    <div className="absolute bottom-8 left-8 right-8 h-4 bg-secondary rounded-lg border border-border">
                      {/* Grid lines on bed */}
                      <div className="absolute inset-0 opacity-30">
                        {[...Array(10)].map((_, i) => (
                          <div
                            key={i}
                            className="absolute top-0 bottom-0 w-px bg-border"
                            style={{ left: `${(i + 1) * 10}%` }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Extruder Head */}
                    <motion.div
                      className="absolute top-24 z-20"
                      style={{ x: printerHeadX }}
                    >
                      <div className="relative">
                        {/* Head body */}
                        <div className="w-16 h-12 bg-secondary rounded-lg border border-border shadow-soft" />
                        {/* Nozzle */}
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2 h-4 bg-foreground rounded-b" />
                        {/* Filament glow */}
                        <motion.div
                          className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-4 h-8 bg-accent rounded-full blur-md"
                          style={{ opacity: filamentGlow }}
                        />
                      </div>
                    </motion.div>

                    {/* Printed Object */}
                    <motion.div
                      className="relative z-10 mb-4"
                      style={{ 
                        opacity: productOpacity,
                        scale: productScale,
                      }}
                    >
                      {/* 3D Printed Vase Shape */}
                      <div className="relative">
                        {[...Array(15)].map((_, i) => (
                          <BaseLayer key={i} index={i} printProgress={printProgress} />
                        ))}
                      </div>
                    </motion.div>
                  </div>

                  {/* Ambient light effect */}
                  <motion.div
                    className="absolute inset-0 bg-accent/5 pointer-events-none"
                    style={{ opacity: filamentGlow }}
                  />
                </motion.div>

                {/* Reflection/Shadow */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-foreground/5 blur-xl rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator (only visible at start) */}
        <motion.div
          style={{ opacity: initialTextOpacity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="flex flex-col items-center gap-3">
            <span className="text-xs text-muted-foreground uppercase tracking-[0.2em]">
              Scroll to explore
            </span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-6 h-10 rounded-full border-2 border-border flex items-start justify-center p-2"
            >
              <div className="w-1 h-2 rounded-full bg-foreground" />
            </motion.div>
          </div>
        </motion.div>

        {/* Progress bar */}
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-accent"
          style={{ 
            width: useTransform(smoothProgress, [0, 1], ['0%', '100%']),
          }}
        />
      </div>
    </section>
  );
}

function BaseLayer({ index, printProgress }: { index: number; printProgress: MotionValue<number> }) {
  const opacity = useTransform(
    printProgress,
    [index * 6, (index + 1) * 6 + 10],
    [0, 1]
  );
  return (
    <motion.div
      className="absolute left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-accent/80 via-accent to-accent/80"
      style={{
        bottom: index * 6,
        width: 60 + Math.sin(index * 0.5) * 20,
        height: 6,
        opacity,
      }}
    />
  );
}