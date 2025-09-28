import type React from "react";
import { Link, useRoute } from "wouter";

export const AccountPage: React.FC = () => {
    const [match, params] = useRoute('/account/:accountId')

    return (
        <div>
            <h1>Account { params?.accountId }</h1>
            <Link href="/">Go to main</Link>
        </div>
    )
}