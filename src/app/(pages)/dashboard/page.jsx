'use client'
import React, { useState, useEffect } from 'react'
import { auth, db } from '@/firebase/firebaseConfig'
import { doc, getDoc, collection, addDoc, updateDoc, deleteDoc, getDocs, query, where, arrayUnion, arrayRemove } from 'firebase/firestore'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  MapPin, 
  Trophy, 
  Users, 
  User,
  Settings,
  LogOut,
  Eye,
  EyeOff,
  UserPlus,
  UserMinus,
  Search,
  ChevronRight,
 
  RefreshCw,
 
  Target,
  
} from 'lucide-react'

function Dashboard() {
  const [userData, setUserData] = useState(null)
  const [events, setEvents] = useState([])
  const [joinedEvents, setJoinedEvents] = useState([])
  const [categories, setCategories] = useState([])
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('events')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('date')
  const [viewMode, setViewMode] = useState('grid')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showEventDetails, setShowEventDetails] = useState(false)
  
  // Form states
  const [showEventForm, setShowEventForm] = useState(false)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [showCityForm, setShowCityForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  
  // Form data
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: '',
    maxParticipants: '',
    
  })
  
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: ''
  })
  
  const [cityForm, setCityForm] = useState({
    name: '',
    state: ''
  })

  const { user, role, loading: authLoading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push('/login')
      toast.error('You need to login first')
      return
    }
    
    fetchUserData()
    fetchEvents()
    fetchJoinedEvents()
    fetchCategories() // All users need categories for filtering
    if (role === 'admin') {
      fetchCities()
    }
  }, [authLoading,user, role, router])

  const fetchUserData = async () => {
    try {
      const docRef = doc(db, 'users', user.uid)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        setUserData(docSnap.data())
      } else {
        toast.error('No user data found')
      }
    } catch (error) {
      toast.error('Error fetching user data: ' + error.message)
      console.error('Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchEvents = async () => {
    try {
      const eventsRef = collection(db, 'events')
      const q = role === 'admin' ? eventsRef : query(eventsRef, where('createdBy', '==', user.uid))
      const querySnapshot = await getDocs(q)
      const eventsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setEvents(eventsData)
    } catch (error) {
      toast.error('Error fetching events: ' + error.message)
    }
  }

  const fetchJoinedEvents = async () => {
    try {
      const eventsRef = collection(db, 'events')
      const querySnapshot = await getDocs(eventsRef)
      const eventsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      // Filter events where the current user is a participant
      const joinedEventsData = eventsData.filter(event => 
        event.participants?.includes(user.uid)
      )
      setJoinedEvents(joinedEventsData)
    } catch (error) {
      toast.error('Error fetching joined events: ' + error.message)
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
      toast.error('Error fetching categories: ' + error.message)
    }
  }

  const fetchCities = async () => {
    try {
      const citiesRef = collection(db, 'cities')
      const querySnapshot = await getDocs(citiesRef)
      const citiesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setCities(citiesData)
    } catch (error) {
      toast.error('Error fetching cities: ' + error.message)
    }
  }

  const handleLogout = async () => {
    try {
      await auth.signOut()
      router.push('/login')
      toast.success('Logged out successfully')
    } catch (error) {
      toast.error('Error logging out: ' + error.message)
      console.log(error.message);
      
    }
  }

  const handleJoinEvent = async (eventId) => {
    try {
      const eventRef = doc(db, 'events', eventId)
      await updateDoc(eventRef, {
        participants: arrayUnion(user.uid)
      })
      toast.success('Successfully joined the event!')
      fetchEvents()
      fetchJoinedEvents()
    } catch (error) {
      toast.error('Error joining event: ' + error.message)
    }
  }

  const handleLeaveEvent = async (eventId) => {
    try {
      const eventRef = doc(db, 'events', eventId)
      await updateDoc(eventRef, {
        participants: arrayRemove(user.uid)
      })
      toast.success('Successfully left the event!')
      fetchEvents()
      fetchJoinedEvents()
    } catch (error) {
      toast.error('Error leaving event: ' + error.message)
    }
  }

  const isUserJoined = (event) => {
    return user && event.participants?.includes(user.uid) || false
  }

  const isUserCreator = (event) => {
    return user && event.createdBy === user.uid
  }

  // Filter and sort events
  const getFilteredAndSortedEvents = (eventsList) => {
    let filtered = eventsList

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(event => event.category === selectedCategory)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Sort events
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

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await Promise.all([
        fetchEvents(),
        fetchJoinedEvents(),
        fetchCategories()
      ])
      toast.success('Dashboard refreshed!')
    } catch (error) {
      toast.error('Error refreshing dashboard')
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleEventClick = (event) => {
    setSelectedEvent(event)
    setShowEventDetails(true)
  }

 

  const handleEventSubmit = async (e) => {
    e.preventDefault()
    try {
      const eventData = {
        ...eventForm,
        createdBy: user.uid,
        createdAt: new Date().toISOString(),
        participants: []
      }
      
      if (editingItem) {
        await updateDoc(doc(db, 'events', editingItem.id), eventData)
        toast.success('Event updated successfully')
      } else {
        await addDoc(collection(db, 'events'), eventData)
        toast.success('Event created successfully')
      }
      
      setShowEventForm(false)
      setEditingItem(null)
      setEventForm({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        category: '',
        maxParticipants: '',
        entryFee: '',
        createdBy: user.uid
      })
      fetchEvents()
      fetchJoinedEvents()
    } catch (error) {
      toast.error('Error saving event: ' + error.message)
    }
  }

  const handleCategorySubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingItem) {
        await updateDoc(doc(db, 'categories', editingItem.id), categoryForm)
        toast.success('Category updated successfully')
      } else {
        await addDoc(collection(db, 'categories'), categoryForm)
        toast.success('Category created successfully')
      }
      
      setShowCategoryForm(false)
      setEditingItem(null)
      setCategoryForm({ name: '', description: '' })
      fetchCategories()
    } catch (error) {
      toast.error('Error saving category: ' + error.message)
    }
  }

  const handleCitySubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingItem) {
        await updateDoc(doc(db, 'cities', editingItem.id), cityForm)
        toast.success('City updated successfully')
      } else {
        await addDoc(collection(db, 'cities'), cityForm)
        toast.success('City created successfully')
      }
      
      setShowCityForm(false)
      setEditingItem(null)
      setCityForm({ name: '', state: '' })
      fetchCities()
    } catch (error) {
      toast.error('Error saving city: ' + error.message)
    }
  }

  const handleDelete = async (collectionName, id) => {
    try {
      await deleteDoc(doc(db, collectionName, id))
      toast.success('Item deleted successfully')
      if (collectionName === 'events') {
        fetchEvents()
        fetchJoinedEvents()
      }
      if (collectionName === 'categories') fetchCategories()
      if (collectionName === 'cities') fetchCities()
    } catch (error) {
      toast.error('Error deleting item: ' + error.message)
    }
  }

  const handleEdit = (item, type) => {
    setEditingItem(item)
    if (type === 'event') {
      setEventForm(item)
      setShowEventForm(true)
    } else if (type === 'category') {
      setCategoryForm(item)
      setShowCategoryForm(true)
    } else if (type === 'city') {
      setCityForm(item)
      setShowCityForm(true)
    }
  }

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">Loading your dashboard...</h2>
          <p className="text-gray-500 dark:text-gray-400">Please wait while we fetch your data</p>
        </div>
      </div>
    )
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="p-6 space-y-6">
        {/* Header with Stats */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Welcome back, {userData?.fullName || 'User'}!
              </h1>
              <p className="text-muted-foreground mt-2 text-base md:text-lg">
                {role === 'admin' ? 'Admin Dashboard' : 'User Dashboard'}
              </p>
            </div>
            <div className="flex items-center gap-2 md:space-x-3">
              <Button 
                onClick={handleRefresh} 
                variant="outline" 
                size="sm"
                disabled={isRefreshing}
                className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                <RefreshCw className={`w-4 h-4 mr-1 md:mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <Button onClick={handleLogout} variant="outline" className="hover:bg-red-50 dark:hover:bg-red-900/20">
                <LogOut className="w-4 h-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">My Events</p>
                    <p className="text-2xl font-bold">{events.length}</p>
                  </div>
                  <Trophy className="w-8 h-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Joined Events</p>
                    <p className="text-2xl font-bold">{joinedEvents.length}</p>
                  </div>
                  <UserPlus className="w-8 h-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Categories</p>
                    <p className="text-2xl font-bold">{categories.length}</p>
                  </div>
                  <Target className="w-8 h-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">Cities</p>
                    <p className="text-2xl font-bold">{cities.length}</p>
                  </div>
                  <MapPin className="w-8 h-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

      {/* Role Badge and Controls */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <Badge 
          variant={role === 'admin' ? 'destructive' : 'secondary'}
          className="w-fit text-sm px-3 md:px-4 py-2"
        >
          {role === 'admin' ? 'Administrator' : 'User'}
        </Badge>
        
        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm bg-white/80 dark:bg-gray-800/80 flex-1 sm:flex-none"
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
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-t-lg p-2" style={{ borderColor: 'var(--border)' }}>
        <button
          onClick={() => setActiveTab('events')}
          className={`px-2 md:px-4 py-2 rounded-t-lg transition-colors text-sm md:text-base ${
            activeTab === 'events' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Trophy className="w-4 h-4 inline mr-1 md:mr-2" />
          <span className="hidden sm:inline">My Events</span>
          <span className="sm:hidden">My</span>
        </button>
        <button
          onClick={() => setActiveTab('joinedEvents')}
          className={`px-2 md:px-4 py-2 rounded-t-lg transition-colors text-sm md:text-base ${
            activeTab === 'joinedEvents' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <UserPlus className="w-4 h-4 inline mr-1 md:mr-2" />
          <span className="hidden sm:inline">Joined Events</span>
          <span className="sm:hidden">Joined</span>
        </button>
        {role === 'admin' && (
          <>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-2 md:px-4 py-2 rounded-t-lg transition-colors text-sm md:text-base ${
                activeTab === 'categories' 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Settings className="w-4 h-4 inline mr-1 md:mr-2" />
              <span className="hidden sm:inline">Categories</span>
              <span className="sm:hidden">Cat</span>
            </button>
            <button
              onClick={() => setActiveTab('cities')}
              className={`px-2 md:px-4 py-2 rounded-t-lg transition-colors text-sm md:text-base ${
                activeTab === 'cities' 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <MapPin className="w-4 h-4 inline mr-1 md:mr-2" />
              <span className="hidden sm:inline">Cities</span>
              <span className="sm:hidden">Cities</span>
            </button>
          </>
        )}
      </div>

      {/* My Events Tab */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h2 className="text-xl md:text-2xl font-semibold">My Sports Events</h2>
            <Button onClick={() => setShowEventForm(true)} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </Button>
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
          </div>
          
          <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6" : "space-y-4"}>
            {getFilteredAndSortedEvents(events).length === 0 ? (
              <div className="col-span-full text-center py-8 md:py-12">
                <div className="max-w-md mx-auto">
                  <Trophy className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-base md:text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">No events found</h3>
                  <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mb-4">
                    {searchTerm || selectedCategory !== 'all' 
                      ? 'Try adjusting your search or filters' 
                      : 'Create your first sports event to get started!'
                    }
                  </p>
                  <Button onClick={() => setShowEventForm(true)} className="w-full sm:w-auto">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Event
                  </Button>
                </div>
              </div>
            ) : (
              getFilteredAndSortedEvents(events).map((event) => (
              <Card 
                key={event.id} 
                className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer group ${
                  viewMode === 'list' ? 'flex items-center p-4' : ''
                }`}
                onClick={() => handleEventClick(event)}
              >
                {viewMode === 'list' ? (
                  <>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-semibold group-hover:text-blue-600 transition-colors">{event.title}</h3>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="text-xs">
                            {event.category}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            ${event.entryFee}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mb-3">{event.description}</p>
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {event.date} at {event.time}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {event.location}
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {event.participants?.length || 0}/{event.maxParticipants}
                        </div>
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {event.createdBy === user?.uid ? 'You' : 'Other User'}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEdit(event, 'event')
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete('events', event.id)
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex justify-between items-start">
                        <span className="text-lg group-hover:text-blue-600 transition-colors">{event.title}</span>
                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEdit(event, 'event')
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete('events', event.id)
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
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
                        <Badge variant="secondary" className="text-xs">
                          {event.category}
                        </Badge>
                        {/* <Badge variant="outline" className="text-xs">
                          ${event.entryFee}
                        </Badge> */}
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <User className="w-3 h-3 mr-1" />
                        Created by: {event.createdBy === user?.uid ? 'You' : 'Other User'}
                      </div>
                    </CardContent>
                  </>
                )}
              </Card>
            ))
            )}
          </div>
        </div>
      )}

      {/* Joined Events Tab */}
      {activeTab === 'joinedEvents' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h2 className="text-xl md:text-2xl font-semibold">My Joined Events</h2>
            <Button onClick={() => setShowEventForm(true)} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </Button>
          </div>
          
          {/* Category Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <Label htmlFor="category-filter-joined" className="text-sm font-medium">
              Filter by Category:
            </Label>
            <select
              id="category-filter-joined"
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
          </div>
          
          <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6" : "space-y-4"}>
            {getFilteredAndSortedEvents(joinedEvents).map((event) => (
              <Card key={event.id} style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-start">
                    <span className="text-lg">{event.title}</span>
                    <div className="flex space-x-1">
                      {isUserCreator(event) && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(event, 'event')}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete('events', event.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </CardTitle>
                  <CardDescription>{event.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2" />
                    {event.date} at {event.time}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-2" />
                    {event.location}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="w-4 h-4 mr-2" />
                    {event.participants?.length || 0}/{event.maxParticipants} participants
                  </div>
                  <Badge variant="secondary">
                    Entry Fee: ${event.entryFee}
                  </Badge>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <User className="w-3 h-3 mr-1" />
                    Created by: {event.createdBy === user?.uid ? 'You' : 'Other User'}
                  </div>
                  <div className="pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleLeaveEvent(event.id)}
                      className="w-full"
                    >
                      <UserMinus className="w-4 h-4 mr-2" />
                      Leave Event
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Categories Tab (Admin Only) */}
      {activeTab === 'categories' && role === 'admin' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h2 className="text-xl md:text-2xl font-semibold">Sports Categories</h2>
            <Button onClick={() => setShowCategoryForm(true)} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <Card key={category.id} style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-start">
                    <span>{category.name}</span>
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(category, 'category')}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete('categories', category.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Cities Tab (Admin Only) */}
      {activeTab === 'cities' && role === 'admin' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h2 className="text-xl md:text-2xl font-semibold">Cities</h2>
            <Button onClick={() => setShowCityForm(true)} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add City
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cities.map((city) => (
              <Card key={city.id} style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-start">
                    <span>{city.name}</span>
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(city, 'city')}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete('cities', city.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardTitle>
                  <CardDescription>{city.state}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Event Form Modal */}
      {showEventForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto" style={{ backgroundColor: 'var(--card)' }}>
            <CardHeader>
              <CardTitle>{editingItem ? 'Edit Event' : 'Add New Event'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEventSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Event Title</Label>
                  <Input
                    id="title"
                    value={eventForm.title}
                    onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={eventForm.description}
                    onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={eventForm.date}
                      onChange={(e) => setEventForm({...eventForm, date: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={eventForm.time}
                      onChange={(e) => setEventForm({...eventForm, time: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={eventForm.location}
                    onChange={(e) => setEventForm({...eventForm, location: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={eventForm.category}
                    onChange={(e) => setEventForm({...eventForm, category: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md"
                    style={{ 
                      backgroundColor: 'var(--input)', 
                      borderColor: 'var(--border)',
                      color: 'var(--foreground)'
                    }}
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-1  gap-4">
                  <div>
                    <Label htmlFor="maxParticipants">Max Participants</Label>
                    <Input
                      id="maxParticipants"
                      type="number"
                      value={eventForm.maxParticipants}
                      onChange={(e) => setEventForm({...eventForm, maxParticipants: e.target.value})}
                      required
                    />
                  </div>
                  {/* <div>
                    <Label htmlFor="entryFee">Entry Fee ($)</Label>
                    <Input
                      id="entryFee"
                      type="number"
                      value={eventForm.entryFee}
                      onChange={(e) => setEventForm({...eventForm, entryFee: e.target.value})}
                      required
                    />
                  </div> */}
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button type="submit" className="flex-1">
                    {editingItem ? 'Update Event' : 'Create Event'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowEventForm(false)
                      setEditingItem(null)
                      setEventForm({
                        title: '',
                        description: '',
                        date: '',
                        time: '',
                        location: '',
                        category: '',
                        maxParticipants: '',
                        entryFee: ''
                      })
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Category Form Modal */}
      {showCategoryForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md mx-auto" style={{ backgroundColor: 'var(--card)' }}>
            <CardHeader>
              <CardTitle>{editingItem ? 'Edit Category' : 'Add New Category'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCategorySubmit} className="space-y-4">
                <div>
                  <Label htmlFor="categoryName">Category Name</Label>
                  <Input
                    id="categoryName"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="categoryDescription">Description</Label>
                  <Input
                    id="categoryDescription"
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                    required
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button type="submit" className="flex-1">
                    {editingItem ? 'Update Category' : 'Create Category'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowCategoryForm(false)
                      setEditingItem(null)
                      setCategoryForm({ name: '', description: '' })
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* City Form Modal */}
      {showCityForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md mx-auto" style={{ backgroundColor: 'var(--card)' }}>
            <CardHeader>
              <CardTitle>{editingItem ? 'Edit City' : 'Add New City'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCitySubmit} className="space-y-4">
                <div>
                  <Label htmlFor="cityName">City Name</Label>
                  <Input
                    id="cityName"
                    value={cityForm.name}
                    onChange={(e) => setCityForm({...cityForm, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cityState">State</Label>
                  <Input
                    id="cityState"
                    value={cityForm.state}
                    onChange={(e) => setCityForm({...cityForm, state: e.target.value})}
                    required
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button type="submit" className="flex-1">
                    {editingItem ? 'Update City' : 'Create City'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowCityForm(false)
                      setEditingItem(null)
                      setCityForm({ name: '', state: '' })
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Event Details Modal */}
      {showEventDetails && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl mx-auto max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <span className="text-2xl">{selectedEvent.title}</span>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowEventDetails(false)}
                  >
                    <ChevronRight className="w-4 h-4" />
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
                {/* <div className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <span className="font-medium">${selectedEvent.entryFee} entry fee</span>
                </div> */}
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-purple-500" />
                  <span className="font-medium">Created by: {selectedEvent.createdBy === user?.uid ? 'You' : 'Other User'}</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pt-4 border-t">
                <Badge variant="secondary" className="text-sm w-fit">
                  {selectedEvent.category}
                </Badge>
                {!isUserCreator(selectedEvent) && (
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    {isUserJoined(selectedEvent) ? (
                      <Button
                        variant="outline"
                        onClick={() => {
                          handleLeaveEvent(selectedEvent.id)
                          setShowEventDetails(false)
                        }}
                        className="w-full sm:w-auto"
                      >
                        <UserMinus className="w-4 h-4 mr-2" />
                        Leave Event
                      </Button>
                    ) : (
                      <Button
                        onClick={() => {
                          handleJoinEvent(selectedEvent.id)
                          setShowEventDetails(false)
                        }}
                        disabled={selectedEvent.participants?.length >= selectedEvent.maxParticipants}
                        className="w-full sm:w-auto"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        {selectedEvent.participants?.length >= selectedEvent.maxParticipants ? 'Event Full' : 'Join Event'}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  </div>
  )
}

export default Dashboard
