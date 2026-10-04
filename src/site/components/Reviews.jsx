import { useSite } from "../context.js";

const REVIEWS = [
  ["review1Text", "review1Author", "Google"],
  ["review2Text", "review2Author", "Instagram"],
  ["review3Text", "review3Author", "Google"]
];

export default function Reviews() {
  const { t } = useSite();
  return (
    <section id="reviews" className="reviews" aria-labelledby="reviews-title">
      <h2 id="reviews-title">{t("reviewsTitle")}</h2>
      <div className="reviews-grid">
        {REVIEWS.map(([text, author, source]) => (
          <figure className="review" key={text}>
            <div className="stars" aria-label="5/5">★★★★★</div>
            <blockquote>{t(text)}</blockquote>
            <figcaption><strong>{t(author)}</strong> <span>{source}</span></figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
