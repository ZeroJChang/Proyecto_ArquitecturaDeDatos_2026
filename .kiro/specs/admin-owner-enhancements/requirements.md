# Requirements Document

## Introduction

This document specifies the requirements for two new capabilities on the ACME EV Data Platform: an Admin Management Dashboard providing full read views of master data (vehicles, users, branches, status events) with advanced filtering and pagination, and an Owner Vehicle Claim flow allowing OWNER-role users to register vehicles to their account via VIN input. Both features build on the existing NestJS 11 backend (CQRS, TypeORM, Mongoose) and React 19 + MUI v9 frontend without architectural changes.

## Glossary

- **Platform**: The ACME EV Data Platform web application (backend + frontend)
- **Admin_Dashboard**: The Quick Access Dashboard page visible to ADMIN users with navigation cards
- **Vehicles_Admin_Page**: The administrative data grid page displaying all vehicles in the system
- **Users_Admin_Page**: The administrative data grid page displaying all users in the system
- **Branches_Admin_Page**: The administrative data grid page displaying all branches in the system
- **Status_Events_Page**: The administrative data grid page for exploring operational status events
- **Register_Vehicle_Page**: The page where OWNER users can claim a vehicle by VIN
- **Claim_Endpoint**: The POST /acme-ev/vehicles/claim backend endpoint
- **VIN**: Vehicle Identification Number, a 17-character alphanumeric string uniquely identifying a vehicle
- **Owner**: A user with role OWNER in the JWT payload
- **Admin**: A user with role ADMIN in the JWT payload
- **DataGrid**: The MUI X DataGrid component used for paginated, sortable, filterable tables
- **Vehicle_Owner_Record**: A row in the vehicle_owners table associating a user to a vehicle
- **Demo_Vehicle**: A vehicle auto-created with randomized template data when a claimed VIN does not exist

## Requirements

### Requirement 1: Quick Access Dashboard

**User Story:** As an Admin, I want a dashboard with quick-access cards for Vehicles, Users, Branches, and Status Events, so that I can navigate to each administration page with a single click.

#### Acceptance Criteria

1. WHEN an Admin navigates to the Admin Dashboard, THE Admin_Dashboard SHALL display four navigation cards labeled "Vehicles", "Users", "Branches", and "Status Events", each displaying an icon, the card title, and a numeric count value
2. WHEN the Admin Dashboard loads, THE Admin_Dashboard SHALL request data from GET /acme-ev/dashboard/admin and display the totalVehicles count on the "Vehicles" card, the totalUsers count on the "Users" card, the totalBranches count on the "Branches" card, and the vehiclesWithFaults count on the "Status Events" card
3. WHEN an Admin clicks the "Vehicles" card, THE Admin_Dashboard SHALL navigate to the Vehicles_Admin_Page
4. WHEN an Admin clicks the "Users" card, THE Admin_Dashboard SHALL navigate to the Users_Admin_Page
5. WHEN an Admin clicks the "Branches" card, THE Admin_Dashboard SHALL navigate to the Branches_Admin_Page
6. WHEN an Admin clicks the "Status Events" card, THE Admin_Dashboard SHALL navigate to the Status_Events_Page
7. WHILE the GET /acme-ev/dashboard/admin request is in progress, THE Admin_Dashboard SHALL display a loading indicator in place of the cards
8. IF the GET /acme-ev/dashboard/admin request fails, THEN THE Admin_Dashboard SHALL display an error alert indicating the dashboard data could not be loaded and the navigation cards SHALL still be displayed without count values

### Requirement 2: Vehicles Administration Page

**User Story:** As an Admin, I want a paginated table of all vehicles with search and sorting, so that I can inspect and locate vehicle records efficiently.

#### Acceptance Criteria

