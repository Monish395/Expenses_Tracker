import { useState, useEffect } from "react";
import NavSidebar from "../components/NavSidebar";
import API from "../services/API";

function Feedback() {
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(5);
  const [userFeedback, setUserFeedback] = useState(null);
  const [allReviews, setAllReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const reviewsRes = await API.get("/feedback/reviews");
      setAllReviews(reviewsRes.data);

      const allFeedbacks = await API.get("/feedback");
      const currentUserFeedback = allFeedbacks.data.find(
        (f) => f.userId === localStorage.getItem("userId")
      );
      setUserFeedback(currentUserFeedback || null);
    } catch (err) {
      console.error("Error fetching feedbacks:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      alert("Please enter feedback before submitting.");
      return;
    }

    try {
      const res = await API.post("/feedback", { message, rating });
      setUserFeedback(res.data);
      setMessage("");
      setRating(5);
      fetchData();
    } catch (err) {
      console.error("Error submitting feedback:", err);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-amber-50 via-amber-100 to-amber-200">
      <aside className="fixed top-0 left-0 h-screen w-64 bg-amber-900/95 backdrop-blur-md border-r border-amber-800 z-20">
        <NavSidebar />
      </aside>

      <main className="flex-1 ml-64 p-10">
        <div className="max-w-3xl mx-auto space-y-10">
          <h1 className="text-3xl font-bold text-amber-900 mb-8 tracking-tight">
            Feedback
          </h1>

          {/* Feedback Form */}
          <div className="bg-white/70 backdrop-blur-md border border-amber-200 shadow-lg p-8 rounded-2xl transition hover:shadow-xl">
            <h2 className="text-xl font-semibold mb-6 text-amber-800 tracking-tight">
              Share Your Feedback
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <textarea
                className="w-full p-4 border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition placeholder-amber-400"
                placeholder="Type your thoughts..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
              ></textarea>

              <div className="flex items-center gap-4">
                <span className="font-medium text-amber-800">Rating:</span>
                {[1, 2, 3, 4, 5].map((r) => (
                  <button
                    key={r}
                    type="button"
                    className={`px-3 py-1.5 rounded-md font-medium transition ${
                      rating >= r
                        ? "bg-amber-600 text-white"
                        : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                    }`}
                    onClick={() => setRating(r)}
                  >
                    {r}⭐
                  </button>
                ))}
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 text-white py-2.5 rounded-lg font-semibold tracking-wide transition"
              >
                Submit Feedback
              </button>
            </form>
          </div>

          {/* User Feedback */}
          {userFeedback && (
            <div className="bg-white/70 backdrop-blur-sm border border-amber-200 p-6 rounded-xl shadow-md">
              <h3 className="font-semibold text-amber-800 mb-2 text-lg">
                Your Feedback
              </h3>
              <p className="text-amber-900 leading-relaxed">
                “{userFeedback.message}”
              </p>
              <p className="mt-2 text-amber-600 font-medium">
                Rating: {userFeedback.rating}⭐
              </p>
            </div>
          )}

          {/* All Reviews */}
          <div className="space-y-5">
            <h2 className="text-xl font-semibold text-amber-900">
              All Reviews
            </h2>
            {loading ? (
              <p className="text-amber-500">Loading reviews...</p>
            ) : allReviews.length === 0 ? (
              <p className="text-amber-500">No reviews yet.</p>
            ) : (
              allReviews.map((review) => (
                <div
                  key={review._id}
                  className="bg-white/70 backdrop-blur-sm border border-amber-200 p-5 rounded-xl shadow transition hover:shadow-lg"
                >
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-medium text-amber-800">{review.uname}</p>
                    <p className="text-gray-400 text-sm">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-amber-700 font-medium mb-1">
                    Rating: {review.rating || "-"}⭐
                  </p>
                  <p className="text-amber-900 leading-relaxed">
                    {review.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Feedback;
