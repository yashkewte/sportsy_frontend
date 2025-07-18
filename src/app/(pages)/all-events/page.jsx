'use client'
import React, { useState, useEffect } from 'react'
import { collection, getDocs, doc, updateDoc, arrayUnion } from 'firebase/firestore'
import { db } from '@/firebase/firebaseConfig'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar, MapPin, Users, Trophy, Search, Activity, Target, Share2, X } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'


function AllEventsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [allEvents, setAllEvents] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('date')
  const [viewMode, setViewMode] = useState('grid')
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showEventDetails, setShowEventDetails] = useState(false)
  const [shareSuccess, setShareSuccess] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/login')
      toast.error('You need to login first')
      return
    }
    fetchAllEvents()
    fetchCategories()
  }, [authLoading, user, router])

  const fetchAllEvents = async () => {
    try {
      setLoading(true)
      const eventsRef = collection(db, 'events')
      const querySnapshot = await getDocs(eventsRef)
      const eventsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setAllEvents(eventsData)
    } catch (error) {
      // Handle error (optional)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const categoriesRef = collection(db, 'categories')
      const querySnapshot = await getDocs(categoriesRef)
      const categoriesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setCategories(categoriesData)
    } catch (error) {
      // Handle error (optional)
    }
  }

  // Filter and sort events
  const getFilteredAndSortedEvents = (eventsList) => {
    let filtered = eventsList
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(event => event.category === selectedCategory)
    }
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    switch (sortBy) {
      case 'date':
        filtered.sort((a, b) => new Date(a.date) - new Date(b.date))
        break
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'participants':
        filtered.sort((a, b) => (b.participants?.length || 0) - (a.participants?.length || 0))
        break
      case 'entryFee':
        filtered.sort((a, b) => parseFloat(a.entryFee) - parseFloat(b.entryFee))
        break
      default:
        break
    }
    return filtered
  }

  const handleCardClick = (event) => {
    setSelectedEvent(event)
    setShowEventDetails(true)
    setShareSuccess(false)
  }



  const handleCategoryBadgeClick = (categoryName) => {
    setSelectedCategory(categoryName)
  }

  const handleClearFilters = () => {
    setSelectedCategory('all')
    setSearchTerm('')
  }

  const isUserJoined = (event) => {
    return user && event.participants?.includes(user.uid)
  }

  const handleJoinEvent = async (eventId) => {
    try {
      const eventRef = doc(db, 'events', eventId)
      await updateDoc(eventRef, {
        participants: arrayUnion(user.uid)
      })
      toast.success('Successfully joined the event!')
      fetchAllEvents()
    } catch (error) {
      toast.error('Error joining event: ' + error.message)
    }
  }

  // Skeletons for loading
  const renderSkeletons = () => {
    const skeletonArray = Array.from({ length: viewMode === 'grid' ? 6 : 3 })
    return skeletonArray.map((_, idx) => (
      <Card key={idx} className="bg-white/90 dark:bg-gray-800/90 border shadow-lg animate-pulse">
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/4" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-10" />
          </div>
        </CardContent>
      </Card>
    ))
  }

  
  const filteredEvents = getFilteredAndSortedEvents(allEvents)
  const isFilterActive = searchTerm || selectedCategory !== 'all'

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                All Sports Events
              </h1>
              <p className="text-muted-foreground mt-2 text-base md:text-lg">
                Discover and explore all available sports events
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">Total Events</p>
                      <p className="text-2xl font-bold">{allEvents.length}</p>
                    </div>
                    <Activity className="w-8 h-8 text-purple-200" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm font-medium">Categories</p>
                      <p className="text-2xl font-bold">{categories.length}</p>
                    </div>
                    <Target className="w-8 h-8 text-orange-200" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm bg-white/80 dark:bg-gray-800/80"
            >
              <option value="date">Sort by Date</option>
              <option value="title">Sort by Title</option>
              <option value="participants">Sort by Participants</option>
              <option value="entryFee">Sort by Entry Fee</option>
            </select>
            <div className="flex items-center gap-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <div className="grid grid-cols-2 gap-1 w-4 h-4">
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                </div>
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <div className="flex flex-col space-y-1 w-4 h-4">
                  <div className="bg-current rounded-sm h-1"></div>
                  <div className="bg-current rounded-sm h-1"></div>
                  <div className="bg-current rounded-sm h-1"></div>
                </div>
              </Button>
            </div>
          </div>
          {/* Category Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <Label htmlFor="category-filter" className="text-sm font-medium">
              Filter by Category:
            </Label>
            <select
              id="category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm w-full sm:w-auto"
              style={{ 
                backgroundColor: 'var(--input)', 
                borderColor: 'var(--border)',
                color: 'var(--foreground)'
              }}
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
            {isFilterActive && (
              <Button size="sm" variant="outline" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Events List */}
        <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6" : "space-y-4"}>
          {loading ? (
            renderSkeletons()
          ) : filteredEvents.length === 0 ? (
            <div className="col-span-full text-center py-8 md:py-12">
              <div className="max-w-md mx-auto">
                <Trophy className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-base md:text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">No events found</h3>
                <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mb-4">
                  {searchTerm || selectedCategory !== 'all' 
                    ? 'Try adjusting your search or filters' 
                    : 'No sports events are available at the moment.'
                  }
                </p>
              </div>
            </div>
          ) : (
            filteredEvents.map((event) => (
              <Card key={event.id} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer group" onClick={() => handleCardClick(event)}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex justify-between items-start">
                    <span className="text-lg group-hover:text-blue-600 transition-colors">{event.title}</span>
                  </CardTitle>
                  <CardDescription className="line-clamp-2">{event.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                    {event.date} at {event.time}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-2 text-red-500" />
                    {event.location}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="w-4 h-4 mr-2 text-green-500" />
                    {event.participants?.length || 0}/{event.maxParticipants} participants
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900" onClick={e => { e.stopPropagation(); handleCategoryBadgeClick(event.category) }}>{event.category}</Badge>
                    {!isUserJoined(event) && (event.participants?.length || 0) < event.maxParticipants && (
                      <Button size="sm" onClick={e => { e.stopPropagation(); handleJoinEvent(event.id) }}>
                        Join Event
                      </Button>
                    )}
                    {isUserJoined(event) && (
                      <Badge variant="outline" className="text-xs text-green-600 border-green-400">Joined</Badge>
                    )}
                    {(event.participants?.length || 0) >= event.maxParticipants && !isUserJoined(event) && (
                      <Badge variant="destructive" className="text-xs">Full</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Event Details Modal */}
      {showEventDetails && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl mx-auto max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <span className="text-2xl">{selectedEvent.title}</span>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" onClick={() => setShowEventDetails(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardTitle>
              <CardDescription className="text-lg">{selectedEvent.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  <span className="font-medium">{selectedEvent.date} at {selectedEvent.time}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-red-500" />
                  <span className="font-medium">{selectedEvent.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-green-500" />
                  <span className="font-medium">{selectedEvent.participants?.length || 0}/{selectedEvent.maxParticipants} participants</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-sm cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900" onClick={() => { setShowEventDetails(false); handleCategoryBadgeClick(selectedEvent.category) }}>{selectedEvent.category}</Badge>
                </div>
              </div>
              {/* <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pt-4 border-t">
                <Button variant="outline" onClick={() => handleShareEvent(selectedEvent)} className="flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  Share Event
                </Button>
                {shareSuccess && <span className="text-green-600 text-sm">Copied/Shared!</span>}
              </div> */}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default AllEventsPage 