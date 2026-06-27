# Implementation Plan: Admin & Owner Enhancements

## Overview

This plan implements two major features: (1) Admin Management Dashboard with navigation cards and four dedicated admin pages (Vehicles, Users, Branches, Status Events) using MUI DataGrid with server-side pagination, search, sorting, and filtering; (2) Owner Vehicle Claim flow with a POST endpoint using CommandBus, demo vehicle generation, and a RegisterVehiclePage frontend. Implementation extends existing controllers, modules, and UI patterns — no architectural changes required.

## Tasks

- [x] 1. Backend: Extend DTOs and shared infrastructure for pagination/filter/sort
  - [x] 1.1 Create extended request DTOs for Vehicles, Users, Branches, and Status Events admin endpoints
    - Extend `GetVehiclesRequestDto` to include `search`, `sortBy`, `sortOrder` fields (inheriting from `PaginationParamsDto`)
    - Create `GetUsersRequestDto` extending `PaginationParamsDto` with `search`, `role`, `sortBy`, `sortOrder`
    - Create `GetBranchesRequestDto` extending `PaginationParamsDto` with `search`, `sortBy`, `sortOrder`
    - Create `GetStatusEventsAdminRequestDto` extending `PaginationParamsDto` with optional `vin`, `startDate`, `endDate`
    - Use `class-validator` decorators (`@IsOptional`, `@IsString`, `@IsIn`, `@IsISO8601`) for validation
    - _Requirements: 2.1, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 4.1, 4.3, 4.4, 5.1, 5.2, 5.3_

  - [x] 1.2 Create response DTOs for admin endpoints
    - Create `GetBranchAdminResponseDto` with `id`, `name`, `country`, `region`, `isActive`, `vehicleCount`, `ownerCount`, `createdAt`
    - Create `GetUserAdminResponseDto` (or extend existing) with `id`, `name`, `email`, `role`, `branchName`, `createdAt`
    - Ensure `PaginationResponse<T>` generic is used for all paginated responses
    - _Requirements: 2.2, 3.1, 4.2_

- [x] 2. Backend: Enhance query handlers for admin pages (server-side pagination, search, sort)
  - [x] 2.1 Update GetVehiclesHandler to support search and sort
    - Accept `search` param to filter by VIN substring (case-insensitive ILIKE)
    - Accept `sortBy` and `sortOrder` params for dynamic column ordering
    - Return `PaginationResponse<GetVehicleResponseDto>` with `data`, `total`, `page`, `limit`
    - _Requirements: 2.1, 2.3, 2.4, 2.5_

  - [x] 2.2 Update GetUsersHandler to support pagination, search, role filter, and sort
    - Modify `GetUsersQuery` to accept `GetUsersRequestDto`
    - Implement search on `name` and `email` fields (ILIKE)
    - Implement role filter (`WHERE role = :role` when provided)
    - Implement dynamic sort with `sortBy`/`sortOrder`
    - Return `PaginationResponse<GetUserAdminResponseDto>`
    - Update `UsersController.getUsers()` to accept `@Query() params: GetUsersRequestDto`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 2.3 Update GetBranchesHandler to support pagination, search, sort, and counts
    - Modify `GetBranchesQuery` to accept `GetBranchesRequestDto`
    - Implement search on `name` field (ILIKE)
    - Add LEFT JOIN subqueries to count vehicles and owners per branch
    - Implement dynamic sort with `sortBy`/`sortOrder`
    - Return `PaginationResponse<GetBranchAdminResponseDto>`
    - Update `BranchesController.getBranches()` to accept `@Query() params: GetBranchesRequestDto`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.7_

  - [x] 2.4 Update GetStatusEventsHandler to support optional vin and date range params
    - Make `vin` optional in the query (currently required for BRANCH_USER scope)
    - Add optional `startDate`/`endDate` filtering on `event_timestamp` in MongoDB
    - When no `vin` provided and user is ADMIN, return all events paginated
    - Return `PaginationResponse<StatusEventDto>`
    - _Requirements: 5.1, 5.2, 5.3, 5.5_

