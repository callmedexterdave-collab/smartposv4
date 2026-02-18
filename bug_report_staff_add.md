# Bug Report: Error adding staff

## Error Description
**Error Message:** `TypeError: Cannot read properties of undefined (reading 'some')`
**Location:** `client/src/pages/staff-management.tsx` inside `onSubmit` function.

## Root Cause Analysis
The error occurred because the `loadStaff` function was defined as an async function that did not return any value (implicitly returning `Promise<void>`). 
However, the `onSubmit` function expected `loadStaff` to return the updated list of staff members:
```typescript
const updatedStaff = await loadStaff();
// updatedStaff was undefined here
if (!updatedStaff.some(s => s.id === newStaff.id)) { ... } // Crash!
```

## Solution Implemented
1. **Modified `loadStaff` function:**
   - Updated the function to return the `staffWithStatus` array in the success path.
   - Updated the function to return an empty array `[]` in the error path.
   
2. **Enhanced `onSubmit` function:**
   - Added a safety check to ensure `updatedStaff` is a valid array before calling `.some()`.
   ```typescript
   if (updatedStaff && Array.isArray(updatedStaff) && !updatedStaff.some(s => s.id === newStaff.id)) { ... }
   ```

## Verification
- **Type Check:** Ran `npm run check` (TypeScript compiler) and it passed with no errors.
- **Logic Check:** The code now explicitly handles the return value and validates it before use, preventing the `TypeError`.

## Prevention
- Always ensure async functions return the expected data if their result is awaited and used.
- Add null/undefined checks when accessing properties or methods on variables that might be undefined, especially those coming from async operations.
