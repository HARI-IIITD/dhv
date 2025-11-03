import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const RBFParameters = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gamma, setGamma] = useState(1);
  const [cValue, setCValue] = useState<"low" | "high">("low");

  useEffect(() => { draw(); }, [gamma, cValue]);

  const clusters = [
    { cx: 0.25, cy: 0.7, radius: 0.16 },
    { cx: 0.65, cy: 0.35, radius: 0.13 },
    { cx: 0.5,  cy: 0.55, radius: 0.11 },
  ];

  const draw = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const width = canvas.width, height = canvas.height, padding = 40;
    ctx.clearRect(0, 0, width, height);

    // Axes
    ctx.strokeStyle = "#374151"; ctx.lineWidth = 2; ctx.beginPath();
    ctx.moveTo(padding, height - padding); ctx.lineTo(width - padding, height - padding);
    ctx.moveTo(padding, height - padding); ctx.lineTo(padding, padding); ctx.stroke();

    // Grid
    ctx.strokeStyle = "#E5E7EB"; ctx.lineWidth = 1;
    for (let i = 1; i < 5; i++) {
      const x = padding + (i * (width - 2 * padding)) / 5; const y = padding + (i * (height - 2 * padding)) / 5;
      ctx.beginPath(); ctx.moveTo(x, padding); ctx.lineTo(x, height - padding); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(padding, y); ctx.lineTo(width - padding, y); ctx.stroke();
    }

    // Sample fixed points (seeded pattern)
    const rng = (seed:number) => () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    const rand = rng(12345);

    const lows: {x:number;y:number}[] = [];
    for (let i=0;i<35;i++) {
      const p = { x: rand(), y: rand() };
      let inside = false; clusters.forEach(c => { if (Math.hypot(p.x-c.cx, p.y-c.cy) < c.radius*0.9) inside = true; });
      if (!inside) lows.push(p);
    }
    const highs: {x:number;y:number}[] = [];
    clusters.forEach(c => {
      for (let i=0;i<5;i++) {
        const ang = (Math.PI*2*i)/5 + rand()*0.4; const dist = rand()*c.radius*0.65;
        highs.push({ x: c.cx + Math.cos(ang)*dist, y: c.cy + Math.sin(ang)*dist });
      }
    });

    const drawPoint = (px:number, py:number, color:string, r:number) => {
      const x = padding + px * (width - 2 * padding);
      const y = padding + (1 - py) * (height - 2 * padding);
      ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill();
    };

    lows.forEach(p => drawPoint(p.x, p.y, "#8B5CF6", 5));
    highs.forEach(p => drawPoint(p.x, p.y, "#EAB308", 6));

    // Regions (affected by gamma), boundary thickness/opacity by C
    clusters.forEach(c => {
      const cx = padding + c.cx * (width - 2 * padding);
      const cy = padding + (1 - c.cy) * (height - 2 * padding);
      const r = c.radius * (width - 2 * padding) * (1 / gamma);
      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      const opacity = cValue === "high" ? 0.3 : 0.18;
      gradient.addColorStop(0, `rgba(234, 179, 8, ${opacity})`);
      gradient.addColorStop(1, "rgba(234, 179, 8, 0)");
      ctx.fillStyle = gradient; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = "#1F2937"; ctx.lineWidth = cValue === "high" ? 3 : 1.5; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.stroke();
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link to="/rbf-kernel"><Button variant="ghost" size="sm"><ArrowLeft className="mr-2" /> Back to RBF Kernel</Button></Link>
          <div className="text-sm text-muted-foreground">Parameters of RBF</div>
        </div>
      </header>

      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[hsl(var(--kernel-rbf))] to-[hsl(var(--success))] text-white">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-2">Parameters of RBF Kernel</h1>
          <p className="text-white/90">See how Gamma and C change the bubbles</p>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Card className="p-6 mb-8">
            <h3 className="text-2xl font-semibold mb-6">Interactive Visualization</h3>
            <div className="border border-border rounded-lg overflow-hidden mb-6">
              <canvas ref={canvasRef} width={600} height={600} className="w-full h-auto" />
            </div>
            <div className="flex flex-wrap gap-4 justify-center">
              <div className="text-center">
                <div className="font-semibold mb-2">Gamma</div>
                {[0.5,1,2].map(g => (
                  <Button key={g} variant={gamma===g?"default":"outline"} size="sm" onClick={()=>setGamma(g)} className="mx-1">{g}</Button>
                ))}
                <p className="text-xs text-muted-foreground mt-2">Small = big smooth bubbles • Large = tight bubbles</p>
              </div>
              <div className="text-center">
                <div className="font-semibold mb-2">C (strictness)</div>
                {(["low","high"] as const).map(c => (
                  <Button key={c} variant={cValue===c?"default":"outline"} size="sm" onClick={()=>setCValue(c)} className="mx-1">{c.toUpperCase()}</Button>
                ))}
                <p className="text-xs text-muted-foreground mt-2">High C draws sharper, stricter edges</p>
              </div>
            </div>
          </Card>

          {/* Parameter Explanations (plain language) */}
          <Card className="p-6 mb-8">
            <h3 className="text-xl font-semibold mb-3">What do Gamma and C mean?</h3>
            <div className="space-y-3 text-muted-foreground text-sm">
              <p>
                <strong className="text-foreground">Gamma</strong> controls the <em>size of the bubbles</em> that the model draws around groups of points.
                Imagine dropping pebbles in water: low gamma makes big, gentle ripples; high gamma makes small, tight ripples.
              </p>
              <ul className="list-disc list-inside">
                <li><strong className="text-foreground">Low Gamma</strong> (e.g., <code>0.5</code>): Large, smooth bubbles that cover more area.</li>
                <li><strong className="text-foreground">High Gamma</strong> (e.g., <code>2</code>): Small, tight bubbles that hug the dots closely.</li>
              </ul>
              <p>
                <strong className="text-foreground">C</strong> is the model’s <em>strictness</em> about drawing the boundary.
                Think of a marker: low C is a thin, forgiving line; high C is a bold, sharp line that tries to separate everything strictly.
              </p>
              <ul className="list-disc list-inside">
                <li><strong className="text-foreground">Low C</strong>: Softer, thinner edges—okay with a few mistakes to stay smooth.</li>
                <li><strong className="text-foreground">High C</strong>: Sharper, thicker edges—tries hard to separate every dot.</li>
              </ul>
            </div>
          </Card>

          <Card className="p-8">
            <h3 className="text-xl font-semibold mb-3">Advantages & Limitations (plain English)</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-success mb-2">✓ Advantages</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Great at finding round clusters (bubbles)</li>
                  <li>• Only one main dial (gamma) to tune</li>
                  <li>• A safe default when you’re unsure</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-warning mb-2">⚠ Limitations</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Too-high gamma can overreact to noise</li>
                  <li>• Can be slower than a straight-line model</li>
                  <li>• Harder to explain than simple lines</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default RBFParameters;
