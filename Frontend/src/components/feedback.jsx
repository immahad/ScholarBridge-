"use client"

import { useState } from "react"
import axios from "axios"

const FeedbackForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    subject: "",
    purpose: "",
    suggestions: "",
  })

  const [status, setStatus] = useState({
    submitting: false,
    success: false,
    error: false,
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus({ submitting: true, success: false, error: false })

    try {
      await axios.post("http://localhost:3333/ifl_system/auth/api/feedback", formData)
      setStatus({ submitting: false, success: true, error: false })
      setFormData({
        email: "",
        subject: "",
        purpose: "",
        suggestions: "",
      })

      // Reset success message after 3 seconds
      setTimeout(() => {
        setStatus((prev) => ({ ...prev, success: false }))
      }, 3000)
    } catch (error) {
      setStatus({ submitting: false, success: false, error: true })

      // Reset error message after 3 seconds
      setTimeout(() => {
        setStatus((prev) => ({ ...prev, error: false }))
      }, 3000)
    }
  }

  return (
    <div className="w-full mx-auto my-10 p-6 bg-white border rounded-xl shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">We Value Your Feedback</h2>
        <p className="text-gray-600 mt-1">Help us improve our services</p>
      </div>

      {status.success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg transition-all duration-300 ease-in-out">
          Feedback submitted successfully!
        </div>
      )}

      {status.error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg transition-all duration-300 ease-in-out">
          Error submitting feedback. Please try again.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="your@email.com"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            placeholder="What's this about?"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
          <textarea
            name="purpose"
            value={formData.purpose}
            onChange={handleChange}
            required
            placeholder="Tell us why you're reaching out..."
            rows="3"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 resize-none"
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Suggestions</label>
          <textarea
            name="suggestions"
            value={formData.suggestions}
            onChange={handleChange}
            required
            placeholder="Your ideas for improvement..."
            rows="4"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 resize-none"
          ></textarea>
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            disabled={status.submitting}
            className={`px-6 py-3 text-white font-medium rounded-lg shadow-sm transition-all duration-200 
              ${
                status.submitting
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 hover:shadow-md"
              }`}
          >
            {status.submitting ? "Submitting..." : "Submit Feedback"}
          </button>
        </div>
      </form>

      <div className="mt-6 text-center text-xs text-gray-500">Your feedback helps us serve you better</div>
    </div>
  )
}

export default FeedbackForm