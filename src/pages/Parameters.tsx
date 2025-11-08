import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Circle, Ruler, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState, useRef, useEffect, useMemo } from "react";

const Parameters = () => {
  const [marginType, setMarginType] = useState<"hard" | "soft">("hard");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svCanvasRef = useRef<HTMLCanvasElement>(null);
  const [animationState, setAnimationState] = useState<"idle" | "formed" | "removing" | "shifted">("idle");
  const [removedSVIndex, setRemovedSVIndex] = useState<number | null>(null);
  const animationStartTimeRef = useRef<number | null>(null);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Generate fixed data points with support vectors ON the margin boundaries
  const { class0Points, class1Points, misclassifiedPoints } = useMemo(() => {
    // For 800px width, 50px padding, marginWidth hard=50, soft=30
    // Boundary at x = 400 (0.5 normalized)
    // Hard margin: left margin at 0.5 - 50/700 = ~0.4286, right margin at 0.5 + 50/700 = ~0.5714
    // Soft margin: left margin at 0.5 - 30/700 = ~0.4571, right margin at 0.5 + 30/700 = ~0.5429
    
    if (marginType === "hard") {
      // Hard margin: Support vectors ON the margin boundaries (at x ≈ 0.4286 and x ≈ 0.5714)
      const hardMarginLeft = 0.5 - 50 / 700; // ≈ 0.4286
      const hardMarginRight = 0.5 + 50 / 700; // ≈ 0.5714
      
      const hardClass0 = [
        { x: 0.15, y: 0.2 }, { x: 0.2, y: 0.3 }, { x: 0.18, y: 0.45 },
        { x: 0.25, y: 0.55 }, { x: 0.22, y: 0.7 }, { x: 0.2, y: 0.85 },
        { x: 0.28, y: 0.15 }, { x: 0.26, y: 0.4 }, { x: 0.24, y: 0.6 },
        { x: 0.23, y: 0.75 },
        // Support vectors ON the right margin boundary
        { x: hardMarginRight, y: 0.3, isSupportVector: true },
        { x: hardMarginRight, y: 0.55, isSupportVector: true },
        { x: hardMarginRight, y: 0.8, isSupportVector: true },
      ];
      
      const hardClass1 = [
        { x: 0.65, y: 0.25 }, { x: 0.7, y: 0.35 }, { x: 0.68, y: 0.5 },
        { x: 0.75, y: 0.6 }, { x: 0.72, y: 0.75 }, { x: 0.7, y: 0.9 },
        { x: 0.78, y: 0.2 }, { x: 0.76, y: 0.45 }, { x: 0.74, y: 0.65 },
        { x: 0.73, y: 0.8 },
        // Support vectors ON the left margin boundary
        { x: hardMarginLeft, y: 0.25, isSupportVector: true },
        { x: hardMarginLeft, y: 0.5, isSupportVector: true },
        { x: hardMarginLeft, y: 0.75, isSupportVector: true },
      ];

      return {
        class0Points: hardClass0,
        class1Points: hardClass1,
        misclassifiedPoints: [],
      };
    } else {
      // Soft margin: Support vectors ON the margin boundaries (at x ≈ 0.4571 and x ≈ 0.5429)
      const softMarginLeft = 0.5 - 30 / 700; // ≈ 0.4571
      const softMarginRight = 0.5 + 30 / 700; // ≈ 0.5429
      
      const softClass0 = [
        { x: 0.15, y: 0.2 }, { x: 0.2, y: 0.3 }, { x: 0.18, y: 0.45 },
        { x: 0.25, y: 0.55 }, { x: 0.22, y: 0.7 }, { x: 0.2, y: 0.85 },
        { x: 0.28, y: 0.15 }, { x: 0.26, y: 0.4 }, { x: 0.24, y: 0.6 },
        // Support vectors ON the right margin boundary
        { x: softMarginRight, y: 0.3, isSupportVector: true },
        { x: softMarginRight, y: 0.55, isSupportVector: true },
        { x: softMarginRight, y: 0.8, isSupportVector: true },
      ];
      
      const softClass1 = [
        { x: 0.65, y: 0.25 }, { x: 0.7, y: 0.35 }, { x: 0.68, y: 0.5 },
        { x: 0.75, y: 0.6 }, { x: 0.72, y: 0.75 }, { x: 0.7, y: 0.9 },
        { x: 0.78, y: 0.2 }, { x: 0.76, y: 0.45 }, { x: 0.74, y: 0.65 },
        // Support vectors ON the left margin boundary
        { x: softMarginLeft, y: 0.25, isSupportVector: true },
        { x: softMarginLeft, y: 0.5, isSupportVector: true },
        { x: softMarginLeft, y: 0.75, isSupportVector: true },
      ];

      // Misclassified points (on wrong side) for soft margin
      const misclassified = [
        { x: 0.52, y: 0.4, class: 0 }, // Red point on green side
        { x: 0.54, y: 0.6, class: 0 }, // Red point on green side
        { x: 0.48, y: 0.3, class: 1 }, // Green point on red side
        { x: 0.46, y: 0.7, class: 1 }, // Green point on red side
      ];

      return {
        class0Points: softClass0,
        class1Points: softClass1,
        misclassifiedPoints: misclassified,
      };
    }
  }, [marginType]);

  useEffect(() => {
    drawVisualization();
  }, [marginType, class0Points, class1Points, misclassifiedPoints]);

  // Support Vector Animation
  useEffect(() => {
    drawSVAnimation();
  }, [animationState, removedSVIndex]);

  const drawSVAnimation = () => {
    const canvas = svCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const width = canvas.width;
    const height = canvas.height;
    const padding = 50;

    // Draw background
    ctx.fillStyle = "#f9fafb";
    ctx.fillRect(0, 0, width, height);

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
    ctx.textAlign = "center";
    ctx.fillText("Feature X", width / 2, height - 10);
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = "center";
    ctx.fillText("Feature Y", 0, 0);
    ctx.restore();

    const boundaryX = width / 2;
    const initialMarginWidth = 50;
    
    // Define all data points - only ONE support vector per class
    const allPoints = [
      // Class 0 (Red) - on left side
      { x: 0.15, y: 0.2, class: 0 },
      { x: 0.2, y: 0.35, class: 0 },
      { x: 0.18, y: 0.5, class: 0 },
      { x: 0.22, y: 0.65, class: 0 },
      { x: 0.25, y: 0.8, class: 0 },
      // Only ONE red support vector on the left margin boundary (at x = 0.4, which is boundary - marginWidth)
      // For 600px width, 50px padding: boundary at 300, marginWidth 50, so left margin at 250
      // Normalized: (250 - 50) / (600 - 100) = 200/500 = 0.4
      { x: 0.4, y: 0.5, class: 0, isSupportVector: true, index: 0 }, // Support vector on left margin
      // Class 1 (Green) - on right side
      // Right margin at: 300 + 50 = 350, normalized: (350 - 50) / 500 = 0.6
      { x: 0.6, y: 0.5, class: 1, isSupportVector: true, index: 1 }, // Support vector on right margin
      { x: 0.75, y: 0.2, class: 1 },
      { x: 0.78, y: 0.35, class: 1 },
      { x: 0.8, y: 0.5, class: 1 },
      { x: 0.76, y: 0.65, class: 1 },
      { x: 0.85, y: 0.8, class: 1 },
    ];

    // Calculate margin width based on animation state
    let marginWidth = initialMarginWidth;
    let animationProgress = 0;
    let newSupportVector: typeof allPoints[0] | null = null;

    if (animationState === "formed" || animationState === "removing" || animationState === "shifted") {
      marginWidth = initialMarginWidth;
      
      if (animationState === "removing" && animationStartTimeRef.current !== null) {
        const duration = 1500;
        const elapsed = Date.now() - animationStartTimeRef.current;
        animationProgress = Math.min(elapsed / duration, 1);
      } else if (animationState === "shifted" && removedSVIndex !== null) {
        // Calculate new margin width based on next closest point
        const removedSV = allPoints.find(p => p.isSupportVector && p.index === removedSVIndex);
        if (removedSV) {
          // Find next closest point to the original margin boundary (non-support vector points of same class)
          const sameClassPoints = allPoints.filter(
            p => p.class === removedSV.class && !p.isSupportVector
          );
          
          // Calculate distance from each point to the original margin boundary
          const originalMarginPos = removedSV.class === 0 
            ? boundaryX - initialMarginWidth  // Left margin position
            : boundaryX + initialMarginWidth;  // Right margin position
            
          const distances = sameClassPoints.map(p => {
            const px = padding + p.x * (width - 2 * padding);
            // Distance from point to the original margin boundary
            const dist = removedSV.class === 0 
              ? px - originalMarginPos  // For class 0, how far point is from left margin
              : originalMarginPos - px;  // For class 1, how far point is from right margin
            return { point: p, distance: dist, px };
          });
          
          // Find the point that is closest to the original margin (will become new support vector)
          // Positive distance means point is further from boundary (towards center)
          const closest = distances
            .filter(d => d.distance > 0) // Only points that are further from boundary
            .sort((a, b) => a.distance - b.distance)[0]; // Sort by distance, closest first
            
          if (closest) {
            newSupportVector = closest.point;
            // The new margin needs to expand outward to reach this closest point
            const expansionNeeded = closest.distance;
            // Animate margin widening to reach new support vector
            if (animationStartTimeRef.current !== null) {
              const duration = 1500;
              const elapsed = Date.now() - animationStartTimeRef.current;
              const progress = Math.min(elapsed / duration, 1);
              marginWidth = initialMarginWidth + (progress * expansionNeeded); // Widens to reach new point
            } else {
              marginWidth = initialMarginWidth + expansionNeeded;
            }
          }
        }
      }
    }

    // Draw colored regions
    const gradient1 = ctx.createLinearGradient(padding, 0, boundaryX, 0);
    gradient1.addColorStop(0, "rgba(239, 68, 68, 0.1)");
    gradient1.addColorStop(1, "rgba(239, 68, 68, 0.05)");
    ctx.fillStyle = gradient1;
    ctx.fillRect(padding, padding, boundaryX - padding, height - 2 * padding);

    const gradient2 = ctx.createLinearGradient(boundaryX, 0, width - padding, 0);
    gradient2.addColorStop(0, "rgba(16, 185, 129, 0.05)");
    gradient2.addColorStop(1, "rgba(16, 185, 129, 0.1)");
    ctx.fillStyle = gradient2;
    ctx.fillRect(boundaryX, padding, width - boundaryX - padding, height - 2 * padding);

    // Draw margin boundaries (dashed lines)
    if (animationState !== "idle") {
      ctx.strokeStyle = "#3B82F6";
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 4]);
      ctx.beginPath();
      ctx.moveTo(boundaryX - marginWidth, padding);
      ctx.lineTo(boundaryX - marginWidth, height - padding);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(boundaryX + marginWidth, padding);
      ctx.lineTo(boundaryX + marginWidth, height - padding);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw decision boundary (solid line)
    if (animationState !== "idle") {
      ctx.strokeStyle = "#1F2937";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(boundaryX, padding);
      ctx.lineTo(boundaryX, height - padding);
      ctx.stroke();
    }

    // Draw non-support vector points
    allPoints.forEach((point) => {
      if (point.isSupportVector) return; // Skip support vectors, draw them separately
      
      const x = padding + point.x * (width - 2 * padding);
      const y = padding + (1 - point.y) * (height - 2 * padding);
      ctx.fillStyle = point.class === 0 ? "#EF4444" : "#10B981";
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = point.class === 0 ? "#DC2626" : "#059669";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    // Draw support vectors (on margin boundaries)
    allPoints.forEach((point) => {
      if (!point.isSupportVector) return;
      if (removedSVIndex === point.index && animationState === "removing") {
        // Animate support vector fading out
        const fadeProgress = animationProgress;
        ctx.globalAlpha = 1 - fadeProgress;
      } else if (removedSVIndex === point.index) {
        return; // Don't draw removed support vector
      }

      const x = padding + point.x * (width - 2 * padding);
      const y = padding + (1 - point.y) * (height - 2 * padding);

      // Draw amber circle highlight
      ctx.strokeStyle = "#F59E0B";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, 11, 0, Math.PI * 2);
      ctx.stroke();

      // Draw the actual point
      ctx.fillStyle = point.class === 0 ? "#EF4444" : "#10B981";
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = point.class === 0 ? "#DC2626" : "#059669";
      ctx.lineWidth = 2;
      ctx.stroke();
      
      ctx.globalAlpha = 1; // Reset opacity
    });

    // If shifted, highlight the new support vector (next closest point)
    if (animationState === "shifted" && newSupportVector && removedSVIndex !== null) {
      const removedSV = allPoints.find(p => p.isSupportVector && p.index === removedSVIndex);
      if (removedSV) {
        const newSVx = padding + newSupportVector.x * (width - 2 * padding);
        const newSVy = padding + (1 - newSupportVector.y) * (height - 2 * padding);
        
        // Highlight new support vector with green circle (showing it's the new one)
        ctx.strokeStyle = "#22C55E";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(newSVx, newSVy, 13, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.fillStyle = newSupportVector.class === 0 ? "#EF4444" : "#10B981";
        ctx.beginPath();
        ctx.arc(newSVx, newSVy, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw connecting line from new margin boundary to new support vector
        ctx.strokeStyle = "#22C55E";
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        if (removedSV.class === 0) {
          // Left side - draw line from new left margin to new support vector
          ctx.moveTo(boundaryX - marginWidth, newSVy);
          ctx.lineTo(newSVx, newSVy);
        } else {
          // Right side - draw line from new right margin to new support vector
          ctx.moveTo(boundaryX + marginWidth, newSVy);
          ctx.lineTo(newSVx, newSVy);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // Animate continuously if in removing or shifted state
    if ((animationState === "removing" || animationState === "shifted") && animationStartTimeRef.current !== null) {
      const duration = 1500;
      const elapsed = Date.now() - animationStartTimeRef.current;
      if (elapsed < duration) {
        requestAnimationFrame(() => drawSVAnimation());
      }
    }

    // Draw legend
    ctx.fillStyle = "#374151";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "left";
    
    ctx.fillStyle = "#EF4444";
    ctx.beginPath();
    ctx.arc(padding + 10, padding + 20, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#374151";
    ctx.font = "11px sans-serif";
    ctx.fillText("Class 0", padding + 18, padding + 24);

    ctx.fillStyle = "#10B981";
    ctx.beginPath();
    ctx.arc(padding + 70, padding + 20, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#374151";
    ctx.fillText("Class 1", padding + 78, padding + 24);

    if (animationState !== "idle") {
      ctx.strokeStyle = "#F59E0B";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(padding + 130, padding + 20, 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillText("Support Vectors", padding + 145, padding + 24);
    }
  };

  const drawVisualization = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const width = canvas.width;
    const height = canvas.height;
    const padding = 50;

    // Draw background
    ctx.fillStyle = "#f9fafb";
    ctx.fillRect(0, 0, width, height);

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
    ctx.textAlign = "center";
    ctx.fillText("Feature X", width / 2, height - 10);
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = "center";
    ctx.fillText("Feature Y", 0, 0);
    ctx.restore();

    // Draw colored regions (background)
    const gradient1 = ctx.createLinearGradient(padding, 0, width / 2, 0);
    gradient1.addColorStop(0, "rgba(239, 68, 68, 0.1)");
    gradient1.addColorStop(1, "rgba(239, 68, 68, 0.05)");
    ctx.fillStyle = gradient1;
    ctx.fillRect(padding, padding, (width - 2 * padding) / 2, height - 2 * padding);

    const gradient2 = ctx.createLinearGradient(width / 2, 0, width - padding, 0);
    gradient2.addColorStop(0, "rgba(16, 185, 129, 0.05)");
    gradient2.addColorStop(1, "rgba(16, 185, 129, 0.1)");
    ctx.fillStyle = gradient2;
    ctx.fillRect(width / 2, padding, (width - 2 * padding) / 2, height - 2 * padding);

    // Calculate margin width
    const marginWidth = marginType === "hard" ? 50 : 30;
    const boundaryX = width / 2;

    // Draw margin boundaries (dashed lines)
    ctx.strokeStyle = marginType === "hard" ? "#3B82F6" : "#F59E0B";
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 4]);
    ctx.beginPath();
    ctx.moveTo(boundaryX - marginWidth, padding);
    ctx.lineTo(boundaryX - marginWidth, height - padding);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(boundaryX + marginWidth, padding);
    ctx.lineTo(boundaryX + marginWidth, height - padding);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw decision boundary (solid line)
    ctx.strokeStyle = "#1F2937";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(boundaryX, padding);
    ctx.lineTo(boundaryX, height - padding);
    ctx.stroke();

    // Draw Class 0 points (Red) - non-support vectors first
    class0Points.forEach((point) => {
      if (point.isSupportVector) return; // Skip support vectors, draw them later
      
      const x = padding + point.x * (width - 2 * padding);
      const y = padding + (1 - point.y) * (height - 2 * padding);
      ctx.fillStyle = "#EF4444";
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#DC2626";
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Draw Class 1 points (Green) - non-support vectors first
    class1Points.forEach((point) => {
      if (point.isSupportVector) return; // Skip support vectors, draw them later
      
      const x = padding + point.x * (width - 2 * padding);
      const y = padding + (1 - point.y) * (height - 2 * padding);
      ctx.fillStyle = "#10B981";
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#059669";
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Draw misclassified points (for soft margin)
    misclassifiedPoints.forEach((point) => {
      const x = padding + point.x * (width - 2 * padding);
      const y = padding + (1 - point.y) * (height - 2 * padding);
      
      // Draw error indicator
      ctx.strokeStyle = "#DC2626";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw point with reduced opacity
      ctx.fillStyle = point.class === 0 ? "rgba(239, 68, 68, 0.6)" : "rgba(16, 185, 129, 0.6)";
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();

      // Draw X mark
      ctx.strokeStyle = "#DC2626";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - 8, y - 8);
      ctx.lineTo(x + 8, y + 8);
      ctx.moveTo(x - 8, y + 8);
      ctx.lineTo(x + 8, y - 8);
      ctx.stroke();
    });

    // Draw Support Vectors - points that lie ON the margin boundaries
    // First, highlight them with amber circles
    [...class0Points, ...class1Points].forEach((point) => {
      if (!point.isSupportVector) return;
      
      const x = padding + point.x * (width - 2 * padding);
      const y = padding + (1 - point.y) * (height - 2 * padding);
      
      // Check if this is a Class 0 point by checking if it's in class0Points array
      const isClass0 = class0Points.some(p => p.x === point.x && p.y === point.y && p.isSupportVector === point.isSupportVector);
      
      // Draw amber circle highlight
      ctx.strokeStyle = "#F59E0B";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, 12, 0, Math.PI * 2);
      ctx.stroke();
      
      // Draw the actual point
      ctx.fillStyle = isClass0 ? "#EF4444" : "#10B981";
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = isClass0 ? "#DC2626" : "#059669";
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Draw legend
    ctx.fillStyle = "#374151";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "left";
    
    // Class labels
    ctx.fillStyle = "#EF4444";
    ctx.beginPath();
    ctx.arc(padding + 10, padding + 20, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#374151";
    ctx.font = "12px sans-serif";
    ctx.fillText("Class 0", padding + 20, padding + 24);

    ctx.fillStyle = "#10B981";
    ctx.beginPath();
    ctx.arc(padding + 80, padding + 20, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#374151";
    ctx.fillText("Class 1", padding + 90, padding + 24);

    // Support vector label
    ctx.strokeStyle = "#F59E0B";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(padding + 150, padding + 20, 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillText("Support Vectors", padding + 165, padding + 24);

    // Misclassified label (only for soft margin)
    if (marginType === "soft") {
      ctx.strokeStyle = "#DC2626";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(padding + 260, padding + 15);
      ctx.lineTo(padding + 268, padding + 23);
      ctx.moveTo(padding + 260, padding + 23);
      ctx.lineTo(padding + 268, padding + 15);
      ctx.stroke();
      ctx.fillText("Misclassified", padding + 275, padding + 24);
    }

    // Margin label
    ctx.fillStyle = marginType === "hard" ? "#3B82F6" : "#F59E0B";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      `Margin Width: ${marginWidth}px ${marginType === "hard" ? "(Wide)" : "(Narrow)"}`,
      width / 2,
      padding - 10
    );
  };

  const kernels = [
    {
      name: "Linear Kernel",
      icon: Ruler,
      color: "kernel-linear",
      description: "Creates straight decision boundaries",
      link: "/linear-kernel",
    },
    {
      name: "Polynomial Kernel",
      icon: Circle,
      color: "kernel-polynomial",
      description: "Creates curved boundaries using polynomial equations",
      link: "/polynomial-kernel",
    },
    {
      name: "RBF Kernel",
      icon: Sparkles,
      color: "kernel-rbf",
      description: "Most popular! Creates flexible, circular decision regions",
      link: "/rbf-kernel",
    },
    {
      name: "Sigmoid Kernel",
      icon: Shield,
      color: "kernel-sigmoid",
      description: "Creates boundaries similar to neural networks",
      link: "/sigmoid-kernel",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 gradient-hero">
        <div className="max-w-5xl mx-auto text-center text-white animate-fade-in">
          <h1 className="text-5xl font-bold mb-4">The Building Blocks of SVM</h1>
          <p className="text-xl text-white/90">Understanding parameters, margins, support vectors, and kernels</p>
        </div>
      </section>

      {/* Section 1: Margins */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-6 text-center">Understanding Parameters & Margins</h2>

          <div className="grid lg:grid-cols-2 gap-6 mb-8 items-stretch">
            <div className="space-y-6 animate-slide-up flex flex-col">
              <Card className="p-8 gradient-card">
                <h3 className="text-2xl font-semibold mb-4">What is a Margin?</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  The margin is the "safety zone" between the decision boundary and the closest data points from each class. Think of it as the width of the road between two groups.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">SVM's goal:</strong> Find the boundary that maximizes this margin, creating the widest possible separation.
                </p>
              </Card>

              <Card className="p-8 gradient-card">
                <h3 className="text-2xl font-semibold mb-4">Hard vs Soft Margin</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <h4 className="font-semibold text-lg mb-2">Hard Margin</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Like drawing a strict line that no point can cross. Every red point stays on the left, every green point stays on the right—no exceptions! This works great when your data is already neatly separated, like sorting red and green marbles that are already in separate piles.
                    </p>
                  </div>
                  <div className="p-4 bg-success/5 rounded-lg border border-success/20">
                    <h4 className="font-semibold text-lg mb-2">Soft Margin</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Like being more forgiving—a few points can be on the "wrong" side and that's okay. It's like organizing a messy room where you mostly separate items, but a few things can end up in the wrong place. This is more flexible and works even when your data isn't perfectly organized.
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="flex flex-col">
              {/* Visualization */}
              <Card className="p-8 w-full gradient-card hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                {/* Toggle Button */}
                <div className="flex-shrink-0 mb-6 flex gap-4 justify-center">
                  <Button
                    variant={marginType === "hard" ? "default" : "outline"}
                    onClick={() => setMarginType("hard")}
                    className="px-6"
                  >
                    Hard Margin
                  </Button>
                  <Button
                    variant={marginType === "soft" ? "default" : "outline"}
                    onClick={() => setMarginType("soft")}
                    className="px-6"
                  >
                    Soft Margin
                  </Button>
                </div>

                <div className="flex-shrink-0 mb-4">
                  <h3 className="text-lg font-semibold text-center mb-2">
                    {marginType === "hard" ? "Hard Margin Visualization" : "Soft Margin Visualization"}
                  </h3>
                </div>
                
                <div className="flex-shrink-0">
                  <canvas
                    ref={canvasRef}
                    width={800}
                    height={500}
                    className="w-full h-auto rounded-lg border-2 border-border shadow-lg bg-white"
                  />
                </div>

                {/* Explanation */}
                <div className={`mt-6 p-4 rounded-lg border-2 flex-shrink-0 ${
                  marginType === "hard" 
                    ? "bg-blue-50 border-blue-200" 
                    : "bg-orange-50 border-orange-200"
                }`}>
                  {marginType === "hard" ? (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-blue-900">🔒 Hard Margin (Strict Separation)</p>
                      <p className="text-xs text-blue-800 leading-relaxed mb-2">
                        Think of this like a strict teacher who says "No crossing the line!" Every point must stay on its correct side—100% perfect separation with no mistakes allowed.
                      </p>
                      <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                        <li><strong>Wide Safety Zone:</strong> Creates the biggest possible gap between the two groups (like a wide highway between neighborhoods)</li>
                        <li><strong>Zero Mistakes:</strong> Every single point is correctly placed—no red points on the green side, and no green points on the red side</li>
                        <li><strong>Best for Clean Data:</strong> Only works when your groups are already nicely separated (like when you can clearly draw a line between them)</li>
                        <li><strong>Support Vectors (⭐):</strong> The key points that define where the line goes—they're like the corner posts of a fence</li>
                      </ul>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-orange-900">🔓 Soft Margin (Flexible Separation)</p>
                      <p className="text-xs text-orange-800 leading-relaxed mb-2">
                        Think of this like a flexible teacher who says "Mostly stay on your side, but a few mistakes are okay!" This is more forgiving and works even when data is messy or mixed together.
                      </p>
                      <ul className="text-xs text-orange-800 space-y-1 list-disc list-inside">
                        <li><strong>Allows Some Mistakes:</strong> A few points can end up on the wrong side (marked with ❌)—that's totally fine!</li>
                        <li><strong>Smaller Gap, More Flexible:</strong> The separation line is closer to the points, making it more adaptable to messy or mixed-up data</li>
                        <li><strong>Works with Real Data:</strong> Perfect for situations where your data isn't perfectly organized—like real-world problems usually are</li>
                        <li><strong>Support Vectors (⭐):</strong> Even with flexibility, these special points still define where the line should go</li>
                      </ul>
                    </div>
                  )}
                </div>

                {/* Key Elements Legend */}
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-red-500"></div>
                    <span className="text-muted-foreground">Class 0 (Red)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-500"></div>
                    <span className="text-muted-foreground">Class 1 (Green)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-amber-500 rounded-full"></div>
                    <span className="text-muted-foreground">Support Vectors</span>
                  </div>
                  {marginType === "soft" && (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-red-500 border-dashed rounded-full"></div>
                      <span className="text-muted-foreground">Misclassified</span>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Support Vectors */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-8 text-center">Support Vectors: The VIP Data Points</h2>

          {/* Text Card and Visualization - Side by Side */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8 items-stretch">
            <div className="animate-slide-up">
              <Card className="p-8 gradient-card h-full flex flex-col">
                <h3 className="text-2xl font-semibold mb-4">What are Support Vectors?</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Support vectors are the data points closest to the decision boundary. They are like pillars holding up a fence—only these critical points determine where the boundary is drawn.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Key insight:</strong> All other data points could be removed without changing the boundary. Only support vectors matter!
                </p>
              </Card>
            </div>

            <div>
              <Card className="p-8 gradient-card hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                <div className="flex-shrink-0 mb-4">
                  <h3 className="text-lg font-semibold text-center mb-4">Interactive Support Vector Demonstration</h3>
                  <div className="flex gap-2 justify-center mb-4">
                    <Button
                      onClick={() => {
                        setAnimationState("formed");
                        setRemovedSVIndex(null);
                        animationStartTimeRef.current = null;
                      }}
                      size="sm"
                    >
                      Show Boundary
                    </Button>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <canvas
                    ref={svCanvasRef}
                    width={600}
                    height={500}
                    className="w-full h-auto rounded-lg border-2 border-border shadow-lg bg-white"
                  />
                </div>
                <div className="mt-4 text-center flex-shrink-0">
                  <p className="text-sm text-muted-foreground">
                    {animationState === "idle" && "Click 'Show Boundary' to see how support vectors define the margin"}
                    {animationState === "formed" && "✅ Support vectors on margin boundaries define the decision boundary and margin width"}
                    {animationState === "removing" && "🎬 Removing support vector..."}
                    {animationState === "shifted" && "📈 Margin shifted! The next closest point becomes the new support vector, making margin wider"}
                  </p>
                </div>
              </Card>
            </div>
          </div>

          {/* Three Mini Info Boxes - Centered Below */}
          <div className="flex justify-center">
            <div className="grid sm:grid-cols-3 gap-4 max-w-3xl w-full">
              {[
                { title: "Why Important?", text: "They define the entire decision boundary" },
                { title: "How Many?", text: "Usually just a small subset of all data" },
                { title: "What Makes Them Special?", text: "Closest points to the boundary" },
              ].map((item, index) => (
                <Card key={index} className="p-4 hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <h4 className="font-semibold text-sm mb-2">{item.title}</h4>
                  <p className="text-xs text-muted-foreground">{item.text}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Kernels */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold mb-4">Choose Your Kernel</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Kernels transform data to make separation easier. Different patterns require different kernels.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-8">
            {kernels.map((kernel, index) => (
              <Link key={index} to={kernel.link}>
                <Card className={`p-8 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer animate-slide-up group`} style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className={`p-4 rounded-full bg-${kernel.color}/10 w-fit mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <kernel.icon className={`w-12 h-12 text-${kernel.color}`} />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{kernel.name}</h3>
                  <p className="text-muted-foreground mb-4">{kernel.description}</p>
                  <div className="flex items-center text-primary font-semibold group-hover:translate-x-2 transition-transform duration-300">
                    Explore <ArrowRight className="ml-2 w-5 h-5" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Navigation Footer */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/">
            <Button variant="outline" size="lg">
              <ArrowLeft className="mr-2" /> Previous: Introduction
            </Button>
          </Link>
          <div className="text-sm text-muted-foreground">
            Select a kernel above to continue learning
          </div>
        </div>
      </section>
    </div>
  );
};

export default Parameters;
