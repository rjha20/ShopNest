import StoreLayout from "@/components/store/StoreLayout";
import { auth } from "@clerk/nextjs/server";
import { SignIn } from "@clerk/nextjs";

export const metadata = {
    title: "ShopNest - Store Dashboard",
    description: "ShopNest - Store Dashboard",
};

export default async function RootAdminLayout({ children }) {
    const { userId } = await auth();

    if (!userId) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <SignIn fallbackRedirectUrl="/store" routing="hash"/>
            </div>
        );
    }

    return (
        <StoreLayout>
            {children}
        </StoreLayout>
    );
}