1. WHEN an Admin navigates to the Vehicles_Admin_Page, THE Vehicles_Admin_Page SHALL request data from GET /acme-ev/vehicles with pagination parameters (page defaulting to 1, limit defaulting to 25, maximum limit of 100)
2. THE Vehicles_Admin_Page SHALL display a DataGrid with columns: VIN, Vehicle ID, Model, Year, Branch Name, and Creation Date
3. WHEN an Admin types in the VIN search field and the input contains at least 1 character, THE Vehicles_Admin_Page SHALL filter the results by the entered VIN substring (case-insensitive match)
4. WHEN an Admin clicks a sortable column header, THE Vehicles_Admin_Page SHALL sort the data by that column toggling between ascending and descending order, and SHALL send the sortBy and sortOrder (ASC or DESC) parameters to the API
5. WHEN an Admin changes the page or selects a different page size from the options (10, 25, 50), THE Vehicles_Admin_Page SHALL fetch and display the corresponding page of results using server-side pagination
6. WHILE the API request is in progress, THE Vehicles_Admin_Page SHALL display a loading indicator within the DataGrid
7. WHILE no vehicles match the applied filters, THE Vehicles_Admin_Page SHALL display an empty state message indicating no results were found
8. IF the API request to GET /acme-ev/vehicles fails, THEN THE Vehicles_Admin_Page SHALL display an error alert indicating the data could not be loaded and SHALL allow the Admin to retry the request

### Requirement 3: Users Administration Page

**User Story:** As an Admin, I want a paginated table of all users with search, sorting, and role filtering, so that I can manage user visibility efficiently.

#### Acceptance Criteria

1. WHEN an Admin navigates to the Users_Admin_Page, THE Users_Admin_Page SHALL request data from GET /acme-ev/users with pagination parameters (page defaulting to 1, limit defaulting to 25) and display results in a MUI DataGrid with columns: Name, Email, Role, Branch, and Creation Date
2. WHEN an Admin types in the search field and at least 300 milliseconds have elapsed since the last keystroke, THE Users_Admin_Page SHALL send the search value as a query parameter to GET /acme-ev/users and display only users whose name or email contains the search substring (case-insensitive)
3. WHEN an Admin selects a role from the role filter dropdown, THE Users_Admin_Page SHALL filter results to show only users with the selected role, where the available role options are ADMIN, BRANCH_USER, and OWNER
4. WHEN an Admin clicks a sortable column header, THE Users_Admin_Page SHALL sort the data by that column, toggling between ascending and descending order, sending sortBy and sortOrder (ASC or DESC) as query parameters to the API
5. WHEN an Admin changes the page or page size using the DataGrid pagination controls, THE Users_Admin_Page SHALL fetch and display the corresponding page of results using the selected page size (available options: 25, 50, or 100 rows per page)
6. IF the GET /acme-ev/users request fails, THEN THE Users_Admin_Page SHALL display an error alert indicating the data could not be loaded and retain any previously displayed data

### Requirement 4: Branches Administration Page

**User Story:** As an Admin, I want a paginated table of all branches with vehicle and owner counts, so that I can oversee branch-level data at a glance.

#### Acceptance Criteria

1. WHEN an Admin navigates to the Branches_Admin_Page, THE Branches_Admin_Page SHALL request data from GET /acme-ev/branches with pagination parameters (page defaulting to 1, limit defaulting to 25) and display a loading indicator until the response is received
2. THE Branches_Admin_Page SHALL display a MUI DataGrid with columns: Name, Country, Region, Status (isActive displayed as a visual indicator), Vehicle Count, and Owner Count, using server-side pagination mode
3. WHEN an Admin types in the search field, THE Branches_Admin_Page SHALL filter results by branch name substring match (case-insensitive) by sending the search parameter to the API and resetting pagination to page 1
4. WHEN an Admin clicks a sortable column header, THE Branches_Admin_Page SHALL sort the data by that column by sending sortBy and sortOrder (ASC or DESC, toggling on repeated clicks) parameters to the API
5. WHEN an Admin changes the page or page size using the DataGrid pagination controls, THE Branches_Admin_Page SHALL fetch and display the corresponding page of results using the selected page size (available options: 10, 25, 50)
6. IF the API request to GET /acme-ev/branches fails, THEN THE Branches_Admin_Page SHALL display an error alert indicating the failure and preserve any previously loaded data in the DataGrid
7. THE Branches_Admin_Page SHALL display the total number of branches returned in the response metadata (total count) within the DataGrid pagination footer

### Requirement 5: Status Events Explorer Page

**User Story:** As an Admin, I want an advanced explorer for operational status events with date range filtering and VIN search, so that I can investigate vehicle telemetry data over time.

#### Acceptance Criteria

