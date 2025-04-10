import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock AuthContext
import AuthContext from '../../src/context/AuthContext';

const mockAuthContext = {
    user: null,
    token: null,
    setUser: jest.fn(),
    setToken: jest.fn(),
    logout: jest.fn(),
};

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
    route?: string;
    authContext?: typeof mockAuthContext;
}

/**
 * Custom render function that wraps components with MemoryRouter and AuthContext
 *
 * Used to allow componets to route in the tests in the case a component uses
 * react-router-dom with some auth context (protected routes).
 *
 */
export function renderWithRouter(
    ui: ReactElement,
    { route = '/', authContext = mockAuthContext, ...renderOptions }: CustomRenderOptions = {}
) {
    return render(
        <MemoryRouter initialEntries={[route]}>
            <AuthContext.Provider value={authContext}>{ui}</AuthContext.Provider>
        </MemoryRouter>,
        renderOptions
    );
}
