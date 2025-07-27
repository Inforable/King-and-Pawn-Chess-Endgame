import React from 'react';
import '../styles/global.css';

export const metadata = {
    title: 'AI Magnus vs Gukesh',
    description: 'Chess Endgame Solver',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <main>
                    {children}
                </main>
            </body>
        </html>
    );
}