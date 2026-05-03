
// import AdminLayout from "@/components/admin/AdminLayout";
// import { useUser, SignIn } from "@clerk/nextjs";
import AdminWrapper from "./adminWrapper";

export const metadata = {
    title: "ShopNest - Admin",
    description: "ShopNest - Admin",
};
export default function RootAdminLayout({ children }) {
    return <AdminWrapper>{children}</AdminWrapper>;
}

// import { SignedIn, SignedOut, SignIn } from "@clerk/nextjs";


// export default function RootAdminLayout({ children }) {

//     return (
//         <>
//             <SignedIn>
//                 <AdminLayout>
//                     {children}
//                 </AdminLayout>
//             </SignedIn>
//             <SignedOut>
//                 <div className="min-h-screen flex items-center justify-center">
//                     <SignIn fallbackRedirectUrl="/admin" routing="hash"/>
//                 </div>
//             </SignedOut>
//         </>
//     );
// }

