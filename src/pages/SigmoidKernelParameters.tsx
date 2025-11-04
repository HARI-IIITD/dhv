import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { RouteObject } from "react-router-dom";

const SigmoidKernelParameters = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gamma, setGamma] = useState(0.6);

  useEffect(() => { draw(); }, [gamma]);

  const draw = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const width = canvas.width, height = canvas.height, padding = 40;
    ctx.clearRect(0,0,width,height);

    // axes
    ctx.strokeStyle = '#374151'; ctx.lineWidth = 2; ctx.beginPath();
    ctx.moveTo(padding, height - padding); ctx.lineTo(width - padding, height - padding);
    ctx.moveTo(padding, height - padding); ctx.lineTo(padding, padding); ctx.stroke();
    ctx.fillStyle = '#374151'; ctx.font = '12px sans-serif';
    ctx.fillText('BMI', width/2 - 10, height - 10);
    ctx.save(); ctx.translate(18, height/2); ctx.rotate(-Math.PI/2); ctx.fillText('Blood Pressure', 0, 0); ctx.restore();

    // helper
    const sCurve = (sx:number, sy:number, ex:number, ey:number, curv:number) => {
      ctx.beginPath(); ctx.moveTo(sx, sy);
      for (let i=0;i<=120;i++) { const t=i/120; const sig=1/(1+Math.exp(-curv*(t-0.5)*10)); const x=sx+(ex-sx)*t; const y=sy+(ey-sy)*sig; ctx.lineTo(x,y);} return ctx;
    };

    // regions
    ctx.fillStyle = 'rgba(139, 92, 246, 0.15)';
    ctx.beginPath(); ctx.moveTo(padding, height - padding);
    sCurve(padding, height - padding, width - padding, padding, gamma*2);
    ctx.lineTo(padding, padding); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(234, 179, 8, 0.15)';
    ctx.beginPath(); ctx.moveTo(width - padding, height - padding);
    sCurve(padding, height - padding, width - padding, padding, gamma*2);
    ctx.lineTo(width - padding, padding); ctx.closePath(); ctx.fill();

    // boundary
    ctx.strokeStyle = '#1F2937'; ctx.lineWidth = 3; sCurve(padding, height - padding, width - padding, padding, gamma*2); ctx.stroke();

    // sample points
    const low=[{x:.2,y:.2},{x:.28,y:.25},{x:.33,y:.18},{x:.37,y:.3},{x:.25,y:.33}];
    const high=[{x:.72,y:.78},{x:.75,y:.72},{x:.8,y:.85},{x:.67,y:.7},{x:.84,y:.8}];
    const toXY=(p:{x:number;y:number})=>({X: padding + p.x*(width-2*padding), Y: padding + (1-p.y)*(height-2*padding)});
    low.forEach(p=>{ const {X,Y}=toXY(p); ctx.fillStyle='#8B5CF6'; ctx.beginPath(); ctx.arc(X,Y,5,0,Math.PI*2); ctx.fill(); });
    high.forEach(p=>{ const {X,Y}=toXY(p); ctx.fillStyle='#EAB308'; ctx.beginPath(); ctx.arc(X,Y,5,0,Math.PI*2); ctx.fill(); });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/sigmoid-kernel"><Button variant="ghost" size="sm"><ArrowLeft className="mr-2" /> Back to Sigmoid Kernel</Button></Link>
          <div className="text-sm text-muted-foreground">Sigmoid Parameters</div>
        </div>
      </header>

      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <Card className="p-6 mb-6">
            <h2 className="text-2xl font-bold mb-2">Tune the Sigmoid Kernel</h2>
            <p className="text-muted-foreground mb-4">Adjust Gamma to make the S‑curve softer or steeper.</p>
            <div className="border border-border rounded-lg overflow-hidden mb-4">
              <canvas ref={canvasRef} width={500} height={500} className="w-full h-auto" />
            </div>
            <div className="flex items-center gap-4">
              <span className="font-mono text-sm">Gamma: {gamma.toFixed(2)}</span>
              <input type="range" min={0.1} max={2} step={0.01} value={gamma} onChange={(e)=>setGamma(parseFloat(e.target.value))} className="w-64 accent-primary" />
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default SigmoidKernelParameters;

// export a RouteObject so your app router can mount this page at /sigmoid-parameter
export const sigmoidParameterRoute: RouteObject = {
	path: "/sigmoid-parameter",
	element: <SigmoidKernelParameters />,
};


