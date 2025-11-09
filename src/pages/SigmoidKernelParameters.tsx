import React, { useEffect, useRef, useState } from "react"; // Ensure React is imported for JSX
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const SigmoidKernelParameters = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gamma, setGamma] = useState(1.0); // Set default gamma to 1.0 for a noticeable curve

  useEffect(() => {
    draw();
  }, [gamma]);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const width = canvas.width,
      height = canvas.height,
      padding = 40;
    ctx.clearRect(0, 0, width, height);

    // axes
    ctx.strokeStyle = "#374151";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(padding, padding);
    ctx.stroke();
    ctx.fillStyle = "#374151";
    ctx.font = "12px sans-serif";
    ctx.fillText("BMI", width / 2 - 10, height - 10);
    ctx.save();
    ctx.translate(18, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("Blood Pressure", 0, 0);
    ctx.restore();

    // helper
    const sCurve = (sx: number, sy: number, ex: number, ey: number, curv: number) => {
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      for (let i = 0; i <= 120; i++) {
        const t = i / 120;
        const sig = 1 / (1 + Math.exp(-curv * (t - 0.5) * 10));
        const x = sx + (ex - sx) * t;
        const y = sy + (ey - sy) * sig;
        ctx.lineTo(x, y);
      }
      return ctx;
    };

    // regions
    ctx.fillStyle = "rgba(139, 92, 246, 0.15)";
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    sCurve(padding, height - padding, width - padding, padding, gamma * 2); // Ensure gamma is always >= 0.5
    ctx.lineTo(padding, padding);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(234, 179, 8, 0.15)";
    ctx.beginPath();
    ctx.moveTo(width - padding, height - padding);
    sCurve(padding, height - padding, width - padding, padding, gamma * 2);
    ctx.lineTo(width - padding, padding);
    ctx.closePath();
    ctx.fill();

    // boundary
    ctx.strokeStyle = "#1F2937";
    ctx.lineWidth = 3;
    sCurve(padding, height - padding, width - padding, padding, gamma * 2);
    ctx.stroke();

    // sample points
    const low = [
      { x: 0.2, y: 0.2 },
      { x: 0.28, y: 0.25 },
      { x: 0.33, y: 0.18 },
      { x: 0.37, y: 0.3 },
      { x: 0.25, y: 0.33 },
    ];
    const high = [
      { x: 0.72, y: 0.78 },
      { x: 0.75, y: 0.72 },
      { x: 0.8, y: 0.85 },
      { x: 0.67, y: 0.7 },
      { x: 0.84, y: 0.8 },
    ];
    const toXY = (p: { x: number; y: number }) => ({
      X: padding + p.x * (width - 2 * padding),
      Y: padding + (1 - p.y) * (height - 2 * padding),
    });
    low.forEach((p) => {
      const { X, Y } = toXY(p);
      ctx.fillStyle = "#8B5CF6";
      ctx.beginPath();
      ctx.arc(X, Y, 5, 0, Math.PI * 2);
      ctx.fill();
    });
    high.forEach((p) => {
      const { X, Y } = toXY(p);
      ctx.fillStyle = "#EAB308";
      ctx.beginPath();
      ctx.arc(X, Y, 5, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
            <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
              <Link to="/sigmoid-kernel">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2" /> Back to Sigmoid Kernel
                </Button>
              </Link>
              <div className="text-sm text-muted-foreground">Sigmoid Parameters</div>
            </div>
          </header>

      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <Card className="p-6 mb-6">
            <h2 className="text-2xl font-bold mb-2">What is Gamma?</h2>
            <p className="text-muted-foreground mb-4">
              The <strong>Gamma (γ)</strong> parameter controls how much influence each data point has on the decision boundary.
              Think of it as how "focused" or "spread out" the curve is:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mb-4">
              <li>A <strong>higher Gamma</strong> makes the curve steeper and more focused around individual points.</li>
              <li>A <strong>lower Gamma</strong> makes the curve smoother and more spread out, considering a broader range of points.</li>
            </ul>
            <p className="text-muted-foreground">
              In simple terms, Gamma decides whether the boundary is sharp and specific or smooth and general.
            </p>
          </Card>

          <Card className="p-6 mb-6">
            <h2 className="text-2xl font-bold mb-2">Understanding the Dataset</h2>
            <p className="text-muted-foreground mb-4">
              The dataset used in this visualization represents two groups of points:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mb-4">
              <li><strong>Group 1:</strong> Represented by purple points, this group has lower values for both features (e.g., BMI and Blood Pressure).</li>
              <li><strong>Group 2:</strong> Represented by yellow points, this group has higher values for both features.</li>
            </ul>
            <p className="text-muted-foreground">
              The goal of the Sigmoid kernel is to create a boundary that separates these two groups based on their similarity.
            </p>
          </Card>

          <Card className="p-6 mb-6">
            <h2 className="text-2xl font-bold mb-2">Tune the Sigmoid Kernel</h2>
            <p className="text-muted-foreground mb-4">Adjust Gamma to make the S‑curve softer or steeper.</p>
            <div className="border border-border rounded-lg overflow-hidden mb-4">
              <canvas ref={canvasRef} width={500} height={500} className="w-full h-auto" />
            </div>
            <div className="flex items-center gap-4">
              <span className="font-mono text-sm">Gamma: {gamma.toFixed(2)}</span>
              <input
                type="range"
                min={0.5} // Updated minimum gamma value to 0.5
                max={2}
                step={0.01}
                value={gamma}
                onChange={(e) => setGamma(parseFloat(e.target.value))}
                className="w-64 accent-primary"
              />
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-2">Advantages and Limitations of the Sigmoid Kernel</h2>
            <h3 className="text-xl font-semibold mt-4">Advantages</h3>
            <ul className="list-disc list-inside text-muted-foreground mb-4">
              <li>It is inspired by neural networks, making it useful for certain types of data where non-linear relationships exist.</li>
              <li>Can handle complex decision boundaries that are not linear.</li>
              <li>Works well when the dataset has a clear separation pattern.</li>
            </ul>
            <h3 className="text-xl font-semibold mt-4">Limitations</h3>
            <ul className="list-disc list-inside text-muted-foreground">
              <li>It does not always guarantee a positive semidefinite matrix, which can cause issues in some SVM implementations.</li>
              <li>Requires careful tuning of parameters like Gamma and the constant (r) to avoid overfitting or underfitting.</li>
              <li>May not perform well on datasets where the separation is highly complex or noisy.</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              In simple terms, the Sigmoid kernel is a good choice for certain problems, but it requires understanding its behavior and limitations to use it effectively.
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
}

export default SigmoidKernelParameters;
