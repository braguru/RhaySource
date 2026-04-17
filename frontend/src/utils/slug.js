export function toSlug(name) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export function findBySlug(slug, products) {
  return products.find(p => toSlug(p.name) === slug) || null;
}
