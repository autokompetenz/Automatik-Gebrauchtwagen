export default function BrandLogo({ brand, height = 26, width, color, style }) {
  const tint = (color || brand.color || '#132853').replace('#', '');

  if (brand.slug) {
    return (
      <img
        src={`https://cdn.simpleicons.org/${brand.slug}/${tint}`}
        alt={brand.name}
        loading="lazy"
        style={{
          height,
          width: width || 'auto',
          objectFit: 'contain',
          display: 'block',
          margin: '0 auto',
          ...style,
        }}
      />
    );
  }

  const fontSize = typeof height === 'number' ? Math.round(height * 0.44) : 14;
  return (
    <div
      style={{
        fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif",
        fontWeight: 800,
        color: brand.color,
        fontSize,
        letterSpacing: '0.02em',
        textAlign: 'center',
        lineHeight: 1.1,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {brand.name}
    </div>
  );
}
