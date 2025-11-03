import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

const LinearKernel = () => {
  const howItWorksCanvasRef = useRef<HTMLCanvasElement>(null);
  const [testIncome, setTestIncome] = useState(70000);
  const [testScore, setTestScore] = useState(650);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);

  useEffect(() => {
    drawHowItWorks();
  }, [currentStep]);

  const drawHowItWorks = () => {
    const canvas = howItWorksCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const width = canvas.width;
    const height = canvas.height;
    const padding = 50;

    // Draw axes
    ctx.strokeStyle = "#374151";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(padding, padding);
    ctx.stroke();

    // Draw axis labels
    ctx.fillStyle = "#374151";
    ctx.font = "14px sans-serif";
    ctx.fillText("Credit Score", width - padding - 80, height - padding + 20);
    ctx.save();
    ctx.translate(padding - 20, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("Annual Income ($)", 0, 0);
    ctx.restore();

    // Fixed data points for consistency
    const class0Points = [
      { x: 0.2, y: 0.15 }, { x: 0.25, y: 0.25 }, { x: 0.18, y: 0.35 },
      { x: 0.3, y: 0.45 }, { x: 0.22, y: 0.55 }, { x: 0.28, y: 0.65 },
      { x: 0.25, y: 0.75 }, { x: 0.2, y: 0.85 },
    ];

    const class1Points = [
      { x: 0.7, y: 0.2 }, { x: 0.75, y: 0.3 }, { x: 0.68, y: 0.4 },
      { x: 0.8, y: 0.5 }, { x: 0.72, y: 0.6 }, { x: 0.78, y: 0.7 },
      { x: 0.75, y: 0.8 }, { x: 0.7, y: 0.9 },
    ];

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

    // Step 1: Plot all data points
    if (currentStep >= 1) {
      class0Points.forEach((point) => {
        const x = padding + point.x * (width - 2 * padding);
        const y = padding + (1 - point.y) * (height - 2 * padding);
        ctx.fillStyle = "#EF4444";
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
      });

      class1Points.forEach((point) => {
        const x = padding + point.x * (width - 2 * padding);
        const y = padding + (1 - point.y) * (height - 2 * padding);
        ctx.fillStyle = "#10B981";
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Step 2: Show multiple potential separation lines
    if (currentStep === 2) {
      const lines = [
        { x: width * 0.35 },
        { x: width * 0.45 },
        { x: width * 0.5 },
        { x: width * 0.55 },
      ];

      lines.forEach((line, idx) => {
        ctx.strokeStyle = "#9CA3AF"; // All lines are candidate lines
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        const x = line.x;
        const y1 = padding;
        const y2 = height - padding;
        ctx.moveTo(x, y1);
        ctx.lineTo(x, y2);
        ctx.stroke();
      });
      ctx.setLineDash([]);
    }

    // Step 3: Show optimal line with margin
    if (currentStep >= 3) {
      // Redraw points (they may have been covered by lines in step 2)
      class0Points.forEach((point) => {
        const x = padding + point.x * (width - 2 * padding);
        const y = padding + (1 - point.y) * (height - 2 * padding);
        ctx.fillStyle = "#EF4444";
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
      });

      class1Points.forEach((point) => {
        const x = padding + point.x * (width - 2 * padding);
        const y = padding + (1 - point.y) * (height - 2 * padding);
        ctx.fillStyle = "#10B981";
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
      });
      
      const boundaryX = width / 2;
      const marginWidth = 40;

      // Draw margin region background
      const gradient1 = ctx.createLinearGradient(boundaryX - marginWidth, 0, boundaryX, 0);
      gradient1.addColorStop(0, "rgba(239, 68, 68, 0.15)");
      gradient1.addColorStop(1, "rgba(239, 68, 68, 0.05)");
      ctx.fillStyle = gradient1;
      ctx.fillRect(padding, padding, boundaryX - padding - marginWidth, height - 2 * padding);

      const gradient2 = ctx.createLinearGradient(boundaryX, 0, boundaryX + marginWidth, 0);
      gradient2.addColorStop(0, "rgba(16, 185, 129, 0.05)");
      gradient2.addColorStop(1, "rgba(16, 185, 129, 0.15)");
      ctx.fillStyle = gradient2;
      ctx.fillRect(boundaryX + marginWidth, padding, width - padding - boundaryX - marginWidth, height - 2 * padding);

      // Draw margin boundaries
      ctx.strokeStyle = "#6B7280";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(boundaryX - marginWidth, padding);
      ctx.lineTo(boundaryX - marginWidth, height - padding);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(boundaryX + marginWidth, padding);
      ctx.lineTo(boundaryX + marginWidth, height - padding);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw decision boundary
      ctx.strokeStyle = "#1F2937";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(boundaryX, padding);
      ctx.lineTo(boundaryX, height - padding);
      ctx.stroke();
    }

    // Step 4: Highlight support vectors
    if (currentStep >= 4) {
      // Support vectors are the closest points to the boundary (on margin boundaries)
      const boundaryX = width / 2;
      const marginWidth = 40;

      // Position support vectors exactly on the margin boundaries
      const sv0 = { x: boundaryX - marginWidth, y: padding + (1 - 0.5) * (height - 2 * padding), class: 0 };
      const sv1 = { x: boundaryX + marginWidth, y: padding + (1 - 0.5) * (height - 2 * padding), class: 1 };
      
      // Also add a couple more support vectors at different y positions
      const sv0b = { x: boundaryX - marginWidth, y: padding + (1 - 0.25) * (height - 2 * padding), class: 0 };
      const sv1b = { x: boundaryX + marginWidth, y: padding + (1 - 0.75) * (height - 2 * padding), class: 1 };

      const supportVectors = [sv0, sv1, sv0b, sv1b];

      // Highlight support vectors (on margin boundaries)
      supportVectors.forEach((sv) => {
        ctx.strokeStyle = "#F59E0B";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(sv.x, sv.y, 10, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = sv.class === 0 ? "#EF4444" : "#10B981";
        ctx.beginPath();
        ctx.arc(sv.x, sv.y, 5, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Draw labels
    ctx.fillStyle = "#374151";
    ctx.font = "14px sans-serif";
    ctx.fillText("Rejected (Red)", padding + 10, padding + 20);
    ctx.fillText("Approved (Green)", width - padding - 120, padding + 20);
  };

  const checkApproval = () => {
    const normalizedIncome = (testIncome - 20000) / 100000;
    const normalizedScore = (testScore - 300) / 550;
    const combined = (normalizedIncome + normalizedScore) / 2;

    if (combined > 0.5) {
      setPrediction("approved");
      toast.success("✅ Loan Approved! Strong candidate.");
    } else {
      setPrediction("rejected");
      toast.error("❌ Loan Rejected. Consider improving credit score.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link to="/parameters">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2" /> Back to Kernels
            </Button>
          </Link>
          <div className="text-sm text-muted-foreground">Linear Kernel</div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[hsl(var(--kernel-linear))] to-[hsl(var(--primary-glow))] text-white">
        <div className="max-w-5xl mx-auto text-center animate-fade-in">
          <h1 className="text-5xl font-bold mb-4">Linear Kernel in SVM</h1>
          <p className="text-xl text-white/90">The Foundation - Creating Straight Decision Boundaries</p>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-6 mb-12">
            <Card className="p-6 gradient-card hover:shadow-lg transition-all duration-300">
              <h3 className="text-xl font-semibold mb-3">What is Linear Kernel?</h3>
              <p className="text-sm text-muted-foreground">
                Creates straight decision boundaries to separate data—like drawing the straightest line to separate red and green apples.
              </p>
            </Card>
            <Card className="p-6 gradient-card hover:shadow-lg transition-all duration-300">
              <h3 className="text-xl font-semibold mb-3">When to Use</h3>
              <p className="text-sm text-muted-foreground">
                Perfect for linearly separable data: spam detection, text classification, and binary decisions.
              </p>
            </Card>
          </div>

          {/* Dataset Explanation */}
          <Card className="p-8 mb-12 gradient-card">
            <h3 className="text-2xl font-semibold mb-4">Understanding the Dataset</h3>
            <div className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                In this demonstration, we'll use a <strong className="text-foreground">bank loan approval</strong> dataset as our example. This dataset helps us understand how Linear Kernel SVM works in a real-world scenario.
              </p>
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                  <h4 className="font-semibold text-success mb-2 flex items-center gap-2">
                    <span className="text-xl">✅</span> Approved Loans
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Represented by <strong className="text-success">green points</strong> in our visualization. These are loan applications that were approved based on factors like:
                  </p>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                    <li>High annual income</li>
                    <li>Good credit score</li>
                    <li>Strong financial profile</li>
                  </ul>
                </div>
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <h4 className="font-semibold text-destructive mb-2 flex items-center gap-2">
                    <span className="text-xl">❌</span> Rejected Loans
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Represented by <strong className="text-destructive">red points</strong> in our visualization. These are loan applications that were rejected due to:
                  </p>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                    <li>Low annual income</li>
                    <li>Poor credit score</li>
                    <li>Weak financial profile</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">The Goal:</strong> Our SVM model will learn to draw a decision boundary (a straight line) that separates approved loans from rejected ones. This boundary will help the bank automatically decide whether to approve or reject future loan applications.
                </p>
              </div>
            </div>
          </Card>

          {/* How It Works - Visual */}
          <Card className="p-6 mb-8">
            <h3 className="text-2xl font-semibold mb-6">How It Works - Step by Step</h3>
            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap mb-4">
                {[1, 2, 3, 4].map((step) => (
                  <Button
                    key={step}
                    variant={currentStep === step ? "default" : "outline"}
                    onClick={() => setCurrentStep(step)}
                    size="sm"
                  >
                    Step {step}
                  </Button>
                ))}
              </div>
              {/* Move step details here and enlarge the text */}
              <div className="mt-2 mb-6 p-4 bg-muted/30 rounded-lg">
                <p className="text-lg font-semibold mb-2">
                  Step {currentStep}:
                  {currentStep === 1 && " Plot all data points in space"}
                  {currentStep === 2 && " Test multiple potential separation lines"}
                  {currentStep === 3 && " Maximize margin - select the line with widest margin"}
                  {currentStep === 4 && " Identify support vectors - highlight closest points that define boundary"}
                </p>
                <p className="text-base text-muted-foreground">
                  {currentStep === 1 && "First, we visualize all our loan applications (approved in green, rejected in red) in a 2D space where one axis represents income and the other represents credit score."}
                  {currentStep === 2 && "SVM tests different straight lines that could separate approved from rejected loans. Many lines could work, but we need to find the best one."}
                  {currentStep === 3 && "The best line is the one that creates the widest 'safety zone' (margin) between approved and rejected applications. This gives maximum confidence in our decisions."}
                  {currentStep === 4 && "The points closest to the decision boundary (on the margin lines) are called support vectors. These are the critical data points that define where the boundary should be drawn."}
                </p>
              </div>
              <div className="border border-border rounded-lg overflow-hidden">
                <canvas
                  ref={howItWorksCanvasRef}
                  width={800}
                  height={500}
                  className="w-full h-auto"
                />
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Parameters Link Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Explore Parameters?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Learn how the C parameter controls the margin and decision boundary in Linear Kernel SVM
          </p>
          <Link to="/linear-parameters">
            <Button variant="hero" size="xl" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Parameters of linear <ArrowRight className="ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LinearKernel;
