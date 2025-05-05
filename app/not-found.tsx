"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ textAlign: "center", marginTop: "4rem" }}>
      <h1>404 - Page Not Found</h1>
      <p>Sorry, the page you are looking for does not exist.</p>
      <Link href="/">
        <button style={{ marginTop: "1rem", padding: "0.5rem 1rem" }}>Go Home</button>
      </Link>
    </div>
  );
} 