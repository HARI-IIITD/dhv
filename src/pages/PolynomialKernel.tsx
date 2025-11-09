import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const introCards = [
  {
    title: "What is Polynomial Kernel?",
    text: "Lets us draw bendy lines (or just straight, for degree 1) to split groups—like arranging a line or ribbon on a table to split two types of candies.",
  }
];

const advantages = [
  "Can handle shapes that a straight line can't—great for bendy boundaries.",
  "Finds patterns where one group wraps around the other.",
  "You only adjust how bendy the line is (the degree)."
];
const limitations = [
  "If you make it too bendy, it can start following noise instead of the real pattern.",
  "Takes a bit longer than a straight line.",
  "Won't fix things if the dots are completely mixed with no pattern."
];

const datasetText = `Imagine two types of plants with different comfort zones.
- Purple dots = shade plants (they like higher humidity around comfortable temperatures)
- Yellow dots = sun plants (they do better with lower humidity at the edges)
- Across (X-axis): Temperature (°C)
- Up (Y-axis): Humidity (%)
We draw a line or curve to separate the two plant groups. A curved (polynomial) boundary is great when a straight line isn’t enough.`;

const failedPointsDeg1 = [
  { x: 0.1, y: 0.8 }, { x: 0.2, y: 0.7 }, { x: 0.25, y: 0.6 }, { x: 0.3, y: 0.5 },
  { x: 0.15, y: 0.76 }, { x: 0.18, y: 0.62 }, { x: 0.22, y: 0.81 }, { x: 0.27, y: 0.65 },
];
const passedPointsDeg1 = [
  { x: 0.6, y: 0.2 }, { x: 0.75, y: 0.3 }, { x: 0.7, y: 0.25 }, { x: 0.8, y: 0.1 },
  { x: 0.65, y: 0.18 }, { x: 0.72, y: 0.28 }, { x: 0.8, y: 0.22 }, { x: 0.9, y: 0.25 },
];

// Degree 2/3 dataset: non-linearly separable by a straight line, separable by a U-shaped quadratic curve
// Bring points closer to the decision curve and sprinkle some towards the ends
const failedPointsDeg2 = [
  // near-boundary points slightly ABOVE the curve
  { x: 0.15, y: 0.36 }, { x: 0.25, y: 0.32 }, { x: 0.35, y: 0.29 },
  { x: 0.50, y: 0.28 }, { x: 0.65, y: 0.31 }, { x: 0.75, y: 0.33 },
  // a couple further out near the ends but still above
  { x: 0.05, y: 0.40 }, { x: 0.90, y: 0.34 },
];
const passedPointsDeg2 = [
  // near-boundary points slightly BELOW the curve
  { x: 0.15, y: 0.23 }, { x: 0.25, y: 0.18 }, { x: 0.35, y: 0.17 },
  { x: 0.50, y: 0.14 }, { x: 0.65, y: 0.18 }, { x: 0.75, y: 0.20 },
  // a couple towards the ends but still below
  { x: 0.10, y: 0.26 }, { x: 0.95, y: 0.26 },
];

const degreeLabels = {
  1: "Straight Line (Degree 1)",
  2: "Simple Curve (Degree 2)",
  3: "Wave (Degree 3)",
};