1. WHEN an Admin navigates to the Status_Events_Page, THE Status_Events_Page SHALL display a paginated DataGrid with columns: VIN, DateTime, BatteryLevel, EngineStatus, FaultCodes, and Odometer
2. WHEN an Admin enters a VIN in the quick search field, THE Status_Events_Page SHALL filter events to show only records matching that VIN by sending the vin parameter to GET /acme-ev/status/events
3. WHEN an Admin selects a start date and end date in the date range selector, THE Status_Events_Page SHALL filter events to the specified date range by sending startDate and endDate as ISO 8601 strings to GET /acme-ev/status/events
4. WHEN an Admin clicks the "Clear Filters" button, THE Status_Events_Page SHALL reset the VIN field and date range fields to their default empty state and reload unfiltered data from the first page
5. WHEN an Admin changes the page or page size, THE Status_Events_Page SHALL fetch and display the corresponding page of results using GET /acme-ev/status/events with parameters (vin, startDate, endDate, page, limit) where limit max is 50
6. WHILE the API request is in progress, THE Status_Events_Page SHALL display a loading indicator within the DataGrid
7. IF the API request to GET /acme-ev/status/events fails, THEN THE Status_Events_Page SHALL display an error alert and preserve any previously loaded data

### Requirement 6: Admin Pages Access Control

**User Story:** As a platform administrator, I want only ADMIN-role users to access the administration pages, so that sensitive master data is protected from unauthorized access.

#### Acceptance Criteria

1. WHILE a user is not authenticated, WHEN the user attempts to access any administration page (AdminDashboardPage, Vehicles_Admin_Page, Users_Admin_Page, Branches_Admin_Page, or Status_Events_Page), THE Platform SHALL redirect the user to the /login route without rendering the target page content
2. WHILE a user has the BRANCH_USER or OWNER role, WHEN the user attempts to navigate to any administration page, THE Platform SHALL redirect the user to their role-specific dashboard (/dashboard/branch for BRANCH_USER, /dashboard/owner for OWNER) without rendering the administration page content
3. WHILE a user has the ADMIN role, THE Platform SHALL render the requested administration page and display navigation links to all administration pages in the application header
4. IF a user with a role other than ADMIN calls an ADMIN-only backend endpoint (/acme-ev/users or /acme-ev/branches), THEN THE Platform SHALL respond with an HTTP 403 status and not return the requested data
5. IF a user without a valid JWT token calls an ADMIN-only backend endpoint, THEN THE Platform SHALL respond with an HTTP 401 status and not return the requested data

### Requirement 7: Owner Vehicle Claim Endpoint

**User Story:** As an Owner, I want to claim a vehicle by entering its VIN, so that the vehicle becomes associated with my account.

#### Acceptance Criteria

1. WHEN an Owner submits a POST request to /acme-ev/vehicles/claim with a request body containing a "vin" field, THE Claim_Endpoint SHALL check if a Vehicle_Owner_Record already exists for the given VIN in the vehicle_owners table
2. IF the VIN is already associated with an owner in the vehicle_owners table, THEN THE Claim_Endpoint SHALL return HTTP 400 with a response body containing an error message indicating the vehicle is already assigned to an owner
3. WHEN the VIN exists in the vehicles table and has no associated Vehicle_Owner_Record, THE Claim_Endpoint SHALL create a Vehicle_Owner_Record with the vehicle's id and the authenticated Owner's user id (from JWT sub claim), and return HTTP 200 with a response body containing a success message and the claimed vehicle's VIN
4. WHEN the VIN does not exist in the vehicles table and has no associated Vehicle_Owner_Record, THE Claim_Endpoint SHALL create a new Vehicle record with the submitted VIN, a randomly selected model from the predefined EV model list, the corresponding brand, the current year, active status, and a default branch, then create a Vehicle_Owner_Record associating the new vehicle to the authenticated Owner, and return HTTP 200 with a response body containing a success message and the claimed vehicle's VIN
5. THE Claim_Endpoint SHALL enforce a uniqueness constraint ensuring one VIN maps to at most one Vehicle_Owner_Record at any time
6. THE Claim_Endpoint SHALL only be accessible to authenticated users with the OWNER role; IF a user without the OWNER role attempts access, THEN THE Claim_Endpoint SHALL return HTTP 403
7. IF the "vin" field in the request body is missing, empty, or not a valid 17-character string composed of uppercase letters (A-Z) and digits (0-9), THEN THE Claim_Endpoint SHALL return HTTP 400 with a response body containing a validation error message indicating the VIN format is invalid
8. IF the Claim_Endpoint fails to persist the Vehicle_Owner_Record due to a database error, THEN THE Claim_Endpoint SHALL return HTTP 500 and SHALL NOT leave a partially created Vehicle record without its corresponding Vehicle_Owner_Record

