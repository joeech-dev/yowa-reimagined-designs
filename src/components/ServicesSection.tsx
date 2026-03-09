import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronDown, ChevronUp, MessageSquare, Video, BookOpen, Share2, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const services = [
  {
    icon: MessageSquare,
    slug: "communication-strategy",
    title: "Communication Strategy & Advisory",
    summary:
      "Before storytelling begins, we help organisations clarify how their work is communicated. We assess messaging, audiences, and documentation systems to ensure communication aligns with programme impact and stakeholder engagement.",
    detail: (
      <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
        <p>
          We support development institutions, cooperatives, and mission-driven organisations in
          structuring and amplifying their impact through strategic communication.
        </p>
        <p>
          Our consultancy approach ensures that every visual, narrative, and digital output aligns
          with institutional goals, donor expectations, and long-term credibility.
        </p>
        <p className="font-semibold text-foreground">This includes:</p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li>Impact communication audits</li>
          <li>Visibility strategy development</li>
          <li>Donor-aligned storytelling frameworks</li>
          <li>Reporting-to-digital integration</li>
          <li>Quarterly communication planning</li>
        </ul>
        <p>
          We help institutions move from reactive communication to structured, intentional
          visibility.
        </p>
      </div>
    ),
  },
  {
    icon: Video,
    slug: "video-production",
    title: "Video & Documentary Production",
    summary:
      "We produce documentary films and visual narratives that capture real impact stories. Our productions help organisations communicate programme results, amplify community voices, and strengthen institutional visibility.",
    detail: (
      <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
        <p className="font-semibold text-foreground">Includes:</p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li>Impact documentaries</li>
          <li>Project milestone films</li>
          <li>Donor reporting videos</li>
          <li>Community transformation stories</li>
          <li>Leadership interviews</li>
          <li>Advocacy campaigns</li>
        </ul>
        <p>
          Each production is guided by narrative structure, ethical storytelling, and strategic
          distribution planning.
        </p>
      </div>
    ),
  },
  {
    icon: BookOpen,
    slug: "research-book-writing",
    title: "Research & Book Writing",
    summary:
      "We transform institutional knowledge, programmes, and insights into structured publications, reports, and books that preserve legacy, strengthen thought leadership, and contribute to sector knowledge.",
    detail: (
      <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
        <p className="font-semibold text-foreground">Includes:</p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li>Institutional history documentation</li>
          <li>Impact and narrative reports</li>
          <li>Case study compilation</li>
          <li>Leadership biographies</li>
          <li>Research-based storytelling</li>
          <li>Manuscript development and editing</li>
        </ul>
        <p>
          This service ensures your impact is not only implemented — but recorded and referenced.
        </p>
      </div>
    ),
  },
  {
    icon: Share2,
    slug: "digital-marketing",
    title: "Digital Marketing & Social Media",
    summary:
      "We manage structured digital communication for institutions that need consistent, credible online presence. Our focus is professional storytelling and stakeholder engagement—not trend-driven content.",
    detail: (
      <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
        <p className="font-semibold text-foreground">Includes:</p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li>Monthly digital strategy development</li>
          <li>Social platform management</li>
          <li>Institutional tone copywriting</li>
          <li>Content repurposing (reports → digital)</li>
          <li>Engagement monitoring</li>
          <li>Analytics and performance reporting</li>
        </ul>
        <p>
          We ensure your digital presence reflects the seriousness and value of your work.
        </p>
      </div>
    ),
  },
  {
    icon: Camera,
    slug: "photography",
    title: "Photography & Visual Documentation",
    summary:
      "We provide high-quality visual documentation that supports project reporting, institutional archives, donor communication, and media visibility.",
    detail: (
      <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
        <p className="font-semibold text-foreground">Includes:</p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li>Field documentation</li>
          <li>Leadership portraits</li>
          <li>Event coverage</li>
          <li>Project milestone photography</li>
          <li>Visual asset library development</li>
        </ul>
        <p>
          Every image is captured with ethical sensitivity and strategic purpose.
        </p>
      </div>
    ),
  },
];

const ServiceCard = ({ service }: { service: (typeof services)[0] }) => {
  const [expanded, setExpanded] = useState(false);
  const Icon = service.icon;

  return (
    <Card className="p-6 border-border hover:shadow-primary transition-smooth flex flex-col group">
      <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-smooth flex-shrink-0">
        <Icon className="text-primary-foreground" size={24} />
      </div>

      <h3 className="font-display font-semibold text-xl mb-3">{service.title}</h3>

      <p className="text-muted-foreground text-sm leading-relaxed mb-4">{service.summary}</p>

      {expanded && (
        <div className="mb-4 border-t border-border pt-4">
          {service.detail}
        </div>
      )}

      <div className="mt-auto flex flex-col gap-2">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1 text-sm text-primary hover:underline font-medium w-fit"
          aria-expanded={expanded}
          aria-label={expanded ? "Show less" : "Read more about " + service.title}
        >
          {expanded ? (
            <>
              Show less <ChevronUp size={14} />
            </>
          ) : (
            <>
              Read more <ArrowRight size={14} />
            </>
          )}
        </button>

        {expanded && (
          <Link to={`/get-started?service=${service.slug}`} className="w-full">
            <Button size="sm" className="w-full hover:scale-105 transition-smooth">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>
    </Card>
  );
};

const ServicesSection = () => {
  return (
    <section className="py-20" aria-labelledby="services-heading">
      <div className="container mx-auto px-4">
        <h2
          id="services-heading"
          className="font-display font-bold text-3xl md:text-4xl mb-4 text-center"
        >
          How We Help Organisations Communicate Impact
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Many organisations are doing powerful work but struggle to communicate their impact
          clearly. Our services help transform complex programmes into compelling stories that
          strengthen visibility, donor confidence, and public engagement.
        </p>

        {/* Schema.org structured data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              name: "Yowa Innovations Services",
              itemListElement: services.map((s, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: s.title,
                description: s.summary,
              })),
            }),
          }}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <ServiceCard key={index} service={service} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
