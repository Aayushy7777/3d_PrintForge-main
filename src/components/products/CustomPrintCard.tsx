import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface CustomPrintCardProps {
  viewMode: 'grid' | 'list';
  index?: number;
}

export function CustomPrintCard({ viewMode, index = 0 }: CustomPrintCardProps) {
  const content = (
    <Link to="/custom-print" className={`group block relative ${viewMode === 'list' ? 'flex gap-6 p-4 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors' : ''}`}>
      {viewMode === 'grid' ? (
        <>
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-secondary mb-4 opacity-90 transition-opacity group-hover:opacity-100">
            <img 
              src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600" 
              alt="Custom 3D Print" 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="absolute top-4 left-4 z-10">
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-primary/90 text-primary-foreground backdrop-blur-sm">
                Coming Soon
              </span>
            </div>

            <div className="absolute inset-0 bg-foreground/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
              <Button variant="secondary" size="sm" className="font-semibold shadow-lg pointer-events-none">
                Preview
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 fill-muted text-muted" />
              <span className="text-sm font-medium">5.0</span>
            </div>
            <h3 className="font-display font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
              Custom 3D Print
            </h3>
            <p className="text-muted-foreground text-sm line-clamp-2">
              Design your own 3D printed controller stand. Upload your design, choose colors and materials, and we'll print it for you.
            </p>
            <div className="flex items-center justify-between pt-2">
              <span className="text-xl font-bold text-muted-foreground">
                TBD
              </span>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="w-32 h-32 rounded-xl overflow-hidden bg-secondary flex-shrink-0 relative opacity-90 transition-opacity group-hover:opacity-100">
            <img 
              src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600" 
              alt="Custom 3D Print" 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
            />
            <div className="absolute top-2 left-2 z-10">
               <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-sm bg-primary/90 text-primary-foreground backdrop-blur-sm">
                 Soon
               </span>
            </div>
          </div>
          <div className="flex-grow">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-secondary text-muted-foreground">
                  Custom Service
                </span>
                <h3 className="font-display font-semibold text-lg mt-2 text-foreground group-hover:text-primary transition-colors">
                  Custom 3D Print
                </h3>
              </div>
              <span className="text-xl font-bold text-muted-foreground">
                TBD
              </span>
            </div>
            <p className="text-muted-foreground text-sm mt-2 line-clamp-2">
              Design your own 3D printed controller stand. Upload your design, choose colors and materials, and we'll print it for you.
            </p>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-muted text-muted" />
                <span className="text-sm font-medium">5.0</span>
              </div>
              <Button variant="secondary" size="sm" className="ml-auto pointer-events-none">
                Preview
              </Button>
            </div>
          </div>
        </>
      )}
    </Link>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: viewMode === 'grid' ? 20 : 0, x: viewMode === 'list' ? -20 : 0 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <div className="w-full">{content}</div>
    </motion.div>
  );
}
