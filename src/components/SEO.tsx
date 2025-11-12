import { Helmet } from "react-helmet";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  url?: string;
}

const SEO = ({
  title = "Yowa Innovations - Innovating Reality. Inspiring Impact.",
  description = "A content creation and advertising agency reimagining the everyday through media, technology, and creativity in agriculture, environment, and education.",
  keywords = "content creation, advertising agency, documentary production, digital marketing, Uganda, East Africa, visual storytelling, creative strategy, video production, photography",
  ogImage = "https://lovable.dev/opengraph-image-p98pqg.png",
  url = "https://yowainnovations.com",
}: SEOProps) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
};

export default SEO;
