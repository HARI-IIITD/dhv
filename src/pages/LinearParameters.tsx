import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Play, RotateCcw, Shuffle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

const LinearParameters = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const C_CHOICES = [1, 5, 10];
  const [cParameter, setCParameter] = useState(C_CHOICES[1]); // default: 5
  const [numSupportVectors, setNumSupportVectors] = useState(1); // for C=5 default situation
  const [points, setPoints] = useState<{ x: number; y: number; class: 0 | 1 }[]>([]);
  const [testIncome, setTestIncome] = useState(70000);
  const [testScore, setTestScore] = useState(650);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [fixedSV, setFixedSV] = useState<{ sv0: any[]; sv1: any[] } | null>(null);

  // Only set number of support vectors per class
  useEffect(() => {
    switch (cParameter) {
      case 1:
        setNumSupportVectors(2);
        break;
      case 5:
        setNumSupportVectors(1);
        break;
      case 10: // for higher C, use 2 per class
        setNumSupportVectors(2);
        break;
      default:
        setNumSupportVectors(1);
    }
  }, [cParameter]);

  // Generate points ONCE ONLY
  useEffect(() => {
    const width = 600;
    const height = 600;
    const padding = 40;
    const totalPoints = 50;
    const numPerClass = Math.floor(totalPoints / 2);
    const marginWidthData = 60;
    const pts = [];
    for (let i = 0; i < numPerClass; i++) {
      const y = padding + Math.random() * (height - 2 * padding);
      const x = padding + Math.random() * ((width / 2 - marginWidthData - 60) - padding) + 30;
      pts.push({ x, y, class: 0 });
    }
    for (let i = 0; i < numPerClass; i++) {
      const y = padding + Math.random() * (height - 2 * padding);
      const x = width / 2 + marginWidthData + 30 + Math.random() * (width - padding - (width / 2 + marginWidthData + 60));
      pts.push({ x, y, class: 1 });
    }
    setPoints(pts);
  }, []); // ONLY ONCE!

  useEffect(() => {
    if (points.length === 0) return;
    // Always select the fixed SVs as (C=5): closest to left margin and right margin (marginWidth=70/5=14, min 30)
    const width = 600;
    const marginWidth = Math.max(70 / 5, 30);
    const sv0 = points
      .filter((p) => p.class === 0)
      .map((p) => ({ ...p, dist: Math.abs(p.x - (width / 2 - marginWidth)) }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 1);
    const sv1 = points
      .filter((p) => p.class === 1)
      .map((p) => ({ ...p, dist: Math.abs(p.x - (width / 2 + marginWidth)) }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 1);
    setFixedSV({ sv0, sv1 });
  }, [points]);

  useEffect(() => {
    drawVisualization();
  }, [cParameter, points]);

  const drawVisualization = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set up coordinate system
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

    // Draw colored regions
    const gradient1 = ctx.createLinearGradient(padding, 0, width / 2, 0);
    gradient1.addColorStop(0, "rgba(239, 68, 68, 0.15)");
    gradient1.addColorStop(1, "rgba(239, 68, 68, 0.05)");
    ctx.fillStyle = gradient1;
    ctx.fillRect(padding, padding, (width - 2 * padding) / 2, height - 2 * padding);

    const gradient2 = ctx.createLinearGradient(width / 2, 0, width - padding, 0);
    gradient2.addColorStop(0, "rgba(16, 185, 129, 0.05)");
    gradient2.addColorStop(1, "rgba(16, 185, 129, 0.15)");
    ctx.fillStyle = gradient2;
    ctx.fillRect(width / 2, padding, (width - 2 * padding) / 2, height - 2 * padding);

    // Draw decision boundary (vertical line in middle for linear separation)
    ctx.strokeStyle = "#1F2937";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(width / 2, padding);
    ctx.lineTo(width / 2, height - padding);
    ctx.stroke();

    const { sv0, sv1, marginWidth } = getSupportVectors();

    // Draw margin boundaries
    ctx.strokeStyle = "#6B7280";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(width / 2 - marginWidth, padding);
    ctx.lineTo(width / 2 - marginWidth, height - padding);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(width / 2 + marginWidth, padding);
    ctx.lineTo(width / 2 + marginWidth, height - padding);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw all points (fixed positions)
    points.forEach((pt) => {
      ctx.fillStyle = pt.class === 0 ? "#EF4444" : "#10B981";
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
      ctx.fill();
    });
    // Highlight support vectors (black ring)
    [...sv0, ...sv1].forEach((pt) => {
      ctx.strokeStyle = "#1F2937";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 8, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Draw labels
    ctx.fillStyle = "#374151";
    ctx.font = "14px sans-serif";
    ctx.fillText("Class 0 (Red)", padding + 10, padding + 20);
    ctx.fillText("Class 1 (Green)", width - padding - 100, padding + 20);
  };

  const getSupportVectors = () => {
    if (!fixedSV) return { sv0: [], sv1: [], marginWidth: 30 };
    const width = 600;
    let marginWidth;
    if (cParameter === 5) {
      marginWidth = Math.max(70 / 5, 30); // C=5: margin wider
    } else if (cParameter === 10) {
      marginWidth = Math.max(30 / 10, 14); // C=10: margin narrower
    } else {
      marginWidth = Math.max(70 / cParameter, 30); // C=1 (or fallback)
    }
    // For C=1: move SVs to margin, else: leave at fixed initial positions
    let sv0 = fixedSV.sv0.map(p => cParameter === 1 ? { ...p, x: width/2 - marginWidth } : p);
    let sv1 = fixedSV.sv1.map(p => cParameter === 1 ? { ...p, x: width/2 + marginWidth } : p);
    return { sv0, sv1, marginWidth };
  };

  const playAnimation = () => {
    setIsAnimating(true);
    toast.success("Animation started!");
    setTimeout(() => {
      setIsAnimating(false);
      drawVisualization();
      toast.success("Animation complete!");
    }, 3000);
  };

  const resetVisualization = () => {
    setCParameter(C_CHOICES[0]);
    setPrediction(null);
    toast.info("Visualization reset");
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
          {/* Remove Back to Linear Kernel button */}
          <div className="text-sm text-muted-foreground">Parameters of Linear</div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[hsl(var(--kernel-linear))] to-[hsl(var(--primary-glow))] text-white">
        <div className="max-w-5xl mx-auto text-center animate-fade-in">
          <h1 className="text-5xl font-bold mb-4">Parameters of Linear Kernel</h1>
          <p className="text-xl text-white/90">Understanding How Parameters Control the SVM Model</p>
        </div>
      </section>

      {/* Parameter Explanations */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          {/* C Parameter Explanation */}
          <Card className="p-8 mb-8 gradient-card">
            <h2 className="text-3xl font-semibold mb-6">The C Parameter in Linear Kernel</h2>
            <div className="space-y-6">
              {/* Parameter definition moved here */}
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
                <p className="text-muted-foreground leading-relaxed text-lg">
                  Think of <strong className="text-foreground">parameters</strong> as simple settings that change how the model behaves. Like turning the volume on a TV, parameters make the model more or less strict so it fits your problem better.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-primary">What is C Parameter?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  The <strong className="text-foreground">C parameter</strong> is like a "strictness controller" for your SVM model. It tells the model how important it is to correctly classify every single data point versus creating a wider, more confident separation between groups.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div className="p-6 bg-success/10 border border-success/20 rounded-lg">
                  <h4 className="font-semibold text-success mb-3 text-lg flex items-center gap-2">
                    <span>📉</span> Low C Value (e.g., C = 0.1)
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-success font-bold">•</span>
                      <span><strong>Softer, More Flexible:</strong> The model is okay with making a few mistakes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-success font-bold">•</span>
                      <span><strong>Wider Margin:</strong> Creates a bigger "safety zone" between groups</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-success font-bold">•</span>
                      <span><strong>Better for Noisy Data:</strong> Works well when data points might be slightly mixed up</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-success font-bold">•</span>
                      <span><strong>Think:</strong> "A few mistakes are okay, as long as we have a wide, safe separation"</span>
                    </li>
                  </ul>
                </div>

                <div className="p-6 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <h4 className="font-semibold text-destructive mb-3 text-lg flex items-center gap-2">
                    <span>📈</span> High C Value (e.g., C = 10)
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-destructive font-bold">•</span>
                      <span><strong>Stricter, More Rigid:</strong> The model tries very hard to classify everything correctly</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-destructive font-bold">•</span>
                      <span><strong>Narrower Margin:</strong> Creates a smaller separation, but tries to avoid mistakes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-destructive font-bold">•</span>
                      <span><strong>Better for Clean Data:</strong> Works well when data is perfectly separated</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-destructive font-bold">•</span>
                      <span><strong>Think:</strong> "Every point must be correct, even if the margin is smaller"</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mt-6">
                <h4 className="font-semibold text-blue-900 mb-3">What Changes in the Visualization?</h4>
                <div className="space-y-3 text-blue-800">
                  <p className="text-sm leading-relaxed">
                    <strong>When you change the C parameter in the interactive visualization below:</strong>
                  </p>
                  <ul className="text-sm space-y-2 list-disc list-inside">
                    <li><strong>Margin Width:</strong> Lower C = wider dashed margin lines (more space between groups). Higher C = narrower margin lines (less space, but tries to fit more points correctly)</li>
                    <li><strong>Decision Boundary:</strong> The solid black line stays in the middle, but its position might shift slightly to accommodate the margin changes</li>
                    <li><strong>Support Vectors:</strong> These critical points (highlighted with circles) may change position as the margin width adjusts</li>
                    <li><strong>Colored Regions:</strong> The red and green shaded areas show the confidence zones - wider margins mean more confident predictions</li>
                  </ul>
                  <p className="text-sm mt-4 italic">
                    💡 <strong>Try it yourself!</strong> Move the C parameter slider below and watch how the margin boundaries (dashed lines) move closer together or further apart. This visual change helps you understand how C controls the "strictness" of your model.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Interactive Visualization */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Interactive Visualization</h2>
          <p className="text-center text-muted-foreground mb-8 max-w-3xl mx-auto">
            Adjust the C parameter slider below to see how it changes the margin width and decision boundary in real-time!
          </p>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="p-6">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={600}
                  className="w-full max-w-full border border-border rounded-lg"
                />
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Controls</h3>
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">C Parameter:</label>
                    <div className="flex gap-2">
                      {C_CHOICES.map((c) => (
                        <Button key={c} variant={cParameter === c ? "default" : "outline"} size="sm" onClick={() => setCParameter(c)}>
                          {c}
                        </Button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Select C to see how margin/support vectors change!</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-accent/20">
                <p className="text-xs text-muted-foreground">
                  <strong>Legend:</strong> Red dots = Rejected Loans, Green dots = Approved Loans, Black circles = Support Vectors, Solid line = Decision boundary, Dashed lines = Margins
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Combined Summary: Understanding / Advantages / Limitations */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {/* Understanding the Result column */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Understanding the Result</h2>
              <div className="space-y-3">
                <Card className="p-4 bg-primary/5">
                  <p className="text-sm">
                    <strong>Decision Boundary:</strong> The line separating approved from rejected applications. Your input values are compared against this boundary.
                  </p>
                </Card>
                <Card className="p-4 bg-warning/5">
                  <p className="text-sm">
                    <strong>Margin:</strong> Confidence zone—wider margin (low C) means more confident decisions, narrower margin (high C) means stricter classification.
                  </p>
                </Card>
                <Card className="p-4 bg-accent/10">
                  <p className="text-sm">
                    <strong>What are parameters?</strong> They’re simple settings that change how the model behaves. Like turning the volume on a TV—turning the <em>C</em> knob makes the model more or less strict about drawing the line and margins.
                  </p>
                </Card>
                <Card className="p-4 bg-success/5">
                  <p className="text-sm">
                    <strong>Support Vectors:</strong> Edge cases—applicants right on the approval threshold. These define where the boundary is drawn.
                  </p>
                </Card>
              </div>
            </div>

            {/* Advantages column */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Advantages</h2>
              <Card className="p-8 gradient-card">
                <h3 className="text-2xl font-semibold mb-6 text-success">✓ Advantages</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="text-success font-bold">•</span>
                    <span className="text-base">Simple and fast to use—like drawing the straightest possible line to separate two kinds of things.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success font-bold">•</span>
                    <span className="text-base">Easy to understand what the computer is doing—just seeing which side of a line something lands on.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success font-bold">•</span>
                    <span className="text-base">Works well when there is a clear difference between the groups (no need for complicated rules).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success font-bold">•</span>
                    <span className="text-base">You only have to adjust one 'strictness' setting (the C parameter).</span>
                  </li>
                </ul>
              </Card>
            </div>

            {/* Limitations column */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Limitations</h2>
              <Card className="p-8 gradient-card">
                <h3 className="text-2xl font-semibold mb-6 text-warning">⚠ Limitations</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="text-warning font-bold">•</span>
                    <span className="text-base">Can only draw straight lines—if the real difference is wiggly or curved, it won’t work well.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-warning font-bold">•</span>
                    <span className="text-base">Not great when the groups are mixed up or overlapping—a straight line might get confused.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-warning font-bold">•</span>
                    <span className="text-base">Can be tricked by unusual or extreme examples (outliers).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-warning font-bold">•</span>
                    <span className="text-base">Needs the data to be measured in similar ways (like apples-to-apples), or it can struggle to draw the line.</span>
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Removed duplicate summary section (bottom row) to avoid repeating content. */}

      {/* Let's take you to a new kernel type! */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-semibold mb-4">Let's take you to a new kernel type!</h2>
          <Link to="/polynomial-kernel">
            <Button variant="default" size="lg">Go to Polynomial Kernel</Button>
          </Link>
        </div>
      </section>

      {/* Navigation Footer */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/linear-kernel">
            <Button variant="outline" size="lg">
              <ArrowLeft className="mr-2" /> Back to Linear Kernel
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LinearParameters;


