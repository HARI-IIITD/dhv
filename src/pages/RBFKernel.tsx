import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const steps = [
  { label: "Plot all customers", detail: "Each dot is a customer: age (left/right) and purchases (up/down)." },
  { label: "Try circular boundaries", detail: "We test different circle sizes to see what best groups similar customers." },
  { label: "Show best regions", detail: "We draw smooth, round areas that capture the clusters (islands)." },
];

const introCards = [
  { title: "What is RBF Kernel?", text: "Draws smooth, round shapes—like bubbles—around groups of points." },
  { title: "When to Use", text: "When your data forms blobs or islands that a straight line can’t separate." },
];

const datasetText = "We’re looking at customers by age (X) and monthly purchases (Y). Yellow dots form ‘high-interest’ islands. Purple dots are outside. We want smooth circles around the islands so the computer knows who is likely high-interest.";

const RBFKernel = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gamma, setGamma] = useState(1);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => { drawVisualization(); }, [gamma, currentStep]);

  const drawVisualization = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const width = canvas.width, height = canvas.height, padding = 40;

    // Axes
    ctx.strokeStyle = "#374151"; ctx.lineWidth = 2; ctx.beginPath();
    ctx.moveTo(padding, height - padding); ctx.lineTo(width - padding, height - padding);
    ctx.moveTo(padding, height - padding); ctx.lineTo(padding, padding); ctx.stroke();
    ctx.fillStyle = "#374151"; ctx.font = "13px sans-serif";
    ctx.fillText("Age", width / 2 - 10, height - 10);
    ctx.save(); ctx.translate(18, height / 2); ctx.rotate(-Math.PI / 2); ctx.fillText("Monthly Purchases", 0, 0); ctx.restore();

    // Grid
    ctx.strokeStyle = "#E5E7EB"; ctx.lineWidth = 1;
    for (let i = 1; i < 5; i++) {
      const x = padding + (i * (width - 2 * padding)) / 5; const y = padding + (i * (height - 2 * padding)) / 5;
      ctx.beginPath(); ctx.moveTo(x, padding); ctx.lineTo(x, height - padding); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(padding, y); ctx.lineTo(width - padding, y); ctx.stroke();
    }

    // Clusters
    const clusters = [
      { cx: 0.25, cy: 0.7, radius: 0.16 },
      { cx: 0.65, cy: 0.35, radius: 0.13 },
      { cx: 0.5,  cy: 0.55, radius: 0.11 },
    ];

    // Points
    const lowInterestPoints: {x:number;y:number}[] = [];
    for (let i = 0; i < 30; i++) {
      const p = { x: Math.random(), y: Math.random() };
      let inCluster = false;
      for (const c of clusters) {
        const d = Math.hypot(p.x - c.cx, p.y - c.cy);
        if (d < c.radius * 0.9) { inCluster = true; break; }
      }
      if (!inCluster) lowInterestPoints.push(p);
    }

    const drawPoint = (px:number, py:number, color:string, r:number) => {
      const x = padding + px * (width - 2 * padding);
      const y = padding + (1 - py) * (height - 2 * padding);
      ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill();
    };

    // Step 1: plot all points
    if (currentStep >= 1) {
      lowInterestPoints.forEach(p => drawPoint(p.x, p.y, "#8B5CF6", 5));
      clusters.forEach(c => {
        for (let i = 0; i < 8; i++) {
          const ang = (Math.PI*2*i)/8 + Math.random()*0.4;
          const dist = Math.random()*c.radius*0.65;
          drawPoint(c.cx + Math.cos(ang)*dist, c.cy + Math.sin(ang)*dist, "#EAB308", 6);
        }
      });
    }

    // Step 2: candidate circles
    if (currentStep === 2) {
      const candidates = [1.1, 1.0, 0.9];
      ctx.setLineDash([6,5]); ctx.strokeStyle = "#A5B4FC"; ctx.lineWidth = 2;
      clusters.forEach(c => {
        const centerX = padding + c.cx * (width - 2 * padding);
        const centerY = padding + (1 - c.cy) * (height - 2 * padding);
        candidates.forEach(s => { ctx.beginPath(); ctx.arc(centerX, centerY, c.radius*(width-2*padding)*s, 0, Math.PI*2); ctx.stroke(); });
      });
      ctx.setLineDash([]);
    }

    // Step 3: show regions and boundaries using gamma
    if (currentStep >= 3) {
      clusters.forEach(c => {
        const cx = padding + c.cx * (width - 2 * padding);
        const cy = padding + (1 - c.cy) * (height - 2 * padding);
        const r = c.radius * (width - 2 * padding) * (1 / gamma);
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        gradient.addColorStop(0, "rgba(234, 179, 8, 0.25)");
        gradient.addColorStop(1, "rgba(234, 179, 8, 0)");
        ctx.fillStyle = gradient; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.fill();
      });
      clusters.forEach(c => {
        const cx = padding + c.cx * (width - 2 * padding);
        const cy = padding + (1 - c.cy) * (height - 2 * padding);
        const r = c.radius * (width - 2 * padding) * (1 / gamma);
        ctx.strokeStyle = "#1F2937"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.stroke();
      });
    }

    // Legend
    ctx.fillStyle = "#8B5CF6"; ctx.beginPath(); ctx.arc(padding+20, padding+20, 5, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = "#374151"; ctx.font = "12px sans-serif"; ctx.fillText("Low Interest", padding+30, padding+24);
    ctx.fillStyle = "#EAB308"; ctx.beginPath(); ctx.arc(padding+120, padding+20, 5, 0, Math.PI*2); ctx.fill(); ctx.fillText("High Interest", padding+130, padding+24);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link to="/parameters">
            <Button variant="ghost" size="sm"><ArrowLeft className="mr-2" /> Back to Kernels</Button>
          </Link>
          <div className="text-sm text-muted-foreground">RBF Kernel</div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[hsl(var(--kernel-rbf))] to-[hsl(var(--success))] text-white">
        <div className="max-w-5xl mx-auto text-center animate-fade-in">
          <h1 className="text-5xl font-bold mb-4">RBF Kernel (Radial Basis Function)</h1>
          <p className="text-xl text-white/90">Bubbles around clusters – super flexible</p>
        </div>
      </section>

      {/* Intro Cards + Dataset */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-6 mb-12">
            {introCards.map((c, i) => (
              <Card key={i} className="p-6 gradient-card hover:shadow-lg">
                <h3 className="text-xl font-semibold mb-3">{c.title}</h3>
                <p className="text-sm text-muted-foreground">{c.text}</p>
              </Card>
            ))}
          </div>
          <Card className="p-8 mb-12 gradient-card">
            <h3 className="text-2xl font-semibold mb-4">Understanding the Dataset</h3>
            <p className="text-muted-foreground leading-relaxed">{datasetText}</p>
          </Card>

          {/* Step-by-step Visual */}
          <Card className="p-6 mb-8">
            <h3 className="text-2xl font-semibold mb-6">How It Works - Step by Step</h3>
            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap mb-4">
                {[1,2,3].map(step => (
                  <Button key={step} variant={currentStep===step?"default":"outline"} onClick={()=>setCurrentStep(step)} size="sm">Step {step}</Button>
                ))}
              </div>
              <div className="mt-2 mb-6 p-4 bg-muted/30 rounded-lg">
                <p className="text-2xl font-semibold mb-2">Step {currentStep}: {steps[currentStep-1].label}</p>
                <p className="text-lg text-muted-foreground">{steps[currentStep-1].detail}</p>
              </div>
              <div className="border border-border rounded-lg overflow-hidden">
                <canvas ref={canvasRef} width={500} height={500} className="w-full h-auto" />
              </div>
            </div>
          </Card>

          {/* Parameters CTA */}
          <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">Ready to Explore Parameters?</h2>
              <p className="text-xl text-muted-foreground mb-8">Learn how Gamma and C change the RBF decision regions.</p>
              <Link to="/rbf-parameters">
                <Button variant="hero" size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">Learn RBF Parameters</Button>
              </Link>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
};

export default RBFKernel;
