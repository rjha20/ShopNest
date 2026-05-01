import AdminLayout from "@/components/admin/AdminLayout";

export const metadata = {
    title: "ShopNest - Admin",
    description: "ShopNest - Admin",
};

export default function RootAdminLayout({ children }) {

    return (
        <>
            <AdminLayout>
                {children}
            </AdminLayout>
        </>
    );
}
