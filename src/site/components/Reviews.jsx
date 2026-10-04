import { useSite } from "../context.js";
import Words from "./Words.jsx";

const REVIEWS = [["review1Text", "review1Author", "Google"], ["review2Text", "review2Author", "Instagram"], ["review3Text", "review3Author", "Google"]];

export default function Reviews() {
  const { t } = useSite();
  return (
    <section className="section section--ivory" id="reviews" aria-labelledby="reviews-title">
      <div className="container">
        <div className="section-head section-head--center" data-head>
          <div>
            <p className="eyebrow eyebrow--center reveal"><span />{t("reviewsEyebrow")}<span /></p>
            <h2 id="reviews-title" className="display reveal-words"><Words text={t("reviewsTitle")} /></h2>
          </div>
        </div>
        <div className="reviews">
          {REVIEWS.map(([text, author, source], i) => (
            <figure className="review reveal" key={text} style={{ "--d": `${i * 0.12}s` }}>
              <div className="review__stars" aria-label="5/5">★★★★★</div>
              <blockquote>“{t(text)}”</blockquote>
              <figcaption><strong>{t(author)}</strong> · {source}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
