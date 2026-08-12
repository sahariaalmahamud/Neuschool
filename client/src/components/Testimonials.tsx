import { FiStar } from "react-icons/fi";

interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  course: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: "maya-chen",
    name: "Maya Chen",
    role: "Product Designer",
    course: "Editorial UI/UX Systems",
    quote:
      "Neuschool helped me stop collecting tutorials and start building with intention. The structure made the difference.",
  },
  {
    id: "daniel-brooks",
    name: "Daniel Brooks",
    role: "Software Engineer",
    course: "Full-Stack Web Engineering",
    quote:
      "The curriculum gave me a clearer path through technologies I had been trying to learn on my own for months.",
  },
  {
    id: "aisha-rahman",
    name: "Aisha Rahman",
    role: "Data Analyst",
    course: "Modern Data Analytics & Visuals",
    quote:
      "I finally understood how the pieces fit together. The projects made the learning feel practical from day one.",
  },
  {
    id: "lucas-martin",
    name: "Lucas Martin",
    role: "Frontend Developer",
    course: "Design Systems Architecture",
    quote:
      "Thoughtful, focused, and surprisingly easy to follow. I now approach frontend architecture with much more confidence.",
  },
  {
    id: "sofia-patel",
    name: "Sofia Patel",
    role: "Product Manager",
    course: "Product Strategy for Leaders",
    quote:
      "The frameworks helped me turn vague product ideas into decisions I could actually communicate with my team.",
  },
  {
    id: "ethan-williams",
    name: "Ethan Williams",
    role: "ML Engineer",
    course: "Applied Machine Learning Systems",
    quote:
      "What I appreciated most was the balance between theory and real implementation. It felt designed for the work I actually want to do.",
  },
];

export default function Testimonials() {
  return (
    <section
      className="py-16 md:py-24 bg-surface border-b border-border"
      aria-labelledby="testimonials-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-14 space-y-3 animate-slide-up">
          <div className="text-xs font-semibold uppercase tracking-widest text-accent font-sans">
            STUDENT VOICES
          </div>
          <h2
            id="testimonials-heading"
            className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-text-primary"
          >
            What Learning Can Change.
          </h2>
          <p className="font-sans text-base sm:text-lg text-text-muted leading-relaxed max-w-2xl mx-auto">
            Real perspectives from learners building skills, changing direction, and moving forward.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 animate-fade-in">
          {TESTIMONIALS.map((item) => (
            <article
              key={item.id}
              className="group rounded-lg border border-border bg-background p-6 lg:p-7 shadow-sm hover:shadow-md hover:border-border-hover transition-subtle flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* 5-Star Rating Header */}
                <div className="flex items-center gap-1" aria-label="5 out of 5 stars">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      className="w-3.5 h-3.5 text-accent fill-accent"
                      aria-hidden="true"
                    />
                  ))}
                </div>

                {/* Quote Content */}
                <blockquote className="font-serif text-lg leading-relaxed text-text-primary">
                  <span aria-hidden="true" className="font-serif text-3xl text-accent/60 mr-1 select-none">
                    &ldquo;
                  </span>
                  {item.quote}
                </blockquote>
              </div>

              {/* Author Information Footer */}
              <div className="border-t border-border pt-5 mt-6 space-y-1 font-sans">
                <div className="text-sm font-semibold text-text-primary">{item.name}</div>
                <div className="text-xs text-text-muted">{item.role}</div>
                <div className="text-xs text-accent">{item.course}</div>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom Editorial Statement */}
        <div className="mt-12 md:mt-16 pt-8 border-t border-border text-center space-y-3">
          <p className="font-serif text-xl sm:text-2xl italic text-text-primary max-w-2xl mx-auto">
            Progress feels different when you have a path.
          </p>
          <p className="font-sans text-sm text-text-muted">
            Structured learning. Practical skills. Meaningful progress.
          </p>
        </div>
      </div>
    </section>
  );
}
