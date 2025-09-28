import type React from "react";
import { Link } from "wouter";

export const MainPage: React.FC = () => {
    return (
        <div className="">
            <h1>Main page</h1>
            <Link href="/account/1">Go to account 1</Link>
        </div>
    )
}