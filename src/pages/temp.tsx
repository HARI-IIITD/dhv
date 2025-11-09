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