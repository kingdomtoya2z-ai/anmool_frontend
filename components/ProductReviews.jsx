'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useAuth } from '@/lib/authContext';
import { Stars, StarInput, STAR_LABELS } from '@/components/Stars';
import { IconCheck, IconClock, IconLock, IconStar, IconXCircle } from '@/components/icons';

/**
 * Product reviews: public approved reviews + a write form for logged-in users.
 *
 * A submitted review is NOT public. It sits in `pending` until an admin
 * approves it, so after posting we show the author their own review with an
 * "awaiting approval" note instead of pretending it is live.
 *
 * Hook-order rule (this is what caused minified React error #300 on the
 * checkout page): every hook in this component must be declared above any
 * `return`. Never add one below.
 */
export default function ProductReviews({ productId, productName }) {
  const { user } = useAuth();

  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({ average: 0, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } });
  const [myReview, setMyReview] = useState(null);
  // Server decides eligibility: has this person received the product?
  const [canReview, setCanReview] = useState(false);
  const [loading, setLoading] = useState(true);

  // form state
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);

  // Kept in a ref so the loader can stay a stable useCallback without
  // re-running on every keystroke.
  const userId = user?.id || user?._id || null;

  const load = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/reviews/product/${productId}`);
      setReviews(data.reviews || []);
      setSummary(
        data.summary || { average: 0, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }
      );
      setMyReview(data.myReview || null);
      setCanReview(Boolean(data.canReview));
    } catch {
      setReviews([]);
      setCanReview(false);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    load();
  }, [load, userId]); // re-read when sign-in state changes, so myReview appears

  const submit = async (e) => {
    e.preventDefault();
    if (!rating) {
      toast.error('Please select a star rating');
      return;
    }
    if (comment.trim().length < 3) {
      toast.error('Please write a few words about the product');
      return;
    }
    setSaving(true);
    try {
      const { data } = await api.post('/reviews', {
        product: productId,
        rating,
        title: title.trim(),
        comment: comment.trim(),
      });
      // Optimistically show it as pending; `load()` then reconciles.
      setMyReview({
        id: data.id,
        rating: data.rating,
        title: data.title,
        comment: data.comment,
        status: data.status || 'pending',
        date: data.date,
      });
      setRating(0);
      setTitle('');
      setComment('');
      toast.success('Thank you! Your review will appear once approved.');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit your review');
      // 409 means a review already exists — pull the truth from the server.
      if (err.response?.status === 409) load();
    } finally {
      setSaving(false);
    }
  };

  /* ----------------------------- render ----------------------------- */

  const dist = summary.distribution || {};
  const total = summary.count || 0;

  return (
    <section id="reviews" className="mt-10 scroll-mt-28">
      <div className="flex items-center gap-3 mb-5">
        <span className="w-1 h-8 bg-gradient-to-b from-sacred-saffron to-sacred-maroon rounded-full" />
        <h2 className="font-serif text-2xl font-bold">Customer Reviews</h2>
        {total > 0 && (
          <span className="text-sm text-stone-500">
            {total} review{total === 1 ? '' : 's'}
          </span>
        )}
      </div>

      <div className="grid lg:grid-cols-[300px_minmax(0,1fr)] gap-6">
        {/* ---------------------------- summary --------------------------- */}
        <div className="bg-white rounded-3xl border border-gray-100 p-5 h-fit">
          <div className="flex items-end gap-3">
            <div className="text-5xl font-bold text-sacred-deepmaroon leading-none">
              {Number(summary.average || 0).toFixed(1)}
            </div>
            <div className="pb-1">
              <Stars value={summary.average} size="md" className="text-sacred-saffron" />
              <div className="text-xs text-stone-500 mt-0.5">
                {total > 0 ? `Based on ${total} review${total === 1 ? '' : 's'}` : 'No reviews yet'}
              </div>
            </div>
          </div>

          {total > 0 && (
            <div className="mt-5 space-y-1.5">
              {[5, 4, 3, 2, 1].map((star) => {
                const n = dist[star] || 0;
                const pct = total ? Math.round((n / total) * 100) : 0;
                return (
                  <div key={star} className="flex items-center gap-2 text-xs">
                    <span className="w-3 text-stone-600 font-semibold">{star}</span>
                    <IconStar className="w-3 h-3 text-sacred-saffron shrink-0" />
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-sacred-saffron rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-stone-400 tabular-nums">{n}</span>
                  </div>
                );
              })}
            </div>
          )}

          <p className="text-[11px] text-stone-400 mt-4 leading-relaxed">
            Reviews are published only after our team verifies them.
          </p>
        </div>

        {/* ------------------------ list + write form --------------------- */}
        <div className="min-w-0 space-y-4">
          {/* Write form / author's own review */}
          {!user ? (
            <div className="bg-white rounded-3xl border border-gray-100 p-5 text-center">
              <div className="w-11 h-11 mx-auto rounded-full bg-cream border border-accent/20 flex items-center justify-center text-sacred-maroon">
                <IconLock className="w-5 h-5" />
              </div>
              <div className="font-bold mt-2">Share your experience</div>
              <p className="text-sm text-gray-500 mt-1">
                Log in to review {productName || 'this product'}.
              </p>
              <Link
                href="/login"
                className="inline-block mt-3 bg-primary text-white rounded-full px-6 py-2.5 text-sm font-bold hover:bg-primary-dark transition"
              >
                Login / Register
              </Link>
            </div>
          ) : myReview ? (
            <div
              className={`rounded-3xl border p-5 ${
                myReview.status === 'approved'
                  ? 'border-green-200 bg-green-50'
                  : myReview.status === 'rejected'
                    ? 'border-red-200 bg-red-50'
                    : 'border-amber-200 bg-amber-50'
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-sm">Your review</span>
                {myReview.status === 'pending' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-200/70 text-amber-900">
                    <IconClock className="w-3 h-3" /> Awaiting approval
                  </span>
                )}
                {myReview.status === 'approved' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-green-600 text-white">
                    <IconCheck className="w-3 h-3" /> Published
                  </span>
                )}
                {myReview.status === 'rejected' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-red-600 text-white">
                    <IconXCircle className="w-3 h-3" /> Not published
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Stars value={myReview.rating} className="text-sacred-saffron" />
                {myReview.title && <span className="text-sm font-semibold">{myReview.title}</span>}
              </div>
              <p className="text-sm text-gray-700 mt-1.5 whitespace-pre-wrap break-words">
                {myReview.comment}
              </p>
              <p className="text-[11px] text-gray-500 mt-2">
                {myReview.status === 'pending' &&
                  'Our team will publish it shortly. Only one review per product is allowed.'}
                {myReview.status === 'rejected' &&
                  'This review was not published. You can only leave one review per product.'}
                {myReview.status === 'approved' && 'Thanks for helping other devotees choose.'}
              </p>
            </div>
          ) : !canReview ? (
            <div className="bg-white rounded-3xl border border-gray-100 p-5 text-center">
              <div className="w-11 h-11 mx-auto rounded-full bg-cream border border-accent/20 flex items-center justify-center text-sacred-maroon">
                <IconLock className="w-5 h-5" />
              </div>
              <div className="font-bold mt-2">Reviews are for delivered orders</div>
              <p className="text-sm text-gray-500 mt-1">
                You can share a review once {productName || 'this product'} has been
                delivered in one of your orders.
              </p>
              <Link
                href="/orders"
                className="inline-block mt-3 border border-gray-200 rounded-full px-6 py-2.5 text-sm font-bold hover:border-primary hover:text-primary transition"
              >
                View my orders
              </Link>
            </div>
          ) : (
            <form onSubmit={submit} className="bg-white rounded-3xl border border-gray-100 p-5">
              <div className="font-bold mb-1">Write a review</div>
              <p className="text-xs text-gray-500 mb-4">
                Your review appears publicly after an admin approves it. One review per product.
              </p>

              <label className="block text-sm font-semibold mb-1.5">Your rating *</label>
              <div className="flex items-center gap-3">
                <StarInput value={rating} onChange={setRating} disabled={saving} />
                <span className="text-sm text-gray-600">
                  {rating ? STAR_LABELS[rating] : 'Tap to rate'}
                </span>
              </div>

              <div className="mt-4">
                <label htmlFor="rv-title" className="block text-sm font-semibold mb-1.5">
                  Title <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <input
                  id="rv-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={120}
                  disabled={saving}
                  placeholder="Sum it up in a few words"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-60"
                />
              </div>

              <div className="mt-4">
                <label htmlFor="rv-comment" className="block text-sm font-semibold mb-1.5">
                  Your review *
                </label>
                <textarea
                  id="rv-comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  maxLength={2000}
                  disabled={saving}
                  required
                  placeholder="What did you like or dislike? How was the quality, packaging, aroma?"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-60 resize-y"
                />
                <div className="text-right text-[11px] text-gray-400 mt-1">
                  {comment.length}/2000
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="mt-3 bg-primary text-white rounded-full px-8 py-3 font-bold text-sm hover:bg-primary-dark transition disabled:opacity-60"
              >
                {saving ? 'Submitting…' : 'Submit review'}
              </button>
            </form>
          )}

          {/* Approved reviews */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white rounded-3xl border border-gray-100 p-5 animate-pulse">
                  <div className="h-4 w-40 bg-gray-100 rounded" />
                  <div className="h-3 w-full mt-3 bg-gray-100 rounded" />
                  <div className="h-3 w-3/4 mt-2 bg-gray-100 rounded" />
                </div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-100 p-8 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-cream border border-accent/20 flex items-center justify-center text-sacred-maroon">
                <IconStar className="w-6 h-6" />
              </div>
              <div className="font-bold mt-3">No reviews yet</div>
              <p className="text-sm text-gray-500 mt-1">
                Be the first to share how this product served you.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map((r) => (
                <article key={r.id} className="bg-white rounded-3xl border border-gray-100 p-5">
                  <div className="flex items-start gap-3">
                    {r.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={r.avatar}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover border shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-sacred-sandal border border-sacred-saffron/40 text-sacred-deepmaroon flex items-center justify-center font-bold text-sm shrink-0">
                        {(r.name || '?').trim().charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="font-bold text-sm truncate">{r.name}</span>
                        {r.isVerifiedPurchase && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                            <IconCheck className="w-2.5 h-2.5" /> Verified purchase
                          </span>
                        )}
                        <span className="text-[11px] text-gray-400 ml-auto shrink-0">
                          {new Date(r.date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <Stars value={r.rating} className="text-sacred-saffron mt-1" />
                      {r.title && <div className="font-semibold text-sm mt-2 break-words">{r.title}</div>}
                      <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap break-words">
                        {r.comment}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}