const PolynomialKernel = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [degree, setDegree] = useState(1);

  useEffect(() => {
    drawVisualization();
  }, [degree]);

  const drawVisualization = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;
    // Axes
    ctx.strokeStyle = "#374151";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(padding, padding);
    ctx.stroke();
    ctx.font = "13px sans-serif";
    ctx.fillStyle = "#374151";
    ctx.fillText("Temperature (°C)", width / 2 - 50, height - 10);
    ctx.save();
    ctx.translate(18, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("Humidity (%)", 0, 0);
    ctx.restore();
    // Grid
    ctx.strokeStyle = "#E5E7EB";
    ctx.lineWidth = 1;
    for (let i = 1; i < 5; i++) {
      const x = padding + (i * (width - 2 * padding)) / 5;
      const y = padding + (i * (height - 2 * padding)) / 5;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Dataset points (choose based on degree)
    let useFailed = degree === 1 ? failedPointsDeg1 : failedPointsDeg2;
    let usePassed = degree === 1 ? passedPointsDeg1 : passedPointsDeg2;

    // For degree 3, synthesize near-curve datasets with edge spread
    if (degree === 3) {
      const base = 0.35; // vertical shift (raised to create gap from x-axis)
      const k = 6.0;     // cubic strength for waves
      const m = -1.2;    // linear tilt to create S-shape with two turning points
      const xs = [0.05, 0.12, 0.2, 0.28, 0.36, 0.44, 0.52, 0.60, 0.68, 0.76, 0.84, 0.92, 0.97];
      const purple = [] as {x:number; y:number}[];
      const yellow = [] as {x:number; y:number}[];
      xs.forEach(nx => {
        const dx = nx - 0.5;
        const yNorm = base + k * Math.pow(dx, 3) + m * dx;
        purple.push({ x: nx, y: Math.min(0.95, yNorm + 0.06 + ((Math.random()-0.5)*0.02)) });
        yellow.push({ x: nx, y: Math.max(0.12, yNorm - 0.06 + ((Math.random()-0.5)*0.02)) });
      });
      // Add a couple of end-spread points further away
      purple.push({ x: 0.03, y: Math.min(0.98, base + k*Math.pow(0.03-0.5,3) + m*(0.03-0.5) + 0.12) });
      yellow.push({ x: 0.97, y: Math.max(0.12, base + k*Math.pow(0.97-0.5,3) + m*(0.97-0.5) - 0.12) });
      useFailed = purple;
      usePassed = yellow;
    }

    useFailed.forEach((p) => {
      const x = padding + p.x * (width - 2 * padding);
      const y = padding + (1 - p.y) * (height - 2 * padding);
      ctx.fillStyle = "#8B5CF6";
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
    });
    usePassed.forEach((p) => {
      const x = padding + p.x * (width - 2 * padding);
      const y = padding + (1 - p.y) * (height - 2 * padding);
      ctx.fillStyle = "#EAB308";
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw decision boundary for current degree
    ctx.strokeStyle = "#1F2937";
    ctx.lineWidth = 3;
    ctx.beginPath();
    if (degree === 1) {
      // diagonal straight line
      ctx.moveTo(padding, height - padding);
      ctx.lineTo(width - padding, padding);
    } else if (degree === 2) {
      // centered U-shaped quadratic with base offset for clear separation
      const a = 0.8; // bendiness
      const base = 0.2; // lift the curve upward a bit
      for (let x = padding; x < width - padding; x += 2) {
        const nx = (x - padding) / (width - 2 * padding);
        const curveYNorm = base + a * Math.pow(nx - 0.5, 2); // 0..1
        const y = height - padding - curveYNorm * (height - 2 * padding);
        if (x === padding) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
    } else {
      // degree 3: double-wavy cubic S-curve
      const base = 0.35; // raised to shift waviness upward
      const k = 6.0;
      const m = -1.2;
      for (let x = padding; x < width - padding; x += 2) {
        const nx = (x - padding) / (width - 2 * padding);
        const dx = nx - 0.5;
        const curveYNorm = base + k * Math.pow(dx, 3) + m * dx;
        const y = height - padding - curveYNorm * (height - 2 * padding);
        if (x === padding) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // Legend
    ctx.fillStyle = "#8B5CF6";
    ctx.beginPath();
    ctx.arc(padding + 20, padding + 20, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#374151";
    ctx.font = "12px sans-serif";
    ctx.fillText("Shade plants", padding + 30, padding + 24);
    ctx.fillStyle = "#EAB308";
    ctx.beginPath();
    ctx.arc(padding + 110, padding + 20, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillText("Sun plants", padding + 120, padding + 24);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link to="/parameters">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2" /> Back to Kernels
            </Button>
          </Link>
          <div className="text-sm text-muted-foreground">Polynomial Kernel</div>
        </div>
      </header>
      {/* spacer to offset the fixed header so page content starts below it */}
      <div className="h-16" aria-hidden="true" />
      <section className="py-6 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[hsl(var(--kernel-polynomial))] to-[hsl(var(--secondary))] text-white">
        <div className="max-w-5xl mx-auto text-center animate-fade-in">
          <h1 className="text-5xl font-bold mb-4">Polynomial Kernel</h1>
          <p className="text-xl text-white/90">Try curves—or even a straight line!</p>
        </div>
      </section>
      <section className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Top row: Intro and Dataset side by side */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Intro Card */}
            <Card className="p-6 gradient-card hover:shadow-lg h-full">
              <h3 className="text-xl font-semibold mb-3">{introCards[0].title}</h3>
              <p className="text-muted-foreground">{introCards[0].text}</p>
            </Card>

            {/* Dataset Card */}
            <Card className="p-6 gradient-card h-full">
              <h3 className="text-xl font-semibold mb-3">Understanding the Dataset</h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {datasetText}
              </p>
            </Card>
          </div>
          {/* Visualization section for degree 1-3 */}
          <div className="py-4 px-4 sm:px-6 lg:px-8">
            <Card className="p-6 gradient-card">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-4">Decision Boundary Visualization</h3>
                <div className="flex gap-2 justify-center mb-4">
                  {[1, 2, 3].map((d) => (
                    <Button key={d} variant={degree === d ? "default" : "outline"} size="sm" onClick={() => setDegree(d)}>
                      Degree {d}
                    </Button>
                  ))}
                </div>
                <div className="mb-4 text-muted-foreground font-medium">{degreeLabels[degree]}</div>
                <div className="max-w-3xl mx-auto">
                  <canvas ref={canvasRef} width={600} height={600} className="w-full h-auto border border-border rounded-lg shadow-sm" />
                </div>
              </div>
            </Card>
          </div>

          {/* Three-column layout for Degree, Advantages, and Limitations */}
          <section className="py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="grid md:grid-cols-3 gap-6">
                {/* Degree Explanation */}
                <Card className="p-6 gradient-card">
                  <h3 className="text-xl font-semibold mb-4">What does "degree" mean?</h3>
                  <p className="text-muted-foreground mb-4">
                    Think of <strong className="text-foreground">degree</strong> as how bendy the separating line is. Higher degree = more bend.
                  </p>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold mt-1">•</span>
                      <span><strong className="text-foreground">Degree 1:</strong> A simple straight line dividing purple and yellow.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold mt-1">•</span>
                      <span><strong className="text-foreground">Degree 2:</strong> A smooth U-shaped curve for wrapped groups.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold mt-1">•</span>
                      <span><strong className="text-foreground">Degree 3:</strong> A wavy S-shaped line for complex patterns.</span>
                    </li>
                  </ul>
                  <div className="mt-4 p-3 rounded-lg bg-muted/30">
                    <p className="text-sm text-muted-foreground">
                      <strong>💡 Tip:</strong> Start simple (Degree 1) and increase only if needed.
                    </p>
                  </div>
                </Card>

                {/* Advantages */}
                <Card className="p-6 gradient-card">
                  <h3 className="text-xl font-semibold mb-4 text-success">✓ Advantages</h3>
                  <ul className="space-y-3">
                    {advantages.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-success font-bold mt-1">•</span>
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </Card>

                {/* Limitations */}
                <Card className="p-6 gradient-card">
                  <h3 className="text-xl font-semibold mb-4 text-warning">⚠ Limitations</h3>
                  <ul className="space-y-3">
                    {limitations.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-warning font-bold mt-1">•</span>
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
            </div>
          </section>

          {/* CTA to RBF Kernel */}
          <section className="py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h3 className="text-2xl font-semibold mb-4">Ready to see an even more flexible curve?</h3>
              <p className="text-muted-foreground mb-6">Check out the RBF Kernel. It can draw very smooth shapes around clusters of points.</p>
              <Link to="/rbf-kernel">
                <Button variant="default" size="lg">Go to RBF Kernel</Button>
              </Link>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
};

export default PolynomialKernel;
