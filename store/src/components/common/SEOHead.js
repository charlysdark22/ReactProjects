import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

const SEOHead = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  product,
  noIndex = false
}) => {
  const { i18n } = useTranslation();
  
  const siteName = 'TechStore Cuba';
  const defaultDescription = 'La mejor tienda de tecnología en Cuba. Computadoras, laptops, teléfonos y accesorios de las mejores marcas con envío gratuito.';
  const defaultImage = 'https://techstore.cu/og-image.jpg';
  const baseUrl = process.env.REACT_APP_BASE_URL || 'https://techstore.cu';
  
  const seoTitle = title ? `${title} | ${siteName}` : siteName;
  const seoDescription = description || defaultDescription;
  const seoImage = image || defaultImage;
  const seoUrl = url ? `${baseUrl}${url}` : baseUrl;
  
  const defaultKeywords = [
    'tecnología Cuba',
    'computadoras Cuba',
    'laptops Cuba',
    'teléfonos Cuba',
    'accesorios tecnológicos',
    'TechStore',
    'tienda online Cuba',
    'electrónicos Cuba'
  ];
  
  const seoKeywords = keywords ? [...defaultKeywords, ...keywords] : defaultKeywords;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <meta name="keywords" content={seoKeywords.join(', ')} />
      <link rel="canonical" href={seoUrl} />
      <meta name="language" content={i18n.language} />
      
      {/* Robots */}
      {noIndex && <meta name="robots" content="noindex,nofollow" />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={seoUrl} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content={seoImage} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={i18n.language === 'es' ? 'es_CU' : `${i18n.language}_CU`} />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={seoUrl} />
      <meta property="twitter:title" content={seoTitle} />
      <meta property="twitter:description" content={seoDescription} />
      <meta property="twitter:image" content={seoImage} />
      <meta property="twitter:site" content="@TechStoreCuba" />
      
      {/* Product specific meta tags */}
      {product && (
        <>
          <meta property="product:brand" content={product.brand} />
          <meta property="product:availability" content={product.stock > 0 ? 'in stock' : 'out of stock'} />
          <meta property="product:condition" content="new" />
          <meta property="product:price:amount" content={product.price} />
          <meta property="product:price:currency" content="USD" />
          {product.rating && (
            <meta property="product:rating:value" content={product.rating.average} />
          )}
        </>
      )}
      
      {/* Structured Data for Products */}
      {product && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": product.name,
            "description": product.description,
            "image": product.images?.[0]?.url || product.image,
            "brand": {
              "@type": "Brand",
              "name": product.brand
            },
            "offers": {
              "@type": "Offer",
              "url": seoUrl,
              "priceCurrency": "USD",
              "price": product.price,
              "availability": product.stock > 0 
                ? "https://schema.org/InStock" 
                : "https://schema.org/OutOfStock",
              "seller": {
                "@type": "Organization",
                "name": siteName
              }
            },
            ...(product.rating && {
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": product.rating.average,
                "reviewCount": product.rating.count
              }
            })
          })}
        </script>
      )}
      
      {/* Organization Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": siteName,
          "url": baseUrl,
          "logo": `${baseUrl}/logo192.png`,
          "description": defaultDescription,
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "CU",
            "addressRegion": "La Habana"
          },
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+53-5555-5555",
            "contactType": "customer service",
            "availableLanguage": ["Spanish", "English"]
          },
          "sameAs": [
            "https://www.facebook.com/TechStoreCuba",
            "https://www.twitter.com/TechStoreCuba",
            "https://www.instagram.com/TechStoreCuba"
          ]
        })}
      </script>
      
      {/* Website Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": siteName,
          "url": baseUrl,
          "potentialAction": {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": `${baseUrl}/products?search={search_term_string}`
            },
            "query-input": "required name=search_term_string"
          }
        })}
      </script>
    </Helmet>
  );
};

export default SEOHead;