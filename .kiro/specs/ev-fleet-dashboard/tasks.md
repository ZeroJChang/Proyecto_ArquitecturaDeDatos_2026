# Implementation Plan: EV Fleet Dashboard

## Overview

Full-stack implementation of the EV Fleet Dashboard: a NestJS 11 backend (CQRS, TypeORM, Mongoose) with JWT auth and role-based access, plus a React 19 SPA (MUI v9) consuming the API. The backend is read-only regarding telemetry data—it queries PostgreSQL (GPS events) and MongoDB Atlas (status events) populated by existing Spark pipelines.

## Tasks

- [x] 1. Clean up boilerplate and set up core infrastructure
  - [x] 1.1 Remove photos module and infrastructure boilerplate
    - Delete `backend/src/photos/` directory and all its contents
    - Delete `backend/src/infrastructure/` directory (http-adapters, dtos for albums/photos/users)
    - Remove PhotosModule import from `app.module.ts`
    - Remove unused `app.controller.spec.ts` if it references photos
    - _Requirements: N/A (housekeeping)_

  - [x] 1.2 Install backend dependencies and configure database connections
    - Install: `@nestjs/typeorm typeorm pg @nestjs/mongoose mongoose @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt @nestjs/cqrs @nestjs/swagger json2csv class-validator class-transformer`
    - Install dev: `@types/bcrypt @types/passport-jwt @types/json2csv`
    - Update `config.schema.ts` to add Joi validation for `POSTGRES_URI`, `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`
    - Update `configuration.ts` and `config.interface.ts` to include database and JWT config sections
    - Configure TypeORM connection in `app.module.ts` using `POSTGRES_URI` env var
    - Configure Mongoose connection in `app.module.ts` using `MONGO_URI` env var
    - Set global prefix to `acme-ev` in `main.ts`
    - Add global `ValidationPipe` with `whitelist: true` and `transform: true` in `main.ts`
    - Configure Swagger at `/docs` in `main.ts`
    - _Requirements: 10.1, 10.2, 12.1_

  - [x] 1.3 Create shared common utilities (guards, decorators, constants)
    - Create `common/constants/roles.constant.ts` with `ADMIN`, `BRANCH_USER`, `OWNER` enum
    - Create `common/decorators/roles.decorator.ts` using `@SetMetadata`
    - Create `common/decorators/current-user.decorator.ts` using `createParamDecorator`
    - Create `common/interfaces/jwt-payload.interface.ts` with `sub`, `email`, `role`, `branchId`
    - Create `common/guards/jwt-auth.guard.ts` extending `AuthGuard('jwt')`
    - Create `common/guards/roles.guard.ts` implementing `CanActivate` with reflector
    - Update `common/dtos/pagination.params.dto.ts` with class-validator decorators
    - Update `common/dtos/pagination-response.dto.ts` with generic meta shape
    - _Requirements: 1.4, 2.1, 2.4_

- [x] 2. Implement authentication module
  - [x] 2.1 Create User entity and UsersModule
    - Create `users/entities/user.entity.ts` with TypeORM decorators matching the design schema
    - Create `users/users.module.ts` importing TypeOrmModule.forFeature([User]) and exporting the repository
    - _Requirements: 1.1_

  - [x] 2.2 Implement AuthModule with JWT strategy and login handler
    - Create `auth/auth.module.ts` registering JwtModule with secret and expiry from config
    - Create `auth/strategies/jwt.strategy.ts` extending PassportStrategy with payload extraction
    - Create `auth/dtos/login-request.dto.ts` with email (@IsEmail) and password (@IsNotEmpty) validation
    - Create `auth/dtos/login-response.dto.ts` with accessToken and user shape
    - Create `auth/queries/login.query.ts` carrying email and password
    - Create `auth/queries/handlers/login.handler.ts`: find user by email, compare bcrypt hash, sign JWT with claims (sub, email, role, branchId), return token + user DTO
    - Throw `UnauthorizedException('Credenciales inválidas')` on failure
    - Create `auth/controllers/auth.controller.ts` with POST `/auth/login` endpoint
    - _Requirements: 1.1, 1.2, 1.3_

  - [ ]* 2.3 Write property tests for authentication (Properties 1 & 2)
    - **Property 1: Login produces JWT with correct claims**
    - **Property 2: Invalid credentials always rejected**
    - **Validates: Requirements 1.1, 1.2**

  - [ ]* 2.4 Write unit tests for guards and JWT strategy
    - Test JwtAuthGuard rejects missing/invalid/expired tokens
    - Test RolesGuard allows matching roles and denies non-matching roles
    - **Property 5: Auth guard rejects invalid tokens**
    - **Validates: Requirements 1.4, 1.5, 2.4**

