'use client'

import { useState } from 'react'

type Listing = {
  id: number
  title: string
  description: string
  category: string
  price: string
  status: 'Available' | 'Unavailable'
  paymentMethods: string[]
  imageUrl?: string
  profileImage?: string
}

export default function BrowsePage() {
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)

  // Placeholder single listing structure — will later map from Supabase data
  const listings: Listing[] = [
    {
      id: 1,
      title: '{Title}',
      description: '{Description}',
      category: '{Category}',
      price: '{Price}',
      status: 'Available',
      paymentMethods: ['{Payment Methods}'],
      imageUrl: '/placeholder-image.png',
      profileImage: '/placeholder-profile.png',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Listings</h1>
        <p className="text-gray-600 mb-6">
          Explore what UCLA students are offering — from tutoring to nails to tech services.
        </p>

        {/* Search / Filter bar */}
        <div className="bg-white shadow rounded-lg p-6 mb-8 flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search listings..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <select className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500">
            <option>All Categories</option>
            <option>Beauty</option>
            <option>Education</option>
            <option>Tech</option>
            <option>Other</option>
          </select>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="bg-white p-5 rounded-xl shadow-md cursor-pointer hover:shadow-lg transition relative"
              onClick={() => setSelectedListing(listing)}
            >
              {/* Listing Image */}
              <div className="h-40 w-full mb-4 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                <img
                  src={listing.imageUrl}
                  alt={listing.title}
                  className="object-cover w-full h-full"
                />
              </div>

              {/* Profile Image */}
              <div className="absolute top-3 left-3">
                <img
                  src={listing.profileImage}
                  alt="Profile"
                  className="h-10 w-10 rounded-full border-2 border-white shadow-sm object-cover"
                />
              </div>

              <h3 className="text-lg font-semibold text-gray-900">{listing.title}</h3>
              <p className="text-sm text-gray-600 mt-2">{listing.description}</p>

              <div className="mt-4 flex justify-between items-center">
                <span className="text-blue-600 font-medium">{listing.price}</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  {listing.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Popup Modal */}
      {selectedListing && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md bg-black/25 z-50 transition-all duration-300">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg relative">
            <button
              onClick={() => setSelectedListing(null)}
              className="absolute top-3 right-4 text-gray-500 hover:text-gray-700 text-xl"
            >
              ✕
            </button>

            {/* Listing Image */}
            <div className="h-48 w-full mb-4 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
              <img
                src={selectedListing.imageUrl}
                alt={selectedListing.title}
                className="object-cover w-full h-full"
              />
            </div>

            {/* Profile section */}
            <div className="flex items-center mb-4">
              <img
                src={selectedListing.profileImage}
                alt="Profile"
                className="h-12 w-12 rounded-full border border-gray-200 mr-3 object-cover"
              />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {selectedListing.title}
                </h2>
                <p className="text-sm text-gray-500">{selectedListing.category}</p>
              </div>
            </div>

            <p className="text-gray-600 mb-4">{selectedListing.description}</p>

            <p className="text-sm text-gray-500 mb-2">
              <strong>Payment Methods:</strong> {selectedListing.paymentMethods.join(', ')}
            </p>

            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-blue-600">
                {selectedListing.price}
              </span>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition"
                onClick={() => window.location.href = `/messages/emily`}
              >
                Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}