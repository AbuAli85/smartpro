"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"

interface Review {
  id: string
  clientName: string
  rating: number
  comment: string
  date: string
}

interface ReviewsAndRatingsProps {
  limit?: number
}

export function ReviewsAndRatings({ limit }: ReviewsAndRatingsProps) {
  const [reviews] = useState<Review[]>([
    {
      id: "1",
      clientName: "John Doe",
      rating: 5,
      comment: "Excellent service! Very professional and timely.",
      date: "2024-02-01",
    },
    {
      id: "2",
      clientName: "Jane Smith",
      rating: 4,
      comment: "Good work, but could improve communication.",
      date: "2024-01-28",
    },
    // Add more sample reviews as needed
  ])

  const displayedReviews = limit ? reviews.slice(0, limit) : reviews

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reviews and Ratings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 mb-4">
          <span className="text-2xl font-bold">{averageRating.toFixed(1)}</span>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-5 w-5 ${
                  star <= Math.round(averageRating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-muted-foreground">({reviews.length} reviews)</span>
        </div>
        <div className="space-y-4">
          {displayedReviews.map((review) => (
            <div key={review.id} className="flex items-start space-x-4">
              <Avatar>
                <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${review.clientName}`} />
                <AvatarFallback>{review.clientName[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <p className="font-semibold">{review.clientName}</p>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm">{review.comment}</p>
                <p className="text-xs text-muted-foreground">{new Date(review.date).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