- [~] 3. Checkpoint - Ensure auth module compiles and tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement core domain modules (Branches, Vehicles)
  - [x] 4.1 Create Branch entity and BranchesModule
    - Create `branches/entities/branch.entity.ts` with TypeORM decorators
    - Create `branches/dtos/get-branch-response.dto.ts`
    - Create `branches/mappers/branch.mapper.ts` (static, entity → DTO)
    - Create `branches/queries/get-branches.query.ts`
    - Create `branches/queries/handlers/get-branches.handler.ts` returning all active branches
    - Create `branches/controllers/branches.controller.ts` with GET `/branches` (ADMIN only)
    - Create `branches/branches.module.ts`
    - _Requirements: 3.1, 10.3_

  - [x] 4.2 Create Vehicle and VehicleOwner entities and VehiclesModule
    - Create `vehicles/entities/vehicle.entity.ts` with branch relation
    - Create `vehicles/entities/vehicle-owner.entity.ts` with user and vehicle relations
    - Create `vehicles/dtos/get-vehicle-response.dto.ts` and `get-vehicles-request.dto.ts`
    - Create `vehicles/mappers/vehicle.mapper.ts`
    - Create `vehicles/queries/get-vehicles.query.ts` (ADMIN sees all, BRANCH_USER scoped by branchId)
    - Create `vehicles/queries/get-vehicle-by-vin.query.ts` with branch scoping for BRANCH_USER
    - Create `vehicles/queries/get-owner-vehicles.query.ts` joining vehicle_owners table
    - Create `vehicles/queries/handlers/` with handler for each query
    - Create `vehicles/controllers/vehicles.controller.ts` with GET `/vehicles`, GET `/vehicles/owner`, GET `/vehicles/:vin`
    - Create `vehicles/vehicles.module.ts`
    - _Requirements: 2.2, 2.3, 4.1, 4.2, 9.1, 9.3_

  - [ ]* 4.3 Write property tests for branch scoping and ownership (Properties 6 & 7)
    - **Property 6: Branch scoping filters to user's branch**
    - **Property 7: Ownership scoping restricts to owned vehicles**
    - **Validates: Requirements 2.2, 2.3, 2.5, 2.6**

- [x] 5. Implement GPS module
  - [x] 5.1 Create GpsEvent entity and GPS query handlers
    - Create `gps/entities/gps-event.entity.ts` with TypeORM decorators
    - Create `gps/dtos/get-gps-events-request.dto.ts` with VIN (@Length(17,17), @IsAlphanumeric), startDate (@IsISO8601), endDate (@IsISO8601), page, limit (max 100)
    - Create `gps/dtos/get-gps-events-response.dto.ts`
    - Create `gps/dtos/download-csv-request.dto.ts` (same filters, no pagination)
    - Create `gps/mappers/gps-event.mapper.ts`
    - Create `gps/queries/get-gps-events.query.ts`
    - Create `gps/queries/handlers/get-gps-events.handler.ts`: validate ownership (OWNER), query by VIN + date range with pagination, validate start <= end
    - Create `gps/queries/download-gps-csv.query.ts`
    - Create `gps/queries/handlers/download-gps-csv.handler.ts`: validate ownership, query all matching events, stream CSV with header "VIN,datetime,latitude,longitude", set Content-Disposition filename as `{VIN}_{startDate}_{endDate}.csv`, throw NotFoundException if empty
    - Create `gps/controllers/gps.controller.ts` with GET `/gps/events` and GET `/gps/events/download` (OWNER only)
    - Create `gps/gps.module.ts`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ]* 5.2 Write property tests for GPS module (Properties 3, 4, 9, 10, 11, 12)
    - **Property 3: VIN validation is exactly 17 alphanumeric characters**
    - **Property 4: Date range validation rejects invalid ranges**
    - **Property 9: GPS events correctly filtered by VIN and date range**
    - **Property 10: GPS pagination never exceeds 100 per page**
    - **Property 11: CSV round-trip preserves GPS data**
    - **Property 12: CSV filename follows naming convention**
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.5, 7.1, 7.2, 7.3, 12.2, 12.3**