### Requirement 8: Demo Vehicle Data Generation

**User Story:** As an Owner, I want the system to generate a plausible demo vehicle when I claim a non-existent VIN, so that I can immediately start interacting with the platform.

#### Acceptance Criteria

1. WHEN the Claim_Endpoint creates a Demo_Vehicle, THE Platform SHALL assign the entered VIN to the new vehicle record
2. WHEN the Claim_Endpoint creates a Demo_Vehicle, THE Platform SHALL select a model randomly from a predefined list containing at least 5 distinct EV model names (e.g., "ACME Volt", "ACME Spark", "ACME Thunder", "ACME Wave", "ACME Pulse")
3. WHEN the Claim_Endpoint creates a Demo_Vehicle, THE Platform SHALL assign the brand that corresponds to the randomly selected model from the predefined model-to-brand mapping
4. WHEN the Claim_Endpoint creates a Demo_Vehicle, THE Platform SHALL set the vehicle year to the current calendar year
5. WHEN the Claim_Endpoint creates a Demo_Vehicle, THE Platform SHALL set the vehicle status to active
6. WHEN the Claim_Endpoint creates a Demo_Vehicle, THE Platform SHALL assign the vehicle to the branch with the lowest id in the branches table
7. WHEN the Claim_Endpoint creates a Demo_Vehicle, THE Platform SHALL record the current timestamp as the creation date

### Requirement 9: Register Vehicle Page (Frontend)

**User Story:** As an Owner, I want a dedicated page to register a vehicle by VIN, so that I can claim vehicles through a simple form interface.

#### Acceptance Criteria

1. WHEN an Owner navigates to the Register Vehicle page, THE Register_Vehicle_Page SHALL display a VIN text input field with a maximum input length of 17 characters and a "Claim" button
2. WHILE the VIN input field contains fewer than 17 alphanumeric characters, THE Register_Vehicle_Page SHALL disable the "Claim" button
3. WHILE the Register_Vehicle_Page is in a loading state, THE Register_Vehicle_Page SHALL disable both the VIN input field and the "Claim" button to prevent duplicate submissions
4. WHEN an Owner clicks the "Claim" button, THE Register_Vehicle_Page SHALL send a POST request to /acme-ev/vehicles/claim with the entered VIN and display a loading state
5. WHEN the Claim_Endpoint returns HTTP 200, THE Register_Vehicle_Page SHALL display a success alert indicating the vehicle was associated successfully
6. WHEN the Claim_Endpoint returns HTTP 400, THE Register_Vehicle_Page SHALL display an error alert showing the error message returned by the server
7. IF a network error or unexpected server error (HTTP 5xx or no response) occurs, THEN THE Register_Vehicle_Page SHALL display a generic error alert
8. WHEN an Owner successfully claims a vehicle, THE Register_Vehicle_Page SHALL clear the VIN input field after displaying the success message
9. WHILE a user has a role other than OWNER, THE Register_Vehicle_Page SHALL not be accessible and the ProtectedRoute SHALL redirect the user to their default dashboard

### Requirement 10: Owner Navigation to Register Vehicle

**User Story:** As an Owner, I want a link or button on my dashboard to navigate to the Register Vehicle page, so that I can easily find the vehicle claim feature.

#### Acceptance Criteria

1. WHEN an Owner views the Owner Dashboard, THE Platform SHALL display a navigation element labeled "Register Vehicle" within the dashboard content area that, when clicked, navigates to the /register-vehicle route
2. WHILE a user has the OWNER role, THE Platform SHALL render the "Register Vehicle" navigation element on the Owner Dashboard page as a MUI Card or Button consistent with the existing dashboard layout
3. WHILE a user has a role other than OWNER, THE Platform SHALL not display the "Register Vehicle" navigation element on any page and SHALL not include a "Register Vehicle" entry in the Header navigation menu
4. IF a non-OWNER user navigates directly to the /register-vehicle route, THEN THE Platform SHALL redirect the user to their role-appropriate dashboard
