import type {Metadata} from 'next';
export const metadata:Metadata={title:'Camper Dynamics — Built around your kind of wild',description:'Explore your Hilux camper, design a personal interior, compare builds, book a consultation and take the woodland trail.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><head><link rel="stylesheet" href="/portal/platform.css"/></head><body>{children}</body></html>}
