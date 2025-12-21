'use client';

/**
 * PainPoints Section
 * Problem definition with Before/After comparison
 * Google DeepMind-inspired clean design
 */

const painPoints = [
  {
    before: {
      title: '2h/day',
      description: 'Manual search across portals',
    },
    after: {
      title: '0 min',
      description: 'Automated collection & alerts',
    },
    improvement: '100%',
  },
  {
    before: {
      title: '15/week',
      description: 'Missed due to keyword mismatch',
    },
    after: {
      title: 'Zero',
      description: 'Semantic analysis coverage',
    },
    improvement: '100%',
  },
  {
    before: {
      title: '3 days',
      description: 'Proposal draft writing',
    },
    after: {
      title: '30 min',
      description: 'AI generation + review',
    },
    improvement: '95%',
  },
];

export function PainPoints() {
  return (
    <section className="py-24 bg-neutral-50" id="painpoints">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <span className="inline-block px-3 py-1 mb-4 text-xs font-medium text-neutral-700 bg-neutral-100 rounded-full uppercase tracking-wider">
            Problem Space
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight">
            Before vs After
          </h2>
          <p className="mt-4 text-lg text-neutral-500">
            Eliminate repetitive inefficiencies in your bidding workflow
          </p>
        </div>

        {/* Pain Points Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {painPoints.map((point, idx) => (
            <div
              key={idx}
              className="relative bg-white rounded-2xl border border-neutral-200 overflow-hidden group hover:border-neutral-300 transition-all"
            >
              {/* Before (Problem) */}
              <div className="p-6 border-b border-neutral-100 bg-neutral-50/50">
                <div className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-2">
                  Before
                </div>
                <div className="text-2xl font-bold text-neutral-900">
                  {point.before.title}
                </div>
                <div className="mt-1 text-sm text-neutral-500">
                  {point.before.description}
                </div>
              </div>

              {/* Arrow */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-neutral-200 rounded-full flex items-center justify-center z-10">
                <svg
                  className="w-4 h-4 text-neutral-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </div>

              {/* After (Solution) */}
              <div className="p-6 bg-white">
                <div className="text-xs font-medium text-neutral-600 uppercase tracking-wider mb-2">
                  With BIDFLOW
                </div>
                <div className="text-2xl font-bold text-neutral-900">
                  {point.after.title}
                </div>
                <div className="mt-1 text-sm text-neutral-500">
                  {point.after.description}
                </div>
              </div>

              {/* Improvement Badge */}
              <div className="absolute top-4 right-4 px-2 py-1 bg-neutral-100 text-neutral-700 text-xs font-bold rounded">
                -{point.improvement}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-neutral-500">
            <span className="font-semibold text-neutral-900">127 companies</span> have automated their bidding process with BIDFLOW
          </p>
        </div>
      </div>
    </section>
  );
}

export default PainPoints;
