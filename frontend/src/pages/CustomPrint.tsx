import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, File, X, Calculator, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { materials, colors } from '@/data/products';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';

export default function CustomPrint() {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState('PLA');
  const [selectedColor, setSelectedColor] = useState('White');
  const [infill, setInfill] = useState([20]);
  const [layerHeight, setLayerHeight] = useState('0.2');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const { addItem } = useCart();

  const material = materials.find((m) => m.name === selectedMaterial);
  const basePrice = 500;
  const calculatedPrice = basePrice * (material?.priceMultiplier || 1) * (1 + infill[0] / 100) * quantity;

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAddToCart = () => {
    if (!file) {
      toast.error('Please upload a file first');
      return;
    }
    addItem({
      id: `custom-${Date.now()}`,
      name: `Custom Print: ${file.name}`,
      price: calculatedPrice,
      quantity: 1,
      image: '/placeholder.svg',
      material: selectedMaterial,
      color: selectedColor,
      isCustom: true,
    });
    toast.success('Custom print added to cart!');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <section className="py-16 bg-card border-b border-border">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">Custom 3D Printing – Coming Soon</h1>
              <p className="text-muted-foreground text-lg">This feature is currently under development. Stay tuned! You will soon be able to upload your 3D model, choose materials, and get an instant quote.</p>
            </motion.div>
          </div>
        </section>

        <section className="container mx-auto px-4 lg:px-8 py-12">
          <div className="relative">
            {/* Preview Overlay */}
            <div className="absolute inset-0 z-50 rounded-3xl bg-background/10 backdrop-blur-[1px]"></div>
            
            <div className="grid lg:grid-cols-2 gap-12 opacity-70 pointer-events-none select-none">
              {/* Upload Section */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <h2 className="text-xl font-display font-semibold">Upload Your Design</h2>
                <div
                  className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-colors ${dragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input type="file" disabled accept=".stl,.obj,.zip" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-not-allowed" />
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-foreground font-medium mb-2">Drag & drop your file here</p>
                  <p className="text-muted-foreground text-sm">or click to browse</p>
                  <p className="text-xs text-muted-foreground mt-4">Supported: STL, OBJ, ZIP (Max 50MB)</p>
                </div>

                {file && (
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border">
                    <File className="w-8 h-8 text-primary" />
                    <div className="flex-grow">
                      <p className="font-medium text-foreground">{file.name}</p>
                      <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <Button disabled variant="ghost" size="icon" onClick={() => setFile(null)}><X className="w-4 h-4" /></Button>
                  </div>
                )}
              </motion.div>

              {/* Configuration */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <h2 className="text-xl font-display font-semibold">Configure Your Print</h2>
                
                <div className="space-y-4 p-6 rounded-2xl bg-card border border-border">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Material</label>
                    <Select disabled value={selectedMaterial} onValueChange={setSelectedMaterial}>
                      <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {materials.map((m) => (<SelectItem key={m.name} value={m.name}>{m.name} - {m.description}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Color</label>
                    <div className="flex flex-wrap gap-2">
                      {colors.map((c) => (
                        <button key={c.name} disabled onClick={() => setSelectedColor(c.name)}
                          className={`w-8 h-8 rounded-full border-2 ${selectedColor === c.name ? 'border-primary' : 'border-border'}`}
                          style={{ backgroundColor: c.hex }} title={c.name} />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Infill: {infill}%</label>
                    <Slider disabled value={infill} onValueChange={setInfill} min={10} max={100} step={5} />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Quantity</label>
                    <Input disabled type="number" min={1} value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} className="bg-secondary border-border" />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Notes (optional)</label>
                    <Textarea disabled value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Special instructions..." className="bg-secondary border-border" />
                  </div>
                </div>

                {/* Price Summary */}
                <div className="p-6 rounded-2xl bg-gradient-card border border-border">
                  <div className="flex items-center gap-2 mb-4">
                    <Calculator className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Price Estimate</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Base price</span><span>₹{basePrice.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Material ({selectedMaterial})</span><span>×{material?.priceMultiplier}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Quantity</span><span>×{quantity}</span></div>
                    <div className="border-t border-border my-2" />
                    <div className="flex justify-between text-lg font-bold"><span>Total</span><span className="text-primary">₹{calculatedPrice.toFixed(2)}</span></div>
                  </div>
                  <Button disabled size="lg" className="w-full mt-6" onClick={handleAddToCart}><ShoppingCart className="w-5 h-5 mr-2" />Add to Cart</Button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
