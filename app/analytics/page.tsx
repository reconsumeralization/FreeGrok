"use client"

import { useState, useEffect } from "react"
import {
  getPlatformEngagementMetrics,
  getTopEngagedUsers,
  type EngagementMetrics,
  type UserEngagement,
} from "@/lib/services/analytics-service"

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('week')
  const [metrics, setMetrics] = useState<EngagementMetrics | null>(null)
  const [topUsers, setTopUsers] = useState<UserEngagement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const engagementMetrics = await getPlatformEngagementMetrics(timeRange)
        setMetrics(engagementMetrics)
        
        const users = await getTopEngagedUsers(10, 'month')
        setTopUsers(users)
      } catch (error) {
        console.error('Error loading analytics data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [timeRange])
  
  // Prepare chart data
  const engagementData = [
    { name: 'Posts', value: metrics?.totalPosts || 0 },
    { name: 'Likes', value: metrics?.totalLikes || 0 },
    { name: 'Comments', value: metrics?.totalComments || 0 },
    { name: 'Connections', value: metrics?.totalConnections || 0 },
    { name: 'Messages', value: metrics?.totalMessages || 0 },
  ]
  
  const userEngagementData = topUsers.map(user => ({
    name: user.name,
    score: user.engagementScore,
    posts: user.postsCount,
    likes: user.likesReceived,
    comments: user.commentsReceived,
  }))
  
  // Sample time series data (in a real app, this would come from the API)
  const timeSeriesData = [
    { date: 'Mon', posts: 4, likes: 24, comments: 12 },
    { date: 'Tue', posts: 3, likes: 18, comments: 8 },
    { date: 'Wed', posts: 5, likes: 32, comments: 15 },
    { date: 'Thu', posts: 7, likes: 45, comments: 21 },
    { date: 'Fri', posts: 6, likes: 38, comments: 18 },
    { date: 'Sat', posts: 4, likes: 26, comments: 14 },
    { date: 'Sun', posts: 5, likes: 30, comments: 16 },
  ]
  
  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']
  
  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Track engagement and performance metrics for your network
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="p-2 border rounded-md"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
          >
            <option value="day">\