- [x] 6. Implement Status module (MongoDB)
  - [x] 6.1 Create StatusEvent schema and Status query handlers
    - Create `status/schemas/status-event.schema.ts` defining Mongoose schema for `status_events` collection
    - Create `status/dtos/get-status-events-request.dto.ts` with VIN, startDate, endDate, page, limit (max 50)
    - Create `status/dtos/get-status-events-response.dto.ts`
    - Create `status/dtos/get-vehicles-with-faults-response.dto.ts`
    - Create `status/mappers/status-event.mapper.ts`
    - Create `status/queries/get-status-events.query.ts`
    - Create `status/queries/handlers/get-status-events.handler.ts`: validate branch scoping for BRANCH_USER, query MongoDB by VIN + date range with pagination, validate start <= end
    - Create `status/queries/get-latest-status.query.ts`
    - Create `status/queries/handlers/get-latest-status.handler.ts`: get most recent status_event for a VIN, validate branch access
    - Create `status/queries/get-vehicles-with-faults.query.ts`
    - Create `status/queries/handlers/get-vehicles-with-faults.handler.ts`: query MongoDB for vehicles with non-empty codigo_problema in their latest event, scoped to BRANCH_USER's branch
    - Create `status/controllers/status.controller.ts` with GET `/status/events`, GET `/status/latest/:vin`, GET `/status/faults`
    - Create `status/status.module.ts`
    - _Requirements: 4.3, 5.1, 5.2, 8.1, 8.2, 8.3, 8.4, 8.5_

  - [ ]* 6.2 Write property tests for Status module (Properties 13 & 14)
    - **Property 13: Status events correctly filtered by VIN and date range**
    - **Property 14: Status pagination never exceeds 50 per page**
    - **Validates: Requirements 8.1, 8.2, 8.3, 8.4**

- [x] 7. Implement Dashboard module
  - [x] 7.1 Create Dashboard query handlers and controller
    - Create `dashboard/dtos/admin-dashboard-response.dto.ts` with totalVehicles, totalBranches, totalUsers, vehiclesWithFaults
    - Create `dashboard/dtos/branch-dashboard-response.dto.ts` with vehicles list and faults summary
    - Create `dashboard/queries/get-admin-dashboard.query.ts`
    - Create `dashboard/queries/handlers/get-admin-dashboard.handler.ts`: count vehicles, active branches, users from PostgreSQL; count vehicles with faults from MongoDB
    - Create `dashboard/queries/get-branch-dashboard.query.ts`
    - Create `dashboard/queries/handlers/get-branch-dashboard.handler.ts`: list vehicles for branch, get faults from MongoDB for branch vehicles
    - Create `dashboard/controllers/dashboard.controller.ts` with GET `/dashboard/admin` (ADMIN) and GET `/dashboard/branch` (BRANCH_USER)
    - Create `dashboard/dashboard.module.ts`
    - _Requirements: 3.1, 3.2, 3.3, 4.1, 4.2_

  - [ ]* 7.2 Write property test for admin dashboard counts (Property 8)
    - **Property 8: Admin dashboard counts match database state**
    - **Validates: Requirements 3.1, 3.2**

- [x] 8. Implement Users module and Seed module
  - [x] 8.1 Create UsersModule with list endpoint
    - Create `users/dtos/get-user-response.dto.ts`
    - Create `users/mappers/user.mapper.ts`
    - Create `users/queries/get-users.query.ts`
    - Create `users/queries/handlers/get-users.handler.ts` returning all users (ADMIN only)
    - Create `users/controllers/users.controller.ts` with GET `/users`
    - Update `users/users.module.ts` to register controller and handlers
    - _Requirements: 3.1_

  - [x] 8.2 Create Seed module with demo data
    - Create `seed/seed.module.ts` as standalone NestJS application module
    - Create `seed/data/branches.seed.ts` with 3 branches (Guatemala City, Quetzaltenango, Escuintla)
    - Create `seed/data/users.seed.ts` with 6 users (1 ADMIN, 3 BRANCH_USER, 2 OWNER) using bcrypt hashed passwords
    - Create `seed/data/vehicles.seed.ts` with 10 vehicles distributed across 3 branches
    - Create `seed/data/vehicle-owners.seed.ts` with 4 associations (2 per OWNER)
    - Create `seed/seed.service.ts` that truncates and inserts seed data in correct order
    - Add `npm run seed` script to `package.json` invoking the standalone app
    - _Requirements: N/A (demo data for defense)_

