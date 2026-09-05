# Build a Full-Stack React Native Expo App — Homecoming

Build a complete, polished, production-style **React Native mobile application using Expo** called **Homecoming**.

The application must solve a genuine real-world safety problem while intentionally demonstrating the React Native, Expo, navigation, camera, location, contacts, media, authentication, networking, backend, database, and CRUD concepts listed below.

---

# 1. Application Name

**Homecoming**

### Tagline

**"Get there. Check in. Get home safe."**

---

# 2. Real-Life Problem

People travelling alone at night — students, women commuting, night-shift workers, people walking alone, people travelling in unfamiliar cities, or anyone returning home alone — do not have a lightweight way to communicate that they are safe.

A person can share their WhatsApp live location, but location alone does not answer:

* Are they okay?
* Have they reached their destination?
* Are they still moving?
* Have they stopped unexpectedly?
* Did they miss their safety check-in?
* Did something happen?
* What was their last known location?

Homecoming should solve this problem through a **temporary safety journey system**.

The basic flow should be:

```text
Start Journey
      ↓
Select Destination
      ↓
Select Trusted Contacts
      ↓
Configure Check-in Interval
      ↓
Start Journey
      ↓
Track Location
      ↓
Periodic "Are you safe?" Check-in
      ↓
User confirms "I'm Safe"
      ↓
Journey continues
      ↓
User reaches destination
      ↓
User ends journey
```

If the user does not respond to a check-in within a configured period, the application should enter an **attention/escalation state** and notify the user's trusted contacts through the backend notification mechanism.

The application should make it very clear that it is a **safety-support tool, not an emergency service**.

---

# 3. Technology Stack

## Frontend

Use:

* React Native
* Expo
* TypeScript
* Expo Router
* React Hooks
* Expo Location
* Expo Camera
* Expo Contacts
* Expo Image Picker
* Expo Notifications
* Expo Secure Store
* AsyncStorage
* React Native Maps / Expo-compatible map library
* Axios or fetch

## Backend

Use:

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcrypt
* dotenv
* cors
* multer
* express-validator or equivalent validation library

Use REST APIs between the mobile application and backend.

---

# 4. Project Architecture

Use a clean, scalable structure.

```text
homecoming/
│
├── app/
│   ├── _layout.tsx
│   ├── index.tsx
│   │
│   ├── auth/
│   │   ├── login.tsx
│   │   └── register.tsx
│   │
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── home.tsx
│   │   ├── journeys.tsx
│   │   ├── contacts.tsx
│   │   └── profile.tsx
│   │
│   ├── journey/
│   │   ├── create.tsx
│   │   ├── [id].tsx
│   │   ├── map.tsx
│   │   └── emergency.tsx
│   │
│   ├── camera/
│   │   ├── index.tsx
│   │   └── preview.tsx
│   │
│   └── contacts/
│       └── [id].tsx
│
├── components/
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   ├── Header.tsx
│   ├── Loading.tsx
│   ├── EmptyState.tsx
│   ├── ErrorState.tsx
│   ├── ContactCard.tsx
│   ├── JourneyCard.tsx
│   └── SafetyStatus.tsx
│
├── hooks/
│   ├── useAuth.ts
│   ├── useLocation.ts
│   ├── useContacts.ts
│   └── useJourney.ts
│
├── services/
│   ├── api.ts
│   ├── authService.ts
│   ├── journeyService.ts
│   ├── contactService.ts
│   └── mediaService.ts
│
├── utils/
│   ├── validation.ts
│   ├── storage.ts
│   └── constants.ts
│
├── types/
│   ├── auth.ts
│   ├── journey.ts
│   ├── contact.ts
│   └── location.ts
│
└── backend/
    ├── server.js
    ├── config/
    ├── models/
    ├── controllers/
    ├── routes/
    ├── middleware/
    ├── services/
    └── uploads/
```

Separate frontend and backend code clearly.

---

# 5. Authentication

Create:

## Registration Screen

Fields:

* Full name
* Email
* Phone number
* Password
* Confirm password

Implement:

* Form validation
* Required fields
* Email validation
* Password validation
* Password confirmation
* Loading state
* API error state
* Success state

Backend:

```text
POST /api/auth/register
```

Hash passwords using bcrypt.

Never store plaintext passwords.

---

