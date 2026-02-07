import { Helmet } from "react-helmet";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  url?: string;
  type?: "website" | "article" | "service";
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
}

const SEO = ({
  title = "Yowa Innovations | Content Creation & Advertising Agency in Uganda",
  description = "Award-winning content creation and advertising agency in Uganda. We specialize in video production, photography, digital marketing, and creative strategy for NGOs, corporates, and startups across East Africa.",
  keywords = "content creation agency Uganda, advertising agency Kampala, video production East Africa, documentary production, digital marketing Uganda, creative agency Africa, visual storytelling, photography services, NGO communications, corporate video production",
  ogImage = "/og-image.png",
  url = "https://yowainnovations.com",
  type = "website",
  publishedTime,
  modifiedTime,
  author = "Yowa Innovations",
}: SEOProps) => {
  // Organization Schema for AEO
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Yowa Innovations",
    alternateName: "Yowa Innovations Ltd",
    url: "https://yowainnovations.com",
    logo: "https://yowainnovations.com/logo.png",
    description: "Content creation and advertising agency in Uganda specializing in video production, photography, and digital marketing.",
    foundingDate: "2018",
    founders: [
      {
        "@type": "Person",
        name: "Yowa Innovations Team"
      }
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Kampala",
      addressCountry: "Uganda"
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["English", "Swahili"]
    },
    sameAs: [
      "https://twitter.com/yowainnovations",
      "https://www.linkedin.com/company/yowainnovations",
      "https://www.facebook.com/yowainnovations",
      "https://www.instagram.com/yowainnovations"
    ],
    areaServed: {
      "@type": "GeoCircle",
      geoMidpoint: {
        "@type": "GeoCoordinates",
        latitude: 0.3476,
        longitude: 32.5825
      },
      geoRadius: "2000 km"
    }
  };

  // Local Business Schema
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://yowainnovations.com/#business",
    name: "Yowa Innovations",
    image: "https://yowainnovations.com/logo.png",
    description: "Content creation and advertising agency specializing in video production, photography, digital marketing, and creative strategy.",
    url: "https://yowainnovations.com",
    telephone: "+256786155557",
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Kampala",
      addressCountry: "UG"
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 0.3476,
      longitude: 32.5825
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "18:00"
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "50"
    }
  };

  // Services Schema for AEO
  const servicesSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Content Creation and Advertising",
    provider: {
      "@type": "Organization",
      name: "Yowa Innovations"
    },
    areaServed: {
      "@type": "Place",
      name: "East Africa"
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Creative Services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Video Production",
            description: "Professional documentary and promotional video production services"
          }
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Photography",
            description: "Commercial and editorial photography services"
          }
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Digital Marketing",
            description: "Strategic digital marketing and social media campaigns"
          }
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Creative Strategy",
            description: "Brand strategy and creative consulting services"
          }
        }
      ]
    }
  };

  // FAQ Schema for AEO (Answer Engine Optimization)
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What services does Yowa Innovations offer?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yowa Innovations offers comprehensive content creation and advertising services including video production, photography, digital marketing, and creative strategy. We specialize in documentary production, promotional videos, and impactful visual storytelling for NGOs, corporates, and startups."
        }
      },
      {
        "@type": "Question",
        name: "Where is Yowa Innovations located?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yowa Innovations is based in Kampala, Uganda, and serves clients across East Africa including Kenya, Tanzania, Rwanda, and beyond. We also work with international organizations operating in the region."
        }
      },
      {
        "@type": "Question",
        name: "What industries does Yowa Innovations work with?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We work across multiple sectors including agriculture, environment, education, healthcare, technology, and social development. Our clients include NGOs, government agencies, corporate brands, and startups looking to make an impact through visual storytelling."
        }
      },
      {
        "@type": "Question",
        name: "How can I get started with Yowa Innovations?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can get started by visiting our Get Started page, filling out the contact form, or reaching out directly via email or phone. We offer free consultations to understand your project needs and provide tailored solutions."
        }
      }
    ]
  };

  // WebSite Schema for sitelinks searchbox
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Yowa Innovations",
    url: "https://yowainnovations.com",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://yowainnovations.com/blogs?search={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <link rel="canonical" href={url} />

      {/* Geo Tags for Local SEO */}
      <meta name="geo.region" content="UG" />
      <meta name="geo.placename" content="Kampala" />
      <meta name="geo.position" content="0.3476;32.5825" />
      <meta name="ICBM" content="0.3476, 32.5825" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Yowa Innovations" />
      <meta property="og:locale" content="en_US" />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:site" content="@yowainnovations" />
      <meta name="twitter:creator" content="@yowainnovations" />

      {/* Additional SEO Meta Tags */}
      <meta name="theme-color" content="#007e5d" />
      <meta name="msapplication-TileColor" content="#007e5d" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="format-detection" content="telephone=no" />

      {/* Structured Data for SEO and AEO */}
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(localBusinessSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(servicesSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(faqSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(websiteSchema)}
      </script>
    </Helmet>
  );
};

export default SEO;