- [~] 9. Checkpoint - Ensure full backend compiles, seed runs, and all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Implement SQL migrations
  - [x] 10.1 Create SQL migration files
    - Create `database/2026-06-15.create-branches-table.sql`
    - Create `database/2026-06-15.create-users-table.sql` (references branches)
    - Create `database/2026-06-15.create-vehicles-table.sql` (references branches)
    - Create `database/2026-06-15.create-vehicle-owners-table.sql` (references users, vehicles)
    - Ensure column names, types, and constraints match TypeORM entities exactly
    - _Requirements: N/A (database setup)_

- [x] 11. Wire all backend modules in AppModule
  - [] 11.1 Register all modules in app.module.ts
    - Import and register AuthModule, UsersModule, BranchesModule, VehiclesModule, GpsModule, StatusModule, DashboardModule, SeedModule
    - Configure CqrsModule
    - Ensure TypeOrmModule entities are registered
    - Ensure MongooseModule schemas are registered
    - Verify Swagger groups endpoints by module using `@ApiTags()`
    - _Requirements: 10.2, 10.3_

- [x] 12. Implement frontend authentication and routing
  - [x] 12.1 Set up frontend project structure and auth context
    - Create `client/src/context/AuthContext.tsx` with login, logout, token storage, user state
    - Create `client/src/utils/auth-storage.util.ts` for localStorage token management
    - Create `client/src/interfaces/Auth.ts` with LoginRequest, LoginResponse, AuthUser types
    - Create `client/src/interfaces/User.ts`, `Vehicle.ts`, `GpsEvent.ts`, `StatusEvent.ts`, `Branch.ts`, `Dashboard.ts`
    - Create `client/src/constants/urls.ts` with all API endpoint URLs (prefixed with `/acme-ev`)
    - Update `client/src/themes/dark.theme.ts` if needed for EV dashboard branding
    - _Requirements: 1.1, 11.2_

  - [x] 12.2 Implement login page and protected routing
    - Create `client/src/components/auth/LoginForm.tsx` with email validation and password non-empty check before submit
    - Create `client/src/components/auth/ProtectedRoute.tsx` redirecting to login on 401 or missing token
    - Create `client/src/pages/LoginPage.tsx` composing LoginForm with MUI layout
    - Update `client/src/routes/Routes.tsx` with role-based route configuration: admin routes, branch routes, owner routes, login route
    - Create `client/src/App.tsx` wrapping with AuthProvider, ThemeProvider, RouterProvider
    - _Requirements: 1.1, 11.3, 12.4_

  - [ ]* 12.3 Write property test for frontend email validation (Property 16)
    - **Property 16: Frontend email validation**
    - **Validates: Requirements 12.4**

- [x] 13. Implement frontend dashboard pages
  - [x] 13.1 Implement Admin Dashboard page
    - Create `client/src/pages/AdminDashboardPage.tsx` fetching GET `/acme-ev/dashboard/admin`
    - Create `client/src/components/dashboard/MetricCard.tsx` for displaying individual metrics
    - Create `client/src/components/dashboard/FaultVehicleTable.tsx` showing vehicles with active faults
    - Display: totalVehicles, totalBranches, totalUsers, vehiclesWithFaults
    - Use MUI Grid for responsive layout, LoadingSpinner while fetching, ErrorAlert on failure
    - _Requirements: 3.1, 3.2, 3.3, 11.1, 11.2, 11.3_

  - [x] 13.2 Implement Branch Dashboard page
    - Create `client/src/pages/BranchDashboardPage.tsx` fetching GET `/acme-ev/dashboard/branch`
    - Create `client/src/components/dashboard/VehicleList.tsx` showing branch vehicles with click to see latest status
    - Show latest status (battery, engine, fault codes) for selected vehicle via GET `/acme-ev/status/latest/:vin`
    - Show vehicles with faults table via GET `/acme-ev/status/faults`
    - _Requirements: 4.1, 4.2, 4.3, 5.1, 5.2, 5.3, 11.1_

  - [x] 13.3 Implement Owner Dashboard page
    - Create `client/src/pages/OwnerDashboardPage.tsx` fetching GET `/acme-ev/vehicles/owner`
    - Show list of owned vehicles with options to query GPS events and download CSV
    - Clicking a vehicle navigates to GPS events page with VIN pre-filled
    - _Requirements: 9.1, 9.2, 11.1_

