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

  // Generate fixed data points with support vectors exactly on margin boundaries
  const { class0Points, class1Points, misclassifiedPoints } = useMemo(() => {
    // Hard margin vs soft margin placements (normalized coordinates)
    if (marginType === "hard") {
      // Define margin boundaries - symmetric around 0.5
      const hardMarginLeft = 0.4286;  // Left margin at 42.86%
      const hardMarginRight = 0.5714; // Right margin at 57.14%

      const hardClass0 = [
        // Regular points well within the left side
        { x: 0.15, y: 0.2, isSupportVector: false }, 
        { x: 0.2, y: 0.3, isSupportVector: false }, 
        { x: 0.18, y: 0.45, isSupportVector: false },
        { x: 0.25, y: 0.55, isSupportVector: false },
        { x: 0.3, y: 0.4, isSupportVector: false },
        // Support vectors exactly on the left margin boundary
        { x: hardMarginLeft, y: 0.3, isSupportVector: true },
        { x: hardMarginLeft, y: 0.6, isSupportVector: true },
        { x: hardMarginLeft, y: 0.8, isSupportVector: true },
      ];

      const hardClass1 = [
        // Regular points well within the right side
        { x: 0.7, y: 0.35, isSupportVector: false },
        { x: 0.75, y: 0.6, isSupportVector: false },
        { x: 0.72, y: 0.75, isSupportVector: false },
        { x: 0.78, y: 0.2, isSupportVector: false },
        { x: 0.76, y: 0.45, isSupportVector: false },
        // Support vectors exactly on the right margin boundary
        { x: hardMarginRight, y: 0.3, isSupportVector: true },
        { x: hardMarginRight, y: 0.6, isSupportVector: true },
        { x: hardMarginRight, y: 0.8, isSupportVector: true },
      ];

      return { class0Points: hardClass0, class1Points: hardClass1, misclassifiedPoints: [] };
    }

    // Soft margin: slightly closer margins and some misclassified points
    const softMarginLeft = 0.4571;
    const softMarginRight = 0.5429;

    const softClass0 = [
      { x: 0.15, y: 0.2, isSupportVector: false }, { x: 0.2, y: 0.35, isSupportVector: false }, { x: 0.18, y: 0.5, isSupportVector: false },
      { x: 0.22, y: 0.65, isSupportVector: false }, { x: 0.25, y: 0.8, isSupportVector: false },
      { x: softMarginRight, y: 0.5, isSupportVector: true },
    ];

    const softClass1 = [
      { x: 0.75, y: 0.2, isSupportVector: false }, { x: 0.78, y: 0.35, isSupportVector: false }, { x: 0.8, y: 0.5, isSupportVector: false },
      { x: 0.76, y: 0.65, isSupportVector: false }, { x: 0.85, y: 0.8, isSupportVector: false },
      { x: softMarginLeft, y: 0.5, isSupportVector: true },
    ];

    // A couple of misclassified points for soft margin demo - swapped classes
    const misclassified = [{ x: 0.52, y: 0.55, class: 1 }, { x: 0.48, y: 0.45, class: 0 }];

    return { class0Points: softClass0, class1Points: softClass1, misclassifiedPoints: misclassified };
  }, [marginType]);

  // Draw visualization when data or margin type changes
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

        // Draw legend box in top-right
    const legendX = width - padding - 160;
    const legendY = padding + 10;
    const legendWidth = 150;
    const legendHeight = marginType === "soft" ? 100 : 80;
    
    // Legend background
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.strokeStyle = "#E5E7EB";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(legendX, legendY, legendWidth, legendHeight, 8);
    ctx.fill();
    ctx.stroke();

    // Legend title
    ctx.fillStyle = "#374151";
    ctx.font = "bold 12px sans-serif";
    ctx.fillText("Legend", legendX + 10, legendY + 20);
    ctx.font = "12px sans-serif";

    // Class 0 (Red)
    ctx.fillStyle = "#EF4444";
    ctx.beginPath();
    ctx.arc(legendX + 15, legendY + 35, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#374151";
    ctx.fillText("Class 0", legendX + 25, legendY + 38);

    // Class 1 (Green)
    ctx.fillStyle = "#10B981";
    ctx.beginPath();
    ctx.arc(legendX + 15, legendY + 55, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#374151";
    ctx.fillText("Class 1", legendX + 25, legendY + 58);

    // Support Vectors
    ctx.strokeStyle = "#F59E0B";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(legendX + 15, legendY + 75, 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#374151";
    ctx.fillText("Support Vectors", legendX + 25, legendY + 78);

    // Misclassified (only for soft margin)
    if (marginType === "soft") {
      ctx.strokeStyle = "#DC2626";
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.arc(legendX + 15, legendY + 95, 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#374151";
      ctx.fillText("Misclassified", legendX + 25, legendY + 98);
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

    // Calculate margin width and boundaries
    const effectiveWidth = width - 2 * padding;
    const marginWidth = marginType === "hard" ? effectiveWidth * 0.0714 : effectiveWidth * 0.0429; // 7.14% for hard, 4.29% for soft
    const boundaryX = width / 2;

    // Draw margin boundaries (dashed lines) - symmetric around decision boundary
    ctx.strokeStyle = marginType === "hard" ? "#3B82F6" : "#F59E0B";
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 4]);
    
    // Left margin
    const leftMarginX = boundaryX - marginWidth;
    ctx.beginPath();
    ctx.moveTo(leftMarginX, padding);
    ctx.lineTo(leftMarginX, height - padding);
    ctx.stroke();
    
    // Right margin
    const rightMarginX = boundaryX + marginWidth;
    ctx.beginPath();
    ctx.moveTo(rightMarginX, padding);
    ctx.lineTo(rightMarginX, height - padding);
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

    // Draw Support Vectors with enhanced visibility and margin connection lines
    [...class0Points, ...class1Points].forEach((point) => {
      if (!point.isSupportVector) return;
      
      const x = padding + point.x * (width - 2 * padding);
      const y = padding + (1 - point.y) * (height - 2 * padding);
      
      // Check if this is a Class 0 point
      const isClass0 = class0Points.some(p => p.x === point.x && p.y === point.y);
      
      // Connect support vector to its margin with dotted line
      ctx.strokeStyle = marginType === "hard" ? "#3B82F6" : "#F59E0B";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(width/2 + (isClass0 ? -marginWidth : marginWidth), y);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Outer highlight circle
      ctx.strokeStyle = marginType === "hard" ? "#3B82F6" : "#F59E0B";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, 12, 0, Math.PI * 2);
      ctx.stroke();
      
      // White halo for contrast
      ctx.strokeStyle = "white";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.stroke();
      
      // Draw the actual point with swapped colors for soft margin support vectors
      if (marginType === "soft" && point.isSupportVector) {
        // Swap colors for support vectors in soft margin case
        ctx.fillStyle = isClass0 ? "#10B981" : "#EF4444"; // Opposite of normal
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // Point border also swapped
        ctx.strokeStyle = isClass0 ? "#059669" : "#DC2626";
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        // Normal coloring for hard margin or non-support vectors
        ctx.fillStyle = isClass0 ? "#EF4444" : "#10B981";
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // Point border
        ctx.strokeStyle = isClass0 ? "#DC2626" : "#059669";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });

    // Draw integrated legend box in top-right
    const legendX = width - padding - 180;
    const legendY = padding + 10;
    const legendWidth = 160;
    const legendHeight = marginType === "soft" ? 120 : 95;
    
    // Semi-transparent white background with border
    ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    ctx.strokeStyle = "#E5E7EB";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(legendX, legendY, legendWidth, legendHeight, 8);
    ctx.fill();
    ctx.stroke();

    // Legend title
    ctx.fillStyle = "#374151";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Legend", legendX + 12, legendY + 25);
    
    const drawLegendItem = (y: number, color: string, label: string, type: 'fill' | 'stroke' | 'support' | 'misclassified' = 'fill') => {
      const x = legendX + 12;
      
      if (type === 'support') {
        // Support vector indicator
        ctx.strokeStyle = marginType === "hard" ? "#3B82F6" : "#F59E0B";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x + 6, y, 8, 0, Math.PI * 2);
        ctx.stroke();
        
        // White halo
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x + 6, y, 5, 0, Math.PI * 2);
        ctx.stroke();
        
        // Center point - for legend show both colors side by side
        if (marginType === "soft") {
          // Split circle to show both colors in legend for soft margin
          ctx.fillStyle = "#EF4444";
          ctx.beginPath();
          ctx.arc(x + 6, y, 4, Math.PI/2, 3*Math.PI/2, false);
          ctx.fill();
          
          ctx.fillStyle = "#10B981";
          ctx.beginPath();
          ctx.arc(x + 6, y, 4, -Math.PI/2, Math.PI/2, false);
          ctx.fill();
        } else {
          // Normal single color for hard margin
          ctx.fillStyle = "#10B981";
          ctx.beginPath();
          ctx.arc(x + 6, y, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (type === 'misclassified') {
        // X mark for misclassified points
        ctx.strokeStyle = "#DC2626";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + 2, y - 4);
        ctx.lineTo(x + 10, y + 4);
        ctx.moveTo(x + 2, y + 4);
        ctx.lineTo(x + 10, y - 4);
        ctx.stroke();
      } else {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x + 6, y, 5, 0, Math.PI * 2);
        ctx.fill();
        if (type === 'stroke') {
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }
      
      // Label text
      ctx.fillStyle = "#374151";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(label, x + 18, y + 4);
    };

    // Draw legend items
    drawLegendItem(legendY + 45, "#EF4444", "Class 0", 'fill');
    drawLegendItem(legendY + 65, "#10B981", "Class 1", 'fill');
    drawLegendItem(legendY + 85, "#F59E0B", "Support Vectors", 'support');
    if (marginType === "soft") {
      drawLegendItem(legendY + 105, "#DC2626", "Misclassified", 'misclassified');
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
                {/* Plot container with integrated Controls and Legend (in-flow header) */}
                <div className="pt-4">
                  <div className="mb-4">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                      {/* Controls box (left) */}
                      <div className="flex-shrink-0">
                        <div className="bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-border shadow-sm">
                          <div className="text-sm font-semibold mb-2">Controls</div>
                          <div className="flex gap-2">
                            <Button
                              variant={marginType === "hard" ? "default" : "outline"}
                              onClick={() => setMarginType("hard")}
                              size="sm"
                            >
                              Hard
                            </Button>
                            <Button
                              variant={marginType === "soft" ? "default" : "outline"}
                              onClick={() => setMarginType("soft")}
                              size="sm"
                            >
                              Soft
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Legend box (right) */}
                      <div className="flex-shrink-0">
                        <div className="bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-border shadow-sm">
                          <div className="text-sm font-semibold mb-2">Legend</div>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-xs">
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 rounded-full bg-red-500"></div>
                              <span className="text-muted-foreground">Class 0</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 rounded-full bg-green-500"></div>
                              <span className="text-muted-foreground">Class 1</span>
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
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-0">
                    <div className="flex-shrink-0 mb-4">
                      <h3 className="text-lg font-semibold text-center mb-2">
                        {marginType === "hard" ? "Hard Margin Visualization" : "Soft Margin Visualization"}
                      </h3>
                    </div>
                    <div className="flex-shrink-0">
                      <canvas
                        ref={canvasRef}
                        width={800}
                        height={560}
                        className="w-full h-auto rounded-lg border-2 border-border shadow-lg bg-white"
                      />
                    </div>
                  </div>
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
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Support Vectors */}
      <section className="pt-4 pb-8 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-4 text-center">Support Vectors: The VIP Data Points</h2>

          {/* Text Card and Visualization - Side by Side */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8 items-stretch">
            <div className="animate-slide-up">
              <Card className="p-8 gradient-card h-full flex flex-col">
                <h3 className="text-2xl font-semibold mb-4">What are Support Vectors?</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Support vectors are the data points closest to the decision boundary. They are like pillars holding up a fence—only these critical points determine where the boundary is drawn.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  <strong className="text-foreground">Key insight:</strong> All other data points could be removed without changing the boundary. Only support vectors matter!
                </p>
                
                <div className="space-y-6 mt-4 border-t pt-6">
                  <div>
                    <h4 className="text-lg font-semibold mb-2">Why Important?</h4>
                    <p className="text-muted-foreground">They define the entire decision boundary</p>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold mb-2">How Many?</h4>
                    <p className="text-muted-foreground">Usually just a small subset of all data</p>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold mb-2">What Makes Them Special?</h4>
                    <p className="text-muted-foreground">Closest points to the boundary</p>
                  </div>
                </div>
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
