import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const SigmoidKernel = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const curvature = 0.6; // fixed curvature here; adjustable on the parameters page

  useEffect(() => {
    drawVisualization();
  }, [currentStep]);

  const drawVisualization = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;

    // Draw axes
    ctx.strokeStyle = "#374151";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(padding, padding);
    ctx.stroke();

    // Axes labels
    ctx.fillStyle = "#374151";
    ctx.font = "12px sans-serif";
    ctx.fillText("BMI", width / 2 - 10, height - 10);
    ctx.save();
    ctx.translate(15, height / 2 + 30);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("Blood Pressure (mmHg)", 0, 0);
    ctx.restore();

    // Draw grid
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

    // Draw S-shaped sigmoid boundary regions
    const drawSigmoidCurve = (startX: number, startY: number, endX: number, endY: number, curvature: number) => {
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      for (let i = 0; i <= 100; i++) {
        const t = i / 100;
        const sigmoid = 1 / (1 + Math.exp(-curvature * (t - 0.5) * 10));
        const x = startX + (endX - startX) * t;
        const y = startY + (endY - startY) * sigmoid;
        ctx.lineTo(x, y);
      }
      return ctx;
    };

    // Step 2/3: softly shade regions
    if (currentStep >= 2) {
      ctx.fillStyle = "rgba(139, 92, 246, 0.15)";
      ctx.beginPath();
      ctx.moveTo(padding, height - padding);
      drawSigmoidCurve(padding, height - padding, width - padding, padding, curvature * 2);
      ctx.lineTo(padding, padding);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "rgba(234, 179, 8, 0.15)";
      ctx.beginPath();
      ctx.moveTo(width - padding, height - padding);
      drawSigmoidCurve(padding, height - padding, width - padding, padding, curvature * 2);
      ctx.lineTo(width - padding, padding);
      ctx.closePath();
      ctx.fill();
    }

    // Step 3: main decision boundary + margins
    if (currentStep >= 3) {
      ctx.strokeStyle = "#1F2937";
      ctx.lineWidth = 3;
      drawSigmoidCurve(padding, height - padding, width - padding, padding, curvature * 2);
      ctx.stroke();

      ctx.strokeStyle = "#6B7280";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(padding, height - padding + 20);
      drawSigmoidCurve(padding, height - padding + 20, width - padding, padding + 20, curvature * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(padding, height - padding - 20);
      drawSigmoidCurve(padding, height - padding - 20, width - padding, padding - 20, curvature * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Generate low risk points (purple - lower-left)
    const lowRiskPoints = [
      { x: 0.2, y: 0.2 },
      { x: 0.3, y: 0.25 },
      { x: 0.25, y: 0.15 },
      { x: 0.35, y: 0.3 },
      { x: 0.15, y: 0.25 },
      { x: 0.4, y: 0.35 },
      { x: 0.3, y: 0.2 },
    ];

    lowRiskPoints.forEach((point) => {
      const x = padding + point.x * (width - 2 * padding);
      const y = padding + (1 - point.y) * (height - 2 * padding);
      ctx.fillStyle = "#8B5CF6";
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
      
      // Add heart icon
      ctx.fillStyle = "#8B5CF6";
      ctx.font = "12px serif";
      ctx.fillText("❤", x + 8, y + 4);
    });

    // Generate high risk points (yellow - upper-right)
    const highRiskPoints = [
      { x: 0.7, y: 0.8 },
      { x: 0.75, y: 0.75 },
      { x: 0.8, y: 0.85 },
      { x: 0.65, y: 0.7 },
      { x: 0.85, y: 0.8 },
      { x: 0.7, y: 0.9 },
    ];

    highRiskPoints.forEach((point) => {
      const x = padding + point.x * (width - 2 * padding);
      const y = padding + (1 - point.y) * (height - 2 * padding);
      ctx.fillStyle = "#EAB308";
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
      
      // Add warning icon
      ctx.fillStyle = "#EAB308";
      ctx.font = "12px serif";
      ctx.fillText("⚠", x + 8, y + 4);
    });

    // Support vectors shown only in step 3
    if (currentStep >= 3) {
      const supportVectors = [
        { x: 0.5, y: 0.48, cls: "low" },
        { x: 0.52, y: 0.52, cls: "high" },
      ];
      supportVectors.forEach((sv) => {
        const x = padding + sv.x * (width - 2 * padding);
        const y = padding + (1 - sv.y) * (height - 2 * padding);
        ctx.strokeStyle = "#1F2937";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 9, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = sv.cls === "low" ? "#8B5CF6" : "#EAB308";
        ctx.fill();
      });
    }

    // Legend
    ctx.fillStyle = "#8B5CF6";
    ctx.beginPath();
    ctx.arc(padding + 20, padding + 20, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#374151";
    ctx.font = "12px sans-serif";
    ctx.fillText("Low Risk ❤", padding + 30, padding + 24);

    ctx.fillStyle = "#EAB308";
    ctx.beginPath();
    ctx.arc(padding + 130, padding + 20, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillText("High Risk ⚠", padding + 140, padding + 24);
  };

  // No per-patient prediction here; moved to parameters page

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/parameters">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2" /> Back to Kernels
            </Button>
          </Link>
          <div className="text-sm text-muted-foreground">Sigmoid Kernel</div>
        </div>
      </header>

      <section className="py-12 px-4 bg-gradient-to-r from-[hsl(var(--kernel-sigmoid))] to-[hsl(var(--warning))] text-white">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">Sigmoid Kernel</h1>
          <p className="text-xl text-white/90">Neural Network-Style S-Shaped Boundaries</p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <Card className="p-6 mb-8">
            <h2 className="text-2xl font-bold mb-2">What is the Sigmoid Kernel?</h2>
            <p className="text-muted-foreground">
              It draws smooth S-shaped boundaries, similar to a tiny neural network. Great when your data gradually
              flips from “no” to “yes” across a soft threshold.
            </p>
          </Card>

          <Card className="p-6 mb-8">
            <h3 className="text-2xl font-semibold mb-6">How It Works - Step by Step</h3>
            <div className="flex gap-2 flex-wrap mb-4">
              {[1,2,3].map(step => (
                <Button key={step} variant={currentStep===step?"default":"outline"} onClick={()=>setCurrentStep(step)} size="sm">Step {step}</Button>
              ))}
            </div>
            <div className="mt-2 mb-6 p-4 bg-muted/30 rounded-lg">
              <p className="text-2xl font-semibold mb-2">Step {currentStep}</p>
              <p className="text-lg text-muted-foreground">
                {currentStep===1 && "Plot the data points: BMI vs Blood Pressure, low-risk (purple) and high-risk (yellow)."}
                {currentStep===2 && "Try S-shaped regions that gradually separate low and high risk."}
                {currentStep===3 && "Show the final S-shaped decision boundary with margins and support vectors."}
              </p>
            </div>
            <div className="border border-border rounded-lg overflow-hidden">
              <canvas ref={canvasRef} width={500} height={500} className="w-full h-auto" />
            </div>
          </Card>

          <Card className="p-6 bg-muted/30">
            <div className="max-w-3xl">
              <h3 className="text-xl font-semibold mb-2">Want to tune the Sigmoid Kernel?</h3>
              <p className="text-muted-foreground mb-4">Adjust Gamma and test predictions on a separate page made for parameters.</p>
              <Link to="/sigmoid-parameter">
                <Button>Go to Sigmoid Parameters</Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* Advantages/Limitations moved to RBFParameters page per request */}
    </div>
  );
};

export default SigmoidKernel;