- [x] 14. Implement frontend data pages
  - [x] 14.1 Implement GPS Events page
    - Create `client/src/pages/GpsEventsPage.tsx`
    - Create `client/src/components/gps/GpsFilters.tsx` with VIN, startDate, endDate inputs and date pickers
    - Create `client/src/components/gps/GpsEventTable.tsx` using MUI DataGrid with pagination (server-side)
    - Create `client/src/components/gps/CsvDownloadButton.tsx` triggering GET `/acme-ev/gps/events/download` and downloading the file
    - Fetch data from GET `/acme-ev/gps/events` with query params
    - Show pagination controls reflecting meta.total, meta.page, meta.totalPages
    - _Requirements: 6.1, 6.2, 6.5, 7.1, 7.2, 9.2, 11.3_

  - [x] 14.2 Implement Status Events page
    - Create `client/src/pages/StatusEventsPage.tsx`
    - Create `client/src/components/status/StatusFilters.tsx` with VIN, startDate, endDate inputs
    - Create `client/src/components/status/StatusEventTable.tsx` using MUI DataGrid with pagination (server-side, max 50/page)
    - Fetch data from GET `/acme-ev/status/events` with query params
    - Display battery level, engine status, fault codes, odometer columns
    - _Requirements: 8.1, 8.2, 8.4, 11.3_

- [x] 15. Implement shared frontend components
  - [x] 15.1 Create common UI components
    - Create `client/src/components/common/LoadingSpinner.tsx` using MUI CircularProgress
    - Create `client/src/components/common/ErrorAlert.tsx` using MUI Alert
    - Create `client/src/components/common/PaginationControls.tsx` using MUI Pagination
    - Create `client/src/components/header/Header.tsx` with navigation links based on user role, logout button
    - Create `client/src/pages/NotFoundPage.tsx` for 404
    - Update `client/src/hooks/use-auth.hook.ts` for consuming AuthContext
    - Ensure `client/src/hooks/use-request.hook.ts` handles 401 → auto logout + redirect to login
    - _Requirements: 11.1, 11.2, 11.3_

  - [ ]* 15.2 Write unit tests for frontend components
    - Test ProtectedRoute redirects unauthenticated users
    - Test LoginForm validates email format and non-empty password
    - Test useRequest hook handles 401 with logout
    - _Requirements: 1.4, 12.4_

- [~] 16. Final checkpoint - Ensure full stack compiles and all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document using fast-check
- Unit tests validate specific examples and edge cases
- The backend uses the existing CQRS pattern (queries only, no commands) consistent with the boilerplate
- Global API prefix is `/acme-ev` (overriding the boilerplate's `/externalapi`)
- SQL migrations are separate files for documentation; TypeORM `synchronize: true` can be used in development
- The frontend uses `useRequest` hook pattern already established in the boilerplate

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3"] },
    { "id": 2, "tasks": ["2.1"] },
    { "id": 3, "tasks": ["2.2", "4.1"] },
    { "id": 4, "tasks": ["2.3", "2.4", "4.2"] },
    { "id": 5, "tasks": ["4.3", "5.1", "6.1", "7.1", "8.1"] },
    { "id": 6, "tasks": ["5.2", "6.2", "7.2", "8.2", "10.1"] },
    { "id": 7, "tasks": ["11.1"] },
    { "id": 8, "tasks": ["12.1", "15.1"] },
    { "id": 9, "tasks": ["12.2", "12.3", "13.1", "13.2", "13.3"] },
    { "id": 10, "tasks": ["14.1", "14.2", "15.2"] }
  ]
}
```
