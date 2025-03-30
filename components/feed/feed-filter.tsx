"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import {
  Filter,
  Clock,
  TrendingUp,
  Zap,
  Users,
  FileText,
  Newspaper,
  Calendar,
  MessageSquare,
  Tag,
  Building,
} from "lucide-react"
import { useFeed } from "@/contexts/feed-context"
import { ContentType, RelevanceType, type FeedFilterOptions } from "@/lib/services/feed-service"

export function FeedFilter() {
  const { filterOptions, setFilterOptions } = useFeed()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [tempFilterOptions, setTempFilterOptions] = useState<FeedFilterOptions>({ ...filterOptions })
  const [tagInput, setTagInput] = useState("")
  const [industryInput, setIndustryInput] = useState("")

  const handleOpenDialog = () => {
    setTempFilterOptions({ ...filterOptions })
    setIsDialogOpen(true)
  }

  const handleApplyFilters = () => {
    setFilterOptions(tempFilterOptions)
    setIsDialogOpen(false)
  }

  const handleResetFilters = () => {
    const defaultOptions: FeedFilterOptions = {
      contentTypes: Object.values(ContentType),
      relevance: RelevanceType.RECENT,
      timeRange: "all",
      onlyConnections: false,
      tags: [],
      industries: [],
    }

    setTempFilterOptions(defaultOptions)
  }

  const handleContentTypeChange = (type: ContentType, checked: boolean) => {
    setTempFilterOptions((prev) => {
      const currentTypes = prev.contentTypes || []

      if (checked) {
        return { ...prev, contentTypes: [...currentTypes, type] }
      } else {
        return { ...prev, contentTypes: currentTypes.filter((t) => t !== type) }
      }
    })
  }

  const handleRelevanceChange = (value: RelevanceType) => {
    setTempFilterOptions((prev) => ({ ...prev, relevance: value }))
  }

  const handleTimeRangeChange = (value: string) => {
    setTempFilterOptions((prev) => ({
      ...prev,
      timeRange: value as "today" | "week" | "month" | "all",
    }))
  }

  const handleConnectionsOnlyChange = (checked: boolean) => {
    setTempFilterOptions((prev) => ({ ...prev, onlyConnections: checked }))
  }

  const handleAddTag = () => {
    if (!tagInput.trim()) return

    setTempFilterOptions((prev) => {
      const currentTags = prev.tags || []
      if (!currentTags.includes(tagInput.trim())) {
        return { ...prev, tags: [...currentTags, tagInput.trim()] }
      }
      return prev
    })

    setTagInput("")
  }

  const handleRemoveTag = (tag: string) => {
    setTempFilterOptions((prev) => {
      const currentTags = prev.tags || []
      return { ...prev, tags: currentTags.filter((t) => t !== tag) }
    })
  }

  const handleAddIndustry = () => {
    if (!industryInput.trim()) return

    setTempFilterOptions((prev) => {
      const currentIndustries = prev.industries || []
      if (!currentIndustries.includes(industryInput.trim())) {
        return { ...prev, industries: [...currentIndustries, industryInput.trim()] }
      }
      return prev
    })

    setIndustryInput("")
  }

  const handleRemoveIndustry = (industry: string) => {
    setTempFilterOptions((prev) => {
      const currentIndustries = prev.industries || []
      return { ...prev, industries: currentIndustries.filter((i) => i !== industry) }
    })
  }

  // Quick filter buttons
  const quickFilters = [
    {
      label: "Recent",
      icon: Clock,
      action: () =>
        setFilterOptions({
          ...filterOptions,
          relevance: RelevanceType.RECENT,
        }),
      isActive: filterOptions.relevance === RelevanceType.RECENT,
    },
    {
      label: "Popular",
      icon: TrendingUp,
      action: () =>
        setFilterOptions({
          ...filterOptions,
          relevance: RelevanceType.POPULAR,
        }),
      isActive: filterOptions.relevance === RelevanceType.POPULAR,
    },
    {
      label: "Relevant",
      icon: Zap,
      action: () =>
        setFilterOptions({
          ...filterOptions,
          relevance: RelevanceType.RELEVANT,
        }),
      isActive: filterOptions.relevance === RelevanceType.RELEVANT,
    },
    {
      label: "Connections",
      icon: Users,
      action: () =>
        setFilterOptions({
          ...filterOptions,
          onlyConnections: !filterOptions.onlyConnections,
        }),
      isActive: filterOptions.onlyConnections,
    },
  ]

  // Content type filters
  const contentTypeFilters = [
    {
      type: ContentType.POST,
      label: "Posts",
      icon: MessageSquare,
    },
    {
      type: ContentType.ARTICLE,
      label: "Articles",
      icon: FileText,
    },
    {
      type: ContentType.UPDATE,
      label: "Updates",
      icon: Zap,
    },
    {
      type: ContentType.NEWS,
      label: "News",
      icon: Newspaper,
    },
    {
      type: ContentType.EVENT,
      label: "Events",
      icon: Calendar,
    },
  ]

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {quickFilters.map((filter, index) => (
            <Button
              key={index}
              variant={filter.isActive ? "default" : "outline"}
              size="sm"
              onClick={filter.action}
              className="flex items-center gap-1"
            >
              <filter.icon className="h-4 w-4" />
              {filter.label}
            </Button>
          ))}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Sort By</DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() =>
                  setFilterOptions({
                    ...filterOptions,
                    relevance: RelevanceType.RECENT,
                  })
                }
              >
                <Clock className="h-4 w-4 mr-2" />
                Most Recent
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  setFilterOptions({
                    ...filterOptions,
                    relevance: RelevanceType.POPULAR,
                  })
                }
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Most Popular
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  setFilterOptions({
                    ...filterOptions,
                    relevance: RelevanceType.RELEVANT,
                  })
                }
              >
                <Zap className="h-4 w-4 mr-2" />
                Most Relevant
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />
            <DropdownMenuLabel>Time Range</DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() =>
                  setFilterOptions({
                    ...filterOptions,
                    timeRange: "today",
                  })
                }
              >
                Today
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  setFilterOptions({
                    ...filterOptions,
                    timeRange: "week",
                  })
                }
              >
                This Week
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  setFilterOptions({
                    ...filterOptions,
                    timeRange: "month",
                  })
                }
              >
                This Month
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  setFilterOptions({
                    ...filterOptions,
                    timeRange: "all",
                  })
                }
              >
                All Time
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleOpenDialog}>Advanced Filters...</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Advanced Filters Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Feed Filters</DialogTitle>
            <DialogDescription>Customize your feed with advanced filtering options</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Content Types</h3>
              <div className="grid grid-cols-2 gap-2">
                {contentTypeFilters.map((filter) => (
                  <div key={filter.type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`filter-${filter.type}`}
                      checked={tempFilterOptions.contentTypes?.includes(filter.type)}
                      onCheckedChange={(checked) => handleContentTypeChange(filter.type, checked as boolean)}
                    />
                    <Label htmlFor={`filter-${filter.type}`} className="text-sm flex items-center">
                      <filter.icon className="h-3 w-3 mr-1" />
                      {filter.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Relevance</h3>
              <RadioGroup
                value={tempFilterOptions.relevance}
                onValueChange={(value) => handleRelevanceChange(value as RelevanceType)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={RelevanceType.RECENT} id="relevance-recent" />
                  <Label htmlFor="relevance-recent" className="text-sm flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Most Recent
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={RelevanceType.POPULAR} id="relevance-popular" />
                  <Label htmlFor="relevance-popular" className="text-sm flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Most Popular
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={RelevanceType.RELEVANT} id="relevance-relevant" />
                  <Label htmlFor="relevance-relevant" className="text-sm flex items-center">
                    <Zap className="h-3 w-3 mr-1" />
                    Most Relevant
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Time Range</h3>
              <RadioGroup value={tempFilterOptions.timeRange} onValueChange={handleTimeRangeChange}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="today" id="time-today" />
                  <Label htmlFor="time-today" className="text-sm">
                    Today
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="week" id="time-week" />
                  <Label htmlFor="time-week" className="text-sm">
                    This Week
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="month" id="time-month" />
                  <Label htmlFor="time-month" className="text-sm">
                    This Month
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="time-all" />
                  <Label htmlFor="time-all" className="text-sm">
                    All Time
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium flex items-center">
                <Tag className="h-4 w-4 mr-1" />
                Tags
              </h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                />
                <Button type="button" size="sm" onClick={handleAddTag}>
                  Add
                </Button>
              </div>
              {tempFilterOptions.tags && tempFilterOptions.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {tempFilterOptions.tags.map((tag, index) => (
                    <div
                      key={index}
                      className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full flex items-center"
                    >
                      {tag}
                      <button
                        type="button"
                        className="ml-1 text-muted-foreground hover:text-foreground"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium flex items-center">
                <Building className="h-4 w-4 mr-1" />
                Industries
              </h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Add an industry"
                  value={industryInput}
                  onChange={(e) => setIndustryInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddIndustry()
                    }
                  }}
                />
                <Button type="button" size="sm" onClick={handleAddIndustry}>
                  Add
                </Button>
              </div>
              {tempFilterOptions.industries && tempFilterOptions.industries.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {tempFilterOptions.industries.map((industry, index) => (
                    <div
                      key={index}
                      className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full flex items-center"
                    >
                      {industry}
                      <button
                        type="button"
                        className="ml-1 text-muted-foreground hover:text-foreground"
                        onClick={() => handleRemoveIndustry(industry)}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="connections-only"
                checked={tempFilterOptions.onlyConnections}
                onCheckedChange={(checked) => handleConnectionsOnlyChange(checked as boolean)}
              />
              <Label htmlFor="connections-only">Show only connections' content</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleResetFilters}>
              Reset
            </Button>
            <Button onClick={handleApplyFilters}>Apply Filters</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

