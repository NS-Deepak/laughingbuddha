'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface SidebarContextValue {
    collapsed: boolean;
    toggle: () => void;
}

const SidebarContext = createContext<SidebarContextValue>({
    collapsed: false,
    toggle: () => {},
});

export function SidebarProvider({ children }: { children: ReactNode }) {
    const [collapsed, setCollapsed] = useState(false);
    return (
        <SidebarContext.Provider value={{ collapsed, toggle: () => setCollapsed(c => !c) }}>
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    return useContext(SidebarContext);
}
