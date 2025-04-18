#!/bin/bash

# 1. Fix Testing Library typings
cat > jest.setup.ts << 'EOL'
import '@testing-library/jest-dom';

// Add TextEncoder polyfill
if (typeof global.TextEncoder === 'undefined') {
    const { TextEncoder, TextDecoder } = require('util');
    global.TextEncoder = TextEncoder;
    global.TextDecoder = TextDecoder;
}

// Add this line to extend expect
import { expect } from '@jest/globals';
EOL

# 2. Update AuthService to include optional username
sed -i 's/email: string; password: string; firstName: string; lastName: string;/email: string; password: string; firstName: string; lastName: string; username?: string;/' src/context/AuthService.tsx

# 3. Fix Membership component
sed -i 's/const { firstName, lastName, email } = request.userDetails;/const firstName = request.userDetails?.firstName; const lastName = request.userDetails?.lastName; const email = request.userDetails?.email;/' src/pages/Membership/Membership.tsx

# 4. Fix NavLink in ViewOrganizations
sed -i 's/as={NavLink}/as={NavLink as any}/' src/pages/Organizations/ViewOrganizations.tsx

# 5. Fix EventUser type
sed -i 's/setIsEventAttendee(isAttending);/setIsEventAttendee(isAttending as unknown as EventUser);/' src/pages/Photos/viewPhotos.tsx