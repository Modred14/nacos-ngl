"use client";

import { useEffect, useState } from "react";

export default function QuestionPageClient({ id }) {
  const [question, setQuestion] = useState(null);
  const [responses, setResponses] = useState([]);
  const [content, setContent] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  async function loadData() {
    try {
      setLoading(true);

      const res = await fetch(`/api/question/${id}`);
      const data = await res.json();

      setQuestion(data.question);
      setResponses(data.responses || []);
    } catch (err) {
      console.error("Failed to load question:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [id]);

  async function submitResponse() {
    if (!content.trim() || submitting) return;

    setSubmitting(true);
    setSuccessMsg("");

    try {
      const res = await fetch(`/api/question/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) throw new Error("Failed to submit");

      setContent(""); // clear textarea immediately
      setSuccessMsg("Your response has been submitted.");

      // optional: refresh responses only (not whole page)
      const updated = await res.json();
      setResponses(updated.responses || []);

      // auto-hide message
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error(err);
      setSuccessMsg("Something went wrong. Try again.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="p-6">Loading...</div>;

  if (!question) return <div className="p-6">Question not found</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">

      {/* QUESTION */}
      <div className="bg-white p-5 rounded-xl border">
        <h1 className="text-xl font-bold">{question.title}</h1>
        <p className="text-sm text-gray-600 mt-2">
          {question.description}
        </p>
      </div>

      {/* RESPONSE BOX */}
      <div className="bg-white p-5 rounded-xl border space-y-3">

        <textarea
          className="w-full border rounded-lg p-3 outline-none"
          placeholder="Answer anonymously..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <button
          onClick={submitResponse}
          disabled={submitting}
          className={`px-4 py-2 rounded-lg text-white ${
            submitting ? "bg-gray-400" : "bg-black"
          }`}
        >
          {submitting ? "Submitting..." : "Submit anonymously"}
        </button>

        {/* SUCCESS / ERROR MESSAGE */}
        {successMsg && (
          <p className="text-sm text-green-600">{successMsg}</p>
        )}
      </div>

      {/* RESPONSES */}
      
    </div>
  );
}