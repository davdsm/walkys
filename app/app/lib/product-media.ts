type ProductMediaLike = {
  media?: string[] | null;
  media_360?: string[] | null;
  media_hover?: string | null;
};

/**
 * Keep card orientation consistent across the app by always taking
 * the same ordered sources for default and hover media.
 * Fix wrong-facing frames in PocketBase (reorder 360° files or replace media), not via CSS mirror.
 */
export function resolveProductCardMedia(product: ProductMediaLike): {
  image: string;
  hover: string;
} {
  const media360 = Array.isArray(product.media_360) ? product.media_360 : [];
  const media = Array.isArray(product.media) ? product.media : [];

  const image =
    media360[0] ||
    media[0] ||
    product.media_hover ||
    "";

  const hover =
    media360[1] ||
    media360[0] ||
    media[1] ||
    media[0] ||
    product.media_hover ||
    image;

  return { image, hover };
}