## Login Screen

Fields:

* Email
* Password

Implement:

```text
POST /api/auth/login
```

After successful login:

* Receive JWT
* Store token securely using Expo SecureStore
* Store basic user information locally
* Navigate to Home

---

# 6. Protected Routes

Implement authenticated/protected routes using Expo Router.

Unauthenticated users should only access:

```text
/login
/register
```

Authenticated users should access:

```text
/home
/journeys
/contacts
/profile
/journey/*
/camera/*
```

If the token is missing or invalid:

```text
router.replace("/login")
```

---

# 7. Home Dashboard

Create a modern safety-focused dashboard.

Display:

```text
Good evening, Hanuman

Your safety status
● No active journey

[ Start a Journey ]

Recent journeys

Trusted contacts

Last known location
```

The dashboard should show:

* Current safety status
* Active journey
* Current location
* Last known location
* Recent journey
* Trusted contacts
* Quick emergency action

Use reusable components.

---

# 8. Start a Homecoming Journey

This is the main feature of the application.

Create a multi-step journey creation flow.

## Step 1 — Journey Details

Fields:

```text
Journey name
Destination
Estimated travel time
```

Example:

```text
Journey name:
Going Home

Destination:
My Home

Estimated duration:
30 minutes
```

---

# 9. Location Permission

Before using location:

Request foreground location permission.

Handle all states:

### Granted

Continue.

### Denied

Show:

```text
Location permission is required to track your journey.
```

Provide an option to retry.

### Location services disabled

Show a useful explanation.

### Permanently denied

Provide instructions for enabling location permissions from device settings.

Never let permission failures crash the application.

---

# 10. Current Location

Implement:

```text
getCurrentPositionAsync()
```

Display:

* Latitude
* Longitude
* Accuracy
* Timestamp

Also retrieve the last known location when possible.

Implement a reusable hook:

```text
useLocation()
```

The hook should expose:

```text
currentLocation
lastKnownLocation
loading
error
startTracking()
stopTracking()
```

---

# 11. Destination Selection

Allow the user to:

### Option 1

Use current location.

### Option 2

Search for a location.

### Option 3

Select a location from the map.

### Option 4

Enter an address.

Convert coordinates into a readable address using reverse geocoding.

Example:

```text
Latitude:
23.12345

Longitude:
72.12345

Address:
Ahmedabad, Gujarat, India
```

---

# 12. Map Screen

Create a dedicated map screen.

Display:

* Current location marker
* Destination marker
* Last known location
* Location history
* Journey route/path

Add:

```text
[ Center on Me ]
```

When pressed, move the map camera to the user's current location.

The map should automatically update when the user's location changes.

---

# 13. Trusted Contacts

Use Expo Contacts.

Request contacts permission.

If permission is granted:

Retrieve device contacts.

Display contacts using:

```text
FlatList
```

Each contact should display:

```text
Name
Phone number
Profile/photo if available
```

Implement:

* Search
* Filter
* Select contact
* Multiple selection
* Contact details
* Empty state
* Permission denied state

---

# 14. Trusted Contact Management

Users should also be able to maintain their trusted contacts inside Homecoming.

Backend CRUD:

```text
GET    /api/contacts
POST   /api/contacts
GET    /api/contacts/:id
PUT    /api/contacts/:id
DELETE /api/contacts/:id
```

Features:

* Add trusted contact
* Edit contact
* Delete contact
* View contact details
* Mark/unmark as trusted

Use confirmation dialogs before deletion.

---

# 15. Journey Configuration

Before starting the journey, allow the user to configure:

### Check-in interval

Options:

```text
5 minutes
10 minutes
15 minutes
30 minutes
```

### Grace period

Example:

```text
5 minutes
```

### Trusted contacts

Select one or more contacts.

### Destination

Store:

```text
latitude
longitude
address
```

---

# 16. Active Journey Screen

After pressing:

**Start Journey**

show:

```text
HOMEcoming Journey Active

Going Home

Destination
Ahmedabad

Time remaining
24 min

Current status
SAFE

Last check-in
2 min ago

Next check-in
In 3 min
```

Buttons:

```text
[ I'M SAFE ]

[ VIEW MAP ]

[ EMERGENCY ]

[ END JOURNEY ]
```

Make the **I'm Safe** button visually prominent.

---

