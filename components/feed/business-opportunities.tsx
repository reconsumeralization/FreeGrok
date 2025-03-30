"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  getPersonalizedOpportunities,
  type BusinessOpportunity,
  trackOpportunityEngagement,
} from "@/lib/services/opportunity-service"
import { useUser } from "@/contexts/user-context"
import { Briefcase, Calendar, Building, ExternalLink, ChevronRight } from "lucide-react"
import Link from "next/link"

export function BusinessOpportunities() {
  const [opportunities, setOpportunities] = useState<BusinessOpportunity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useUser()
  
  useEffect(() => {
    const loadOpportunities = async () => {
      if (!user?.id) return
      
      setIsLoading(true)
      try {
        const items = await getPersonalizedOpportunities(user.id, 3)
        setOpportunities(items)
      } catch (error) {
        console.error('Error loading opportunities:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    if (user?.id) {
      loadOpportunities()
    }
  }, [user])
  
  const handleOpportunityClick = async (opportunityId: string) => {
    if (!user?.id) return
    
    try {
      await trackOpportunityEngagement(user.id, opportunityId, 'click')
    } catch (error) {
      console.error('Error tracking opportunity click:', error)
    }
  }
  
  // Get icon based on opportunity type
  const getOpportunityIcon = (type: string) => {
    switch (type) {
      case 'connection':
        return <Avatar className="h-10 w-10">
          <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Contact" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      case 'collaboration':
      case 'partnership':
        return <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
          <Briefcase className="h-5 w-5 text-blue-600" />
        </div>
      case 'project':
        return <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
          <Building className="h-5 w-5 text-green-600" />
        </div>
      case 'job':
        return <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
          <Briefcase className="h-5 w-5 text-purple-600" />
        </div>
      case 'event':
        return <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
          <Calendar className="h-5 w-5 text-amber-600" />
        </div>
      default:
        return <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
          <ExternalLink className="h-5 w-5 text-gray-600" />
        </div>
    }
  }
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Business Opportunities</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="flex gap-3">
                <Skeleton className="h-10 w-10 rounded-full  => (
              <div key={index} className=\"flex gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : opportunities.length === 0 ? (
          <div className="text-center py-6">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Briefcase className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No opportunities found</p>
            <p className="text-xs text-muted-foreground mt-1">
              Complete your profile to discover relevant opportunities
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {opportunities.map((opportunity) => (
              <div key={opportunity.id} className="flex gap-3">
                {getOpportunityIcon(opportunity.type)}
                <div className="flex-1">
                  <h4 className="text-sm font-medium">{opportunity.title}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {opportunity.description}
                  </p>
                  {opportunity.industry && (
                    <div className="flex items-center mt-2">
                      <Building className="h-3 w-3 text-muted-foreground mr-1" />
                      <span className="text-xs text-muted-foreground">{opportunity.industry}</span>
                    </div>
                  )}
                  {opportunity.tags && opportunity.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {opportunity.tags.slice(0, 2).map((tag, i) => (
                        <Badge key={i} variant="outline" className="text-xs py-0 px-1">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="p-0 h-auto text-xs mt-2"
                    onClick={() => handleOpportunityClick(opportunity.id)}
                    asChild
                  >
                    <Link href={`/opportunities/${opportunity.id}`}>
                      View details
                      <ChevronRight className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-2"
              asChild
            >
              <Link href="/opportunities">
                View all opportunities
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

