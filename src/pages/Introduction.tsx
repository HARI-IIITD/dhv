import { Link } from "react-router-dom";
import { Brain, Target, TrendingUp, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Introduction = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-hero py-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-grid-white/10 bg-[size:40px_40px]" />
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="animate-fade-in">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6">
              Understanding Support Vector Machines
            </h1>
            <p className="text-xl sm:text-2xl text-white/90 max-w-3xl mx-auto">
              Learn how SVM finds the best way to separate different groups of data
            </p>
          </div>
        </div>
        {/* Floating shapes */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-float" />
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-white/10 rounded-lg animate-float-delayed" />
      </section>

      {/* What is SVM Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl font-bold mb-4">What is SVM?</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Support Vector Machines find the best way to separate different groups of data—like separating apples from oranges on a table
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <Card className="p-8 gradient-card hover:shadow-lg transition-all duration-300 hover:scale-105 animate-slide-up">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Target className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-3">The Concept</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Imagine you have red apples and green apples mixed on a table. SVM draws the widest possible path between them, ensuring maximum separation while using only the closest items (support vectors) to define the boundary.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-8 gradient-card hover:shadow-lg transition-all duration-300 hover:scale-105 animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-secondary/10">
                  <Brain className="w-8 h-8 text-secondary" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-3">How It Works</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    SVM identifies key data points called "support vectors" that lie closest to the decision boundary. These critical points determine the optimal separation line or hyperplane.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Conceptual Visualization */}
          <Card className="p-8 mb-16 gradient-card animate-slide-up">
            <div className="mb-6">
              <h3 className="text-2xl font-semibold mb-2 text-center">Visual Example</h3>
              <p className="text-muted-foreground text-center max-w-2xl mx-auto">
                Imagine you have red apples and green apples on a table. SVM draws the best line to separate them, 
                using the apples closest to the line (support vectors) to find the widest possible gap between the groups.
              </p>
            </div>
            
            {/* Table Visualization */}
            <div className="relative w-full max-w-4xl mx-auto bg-amber-50 rounded-lg border-4 border-amber-200 shadow-xl overflow-hidden">
              {/* Table surface with wood texture */}
              <div className="relative bg-gradient-to-b from-amber-100 to-amber-200 p-8 md:p-12 min-h-[400px]">
                {/* Left side - Red Apples */}
                <div className="absolute left-0 top-0 w-1/2 h-full bg-red-50/30 border-r-4 border-dashed border-red-300">
                  <div className="relative h-full p-6">
                    {/* Red Apples */}
                    {[
                      { x: "15%", y: "10%" },
                      { x: "25%", y: "25%" },
                      { x: "10%", y: "40%" },
                      { x: "30%", y: "45%" },
                      { x: "20%", y: "60%" },
                      { x: "15%", y: "75%" },
                      { x: "25%", y: "85%" },
                    ].map((pos, i) => (
                      <div
                        key={`red-${i}`}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2"
                        style={{ left: pos.x, top: pos.y }}
                      >
                        <div className="text-5xl md:text-6xl animate-bounce" style={{ animationDelay: `${i * 0.1}s`, animationDuration: "2s" }}>
                          🍎
                        </div>
                      </div>
                    ))}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold text-sm md:text-base shadow-md">
                        Red Apples
                      </span>
                    </div>
                  </div>
                </div>

                {/* Decision Boundary Line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gray-800 transform -translate-x-1/2 z-20">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 text-white px-3 py-1 rounded-lg text-xs md:text-sm font-bold whitespace-nowrap rotate-90 md:rotate-0">
                    Decision Boundary
                  </div>
                </div>

                {/* Margin boundaries (dashed lines) */}
                <div className="absolute left-[calc(50%-60px)] top-0 bottom-0 w-px border-l-2 border-dashed border-gray-400 z-10"></div>
                <div className="absolute left-[calc(50%+60px)] top-0 bottom-0 w-px border-r-2 border-dashed border-gray-400 z-10"></div>

                {/* Support Vector - ONE Red Apple at Left Margin */}
                <div
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 z-30"
                  style={{ left: "calc(50% - 60px)", top: "50%" }}
                >
                  <div className="relative">
                    <div className="text-4xl md:text-5xl">🍎</div>
                    <div className="absolute -inset-2 border-4 border-amber-500 rounded-full animate-pulse"></div>
                  </div>
                </div>

                {/* Right side - Green Apples */}
                <div className="absolute right-0 top-0 w-1/2 h-full bg-green-50/30 border-l-4 border-dashed border-green-300">
                  <div className="relative h-full p-6">
                    {/* Green Apples */}
                    {[
                      { x: "15%", y: "15%" },
                      { x: "25%", y: "30%" },
                      { x: "10%", y: "50%" },
                      { x: "30%", y: "50%" },
                      { x: "20%", y: "70%" },
                      { x: "25%", y: "85%" },
                      { x: "15%", y: "75%" },
                    ].map((pos, i) => (
                      <div
                        key={`green-${i}`}
                        className="absolute transform translate-x-1/2 -translate-y-1/2"
                        style={{ left: pos.x, top: pos.y }}
                      >
                        <div className="text-5xl md:text-6xl animate-bounce" style={{ animationDelay: `${i * 0.15}s`, animationDuration: "2s" }}>
                          🍏
                        </div>
                      </div>
                    ))}
                    <div className="absolute bottom-4 right-1/2 transform translate-x-1/2">
                      <span className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold text-sm md:text-base shadow-md">
                        Green Apples
                      </span>
                    </div>
                  </div>
                </div>

                {/* Support Vector - ONE Green Apple at Right Margin */}
                <div
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 z-30"
                  style={{ left: "calc(50% + 60px)", top: "50%" }}
                >
                  <div className="relative">
                    <div className="text-4xl md:text-5xl">🍏</div>
                    <div className="absolute -inset-2 border-4 border-amber-500 rounded-full animate-pulse"></div>
                  </div>
                </div>

                {/* Margin label */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30">
                  <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg border-2 border-gray-300 shadow-md">
                    <span className="text-xs md:text-sm text-gray-700 font-semibold">
                      💡 Margin: The safe space between groups (widest possible)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-3 bg-red-50 p-3 rounded-lg border border-red-200">
                <span className="text-3xl">🍎</span>
                <div>
                  <span className="font-semibold text-red-700">Red Group</span>
                  <p className="text-xs text-muted-foreground">Red Apples</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-green-50 p-3 rounded-lg border border-green-200">
                <span className="text-3xl">🍏</span>
                <div>
                  <span className="font-semibold text-green-700">Green Group</span>
                  <p className="text-xs text-muted-foreground">Green Apples</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-amber-50 p-3 rounded-lg border border-amber-200">
                <span className="text-2xl">⭐</span>
                <div>
                  <span className="font-semibold text-amber-700">Support Vectors</span>
                  <p className="text-xs text-muted-foreground">Apples closest to the boundary</p>
                </div>
              </div>
            </div>

            {/* Explanation Box */}
            <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900 leading-relaxed">
                <strong>💡 How it works:</strong> SVM finds the apples closest to the boundary line (support vectors) 
                and draws the line exactly in the middle of the gap between them. This creates the widest possible 
                separation, making it easy to classify new apples as red or green!
              </p>
            </div>
          </Card>

          {/* Classification vs Regression */}
          <div className="mt-12 max-w-5xl mx-auto">
            <Card className="p-8 gradient-card hover:shadow-xl transition-all duration-300">
              <div className="grid md:grid-cols-3 gap-6 items-center">
                <div className="flex justify-center md:justify-start">
                  <div className="p-4 rounded-full bg-primary/10">
                    <TrendingUp className="w-12 h-12 text-primary" />
                  </div>
                </div>
                <div className="md:col-span-2 text-center md:text-left">
                  <h2 className="text-2xl font-bold mb-3">Classification vs Regression</h2>
                  <div className="space-y-3 text-muted-foreground">
                    <p className="leading-relaxed">
                      SVM can do two main things: <strong className="text-foreground">Classification</strong> (putting things into categories) 
                      and <strong className="text-foreground">Regression</strong> (predicting numbers). 
                    </p>
                    <p className="leading-relaxed">
                      <strong className="text-primary">This course focuses on Classification</strong>—the type shown in the visualization above. 
                      It's like sorting emails into "spam" or "not spam", or diagnosing if someone is "healthy" or "sick". 
                      You're putting things into clear groups, just like separating red apples from green apples!
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Understanding Parameters and Margin */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <Card className="p-8 gradient-card hover:shadow-xl transition-all duration-300">
            <h2 className="text-2xl font-bold mb-4">Understanding Parameters and Margin</h2>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <p className="text-lg font-semibold text-foreground">Q: What is a parameter?</p>
                <p className="leading-relaxed">
                  Think of a parameter as a simple setting or knob you can turn to change how the model behaves. 
                  Just like adjusting the volume on a speaker, parameters let us make the model more relaxed or more strict. 
                  In SVM, these settings can affect how wide the safe space (margin) is between groups and how much the model
                  cares about avoiding mistakes. You don’t need any math to get the idea—parameters are just controls that help
                  the model separate things more clearly.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 gradient-hero">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Dive Deeper?</h2>
          <p className="text-xl text-white/90 mb-8">
            Learn about SVM parameters, kernels, and how to build your own models
          </p>
          <Link to="/parameters">
            <Button variant="hero" size="xl" className="bg-white text-primary hover:bg-white/90">
              Explore Parameters & Kernels <ArrowRight className="ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Introduction;