# 17. Safety Check-In System

This is the main feature that differentiates Homecoming from simple location sharing.

At the configured interval, show:

```text
Are you still safe?

Your trusted contacts are waiting for your check-in.

[ I'M SAFE ]

[ I NEED HELP ]
```

If the user presses:

```text
I'M SAFE
```

reset the check-in timer.

Store:

```text
checkInTime
location
status
```

If the user does not respond within the grace period:

Change status to:

```text
CHECK-IN MISSED
```

Then initiate the configured escalation workflow.

---

# 18. Journey Status

Use clear journey states:

```text
PLANNED
ACTIVE
CHECK-IN_PENDING
SAFE
CHECK-IN_MISSED
ESCALATED
COMPLETED
CANCELLED
```

Use conditional rendering to display appropriate UI for each state.

---

# 19. Emergency Screen

Create an emergency screen with a large action:

```text
I NEED HELP
```

Show:

```text
Current location
Last known location
Current journey
Destination
Trusted contacts
```

Actions:

```text
Call emergency services
Call trusted contact
Share current location
Cancel emergency
```

Use device capabilities where appropriate.

Clearly label emergency-service functionality according to the user's actual country/device configuration rather than hard-coding a universal number.

---

# 20. Location Watcher

During an active journey use:

```text
watchPositionAsync()
```

Track:

```text
latitude
longitude
accuracy
speed
heading
timestamp
```

Send location updates to the backend.

Implement proper cleanup:

```text
subscription.remove()
```

when:

* Journey ends
* User leaves screen
* Component unmounts
* Tracking is stopped

Avoid memory leaks.

---

# 21. Backend Journey APIs

Create:

```text
POST   /api/journeys
GET    /api/journeys
GET    /api/journeys/:id
PUT    /api/journeys/:id
DELETE /api/journeys/:id
```

Additional endpoints:

```text
POST /api/journeys/:id/start
POST /api/journeys/:id/check-in
POST /api/journeys/:id/end
POST /api/journeys/:id/emergency
POST /api/journeys/:id/location
```

Protect all journey endpoints using JWT authentication.

---

# 22. MongoDB Models

Create appropriate Mongoose models.

## User

```text
name
email
phone
password
profileImage
createdAt
updatedAt
```

## TrustedContact

```text
userId
name
phone
email
relationship
isTrusted
createdAt
updatedAt
```

## Journey

```text
userId
name
destination
destinationLatitude
destinationLongitude
startLatitude
startLongitude
status
estimatedDuration
checkInInterval
gracePeriod
startTime
expectedArrival
actualArrival
lastCheckIn
createdAt
updatedAt
```

## LocationHistory

```text
journeyId
latitude
longitude
accuracy
speed
heading
timestamp
```

## CheckIn

```text
journeyId
userId
location
status
requestedAt
respondedAt
```

---

# 23. Journey History

Create a Journeys screen.

Display previous journeys using:

```text
FlatList
```

Each card:

```text
Going Home

Completed

Aug 31, 2026
30 minutes

Destination:
Ahmedabad

Check-ins:
4/4
```

Allow tapping a journey.

Navigate using:

```text
router.push(`/journey/${id}`)
```

Use dynamic routing.

---

# 24. Dynamic Journey Route

Create:

```text
journey/[id].tsx
```

Retrieve:

```text
id
```

from route parameters.

Fetch the corresponding journey from the backend.

Display:

* Journey information
* Status
* Destination
* Timeline
* Check-ins
* Location history

---

# 25. Camera Feature

Implement an in-app camera.

Use Expo Camera.

Request camera permission.

Implement:

* Camera preview
* Front/back camera
* Flip camera
* Torch/flash
* Zoom
* Auto focus
* Tap-to-focus if supported
* Capture image
* Captured image preview
* Retake
* Save captured image

Use the camera for an optional **journey verification photo**.

For example, when starting a journey the user may capture a quick photo that can be attached to the journey record.

---

# 26. Media / Gallery

Allow users to select an image from their gallery.

Implement:

* Gallery permission
* Image picker
* Image preview
* Image validation
* Image compression/resizing
* Upload
* Loading state
* Error state

Use multipart/form-data.

Backend:

```text
POST /api/media/upload
```

Use multer.

Do not store huge raw images unnecessarily.

---