- [x] 3. Backend: Implement ClaimVehicle command (CommandBus)
  - [x] 3.1 Create ClaimVehicleCommand, ClaimVehicleHandler, and DemoVehicleService
    - Create `ClaimVehicleCommand` class with `vin` and `userId` properties
    - Create `ClaimVehicleHandler` implementing `ICommandHandler<ClaimVehicleCommand>`
    - Inject `DataSource` for transaction management
    - Inside transaction: check existing ownership → find or create vehicle → create VehicleOwner
    - If VIN already owned → throw `BadRequestException`
    - If vehicle doesn't exist → use `DemoVehicleService` to generate one
    - Create `DemoVehicleService` with `EV_MODELS` array (5+ models), random selection, current year, lowest-branch-id assignment
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.8, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

  - [x] 3.2 Create ClaimVehicleRequestDto, ClaimVehicleResponseDto, and add POST endpoint to VehiclesController
    - Create `ClaimVehicleRequestDto` with `@IsString()`, `@Length(17, 17)`, `@Matches(/^[A-Z0-9]{17}$/)` on `vin`
    - Create `ClaimVehicleResponseDto` with `message` and `vin` fields
    - Add `@Post('claim')` endpoint to `VehiclesController` with `@Roles(Role.OWNER)`, `@Body() dto`, `@CurrentUser() user`
    - Dispatch `ClaimVehicleCommand` via `CommandBus`
    - _Requirements: 7.1, 7.6, 7.7_

  - [x] 3.3 Register CommandBus and new providers in VehiclesModule
    - Import `CqrsModule` (already present) and register `ClaimVehicleHandler` in providers
    - Register `DemoVehicleService` in providers
    - Ensure `Branch` entity repository is available (import `TypeOrmModule.forFeature([Branch])` or inject via `DataSource`)
    - _Requirements: 7.3, 7.4_

  - [ ]* 3.4 Write property tests for ClaimVehicle business logic
    - **Property 1: Already-owned VIN rejection**
    - **Property 2: Successful claim for existing unowned vehicle**
    - **Property 3: Demo vehicle creation for non-existing VIN**
    - **Property 4: VIN-to-owner uniqueness invariant**
    - **Property 5: VIN format validation**
    - **Property 7: Demo vehicle data invariants**
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 7.7, 8.1, 8.2, 8.3, 8.6**

  - [ ]* 3.5 Write unit tests for ClaimVehicleHandler
    - Test happy path: existing vehicle with no owner → creates VehicleOwner
    - Test demo vehicle creation: non-existing VIN → creates Vehicle + VehicleOwner
    - Test rejection: VIN already owned → throws BadRequestException
    - Test transaction rollback: simulate DB error → no orphaned records
    - _Requirements: 7.2, 7.3, 7.4, 7.8_

- [ ] 4. Checkpoint - Backend endpoints complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Frontend: Add admin page routes and URL constants
  - [x] 5.1 Update routes and URL constants for new admin pages and RegisterVehiclePage
    - Add URL constants: `VEHICLES_CLAIM: '/acme-ev/vehicles/claim'`
    - Add routes in `Routes.tsx`: `/admin/vehicles`, `/admin/users`, `/admin/branches`, `/admin/status-events` (all with `allowedRoles={['ADMIN']}`)
    - Add route `/register-vehicle` with `allowedRoles={['OWNER']}`
    - Import new page components (lazy or direct)
    - _Requirements: 6.1, 6.2, 6.3, 9.9, 10.4_

- [x] 6. Frontend: Refactor AdminDashboardPage with quick-access navigation cards
  - [x] 6.1 Refactor AdminDashboardPage to show navigation cards
    - Replace current metric-only layout with clickable navigation cards (Vehicles, Users, Branches, Status Events)
    - Each card shows an icon, title, and count from `GET /acme-ev/dashboard/admin`
    - Cards navigate to their respective admin pages on click
    - Show loading indicator while fetching, error alert on failure (cards still shown without counts)
    - Keep existing faults table below cards
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_

- [x] 7. Frontend: Create VehiclesAdminPage
  - [x] 7.1 Implement VehiclesAdminPage with DataGrid, search, and sort
    - Create `VehiclesAdminPage.tsx` with MUI DataGrid (server-side pagination mode)
    - Add VIN search field (debounced, min 1 char triggers filter)
    - Columns: VIN, Vehicle ID, Model, Year, Branch Name, Created Date (all sortable)
    - Page size options: 10, 25, 50
    - Use `useRequest` hook for data fetching with query params (`page`, `limit`, `search`, `sortBy`, `sortOrder`)
    - Show loading state, empty state, and error alert with retry
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

