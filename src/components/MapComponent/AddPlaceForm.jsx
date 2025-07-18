import React from "react";
import "./Map.css";
export default function AddPlaceForm({ selectedPlace, onSubmit, onCancel }) {
  if (!selectedPlace) return null;

  return (
    <div>
      <div className="absolute right-0 top-0 h-full z-50 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Add New Place</h3>
        <p className="text-sm text-gray-600 mb-4">
          Selected Location: {selectedPlace.lat.toFixed(4)},{" "}
          {selectedPlace.lng.toFixed(4)}
        </p>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            onSubmit({
              name: e.target.name.value,
              description: e.target.description.value,
              category: e.target.category.value,
              location: {
                lat: selectedPlace.lat,
                lng: selectedPlace.lng,
              },
            });
          }}
        >
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-gray-700 font-semibold mb-1"
            >
              Name:
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="w-full px-3 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="description"
              className="block text-gray-700 font-semibold mb-1"
            >
              Description:
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              required
              className="w-full px-3 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="category"
              className="block text-gray-700 font-semibold mb-1"
            >
              Category:
            </label>
            <select
              id="category"
              name="category"
              required
              defaultValue=""
              className="w-full px-3 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="" disabled>
                Select a category
              </option>
              <option>Food</option>
              <option>Shopping</option>
              <option>Entertainment</option>
              <option>Nature</option>
              <option>Health</option>
              <option>Education</option>
              <option>Other</option>
            </select>
          </div>

          {/* Submit and Cancel Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 h-10 bg-orange-500 text-white font-semibold rounded-md shadow hover:bg-orange-600 transition"
            >
              Save Place
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 h-10 border border-gray-300 rounded-md font-semibold hover:bg-gray-100 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