# 27. Video Recording

Implement a basic video recording screen using Expo Camera.

Features:

```text
Start recording
Stop recording
Video preview
Retake
Upload
```

Handle:

* Camera permission
* Recording errors
* Loading state
* Upload errors

Keep this feature optional to the main safety flow so the core journey experience remains lightweight.

---

# 28. Contacts Integration

Create a Contacts screen.

Features:

* Request contacts permission
* Get device contacts
* FlatList
* Search
* Filter
* Contact details
* Add trusted contact
* Edit trusted contact
* Delete trusted contact
* Open contact using device app when appropriate

Handle:

```text
Permission denied
No contacts found
Loading
Error
```

---

# 29. Profile Screen

Display:

```text
Profile photo
Name
Email
Phone
```

Options:

```text
Edit Profile
Trusted Contacts
Notification Settings
Location Settings
Theme
Privacy
Logout
```

Implement logout.

On logout:

* Remove JWT from SecureStore
* Clear relevant local state
* Navigate to login using:

```text
router.replace("/login")
```

---

# 30. Local Persistence

Use:

### SecureStore

For:

```text
JWT
authentication credentials/tokens
```

Use:

### AsyncStorage

For non-sensitive preferences such as:

```text
theme
onboarding status
last selected settings
```

Never store sensitive authentication secrets in plain AsyncStorage.

---

# 31. Networking

Create a reusable API client.

Example:

```text
services/api.ts
```

Implement:

```text
GET
POST
PUT/PATCH
DELETE
```

Handle:

```text
Loading
Success
Validation error
401 Unauthorized
403 Forbidden
404 Not Found
500 Server Error
Network failure
Timeout
```

Automatically attach JWT to authenticated API requests.

---

# 32. API Error Handling

Backend responses should use a consistent structure.

Example:

```json
{
  "success": false,
  "message": "Journey not found"
}
```

Frontend should display friendly error messages.

Never expose raw backend stack traces to the user.

---

# 33. UI/UX Requirements

The application should feel like a real safety product.

Design principles:

* Clean
* Calm
* Minimal
* Mobile-first
* Accessible
* Easy to understand under stress
* Large primary actions
* Clear status indicators
* Good spacing
* Consistent typography
* Reusable components

Do not overcrowd screens.

The emergency action should always be easy to find during an active journey.

---

# 34. Dark / Light Theme

Implement:

```text
Light mode
Dark mode
```

Store the user's preference locally.

Create reusable theme constants.

Avoid hard-coding colors throughout components.

---

# 35. Loading States

Every asynchronous operation should have a loading state.

Examples:

```text
Loading location...
Loading contacts...
Starting journey...
Uploading image...
Saving profile...
Ending journey...
```

Use:

```text
ActivityIndicator
```

where appropriate.

---

# 36. Empty States

Create useful empty states.

Examples:

```text
No journeys yet

Start your first Homecoming journey to keep your loved ones informed.
```

```text
No trusted contacts

Add someone you trust before starting a journey.
```

```text
No location available

We couldn't determine your current location.
```

---

# 37. Pull To Refresh

Implement pull-to-refresh on:

* Journey history
* Trusted contacts
* Profile-related data where appropriate

Use:

```text
RefreshControl
```

---

# 38. Search and Filtering

Implement search/filtering for:

### Contacts

Search by:

```text
name
phone
```

### Journeys

Filter by:

```text
All
Active
Completed
Cancelled
Missed check-ins
```

---

# 39. Pagination

Implement pagination for journey history.

Backend example:

```text
GET /api/journeys?page=1&limit=10
```

Frontend should load additional journeys when the user reaches the end of the list.

---

# 40. Confirmation Dialogs

Before destructive actions:

```text
Delete contact?
End journey?
Delete journey?
Logout?
```

Use:

```text
Alert
```

or a reusable confirmation modal.

---

# 41. Toast / Notifications

Show feedback for:

```text
Journey started
Check-in completed
Journey ended
Contact added
Contact deleted
Profile updated
Image uploaded
Network error
```

Use a suitable toast implementation compatible with Expo.

---

# 42. Expo Notifications

Use Expo Notifications for local check-in reminders.

Example:

```text
Homecoming Check-In

Are you still safe?

Tap Homecoming to confirm.
```

Also implement the notification handler correctly.