- [x] 8. Frontend: Create UsersAdminPage
  - [x] 8.1 Implement UsersAdminPage with DataGrid, search, role filter, and sort
    - Create `UsersAdminPage.tsx` with MUI DataGrid (server-side pagination mode)
    - Add text search field (debounced 300ms) for name/email
    - Add role dropdown filter (ADMIN, BRANCH_USER, OWNER options)
    - Columns: Name, Email, Role, Branch, Created Date (all sortable)
    - Page size options: 25, 50, 100
    - Show error alert on failure, preserve previous data
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 9. Frontend: Create BranchesAdminPage
  - [x] 9.1 Implement BranchesAdminPage with DataGrid, search, and sort
    - Create `BranchesAdminPage.tsx` with MUI DataGrid (server-side pagination mode)
    - Add name search field
    - Columns: Name, Country, Region, Status (isActive visual indicator), Vehicle Count, Owner Count (all sortable)
    - Page size options: 10, 25, 50
    - Display total count in pagination footer
    - Show error alert on failure, preserve previous data
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

- [ ] 10. Frontend: Create StatusEventsAdminPage
  - [ ] 10.1 Implement StatusEventsAdminPage with DataGrid, VIN search, and date range filter
    - Create `StatusEventsAdminPage.tsx` with MUI DataGrid (server-side pagination mode)
    - Add VIN quick search field
    - Add date range picker (start/end date inputs)
    - Add "Clear Filters" button that resets all fields and reloads page 1
    - Columns: VIN, DateTime, BatteryLevel, EngineStatus, FaultCodes, Odometer
    - Page size max: 50
    - Show loading indicator, error alert, preserve previous data on failure
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

- [x] 11. Frontend: Create RegisterVehiclePage and Owner Dashboard navigation
  - [x] 11.1 Create RegisterVehiclePage with VIN input and claim button
    - Create `RegisterVehiclePage.tsx` with VIN text input (maxLength 17, uppercase only via input transform)
    - Disable "Claim" button until exactly 17 valid alphanumeric characters entered
    - On submit: POST to `/acme-ev/vehicles/claim` with `{ vin }`
    - Loading state disables both input and button
    - Show success alert on HTTP 200, error alert on HTTP 400 (server message), generic error on 5xx/network
    - Clear input on success
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8_

  - [x] 11.2 Enhance OwnerDashboardPage with "Register Vehicle" navigation card
    - Add a MUI Card or Button labeled "Register Vehicle" to the OwnerDashboardPage
    - On click, navigate to `/register-vehicle`
    - Style consistent with existing dashboard layout
    - _Requirements: 10.1, 10.2, 10.3_

- [ ] 12. Checkpoint - All pages implemented
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 13. Integration wiring and final validation
  - [ ] 13.1 Wire admin page navigation links in Header component
    - Verify Header `navItems` includes entries for admin sub-pages if needed (current design uses dashboard card navigation, no header changes required per design)
    - Ensure ProtectedRoute properly redirects unauthorized roles for all new routes
    - Verify `RoleRedirect` still works correctly with new route additions
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 10.3, 10.4_

  - [ ]* 13.2 Write property tests for role-based access control
    - **Property 8: Claim endpoint role restriction**
    - **Property 9: Admin endpoint role restriction**
    - **Validates: Requirements 6.4, 7.6**

  - [ ]* 13.3 Write property test for VIN input validation (frontend logic)
    - **Property 10: Claim button disabled for invalid VIN input**
    - **Validates: Requirements 9.2**

- [ ] 14. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The `POST /vehicles/claim` route MUST be placed before `GET /vehicles/:vin` in the controller to avoid route collision
- All admin pages use server-side pagination — DataGrid `paginationMode="server"` with `rowCount` from API
- The `useRequest` hook handles 401 auto-redirect; no additional auth logic needed in pages
- `fast-check` library should be installed for property-based tests: `npm install --save-dev fast-check`

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1", "2.2", "2.3", "2.4", "3.1", "3.2"] },
    { "id": 2, "tasks": ["3.3", "5.1"] },
    { "id": 3, "tasks": ["3.4", "3.5", "6.1"] },
    { "id": 4, "tasks": ["7.1", "8.1", "9.1", "10.1", "11.1", "11.2"] },
    { "id": 5, "tasks": ["13.1"] },
    { "id": 6, "tasks": ["13.2", "13.3"] }
  ]
}
```
