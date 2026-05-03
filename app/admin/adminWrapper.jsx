"use client"

import { useUser, SignIn } from "@clerk/nextjs";
import AdminLayout from "@/components/admin/AdminLayout";

export default function AdminWrapper({ children }) {
    const { isSignedIn, isLoaded } = useUser();

    if (!isLoaded) return null;

    if (!isSignedIn) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <SignIn fallbackRedirectUrl="/admin" routing="hash"/>
            </div>
        );
    }

    return <AdminLayout>{children}</AdminLayout>;
}