Handle notification permissions.

Do not rely exclusively on background JavaScript execution for life-critical behavior.

The application should explain that notification/background behavior can vary depending on the operating system and device.

---

# 43. Security

Implement:

* JWT authentication
* Password hashing
* Protected APIs
* Request validation
* Secure token storage
* Environment variables
* CORS
* Authentication middleware
* Ownership checks

A user must only be able to access:

```text
their own journeys
their own location history
their own trusted contacts
their own profile
```

Never trust `userId` supplied directly by the client when JWT identity is available.

Use the authenticated user from the JWT.

---

# 44. Environment Variables

Use:

```text
.env
```

Example:

```text
MONGODB_URI=
JWT_SECRET=
PORT=
API_URL=
```

Do not hard-code secrets.

Create:

```text
.env.example
```

without real credentials.

---

# 45. Code Concepts That Must Be Demonstrated

The project should intentionally demonstrate and make it easy to explain:

## React Native

* View
* Text
* Image
* Pressable
* TextInput
* ScrollView
* FlatList
* Modal
* ActivityIndicator
* SafeAreaView
* Conditional rendering
* Props
* Reusable components

## React Hooks

* useState
* useEffect
* useRef where appropriate
* Custom hooks

## JavaScript

Explain:

* map()
* filter()
* find()
* promises
* async/await
* try/catch
* destructuring
* spread operator
* array/object manipulation

Explain why:

```text
FlatList
```

is preferred over:

```text
array.map()
```

for large scrollable lists.

---

# 46. Navigation Concepts

Demonstrate:

* Expo Router
* File-based routing
* Stack navigation
* Tab navigation
* Dynamic routes
* Route parameters
* router.push()
* router.replace()
* router.back()
* Link
* Protected routes

---

# 47. Permission Concepts

Explain and demonstrate:

* Camera permission
* Location permission
* Contacts permission
* Notification permission
* Permission denied state
* Permission retry
* Device settings requirement
* Permission lifecycle

---

# 48. Location Concepts

Demonstrate:

* Get current location
* Last known location
* watchPositionAsync
* Location subscription
* Cleanup/unsubscribe
* Latitude
* Longitude
* Accuracy
* Speed
* Heading
* Reverse geocoding
* Destination selection
* Map markers
* Map camera movement

---

# 49. Backend Concepts

Demonstrate:

```text
Node.js
Express
MongoDB
Mongoose
REST API
JWT
bcrypt
CRUD
Middleware
Validation
Environment variables
Error handling
File uploads
```

---

# 50. Full Frontend → Backend → Database Flow

Every major feature should follow a clear architecture:

```text
React Native UI
      ↓
Service/API Layer
      ↓
Express Route
      ↓
Controller
      ↓
Mongoose Model
      ↓
MongoDB
```

Example:

```text
User presses "Start Journey"
          ↓
journeyService.startJourney()
          ↓
POST /api/journeys/:id/start
          ↓
JWT middleware
          ↓
Journey controller
          ↓
MongoDB
          ↓
Response
          ↓
React Native updates UI
```

---

# 51. Reusable Components

Create reusable components instead of repeating UI.

Examples:

```text
Button
Input
Card
Header
Modal
Loading
ErrorState
EmptyState
JourneyCard
ContactCard
StatusBadge
SafetyStatus
LocationCard
```

Use props properly.

Example:

```tsx
<Button
  title="I'm Safe"
  onPress={handleCheckIn}
/>
```

---

# 52. Reusable Hooks

Create:

```text
useAuth()
useLocation()
useContacts()
useJourney()
```

Each hook should have a clear responsibility.

For example:

```text
useLocation()
```

should manage:

* Permission
* Current location
* Last known location
* Watcher
* Cleanup
* Errors

---

# 53. Code Quality Requirements

Write clean TypeScript.

Avoid:

```text
any
```

unless absolutely necessary.

Use:

* Interfaces/types
* Reusable functions
* Constants
* Meaningful variable names
* Small components
* Proper error handling
* Comments only where useful

Do not put the entire application inside one giant component.

---

# 54. User Flow

The primary user flow should be:

```text
Open Homecoming
       ↓
Login/Register
       ↓
Home Dashboard
       ↓
Start Journey
       ↓
Allow Location
       ↓
Choose Destination
       ↓
Select Trusted Contacts
       ↓
Configure Check-in
       ↓
Start Journey
       ↓
Live Location Tracking
       ↓
Check-in Reminder
       ↓
"I'm Safe"
       ↓
Continue Journey
       ↓
Reach Destination
       ↓
End Journey
       ↓
Trusted Contacts are informed
       ↓
Journey saved to history
```

Secondary flow:

```text
Check-in reminder
       ↓
No response
       ↓
Grace period
       ↓
Check-in missed
       ↓
Escalation state
       ↓
Trusted contacts notified
```

Emergency flow:

```text
Active Journey
       ↓
Emergency
       ↓
I Need Help
       ↓
Show current location
       ↓
Contact trusted person / emergency service
       ↓
Record emergency event
```

---

# 55. Backend Folder Structure

Use:

```text
backend/
│
├── server.js
│
├── config/
│   └── db.js
│
├── models/
│   ├── User.js
│   ├── Journey.js
│   ├── Contact.js
│   ├── LocationHistory.js
│   └── CheckIn.js
│
├── controllers/
│   ├── authController.js
│   ├── journeyController.js
│   ├── contactController.js
│   └── mediaController.js
│
├── routes/
│   ├── authRoutes.js
│   ├── journeyRoutes.js
│   ├── contactRoutes.js
│   └── mediaRoutes.js
│
├── middleware/
│   ├── authMiddleware.js
│   ├── errorMiddleware.js
│   └── uploadMiddleware.js
│
├── services/
│   └── notificationService.js
│
├── uploads/
│
└── .env
```

---

# 56. API Documentation

Create a README documenting every endpoint.

Example:

```text
POST /api/auth/register
POST /api/auth/login

GET /api/journeys
POST /api/journeys
GET /api/journeys/:id
PUT /api/journeys/:id
DELETE /api/journeys/:id

POST /api/journeys/:id/start
POST /api/journeys/:id/check-in
POST /api/journeys/:id/location
POST /api/journeys/:id/emergency
POST /api/journeys/:id/end

GET /api/contacts
POST /api/contacts
GET /api/contacts/:id
PUT /api/contacts/:id
DELETE /api/contacts/:id

POST /api/media/upload
```

Document:

* Request body
* Authentication requirement
* Response
* Possible errors

---

# 57. README

Create a comprehensive README containing:

## Project overview

## Real-world problem

## Solution

## Features

## Tech stack

## Project structure

## Installation

## Environment variables

## MongoDB setup

## Expo setup

## Running the backend

## Running the mobile app

## API documentation

## Authentication flow

## Location architecture

## Safety check-in architecture

## Permissions

## Important limitations

## Future improvements

---

# 58. Important Safety & Reliability Requirements

Do not falsely claim that Homecoming can guarantee a user's safety.

The UI should communicate:

```text
Homecoming helps trusted contacts stay informed.
It is not a replacement for emergency services.
```

Location and background execution can behave differently depending on Android/iOS versions, device settings, battery optimization, network availability, and app state.

Design the application so that failure of:

* GPS
* internet
* notifications
* permissions
* backend
* background execution

does not cause the application to crash.

Display meaningful fallback states.

---

# 59. Development Approach

Build the application incrementally.

### Phase 1

Project setup + navigation + theme.

### Phase 2

Authentication + backend + MongoDB.

### Phase 3

Home dashboard + journey CRUD.

### Phase 4

Location + map.

### Phase 5

Trusted contacts.

### Phase 6

Safety check-in system.

### Phase 7

Notifications.

### Phase 8

Camera + media.

### Phase 9

Video recording.

### Phase 10

Polish + validation + error handling + README.

---

# 60. Final Requirement

Do not create a fake demo with static data.

The application should have a functional architecture where:

```text
React Native
      ↕
REST API
      ↕
Express
      ↕
MongoDB
```

actually works.

Use realistic sample data only for initial empty-state/demo purposes.

Every feature should have:

```text
Loading state
Success state
Error state
Empty state
Permission handling where applicable
```

The final result should look like a **real-world portfolio project**, not a tutorial toy application.

Most importantly, keep the **Homecoming safety journey** as the central product experience. Other features such as camera, video, contacts, media upload, CRUD, authentication, maps, and notifications should support that product instead of feeling like unrelated checklist items.
