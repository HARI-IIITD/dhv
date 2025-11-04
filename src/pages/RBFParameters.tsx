import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const RBFParameters = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gamma, setGamma] = useState(1);
  const [cValue, setCValue] = useState<"low" | "high">("low");
  const [gammaMode, setGammaMode] = useState(0);

  useEffect(() => { draw(); }, [gamma, cValue]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0,0,340,220);

    if (gammaMode === 0) {
      // Low Gamma: 2 large circles/colors, no overlap, all points inside
      const pass = [
        {x:250,y:160},{x:265,y:174},{x:280,y:155},{x:270,y:140},{x:235,y:155},{x:255,y:180}
      ];
      const fail = [
        {x:80,y:60},{x:95,y:40},{x:110,y:50},{x:115,y:75},{x:100,y:90},{x:85,y:90}
      ];
      ctx.globalAlpha=0.20;
      ctx.beginPath();ctx.arc(260,160,48,0,2*Math.PI);ctx.fillStyle="#eab308";ctx.fill(); // Pass
      ctx.beginPath();ctx.arc(100,70,43,0,2*Math.PI);ctx.fillStyle="#a78bfa";ctx.fill(); // Fail
      ctx.globalAlpha=1.0;
      pass.forEach(p=>{ctx.beginPath();ctx.arc(p.x,p.y,7,0,2*Math.PI);ctx.fillStyle="#eab308";ctx.fill();ctx.lineWidth=2;ctx.strokeStyle="#b45309";ctx.stroke();});
      fail.forEach(p=>{ctx.beginPath();ctx.arc(p.x,p.y,7,0,2*Math.PI);ctx.fillStyle="#a78bfa";ctx.fill();ctx.lineWidth=2;ctx.strokeStyle="#6d28d9";ctx.stroke();});
    } else if (gammaMode === 1) {
      // Balanced: each big circle becomes two, each grouping half the points
      const passA=[{x:250,y:160},{x:265,y:174},{x:255,y:180}];
      const passB=[{x:280,y:155},{x:270,y:140},{x:235,y:155}];
      const failA=[{x:80,y:60},{x:95,y:40},{x:110,y:50}];
      const failB=[{x:115,y:75},{x:100,y:90},{x:85,y:90}];
      ctx.globalAlpha=0.21;
      ctx.beginPath();ctx.arc(255,170,25,0,2*Math.PI);ctx.fillStyle="#eab308";ctx.fill();
      ctx.beginPath();ctx.arc(265,150,27,0,2*Math.PI);ctx.fillStyle="#eab308";ctx.fill();
      ctx.beginPath();ctx.arc(97,52,19,0,2*Math.PI);ctx.fillStyle="#a78bfa";ctx.fill();
      ctx.beginPath();ctx.arc(105,83,18,0,2*Math.PI);ctx.fillStyle="#a78bfa";ctx.fill();
      ctx.globalAlpha=1.0;
      [...passA,...passB].forEach(p=>{ctx.beginPath();ctx.arc(p.x,p.y,7,0,2*Math.PI);ctx.fillStyle="#eab308";ctx.fill();ctx.lineWidth=2;ctx.strokeStyle="#b45309";ctx.stroke();});
      [...failA,...failB].forEach(p=>{ctx.beginPath();ctx.arc(p.x,p.y,7,0,2*Math.PI);ctx.fillStyle="#a78bfa";ctx.fill();ctx.lineWidth=2;ctx.strokeStyle="#6d28d9";ctx.stroke();});
    } else {
      // High Gamma: each of previous divides again => 4 per class (8 total), tiny tight clusters
      const passGroups=[[{x:250,y:160}], [{x:265,y:174},{x:255,y:180}], [{x:280,y:155}], [{x:270,y:140},{x:235,y:155}]];
      const failGroups=[[{x:80,y:60},{x:95,y:40}], [{x:110,y:50}], [{x:115,y:75},{x:100,y:90}], [{x:85,y:90}]];
      ctx.globalAlpha=0.23;
      // Pass groups (yellow)
      ctx.beginPath();ctx.arc(250,160,13,0,2*Math.PI);ctx.fillStyle="#eab308";ctx.fill();
      ctx.beginPath();ctx.arc(260,177,13,0,2*Math.PI);ctx.fillStyle="#eab308";ctx.fill();
      ctx.beginPath();ctx.arc(280,155,13,0,2*Math.PI);ctx.fillStyle="#eab308";ctx.fill();
      ctx.beginPath();ctx.arc(271,146,13,0,2*Math.PI);ctx.fillStyle="#eab308";ctx.fill();
      // Fail (purple)
      ctx.beginPath();ctx.arc(87,48,12,0,2*Math.PI);ctx.fillStyle="#a78bfa";ctx.fill();
      ctx.beginPath();ctx.arc(109,50,12,0,2*Math.PI);ctx.fillStyle="#a78bfa";ctx.fill();
      ctx.beginPath();ctx.arc(108,82,12,0,2*Math.PI);ctx.fillStyle="#a78bfa";ctx.fill();
      ctx.beginPath();ctx.arc(95,90,12,0,2*Math.PI);ctx.fillStyle="#a78bfa";ctx.fill();
      ctx.globalAlpha=1.0;
      passGroups.flat().forEach(p=>{ctx.beginPath();ctx.arc(p.x,p.y,7,0,2*Math.PI);ctx.fillStyle="#eab308";ctx.fill();ctx.lineWidth=2;ctx.strokeStyle="#b45309";ctx.stroke();});
      failGroups.flat().forEach(p=>{ctx.beginPath();ctx.arc(p.x,p.y,7,0,2*Math.PI);ctx.fillStyle="#a78bfa";ctx.fill();ctx.lineWidth=2;ctx.strokeStyle="#6d28d9";ctx.stroke();});
    }
  }, [gammaMode]);

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
          {/* What do Gamma and C mean? Section */}
          <Card className="p-6 mb-8">
            <h3 className="text-xl md:text-2xl font-semibold mb-3">What do Gamma and C mean?</h3>
            <div className="space-y-4 text-foreground text-base">
              <div>
                <p className="font-semibold">Gamma — how big are the “bubbles” we draw?</p>
                <p className="text-muted-foreground">
                  Think of dropping a pebble in water. The ripples can be big and gentle or small and tight.
                  <strong> Gamma</strong> is just a dial for ripple size:
                </p>
                <ul className="list-disc list-inside text-muted-foreground">
                  <li><strong>Low gamma</strong>: Big, smooth bubbles that cover a wider area. We look at the big picture.</li>
                  <li><strong>High gamma</strong>: Small, tight bubbles that hug the dots closely. We focus on tiny details.</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold">C — how strict is our boundary?</p>
                <p className="text-muted-foreground">
                  Imagine drawing a fence between two types of plants.
                  <strong> C</strong> decides how picky you are when drawing that fence:
                </p>
                <ul className="list-disc list-inside text-muted-foreground">
                  <li><strong>Small C</strong>: A relaxed fence. It stays smooth and simple, even if a few plants end up on the “wrong” side.</li>
                  <li><strong>Large C</strong>: A very picky fence. It bends and twists to keep every plant perfectly separated, even if the fence gets complicated.</li>
                </ul>
                <p className="text-muted-foreground">In short: Gamma controls bubble size; C controls how strict the boundary is.</p>
              </div>
            </div>
          </Card>
          {/* Interactive visual with Gamma mode buttons */}
          <Card className="p-6 mb-8">
            <h3 className="text-2xl font-semibold mb-4">How does Gamma change class grouping?</h3>
            <div className="flex gap-4 justify-center mb-3">
              {["Low Gamma", "Balanced", "High Gamma"].map((label, i) => (
                <button
                  key={label}
                  onClick={() => setGammaMode(i)}
                  className={`px-4 py-2 rounded font-semibold border ${gammaMode===i ? 'bg-primary text-white border-primary' : 'border-border bg-background text-primary'}`}
                >{label}</button>
              ))}
            </div>
            <div className="border border-border rounded-lg overflow-hidden mb-6 flex flex-col items-center">
              <canvas ref={canvasRef} width={340} height={220} className="bg-white w-[340px] h-[220px]" />
              <div className="flex justify-between w-full px-6 text-sm text-muted-foreground mt-1">
                <span>Hours Studied</span><span>Attendance (%)</span>
              </div>
            </div>
          </Card>

          {/* Advantages & Limitations */}
          <Card className="p-8 mb-8">
            <h3 className="text-xl font-semibold mb-3">Advantages & Limitations</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-success mb-2">Advantages</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>Works well when groups look like blobs or islands.</li>
                  <li>Flexible “bubble size” (Gamma) makes it easy to try simple or detailed fits.</li>
                  <li>Often a strong default when you don’t know which shape will fit best.</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-warning mb-2">Limitations</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>Too-high Gamma can chase noise and overfit.</li>
                  <li>May be slower than a simple straight-line model on very large datasets.</li>
                  <li>Harder to explain than a plain line because shapes can be curvy and complex.</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* CTA: Explore Sigmoid Kernel (moved below advantages) */}
          <Card className="p-6 mb-8 gradient-card hover:shadow-xl transition-all duration-300">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-semibold mb-1">Curious about the Sigmoid Kernel?</h3>
                <p className="text-muted-foreground max-w-xl">
                  Think of it like a tiny neural network inside SVM. It carves smooth S‑shaped boundaries—great when your data
                  flips from “no” to “yes” around a soft threshold. See it in action!
                </p>
              </div>
              <Link to="/sigmoid-kernel">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Explore Sigmoid Kernel
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default RBFParameters;
